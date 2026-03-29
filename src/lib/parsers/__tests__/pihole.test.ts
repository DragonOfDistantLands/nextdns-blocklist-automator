import { describe, it, expect } from 'vitest'
import { parsePihole } from '../pihole'

describe('parsePihole', () => {
  it('0.0.0.0 formatından domain çıkarır', () => {
    expect(parsePihole('0.0.0.0 ads.example.com')).toContain('ads.example.com')
  })

  it('127.0.0.1 formatından domain çıkarır', () => {
    expect(parsePihole('127.0.0.1 tracker.io')).toContain('tracker.io')
  })

  it('satır sonu yorumunu (#) görmezden gelir', () => {
    const input = '0.0.0.0 ads.example.com # Bu bir yorum'
    expect(parsePihole(input)).toContain('ads.example.com')
  })

  it('"0.0.0.0 0.0.0.0" kendini referans eden satırı atlar', () => {
    const input = '0.0.0.0 0.0.0.0'
    expect(parsePihole(input)).toHaveLength(0)
  })

  it('localhost atlar', () => {
    expect(parsePihole('127.0.0.1 localhost')).not.toContain('localhost')
  })

  it('yorum satırlarını atlar', () => {
    const input = '# Pi-hole blocklist\n0.0.0.0 ads.example.com'
    expect(parsePihole(input)).toEqual(['ads.example.com'])
  })

  it('tekrarlayan domainleri tekilleştirir', () => {
    const input = '0.0.0.0 ads.example.com\n127.0.0.1 ads.example.com'
    expect(parsePihole(input)).toEqual(['ads.example.com'])
  })

  it('boş içerik için boş dizi döndürür', () => {
    expect(parsePihole('')).toEqual([])
  })

  it('büyük harfli domain küçük harfe çevirir', () => {
    expect(parsePihole('0.0.0.0 ADS.EXAMPLE.COM')).toContain('ads.example.com')
  })

  // ── Bulldozer testleri ───────────────────────────────────────
  it('çöp metin ve HTML içerikten geçerli satırları sessizce ayıklar', () => {
    const input = [
      '<!DOCTYPE html><html><body><h1>502 Bad Gateway</h1></body></html>',
      '============================',
      'GARBAGE @#$%^',
      '',
      '# Actual Pi-hole data',
      '0.0.0.0 ads.example.com',
      'invalid line no ip prefix',
      '0.0.0.0 tracker.io',
      '0.0.0.0 malware.bad.com',
    ].join('\n')
    const result = parsePihole(input)
    expect(result).toHaveLength(3)
    expect(result).toContain('ads.example.com')
    expect(result).toContain('tracker.io')
    expect(result).toContain('malware.bad.com')
  })

  it('gerçekçi Pi-hole listesini doğru işler', () => {
    const input = [
      '# Pi-hole default blocklist',
      '# Updated: 2026-01-01',
      '',
      '0.0.0.0 ads.doubleclick.net',
      '0.0.0.0 googletagmanager.com # Google Tag Manager',
      '0.0.0.0 stats.wp.com',
      '127.0.0.1 adserver.example.org',
      '127.0.0.1 localhost',
      '0.0.0.0 0.0.0.0',
    ].join('\n')
    const result = parsePihole(input)
    expect(result).toHaveLength(4)
    expect(result).toContain('ads.doubleclick.net')
    expect(result).toContain('googletagmanager.com')
    expect(result).toContain('stats.wp.com')
    expect(result).toContain('adserver.example.org')
  })
})
