/** NextDNS Denylist'e eklenecek alan adı kaydı. */
export interface NextDNSDenylistEntry {
  id: string
  active: boolean
}

/** Tek bir domain ekleme işleminin sonucu. */
export interface AddDomainResult {
  domain: string
  status: 'added' | 'skipped' | 'error'
  /** Hata veya atlama mesajı */
  message?: string
  /** HTTP durum kodu */
  statusCode?: number
}

/** NextDNS API'ının 429 dönüşünde fırlatılan özel hata. */
export class RateLimitError extends Error {
  constructor(
    message: string,
    /** Beklenecek süre (ms) — Retry-After header'ından veya backoff'tan türetilir */
    public retryAfterMs: number,
  ) {
    super(message)
    this.name = 'RateLimitError'
  }
}

/** 401 veya 404 gibi tüm operasyonu durduran hatalar için. */
export class FatalApiError extends Error {
  constructor(
    message: string,
    public code: 'INVALID_API_KEY' | 'PROFILE_NOT_FOUND' | 'UNKNOWN',
  ) {
    super(message)
    this.name = 'FatalApiError'
  }
}
