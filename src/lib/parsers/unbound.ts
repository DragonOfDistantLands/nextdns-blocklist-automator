import { isValidDomain } from '@/lib/domain-validator'

/**
 * Unbound — güvenlik odaklı DNS çözümleyici konfigürasyonu.
 *
 * Desteklenen direktifler:
 *   `local-zone: "domain.com" always_nxdomain`
 *   `local-zone: "domain.com." refuse`
 *   `local-data: "domain.com A 0.0.0.0"`
 *   `local-data: "domain.com. AAAA ::"`
 *
 * Yorum: `#` ile başlayan satırlar ve `server:` gibi bölüm başlıkları atlanır.
 * FQDN trailing nokta varsa kaldırılır.
 */

const LOCAL_ZONE_REGEX = /local-zone:\s+"([a-z0-9][a-z0-9.-]*\.[a-z]{2,}\.?)"/i
const LOCAL_DATA_REGEX = /local-data:\s+"([a-z0-9][a-z0-9.-]*\.[a-z]{2,}\.?)\s+/i

export function parseUnbound(content: string): string[] {
  const seen = new Set<string>()

  for (const raw of content.split('\n')) {
    try {
      const line = raw.trim()
      if (!line || line.startsWith('#')) continue

      let domain: string | null = null

      const zoneMatch = line.match(LOCAL_ZONE_REGEX)
      if (zoneMatch) {
        domain = zoneMatch[1].toLowerCase()
      } else {
        const dataMatch = line.match(LOCAL_DATA_REGEX)
        if (dataMatch) {
          domain = dataMatch[1].toLowerCase()
        }
      }

      if (!domain) continue

      // FQDN trailing nokta kaldır
      if (domain.endsWith('.')) domain = domain.slice(0, -1)
      if (!isValidDomain(domain)) continue

      seen.add(domain)
    } catch {
      // bozuk satırı sessizce atla
    }
  }

  return [...seen]
}
