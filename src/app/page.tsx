'use client'

import { BlocklistForm } from '@/components/blocklist-form/BlocklistForm'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from '@/lib/i18n/context'

export default function Home() {
  const { dict } = useTranslation()

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="text-center mb-10 space-y-3">
        <div className="hero-animate flex justify-center">
          <Badge
            variant="outline"
            className="text-[11px] px-2.5 py-0.5 font-medium text-blue-500 border-blue-500/30 bg-blue-500/5"
          >
            {dict.hero.badge}
          </Badge>
        </div>

        <h2
          className="hero-animate text-4xl font-extrabold tracking-tight text-foreground"
          style={{ fontFamily: 'var(--font-mulish)' }}
        >
          {dict.hero.title}
        </h2>

        <p className="hero-animate-delay text-muted-foreground max-w-md mx-auto text-base leading-relaxed">
          {dict.hero.description}
        </p>
      </div>

      {/* ── Form ─────────────────────────────────────────────────── */}
      <BlocklistForm />

    </div>
  )
}
