import { type NextRequest } from 'next/server'
import { createNextDNSClient } from '@/lib/nextdns/client'
import { addDomainToDenylist } from '@/lib/nextdns/api'
import { FatalApiError, RateLimitError } from '@/lib/nextdns/types'
import { chunk, delay, DEFAULT_RATE_LIMITER_CONFIG } from '@/lib/rate-limiter'
import type { ProgressEvent } from '@/types/api'

// İstek body tipi
interface PushRequestBody {
  apiKey: string
  profileId: string
  domains: string[]
  batchSize?: number
  delayMs?: number
}

/** TextEncoder — Node.js ortamında global mevcut. */
const encoder = new TextEncoder()

/** SSE formatında tek bir event'i encode eder. */
function sseEvent(data: ProgressEvent): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
}

export async function POST(request: NextRequest): Promise<Response> {
  // --- Body ayrıştırma ---
  let body: PushRequestBody
  try {
    body = await request.json()
  } catch {
    return new Response(
      JSON.stringify({ error: 'Geçersiz JSON body.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const { apiKey, profileId, domains, batchSize, delayMs } = body

  // --- Zorunlu alan doğrulaması ---
  if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
    return new Response(
      JSON.stringify({ error: 'apiKey zorunludur.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }
  if (!profileId || typeof profileId !== 'string' || !profileId.trim()) {
    return new Response(
      JSON.stringify({ error: 'profileId zorunludur.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }
  if (!Array.isArray(domains) || domains.length === 0) {
    return new Response(
      JSON.stringify({ error: 'domains dizisi boş olamaz.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const resolvedBatchSize = Math.min(
    Math.max(batchSize ?? DEFAULT_RATE_LIMITER_CONFIG.batchSize, 1),
    50,
  )
  const resolvedDelayMs = Math.min(
    Math.max(delayMs ?? DEFAULT_RATE_LIMITER_CONFIG.delayMs, 100),
    10_000,
  )

  const batches = chunk(domains, resolvedBatchSize)
  const client = createNextDNSClient(apiKey.trim())
  const startTime = Date.now()

  // --- SSE Streaming ---
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: ProgressEvent) => {
        try {
          controller.enqueue(sseEvent(event))
        } catch {
          // Bağlantı kapalıysa enqueue atar; sessizce geç
        }
      }

      const now = () => new Date().toISOString()

      send({
        type: 'start',
        totalDomains: domains.length,
        batchCount: batches.length,
        timestamp: now(),
      })

      let totalSuccess = 0
      let totalError = 0
      let totalSkipped = 0
      let processedCount = 0
      let aborted = false

      try {
        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
          // İstemci bağlantıyı kestiyse dur
          if (request.signal?.aborted) {
            aborted = true
            break
          }

          const batch = batches[batchIndex]
          send({ type: 'batch_start', batchIndex, domains: batch, timestamp: now() })

          let batchSuccess = 0
          let batchError = 0
          let batchSkipped = 0

          for (const domain of batch) {
            if (request.signal?.aborted) { aborted = true; break }

            processedCount++
            try {
              const result = await addDomainToDenylist(
                client,
                profileId.trim(),
                domain,
                DEFAULT_RATE_LIMITER_CONFIG.maxRetries,
                DEFAULT_RATE_LIMITER_CONFIG.retryBaseDelayMs,
              )

              if (result.status === 'added') {
                batchSuccess++; totalSuccess++
                send({
                  type: 'domain_success',
                  domain,
                  batchIndex,
                  processedCount,
                  totalCount: domains.length,
                  timestamp: now(),
                })
              } else if (result.status === 'skipped') {
                batchSkipped++; totalSkipped++
                send({
                  type: 'domain_skipped',
                  domain,
                  batchIndex,
                  processedCount,
                  totalCount: domains.length,
                  timestamp: now(),
                })
              } else {
                batchError++; totalError++
                send({
                  type: 'domain_error',
                  domain,
                  batchIndex,
                  error: result.message ?? 'Bilinmeyen hata',
                  statusCode: result.statusCode,
                  timestamp: now(),
                })
              }
            } catch (err) {
              // FatalApiError: tüm operasyonu durdur
              if (err instanceof FatalApiError) {
                send({
                  type: 'fatal_error',
                  error: err.message,
                  code: err.code,
                  timestamp: now(),
                })
                controller.close()
                return
              }

              // RateLimitError: caller zaten retry uyguladı, domain'i error say
              if (err instanceof RateLimitError) {
                batchError++; totalError++
                send({
                  type: 'domain_error',
                  domain,
                  batchIndex,
                  error: err.message,
                  timestamp: now(),
                })
              } else {
                batchError++; totalError++
                send({
                  type: 'domain_error',
                  domain,
                  batchIndex,
                  error: err instanceof Error ? err.message : 'Bilinmeyen hata',
                  timestamp: now(),
                })
              }
            }
          }

          send({
            type: 'batch_complete',
            batchIndex,
            successCount: batchSuccess,
            errorCount: batchError,
            skippedCount: batchSkipped,
            timestamp: now(),
          })

          // Son batch değilse ve iptal edilmediyse bekle
          if (!aborted && batchIndex < batches.length - 1) {
            send({ type: 'rate_limit_delay', delayMs: resolvedDelayMs, timestamp: now() })
            await delay(resolvedDelayMs)
          }
        }
      } catch (unexpectedErr) {
        send({
          type: 'fatal_error',
          error: unexpectedErr instanceof Error ? unexpectedErr.message : 'Kritik hata',
          code: 'UNKNOWN',
          timestamp: now(),
        })
      }

      send({
        type: 'complete',
        totalSuccess,
        totalError,
        totalSkipped,
        durationMs: Date.now() - startTime,
        timestamp: now(),
      })

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Nginx proxy tamponlamasını devre dışı bırak
    },
  })
}
