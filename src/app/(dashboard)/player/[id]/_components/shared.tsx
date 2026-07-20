'use client'

import { Flag, Info, TrendingDown, TrendingUp } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// duplicate flag state: 'ok' | 'duplicate' | 'blocked'
export type DuplicateState = 'ok' | 'duplicate' | 'blocked'

export function PillToggle({ label, selected, onToggle }: { label: string; selected: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center rounded-md border h-7 px-2.5 text-[0.8rem] transition-colors ${
        selected
          ? 'border-foreground bg-foreground text-background'
          : 'border-border bg-background text-foreground hover:bg-muted'
      }`}
    >
      {label}
    </button>
  )
}

export function DuplicateFlag({ state }: { state: DuplicateState }) {
  if (state === 'ok') {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground/40">
              <Flag className="size-3.5" />
              No duplicates
            </span>
          </TooltipTrigger>
          <TooltipContent>No duplicate accounts detected</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
  if (state === 'duplicate') {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              Duplicates
              <span className="inline-flex items-center rounded-md border border-border px-2 py-0.5 text-xs font-semibold text-foreground">6</span>
            </span>
          </TooltipTrigger>
          <TooltipContent>This player has 6 duplicate accounts</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-destructive">
            <Flag className="size-3.5 fill-destructive" />
            Multi-account block
          </span>
        </TooltipTrigger>
        <TooltipContent>Blocked for multi-account violation</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function StatCard({
  label,
  value,
  original,
  change,
  trend,
  tooltip,
}: {
  label: string
  value: string
  original?: string
  change: string
  trend: 'up' | 'down'
  tooltip: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <span className="text-xs sm:text-sm text-muted-foreground">{label}</span>
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="size-3.5 text-muted-foreground/50 hover:text-muted-foreground cursor-default shrink-0" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[220px] text-xs">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-2xl sm:text-3xl font-semibold tabular-nums">{value}</span>
        {original && (
          <span className="text-xs text-muted-foreground tabular-nums">{original}</span>
        )}
      </div>
      <div className="flex items-center gap-1 text-xs sm:text-sm">
        {trend === 'up'
          ? <TrendingUp className="size-3.5 text-success shrink-0" />
          : <TrendingDown className="size-3.5 text-destructive shrink-0" />}
        <span className={trend === 'up' ? 'text-success font-medium' : 'text-destructive font-medium'}>
          {change}
        </span>
        <span className="text-muted-foreground hidden sm:inline">vs. previous period</span>
      </div>
    </div>
  )
}

// Multi-currency wallets. Balances live in the wallet currency; `eurValue` is the
// real balance converted at the current rate. Historical figures (deposits, GGR)
// always use per-transaction FX snapshots and are never recomputed with live rates.
export type WalletKind = 'Fiat' | 'Crypto' | 'Stablecoin'

export type PlayerWallet = {
  currency: string
  glyph: string
  kind: WalletKind
  network?: string
  real: number
  bonus: number
  locked: number
  eurValue: number
  fxRate: string
  fxSource: string
  isBase?: boolean
  inPlay?: boolean
}

export const PLAYER_WALLETS: PlayerWallet[] = [
  { currency: 'USDT', glyph: '₮',  kind: 'Stablecoin', network: 'TRC-20', real: 850,      bonus: 0,  locked: 120, eurValue: 724.20, fxRate: '1 USDT = €0.8520',      fxSource: 'Kraken · 14:32' },
  { currency: 'BTC',  glyph: '₿',  kind: 'Crypto',                        real: 0.00412,  bonus: 0,  locked: 0,   eurValue: 245.15, fxRate: '1 BTC = €59,502.43',    fxSource: 'Kraken · 14:32' },
  { currency: 'AUD',  glyph: 'A$', kind: 'Fiat',                          real: 410.50,   bonus: 85, locked: 0,   eurValue: 240.06, fxRate: '1 AUD = €0.5848',       fxSource: 'Frankfurter · 14:32', isBase: true, inPlay: true },
  { currency: 'ETH',  glyph: 'Ξ',  kind: 'Crypto',                        real: 0.021,    bonus: 0,  locked: 0,   eurValue: 62.16,  fxRate: '1 ETH = €2,960.00',     fxSource: 'Kraken · 14:32' },
  { currency: 'DOGE', glyph: 'Ð',  kind: 'Crypto',                        real: 0,        bonus: 0,  locked: 0,   eurValue: 0,      fxRate: '1 DOGE = €0.1832',      fxSource: 'Kraken · 14:32' },
  { currency: 'XRP',  glyph: 'X',  kind: 'Crypto',                        real: 0,        bonus: 0,  locked: 0,   eurValue: 0,      fxRate: '1 XRP = €1.9420',       fxSource: 'Kraken · 14:32' },
]

// Never truncate crypto amounts to 2 decimals -- 0.004 vs 0.0041 BTC is a real difference.
export const WALLET_CRYPTO_DECIMALS: Record<string, number> = { BTC: 8, ETH: 6, DOGE: 2, XRP: 2 }

export function fmtWalletAmount(n: number, w: PlayerWallet): string {
  const decimals = w.kind === 'Crypto' ? (WALLET_CRYPTO_DECIMALS[w.currency] ?? 8) : 2
  return n.toLocaleString('en', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export const fmtEur = (n: number) => `€${n.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const WALLETS_TOTAL_EUR = PLAYER_WALLETS.reduce((sum, w) => sum + w.eurValue, 0)
export const FUNDED_WALLETS = PLAYER_WALLETS.filter(w => w.real > 0 || w.bonus > 0 || w.locked > 0)
export const EMPTY_WALLETS = PLAYER_WALLETS.filter(w => !(w.real > 0 || w.bonus > 0 || w.locked > 0))
