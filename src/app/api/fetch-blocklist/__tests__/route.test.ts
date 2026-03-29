import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Axios'u mock'luyoruz
vi.mock('axios', async () => {
  const actual = await vi.importActual<typeof import('axios')>('axios')
  return {
    default: {
      ...actual.default,
      get: vi.fn(),
      isAxiosError: actual.default.isAxiosError,
      create: actual.default.create,
    },
    isAxiosError: actual.default.isAxiosError,
  }
})

import axios from 'axios'
import { GET } from '../route'

function makeRequest(url: string): NextRequest {
  return new NextRequest(`http://localhost/api/fetch-blocklist?url=${encodeURIComponent(url)}`)
}

function makeRequestNoUrl(): NextRequest {
  return new NextRequest('http://localhost/api/fetch-blocklist')
}

describe('GET /api/fetch-blocklist', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('url parametresi yoksa 400 döndürür', async () => {
    const res = await GET(makeRequestNoUrl())
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.code).toBe('INVALID_URL')
  })

  it('geçersiz URL formatı için 400 döndürür', async () => {
    const res = await GET(makeRequest('not-a-url'))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.code).toBe('INVALID_URL')
  })

  it('http olmayan protokol için 400 döndürür', async () => {
    const res = await GET(makeRequest('ftp://example.com/list.txt'))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.code).toBe('INVALID_URL')
  })

  it('başarılı çekme için 200 ve içerik döndürür', async () => {
    const fakeContent = '0.0.0.0 ads.example.com\n0.0.0.0 tracker.io\n'
    vi.mocked(axios.get).mockResolvedValueOnce({ data: fakeContent })

    const res = await GET(makeRequest('https://example.com/blocklist.txt'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.content).toBe(fakeContent)
    expect(body.lineCount).toBe(3)
    expect(typeof body.byteSize).toBe('number')
    expect(typeof body.fetchedAt).toBe('string')
  })

  it('axios ECONNABORTED hatası için 504 döndürür', async () => {
    const err = Object.assign(new Error('timeout'), {
      isAxiosError: true,
      code: 'ECONNABORTED',
      response: undefined,
    })
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)
    vi.mocked(axios.get).mockRejectedValueOnce(err)

    const res = await GET(makeRequest('https://example.com/list.txt'))
    expect(res.status).toBe(504)
    const body = await res.json()
    expect(body.code).toBe('TIMEOUT')
  })

  it('404 yanıtı için 502 döndürür', async () => {
    const err = Object.assign(new Error('Not Found'), {
      isAxiosError: true,
      code: undefined,
      response: { status: 404 },
    })
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)
    vi.mocked(axios.get).mockRejectedValueOnce(err)

    const res = await GET(makeRequest('https://example.com/list.txt'))
    expect(res.status).toBe(502)
    const body = await res.json()
    expect(body.code).toBe('FETCH_FAILED')
  })

  it('hedef sunucu 5xx döndürürse 502 döndürür', async () => {
    const err = Object.assign(new Error('Server Error'), {
      isAxiosError: true,
      code: undefined,
      response: { status: 503 },
    })
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)
    vi.mocked(axios.get).mockRejectedValueOnce(err)

    const res = await GET(makeRequest('https://example.com/list.txt'))
    expect(res.status).toBe(502)
  })
})
