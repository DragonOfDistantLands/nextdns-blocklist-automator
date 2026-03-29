import { describe, it, expect } from 'vitest'
import { parsePlain } from '../plain'

describe('parsePlain', () => {
  it('düz domain satırını işler', () => {
    expect(parsePlain('ads.example.com')).toContain('ads.example.com')
  })

  it('alt domain işler', () => {
    expect(parsePlain('sub.ads.example.com')).toContain('sub.ads.example.com')
  })

  it('# ile başlayan yorum satırını atlar', () => {
    const input = '# Plain domain list\nads.example.com'
    expect(parsePlain(input)).toEqual(['ads.example.com'])
  })

  it('// ile başlayan yorum satırını atlar', () => {
    const input = '// comment\nads.example.com'
    expect(parsePlain(input)).toEqual(['ads.example.com'])
  })

  it('! ile başlayan yorum satırını atlar', () => {
    const input = '! yorum\nads.example.com'
    expect(parsePlain(input)).toEqual(['ads.example.com'])
  })

  it('boş satırları atlar', () => {
    const input = '\nads.example.com\n\n'
    expect(parsePlain(input)).toEqual(['ads.example.com'])
  })

  it('boşluk içeren satırı atlar (hosts formatı gibi)', () => {
    const input = '0.0.0.0 ads.example.com'
    expect(parsePlain(input)).toHaveLength(0)
  })

  it('geçersiz domain satırını atlar', () => {
    const input = 'notadomain\nads.example.com'
    expect(parsePlain(input)).toEqual(['ads.example.com'])
  })

  it('localhost atlar', () => {
    expect(parsePlain('localhost')).toHaveLength(0)
  })

  it('IP adresini atlar', () => {
    expect(parsePlain('0.0.0.0')).toHaveLength(0)
    expect(parsePlain('127.0.0.1')).toHaveLength(0)
  })

  it('tekrarlayan domainleri tekilleştirir', () => {
    const input = 'ads.example.com\nads.example.com\ntracker.io'
    const result = parsePlain(input)
    expect(result).toHaveLength(2)
    expect(result).toContain('ads.example.com')
    expect(result).toContain('tracker.io')
  })

  it('büyük harfli domain küçük harfe çevirir', () => {
    expect(parsePlain('ADS.EXAMPLE.COM')).toContain('ads.example.com')
  })

  it('boş içerik için boş dizi döndürür', () => {
    expect(parsePlain('')).toEqual([])
  })

  it('başındaki/sonundaki boşlukları trim eder', () => {
    expect(parsePlain('  ads.example.com  ')).toContain('ads.example.com')
  })

  it('gerçekçi plain domain listesini doğru işler', () => {
    const input = [
      '# Plain domain list',
      '# Updated: 2026-01-15',
      '',
      'ads.example.com',
      'tracker.io',
      'malware.bad.com',
      'doubleclick.net',
      '// another comment',
      'cdn.ads.net',
    ].join('\n')
    const result = parsePlain(input)
    expect(result).toHaveLength(5)
    expect(result).toContain('ads.example.com')
    expect(result).toContain('tracker.io')
    expect(result).toContain('malware.bad.com')
    expect(result).toContain('doubleclick.net')
    expect(result).toContain('cdn.ads.net')
  })

  // ── Bulldozer (garbage tolerance) testleri ───────────────────
  it('çöp metin, HTML ve bozuk satırlardan geçerli domainleri çıkarır', () => {
    const input = [
      '<!DOCTYPE html>',
      '<html><head><title>Service Unavailable</title></head>',
      '<body>503 Service Unavailable</body></html>',
      '===================================',
      '!!! RANDOM GARBAGE !!! @#$%^&*()',
      '0.0.0.0 hosts.format.com',     // hosts formatı → boşluk var → atlanır
      '||ublock.format.com^',         // ublock formatı → atlanır
      '',
      '# Actual plain domains',
      'ads.example.com',
      'INVALID_TOKEN!@#',
      'tracker.io',
      '   ',
      'malware.bad.com',
    ].join('\n')
    const result = parsePlain(input)
    expect(result).toHaveLength(3)
    expect(result).toContain('ads.example.com')
    expect(result).toContain('tracker.io')
    expect(result).toContain('malware.bad.com')
  })
})
