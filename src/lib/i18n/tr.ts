import type { Dictionary } from './types'

export const tr: Dictionary = {
  localeCode: 'tr-TR',

  header: {
    title: 'NextDNS Blocklist Automator',
    subtitle: "Harici listeleri otomatik olarak Denylist'e ekle",
  },

  footer: {
    description: 'NextDNS Blocklist Automator — Açık kaynak, ücretsiz.',
    donate: 'Bir kahve ısmarla ☕',
  },

  donate: {
    buttonLabel: 'Bir kahve ısmarla ☕',
    title: 'Projeye Destek Ol',
    description:
      'Bu açık kaynaklı projeyi faydalı bulduysanız, USDT ile destek olabilirsiniz. Lütfen doğru ağı seçtiğinizden emin olun — yanlış ağa gönderilen fonlar kalıcı olarak kaybolabilir.',
    copy: 'Kopyala',
    copied: 'Kopyalandı!',
    networks: {
      bsc: 'USDT (BEP20 / BSC)',
      sol: 'USDT (Solana / SPL)',
    },
    warning: 'Göndermeden önce ağı mutlaka kontrol edin.',
  },

  hero: {
    badge: 'Açık Kaynak & Ücretsiz',
    title: 'Blocklist Ekle',
    description:
      "NextDNS'in varsayılan listelerinde bulunmayan harici domain engelleyicileri API anahtarınızla otomatik olarak Denylist'e ekleyin.",
  },

  form: {
    cardTitle: 'Bağlantı Bilgileri',
    cardDescription:
      "NextDNS API anahtarınızı ve hedef profil ID'nizi girin, ardından eklemek istediğiniz blocklist URL'sini ve formatını belirtin.",
    apiKey: {
      label: 'NextDNS API Anahtarı',
      tooltip:
        "my.nextdns.io → Sağ üst profil → Account → API bölümünden alınır.",
      hide: 'Anahtarı gizle',
      show: 'Anahtarı göster',
    },
    profileId: {
      label: 'Profil ID',
      tooltip:
        "my.nextdns.io adresinde URL şu formattadır: my.nextdns.io/abc123/setup — koyu yazıyla gösterilen 6 karakterli kısım Profil ID'nizdir.",
    },
    url: {
      label: "Blocklist URL'si",
      placeholder: 'https://example.com/blocklist.txt',
      hint: "Ham domain listesi içeren .txt dosyasının tam URL'sini girin.",
    },
    format: {
      label: 'Kaynak Formatı',
      placeholder: 'Format seçin...',
      descriptions: {
        adaway: 'Android hosts formatı (127.0.0.1 domain)',
        pihole: 'Pi-hole hosts formatı (0.0.0.0 domain)',
        hosts: 'Genel hosts dosyası (Windows/Linux/macOS)',
        'hosts-compressed': 'Tek satırda birden fazla domain (Hagezi benzeri)',
        'windows-hosts': 'Windows/Linux hosts dosyası — tekli domain',
        dnsmasq: 'dnsmasq address/server/local direktifleri',
        dnscrypt: 'dnscrypt cloaking kuralları',
        unbound: 'Unbound local-zone direktifleri',
        bind9: 'BIND9 RPZ zone formatı',
        rpz: 'DNS RPZ kayıt formatı — Bind9 uyumlu',
        ublock: 'Adblock Plus filtre sözdizimi',
        adblock: 'Adblock Plus / uBlock Origin filtre sözdizimi',
        plain: 'Düz domain listesi (her satırda bir domain)',
        domains: 'Her satırda tek domain — plain format',
        subdomains: 'Alt-domain odaklı düz liste',
        dnscloak: 'iOS/macOS DNS proxy kuralları',
        'wildcard-asterisk': 'Yalnızca *.domain.com joker kuralları',
        'wildcard-domains': '*.domain.com ve düz domain karışık liste',
      },
    },
    actions: {
      start: 'Başlat',
      stop: 'Durdur',
      restart: 'Yeniden Başlat',
    },
    processing: {
      fetching: 'URL alınıyor...',
      parsing: 'Ayrıştırılıyor...',
      pushing: "NextDNS'e gönderiliyor...",
    },
  },

  validation: {
    apiKeyRequired: 'API anahtarı zorunludur.',
    profileIdRequired: 'Profil ID zorunludur.',
    urlRequired: "Blocklist URL'si zorunludur.",
    urlInvalidProtocol: "Yalnızca http ve https URL'lerine izin verilir.",
    urlInvalid: 'Geçerli bir URL girin (https://...).',
  },

  logs: {
    fetchingUrl: "Blocklist URL'si alınıyor...",
    contentFetched: 'İçerik alındı — {{lines}} satır, {{size}}',
    fetchFailed: 'URL alınamadı: {{error}}',
    parsing: '"{{format}}" formatında ayrıştırılıyor...',
    noDomainsFound: 'Geçerli domain bulunamadı. Format seçimini kontrol edin.',
    domainsFound: '{{count}} benzersiz domain bulundu',
    pushingDomains: "{{count}} domain NextDNS Denylist'e ekleniyor...",
    pushInfo: 'Profil: {{profileId}} · Batch: {{batchSize}} · Gecikme: {{delay}}s',
    batchComplete: 'Batch {{n}} — +{{added}} eklendi',
    alsoSkipped: ', {{n}} mevcut',
    alsoErrors: ', {{n}} hata',
    waitingNextBatch: 'Sonraki batch için {{s}}s bekleniyor...',
    fatalError: 'Kritik hata: {{error}}',
    completed: 'Tamamlandı! {{added}} eklendi · {{skipped}} zaten mevcuttu · {{errors}} hata · {{duration}}s',
    aborted: 'İşlem kullanıcı tarafından iptal edildi.',
    unexpectedError: 'Beklenmeyen hata: {{error}}',
    apiError: 'API hatası: {{error}}',
    responseError: 'Yanıt alınamadı',
  },

  progress: {
    panelTitle: 'Canlı İlerleme',
    status: {
      idle: 'Beklemede',
      fetching: 'URL alınıyor...',
      parsing: 'Ayrıştırılıyor...',
      pushing: "NextDNS'e gönderiliyor...",
      done: 'Tamamlandı',
      aborted: 'İptal edildi',
    },
    stats: {
      total: 'Toplam',
      added: 'Eklendi',
      existing: 'Mevcut',
      error: 'Hata',
    },
    progressLabel: 'İlerleme',
    waiting: 'Bekleniyor...',
  },
}
