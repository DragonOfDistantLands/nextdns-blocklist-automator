'use client'

import { useState } from 'react'
import { Loader2, Play, Square, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ApiKeyInput } from './ApiKeyInput'
import { ProfileIdInput } from './ProfileIdInput'
import { BlocklistUrlInput } from './BlocklistUrlInput'
import { FormatSelector } from './FormatSelector'
import { ProgressPanel } from '@/components/progress-panel/ProgressPanel'
import { useBlocklistProcessor } from '@/hooks/useBlocklistProcessor'
import { useTranslation } from '@/lib/i18n/context'
import type { BlocklistFormat } from '@/types/blocklist'
import type { Dictionary } from '@/lib/i18n/types'

interface FormValues {
  apiKey: string
  profileId: string
  blocklistUrl: string
  format: BlocklistFormat
}

interface FormErrors {
  apiKey?: string
  profileId?: string
  blocklistUrl?: string
}

function validateForm(
  values: FormValues,
  v: Dictionary['validation'],
): FormErrors {
  const errors: FormErrors = {}

  if (!values.apiKey.trim()) {
    errors.apiKey = v.apiKeyRequired
  }
  if (!values.profileId.trim()) {
    errors.profileId = v.profileIdRequired
  }
  if (!values.blocklistUrl.trim()) {
    errors.blocklistUrl = v.urlRequired
  } else {
    try {
      const url = new URL(values.blocklistUrl)
      if (!['http:', 'https:'].includes(url.protocol)) {
        errors.blocklistUrl = v.urlInvalidProtocol
      }
    } catch {
      errors.blocklistUrl = v.urlInvalid
    }
  }

  return errors
}

export function BlocklistForm() {
  const { dict } = useTranslation()
  const [values, setValues] = useState<FormValues>({
    apiKey: '',
    profileId: '',
    blocklistUrl: '',
    format: 'plain',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const { status, stats, logs, process, abort, reset } = useBlocklistProcessor()

  const isProcessing = status === 'fetching' || status === 'parsing' || status === 'pushing'
  const isDone = status === 'done' || status === 'aborted'
  const isDisabled = isProcessing

  const set = (field: keyof FormValues) => (value: string) => {
    setValues((v) => ({ ...v, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validateForm(values, dict.validation)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    await process(values)
  }

  const handleReset = () => {
    reset()
    setErrors({})
  }

  const f = dict.form

  return (
    <div className="space-y-5">
      {/* ── Form Kartı ─────────────────────────────────────────────── */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle
            className="text-base font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-mulish)' }}
          >
            {f.cardTitle}
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            {f.cardDescription}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-5">
              {/* API Anahtarı + Profil ID — yan yana (md+) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <ApiKeyInput
                  value={values.apiKey}
                  onChange={set('apiKey')}
                  error={errors.apiKey}
                  disabled={isDisabled}
                />
                <ProfileIdInput
                  value={values.profileId}
                  onChange={set('profileId')}
                  error={errors.profileId}
                  disabled={isDisabled}
                />
              </div>

              <Separator />

              {/* URL + Format */}
              <BlocklistUrlInput
                value={values.blocklistUrl}
                onChange={set('blocklistUrl')}
                error={errors.blocklistUrl}
                disabled={isDisabled}
              />
              <FormatSelector
                value={values.format}
                onChange={(v) => setValues((prev) => ({ ...prev, format: v }))}
                disabled={isDisabled}
              />

              <Separator />

              {/* Aksiyon Butonları */}
              <div className="flex items-center gap-3 pt-1">
                {!isProcessing && !isDone && (
                  <Button
                    type="submit"
                    className="gap-2 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm"
                  >
                    <Play size={13} />
                    {f.actions.start}
                  </Button>
                )}

                {isProcessing && (
                  <>
                    <Button
                      type="button"
                      variant="destructive"
                      className="gap-2 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
                      onClick={abort}
                    >
                      <Square size={13} />
                      {f.actions.stop}
                    </Button>
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 size={13} className="animate-spin text-blue-500" />
                      {status === 'fetching' && f.processing.fetching}
                      {status === 'parsing' && f.processing.parsing}
                      {status === 'pushing' && f.processing.pushing}
                    </span>
                  </>
                )}

                {isDone && (
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0"
                    onClick={handleReset}
                  >
                    <RotateCcw size={13} />
                    {f.actions.restart}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── İlerleme Paneli ────────────────────────────────────────── */}
      {(isProcessing || isDone || logs.length > 0) && (
        <ProgressPanel
          status={status}
          stats={stats}
          logs={logs}
        />
      )}
    </div>
  )
}
