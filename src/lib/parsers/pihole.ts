import { isValidDomain } from '@/lib/domain-validator'

/**
 * Pi-hole / OpenSnitch — hosts formatı, satır içi yorum destekli.
 *
 * Format: `0.0.0.0 domain.com [# isteğe bağlı yorum]`
 *         `127.0.0.1 domain.com`
 *
 * Pi-hole'un oluşturduğu listelerde "0.0.0.0 0.0.0.0" gibi kendi IP'si
 * de yer alabilir; bunlar da filtrelenir.
 */

const LINE_REGEX = /^(?:0\.0\.0\.0|127\.0\.0\.1)\s+([^\s#]+)/

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

export function parsePihole(content: string): string[] {
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
