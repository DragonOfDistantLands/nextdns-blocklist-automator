import { isValidDomain } from '@/lib/domain-validator'

/**
 * AdAway — Android için hosts formatı.
 *
 * Format: `127.0.0.1  domain.com`  veya  `0.0.0.0  domain.com`
 * Satır sonu yorumları (#) desteklenir.
 * "localhost", "broadcasthost", "::1", "local" gibi özel adlar atlanır.
 */

const LINE_REGEX = /^(?:127\.0\.0\.1|0\.0\.0\.0)\s+([^\s#]+)/

const RESERVED = new Set([
  'localhost',
  'broadcasthost',
  'local',
  '::1',
  'ip6-localhost',
  'ip6-loopback',
])

export function parseAdAway(content: string): string[] {
  const seen = new Set<string>()

  for (const raw of content.split('\n')) {
    try {
      const line = raw.trim()
      if (!line || line.startsWith('#')) continue

      const match = line.match(LINE_REGEX)
      if (!match) continue

      const domain = match[1].toLowerCase()
      if (RESERVED.has(domain)) continue
      if (!isValidDomain(domain)) continue

      seen.add(domain)
    } catch {
      // bozuk satırı sessizce atla
    }
  }

  return [...seen]
}
