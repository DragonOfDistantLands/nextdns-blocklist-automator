'use client'

import { useState, useCallback } from 'react'
import { Copy, Check, AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useTranslation } from '@/lib/i18n/context'

// ── Network chain icons ───────────────────────────────────────────

/** BNB Smart Chain — golden hexagon */
function BscChainIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="#F0B90B" />
      <path
        d="M12.116 13.534L16 9.65l3.886 3.886 2.26-2.26L16 5.13l-6.144 6.144 2.26 2.26zM5.13 16l2.26-2.26 2.26 2.26-2.26 2.26L5.13 16zm6.986 2.466L16 22.35l3.886-3.886 2.26 2.258L16 26.87l-6.144-6.144.002-.002 2.258-2.258zm9.614-2.466l2.26-2.26 2.26 2.26-2.26 2.26-2.26-2.26zm-3.022 0l-2.71-2.71-2.71 2.71 2.71 2.71 2.71-2.71z"
        fill="white"
      />
    </svg>
  )
}

/** Solana — purple/violet gradient diamond */
function SolChainIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="#9945FF" />
      <path
        d="M9 21.5h10.5c.2 0 .38-.07.52-.2l1.8-1.8a.34.34 0 0 0-.24-.58H11.1a.73.73 0 0 0-.52.2L8.76 21a.34.34 0 0 0 .24.5zm0-5.5h10.5c.2 0 .38-.07.52-.2l1.8-1.8a.34.34 0 0 0-.24-.58H11.1a.73.73 0 0 0-.52.2l-1.82 1.8a.34.34 0 0 0 .24.58zm13.06-7.72L20.25 10a.73.73 0 0 0-.52-.2H9.24a.34.34 0 0 0-.24.58l1.82 1.8c.14.13.32.2.52.2h10.42a.34.34 0 0 0 .24-.6l.06.06z"
        fill="white"
      />
    </svg>
  )
}

// ── Tether (USDT) icon with chain badge ──────────────────────────

type ChainType = 'bsc' | 'sol'

function UsdtWithChain({ chain }: { chain: ChainType }) {
  return (
    <div className="relative shrink-0">
      {/* USDT main icon */}
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="16" fill="#26A17B" />
        <path
          d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.657m0-3.59v-2.366h5.414V8.583H8.595v2.844h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.126 0 1.053 3.309 1.923 7.709 2.126v7.609h3.913v-7.612c4.393-.202 7.694-1.073 7.694-2.123 0-1.051-3.3-1.922-7.694-2.125"
          fill="white"
        />
      </svg>
      {/* Chain badge — bottom-right corner */}
      <span className="absolute -bottom-1 -right-1 rounded-full ring-2 ring-background">
        {chain === 'bsc' ? <BscChainIcon /> : <SolChainIcon />}
      </span>
    </div>
  )
}

// ── Address helpers ───────────────────────────────────────────────

function shortenAddress(addr: string): string {
  if (addr.length <= 16) return addr
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`
}

const BSC_ADDRESS = '0xd8F29d8F4f2346b14C78Fe36Eaebb5A434B890B6'
const SOL_ADDRESS = '7kitvtMt6Ep3dz3UqexPPR4JzJBPfm28QtfTkK3LeSMU'

// ── WalletCard ───────────────────────────────────────────────────

interface WalletCardProps {
  chain: ChainType
  network: string
  address: string
  copyLabel: string
  copiedLabel: string
}

function WalletCard({ chain, network, address, copyLabel, copiedLabel }: WalletCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(address)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = address
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [address])

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-4 py-3 hover:bg-muted/50 transition-colors">
      <UsdtWithChain chain={chain} />

      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-semibold text-foreground tracking-tight"
          style={{ fontFamily: 'var(--font-mulish)' }}
        >
          {network}
        </p>
        <p className="text-[11px] font-mono text-muted-foreground truncate mt-0.5">
          {shortenAddress(address)}
        </p>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className={`shrink-0 flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium
          transition-all duration-200 border
          ${copied
            ? 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400'
            : 'bg-background border-border/60 text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/60'
          }`}
        aria-label={copied ? copiedLabel : copyLabel}
      >
        {copied ? (
          <><Check size={11} className="shrink-0" /><span>{copiedLabel}</span></>
        ) : (
          <><Copy size={11} className="shrink-0" /><span>{copyLabel}</span></>
        )}
      </button>
    </div>
  )
}

// ── DonateDialog ─────────────────────────────────────────────────

export function DonateDialog() {
  const { dict } = useTranslation()
  const d = dict.donate

  return (
    <Dialog>
      <DialogTrigger className="hover:text-white transition-colors cursor-pointer">
        {d.buttonLabel}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle
            className="text-base font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-mulish)' }}
          >
            {d.title}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {d.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2.5 pt-1">
          <WalletCard
            chain="bsc"
            network={d.networks.bsc}
            address={BSC_ADDRESS}
            copyLabel={d.copy}
            copiedLabel={d.copied}
          />
          <WalletCard
            chain="sol"
            network={d.networks.sol}
            address={SOL_ADDRESS}
            copyLabel={d.copy}
            copiedLabel={d.copied}
          />
        </div>

        <div className="flex items-start gap-2 rounded-md bg-yellow-500/8 border border-yellow-500/20 px-3 py-2.5 text-xs text-yellow-700 dark:text-yellow-400">
          <AlertTriangle size={13} className="shrink-0 mt-0.5" />
          <span>{d.warning}</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
