import type { ProcessingStats } from '@/types/blocklist'

interface StatsLabels {
  total: string
  added: string
  existing: string
  error: string
}

interface StatsSummaryProps {
  stats: ProcessingStats
  labels: StatsLabels
}

interface StatChipProps {
  label: string
  value: number
  dotClass: string
  valueClass: string
}

function StatChip({ label, value, dotClass, valueClass }: StatChipProps) {
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-border/50 bg-muted/30 px-2.5 py-1">
      <span className={`size-1.5 rounded-full shrink-0 ${dotClass}`} />
      <span className="text-[11px] text-muted-foreground/70 font-medium">{label}</span>
      <span className={`text-[11px] font-semibold tabular-nums font-mono ${valueClass}`}>
        {value.toLocaleString()}
      </span>
    </div>
  )
}

export function StatsSummary({ stats, labels }: StatsSummaryProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <StatChip
        label={labels.total}
        value={stats.total}
        dotClass="bg-muted-foreground/40"
        valueClass="text-foreground/80"
      />
      <StatChip
        label={labels.added}
        value={stats.success}
        dotClass="bg-green-500"
        valueClass="text-green-600 dark:text-green-400"
      />
      <StatChip
        label={labels.existing}
        value={stats.skipped}
        dotClass="bg-yellow-500"
        valueClass="text-yellow-600 dark:text-yellow-400"
      />
      <StatChip
        label={labels.error}
        value={stats.error}
        dotClass="bg-red-500"
        valueClass="text-red-600 dark:text-red-400"
      />
    </div>
  )
}
