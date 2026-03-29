import { describe, it, expect } from 'vitest'
import { parseWindowsHosts } from '../windows-hosts'

describe('parseWindowsHosts', () => {
  it('0.0.0.0 ile başlayan satırı işler', () => {
    expect(parseWindowsHosts('0.0.0.0 ads.example.com'))
      .toContain('ads.example.com')
  })

  it('127.0.0.1 ile başlayan satırı işler', () => {
    expect(parseWindowsHosts('127.0.0.1 tracker.io'))
      .toContain('tracker.io')
  })

  it('255.255.255.255 ile başlayan satırı işler', () => {
    expect(parseWindowsHosts('255.255.255.255 broadcasthost'))
      .not.toContain('broadcasthost')
  })

  it('IPv6 ::1 ile başlayan satırı işler ama localhost atlar', () => {
    const result = parseWindowsHosts('::1 localhost')
    expect(result).not.toContain('localhost')
  })

  it('IPv6 fe80 ile başlayan satırı işler', () => {
    expect(parseWindowsHosts('fe80::1 ads.example.com'))
      .toContain('ads.example.com')
  })

  it('localhost atlar', () => {
    expect(parseWindowsHosts('127.0.0.1 localhost')).not.toContain('localhost')
  })

  it('ip6-localhost atlar', () => {
    expect(parseWindowsHosts('::1 ip6-localhost')).not.toContain('ip6-localhost')
  })

  it('broadcasthost atlar', () => {
    expect(parseWindowsHosts('255.255.255.255 broadcasthost'))
      .not.toContain('broadcasthost')
  })

  it('# ile başlayan yorum satırını atlar', () => {
    const input = '# Windows hosts file\n0.0.0.0 ads.example.com'
    expect(parseWindowsHosts(input)).toEqual(['ads.example.com'])
  })

  it('satır içi yorumu (#) doğru işler', () => {
    const input = '0.0.0.0 ads.example.com # reklam sunucusu'
    expect(parseWindowsHosts(input)).toContain('ads.example.com')
  })

  it('nokta içermeyen tek etiketleri atlar', () => {
    const input = '127.0.0.1 myserver'
    expect(parseWindowsHosts(input)).toHaveLength(0)
  })

  it('tekrarlayan domainleri tekilleştirir', () => {
    const input = '0.0.0.0 ads.example.com\n127.0.0.1 ads.example.com'
    expect(parseWindowsHosts(input)).toEqual(['ads.example.com'])
  })

  it('büyük harfli domain küçük harfe çevirir', () => {
    expect(parseWindowsHosts('0.0.0.0 ADS.EXAMPLE.COM'))
      .toContain('ads.example.com')
  })

  it('boş içerik için boş dizi döndürür', () => {
    expect(parseWindowsHosts('')).toEqual([])
  })

  // ── Bulldozer testleri ───────────────────────────────────────
  it('çöp metin ve HTML içerikten geçerli hosts satırlarını çıkarır', () => {
    const input = [
      '<!DOCTYPE html><html><body>403 Forbidden</body></html>',
      'GARBAGE @#$%^',
      '',
      '# Real hosts data',
      '0.0.0.0 ads.example.com',
      'plain.domain.com',           // IP prefix yok → atlanır
      '0.0.0.0 tracker.io',
      'INVALID !@# LINE',
      '127.0.0.1 malware.bad.com',
    ].join('\n')
    const result = parseWindowsHosts(input)
    expect(result).toHaveLength(3)
    expect(result).toContain('ads.example.com')
    expect(result).toContain('tracker.io')
    expect(result).toContain('malware.bad.com')
  })

  it('gerçekçi Windows hosts dosyasını doğru işler', () => {
    const input = [
      '# Copyright (c) 1993-2009 Microsoft Corp.',
      '',
      '127.0.0.1       localhost',
      '::1             localhost',
      '0.0.0.0         ads.example.com',
      '0.0.0.0         tracker.io        # analytics tracker',
      '127.0.0.1       malware.bad.com',
      '255.255.255.255 broadcasthost',
    ].join('\n')
    const result = parseWindowsHosts(input)
    expect(result).toHaveLength(3)
    expect(result).toContain('ads.example.com')
    expect(result).toContain('tracker.io')
    expect(result).toContain('malware.bad.com')
  })
})
