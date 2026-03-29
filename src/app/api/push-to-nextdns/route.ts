import { type NextRequest, NextResponse } from 'next/server'
import { createNextDNSClient } from '@/lib/nextdns/client'
import { addDomainToDenylist } from '@/lib/nextdns/api'
import { FatalApiError } from '@/lib/nextdns/types'
import type { PushBatchRequest, PushBatchResponse, DomainResult } from '@/types/api'

/**
 * Single-batch endpoint.
 * Processes one batch of domains (typically ≤10) and returns a plain JSON response.
 * The batch loop lives on the client — this route never makes more than batchSize
 * outbound requests per invocation, staying well under Cloudflare's 50 subrequest limit.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: PushBatchRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const { apiKey, profileId, domains } = body

  if (!apiKey?.trim()) {
    return NextResponse.json({ error: 'apiKey is required.' }, { status: 400 })
  }
  if (!profileId?.trim()) {
    return NextResponse.json({ error: 'profileId is required.' }, { status: 400 })
  }
  if (!Array.isArray(domains) || domains.length === 0) {
    return NextResponse.json({ error: 'domains array cannot be empty.' }, { status: 400 })
  }

  const client = createNextDNSClient(apiKey.trim())
  const results: DomainResult[] = []

  for (const domain of domains) {
    try {
      const result = await addDomainToDenylist(client, profileId.trim(), domain)
      results.push({
        domain: result.domain,
        status: result.status,
        error: result.message,
        statusCode: result.statusCode,
      })
    } catch (err) {
      if (err instanceof FatalApiError) {
        const response: PushBatchResponse = {
          results,
          fatalError: { message: err.message, code: err.code },
        }
        return NextResponse.json(response)
      }
      results.push({
        domain,
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  const response: PushBatchResponse = { results }
  return NextResponse.json(response)
}
