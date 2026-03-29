import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// NextDNS API'ını mock'luyoruz — gerçek ağ isteği atmıyoruz
vi.mock('@/lib/nextdns/api', () => ({
  addDomainToDenylist: vi.fn(),
}))
vi.mock('@/lib/nextdns/client', () => ({
  createNextDNSClient: vi.fn(() => ({})),
}))
vi.mock('@/lib/rate-limiter', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/rate-limiter')>()
  return {
    ...actual,
    delay: vi.fn().mockResolvedValue(undefined),
  }
})

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

/** SSE stream'inden tüm JSON event'lerini toplar. */
async function collectEvents(response: Response): Promise<object[]> {
  const text = await response.text()
  return text
    .split('\n')
    .filter((line) => line.startsWith('data: '))
    .map((line) => JSON.parse(line.slice(6)))
}

describe('POST /api/push-to-nextdns — doğrulama', () => {
  it('geçersiz JSON için 400 döndürür', async () => {
    const req = new NextRequest('http://localhost/api/push-to-nextdns', {
      method: 'POST',
      body: 'not json',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('apiKey eksikse 400 döndürür', async () => {
    const res = await POST(makeRequest({ profileId: 'abc', domains: ['x.com'] }))
    expect(res.status).toBe(400)
  })

  it('profileId eksikse 400 döndürür', async () => {
    const res = await POST(makeRequest({ apiKey: 'key', domains: ['x.com'] }))
    expect(res.status).toBe(400)
  })

  it('domains boş dizi ise 400 döndürür', async () => {
    const res = await POST(makeRequest({ apiKey: 'key', profileId: 'abc', domains: [] }))
    expect(res.status).toBe(400)
  })

  it('domains dizi değilse 400 döndürür', async () => {
    const res = await POST(makeRequest({ apiKey: 'key', profileId: 'abc', domains: 'x.com' }))
    expect(res.status).toBe(400)
  })
})

describe('POST /api/push-to-nextdns — SSE streaming', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('Content-Type: text/event-stream döndürür', async () => {
    vi.mocked(addDomainToDenylist).mockResolvedValue({ domain: 'ads.example.com', status: 'added' })
    const res = await POST(makeRequest({ apiKey: 'k', profileId: 'p', domains: ['ads.example.com'] }))
    expect(res.headers.get('Content-Type')).toContain('text/event-stream')
  })

  it('start ve complete eventlerini icerir', async () => {
    vi.mocked(addDomainToDenylist).mockResolvedValue({ domain: 'ads.example.com', status: 'added' })
    const res = await POST(makeRequest({ apiKey: 'k', profileId: 'p', domains: ['ads.example.com'] }))
    const events = await collectEvents(res) as Array<{ type: string }>
    const types = events.map((e) => e.type)
    expect(types).toContain('start')
    expect(types).toContain('complete')
  })

  it('başarılı domain için domain_success eventi gönderir', async () => {
    vi.mocked(addDomainToDenylist).mockResolvedValue({ domain: 'ads.example.com', status: 'added' })
    const res = await POST(makeRequest({ apiKey: 'k', profileId: 'p', domains: ['ads.example.com'] }))
    const events = await collectEvents(res) as Array<{ type: string; domain?: string }>
    const successEvent = events.find((e) => e.type === 'domain_success')
    expect(successEvent).toBeDefined()
    expect(successEvent?.domain).toBe('ads.example.com')
  })

  it('skipped domain için domain_skipped eventi gönderir', async () => {
    vi.mocked(addDomainToDenylist).mockResolvedValue({ domain: 'ads.example.com', status: 'skipped' })
    const res = await POST(makeRequest({ apiKey: 'k', profileId: 'p', domains: ['ads.example.com'] }))
    const events = await collectEvents(res) as Array<{ type: string }>
    expect(events.some((e) => e.type === 'domain_skipped')).toBe(true)
  })

  it('hata domain için domain_error eventi gönderir', async () => {
    vi.mocked(addDomainToDenylist).mockResolvedValue({
      domain: 'bad.example.com',
      status: 'error',
      message: 'Sunucu hatası',
      statusCode: 500,
    })
    const res = await POST(makeRequest({ apiKey: 'k', profileId: 'p', domains: ['bad.example.com'] }))
    const events = await collectEvents(res) as Array<{ type: string }>
    expect(events.some((e) => e.type === 'domain_error')).toBe(true)
  })

  it('FatalApiError sonrası fatal_error eventi gönderir ve durur', async () => {
    vi.mocked(addDomainToDenylist).mockRejectedValue(
      new FatalApiError('Geçersiz API anahtarı', 'INVALID_API_KEY'),
    )
    const res = await POST(makeRequest({ apiKey: 'bad', profileId: 'p', domains: ['ads.example.com'] }))
    const events = await collectEvents(res) as Array<{ type: string; code?: string }>
    const fatalEvent = events.find((e) => e.type === 'fatal_error')
    expect(fatalEvent).toBeDefined()
    expect(fatalEvent?.code).toBe('INVALID_API_KEY')
    // complete eventi olmamalı (erken çıkıldı)
    expect(events.some((e) => e.type === 'complete')).toBe(false)
  })

  it('complete event içinde doğru istatistikler bulunur', async () => {
    vi.mocked(addDomainToDenylist)
      .mockResolvedValueOnce({ domain: 'a.com', status: 'added' })
      .mockResolvedValueOnce({ domain: 'b.com', status: 'skipped' })
      .mockResolvedValueOnce({ domain: 'c.com', status: 'error', message: 'err' })

    const res = await POST(makeRequest({
      apiKey: 'k', profileId: 'p',
      domains: ['a.com', 'b.com', 'c.com'],
      batchSize: 10,
    }))
    const events = await collectEvents(res) as Array<{
      type: string
      totalSuccess?: number
      totalSkipped?: number
      totalError?: number
    }>
    const complete = events.find((e) => e.type === 'complete')
    expect(complete?.totalSuccess).toBe(1)
    expect(complete?.totalSkipped).toBe(1)
    expect(complete?.totalError).toBe(1)
  })

  it('birden fazla batch için rate_limit_delay eventi gönderir', async () => {
    vi.mocked(addDomainToDenylist).mockResolvedValue({ domain: 'x.com', status: 'added' })
    // 3 domain, batchSize=1 → 3 batch → 2 delay
    const res = await POST(makeRequest({
      apiKey: 'k', profileId: 'p',
      domains: ['a.com', 'b.com', 'c.com'],
      batchSize: 1,
      delayMs: 100,
    }))
    const events = await collectEvents(res) as Array<{ type: string }>
    const delayEvents = events.filter((e) => e.type === 'rate_limit_delay')
    expect(delayEvents).toHaveLength(2)
  })
})
