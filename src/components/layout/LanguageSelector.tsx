'use client'

import { Globe, Check } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import {
  useTranslation,
  LOCALE_NAMES,
  SUPPORTED_LOCALES,
} from '@/lib/i18n/context'
import type { SupportedLocale } from '@/lib/i18n/types'

export function LanguageSelector() {
  const { locale, setLocale } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-white/70 hover:text-white transition-all duration-200"
        aria-label="Select language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe size={14} className="shrink-0" />
        <span className="hidden sm:inline text-xs font-medium uppercase tracking-wide">
          {locale}
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-2 w-44 rounded-md border border-border bg-popover text-popover-foreground shadow-lg z-50 py-1 overflow-hidden"
        >
          {SUPPORTED_LOCALES.map((loc: SupportedLocale) => (
            <button
              key={loc}
              type="button"
              role="option"
              aria-selected={locale === loc}
              onClick={() => {
                setLocale(loc)
                setOpen(false)
              }}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left
                hover:bg-accent hover:text-accent-foreground transition-colors
                ${locale === loc ? 'text-blue-500 font-semibold' : 'text-foreground'}`}
            >
              <span className="text-[10px] font-mono w-5 uppercase text-muted-foreground shrink-0">
                {loc}
              </span>
              <span className="flex-1">{LOCALE_NAMES[loc]}</span>
              {locale === loc && (
                <Check size={11} className="shrink-0 text-blue-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
