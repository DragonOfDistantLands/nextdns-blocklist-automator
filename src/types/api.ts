// API request/response types

export interface FetchBlocklistResponse {
  success: true
  content: string
  lineCount: number
  byteSize: number
  fetchedAt: string
}

export interface FetchBlocklistErrorResponse {
  success: false
  error: string
  code: 'INVALID_URL' | 'FETCH_FAILED' | 'CONTENT_TOO_LARGE' | 'TIMEOUT' | 'INVALID_CONTENT'
  details?: string
}

export type FetchBlocklistResult = FetchBlocklistResponse | FetchBlocklistErrorResponse

// ── Single-batch push types (client-side loop architecture) ──────────────────

export interface PushBatchRequest {
  apiKey: string
  profileId: string
  /** A single batch of domains (typically ≤10). The loop is on the client. */
  domains: string[]
}

export interface DomainResult {
  domain: string
  status: 'added' | 'skipped' | 'error'
  error?: string
  statusCode?: number
}

export interface PushBatchResponse {
  results: DomainResult[]
  /** Present when a fatal error (401/404) aborts the entire operation. */
  fatalError?: {
    message: string
    code: string
  }
}
