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
import { OverviewTab } from './_components/overview-tab'
import { DuplicateFlag, type DuplicateState, PLAYER_WALLETS } from './_components/shared'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DATE_RANGE_PRESETS } from '@/components/ui/date-range-filter'
import type { DateRange } from 'react-day-picker'
import { CircleDot, Copy, Check, Crown, BadgeCheck, Trophy } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
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

// Tabs that have a DateRangeFilter; only the active tab's range is reflected in the URL
const DATE_TABS = new Set(['finance', 'bonuses', 'games-history', 'duplicates'])

const periodSlug = (label: string) => label.toLowerCase().replace(/\s+/g, '-')

// Local-date YYYY-MM-DD (toISOString would shift the day across timezones)
const fmtDateParam = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function parseDateParam(s: string | null): Date | undefined {
  const m = s && /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (!m) return undefined
  const d = new Date(+m[1], +m[2] - 1, +m[3])
  // JS Date rolls invalid months/days over (2026-99-99 -> a 2034 date) -- require a round-trip match
  return d.getMonth() === +m[2] - 1 && d.getDate() === +m[3] ? d : undefined
}

function dateRangeFromParams(params: { get(name: string): string | null }): DateRange | undefined {
  const period = params.get('period')
  if (period) {
    const preset = DATE_RANGE_PRESETS.find(p => periodSlug(p.label) === period)
    return preset?.range()
  }
  const from = parseDateParam(params.get('from'))
  if (!from) return undefined
  return { from, to: parseDateParam(params.get('to')) }
}

// Preset match -> ?period=<slug>; custom range -> ?from/?to; no range -> no params
function dateRangeParams(range: DateRange | undefined): [string, string][] {
  if (!range?.from) return []
  const { from, to } = range
  if (to) {
    const preset = DATE_RANGE_PRESETS.find(p => {
      const r = p.range()
      return r.from.toDateString() === from.toDateString() && r.to.toDateString() === to.toDateString()
    })
    if (preset) return [['period', periodSlug(preset.label)]]
    return [['from', fmtDateParam(from)], ['to', fmtDateParam(to)]]
  }
  return [['from', fmtDateParam(from)]]
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

  // Date range per tab, keyed by tab value; inactive tabs keep theirs in React only
  const [dateRanges, setDateRanges] = useState<Record<string, DateRange | undefined>>(() => {
    const t = searchParams.get('tab')
    if (!t || !DATE_TABS.has(t)) return {}
    const range = dateRangeFromParams(searchParams)
    return range ? { [t]: range } : {}
  })

  const setTabDateRange = (tabValue: string) => (range: DateRange | undefined) =>
    setDateRanges(prev => ({ ...prev, [tabValue]: range }))

  // Single URL sync point -- only deviations from defaults end up in the query,
  // via replaceState so tab switches never pollute browser history.
  useEffect(() => {
    const url = new URL(window.location.href)
    url.search = ''
    if (tab !== 'overview') url.searchParams.set('tab', tab)
    if (tab === 'bonuses' && bonusSubtab !== 'bonuses') url.searchParams.set('subtab', bonusSubtab)
    for (const [k, v] of dateRangeParams(dateRanges[tab])) url.searchParams.set(k, v)
    window.history.replaceState(null, '', url)
  }, [tab, bonusSubtab, dateRanges])

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
            <OverviewTab />
          </TabsContent>

          <TabsContent value="finance" forceMount className="flex flex-col gap-4 data-[state=inactive]:hidden">
            <FinanceTab playerCurrency={playerCurrency} fxRate={fxRate} dateRange={dateRanges['finance']} onDateRangeChange={setTabDateRange('finance')} />
          </TabsContent>
          <TabsContent value="statistics">
            <p className="text-sm text-muted-foreground">Statistics content coming soon.</p>
          </TabsContent>
          <TabsContent value="bonuses" forceMount className="flex flex-col gap-4 data-[state=inactive]:hidden">
            <BonusesTab playerCurrency={playerCurrency} fxRate={fxRate} subtab={bonusSubtab} onSubtabChange={setBonusSubtab} dateRange={dateRanges['bonuses']} onDateRangeChange={setTabDateRange('bonuses')} />
          </TabsContent>
          <TabsContent value="games-history" forceMount className="flex flex-col gap-4 data-[state=inactive]:hidden">
            <GameHistoryTab playerCurrency={playerCurrency} fxRate={fxRate} dateRange={dateRanges['games-history']} onDateRangeChange={setTabDateRange('games-history')} />
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
            <DuplicatesTab dateRange={dateRanges['duplicates']} onDateRangeChange={setTabDateRange('duplicates')} />
          </TabsContent>
          <TabsContent value="limits" forceMount className="flex flex-col gap-6 data-[state=inactive]:hidden">
            <LimitsTab playerName={playerName} playerCurrency={playerCurrency} fxRate={fxRate} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
