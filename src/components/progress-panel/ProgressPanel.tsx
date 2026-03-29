'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { ProcessingStats } from '@/types/blocklist'
import type { LogEntry } from '@/types/log'
import type { ProcessingStatus } from '@/hooks/useBlocklistProcessor'
import { StatsSummary } from './StatsSummary'
import { ProgressBar } from './ProgressBar'
import { TerminalLog } from './TerminalLog'
import { useTranslation } from '@/lib/i18n/context'

interface ProgressPanelProps {
  status: ProcessingStatus
  stats: ProcessingStats
  logs: LogEntry[]
}

export function ProgressPanel({ status, stats, logs }: ProgressPanelProps) {
  const { dict } = useTranslation()
  const p = dict.progress

  const statusLabel = p.status[status]
  const isActive =
    status === 'fetching' || status === 'parsing' || status === 'pushing'

  const statsLabels = {
    total: p.stats.total,
    added: p.stats.added,
    existing: p.stats.existing,
    error: p.stats.error,
  }

  return (
    <Card className="border-border/60 shadow-sm overflow-hidden">
      {/* ── Panel Başlığı ────────────────────────────────────────── */}
      <CardHeader className="pb-3 bg-muted/20 border-b border-border/40">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* Canlı durum noktası */}
            <span className="relative flex size-2">
              {isActive && (
                <span className="status-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full size-2 ${
                isActive ? 'bg-blue-500' :
                status === 'done' ? 'bg-green-500' :
                status === 'aborted' ? 'bg-yellow-500' :
                'bg-muted-foreground/30'
              }`} />
            </span>
            <span className="text-sm font-medium">{p.panelTitle}</span>
          </div>
          <span className="text-xs text-muted-foreground/70 tabular-nums">
            {statusLabel}
          </span>
        </div>

        {stats.total > 0 && (
          <div className="pt-2">
            <StatsSummary stats={stats} labels={statsLabels} />
          </div>
        )}
      </CardHeader>

      {/* ── Panel İçeriği ────────────────────────────────────────── */}
      <CardContent className="p-0">
        {stats.total > 0 && (
          <div className="px-4 pt-4 pb-2">
            <ProgressBar
              value={stats.progressPercent}
              active={isActive}
              label={p.progressLabel}
            />
          </div>
        )}
        <div className="px-4 pb-4 pt-2">
          <TerminalLog logs={logs} waitingText={p.waiting} />
        </div>
      </CardContent>
    </Card>
  )
}
