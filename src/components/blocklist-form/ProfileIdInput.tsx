'use client'

import { Hash } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useTranslation } from '@/lib/i18n/context'

interface ProfileIdInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
}

export function ProfileIdInput({ value, onChange, error, disabled }: ProfileIdInputProps) {
  const { dict } = useTranslation()
  const t = dict.form.profileId

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Label
          htmlFor="profile-id"
          className="text-sm font-semibold tracking-tight"
          style={{ fontFamily: 'var(--font-mulish)' }}
        >
          {t.label}
        </Label>
        <Tooltip>
          <TooltipTrigger
            className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            aria-label={t.tooltip}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs text-xs">
            <p>{t.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="relative">
        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={13} />
        <Input
          id="profile-id"
          type="text"
          placeholder="abc123"
          value={value}
          onChange={(e) => onChange(e.target.value.trim())}
          disabled={disabled}
          className={`pl-8 font-mono text-sm transition-all duration-200
            focus-visible:ring-blue-500/25 focus-visible:border-blue-400/50
            ${error ? 'border-destructive' : ''}`}
          maxLength={16}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
