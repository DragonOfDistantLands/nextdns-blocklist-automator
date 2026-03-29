import { isValidDomain } from '@/lib/domain-validator'

/**
 * dnscrypt-proxy — cloaking/blocking kuralları.
 *
 * Format: `domain.com  0.0.0.0`  (tab veya boşlukla ayrılmış IP)
 *         `*.wildcard.com  0.0.0.0`  (wildcard prefix)
 *
 * Wildcard (*.) ile başlayan satırlarda base domain çıkarılır.
 * Sadece IP adresiyle eşleşen (hedefli) satırlar işlenir; yorum (#) atlanır.
 */

// domain [tab/space] ip — isteğe bağlı wildcard prefix
const LINE_REGEX = /^(\*\.)?([a-z0-9][a-z0-9.-]*\.[a-z]{2,})\s+\S/i

export function parseDnscrypt(content: string): string[] {
  const seen = new Set<string>()

  for (const raw of content.split('\n')) {
    try {
      const line = raw.trim()
      if (!line || line.startsWith('#')) continue

      const match = line.match(LINE_REGEX)
      if (!match) continue

      const domain = match[2].toLowerCase()
      if (!isValidDomain(domain)) continue

      seen.add(domain)
    } catch {
      // bozuk satırı sessizce atla
    }
  }

  return [...seen]
}
