export type SupportedLocale = 'en' | 'tr' | 'ru' | 'zh' | 'es'

export interface Dictionary {
  /** BCP-47 locale code for date/number formatting */
  localeCode: string

  header: {
    title: string
    subtitle: string
  }

  footer: {
    description: string
    donate: string
  }

  donate: {
    buttonLabel: string
    title: string
    description: string
    copy: string
    copied: string
    networks: {
      bsc: string
      sol: string
    }
    warning: string
  }

  hero: {
    badge: string
    title: string
    description: string
  }

  form: {
    cardTitle: string
    cardDescription: string
    apiKey: {
      label: string
      tooltip: string
      hide: string
      show: string
    }
    profileId: {
      label: string
      tooltip: string
    }
    url: {
      label: string
      placeholder: string
      hint: string
    }
    format: {
      label: string
      placeholder: string
      descriptions: Record<string, string>
    }
    actions: {
      start: string
      stop: string
      restart: string
    }
    processing: {
      fetching: string
      parsing: string
      pushing: string
    }
  }

  validation: {
    apiKeyRequired: string
    profileIdRequired: string
    urlRequired: string
    urlInvalidProtocol: string
    urlInvalid: string
  }

  logs: {
    fetchingUrl: string
    contentFetched: string
    fetchFailed: string
    parsing: string
    noDomainsFound: string
    domainsFound: string
    pushingDomains: string
    pushInfo: string
    batchComplete: string
    alsoSkipped: string
    alsoErrors: string
    waitingNextBatch: string
    fatalError: string
    completed: string
    aborted: string
    unexpectedError: string
    apiError: string
    responseError: string
  }

  progress: {
    panelTitle: string
    status: {
      idle: string
      fetching: string
      parsing: string
      pushing: string
      done: string
      aborted: string
    }
    stats: {
      total: string
      added: string
      existing: string
      error: string
    }
    progressLabel: string
    waiting: string
  }
}
