import type { BlocklistFormat } from '@/types/blocklist'
import type { ParserFunction, ParserRegistry } from './types'

// ── Orijinal parser'lar ───────────────────────────────────────────
export { parseAdAway }          from './adaway'
export { parsePihole }          from './pihole'
export { parseDnscrypt }        from './dnscrypt'
export { parseUBlock }          from './ublock'
export { parseDNSCloak }        from './dnscloak'
export { parseDnsmasq }         from './dnsmasq'
export { parseBind9 }           from './bind9'
export { parseUnbound }         from './unbound'
export { parseWindowsHosts }    from './windows-hosts'
export { parsePlain }           from './plain'
// ── Yeni parser'lar ───────────────────────────────────────────────
export { parseHostsCompressed } from './hosts-compressed'
export { parseWildcardAsterisk } from './wildcard-asterisk'

import { parseAdAway }          from './adaway'
import { parsePihole }          from './pihole'
import { parseDnscrypt }        from './dnscrypt'
import { parseUBlock }          from './ublock'
import { parseDNSCloak }        from './dnscloak'
import { parseDnsmasq }         from './dnsmasq'
import { parseBind9 }           from './bind9'
import { parseUnbound }         from './unbound'
import { parseWindowsHosts }    from './windows-hosts'
import { parsePlain }           from './plain'
import { parseHostsCompressed } from './hosts-compressed'
import { parseWildcardAsterisk } from './wildcard-asterisk'

const PARSERS: ParserRegistry = {
  // ── Orijinal formatlar ──────────────────────────────────────────
  adaway:           parseAdAway,
  pihole:           parsePihole,
  dnscrypt:         parseDnscrypt,
  ublock:           parseUBlock,
  dnscloak:         parseDNSCloak,
  dnsmasq:          parseDnsmasq,
  bind9:            parseBind9,
  unbound:          parseUnbound,
  'windows-hosts':  parseWindowsHosts,
  plain:            parsePlain,
  // ── Yeni parser'lar ─────────────────────────────────────────────
  'hosts-compressed':   parseHostsCompressed,
  'wildcard-asterisk':  parseWildcardAsterisk,
  // ── Alias'lar (farklı isimler, aynı parser mantığı) ─────────────
  domains:          parsePlain,           // plain ile özdeş
  subdomains:       parsePlain,           // plain ile özdeş
  hosts:            parseWindowsHosts,   // windows-hosts ile özdeş
  adblock:          parseUBlock,         // uBlock Origin ile özdeş
  'wildcard-domains': parseDNSCloak,     // dnscloak ile özdeş (karma format)
  rpz:              parseBind9,          // Bind9 RPZ ile özdeş
}

/**
 * Verilen ham içeriği belirtilen formata göre ayrıştırır.
 * Benzersiz, geçerli domain listesi döndürür.
 */
export function parseBlocklist(
  content: string,
  format: BlocklistFormat,
): string[] {
  const parser: ParserFunction = PARSERS[format]
  return parser(content)
}
