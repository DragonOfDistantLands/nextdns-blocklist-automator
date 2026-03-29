'use client'

import { useState, useCallback, useRef } from 'react'
import { parseBlocklist } from '@/lib/parsers'
import type { FormData, ProcessingStats } from '@/types/blocklist'
import type { ProgressEvent } from '@/types/api'
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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const EMPTY_STATS: ProcessingStats = {
  total: 0, success: 0, error: 0, skipped: 0, progressPercent: 0,
}

export function useBlocklistProcessor(): UseBlocklistProcessorReturn {
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

    try {
      // ─── Aşama 1: URL'den içerik çek ───────────────────────────────
      setStatus('fetching')
      addLog('info', `Blocklist URL'si alınıyor...`)
      addLog('info', formData.blocklistUrl)

      const fetchRes = await fetch(
        `/api/fetch-blocklist?url=${encodeURIComponent(formData.blocklistUrl)}`,
        { signal },
      )
      const fetchData = await fetchRes.json()

      if (!fetchData.success) {
        addLog('error', `URL alınamadı: ${fetchData.error}`)
        setStatus('idle')
        return
      }

      addLog('success', `İçerik alındı — ${fetchData.lineCount.toLocaleString('tr')} satır, ${formatBytes(fetchData.byteSize)}`)

      // ─── Aşama 2: İçeriği ayrıştır ────────────────────────────────
      setStatus('parsing')
      addLog('info', `"${formData.format}" formatında ayrıştırılıyor...`)

      const domains = parseBlocklist(fetchData.content as string, formData.format)

      if (domains.length === 0) {
        addLog('warning', 'Geçerli domain bulunamadı. Format seçimini kontrol edin.')
        setStatus('idle')
        return
      }

      addLog('success', `${domains.length.toLocaleString('tr')} benzersiz domain bulundu`)
      setStats((s) => ({ ...s, total: domains.length }))

      // ─── Aşama 3: NextDNS Denylist'e gönder (SSE) ─────────────────
      setStatus('pushing')
      addLog('start', `${domains.length.toLocaleString('tr')} domain NextDNS Denylist'e ekleniyor...`)
      addLog('info', `Profil: ${formData.profileId} · Batch boyutu: 10 · Gecikme: 1s`)

      const pushRes = await fetch('/api/push-to-nextdns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: formData.apiKey,
          profileId: formData.profileId,
          domains,
          batchSize: 10,
          delayMs: 1000,
        }),
        signal,
      })

      if (!pushRes.ok || !pushRes.body) {
        const err = await pushRes.json().catch(() => ({ error: 'Yanıt alınamadı' }))
        addLog('error', `API hatası: ${(err as { error: string }).error}`)
        setStatus('idle')
        return
      }

      // ─── SSE Stream okuma ─────────────────────────────────────────
      const reader = pushRes.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      // Mutable sayaçlar (setState'i her domain için çağırmamak için)
      let curSuccess = 0
      let curError = 0
      let curSkipped = 0
      const total = domains.length

      const handleEvent = (event: ProgressEvent) => {
        switch (event.type) {
          case 'domain_success':
            curSuccess++
            setStats({
              total,
              success: curSuccess,
              error: curError,
              skipped: curSkipped,
              progressPercent: Math.round((event.processedCount / total) * 100),
            })
            break

          case 'domain_skipped':
            curSkipped++
            setStats({
              total,
              success: curSuccess,
              error: curError,
              skipped: curSkipped,
              progressPercent: Math.round((event.processedCount / total) * 100),
            })
            break

          case 'domain_error':
            curError++
            setStats({
              total,
              success: curSuccess,
              error: curError,
              skipped: curSkipped,
              progressPercent: Math.round(((curSuccess + curError + curSkipped) / total) * 100),
            })
            addLog('error', `✗ ${event.domain}`, event.error)
            break

          case 'batch_complete':
            addLog(
              'info',
              `Batch ${event.batchIndex + 1} — ` +
              `+${event.successCount} eklendi` +
              (event.skippedCount ? `, ${event.skippedCount} mevcut` : '') +
              (event.errorCount ? `, ${event.errorCount} hata` : ''),
            )
            break

          case 'rate_limit_delay':
            addLog('delay', `Sonraki batch için ${(event.delayMs / 1000).toFixed(1)}s bekleniyor...`)
            break

          case 'fatal_error':
            addLog('error', `Kritik hata: ${event.error}`)
            setStatus('idle')
            break

          case 'complete':
            addLog(
              'complete',
              `Tamamlandı! ` +
              `${event.totalSuccess.toLocaleString('tr')} eklendi · ` +
              `${event.totalSkipped.toLocaleString('tr')} zaten mevcuttu · ` +
              `${event.totalError.toLocaleString('tr')} hata · ` +
              `${(event.durationMs / 1000).toFixed(1)}s`,
            )
            setStats({
              total,
              success: event.totalSuccess,
              error: event.totalError,
              skipped: event.totalSkipped,
              progressPercent: 100,
            })
            setStatus('done')
            break
        }
      }

      while (true) {
        if (signal.aborted) break
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6)) as ProgressEvent
            handleEvent(event)
          } catch {
            // Bozuk satırı atla
          }
        }
      }

    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        addLog('warning', 'İşlem kullanıcı tarafından iptal edildi.')
        setStatus('aborted')
      } else {
        addLog('error', `Beklenmeyen hata: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`)
        setStatus('idle')
      }
    }
  }, [addLog, clearLogs])

  return { status, stats, logs, process, abort, reset }
}
