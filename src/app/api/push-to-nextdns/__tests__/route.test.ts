import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/nextdns/api', () => ({
  addDomainToDenylist: vi.fn(),
}))
vi.mock('@/lib/nextdns/client', () => ({
  createNextDNSClient: vi.fn(() => ({})),
}))

import { addDomainToDenylist } from '@/lib/nextdns/api'
import { FatalApiError } from '@/lib/nextdns/types'
import { POST } from '../route'

function makeRequest(body: object): NextRequest {
  return new NextRequest('http://localhost/api/push-to-nextdns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/push-to-nextdns — validation', () => {
  it('returns 400 for invalid JSON', async () => {
    const req = new NextRequest('http://localhost/api/push-to-nextdns', {
      method: 'POST',
      body: 'not json',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when apiKey is missing', async () => {
    const res = await POST(makeRequest({ profileId: 'abc', domains: ['x.com'] }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when profileId is missing', async () => {
    const res = await POST(makeRequest({ apiKey: 'key', domains: ['x.com'] }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when domains is an empty array', async () => {
    const res = await POST(makeRequest({ apiKey: 'key', profileId: 'abc', domains: [] }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when domains is not an array', async () => {
    const res = await POST(makeRequest({ apiKey: 'key', profileId: 'abc', domains: 'x.com' }))
    expect(res.status).toBe(400)
  })
})

describe('POST /api/push-to-nextdns — JSON response', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns Content-Type: application/json', async () => {
    vi.mocked(addDomainToDenylist).mockResolvedValue({ domain: 'ads.example.com', status: 'added' })
    const res = await POST(makeRequest({ apiKey: 'k', profileId: 'p', domains: ['ads.example.com'] }))
    expect(res.headers.get('Content-Type')).toContain('application/json')
  })

  it('returns results array with added status for successful domain', async () => {
    vi.mocked(addDomainToDenylist).mockResolvedValue({ domain: 'ads.example.com', status: 'added' })
    const res = await POST(makeRequest({ apiKey: 'k', profileId: 'p', domains: ['ads.example.com'] }))
    const data = await res.json()
    expect(data.results).toHaveLength(1)
    expect(data.results[0].domain).toBe('ads.example.com')
    expect(data.results[0].status).toBe('added')
  })

  it('returns skipped status for already-existing domain', async () => {
    vi.mocked(addDomainToDenylist).mockResolvedValue({ domain: 'ads.example.com', status: 'skipped' })
    const res = await POST(makeRequest({ apiKey: 'k', profileId: 'p', domains: ['ads.example.com'] }))
    const data = await res.json()
    expect(data.results[0].status).toBe('skipped')
  })

  it('returns error status for failed domain', async () => {
    vi.mocked(addDomainToDenylist).mockResolvedValue({
      domain: 'bad.example.com',
      status: 'error',
      message: 'Server error',
      statusCode: 500,
    })
    const res = await POST(makeRequest({ apiKey: 'k', profileId: 'p', domains: ['bad.example.com'] }))
    const data = await res.json()
    expect(data.results[0].status).toBe('error')
    expect(data.results[0].statusCode).toBe(500)
  })

  it('returns fatalError field on FatalApiError and stops processing', async () => {
    vi.mocked(addDomainToDenylist)
      .mockRejectedValueOnce(new FatalApiError('Invalid API key', 'INVALID_API_KEY'))

    const res = await POST(makeRequest({ apiKey: 'bad', profileId: 'p', domains: ['ads.example.com', 'b.com'] }))
    const data = await res.json()
    expect(data.fatalError).toBeDefined()
    expect(data.fatalError.code).toBe('INVALID_API_KEY')
    // Only the domains processed before fatal error are in results (0 here)
    expect(data.results).toHaveLength(0)
  })

  it('returns correct results for mixed add/skip/error batch', async () => {
    vi.mocked(addDomainToDenylist)
      .mockResolvedValueOnce({ domain: 'a.com', status: 'added' })
      .mockResolvedValueOnce({ domain: 'b.com', status: 'skipped' })
      .mockResolvedValueOnce({ domain: 'c.com', status: 'error', message: 'err' })

    const res = await POST(makeRequest({ apiKey: 'k', profileId: 'p', domains: ['a.com', 'b.com', 'c.com'] }))
    const data = await res.json()
    expect(data.results).toHaveLength(3)
    expect(data.results.filter((r: { status: string }) => r.status === 'added')).toHaveLength(1)
    expect(data.results.filter((r: { status: string }) => r.status === 'skipped')).toHaveLength(1)
    expect(data.results.filter((r: { status: string }) => r.status === 'error')).toHaveLength(1)
    expect(data.fatalError).toBeUndefined()
  })

  it('catches non-fatal errors per domain and continues', async () => {
    vi.mocked(addDomainToDenylist)
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValueOnce({ domain: 'b.com', status: 'added' })

    const res = await POST(makeRequest({ apiKey: 'k', profileId: 'p', domains: ['a.com', 'b.com'] }))
    const data = await res.json()
    expect(data.results).toHaveLength(2)
    expect(data.results[0].status).toBe('error')
    expect(data.results[1].status).toBe('added')
    expect(data.fatalError).toBeUndefined()
  })
})
