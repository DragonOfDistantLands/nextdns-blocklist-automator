import { describe, it, expect } from 'vitest'
import { parseDnscrypt } from '../dnscrypt'

describe('parseDnscrypt', () => {
  it('domain + IP formatını işler', () => {
    expect(parseDnscrypt('ads.example.com\t0.0.0.0')).toContain('ads.example.com')
  })

  it('boşlukla ayrılmış formatı işler', () => {
    expect(parseDnscrypt('tracker.io 127.0.0.1')).toContain('tracker.io')
  })

  it('wildcard (*.) prefix kaldırır, base domain alır', () => {
    const input = '*.doubleclick.net 0.0.0.0'
    expect(parseDnscrypt(input)).toContain('doubleclick.net')
    expect(parseDnscrypt(input)).not.toContain('*.doubleclick.net')
  })

  it('yorum satırlarını (#) atlar', () => {
    const input = '# dnscrypt rules\nads.example.com 0.0.0.0'
    expect(parseDnscrypt(input)).toEqual(['ads.example.com'])
  })

  it('boş satırları atlar', () => {
    const input = '\nads.example.com 0.0.0.0\n\n'
    expect(parseDnscrypt(input)).toEqual(['ads.example.com'])
  })

  it('sadece domain içeren satırı (IP olmayan) atlar', () => {
    const input = 'ads.example.com'
    expect(parseDnscrypt(input)).toHaveLength(0)
  })

  it('tekrarlayan domainleri tekilleştirir', () => {
    const input = 'ads.example.com 0.0.0.0\nads.example.com 127.0.0.1'
    expect(parseDnscrypt(input)).toEqual(['ads.example.com'])
  })

  it('büyük harfli domain küçük harfe çevirir', () => {
    expect(parseDnscrypt('ADS.EXAMPLE.COM 0.0.0.0')).toContain('ads.example.com')
  })

  it('boş içerik için boş dizi döndürür', () => {
    expect(parseDnscrypt('')).toEqual([])
  })

  // ── Bulldozer testleri ───────────────────────────────────────
  it('çöp metin içerikten geçerli dnscrypt satırlarını çıkarır', () => {
    const input = [
      '<!DOCTYPE html><html><body>404</body></html>',
      'GARBAGE @#$%',
      '',
      '# Real data',
      'ads.example.com        0.0.0.0',
      'INVALID LINE',
      'tracker.io             127.0.0.1',
      'justadomain.com',         // IP yok → atlanır
      'malware.bad.com        0.0.0.0',
    ].join('\n')
    const result = parseDnscrypt(input)
    expect(result).toHaveLength(3)
    expect(result).toContain('ads.example.com')
    expect(result).toContain('tracker.io')
    expect(result).toContain('malware.bad.com')
  })

  it('gerçekçi dnscrypt listesini doğru işler', () => {
    const input = [
      '# dnscrypt-proxy cloaking rules',
      'ads.example.com        0.0.0.0',
      'tracker.io             127.0.0.1',
      '*.doubleclick.net      0.0.0.0',
      '# another comment',
    ].join('\n')
    const result = parseDnscrypt(input)
    expect(result).toHaveLength(3)
    expect(result).toContain('ads.example.com')
    expect(result).toContain('tracker.io')
    expect(result).toContain('doubleclick.net')
  })
})
