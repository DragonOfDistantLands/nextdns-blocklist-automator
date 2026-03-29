interface ProgressBarProps {
  value: number
  active?: boolean
  label?: string
}

export function ProgressBar({ value, active, label = 'Progress' }: ProgressBarProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground/70 font-medium">{label}</span>
        <span className="tabular-nums font-mono font-semibold text-foreground/80">
          {value}%
        </span>
      </div>
      <div className="h-1.5 bg-muted/60 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-linear-to-r from-blue-500 to-indigo-500
            transition-[width] duration-700 ease-out
            ${active && value < 100 ? 'progress-bar-active' : ''}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}
