// Blocklist ve format tip tanımları

export type BlocklistFormat =
  // Orijinal formatlar
  | 'adaway'
  | 'pihole'
  | 'dnscrypt'
  | 'ublock'
  | 'dnscloak'
  | 'dnsmasq'
  | 'bind9'
  | 'unbound'
  | 'windows-hosts'
  | 'plain'
  // Yeni formatlar
  | 'domains'
  | 'subdomains'
  | 'hosts'
  | 'hosts-compressed'
  | 'adblock'
  | 'wildcard-asterisk'
  | 'wildcard-domains'
  | 'rpz'

export interface FormatOption {
  value: BlocklistFormat
  label: string
  description: string
  exampleLine: string
}

export const FORMAT_OPTIONS: FormatOption[] = [
  // ── Hosts tabanlı formatlar ───────────────────────────────────
  {
    value: 'adaway',
    label: 'AdAway',
    description: 'Android hosts formatı (127.0.0.1 domain)',
    exampleLine: '127.0.0.1 ads.example.com',
  },
  {
    value: 'pihole',
    label: 'Pi-hole / OpenSnitch',
    description: 'Pi-hole hosts formatı (0.0.0.0 domain)',
    exampleLine: '0.0.0.0 ads.example.com # comment',
  },
  {
    value: 'hosts',
    label: 'Hosts',
    description: 'Genel hosts dosyası (Windows/Linux/macOS)',
    exampleLine: '0.0.0.0 ads.example.com',
  },
  {
    value: 'hosts-compressed',
    label: 'Hosts Compressed',
    description: 'Tek satırda birden fazla domain (Hagezi benzeri)',
    exampleLine: '0.0.0.0 ads.example.com tracker.io cdn.ads.net',
  },
  {
    value: 'windows-hosts',
    label: 'Windows Hosts (Klasik)',
    description: 'Windows/Linux hosts dosyası — tekli domain',
    exampleLine: '0.0.0.0 ads.example.com',
  },
  // ── DNS sunucu konfigürasyonu ─────────────────────────────────
  {
    value: 'dnsmasq',
    label: 'dnsmasq',
    description: 'dnsmasq address/server/local direktifleri',
    exampleLine: 'address=/ads.example.com/0.0.0.0',
  },
  {
    value: 'dnscrypt',
    label: 'dnscrypt-proxy',
    description: 'dnscrypt cloaking kuralları',
    exampleLine: 'ads.example.com  0.0.0.0',
  },
  {
    value: 'unbound',
    label: 'Unbound',
    description: 'Unbound local-zone direktifleri',
    exampleLine: 'local-zone: "ads.example.com" always_nxdomain',
  },
  {
    value: 'bind9',
    label: 'Bind9',
    description: 'BIND9 RPZ zone formatı',
    exampleLine: 'ads.example.com CNAME .',
  },
  {
    value: 'rpz',
    label: 'RPZ (Response Policy Zone)',
    description: 'DNS RPZ kayıt formatı — Bind9 uyumlu',
    exampleLine: 'ads.example.com CNAME .',
  },
  // ── Adblock / filtre sözdizimi ────────────────────────────────
  {
    value: 'ublock',
    label: 'uBlock Origin',
    description: 'Adblock Plus filtre sözdizimi',
    exampleLine: '||ads.example.com^',
  },
  {
    value: 'adblock',
    label: 'Adblock Plus',
    description: 'Adblock Plus / uBlock Origin filtre sözdizimi',
    exampleLine: '||ads.example.com^',
  },
  // ── Düz domain listeleri ──────────────────────────────────────
  {
    value: 'plain',
    label: 'Plain Domains',
    description: 'Düz domain listesi (her satırda bir domain)',
    exampleLine: 'ads.example.com',
  },
  {
    value: 'domains',
    label: 'Domains',
    description: 'Her satırda tek domain — plain format',
    exampleLine: 'ads.example.com',
  },
  {
    value: 'subdomains',
    label: 'Subdomains',
    description: 'Alt-domain odaklı düz liste',
    exampleLine: 'sub.ads.example.com',
  },
  {
    value: 'dnscloak',
    label: 'DNSCloak',
    description: 'iOS/macOS DNS proxy kuralları',
    exampleLine: 'ads.example.com',
  },
  // ── Wildcard formatlar ────────────────────────────────────────
  {
    value: 'wildcard-asterisk',
    label: 'Wildcard Asterisk',
    description: 'Yalnızca *.domain.com joker kuralları',
    exampleLine: '*.ads.example.com',
  },
  {
    value: 'wildcard-domains',
    label: 'Wildcard Domains',
    description: '*.domain.com ve düz domain karışık liste',
    exampleLine: '*.ads.example.com',
  },
]

export interface FormData {
  apiKey: string
  profileId: string
  blocklistUrl: string
  format: BlocklistFormat
}

export interface ProcessingStats {
  total: number
  success: number
  error: number
  skipped: number
  progressPercent: number
}
