'use client'

import { useEffect, useRef } from 'react'
import type { LogEntry as LogEntryType } from '@/types/log'
import { LogEntry } from './LogEntry'

interface TerminalLogProps {
  logs: LogEntryType[]
  waitingText?: string
}

export function TerminalLog({ logs, waitingText = 'Waiting...' }: TerminalLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  return (
    <div className="relative">
      {/* Terminal pencere çubuğu */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/40 border border-border/40 rounded-t-md border-b-0">
        <span className="size-2.5 rounded-full bg-red-500/50" />
        <span className="size-2.5 rounded-full bg-yellow-500/50" />
        <span className="size-2.5 rounded-full bg-green-500/50" />
        <span className="ml-2 text-[10px] text-muted-foreground/40 font-mono select-none">
          log output
        </span>
      </div>

      {/* Log içeriği */}
      <div className="h-64 overflow-y-auto bg-[hsl(var(--muted)/0.15)] dark:bg-black/30 border border-border/40 border-t-0 rounded-b-md px-3 py-2.5 space-y-0.5 font-mono text-xs terminal-scrollbar">
        {logs.length === 0 ? (
          <div className="flex items-center gap-2 h-full justify-center text-muted-foreground/30 select-none">
            <span className="font-mono text-xs">{waitingText}</span>
          </div>
        ) : (
          logs.map((entry) => <LogEntry key={entry.id} entry={entry} />)
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
