import { isValidDomain } from '@/lib/domain-validator'

/**
 * Hosts Compressed — tek satırda birden fazla domain (Hagezi ve benzer listeler).
 *
 * Format: `0.0.0.0 domain1.com domain2.com domain3.com`
 *         `127.0.0.1 ads.example.com tracker.io cdn.ads.net`
 *
 * IP prefix (0.0.0.0 veya 127.0.0.1) zorunlu; ardından boşlukla ayrılmış
 * sıfır ya da daha fazla hostname gelebilir.
 * Satır içi yorum (#) ile başlayan token'dan itibaren satırın geri kalanı atlanır.
 */

const LINE_START_REGEX = /^(?:127\.0\.0\.1|0\.0\.0\.0)\s+(.*)/

const RESERVED = new Set([
  'localhost',
  'broadcasthost',
  'local',
  '0.0.0.0',
  '127.0.0.1',
  '::1',
  'ip6-localhost',
  'ip6-loopback',
])

export function parseHostsCompressed(content: string): string[] {
  const seen = new Set<string>()

  for (const raw of content.split('\n')) {
    try {
      const line = raw.trim()
      if (!line || line.startsWith('#')) continue

      const match = line.match(LINE_START_REGEX)
      if (!match) continue

      const rest = match[1]
      for (const token of rest.split(/\s+/)) {
        if (!token) continue
        // Satır içi yorum başlangıcı — geri kalanı atla
        if (token.startsWith('#')) break

        const domain = token.toLowerCase()
        if (RESERVED.has(domain)) continue
        if (!isValidDomain(domain)) continue
        seen.add(domain)
      }
    } catch {
      // bozuk satırı sessizce atla
    }
  }

  return [...seen]
}
