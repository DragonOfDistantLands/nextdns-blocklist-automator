import { isValidDomain } from '@/lib/domain-validator'

/**
 * Wildcard Asterisk — yalnızca `*.domain.com` biçiminde joker kurallar.
 *
 * Format: `*.ads.example.com`
 *
 * Joker prefix `*.` çıkarılır, base domain çıkarılarak listeye eklenir.
 * Joker prefix OLMAYAN düz domain satırları bu formatın kuralı değildir; atlanır.
 * Yorum satırları: `#`, `//`, `!` ile başlayanlar atlanır.
 *
 * Gerçek dünya örneği: Hagezi Wildcardonly listeleri.
 */

const LINE_REGEX = /^\*\.([a-z0-9][a-z0-9.-]*\.[a-z]{2,})$/i

export function parseWildcardAsterisk(content: string): string[] {
  const seen = new Set<string>()

  for (const raw of content.split('\n')) {
    try {
      const line = raw.trim()
      if (!line) continue
      if (line.startsWith('#') || line.startsWith('//') || line.startsWith('!')) continue

      const match = line.match(LINE_REGEX)
      if (!match) continue

      const domain = match[1].toLowerCase()
      if (!isValidDomain(domain)) continue
      seen.add(domain)
    } catch {
      // bozuk satırı sessizce atla
    }
  }

  return [...seen]
}
