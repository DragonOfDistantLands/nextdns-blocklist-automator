import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { addDomainToDenylist } from '../api'
import { FatalApiError, RateLimitError } from '../types'

// Axios instance mock: post metodunu kontrol edeceğiz
vi.mock('@/lib/rate-limiter', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/rate-limiter')>()
  return {
    ...actual,
    // Testlerde gerçek bekleme süresini atlıyoruz
    delay: vi.fn().mockResolvedValue(undefined),
  }
})

function makeClient(postImpl: () => Promise<unknown>) {
  return { post: vi.fn().mockImplementation(postImpl) } as unknown as ReturnType<typeof import('../client').createNextDNSClient>
}

describe('addDomainToDenylist', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('başarılı ekleme için "added" döndürür', async () => {
    const client = makeClient(() => Promise.resolve({ status: 201 }))
    const result = await addDomainToDenylist(client, 'abc123', 'ads.example.com')
    expect(result).toEqual({ domain: 'ads.example.com', status: 'added' })
  })

  it('409 Conflict için "skipped" döndürür', async () => {
    const error = Object.assign(new Error('Conflict'), {
      isAxiosError: true,
      response: { status: 409 },
    })
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)
    const client = makeClient(() => Promise.reject(error))
    const result = await addDomainToDenylist(client, 'abc123', 'ads.example.com')
    expect(result.status).toBe('skipped')
    expect(result.statusCode).toBe(409)
  })

  it('401 Unauthorized için FatalApiError fırlatır', async () => {
    const error = Object.assign(new Error('Unauthorized'), {
      isAxiosError: true,
      response: { status: 401 },
    })
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)
    const client = makeClient(() => Promise.reject(error))
    await expect(addDomainToDenylist(client, 'abc123', 'ads.example.com'))
      .rejects.toBeInstanceOf(FatalApiError)
  })

  it('401 için FatalApiError.code === "INVALID_API_KEY"', async () => {
    const error = Object.assign(new Error('Unauthorized'), {
      isAxiosError: true,
      response: { status: 401 },
    })
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)
    const client = makeClient(() => Promise.reject(error))
    await addDomainToDenylist(client, 'abc123', 'ads.example.com').catch((e: FatalApiError) => {
      expect(e.code).toBe('INVALID_API_KEY')
    })
  })

  it('404 Not Found için FatalApiError fırlatır', async () => {
    const error = Object.assign(new Error('Not Found'), {
      isAxiosError: true,
      response: { status: 404 },
    })
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)
    const client = makeClient(() => Promise.reject(error))
    await expect(addDomainToDenylist(client, 'abc123', 'ads.example.com'))
      .rejects.toBeInstanceOf(FatalApiError)
  })

  it('404 için FatalApiError.code === "PROFILE_NOT_FOUND"', async () => {
    const error = Object.assign(new Error('Not Found'), {
      isAxiosError: true,
      response: { status: 404 },
    })
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)
    const client = makeClient(() => Promise.reject(error))
    await addDomainToDenylist(client, 'abc123', 'ads.example.com').catch((e: FatalApiError) => {
      expect(e.code).toBe('PROFILE_NOT_FOUND')
    })
  })

  it('429 maxRetries sonunda RateLimitError fırlatır', async () => {
    const error = Object.assign(new Error('Too Many Requests'), {
      isAxiosError: true,
      response: { status: 429, headers: {} },
    })
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)
    const client = makeClient(() => Promise.reject(error))
    // maxRetries=0 ile hemen fırlat
    await expect(addDomainToDenylist(client, 'abc123', 'ads.example.com', 0))
      .rejects.toBeInstanceOf(RateLimitError)
  })

  it('429 ile Retry-After header varsa retryAfterMs header değerini kullanır', async () => {
    let callCount = 0
    const error = Object.assign(new Error('Too Many Requests'), {
      isAxiosError: true,
      response: { status: 429, headers: { 'retry-after': '2' } },
    })
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)
    // İlk çağrı 429, ikinci çağrı başarılı
    const client = {
      post: vi.fn().mockImplementation(() => {
        callCount++
        if (callCount === 1) return Promise.reject(error)
        return Promise.resolve({ status: 201 })
      }),
    } as unknown as ReturnType<typeof import('../client').createNextDNSClient>
    const result = await addDomainToDenylist(client, 'abc123', 'ads.example.com', 1)
    expect(result.status).toBe('added')
    expect(client.post).toHaveBeenCalledTimes(2)
  })

  it('ağ hatası (Axios değil) için "error" döndürür', async () => {
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(false)
    const client = makeClient(() => Promise.reject(new Error('Network error')))
    const result = await addDomainToDenylist(client, 'abc123', 'ads.example.com')
    expect(result.status).toBe('error')
    expect(result.message).toBe('Ağ bağlantısı hatası')
  })

  it('5xx hata için "error" döndürür ve operasyona devam eder', async () => {
    const error = Object.assign(new Error('Server Error'), {
      isAxiosError: true,
      response: { status: 500, data: {} },
    })
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)
    const client = makeClient(() => Promise.reject(error))
    const result = await addDomainToDenylist(client, 'abc123', 'ads.example.com')
    expect(result.status).toBe('error')
    expect(result.statusCode).toBe(500)
  })
})

describe('RateLimitError', () => {
  it('doğru name ve retryAfterMs değerini taşır', () => {
    const err = new RateLimitError('Rate limited', 5000)
    expect(err.name).toBe('RateLimitError')
    expect(err.retryAfterMs).toBe(5000)
    expect(err.message).toBe('Rate limited')
  })
})

describe('FatalApiError', () => {
  it('doğru name ve code değerini taşır', () => {
    const err = new FatalApiError('Invalid key', 'INVALID_API_KEY')
    expect(err.name).toBe('FatalApiError')
    expect(err.code).toBe('INVALID_API_KEY')
  })
})
