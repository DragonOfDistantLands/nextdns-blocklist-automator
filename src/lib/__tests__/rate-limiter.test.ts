import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { chunk, delay, calculateBackoff } from '../rate-limiter'

describe('chunk', () => {
  it('diziyi belirtilen boyutta parçalara böler', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
  })

  it('tam bölünebilen dizi için eşit parçalar üretir', () => {
    expect(chunk([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]])
  })

  it('size >= array.length ise tek parça döner', () => {
    expect(chunk([1, 2, 3], 10)).toEqual([[1, 2, 3]])
  })

  it('boş dizi için boş dizi döner', () => {
    expect(chunk([], 5)).toEqual([])
  })

  it('size=1 için her eleman ayrı parça olur', () => {
    expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]])
  })

  it('string dizisi ile çalışır', () => {
    const result = chunk(['a', 'b', 'c', 'd'], 3)
    expect(result).toEqual([['a', 'b', 'c'], ['d']])
  })
})

describe('calculateBackoff', () => {
  it('retryCount=0 için baseDelayMs döner', () => {
    expect(calculateBackoff(0, 1000)).toBe(1000)
  })

  it('retryCount=1 için 2×base döner', () => {
    expect(calculateBackoff(1, 1000)).toBe(2000)
  })

  it('retryCount=2 için 4×base döner', () => {
    expect(calculateBackoff(2, 1000)).toBe(4000)
  })

  it('retryCount=3 için 8×base döner', () => {
    expect(calculateBackoff(3, 5000)).toBe(40000)
  })
})

describe('delay', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('belirtilen süre sonra resolve eder', async () => {
    const promise = delay(1000)
    vi.advanceTimersByTime(1000)
    await expect(promise).resolves.toBeUndefined()
  })

  it('süre dolmadan resolve etmez', async () => {
    let resolved = false
    delay(1000).then(() => { resolved = true })
    vi.advanceTimersByTime(500)
    await Promise.resolve() // mikro görev kuyruğunu boşalt
    expect(resolved).toBe(false)
  })
})
