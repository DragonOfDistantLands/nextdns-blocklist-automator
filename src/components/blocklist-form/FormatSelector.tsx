'use client'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FORMAT_OPTIONS, type BlocklistFormat } from '@/types/blocklist'
import { useTranslation } from '@/lib/i18n/context'

interface FormatSelectorProps {
  value: BlocklistFormat
  onChange: (value: BlocklistFormat) => void
  disabled?: boolean
}

export function FormatSelector({ value, onChange, disabled }: FormatSelectorProps) {
  const { dict } = useTranslation()
  const t = dict.form.format
  const selected = FORMAT_OPTIONS.find((o) => o.value === value)

  return (
    <div className="space-y-1.5">
      <Label
        htmlFor="format"
        className="text-sm font-semibold tracking-tight"
        style={{ fontFamily: 'var(--font-mulish)' }}
      >
        {t.label}
      </Label>

      <Select
        value={value}
        onValueChange={(v) => onChange(v as BlocklistFormat)}
        disabled={disabled}
      >
        <SelectTrigger id="format" className="w-full">
          <SelectValue placeholder={t.placeholder} />
        </SelectTrigger>
        <SelectContent>
          {FORMAT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              <span className="font-medium">{opt.label}</span>
              <span className="ml-2 text-xs text-muted-foreground hidden sm:inline">
                — {t.descriptions[opt.value] ?? opt.description}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selected && (
        <p className="text-xs text-muted-foreground font-mono bg-muted rounded px-2 py-1 mt-1">
          <span className="text-muted-foreground/60 mr-1">ex:</span>
          {selected.exampleLine}
        </p>
      )}
    </div>
  )
}
