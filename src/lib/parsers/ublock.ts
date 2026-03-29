import { isValidDomain } from '@/lib/domain-validator'

/**
 * uBlock Origin — Adblock Plus filtre sözdizimi.
 *
 * Geçerli domain kuralı:  `||domain.com^`  veya  `||domain.com^$seçenekler`
 *
 * Atlananlar:
 *  - Yorum satırları: `!` veya `#` ile başlayanlar
 *  - Exception kuralları: `@@` ile başlayanlar
 *  - Kozmetik filtreler: `##`, `#?#`, `#@#` içerenler
 *  - Element gizleme / script inject vb.: `$script`, `$css` vb.
 *  - Sadece path/query parametreli kurallar (|| içermeyen URL kalıpları)
 */

// ||domain.com^ ile başlayan kuralı yakala; ardından ^ gelmeli
const DOMAIN_RULE_REGEX = /^\|\|([a-z0-9][a-z0-9.-]*\.[a-z]{2,})\^/i

export function parseUBlock(content: string): string[] {
  const seen = new Set<string>()

  for (const raw of content.split('\n')) {
    try {
      const line = raw.trim()
      if (!line) continue

      // Yorum satırları
      if (line.startsWith('!') || line.startsWith('#')) continue
      // Exception kuralları
      if (line.startsWith('@@')) continue
      // Kozmetik filtreler
      if (line.includes('##') || line.includes('#?#') || line.includes('#@#')) continue

      const match = line.match(DOMAIN_RULE_REGEX)
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
