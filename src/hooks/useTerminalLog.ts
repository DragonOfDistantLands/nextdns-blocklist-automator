'use client'

import { useState, useCallback } from 'react'
import type { LogEntry, LogType } from '@/types/log'

export interface UseTerminalLogReturn {
  logs: LogEntry[]
  addLog: (type: LogType, message: string, detail?: string) => void
  clearLogs: () => void
}

export function useTerminalLog(): UseTerminalLogReturn {
  const [logs, setLogs] = useState<LogEntry[]>([])

  const addLog = useCallback((type: LogType, message: string, detail?: string) => {
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      type,
      message,
      timestamp: new Date(),
      detail,
    }
    setLogs((prev) => {
      // Maksimum 500 satır tut — eski girişleri kırp
      const next = [...prev, entry]
      return next.length > 500 ? next.slice(next.length - 500) : next
    })
  }, [])

  const clearLogs = useCallback(() => setLogs([]), [])

  return { logs, addLog, clearLogs }
}
