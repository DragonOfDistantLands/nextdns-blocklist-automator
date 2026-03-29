import { describe, it, expect } from 'vitest'
import { parseBind9 } from '../bind9'

describe('parseBind9', () => {
  it('CNAME . formatını işler', () => {
    expect(parseBind9('ads.example.com CNAME .')).toContain('ads.example.com')
  })

  it('A 0.0.0.0 formatını işler', () => {
    expect(parseBind9('tracker.io A 0.0.0.0')).toContain('tracker.io')
  })

  it('IN CNAME (sınıf belirtilmiş) formatını işler', () => {
    expect(parseBind9('malware.bad.com IN CNAME .')).toContain('malware.bad.com')
  })

  it('FQDN trailing noktayı kaldırır', () => {
    const input = 'ads.example.com. CNAME .'
    expect(parseBind9(input)).toContain('ads.example.com')
    expect(parseBind9(input)).not.toContain('ads.example.com.')
  })

  it('wildcard *. prefix kaldırır', () => {
    const input = '*.ads.example.com CNAME .'
    expect(parseBind9(input)).toContain('ads.example.com')
  })

  it('; ile başlayan yorum satırını atlar', () => {
    const input = '; Bind9 RPZ\nads.example.com CNAME .'
    expect(parseBind9(input)).toEqual(['ads.example.com'])
  })

  it('$ direktiflerini ($TTL, $ORIGIN) atlar', () => {
    const input = '$TTL 300\n$ORIGIN .\nads.example.com CNAME .'
    expect(parseBind9(input)).toEqual(['ads.example.com'])
  })

  it('@ ile başlayan SOA/NS kayıtlarını atlar', () => {
    const input = '@ IN SOA localhost. root.localhost. ( 1 1d 2h 4w 1h )\nads.example.com CNAME .'
    expect(parseBind9(input)).toEqual(['ads.example.com'])
  })

  it('AAAA kaydını da işler', () => {
    expect(parseBind9('ads.example.com AAAA ::')).toContain('ads.example.com')
  })

  it('tekrarlayan domainleri tekilleştirir', () => {
    const input = 'ads.example.com CNAME .\nads.example.com A 0.0.0.0'
    expect(parseBind9(input)).toEqual(['ads.example.com'])
  })

  it('boş içerik için boş dizi döndürür', () => {
    expect(parseBind9('')).toEqual([])
  })

  // ── Bulldozer testleri ───────────────────────────────────────
  it('çöp metin içerikten geçerli Bind9/RPZ kayıtlarını çıkarır', () => {
    const input = [
      '<!DOCTYPE html><html><body>Error</body></html>',
      'RANDOM GARBAGE !@#$',
      '',
      '; Real RPZ zone',
      '$TTL 300',
      'ads.example.com     CNAME   .',
      'INVALID LINE @@@',
      'tracker.io          A       0.0.0.0',
      '0.0.0.0 hosts.format.com',   // hosts formatı → regex eşleşmez → atlanır
      'malware.bad.com     CNAME   .',
    ].join('\n')
    const result = parseBind9(input)
    expect(result).toHaveLength(3)
    expect(result).toContain('ads.example.com')
    expect(result).toContain('tracker.io')
    expect(result).toContain('malware.bad.com')
  })

  it('gerçekçi RPZ zone dosyasını doğru işler', () => {
    const input = [
      '; Bind9 RPZ zone file',
      '$TTL 300',
      '@ IN SOA localhost. root.localhost. ( 1 1d 2h 4w 1h )',
      '  IN NS localhost.',
      '',
      'ads.example.com     CNAME   .',
      'tracker.io          CNAME   .',
      'malware.bad.com     A       0.0.0.0',
      'doubleclick.net.    CNAME   .',
    ].join('\n')
    const result = parseBind9(input)
    expect(result).toHaveLength(4)
    expect(result).toContain('ads.example.com')
    expect(result).toContain('tracker.io')
    expect(result).toContain('malware.bad.com')
    expect(result).toContain('doubleclick.net')
  })
})
