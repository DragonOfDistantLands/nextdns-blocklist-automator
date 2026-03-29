import { describe, it, expect } from 'vitest'
import { parseAdAway } from '../adaway'

describe('parseAdAway', () => {
  it('127.0.0.1 formatından domain çıkarır', () => {
    const input = '127.0.0.1 ads.example.com'
    expect(parseAdAway(input)).toContain('ads.example.com')
  })

  it('0.0.0.0 formatından domain çıkarır', () => {
    const input = '0.0.0.0 tracker.io'
    expect(parseAdAway(input)).toContain('tracker.io')
  })

  it('birden fazla boşlukla ayrılmış satırı işler', () => {
    const input = '127.0.0.1  ads.example.com'
    expect(parseAdAway(input)).toContain('ads.example.com')
  })

  it('tab ile ayrılmış satırı işler', () => {
    const input = '0.0.0.0\tads.example.com'
    expect(parseAdAway(input)).toContain('ads.example.com')
  })

  it('yorum satırlarını (#) atlar', () => {
    const input = '# Bu bir yorum\n127.0.0.1 ads.example.com'
    const result = parseAdAway(input)
    expect(result).not.toContain('bu')
    expect(result).toContain('ads.example.com')
  })

  it('boş satırları atlar', () => {
    const input = '\n\n127.0.0.1 ads.example.com\n\n'
    expect(parseAdAway(input)).toEqual(['ads.example.com'])
  })

  it('localhost atlar', () => {
    const input = '127.0.0.1 localhost'
    expect(parseAdAway(input)).not.toContain('localhost')
  })

  it('broadcasthost atlar', () => {
    const input = '255.255.255.255 broadcasthost'
    expect(parseAdAway(input)).not.toContain('broadcasthost')
  })

  it('::1 atlar', () => {
    const input = '127.0.0.1 ::1'
    expect(parseAdAway(input)).toHaveLength(0)
  })

  it('domain büyük harfle yazılsa da küçük harfe çevirir', () => {
    const input = '0.0.0.0 ADS.EXAMPLE.COM'
    expect(parseAdAway(input)).toContain('ads.example.com')
  })

  it('tekrarlanan domainleri tekilleştirir', () => {
    const input = '0.0.0.0 ads.example.com\n127.0.0.1 ads.example.com'
    expect(parseAdAway(input)).toEqual(['ads.example.com'])
  })

  it('geçersiz IP prefix olan satırı atlar', () => {
    const input = '192.168.1.1 router.local'
    expect(parseAdAway(input)).toHaveLength(0)
  })

  it('satır sonu yorum içeren satırı doğru işler', () => {
    // Satır sonu yorumu (#) domain'den sonra yer alırsa atlanmalı
    // Line: "0.0.0.0 ads.example.com # reklam sunucusu"
    // Regex [^\s#]+ ile yorumu zaten dışlar
    const input = '0.0.0.0 ads.example.com # reklam sunucusu'
    expect(parseAdAway(input)).toContain('ads.example.com')
  })

  it('boş içerik için boş dizi döndürür', () => {
    expect(parseAdAway('')).toEqual([])
  })

  it('çoklu geçerli satırı işler', () => {
    const input = [
      '# AdAway list',
      '127.0.0.1 ads.example.com',
      '0.0.0.0 tracker.io',
      '127.0.0.1 malware.bad.com',
      '127.0.0.1 localhost',
    ].join('\n')
    const result = parseAdAway(input)
    expect(result).toHaveLength(3)
    expect(result).toContain('ads.example.com')
    expect(result).toContain('tracker.io')
    expect(result).toContain('malware.bad.com')
  })

  // ── Bulldozer (garbage tolerance) testleri ───────────────────
  it('çöp metin ve HTML içerikten geçerli satırları sessizce ayıklar', () => {
    const input = [
      '<!DOCTYPE html>',
      '<html><head><title>403 Forbidden</title></head>',
      '<body><h1>You are not allowed to access this file.</h1></body>',
      '</html>',
      '==============================',
      '!!! HATA !!! @#$%^&*()',
      'COMPLETELY RANDOM GARBAGE TEXT',
      '',
      '# Actual AdAway data',
      '127.0.0.1 ads.example.com',
      'NOT A VALID LINE AT ALL 123 ???',
      '0.0.0.0 tracker.io',
      '   whitespace only   ',
      '127.0.0.1 malware.bad.com',
    ].join('\n')
    const result = parseAdAway(input)
    expect(result).toHaveLength(3)
    expect(result).toContain('ads.example.com')
    expect(result).toContain('tracker.io')
    expect(result).toContain('malware.bad.com')
  })

  it('50 satır yorum/lisans metni önekiyle doğru çalışır', () => {
    const preamble = Array.from({ length: 50 }, (_, i) =>
      `# Lisans satırı ${i + 1}: Bu dosya Creative Commons lisansı altındadır.`
    ).join('\n')
    const data = '127.0.0.1 ads.example.com\n0.0.0.0 tracker.io'
    const result = parseAdAway(preamble + '\n' + data)
    expect(result).toHaveLength(2)
    expect(result).toContain('ads.example.com')
    expect(result).toContain('tracker.io')
  })
})
