'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatCard, PLAYER_WALLETS, FUNDED_WALLETS, EMPTY_WALLETS, WALLETS_TOTAL_EUR, fmtEur, fmtWalletAmount } from './shared'

function WalletsCard() {
  const [showEmpty, setShowEmpty] = useState(false)
  const wallets = showEmpty ? [...FUNDED_WALLETS, ...EMPTY_WALLETS] : FUNDED_WALLETS
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3 border-b border-border">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium">Wallets</span>
          <span className="text-xs text-muted-foreground">{PLAYER_WALLETS.length} currencies</span>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-sm font-semibold tabular-nums">Total ≈ {fmtEur(WALLETS_TOTAL_EUR)}</span>
          <span className="text-xs text-muted-foreground">Rates as of 14:32 · Frankfurter / Kraken</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table className="min-w-max sm:min-w-full">
          <TableHeader className="bg-muted/60">
            <TableRow className="hover:bg-transparent border-b border-border">
              <TableHead className="text-sm font-medium text-foreground">Currency</TableHead>
              <TableHead className="text-sm font-medium text-foreground text-right">Real</TableHead>
              <TableHead className="text-sm font-medium text-foreground text-right">Bonus</TableHead>
              <TableHead className="text-sm font-medium text-foreground text-right">Locked</TableHead>
              <TableHead className="text-sm font-medium text-foreground text-right">≈ EUR</TableHead>
              <TableHead className="text-sm font-medium text-foreground text-right w-[110px]">Share</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {wallets.map(w => {
              const empty = !(w.real > 0 || w.bonus > 0 || w.locked > 0)
              const share = WALLETS_TOTAL_EUR > 0 ? Math.round((w.eurValue / WALLETS_TOTAL_EUR) * 100) : 0
              return (
                <TableRow key={w.currency}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-muted shrink-0">
                        <span className="text-xs font-semibold text-muted-foreground">{w.glyph}</span>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm font-medium ${empty ? 'text-muted-foreground' : ''}`}>{w.currency}</span>
                          {w.isBase && (
                            <span className="inline-flex items-center rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">Base</span>
                          )}
                          {w.inPlay && (
                            <span className="inline-flex items-center rounded-full bg-success-bg px-2 py-0.5 text-[10px] font-medium text-success whitespace-nowrap">In play</span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{w.kind}{w.network ? ` · ${w.network}` : ''}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`text-sm font-medium tabular-nums ${empty ? 'text-muted-foreground' : ''}`}>{fmtWalletAmount(w.real, w)}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm text-muted-foreground tabular-nums">{fmtWalletAmount(w.bonus, w)}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    {w.locked > 0 ? (
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-sm text-muted-foreground tabular-nums underline decoration-dotted underline-offset-2 cursor-default">{fmtWalletAmount(w.locked, w)}</span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[220px] text-xs">
                            Held by a pending withdrawal.
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-sm text-muted-foreground tabular-nums">{fmtWalletAmount(w.locked, w)}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <span className={`text-sm font-medium tabular-nums ${empty ? 'text-muted-foreground' : ''}`}>
                      {w.kind === 'Fiat' || w.eurValue === 0 ? fmtEur(w.eurValue) : `≈ ${fmtEur(w.eurValue)}`}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-12 rounded-full bg-muted-foreground/15">
                        <div className="h-1.5 rounded-full bg-foreground transition-all" style={{ width: `${share}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">{share}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      {EMPTY_WALLETS.length > 0 && (
        <button
          type="button"
          onClick={() => setShowEmpty(v => !v)}
          className="flex w-full items-center gap-1.5 border-t border-border px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {showEmpty
            ? <ChevronUp className="size-3.5 shrink-0" />
            : <ChevronDown className="size-3.5 shrink-0" />}
          {showEmpty
            ? 'Hide empty wallets'
            : `Show ${EMPTY_WALLETS.length} empty wallets (${EMPTY_WALLETS.map(w => w.currency).join(', ')})`}
        </button>
      )}
    </div>
  )
}

export function OverviewTab() {
  return (
    <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total balance"
                value={`≈ ${fmtEur(WALLETS_TOTAL_EUR)}`}
                original={`${PLAYER_WALLETS.length} wallets · ${FUNDED_WALLETS.length} with funds`}
                change="-€290.00"
                trend="down"
                tooltip="Sum of all wallet balances converted to EUR at the current rate. Historical totals use per-transaction FX snapshots."
              />
              <StatCard
                label="Total deposits"
                value="€3,606.36"
                original="6,166.88 AUD"
                change="+12.5%"
                trend="up"
                tooltip="Total deposited across all wallets, converted to EUR at the FX rate snapshotted on each transaction."
              />
              <StatCard
                label="Total withdrawals"
                value="€780.00"
                original="1,340.00 AUD"
                change="-3.2%"
                trend="down"
                tooltip="Total withdrawn across all wallets, converted to EUR at the FX rate snapshotted on each transaction."
              />
              <StatCard
                label="Net revenue"
                value="€2,826.36"
                original="4,833.08 AUD"
                change="+8.1%"
                trend="up"
                tooltip="Net revenue (deposits minus withdrawals), converted to EUR at per-transaction FX snapshots."
              />
            </div>

            {/* Wallets */}
            <WalletsCard />

            {/* Info blocks — row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              {/* Transactions */}
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <span className="text-sm font-medium">Transactions</span>
                </div>
                <div className="divide-y divide-border">
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-muted-foreground">Pending cashouts</span>
                    <div className="text-right">
                      <span className="text-sm font-medium tabular-nums">€102.24</span>
                      <span className="block text-xs text-muted-foreground tabular-nums">120.00 USDT</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sessions */}
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <span className="text-sm font-medium">Sessions</span>
                </div>
                <div className="divide-y divide-border">
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-muted-foreground">Active sessions</span>
                    <span className="text-sm font-medium tabular-nums">3</span>
                  </div>
                </div>
              </div>

              {/* Live state */}
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <span className="text-sm font-medium">Live state</span>
                </div>
                <div className="divide-y divide-border">
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-muted-foreground">Open bets</span>
                    <span className="text-sm font-medium tabular-nums">€0.00</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-muted-foreground">Bonus / Bonus Sport</span>
                    <div className="text-right">
                      <span className="text-sm font-medium tabular-nums">€0.00 (0.00/0)</span>
                      <span className="block text-xs text-muted-foreground tabular-nums">€0.00 (0.00/0)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-muted-foreground">Overdraft</span>
                    <span className="text-sm font-medium tabular-nums">0/0 EUR</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-muted-foreground">Freespins</span>
                    <span className="text-sm font-medium tabular-nums">0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info blocks — row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Adjustments */}
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <span className="text-sm font-medium">Adjustments</span>
                </div>
                <div className="divide-y divide-border">
                  {[
                    { label: 'Chargebacks', eur: '€0.00', aud: '0.00 AUD' },
                    { label: 'Unreceived deposits', eur: '€0.00', aud: '0.00 AUD' },
                    { label: 'Refunds', eur: '€0.00', aud: '0.00 AUD' },
                    { label: 'Reversals', eur: '€0.00', aud: '0.00 AUD' },
                    { label: 'Affiliate payments', eur: '€0.00', aud: '0.00 AUD' },
                  ].map(({ label, eur, aud }) => (
                    <div key={label} className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <div className="text-right">
                        <span className="text-sm font-medium tabular-nums">{eur}</span>
                        <span className="block text-xs text-muted-foreground tabular-nums">{aud}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gaming */}
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <span className="text-sm font-medium">Gaming</span>
                </div>
                <div className="divide-y divide-border">
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-muted-foreground">Avg bet</span>
                    <span className="text-sm font-medium tabular-nums">2.58</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-muted-foreground">Spent</span>
                    <div className="text-right">
                      <span className="inline-flex items-center rounded-md bg-success-bg px-2 py-0.5 text-xs font-semibold text-success tabular-nums">€1,080.35</span>
                      <span className="block text-xs text-muted-foreground tabular-nums mt-0.5">1,850.60 AUD</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-muted-foreground">Gifts sum</span>
                    <div className="text-right">
                      <span className="text-sm font-medium tabular-nums">€0.00</span>
                      <span className="block text-xs text-muted-foreground tabular-nums">0.00 AUD</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-muted-foreground">Bonuses</span>
                    <div className="text-right">
                      <span className="text-sm font-medium tabular-nums">€409.60</span>
                      <span className="block text-xs text-muted-foreground tabular-nums">701.89 AUD</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-muted-foreground">Bonus ratio</span>
                    <span className="text-sm font-medium tabular-nums">38%</span>
                  </div>
                </div>
              </div>
            </div>
    </>
  )
}
