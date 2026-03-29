/**
 * Rate Limiting Yardımcıları
 * Batch + sabit gecikme modeliyle NextDNS API kotasını yönetir.
 */

/** Diziyi `size` boyutunda alt dizilere böler. */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

/** Promise tabanlı gecikme. */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Exponential backoff süresi hesaplar.
 * retryCount=0 → baseDelayMs, retryCount=1 → 2×base, vb.
 */
export function calculateBackoff(retryCount: number, baseDelayMs: number): number {
  return baseDelayMs * Math.pow(2, retryCount)
}

/** Kullanıcı tarafından ayarlanabilir rate-limit parametreleri. */
export interface RateLimiterConfig {
  /** Her grupta işlenecek domain sayısı (varsayılan: 10) */
  batchSize: number
  /** Gruplar arası bekleme süresi ms (varsayılan: 1000) */
  delayMs: number
  /** HTTP 429 için maks. yeniden deneme (varsayılan: 3) */
  maxRetries: number
  /** İlk retry bekleme süresi ms (varsayılan: 5000) */
  retryBaseDelayMs: number
}

export const DEFAULT_RATE_LIMITER_CONFIG: RateLimiterConfig = {
  batchSize: 10,
  delayMs: 1000,
  maxRetries: 3,
  retryBaseDelayMs: 5000,
}
