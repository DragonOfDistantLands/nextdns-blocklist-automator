import { isValidDomain } from '@/lib/domain-validator'

/**
 * Windows / Linux Hosts dosyası formatı.
 *
 * Format: `IP_ADRESI  hostname  [# yorum]`
 * IPv4 (1.2.3.4) ve IPv6 (::1, fe80::...) ile başlayan satırlar işlenir.
 *
 * Atlananlar:
 *   - `localhost`, `broadcasthost`, `ip6-localhost` vb. sistem isimleri
 *   - Tek etiketli adlar (nokta içermeyen)
 *   - IP adreslerinin kendisi (hostname sütununda IP olan satırlar)
 */

// IPv4 veya IPv6 ile başlayan hosts satırı
const IPV4_PREFIX = /^(\d{1,3}\.){3}\d{1,3}\s+/
const IPV6_PREFIX = /^[0-9a-f:]+\s+/i
const LINE_REGEX = /^(?:(?:\d{1,3}\.){3}\d{1,3}|[0-9a-f:]+)\s+([^\s#]+)/i

const RESERVED = new Set([
  'localhost',
  'broadcasthost',
  'local',
  'ip6-localhost',
  'ip6-loopback',
  'ip6-allnodes',
  'ip6-allrouters',
  'ip6-localnet',
  'ip6-mcastprefix',
])

export function parseWindowsHosts(content: string): string[] {
  const seen = new Set<string>()

  for (const raw of content.split('\n')) {
    try {
      const line = raw.trim()
      if (!line || line.startsWith('#')) continue

      // Satır IPv4 veya IPv6 ile başlıyor mu?
      if (!IPV4_PREFIX.test(line) && !IPV6_PREFIX.test(line)) continue

      const match = line.match(LINE_REGEX)
      if (!match) continue

      const hostname = match[1].toLowerCase()

      if (RESERVED.has(hostname)) continue
      // Nokta içermeyen tek etiketleri atla
      if (!hostname.includes('.')) continue

      if (!isValidDomain(hostname)) continue

      seen.add(hostname)
    } catch {
      // bozuk satırı sessizce atla
    }
  }

  return [...seen]
}
