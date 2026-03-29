import type { Dictionary } from './types'

export const es: Dictionary = {
  localeCode: 'es-ES',

  header: {
    title: 'NextDNS Blocklist Automator',
    subtitle: 'Agrega listas de bloqueo externas a tu Denylist automáticamente',
  },

  footer: {
    description: 'NextDNS Blocklist Automator — Código abierto, gratuito.',
    donate: 'Invítame un café ☕',
  },

  donate: {
    buttonLabel: 'Invítame un café ☕',
    title: 'Apoya el Proyecto',
    description:
      'Si este proyecto de código abierto te ha resultado útil, considera apoyarlo con USDT. Asegúrate de elegir la red correcta: los fondos enviados a la red equivocada pueden perderse permanentemente.',
    copy: 'Copiar',
    copied: '¡Copiado!',
    networks: {
      bsc: 'USDT (BEP20 / BSC)',
      sol: 'USDT (Solana / SPL)',
    },
    warning: 'Verifica siempre la red antes de enviar.',
  },

  hero: {
    badge: 'Código Abierto & Gratuito',
    title: 'Agregar Blocklist',
    description:
      'Agrega automáticamente listas de bloqueo de dominios externas, no incluidas en los valores predeterminados de NextDNS, a tu Denylist usando tu clave API.',
  },

  form: {
    cardTitle: 'Datos de Conexión',
    cardDescription:
      'Ingresa tu clave API de NextDNS y el ID de perfil, luego especifica la URL de la lista de bloqueo y su formato.',
    apiKey: {
      label: 'Clave API de NextDNS',
      tooltip:
        'Ve a my.nextdns.io → Ícono de perfil (arriba a la derecha) → Account → sección API.',
      hide: 'Ocultar clave',
      show: 'Mostrar clave',
    },
    profileId: {
      label: 'ID de Perfil',
      tooltip:
        'La URL en my.nextdns.io tiene el formato: my.nextdns.io/abc123/setup — el fragmento de 6 caracteres en negrita es tu ID de perfil.',
    },
    url: {
      label: 'URL de la Lista de Bloqueo',
      placeholder: 'https://example.com/blocklist.txt',
      hint: 'Ingresa la URL completa del archivo .txt con la lista de dominios.',
    },
    format: {
      label: 'Formato de Origen',
      placeholder: 'Seleccionar formato...',
      descriptions: {
        adaway: 'Formato hosts Android (127.0.0.1 dominio)',
        pihole: 'Formato hosts Pi-hole (0.0.0.0 dominio)',
        hosts: 'Archivo hosts genérico (Windows/Linux/macOS)',
        'hosts-compressed': 'Múltiples dominios por línea (estilo Hagezi)',
        'windows-hosts': 'Archivo hosts Windows/Linux — un dominio por línea',
        dnsmasq: 'Directivas dnsmasq address/server/local',
        dnscrypt: 'Reglas de enmascaramiento dnscrypt',
        unbound: 'Directivas Unbound local-zone',
        bind9: 'Formato de zona BIND9 RPZ',
        rpz: 'Formato de registro DNS RPZ — compatible con Bind9',
        ublock: 'Sintaxis de filtros Adblock Plus',
        adblock: 'Sintaxis Adblock Plus / uBlock Origin',
        plain: 'Lista de dominios plana (uno por línea)',
        domains: 'Un dominio por línea — formato plain',
        subdomains: 'Lista de subdominios',
        dnscloak: 'Reglas de proxy DNS para iOS/macOS',
        'wildcard-asterisk': 'Solo reglas wildcard *.domain.com',
        'wildcard-domains': 'Lista mixta *.domain.com y dominios planos',
      },
    },
    actions: {
      start: 'Iniciar',
      stop: 'Detener',
      restart: 'Reiniciar',
    },
    processing: {
      fetching: 'Obteniendo URL...',
      parsing: 'Analizando...',
      pushing: 'Enviando a NextDNS...',
    },
  },

  validation: {
    apiKeyRequired: 'La clave API es obligatoria.',
    profileIdRequired: 'El ID de perfil es obligatorio.',
    urlRequired: 'La URL de la lista de bloqueo es obligatoria.',
    urlInvalidProtocol: 'Solo se permiten URLs con http y https.',
    urlInvalid: 'Ingresa una URL válida (https://...).',
  },

  progress: {
    panelTitle: 'Progreso en Vivo',
    status: {
      idle: 'En espera',
      fetching: 'Obteniendo URL...',
      parsing: 'Analizando...',
      pushing: 'Enviando a NextDNS...',
      done: 'Completado',
      aborted: 'Cancelado',
    },
    stats: {
      total: 'Total',
      added: 'Agregados',
      existing: 'Existentes',
      error: 'Errores',
    },
    progressLabel: 'Progreso',
    waiting: 'Esperando...',
  },
}
