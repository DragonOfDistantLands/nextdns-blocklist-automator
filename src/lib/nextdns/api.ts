import axios, { type AxiosInstance } from 'axios'
import {
  type AddDomainResult,
  FatalApiError,
  RateLimitError,
} from './types'
import { calculateBackoff, delay } from '@/lib/rate-limiter'

/**
 * Tek bir domain'i NextDNS Denylist'e ekler.
 *
 * - 201 → 'added'
 * - 409 Conflict → 'skipped' (zaten mevcut)
 * - 429 Too Many Requests → RateLimitError fırlatır (caller retry uygular)
 * - 401 Unauthorized → FatalApiError (tüm operasyon durur)
 * - 404 Not Found → FatalApiError (profil bulunamadı)
 * - Diğer → AddDomainResult ile 'error'
 */
export async function addDomainToDenylist(
  client: AxiosInstance,
  profileId: string,
  domain: string,
  maxRetries = 3,
  retryBaseDelayMs = 5000,
): Promise<AddDomainResult> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await client.post(`/profiles/${profileId}/denylist`, {
        id: domain,
        active: true,
      })
      return { domain, status: 'added' }
    } catch (err) {
      if (!axios.isAxiosError(err)) {
        return { domain, status: 'error', message: 'Ağ bağlantısı hatası' }
      }

      const statusCode = err.response?.status

      // Zaten eklenmiş — skip olarak işaretle
      if (statusCode === 409) {
        return {
          domain,
          status: 'skipped',
          message: "Zaten Denylist'te mevcut",
          statusCode,
        }
      }

      // Geçersiz API anahtarı — tüm operasyonu durdur
      if (statusCode === 401) {
        throw new FatalApiError(
          'Geçersiz API anahtarı. Lütfen NextDNS hesabınızdan kontrol edin.',
          'INVALID_API_KEY',
        )
      }

      // Profil bulunamadı — tüm operasyonu durdur
      if (statusCode === 404) {
        throw new FatalApiError(
          `Profil ID "${profileId}" bulunamadı. Lütfen doğru ID'yi girdiğinizden emin olun.`,
          'PROFILE_NOT_FOUND',
        )
      }

      // Rate limit — Retry-After header'ına veya exponential backoff'a göre bekle
      if (statusCode === 429) {
        if (attempt < maxRetries) {
          const retryAfterHeader = err.response?.headers?.['retry-after']
          const waitMs = retryAfterHeader
            ? parseInt(retryAfterHeader, 10) * 1000
            : calculateBackoff(attempt, retryBaseDelayMs)
          await delay(waitMs)
          continue // retry
        }
        throw new RateLimitError(
          'Rate limit aşıldı. Maksimum yeniden deneme sayısına ulaşıldı.',
          calculateBackoff(attempt, retryBaseDelayMs),
        )
      }

      // Diğer HTTP hataları — domain 'error' olarak işaretlenir, operasyon devam eder
      const message =
        (err.response?.data as { errors?: Array<{ code: string }> })?.errors?.[0]?.code ??
        err.message ??
        'Bilinmeyen API hatası'

      return { domain, status: 'error', message, statusCode }
    }
  }

  // Döngü hiç çalışmadıysa (maxRetries < 0 gibi uç durum)
  return { domain, status: 'error', message: 'İşlem tamamlanamadı' }
}
