import { describe, it, expect } from 'vitest'
import { parseDNSCloak } from '../dnscloak'

describe('parseDNSCloak', () => {
  it('düz domain satırını işler', () => {
    expect(parseDNSCloak('ads.example.com')).toContain('ads.example.com')
  })

  it('wildcard (*.) prefix kaldırır, base domain alır', () => {
    const input = '*.ads.example.com'
    expect(parseDNSCloak(input)).toContain('ads.example.com')
    expect(parseDNSCloak(input)).not.toContain('*.ads.example.com')
  })

  it('# ile başlayan yorum satırını atlar', () => {
    const input = '# DNSCloak list\nads.example.com'
    expect(parseDNSCloak(input)).toEqual(['ads.example.com'])
  })

  it('// ile başlayan yorum satırını atlar', () => {
    const input = '// comment\nads.example.com'
    expect(parseDNSCloak(input)).toEqual(['ads.example.com'])
  })

  it('! ile başlayan yorum satırını atlar', () => {
    const input = '! yorum\nads.example.com'
    expect(parseDNSCloak(input)).toEqual(['ads.example.com'])
  })

  it('boş satırları atlar', () => {
    const input = '\nads.example.com\n\n'
    expect(parseDNSCloak(input)).toEqual(['ads.example.com'])
  })

  it('boşluk içeren satırı atlar (bu format değil)', () => {
    const input = '0.0.0.0 ads.example.com'
    expect(parseDNSCloak(input)).toHaveLength(0)
  })

  it('tekrarlayan domainleri tekilleştirir', () => {
    const input = 'ads.example.com\nads.example.com\n*.ads.example.com'
    expect(parseDNSCloak(input)).toEqual(['ads.example.com'])
  })

  it('büyük harfli domain küçük harfe çevirir', () => {
    expect(parseDNSCloak('ADS.EXAMPLE.COM')).toContain('ads.example.com')
  })

  it('boş içerik için boş dizi döndürür', () => {
    expect(parseDNSCloak('')).toEqual([])
  })

  it('geçersiz domain satırını atlar', () => {
    const input = 'notadomain\nads.example.com'
    expect(parseDNSCloak(input)).toEqual(['ads.example.com'])
  })

  // ── Bulldozer testleri ───────────────────────────────────────
  it('çöp metin ve HTML içerikten geçerli domain satırlarını çıkarır', () => {
    const input = [
      '<!DOCTYPE html><html><body>404 Not Found</body></html>',
      'GARBAGE @#$%^&*()',
      '',
      '# Real DNSCloak data',
      'ads.example.com',
      '0.0.0.0 hosts.format.com',    // hosts formatı → boşluk var → regex eşleşmez
      '*.tracker.io',
      'INVALID_TOKEN!@#',
      'malware.bad.com',
    ].join('\n')
    const result = parseDNSCloak(input)
    expect(result).toHaveLength(3)
    expect(result).toContain('ads.example.com')
    expect(result).toContain('tracker.io')
    expect(result).toContain('malware.bad.com')
  })
})
