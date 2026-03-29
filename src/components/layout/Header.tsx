'use client'

import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from './ThemeToggle'
import { LanguageSelector } from './LanguageSelector'
import { useTranslation } from '@/lib/i18n/context'

function NextDNSShield() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <path
        d="M18 3L5 9v8.5c0 7.97 5.64 15.44 13 17.5C25.36 32.94 31 25.47 31 17.5V9L18 3Z"
        fill="white"
        fillOpacity="0.95"
      />
      <path
        d="M12.5 18l4 4 7.5-7.5"
        stroke="#1472D1"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Header() {
  const { dict } = useTranslation()

  return (
    <header className="bg-[#1472D1] sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 py-3.5 flex items-center justify-between">

        {/* ── Logo + Brand ─────────────────────────────────────────── */}
        <div className="logo-animate flex items-center gap-3">
          <NextDNSShield />
          <div>
            <h1
              className="text-sm font-semibold leading-tight tracking-tight text-white"
              style={{ fontFamily: 'var(--font-mulish)' }}
            >
              {dict.header.title}
            </h1>
            <p className="text-[11px] text-white/70 leading-tight mt-0.5 hidden sm:block">
              {dict.header.subtitle}
            </p>
          </div>
        </div>

        {/* ── Sağ Taraf ────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="text-[10px] font-mono px-2 py-0.5 text-white/80 border-white/30 bg-white/10"
          >
            v1.0.0
          </Badge>

          <LanguageSelector />
          <ThemeToggle />
        </div>

      </div>
    </header>
  )
}
