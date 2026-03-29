import { isValidDomain } from '@/lib/domain-validator'

/**
 * Bind9 — RPZ (Response Policy Zone) formatı.
 *
 * Desteklenen kayıt formatları:
 *   `domain.com     CNAME .`          → engelle (RPZ NXDOMAIN)
 *   `domain.com     A     0.0.0.0`    → sinkhole
 *   `domain.com.    CNAME .`          → FQDN (trailing nokta kaldırılır)
 *   `domain.com  IN CNAME .`          → IN sınıfı ile
 *
 * Atlananlar:
 *   - `;` ile başlayan yorum satırları
 *   - `$TTL`, `$ORIGIN` gibi direktifler
 *   - `@` ile başlayan SOA/NS kayıtları
 *   - TLD tek etiketli adlar
 */

// domain [IN] CNAME|A|AAAA kayıt kalıbı
const RECORD_REGEX =
  /^([a-z0-9*][a-z0-9.-]*\.[a-z]{2,}\.?)\s+(?:IN\s+)?(?:CNAME|A|AAAA)\s+/i

export function parseBind9(content: string): string[] {
  const seen = new Set<string>()

  for (const raw of content.split('\n')) {
    try {
      const line = raw.trim()
      if (!line) continue
      if (line.startsWith(';') || line.startsWith('$') || line.startsWith('@')) continue

      const match = line.match(RECORD_REGEX)
      if (!match) continue

      // FQDN trailing nokta varsa kaldır
      let domain = match[1].toLowerCase()
      if (domain.endsWith('.')) domain = domain.slice(0, -1)
      // Wildcard prefix *. varsa çıkar, base domain al
      if (domain.startsWith('*.')) domain = domain.slice(2)

      if (!isValidDomain(domain)) continue

      seen.add(domain)
    } catch {
      // bozuk satırı sessizce atla
    }
  }

  return [...seen]
}
