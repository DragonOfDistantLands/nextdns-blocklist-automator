// Log entry tip tanımları

export type LogType = 'success' | 'error' | 'warning' | 'info' | 'delay' | 'start' | 'complete'

export interface LogEntry {
  id: string
  type: LogType
  message: string
  timestamp: Date
  detail?: string
}

// Her log tipinin görsel özellikleri
export const LOG_STYLES: Record<LogType, { color: string; icon: string }> = {
  success: { color: 'text-green-400', icon: '✓' },
  error:   { color: 'text-red-400',   icon: '✗' },
  warning: { color: 'text-yellow-400',icon: '⚠' },
  info:    { color: 'text-blue-400',  icon: 'ℹ' },
  delay:   { color: 'text-gray-500',  icon: '⟳' },
  start:   { color: 'text-cyan-400',  icon: '▶' },
  complete:{ color: 'text-purple-400',icon: '★' },
}
