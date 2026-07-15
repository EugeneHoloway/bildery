'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { DashboardHeader } from '@/components/DashboardHeader'
import { GameHistoryTab } from './_components/game-history-tab'
import { DuplicatesTab } from './_components/duplicates-tab'
import { FinanceTab } from './_components/finance-tab'
import { BonusesTab } from './_components/bonuses-tab'
import { LimitsTab } from './_components/limits-tab'
import { DuplicateFlag, type DuplicateState, StatCard, PLAYER_WALLETS, FUNDED_WALLETS, EMPTY_WALLETS, WALLETS_TOTAL_EUR, fmtEur, fmtWalletAmount } from './_components/shared'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Info, CircleDot, Copy, Check, Crown, X, BadgeCheck, Trophy, ChevronDown, ChevronUp } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const MOCK_PLAYERS: Record<string, { name: string; currency: string; fxRate: number; country?: string; countryFlag?: string }> = {
  '2883575941': { name: 'Tony Stark',      currency: 'AUD', fxRate: 1.71, country: 'Australia', countryFlag: '🇦🇺' },
  '4515450354': { name: 'John Wick',       currency: 'AUD', fxRate: 1.71 },
  '4712202994': { name: 'Walter White',    currency: 'EUR', fxRate: 1.00 },
  '2940440381': { name: 'Ellen Ripley',    currency: 'AUD', fxRate: 1.71 },
  '2598013005': { name: 'Holly Golightly', currency: 'EUR', fxRate: 1.00 },
  '1018817027': { name: 'Tyler Durden',    currency: 'AUD', fxRate: 1.71 },
  '8167315858': { name: 'Patrick Bateman', currency: 'EUR', fxRate: 1.00 },
  '3392817465': { name: 'Don Corleone',    currency: 'EUR', fxRate: 1.00 },
  '7741209863': { name: 'Lara Croft',      currency: 'AUD', fxRate: 1.71 },
  '5520334871': { name: 'Jack Torrance',    currency: 'EUR', fxRate: 1.00 },
  '9903847102': { name: 'Hannibal Lecter',  currency: 'EUR', fxRate: 1.00 },
  '1147382956': { name: 'Jules Winnfield',  currency: 'AUD', fxRate: 1.71 },
  '6628401739': { name: 'Clarice Starling', currency: 'EUR', fxRate: 1.00 },
  '4480129357': { name: 'Travis Bickle',    currency: 'AUD', fxRate: 1.71 },
  '2271893640': { name: 'Marge Gunderson',  currency: 'EUR', fxRate: 1.00 },
  '8834567012': { name: 'Vincent Vega',     currency: 'AUD', fxRate: 1.71 },
  '3315892074': { name: 'Beatrix Kiddo',    currency: 'EUR', fxRate: 1.00 },
}

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'finance', label: 'Finance' },
  { value: 'statistics', label: 'Statistics' },
  { value: 'bonuses', label: 'Bonuses' },
  { value: 'games-history', label: 'Games history' },
  { value: 'sport-history', label: 'Sport history' },
  { value: 'duplicates', label: 'Duplicates' },
  { value: 'limits', label: 'Limits' },
]

const TAB_VALUES = new Set(TABS.map(t => t.value))
// benefits/packages are disabled sub-tabs -- not restorable from URL
const BONUS_SUBTAB_VALUES = new Set(['bonuses', 'shop'])

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

export default function PlayerProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const searchParams = useSearchParams()
  const [tab, setTab] = useState<string>(() => {
    const t = searchParams.get('tab')
    return t && TAB_VALUES.has(t) ? t : 'overview'
  })

  const [status, setStatus] = useState<string>('Open')
  const [pendingStatus, setPendingStatus] = useState<string | null>(null)
  const [vip, setVip] = useState(false)
  const [copied, setCopied] = useState(false)

  const [bonusSubtab, setBonusSubtab] = useState(() => {
    const s = searchParams.get('subtab')
    return searchParams.get('tab') === 'bonuses' && s && BONUS_SUBTAB_VALUES.has(s) ? s : 'bonuses'
  })

  // Single URL sync point -- only deviations from defaults end up in the query,
  // via replaceState so tab switches never pollute browser history.
  useEffect(() => {
    const url = new URL(window.location.href)
    url.search = ''
    if (tab !== 'overview') url.searchParams.set('tab', tab)
    if (tab === 'bonuses' && bonusSubtab !== 'bonuses') url.searchParams.set('subtab', bonusSubtab)
    window.history.replaceState(null, '', url)
  }, [tab, bonusSubtab])

  function copyId() {
    navigator.clipboard.writeText(id)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  const duplicate: DuplicateState = 'duplicate'

  const STATUS_GROUPS = [
    {
      group: 'Active',
      color: 'text-success',
      statuses: ['Open', 'Pending Verification'],
    },
    {
      group: 'Restricted',
      color: 'text-warning',
      statuses: [
        'Frozen',
        'Frozen by Refund',
        'Frozen by Suspicion',
        'Frozen by Security Answer',
        'Temporary Frozen',
        'Self-Exclusion Temporary',
        'Under Review',
      ],
    },
    {
      group: 'Closed',
      color: 'text-destructive',
      statuses: [
        'Closed',
        'Closed by User',
        'Closed by Regulator',
        'Closed by License',
        'Closed by Antifraud',
        'Closed by Chargeback',
        'Self-Exclusion Permanent',
        'Gambling Addiction',
      ],
    },
    {
      group: 'Archived',
      color: 'text-muted-foreground',
      statuses: ['Not Verified', 'Archived'],
    },
  ]

  const groupColorByStatus = Object.fromEntries(
    STATUS_GROUPS.flatMap(g => g.statuses.map(s => [s, g.color]))
  )

  useEffect(() => {
    if (!loading && !user) router.replace('/')
  }, [user, loading, router])

  if (loading || !user) return null

  const player = MOCK_PLAYERS[id]
  const playerName = player?.name ?? 'Unknown Player'
  const playerCurrency = player?.currency ?? 'EUR'
  const fxRate = player?.fxRate ?? 1.00

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: 'Bildery', href: '/dashboard' },
          { label: 'PAM', href: '/all-players' },
          { label: 'All Players', href: '/all-players' },
          { label: playerName },
        ]}
      />

      <div className="flex flex-1 flex-col gap-4 px-4 sm:px-6 pt-4 pb-8">
        {/* Title row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          {/* Avatar + name block */}
          <div className="flex items-center gap-3">
            <div className="size-10 sm:size-12 rounded-full bg-muted flex items-center justify-center shrink-0">
              <span className="text-sm sm:text-base font-semibold text-muted-foreground">
                {playerName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-semibold flex flex-wrap items-center gap-x-1.5 gap-y-0.5 leading-snug">
                <span className="hidden sm:inline text-muted-foreground font-normal">Player Profile:</span>
                <span className="truncate">{playerName}</span>
                <BadgeCheck className="size-3.5 sm:size-4 text-brand shrink-0 -mt-3" />
                {vip && <Crown className="size-3.5 sm:size-4 text-warning shrink-0 -mt-3" />}
              </h1>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                <span className="hidden sm:inline">Player ID:</span>
                <span>{id}</span>
                <button
                  onClick={copyId}
                  className="inline-flex items-center text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                  aria-label="Copy player ID"
                >
                  {copied
                    ? <Check className="size-3.5 text-muted-foreground" />
                    : <Copy className="size-3.5" />}
                </button>
              </p>
            </div>
          </div>
          {/* Status dropdown */}
          <div className="flex items-center gap-2 sm:pt-1 sm:shrink-0">
            <span className="text-sm text-muted-foreground">Status</span>
            <Select value={status} onValueChange={val => setPendingStatus(val)}>
              <SelectTrigger size="sm" className="w-auto sm:w-[190px]">
                <span className="text-sm text-foreground">{status}</span>
              </SelectTrigger>
              <SelectContent className="max-h-[320px]">
                {STATUS_GROUPS.map((g, i) => (
                  <span key={g.group}>
                    {i > 0 && <SelectSeparator />}
                    <SelectGroup>
                      <SelectLabel className="text-xs text-muted-foreground font-normal">
                        {g.group}
                      </SelectLabel>
                      {g.statuses.map(s => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </span>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Status change confirmation */}
        <AlertDialog open={pendingStatus !== null} onOpenChange={open => { if (!open) setPendingStatus(null) }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Change player status?</AlertDialogTitle>
              <AlertDialogDescription>
                Status will be changed from <span className="font-medium text-foreground">{status}</span> to <span className="font-medium text-foreground">{pendingStatus}</span>. This action will take effect immediately.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPendingStatus(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => { if (pendingStatus) { setStatus(pendingStatus); setPendingStatus(null) } }}>Apply</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Player meta info bar */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {/* Country */}
          {player?.country && (
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-muted-foreground">Country</span>
              <span className="inline-flex items-center rounded-md border border-border px-2 py-0.5 text-xs font-semibold text-foreground">
                {player.country}
              </span>
            </div>
          )}

          <div className="hidden sm:block h-4 w-px bg-border" />

          {/* Base currency -- registration currency; bonuses, limits and segmentation are defined in it */}
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">Base currency</span>
            <span className="inline-flex items-center rounded-md border border-border px-2 py-0.5 text-xs font-semibold text-foreground">
              {playerCurrency}
            </span>
          </div>

          <div className="hidden sm:block h-4 w-px bg-border" />

          {/* Wallets */}
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">Wallets</span>
            <span className="inline-flex items-center rounded-md border border-border px-2 py-0.5 text-xs font-semibold text-foreground">
              {PLAYER_WALLETS.length}
            </span>
          </div>

          <div className="hidden sm:block h-4 w-px bg-border" />

          {/* Type -- read-only */}
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">Type</span>
            <span className="inline-flex items-center rounded-md border border-border px-2 py-0.5 text-xs font-semibold text-foreground">
              Casino
            </span>
          </div>

          <div className="hidden sm:block h-4 w-px bg-border" />

          {/* Online */}
          <div className="flex items-center gap-1.5">
            <CircleDot className="size-3.5 text-muted-foreground/40" />
            <span className="text-sm text-muted-foreground">Offline</span>
          </div>

          <div className="hidden sm:block h-4 w-px bg-border" />

          {/* VIP */}
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <Checkbox
              checked={vip}
              onCheckedChange={checked => setVip(checked === true)}
              id="vip-toggle"
            />
            <span className="text-sm font-medium text-muted-foreground">VIP</span>
          </label>

          <div className="hidden sm:block h-4 w-px bg-border" />

          {/* Duplicates */}
          <DuplicateFlag state={duplicate} />

        </div>

        <Tabs value={tab} onValueChange={setTab} className="flex flex-col gap-4">
          <div className="relative -mx-4 sm:mx-0">
            {/* Left fade -- only visible on mobile when scrolled */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-background to-transparent z-10 sm:hidden" />
            {/* Right fade -- only visible on mobile */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-background to-transparent z-10 sm:hidden" />
            <div className="overflow-x-auto scrollbar-hide px-4 sm:px-0">
              <TabsList className="h-auto w-max sm:w-full justify-start gap-0 rounded-none border-b border-border bg-transparent p-0">
                {TABS.map(tab => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium whitespace-nowrap data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          <TabsContent value="overview" className="flex flex-col gap-4">
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
          </TabsContent>

          <TabsContent value="finance" forceMount className="flex flex-col gap-4 data-[state=inactive]:hidden">
            <FinanceTab playerCurrency={playerCurrency} fxRate={fxRate} />
          </TabsContent>
          <TabsContent value="statistics">
            <p className="text-sm text-muted-foreground">Statistics content coming soon.</p>
          </TabsContent>
          <TabsContent value="bonuses" forceMount className="flex flex-col gap-4 data-[state=inactive]:hidden">
            <BonusesTab playerCurrency={playerCurrency} fxRate={fxRate} subtab={bonusSubtab} onSubtabChange={setBonusSubtab} />
          </TabsContent>
          <TabsContent value="games-history" forceMount className="flex flex-col gap-4 data-[state=inactive]:hidden">
            <GameHistoryTab playerCurrency={playerCurrency} fxRate={fxRate} />
          </TabsContent>
          <TabsContent value="sport-history">
            <div className="flex flex-col items-center gap-3 text-center py-20">
              <div className="size-12 rounded-xl bg-muted flex items-center justify-center">
                <Trophy className="size-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-base font-medium text-foreground">No sport history</p>
                <p className="text-sm text-muted-foreground mt-1">This player has no sports betting activity yet.</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="duplicates" forceMount className="flex flex-col gap-4 data-[state=inactive]:hidden">
            <DuplicatesTab />
          </TabsContent>
          <TabsContent value="limits" forceMount className="flex flex-col gap-6 data-[state=inactive]:hidden">
            <LimitsTab playerName={playerName} playerCurrency={playerCurrency} fxRate={fxRate} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
