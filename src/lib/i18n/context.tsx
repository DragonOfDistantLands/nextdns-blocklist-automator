'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { SupportedLocale, Dictionary } from './types'
import { en } from './en'
import { tr } from './tr'
import { ru } from './ru'
import { zh } from './zh'
import { es } from './es'

const DICTIONARIES: Record<SupportedLocale, Dictionary> = { en, tr, ru, zh, es }

export const LOCALE_NAMES: Record<SupportedLocale, string> = {
  en: 'English',
  tr: 'Türkçe',
  ru: 'Русский',
  zh: '中文',
  es: 'Español',
}

export const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'tr', 'ru', 'zh', 'es']

interface LanguageContextValue {
  locale: SupportedLocale
  dict: Dictionary
  setLocale: (locale: SupportedLocale) => void
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'en',
  dict: en,
  setLocale: () => {},
})

const STORAGE_KEY = 'nextdns-automator-locale'

function getInitialLocale(): SupportedLocale {
  if (typeof window === 'undefined') return 'en'
  const stored = localStorage.getItem(STORAGE_KEY) as SupportedLocale | null
  if (stored && SUPPORTED_LOCALES.includes(stored)) return stored
  const browser = navigator.language.split('-')[0] as SupportedLocale
  if (SUPPORTED_LOCALES.includes(browser)) return browser
  return 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>('en')

  useEffect(() => {
    setLocaleState(getInitialLocale())
  }, [])

  const setLocale = (next: SupportedLocale) => {
    setLocaleState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }

  return (
    <LanguageContext.Provider
      value={{ locale, dict: DICTIONARIES[locale], setLocale }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  return useContext(LanguageContext)
}
