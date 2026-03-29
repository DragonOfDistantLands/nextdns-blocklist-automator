import { describe, it, expect } from 'vitest'
import { parseUBlock } from '../ublock'

describe('parseUBlock', () => {
  it('||domain^ formatını işler', () => {
    expect(parseUBlock('||ads.example.com^')).toContain('ads.example.com')
  })

  it('||domain^$seçenekler formatını işler', () => {
    expect(parseUBlock('||tracker.io^$third-party')).toContain('tracker.io')
  })

  it('||domain^$important formatını işler', () => {
    expect(parseUBlock('||malware.com^$important')).toContain('malware.com')
  })

  it('! ile başlayan yorum satırını atlar', () => {
    const input = '! Bu bir yorum\n||ads.example.com^'
    expect(parseUBlock(input)).toEqual(['ads.example.com'])
  })

  it('# ile başlayan yorum satırını atlar', () => {
    const input = '# comment\n||ads.example.com^'
    expect(parseUBlock(input)).toEqual(['ads.example.com'])
  })

  it('@@ ile başlayan exception kuralını atlar', () => {
    const input = '@@||safe.example.com^\n||ads.example.com^'
    const result = parseUBlock(input)
    expect(result).not.toContain('safe.example.com')
    expect(result).toContain('ads.example.com')
  })

  it('## kozmetik filtre satırını atlar', () => {
    const input = '##.ad-banner\n||ads.example.com^'
    expect(parseUBlock(input)).toEqual(['ads.example.com'])
  })

  it('#?# kozmetik filtre satırını atlar', () => {
    const input = 'example.com#?#.ad\n||ads.example.com^'
    expect(parseUBlock(input)).toEqual(['ads.example.com'])
  })

  it('boş satırları atlar', () => {
    const input = '\n||ads.example.com^\n\n'
    expect(parseUBlock(input)).toEqual(['ads.example.com'])
  })

  it('|| olmayan URL kuralını atlar', () => {
    const input = '/ads/*\n||ads.example.com^'
    expect(parseUBlock(input)).toEqual(['ads.example.com'])
  })

  it('tekrarlayan domainleri tekilleştirir', () => {
    const input = '||ads.example.com^\n||ads.example.com^$third-party'
    expect(parseUBlock(input)).toEqual(['ads.example.com'])
  })

  it('büyük harfli domain küçük harfe çevirir', () => {
    expect(parseUBlock('||ADS.EXAMPLE.COM^')).toContain('ads.example.com')
  })

  it('boş içerik için boş dizi döndürür', () => {
    expect(parseUBlock('')).toEqual([])
  })

  it('gerçekçi uBlock listesini doğru işler', () => {
    const input = [
      '! uBlock Origin filter list',
      '! Version: 2026.01.15',
      '!',
      '||ads.example.com^',
      '||tracker.io^$third-party',
      '@@||safe.example.com^',
      '##.ad-banner',
      '||malware.evil.com^$document',
      '||cdn.ads.net^',
    ].join('\n')
    const result = parseUBlock(input)
    expect(result).toHaveLength(4)
    expect(result).toContain('ads.example.com')
    expect(result).toContain('tracker.io')
    expect(result).toContain('malware.evil.com')
    expect(result).toContain('cdn.ads.net')
    expect(result).not.toContain('safe.example.com')
  })

  // ── Bulldozer (garbage tolerance) testleri ───────────────────
  it('çöp metin ve HTML içerikten geçerli uBlock kurallarını sessizce ayıklar', () => {
    const input = [
      '<!DOCTYPE html><html><body>404 Not Found</body></html>',
      '=====================================',
      'GARBAGE RANDOM TEXT @#$%',
      '',
      '! Real filter list starts',
      '||ads.example.com^',
      '0.0.0.0 hosts.format.com',     // farklı format → atlanır
      '||tracker.io^$third-party',
      'plain.domain.com',              // düz domain → atlanır
      '||malware.bad.com^',
    ].join('\n')
    const result = parseUBlock(input)
    expect(result).toHaveLength(3)
    expect(result).toContain('ads.example.com')
    expect(result).toContain('tracker.io')
    expect(result).toContain('malware.bad.com')
  })
})
