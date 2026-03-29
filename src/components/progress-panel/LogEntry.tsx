import type { LogEntry as LogEntryType } from '@/types/log'
import { LOG_STYLES } from '@/types/log'

interface LogEntryProps {
  entry: LogEntryType
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

export function LogEntry({ entry }: LogEntryProps) {
  const style = LOG_STYLES[entry.type]

  return (
    <div className="log-entry-animate flex items-start gap-2 text-xs font-mono leading-relaxed">
      {/* Zaman damgası */}
      <span className="shrink-0 text-muted-foreground/50 select-none tabular-nums">
        {formatTime(entry.timestamp)}
      </span>

      {/* İkon */}
      <span className={`shrink-0 font-bold ${style.color}`} aria-hidden>
        {style.icon}
      </span>

      {/* Mesaj */}
      <span className={`break-all ${style.color}`}>
        {entry.message}
        {entry.detail && (
          <span className="text-muted-foreground/60 ml-1">— {entry.detail}</span>
        )}
      </span>
    </div>
  )
}
