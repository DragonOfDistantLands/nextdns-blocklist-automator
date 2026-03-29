import { describe, it, expect } from 'vitest'
import { parseHostsCompressed } from '../hosts-compressed'

describe('parseHostsCompressed', () => {
  // ── Temel format testleri ─────────────────────────────────────
  it('tek satırda tek domain işler', () => {
    expect(parseHostsCompressed('0.0.0.0 ads.example.com')).toContain('ads.example.com')
  })

  it('tek satırda iki domain işler', () => {
    const input = '0.0.0.0 ads.example.com tracker.io'
    const result = parseHostsCompressed(input)
    expect(result).toContain('ads.example.com')
    expect(result).toContain('tracker.io')
  })

  it('tek satırda dört domain işler', () => {
    const input = '0.0.0.0 ads.example.com tracker.io cdn.ads.net malware.bad.com'
    const result = parseHostsCompressed(input)
    expect(result).toHaveLength(4)
    expect(result).toContain('ads.example.com')
    expect(result).toContain('tracker.io')
    expect(result).toContain('cdn.ads.net')
    expect(result).toContain('malware.bad.com')
  })

  it('127.0.0.1 prefix ile çalışır', () => {
    const input = '127.0.0.1 ads.example.com tracker.io'
    const result = parseHostsCompressed(input)
    expect(result).toContain('ads.example.com')
    expect(result).toContain('tracker.io')
  })

  // ── Yorum ve filtre testleri ──────────────────────────────────
  it('satır başı yorum satırını (#) atlar', () => {
    const input = '# Bu bir yorum\n0.0.0.0 ads.example.com'
    expect(parseHostsCompressed(input)).toEqual(['ads.example.com'])
  })

  it('satır içi yorum (#) tokenından itibaren geri kalanı atlar', () => {
    const input = '0.0.0.0 ads.example.com tracker.io # bu yorum'
    const result = parseHostsCompressed(input)
    expect(result).toContain('ads.example.com')
    expect(result).toContain('tracker.io')
    expect(result).not.toContain('bu')
    expect(result).not.toContain('yorum')
  })

  it('boş satırları atlar', () => {
    const input = '\n0.0.0.0 ads.example.com\n\n'
    expect(parseHostsCompressed(input)).toEqual(['ads.example.com'])
  })

  it('IP prefix olmayan satırı atlar', () => {
    const input = 'ads.example.com tracker.io'
    expect(parseHostsCompressed(input)).toHaveLength(0)
  })

  it('192.168.x.x gibi başka IP prefix kabul etmez', () => {
    const input = '192.168.1.1 ads.example.com'
    expect(parseHostsCompressed(input)).toHaveLength(0)
  })

  // ── Özel değer filtreleme ─────────────────────────────────────
  it('localhost değerini satır içinde de atlar', () => {
    const input = '0.0.0.0 localhost ads.example.com'
    const result = parseHostsCompressed(input)
    expect(result).not.toContain('localhost')
    expect(result).toContain('ads.example.com')
  })

  it('0.0.0.0 değerini satır içinde de atlar', () => {
    const input = '0.0.0.0 0.0.0.0 ads.example.com'
    const result = parseHostsCompressed(input)
    expect(result).not.toContain('0.0.0.0')
    expect(result).toContain('ads.example.com')
  })

  it('geçersiz domain tokenlarını sessizce atlar', () => {
    const input = '0.0.0.0 ads.example.com INVALID ads2.example.com'
    const result = parseHostsCompressed(input)
    expect(result).toContain('ads.example.com')
    expect(result).not.toContain('invalid')
    expect(result).toContain('ads2.example.com')
  })

  // ── Tekilleştirme ve normalizasyon ────────────────────────────
  it('tekrarlayan domainleri tekilleştirir', () => {
    const input = '0.0.0.0 ads.example.com ads.example.com tracker.io'
    const result = parseHostsCompressed(input)
    expect(result).toHaveLength(2)
  })

  it('birden fazla satırda tekrarlayan domainleri tekilleştirir', () => {
    const input = [
      '0.0.0.0 ads.example.com tracker.io',
      '0.0.0.0 tracker.io malware.bad.com',
    ].join('\n')
    const result = parseHostsCompressed(input)
    expect(result).toHaveLength(3)
  })

  it('büyük harfli domain küçük harfe çevirir', () => {
    const input = '0.0.0.0 ADS.EXAMPLE.COM TRACKER.IO'
    const result = parseHostsCompressed(input)
    expect(result).toContain('ads.example.com')
    expect(result).toContain('tracker.io')
  })

  it('boş içerik için boş dizi döndürür', () => {
    expect(parseHostsCompressed('')).toEqual([])
  })

  // ── Gerçek dünya listesi ──────────────────────────────────────
  it('Hagezi tarzı compressed liste doğru işler', () => {
    const input = [
      '# Hagezi compressed block list',
      '# Last modified: 2026-01-15',
      '',
      '0.0.0.0 ads.example.com tracker.io cdn.ads.net',
      '0.0.0.0 malware.bad.com phishing.evil.org spyware.net',
      '127.0.0.1 localhost broadcasthost # system',
      '0.0.0.0 analytics.example.com # standalone',
    ].join('\n')
    const result = parseHostsCompressed(input)
    expect(result).toHaveLength(7)
    expect(result).toContain('ads.example.com')
    expect(result).toContain('tracker.io')
    expect(result).toContain('cdn.ads.net')
    expect(result).toContain('malware.bad.com')
    expect(result).toContain('phishing.evil.org')
    expect(result).toContain('spyware.net')
    expect(result).toContain('analytics.example.com')
    expect(result).not.toContain('localhost')
    expect(result).not.toContain('broadcasthost')
  })

  // ── Bulldozer testleri ────────────────────────────────────────
  it('çöp içerik arasından geçerli satırları ayıklar', () => {
    const input = [
      '<!DOCTYPE html>',
      '<html><body><h1>Error 404</h1></body></html>',
      '==============================',
      'RANDOM GARBAGE @#$%',
      '',
      '# Actual data',
      '0.0.0.0 ads.example.com tracker.io',
      'not-a-valid-hosts-line',
      '0.0.0.0 malware.bad.com',
    ].join('\n')
    const result = parseHostsCompressed(input)
    expect(result).toHaveLength(3)
    expect(result).toContain('ads.example.com')
    expect(result).toContain('tracker.io')
    expect(result).toContain('malware.bad.com')
  })
})
