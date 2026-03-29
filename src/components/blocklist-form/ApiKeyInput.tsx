'use client'

import { useState } from 'react'
import { Eye, EyeOff, KeyRound } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useTranslation } from '@/lib/i18n/context'

interface ApiKeyInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
}

export function ApiKeyInput({ value, onChange, error, disabled }: ApiKeyInputProps) {
  const { dict } = useTranslation()
  const [show, setShow] = useState(false)
  const t = dict.form.apiKey

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Label
          htmlFor="api-key"
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
        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={13} />
        <Input
          id="api-key"
          type={show ? 'text' : 'password'}
          placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`pl-8 pr-10 font-mono text-sm transition-all duration-200
            focus-visible:ring-blue-500/25 focus-visible:border-blue-400/50
            ${error ? 'border-destructive' : ''}`}
          autoComplete="off"
          spellCheck={false}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
          onClick={() => setShow((s) => !s)}
          disabled={disabled}
          aria-label={show ? t.hide : t.show}
        >
          {show ? <EyeOff size={13} /> : <Eye size={13} />}
        </Button>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
