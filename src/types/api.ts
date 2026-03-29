// API istek ve yanıt tip tanımları

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

export interface PushToNextDNSRequest {
  apiKey: string
  profileId: string
  domains: string[]
  batchSize?: number
  delayMs?: number
}

export interface NextDNSDenylistEntry {
  id: string
  active: boolean
}

// SSE (Server-Sent Events) ilerleme event tipleri
export type ProgressEvent =
  | {
      type: 'start'
      totalDomains: number
      batchCount: number
      timestamp: string
    }
  | {
      type: 'batch_start'
      batchIndex: number
      domains: string[]
      timestamp: string
    }
  | {
      type: 'domain_success'
      domain: string
      batchIndex: number
      processedCount: number
      totalCount: number
      timestamp: string
    }
  | {
      type: 'domain_error'
      domain: string
      batchIndex: number
      error: string
      statusCode?: number
      timestamp: string
    }
  | {
      type: 'domain_skipped'
      domain: string
      batchIndex: number
      processedCount: number
      totalCount: number
      timestamp: string
    }
  | {
      type: 'batch_complete'
      batchIndex: number
      successCount: number
      errorCount: number
      skippedCount: number
      timestamp: string
    }
  | {
      type: 'rate_limit_delay'
      delayMs: number
      timestamp: string
    }
  | {
      type: 'complete'
      totalSuccess: number
      totalError: number
      totalSkipped: number
      durationMs: number
      timestamp: string
    }
  | {
      type: 'fatal_error'
      error: string
      code: string
      timestamp: string
    }
