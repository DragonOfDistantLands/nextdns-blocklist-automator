import { describe, it, expect } from 'vitest'
import { parseWildcardAsterisk } from '../wildcard-asterisk'

describe('parseWildcardAsterisk', () => {
  // ── Temel format testleri ─────────────────────────────────────
  it('*.domain.com satırından base domain çıkarır', () => {
    const result = parseWildcardAsterisk('*.ads.example.com')
    expect(result).toContain('ads.example.com')
    expect(result).not.toContain('*.ads.example.com')
  })

  it('*.tld.com şeklindeki kısa domain işler', () => {
    expect(parseWildcardAsterisk('*.tracker.io')).toContain('tracker.io')
  })

  it('*.sub.domain.example.com derin alt-domain işler', () => {
    expect(parseWildcardAsterisk('*.sub.ads.example.com')).toContain('sub.ads.example.com')
  })

  // ── Strict mod — joker olmayan satırlar atlanır ───────────────
  it('düz domain satırını atlar (bu strict wildcard formatıdır)', () => {
    expect(parseWildcardAsterisk('ads.example.com')).toHaveLength(0)
  })

  it('hosts formatı satırını atlar', () => {
    expect(parseWildcardAsterisk('0.0.0.0 ads.example.com')).toHaveLength(0)
  })

  it('ublock satırını atlar', () => {
    expect(parseWildcardAsterisk('||ads.example.com^')).toHaveLength(0)
  })

  it('geçersiz wildcard (**. çift yıldız) satırını atlar', () => {
    expect(parseWildcardAsterisk('**.ads.example.com')).toHaveLength(0)
  })

  // ── Yorum testleri ────────────────────────────────────────────
  it('# ile başlayan yorum satırını atlar', () => {
    const input = '# Wildcard list\n*.ads.example.com'
    expect(parseWildcardAsterisk(input)).toEqual(['ads.example.com'])
  })

  it('// ile başlayan yorum satırını atlar', () => {
    const input = '// comment\n*.tracker.io'
    expect(parseWildcardAsterisk(input)).toEqual(['tracker.io'])
  })

  it('! ile başlayan yorum satırını atlar', () => {
    const input = '! yorum\n*.malware.bad.com'
    expect(parseWildcardAsterisk(input)).toEqual(['malware.bad.com'])
  })

  it('boş satırları atlar', () => {
    const input = '\n*.ads.example.com\n\n'
    expect(parseWildcardAsterisk(input)).toEqual(['ads.example.com'])
  })

  // ── Tekilleştirme ve normalizasyon ────────────────────────────
  it('tekrarlayan base domain tekilleştirir', () => {
    const input = '*.ads.example.com\n*.ads.example.com'
    expect(parseWildcardAsterisk(input)).toEqual(['ads.example.com'])
  })

  it('büyük harfli wildcard satırını küçük harfe çevirir', () => {
    expect(parseWildcardAsterisk('*.ADS.EXAMPLE.COM')).toContain('ads.example.com')
  })

  it('boş içerik için boş dizi döndürür', () => {
    expect(parseWildcardAsterisk('')).toEqual([])
  })

  // ── Gerçek dünya listesi ──────────────────────────────────────
  it('Hagezi wildcardonly tarzı liste doğru işler', () => {
    const input = [
      '# Hagezi Wildcardonly Blocklist',
      '# Version: 2026.01.15.12',
      '!',
      '',
      '*.ads.example.com',
      '*.tracker.io',
      '*.cdn.doubleclick.net',
      '# mixed garbage',
      'plain.domain.com',               // düz → atlanır
      '0.0.0.0 hosts.format.com',       // hosts → atlanır
      '*.malware.bad.com',
      '||ublock.format.com^',           // ublock → atlanır
    ].join('\n')
    const result = parseWildcardAsterisk(input)
    expect(result).toHaveLength(4)
    expect(result).toContain('ads.example.com')
    expect(result).toContain('tracker.io')
    expect(result).toContain('cdn.doubleclick.net')
    expect(result).toContain('malware.bad.com')
    expect(result).not.toContain('plain.domain.com')
    expect(result).not.toContain('hosts.format.com')
    expect(result).not.toContain('ublock.format.com')
  })

  // ── Bulldozer testleri ────────────────────────────────────────
  it('çöp içerik arasından yalnızca geçerli wildcard satırlarını çıkarır', () => {
    const input = [
      '<!DOCTYPE html>',
      '<html><body>Forbidden 403</body></html>',
      '===================================',
      'GARBAGE LINE !!!@@@###',
      '',
      '# Real data',
      '*.ads.example.com',
      'invalid_domain',
      '*.tracker.io',
      '0.0.0.0 hosts.line.com',
    ].join('\n')
    const result = parseWildcardAsterisk(input)
    expect(result).toHaveLength(2)
    expect(result).toContain('ads.example.com')
    expect(result).toContain('tracker.io')
  })
})
