import { describe, it, expect } from 'vitest'
import { parseBlocklist } from '../index'

describe('parseBlocklist (entegrasyon)', () => {
  // ── Orijinal format yönlendirme testleri ─────────────────────
  it('adaway formatını doğru parser ile yönlendirir', () => {
    expect(parseBlocklist('127.0.0.1 ads.example.com', 'adaway'))
      .toContain('ads.example.com')
  })

  it('pihole formatını doğru parser ile yönlendirir', () => {
    expect(parseBlocklist('0.0.0.0 ads.example.com', 'pihole'))
      .toContain('ads.example.com')
  })

  it('dnscrypt formatını doğru parser ile yönlendirir', () => {
    expect(parseBlocklist('ads.example.com 0.0.0.0', 'dnscrypt'))
      .toContain('ads.example.com')
  })

  it('ublock formatını doğru parser ile yönlendirir', () => {
    expect(parseBlocklist('||ads.example.com^', 'ublock'))
      .toContain('ads.example.com')
  })

  it('dnscloak formatını doğru parser ile yönlendirir', () => {
    expect(parseBlocklist('ads.example.com', 'dnscloak'))
      .toContain('ads.example.com')
  })

  it('dnsmasq formatını doğru parser ile yönlendirir', () => {
    expect(parseBlocklist('address=/ads.example.com/0.0.0.0', 'dnsmasq'))
      .toContain('ads.example.com')
  })

  it('bind9 formatını doğru parser ile yönlendirir', () => {
    expect(parseBlocklist('ads.example.com CNAME .', 'bind9'))
      .toContain('ads.example.com')
  })

  it('unbound formatını doğru parser ile yönlendirir', () => {
    expect(parseBlocklist('local-zone: "ads.example.com" refuse', 'unbound'))
      .toContain('ads.example.com')
  })

  it('windows-hosts formatını doğru parser ile yönlendirir', () => {
    expect(parseBlocklist('0.0.0.0 ads.example.com', 'windows-hosts'))
      .toContain('ads.example.com')
  })

  it('plain formatını doğru parser ile yönlendirir', () => {
    expect(parseBlocklist('ads.example.com', 'plain'))
      .toContain('ads.example.com')
  })

  // ── Yeni format yönlendirme testleri (alias) ─────────────────
  it('domains formatını plain gibi işler', () => {
    expect(parseBlocklist('ads.example.com', 'domains'))
      .toContain('ads.example.com')
  })

  it('subdomains formatını plain gibi işler', () => {
    expect(parseBlocklist('sub.ads.example.com', 'subdomains'))
      .toContain('sub.ads.example.com')
  })

  it('hosts formatını windows-hosts gibi işler', () => {
    expect(parseBlocklist('0.0.0.0 ads.example.com', 'hosts'))
      .toContain('ads.example.com')
  })

  it('adblock formatını ublock gibi işler', () => {
    expect(parseBlocklist('||ads.example.com^', 'adblock'))
      .toContain('ads.example.com')
  })

  it('wildcard-domains formatını dnscloak gibi işler (karma liste)', () => {
    const input = '*.ads.example.com\ntracker.io'
    const result = parseBlocklist(input, 'wildcard-domains')
    expect(result).toContain('ads.example.com')
    expect(result).toContain('tracker.io')
  })

  it('rpz formatını bind9 gibi işler', () => {
    expect(parseBlocklist('ads.example.com CNAME .', 'rpz'))
      .toContain('ads.example.com')
  })

  // ── Gerçek yeni parser testleri ──────────────────────────────
  it('hosts-compressed formatını doğru parser ile yönlendirir', () => {
    const input = '0.0.0.0 ads.example.com tracker.io cdn.ads.net'
    const result = parseBlocklist(input, 'hosts-compressed')
    expect(result).toContain('ads.example.com')
    expect(result).toContain('tracker.io')
    expect(result).toContain('cdn.ads.net')
  })

  it('wildcard-asterisk formatını doğru parser ile yönlendirir', () => {
    const input = '*.ads.example.com\n*.tracker.io'
    const result = parseBlocklist(input, 'wildcard-asterisk')
    expect(result).toContain('ads.example.com')
    expect(result).toContain('tracker.io')
  })

  it('dnsmasq local= formatını işler', () => {
    expect(parseBlocklist('local=/ads.hagezi.com/0.0.0.0', 'dnsmasq'))
      .toContain('ads.hagezi.com')
  })

  // ── Genel testler ─────────────────────────────────────────────
  it('tüm formatlar için benzersiz domain listesi döndürür', () => {
    const result = parseBlocklist(
      '||ads.example.com^\n||ads.example.com^\n||tracker.io^',
      'ublock',
    )
    expect(result).toHaveLength(2)
  })

  it('boş içerik için tüm formatlar boş dizi döndürür', () => {
    const formats = [
      'adaway', 'pihole', 'dnscrypt', 'ublock', 'dnscloak', 'dnsmasq',
      'bind9', 'unbound', 'windows-hosts', 'plain', 'domains', 'subdomains',
      'hosts', 'hosts-compressed', 'adblock', 'wildcard-asterisk',
      'wildcard-domains', 'rpz',
    ] as const
    for (const format of formats) {
      expect(parseBlocklist('', format)).toEqual([])
    }
  })
})
