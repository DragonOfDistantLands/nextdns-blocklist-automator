import type { Dictionary } from './types'

export const en: Dictionary = {
  localeCode: 'en-US',

  header: {
    title: 'NextDNS Blocklist Automator',
    subtitle: 'Automatically add external lists to your Denylist',
  },

  footer: {
    description: 'NextDNS Blocklist Automator — Open source, free.',
    donate: 'Buy me a coffee ☕',
  },

  donate: {
    buttonLabel: 'Buy me a coffee ☕',
    title: 'Support the Project',
    description:
      'If you find this open-source project useful, consider supporting it with USDT. Please ensure you choose the correct network — funds sent to the wrong network may be lost permanently.',
    copy: 'Copy',
    copied: 'Copied!',
    networks: {
      bsc: 'USDT (BEP20 / BSC)',
      sol: 'USDT (Solana / SPL)',
    },
    warning: 'Always double-check the network before sending.',
  },

  hero: {
    badge: 'Open Source & Free',
    title: 'Add Blocklist',
    description:
      'Automatically add external domain blocklists not included in NextDNS defaults to your Denylist using your API key.',
  },

  form: {
    cardTitle: 'Connection Details',
    cardDescription:
      'Enter your NextDNS API key and target profile ID, then specify the blocklist URL and its format.',
    apiKey: {
      label: 'NextDNS API Key',
      tooltip:
        'Go to my.nextdns.io → Profile icon (top right) → Account → API section.',
      hide: 'Hide key',
      show: 'Show key',
    },
    profileId: {
      label: 'Profile ID',
      tooltip:
        'The URL at my.nextdns.io looks like: my.nextdns.io/abc123/setup — the 6-character segment shown in bold is your Profile ID.',
    },
    url: {
      label: 'Blocklist URL',
      placeholder: 'https://example.com/blocklist.txt',
      hint: 'Enter the full URL of the .txt file containing the raw domain list.',
    },
    format: {
      label: 'Source Format',
      placeholder: 'Select format...',
      descriptions: {
        adaway: 'Android hosts format (127.0.0.1 domain)',
        pihole: 'Pi-hole hosts format (0.0.0.0 domain)',
        hosts: 'Generic hosts file (Windows/Linux/macOS)',
        'hosts-compressed': 'Multiple domains per line (Hagezi-style)',
        'windows-hosts': 'Windows/Linux hosts file — single domain per line',
        dnsmasq: 'dnsmasq address/server/local directives',
        dnscrypt: 'dnscrypt cloaking rules',
        unbound: 'Unbound local-zone directives',
        bind9: 'BIND9 RPZ zone format',
        rpz: 'DNS RPZ record format — Bind9 compatible',
        ublock: 'Adblock Plus filter syntax',
        adblock: 'Adblock Plus / uBlock Origin filter syntax',
        plain: 'Plain domain list (one per line)',
        domains: 'One domain per line — plain format',
        subdomains: 'Subdomain-focused plain list',
        dnscloak: 'iOS/macOS DNS proxy rules',
        'wildcard-asterisk': 'Wildcard-only *.domain.com rules',
        'wildcard-domains': 'Mixed *.domain.com and plain domains',
      },
    },
    actions: {
      start: 'Start',
      stop: 'Stop',
      restart: 'Restart',
    },
    processing: {
      fetching: 'Fetching URL...',
      parsing: 'Parsing...',
      pushing: 'Sending to NextDNS...',
    },
  },

  validation: {
    apiKeyRequired: 'API key is required.',
    profileIdRequired: 'Profile ID is required.',
    urlRequired: 'Blocklist URL is required.',
    urlInvalidProtocol: 'Only http and https URLs are allowed.',
    urlInvalid: 'Enter a valid URL (https://...).',
  },

  progress: {
    panelTitle: 'Live Progress',
    status: {
      idle: 'Idle',
      fetching: 'Fetching URL...',
      parsing: 'Parsing...',
      pushing: 'Sending to NextDNS...',
      done: 'Completed',
      aborted: 'Cancelled',
    },
    stats: {
      total: 'Total',
      added: 'Added',
      existing: 'Existing',
      error: 'Error',
    },
    progressLabel: 'Progress',
    waiting: 'Waiting...',
  },
}
