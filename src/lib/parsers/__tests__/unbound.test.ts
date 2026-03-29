import { describe, it, expect } from 'vitest'
import { parseUnbound } from '../unbound'

describe('parseUnbound', () => {
  it('local-zone always_nxdomain formatını işler', () => {
    expect(parseUnbound('local-zone: "ads.example.com" always_nxdomain'))
      .toContain('ads.example.com')
  })

  it('local-zone refuse formatını işler', () => {
    expect(parseUnbound('local-zone: "tracker.io" refuse'))
      .toContain('tracker.io')
  })

  it('local-zone always_null formatını işler', () => {
    expect(parseUnbound('local-zone: "malware.bad.com" always_null'))
      .toContain('malware.bad.com')
  })

  it('local-data A formatını işler', () => {
    expect(parseUnbound('local-data: "ads.example.com A 0.0.0.0"'))
      .toContain('ads.example.com')
  })

  it('local-data AAAA formatını işler', () => {
    expect(parseUnbound('local-data: "ads.example.com AAAA ::"'))
      .toContain('ads.example.com')
  })

  it('FQDN trailing noktayı kaldırır', () => {
    const input = 'local-zone: "ads.example.com." always_nxdomain'
    expect(parseUnbound(input)).toContain('ads.example.com')
    expect(parseUnbound(input)).not.toContain('ads.example.com.')
  })

  it('yorum satırlarını (#) atlar', () => {
    const input = '# Unbound config\nlocal-zone: "ads.example.com" always_nxdomain'
    expect(parseUnbound(input)).toEqual(['ads.example.com'])
  })

  it('server: bölüm başlığını atlar', () => {
    const input = 'server:\n  local-zone: "ads.example.com" always_nxdomain'
    expect(parseUnbound(input)).toEqual(['ads.example.com'])
  })

  it('boş satırları atlar', () => {
    const input = '\nlocal-zone: "ads.example.com" always_nxdomain\n\n'
    expect(parseUnbound(input)).toEqual(['ads.example.com'])
  })

  it('tekrarlayan domainleri tekilleştirir', () => {
    const input = [
      'local-zone: "ads.example.com" always_nxdomain',
      'local-data: "ads.example.com A 0.0.0.0"',
    ].join('\n')
    expect(parseUnbound(input)).toEqual(['ads.example.com'])
  })

  it('büyük harfli domain küçük harfe çevirir', () => {
    expect(parseUnbound('local-zone: "ADS.EXAMPLE.COM" refuse'))
      .toContain('ads.example.com')
  })

  it('boş içerik için boş dizi döndürür', () => {
    expect(parseUnbound('')).toEqual([])
  })

  // ── Bulldozer testleri ───────────────────────────────────────
  it('çöp metin içerikten geçerli Unbound direktiflerini çıkarır', () => {
    const input = [
      '<!DOCTYPE html><html><body>503</body></html>',
      'GARBAGE GARBAGE @#$%',
      '',
      '# Real unbound config',
      'server:',
      '  local-zone: "ads.example.com" always_nxdomain',
      'INVALID_LINE_COMPLETELY',
      '  local-data: "tracker.io A 0.0.0.0"',
      '0.0.0.0 hosts.format.com',   // hosts formatı → atlanır
      '  local-zone: "malware.bad.com" refuse',
    ].join('\n')
    const result = parseUnbound(input)
    expect(result).toHaveLength(3)
    expect(result).toContain('ads.example.com')
    expect(result).toContain('tracker.io')
    expect(result).toContain('malware.bad.com')
  })

  it('gerçekçi Unbound listesini doğru işler', () => {
    const input = [
      '# Unbound configuration',
      'server:',
      '  local-zone: "ads.example.com" always_nxdomain',
      '  local-data: "tracker.io A 0.0.0.0"',
      '  local-zone: "malware.bad.com" refuse',
      '  local-zone: "doubleclick.net" always_null',
    ].join('\n')
    const result = parseUnbound(input)
    expect(result).toHaveLength(4)
    expect(result).toContain('ads.example.com')
    expect(result).toContain('tracker.io')
    expect(result).toContain('malware.bad.com')
    expect(result).toContain('doubleclick.net')
  })
})
