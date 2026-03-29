'use client'

import { ThemeProvider } from 'next-themes'
import { LanguageProvider } from '@/lib/i18n/context'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <LanguageProvider>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
