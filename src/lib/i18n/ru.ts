import type { Dictionary } from './types'

export const ru: Dictionary = {
  localeCode: 'ru-RU',

  header: {
    title: 'NextDNS Blocklist Automator',
    subtitle: 'Автоматически добавляйте списки блокировки в Denylist',
  },

  footer: {
    description: 'NextDNS Blocklist Automator — Открытый исходный код, бесплатно.',
    donate: 'Угостить кофе ☕',
  },

  donate: {
    buttonLabel: 'Угостить кофе ☕',
    title: 'Поддержать проект',
    description:
      'Если вы нашли этот проект с открытым исходным кодом полезным, вы можете поддержать его с помощью USDT. Убедитесь, что выбрали правильную сеть — средства, отправленные в неправильную сеть, могут быть безвозвратно потеряны.',
    copy: 'Копировать',
    copied: 'Скопировано!',
    networks: {
      bsc: 'USDT (BEP20 / BSC)',
      sol: 'USDT (Solana / SPL)',
    },
    warning: 'Всегда проверяйте сеть перед отправкой.',
  },

  hero: {
    badge: 'Открытый исходный код & Бесплатно',
    title: 'Добавить Blocklist',
    description:
      'Автоматически добавляйте внешние списки блокировки доменов, отсутствующие в стандартных списках NextDNS, в ваш Denylist с помощью API-ключа.',
  },

  form: {
    cardTitle: 'Данные подключения',
    cardDescription:
      'Введите API-ключ NextDNS и ID профиля, затем укажите URL списка блокировки и его формат.',
    apiKey: {
      label: 'API-ключ NextDNS',
      tooltip:
        'my.nextdns.io → Иконка профиля (вверху справа) → Account → раздел API.',
      hide: 'Скрыть ключ',
      show: 'Показать ключ',
    },
    profileId: {
      label: 'ID профиля',
      tooltip:
        'URL на my.nextdns.io выглядит так: my.nextdns.io/abc123/setup — выделенный 6-символьный фрагмент и есть ваш ID профиля.',
    },
    url: {
      label: 'URL списка блокировки',
      placeholder: 'https://example.com/blocklist.txt',
      hint: 'Введите полный URL .txt-файла со списком доменов.',
    },
    format: {
      label: 'Формат источника',
      placeholder: 'Выберите формат...',
      descriptions: {
        adaway: 'Android hosts формат (127.0.0.1 домен)',
        pihole: 'Pi-hole hosts формат (0.0.0.0 домен)',
        hosts: 'Стандартный hosts файл (Windows/Linux/macOS)',
        'hosts-compressed': 'Несколько доменов в строке (стиль Hagezi)',
        'windows-hosts': 'Windows/Linux hosts файл — один домен в строке',
        dnsmasq: 'Директивы dnsmasq address/server/local',
        dnscrypt: 'Правила маскировки dnscrypt',
        unbound: 'Директивы Unbound local-zone',
        bind9: 'Формат зоны BIND9 RPZ',
        rpz: 'Формат записи DNS RPZ — совместим с Bind9',
        ublock: 'Синтаксис фильтров Adblock Plus',
        adblock: 'Синтаксис Adblock Plus / uBlock Origin',
        plain: 'Список доменов (один в строке)',
        domains: 'Один домен в строке — plain формат',
        subdomains: 'Список поддоменов',
        dnscloak: 'Правила DNS-прокси для iOS/macOS',
        'wildcard-asterisk': 'Только правила *.domain.com',
        'wildcard-domains': 'Смешанный список *.domain.com и доменов',
      },
    },
    actions: {
      start: 'Запустить',
      stop: 'Остановить',
      restart: 'Перезапустить',
    },
    processing: {
      fetching: 'Загрузка URL...',
      parsing: 'Разбор данных...',
      pushing: 'Отправка в NextDNS...',
    },
  },

  validation: {
    apiKeyRequired: 'API-ключ обязателен.',
    profileIdRequired: 'ID профиля обязателен.',
    urlRequired: 'URL списка блокировки обязателен.',
    urlInvalidProtocol: 'Разрешены только URL с протоколом http и https.',
    urlInvalid: 'Введите корректный URL (https://...).',
  },

  logs: {
    fetchingUrl: 'Загрузка URL списка блокировки...',
    contentFetched: 'Контент получен — {{lines}} строк, {{size}}',
    fetchFailed: 'Не удалось загрузить URL: {{error}}',
    parsing: "Разбор в формате '{{format}}'...",
    noDomainsFound: 'Допустимые домены не найдены. Проверьте выбор формата.',
    domainsFound: 'Найдено {{count}} уникальных доменов',
    pushingDomains: 'Добавление {{count}} доменов в NextDNS Denylist...',
    pushInfo: 'Профиль: {{profileId}} · Пакет: {{batchSize}} · Задержка: {{delay}}с',
    batchComplete: 'Пакет {{n}} — +{{added}} добавлено',
    alsoSkipped: ', {{n}} существует',
    alsoErrors: ', {{n}} ошибок',
    waitingNextBatch: 'Ожидание {{s}}с перед следующим пакетом...',
    fatalError: 'Критическая ошибка: {{error}}',
    completed: 'Готово! {{added}} добавлено · {{skipped}} уже существовало · {{errors}} ошибок · {{duration}}с',
    aborted: 'Операция отменена пользователем.',
    unexpectedError: 'Непредвиденная ошибка: {{error}}',
    apiError: 'Ошибка API: {{error}}',
    responseError: 'Ответ не получен',
  },

  progress: {
    panelTitle: 'Прогресс в реальном времени',
    status: {
      idle: 'Ожидание',
      fetching: 'Загрузка URL...',
      parsing: 'Разбор данных...',
      pushing: 'Отправка в NextDNS...',
      done: 'Завершено',
      aborted: 'Отменено',
    },
    stats: {
      total: 'Всего',
      added: 'Добавлено',
      existing: 'Существует',
      error: 'Ошибок',
    },
    progressLabel: 'Прогресс',
    waiting: 'Ожидание...',
  },
}
