import { isValidDomain } from '@/lib/domain-validator'

/**
 * DNSCloak — iOS/macOS DNS proxy için kural formatı.
 *
 * Format: Satır başına bir domain veya `*.domain.com` wildcard.
 * Yorum satırları: `#` veya `//` ile başlar.
 *
 * DNSCloak listeleri çoğunlukla "plain domain" formatına yakındır;
 * wildcard prefix varsa base domain çıkarılır.
 */

const LINE_REGEX = /^(\*\.)?([a-z0-9][a-z0-9.-]*\.[a-z]{2,})$/i

export function parseDNSCloak(content: string): string[] {
  const seen = new Set<string>()

  for (const raw of content.split('\n')) {
    try {
      const line = raw.trim()
      if (!line) continue
      if (line.startsWith('#') || line.startsWith('//') || line.startsWith('!')) continue

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
