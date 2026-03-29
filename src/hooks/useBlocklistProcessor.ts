'use client'

import { useState, useCallback, useRef } from 'react'
import { parseBlocklist } from '@/lib/parsers'
import { chunk, delay } from '@/lib/rate-limiter'
import { useTranslation } from '@/lib/i18n/context'
import type { FormData, ProcessingStats } from '@/types/blocklist'
import type { PushBatchResponse } from '@/types/api'
import { useTerminalLog } from './useTerminalLog'

export type ProcessingStatus = 'idle' | 'fetching' | 'parsing' | 'pushing' | 'done' | 'aborted'

export interface UseBlocklistProcessorReturn {
  status: ProcessingStatus
  stats: ProcessingStats
  logs: ReturnType<typeof useTerminalLog>['logs']
  process: (formData: FormData) => Promise<void>
  abort: () => void
  reset: () => void
}

const BATCH_SIZE = 10
const DELAY_MS = 1000

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Simple {{key}} → value interpolation. */
function t(template: string, params: Record<string, string | number> = {}): string {
  return Object.entries(params).reduce(
    (s, [k, v]) => s.replace(`{{${k}}}`, String(v)),
    template,
  )
}

const EMPTY_STATS: ProcessingStats = {
  total: 0, success: 0, error: 0, skipped: 0, progressPercent: 0,
}

export function useBlocklistProcessor(): UseBlocklistProcessorReturn {
  const { dict } = useTranslation()
  const { logs, addLog, clearLogs } = useTerminalLog()
  const [status, setStatus] = useState<ProcessingStatus>('idle')
  const [stats, setStats] = useState<ProcessingStats>(EMPTY_STATS)
  const abortRef = useRef<AbortController | null>(null)

  const abort = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    clearLogs()
    setStatus('idle')
    setStats(EMPTY_STATS)
  }, [clearLogs])

  const process = useCallback(async (formData: FormData) => {
    clearLogs()
    setStats(EMPTY_STATS)
    abortRef.current = new AbortController()
    const signal = abortRef.current.signal
    const startTime = Date.now()
    const L = dict.logs

    try {
      // ── Phase 1: Fetch content ────────────────────────────────────
      setStatus('fetching')
      addLog('info', L.fetchingUrl)
      addLog('info', formData.blocklistUrl)

      const fetchRes = await fetch(
        `/api/fetch-blocklist?url=${encodeURIComponent(formData.blocklistUrl)}`,
        { signal },
      )
      const fetchData = await fetchRes.json()

      if (!fetchData.success) {
        addLog('error', t(L.fetchFailed, { error: fetchData.error }))
        setStatus('idle')
        return
      }

      addLog('success', t(L.contentFetched, {
        lines: fetchData.lineCount.toLocaleString(),
        size: formatBytes(fetchData.byteSize),
      }))

      // ── Phase 2: Parse ────────────────────────────────────────────
      setStatus('parsing')
      addLog('info', t(L.parsing, { format: formData.format }))

      const domains = parseBlocklist(fetchData.content as string, formData.format)

      if (domains.length === 0) {
        addLog('warning', L.noDomainsFound)
        setStatus('idle')
        return
      }

      addLog('success', t(L.domainsFound, { count: domains.length.toLocaleString() }))
      setStats((s) => ({ ...s, total: domains.length }))

      // ── Phase 3: Push to NextDNS — batch loop on client ───────────
      setStatus('pushing')
      addLog('start', t(L.pushingDomains, { count: domains.length.toLocaleString() }))
      addLog('info', t(L.pushInfo, {
        profileId: formData.profileId,
        batchSize: BATCH_SIZE,
        delay: (DELAY_MS / 1000).toFixed(1),
      }))

      const batches = chunk(domains, BATCH_SIZE)
      let curSuccess = 0
      let curError = 0
      let curSkipped = 0

      for (let i = 0; i < batches.length; i++) {
        if (signal.aborted) break

        const res = await fetch('/api/push-to-nextdns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey: formData.apiKey,
            profileId: formData.profileId,
            domains: batches[i],
          }),
          signal,
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: L.responseError }))
          addLog('error', t(L.apiError, { error: (err as { error: string }).error }))
          setStatus('idle')
          return
        }

        const data: PushBatchResponse = await res.json()

        if (data.fatalError) {
          addLog('error', t(L.fatalError, { error: data.fatalError.message }))
          setStatus('idle')
          return
        }

        let batchAdded = 0
        let batchSkipped = 0
        let batchErrors = 0

        for (const result of data.results) {
          if (result.status === 'added') {
            curSuccess++; batchAdded++
          } else if (result.status === 'skipped') {
            curSkipped++; batchSkipped++
          } else {
            curError++; batchErrors++
            addLog('error', `✗ ${result.domain}`, result.error)
          }
        }

        const processed = curSuccess + curError + curSkipped
        setStats({
          total: domains.length,
          success: curSuccess,
          error: curError,
          skipped: curSkipped,
          progressPercent: Math.round((processed / domains.length) * 100),
        })

        let batchMsg = t(L.batchComplete, { n: i + 1, added: batchAdded })
        if (batchSkipped > 0) batchMsg += t(L.alsoSkipped, { n: batchSkipped })
        if (batchErrors > 0) batchMsg += t(L.alsoErrors, { n: batchErrors })
        addLog('info', batchMsg)

        if (!signal.aborted && i < batches.length - 1) {
          addLog('delay', t(L.waitingNextBatch, { s: (DELAY_MS / 1000).toFixed(1) }))
          await delay(DELAY_MS)
        }
      }

      // ── Completion ────────────────────────────────────────────────
      if (signal.aborted) {
        addLog('warning', L.aborted)
        setStatus('aborted')
      } else {
        const durationMs = Date.now() - startTime
        addLog('complete', t(L.completed, {
          added: curSuccess.toLocaleString(),
          skipped: curSkipped.toLocaleString(),
          errors: curError.toLocaleString(),
          duration: (durationMs / 1000).toFixed(1),
        }))
        setStats({
          total: domains.length,
          success: curSuccess,
          error: curError,
          skipped: curSkipped,
          progressPercent: 100,
        })
        setStatus('done')
      }

    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        addLog('warning', L.aborted)
        setStatus('aborted')
      } else {
        addLog('error', t(L.unexpectedError, {
          error: err instanceof Error ? err.message : 'Unknown error',
        }))
        setStatus('idle')
      }
    }
  }, [dict, addLog, clearLogs])

  return { status, stats, logs, process, abort, reset }
}
