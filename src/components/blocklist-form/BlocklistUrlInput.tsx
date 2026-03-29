'use client'

import { Link } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTranslation } from '@/lib/i18n/context'

interface BlocklistUrlInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
}

export function BlocklistUrlInput({ value, onChange, error, disabled }: BlocklistUrlInputProps) {
  const { dict } = useTranslation()
  const t = dict.form.url

  return (
    <div className="space-y-1.5">
      <Label
        htmlFor="blocklist-url"
        className="text-sm font-semibold tracking-tight"
        style={{ fontFamily: 'var(--font-mulish)' }}
      >
        {t.label}
      </Label>

      <div className="relative">
        <Link className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={13} />
        <Input
          id="blocklist-url"
          type="url"
          placeholder={t.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value.trim())}
          disabled={disabled}
          className={`pl-8 font-mono text-sm transition-all duration-200
            focus-visible:ring-blue-500/25 focus-visible:border-blue-400/50
            ${error ? 'border-destructive' : ''}`}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {error
        ? <p className="text-xs text-destructive">{error}</p>
        : <p className="text-xs text-muted-foreground/60">{t.hint}</p>
      }
    </div>
  )
}
