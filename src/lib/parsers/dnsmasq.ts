import { isValidDomain } from '@/lib/domain-validator'

/**
 * dnsmasq — küçük ağlar için DNS/DHCP sunucu konfigürasyonu.
 *
 * Desteklenen formatlar:
 *   `address=/domain.com/0.0.0.0`    → sinkhole'a yönlendir
 *   `address=/domain.com/`           → NXDOMAIN döndür
 *   `server=/domain.com/#`           → upstream'e ilet
 *   `local=/domain.com/0.0.0.0`      → Hagezi ve benzeri listelerde kullanılır
 *
 * Yorum: `#` ile başlayan satırlar atlanır.
 *
 * Bulldozer mimarisi: formata uymayan her satır sessizce atlanır.
 */

// address=/domain/, server=/domain/ veya local=/domain/ kalıbı
const LINE_REGEX = /^(?:address|server|local)=\/([a-z0-9][a-z0-9.-]*\.[a-z]{2,})\//i

export function parseDnsmasq(content: string): string[] {
  const seen = new Set<string>()

  for (const raw of content.split('\n')) {
    try {
      const line = raw.trim()
      if (!line || line.startsWith('#')) continue

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
