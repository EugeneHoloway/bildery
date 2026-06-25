'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { DashboardHeader } from '@/components/DashboardHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Info, TrendingUp, TrendingDown, Flag, CircleDot, Copy, Check, Crown, X, ExternalLink, BadgeCheck, Gift, Clock, Wallet, ArrowDownLeft, ArrowUpRight, Flame } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer'
import Link from 'next/link'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const MOCK_PLAYERS: Record<string, { name: string }> = {
  '2883575941': { name: 'Eugene Holoway' },
  '4515450354': { name: 'Dmytro Bevz' },
  '4712202994': { name: 'Test Test1' },
  '2940440381': { name: 'Test Test' },
  '2598013005': { name: 'Test Dima' },
  '1018817027': { name: 'Dmytro Bevz' },
  '8167315858': { name: 'Dmytro Bevz' },
  '3392817465': { name: 'Ariana Kowalski' },
  '7741209863': { name: 'Marco Ferretti' },
  '5520334871': { name: 'Sofia Andersen' },
  '9903847102': { name: 'Luca Müller' },
  '1147382956': { name: 'Oksana Petrenko' },
  '6628401739': { name: 'James Okafor' },
  '4480129357': { name: 'Yuki Tanaka' },
  '2271893640': { name: 'Fatima Al-Rashid' },
  '8834567012': { name: 'Carlos Vega' },
  '3315892074': { name: 'Emma Johansson' },
}

type MatchReason = 'Email' | 'Phone' | 'IP' | 'Device' | 'Payment'

type PaymentMethodEntry = {
  method: string
  qty: number
  amount: string
  amountEur: string
}

type DuplicateAccount = {
  id: string
  name: string
  email: string
  phone: string
  status: string
  statusGroup: 'active' | 'restricted' | 'closed' | 'archived'
  vip: boolean
  lastLogin: string
  balance: string
  balanceNative: string
  currency: string
  matchReasons: MatchReason[]
  paymentMethods: PaymentMethodEntry[]
  ipAddress: string
  userAgent: string
  fingerprint: string
  duplicateFlag: DuplicateState
  verified: boolean
  bonus: string
  pendingWithdrawal: string
  deposits: string
  depositCount: number
  withdrawals: string
  withdrawalCount: number
}

const MOCK_DUPLICATES: DuplicateAccount[] = [
  {
    id: '4515450354',
    name: 'Eugene H.',
    email: 'eugene.holoway@gmail.com',
    phone: '+49 30 1234567',
    status: 'Frozen by Suspicion',
    statusGroup: 'restricted',
    vip: false,
    lastLogin: '2026-06-20 14:32',
    balance: '€240.00',
    balanceNative: '410.50 AUD',
    currency: 'AUD',
    matchReasons: ['Email', 'IP'],
    paymentMethods: [
      { method: 'Visa •••• 4242', qty: 6, amount: 'A$1,030.00', amountEur: '€600.00' },
      { method: 'Mastercard •••• 1881', qty: 3, amount: 'A$515.00', amountEur: '€300.00' },
      { method: 'Paysafe •••• 3391', qty: 2, amount: 'A$310.00', amountEur: '€180.00' },
      { method: 'bc1qxy2...k3z (BTC)', qty: 1, amount: 'A$275.00', amountEur: '€160.00' },
    ],
    ipAddress: '85.214.132.117',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0',
    fingerprint: 'fp_a3b9c2d1e4f5',
    duplicateFlag: 'duplicate',
    verified: true,
    bonus: '€20.00', pendingWithdrawal: '€0.00', deposits: '€1,240.00', depositCount: 12, withdrawals: '€880.00', withdrawalCount: 7,
  },
  {
    id: '8167315858',
    name: 'E. Holoway',
    email: 'e.holoway.alt@proton.me',
    phone: '+49 30 1234567',
    status: 'Closed by Antifraud',
    statusGroup: 'closed',
    vip: true,
    lastLogin: '2026-05-11 09:14',
    balance: '€0.00',
    balanceNative: '0.00 AUD',
    currency: 'EUR',
    matchReasons: ['Phone', 'IP', 'Device'],
    paymentMethods: [
      { method: 'Visa •••• 4242', qty: 14, amount: '€5,200.00', amountEur: '€5,200.00' },
      { method: '1A2b3C4d...8xYz (BTC)', qty: 4, amount: '€3,200.00', amountEur: '€3,200.00' },
    ],
    ipAddress: '85.214.132.117',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1',
    fingerprint: 'fp_a3b9c2d1e4f5',
    duplicateFlag: 'blocked',
    verified: true,
    bonus: '€0.00', pendingWithdrawal: '€500.00', deposits: '€8,400.00', depositCount: 31, withdrawals: '€9,100.00', withdrawalCount: 18,
  },
  {
    id: '2598013005',
    name: 'Eugen Holov',
    email: 'eugen.holov@yahoo.de',
    phone: '+49 30 1234567',
    status: 'Under Review',
    statusGroup: 'restricted',
    vip: false,
    lastLogin: '2026-06-18 11:05',
    balance: '€85.50',
    balanceNative: '146.20 AUD',
    currency: 'AUD',
    matchReasons: ['Phone', 'Payment'],
    paymentMethods: [
      { method: 'Mastercard •••• 1881', qty: 4, amount: 'A$320.00', amountEur: '€187.00' },
    ],
    ipAddress: '91.108.56.204',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/123.0',
    fingerprint: 'fp_c7d2e9f1a0b3',
    duplicateFlag: 'duplicate',
    verified: false,
    bonus: '€45.00', pendingWithdrawal: '€85.50', deposits: '€320.00', depositCount: 4, withdrawals: '€180.00', withdrawalCount: 2,
  },
  {
    id: '1018817027',
    name: 'Gene Holoway',
    email: 'gene.holoway@gmail.com',
    phone: '+49 172 9988776',
    status: 'Frozen by Suspicion',
    statusGroup: 'restricted',
    vip: false,
    lastLogin: '2026-04-03 17:48',
    balance: '€12.30',
    balanceNative: '21.00 AUD',
    currency: 'AUD',
    matchReasons: ['Email', 'Device'],
    paymentMethods: [
      { method: 'Visa •••• 9910', qty: 1, amount: 'A$55.00', amountEur: '€32.00' },
      { method: 'bc1qxy2...k3z (BTC)', qty: 1, amount: 'A$21.00', amountEur: '€12.00' },
    ],
    ipAddress: '85.214.132.117',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0',
    fingerprint: 'fp_a3b9c2d1e4f5',
    duplicateFlag: 'duplicate',
    verified: false,
    bonus: '€0.00', pendingWithdrawal: '€0.00', deposits: '€55.00', depositCount: 1, withdrawals: '€0.00', withdrawalCount: 0,
  },
  {
    id: '2940440381',
    name: 'E. H.',
    email: 'e.h.anon@proton.me',
    phone: 'N/A',
    status: 'Archived',
    statusGroup: 'archived',
    vip: false,
    lastLogin: '2025-12-01 08:22',
    balance: '€0.00',
    balanceNative: '0.00 EUR',
    currency: 'EUR',
    matchReasons: ['IP', 'Device'],
    paymentMethods: [
      { method: 'Paysafe •••• 7731', qty: 1, amount: '€0.00', amountEur: '€0.00' },
    ],
    ipAddress: '91.108.56.204',
    userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Chrome/120.0',
    fingerprint: 'fp_c7d2e9f1a0b3',
    duplicateFlag: 'duplicate',
    verified: true,
    bonus: '€10.00', pendingWithdrawal: '€0.00', deposits: '€0.00', depositCount: 0, withdrawals: '€0.00', withdrawalCount: 0,
  },
]

const MATCH_REASON_COLORS: Record<MatchReason, string> = {
  Email:   'bg-muted text-muted-foreground border-border',
  Phone:   'bg-muted text-muted-foreground border-border',
  IP:      'bg-muted text-muted-foreground border-border',
  Device:  'bg-muted text-muted-foreground border-border',
  Payment: 'bg-muted text-muted-foreground border-border',
}

const STATUS_GROUP_COLOR: Record<string, string> = {
  active:     'text-success',
  restricted: 'text-warning',
  closed:     'text-destructive',
  archived:   'text-muted-foreground',
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

function StatCard({
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

// duplicate flag state: 'ok' | 'duplicate' | 'blocked'
type DuplicateState = 'ok' | 'duplicate' | 'blocked'

function DuplicateFlag({ state }: { state: DuplicateState }) {
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
            <span className="inline-flex items-center gap-1 text-sm font-medium text-warning">
              <Flag className="size-3.5 fill-warning" />
              Duplicates
            </span>
          </TooltipTrigger>
          <TooltipContent>This player has duplicate accounts</TooltipContent>
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

export default function PlayerProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [status, setStatus] = useState<string>('Open')
  const [vip, setVip] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedDuplicate, setSelectedDuplicate] = useState<DuplicateAccount | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [copiedDupId, setCopiedDupId] = useState<string | null>(null)
  const [copiedDrawerId, setCopiedDrawerId] = useState(false)

  function copyDupId(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    navigator.clipboard.writeText(id)
    setCopiedDupId(id)
    setTimeout(() => setCopiedDupId(null), 1500)
  }
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  function copyId() {
    navigator.clipboard.writeText(id)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  const duplicate: DuplicateState = 'ok'

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

      <div className="flex flex-1 flex-col gap-4 px-6 pt-4 pb-8">
        {/* Title row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center shrink-0">
              <span className="text-base font-semibold text-muted-foreground">
                {playerName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              Player Profile: {playerName}
              <BadgeCheck className="size-5 text-brand" />
              {vip && <Crown className="size-5 text-warning" />}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              Player ID: {id}
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
          <div className="flex items-center gap-2 pt-1 shrink-0">
            <span className="text-sm text-muted-foreground">Status</span>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger size="sm" className="w-[190px]">
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

        {/* Player meta info bar */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {/* Type -- read-only */}
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">Type</span>
            <span className="inline-flex items-center rounded-md border border-border px-2 py-0.5 text-xs font-semibold text-foreground">
              Casino
            </span>
          </div>

          <div className="h-4 w-px bg-border" />

          {/* Online */}
          <div className="flex items-center gap-1.5">
            <CircleDot className="size-3.5 text-muted-foreground/40" />
            <span className="text-sm text-muted-foreground">Offline</span>
          </div>

          <div className="h-4 w-px bg-border" />

          {/* VIP */}
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <Checkbox
              checked={vip}
              onCheckedChange={checked => setVip(checked === true)}
              id="vip-toggle"
            />
            <span className="text-sm font-medium text-muted-foreground">VIP</span>
          </label>

          <div className="h-4 w-px bg-border" />

          {/* Duplicates */}
          <DuplicateFlag state={duplicate} />

          <div className="h-4 w-px bg-border" />

          {/* Currency */}
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">Currency</span>
            <span className="inline-flex items-center rounded-md border border-border px-2 py-0.5 text-xs font-semibold text-foreground">
              AUD
            </span>
          </div>

        </div>

        <Tabs defaultValue="overview" className="flex flex-col gap-4">
          <TabsList className="h-auto w-full justify-start gap-0 rounded-none border-b border-border bg-transparent p-0">
            {TABS.map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Balance"
                value="€0.00"
                original="0.00 AUD"
                change="-€290.00"
                trend="down"
                tooltip="Current account balance, converted to EUR."
              />
              <StatCard
                label="Total deposits"
                value="€2,820.00"
                original="4,820.00 AUD"
                change="+12.5%"
                trend="up"
                tooltip="Total deposited, converted to EUR."
              />
              <StatCard
                label="Total withdrawals"
                value="€780.00"
                original="1,340.00 AUD"
                change="-3.2%"
                trend="down"
                tooltip="Total withdrawn, converted to EUR."
              />
              <StatCard
                label="Net revenue"
                value="€2,040.00"
                original="3,480.00 AUD"
                change="+8.1%"
                trend="up"
                tooltip="Net revenue (deposits minus withdrawals), converted to EUR."
              />
            </div>

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
                      <span className="text-sm font-medium tabular-nums">€0.00</span>
                      <span className="block text-xs text-muted-foreground tabular-nums">0.00 AUD</span>
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

          <TabsContent value="finance">
            <p className="text-sm text-muted-foreground">Finance content coming soon.</p>
          </TabsContent>
          <TabsContent value="statistics">
            <p className="text-sm text-muted-foreground">Statistics content coming soon.</p>
          </TabsContent>
          <TabsContent value="bonuses">
            <p className="text-sm text-muted-foreground">Bonuses content coming soon.</p>
          </TabsContent>
          <TabsContent value="games-history">
            <p className="text-sm text-muted-foreground">Games history content coming soon.</p>
          </TabsContent>
          <TabsContent value="sport-history">
            <p className="text-sm text-muted-foreground">Sport history content coming soon.</p>
          </TabsContent>
          <TabsContent value="duplicates" className="flex flex-col gap-4">
            <div>
              <h2 className="text-base font-semibold">Duplicate accounts</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Other accounts in the system linked to this player.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/60">
                    <TableRow className="hover:bg-transparent border-b border-border">
                      <TableHead className="text-sm font-medium text-foreground pl-4">Player ID</TableHead>
                      <TableHead className="text-sm font-medium text-foreground">Name</TableHead>
                      <TableHead className="text-sm font-medium text-foreground">Status</TableHead>
                      <TableHead className="text-sm font-medium text-foreground">Match reason</TableHead>
                      <TableHead className="text-sm font-medium text-foreground">Payment methods</TableHead>
                      <TableHead className="text-sm font-medium text-foreground">Balance</TableHead>
                      <TableHead className="text-sm font-medium text-foreground">Last login</TableHead>
                      <TableHead className="pr-4 text-sm font-medium text-foreground">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_DUPLICATES.map(dup => (
                      <TableRow
                        key={dup.id}
                        className="cursor-pointer"
                        onClick={() => { setSelectedDuplicate(dup); setDrawerOpen(true) }}
                      >
                        <TableCell className="pl-4">
                          <div className="flex items-center gap-1.5">
                            {dup.duplicateFlag === 'blocked' ? (
                              <Flag className="size-3.5 fill-destructive text-destructive shrink-0" />
                            ) : (
                              <Flag className="size-3.5 fill-warning text-warning shrink-0" />
                            )}
                            <span className="text-sm font-medium underline underline-offset-2">{dup.id}</span>
                            <button
                              onClick={(e) => copyDupId(e, dup.id)}
                              className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                              aria-label="Copy ID"
                            >
                              {copiedDupId === dup.id
                                ? <Check className="size-3.5 text-muted-foreground" />
                                : <Copy className="size-3.5" />}
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm">
                            {dup.name}
                            {dup.verified && <BadgeCheck className="size-3.5 text-brand shrink-0" />}
                            {dup.vip && <Crown className="size-3.5 text-warning shrink-0" />}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {dup.status}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {dup.matchReasons.map(r => (
                              <span key={r} className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-medium ${MATCH_REASON_COLORS[r]}`}>
                                {r}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {dup.paymentMethods.length > 0 && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-muted-foreground">
                                {dup.paymentMethods[dup.paymentMethods.length - 1].method}
                              </span>
                              {dup.paymentMethods.length > 1 && (
                                <TooltipProvider delayDuration={200}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="text-xs text-muted-foreground underline underline-offset-2 cursor-default">
                                        +{dup.paymentMethods.length - 1} more
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="flex flex-col gap-1 text-xs">
                                      {dup.paymentMethods.slice(0, -1).map(pm => (
                                        <span key={pm.method}>{pm.method}</span>
                                      ))}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium tabular-nums">{dup.balance}</span>
                          <span className="block text-xs text-muted-foreground tabular-nums">{dup.balanceNative}</span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{dup.lastLogin}</TableCell>
                        <TableCell className="pr-4">
                          <button className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors whitespace-nowrap">
                            Details
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Duplicate detail drawer */}
            <Drawer
              open={drawerOpen}
              onOpenChange={setDrawerOpen}
              direction={isMobile ? 'bottom' : 'right'}
            >
              <DrawerContent className="sm:max-w-[400px] flex flex-col">
                <DrawerHeader className="border-b border-border flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-muted-foreground">
                        {selectedDuplicate?.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <DrawerTitle className="flex items-center gap-1.5">
                        {selectedDuplicate?.name}
                        {selectedDuplicate?.verified && <BadgeCheck className="size-4 text-brand shrink-0" />}
                      </DrawerTitle>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground font-mono">#{selectedDuplicate?.id}</span>
                        <button
                          onClick={() => {
                            if (selectedDuplicate) {
                              navigator.clipboard.writeText(selectedDuplicate.id)
                              setCopiedDrawerId(true)
                              setTimeout(() => setCopiedDrawerId(false), 1500)
                            }
                          }}
                          className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                          aria-label="Copy ID"
                        >
                          {copiedDrawerId
                            ? <Check className="size-3 text-muted-foreground" />
                            : <Copy className="size-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon-sm">
                      <X className="size-4" />
                    </Button>
                  </DrawerClose>
                </DrawerHeader>

                {selectedDuplicate && (
                  <div className="flex flex-col gap-5 flex-1 overflow-y-auto px-4 py-5 min-h-0">

                    {/* Identity — muted card */}
                    <div className="flex flex-col gap-1.5">
                      <div>
                        <p className="text-base font-medium">Identity</p>
                        <p className="text-sm text-muted-foreground">Personal details of this account.</p>
                      </div>
                      <div className="divide-y divide-border overflow-hidden">
                        {[
                          { label: 'Email', value: selectedDuplicate.email },
                          { label: 'Phone', value: selectedDuplicate.phone },
                          { label: 'Last login', value: selectedDuplicate.lastLogin },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex items-center justify-between py-2">
                            <span className="text-sm text-muted-foreground">{label}</span>
                            <span className="text-sm font-medium">{value}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-muted-foreground">Currency</span>
                          <Badge variant="outline" className="rounded-md">{selectedDuplicate.currency}</Badge>
                        </div>
                      </div>
                    </div>

                    <hr className="border-border -mx-4" />

                    {/* Finance */}
                    <div className="flex flex-col gap-1.5">
                      <div>
                        <p className="text-base font-medium">Finance</p>
                        <p className="text-sm text-muted-foreground">Balance and financial summary.</p>
                      </div>
                      <div className="rounded-xl bg-muted/60">
                      {/* Balance large */}
                      <div className="px-4 pt-4 pb-3 flex flex-col gap-0.5">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Wallet className="size-4 shrink-0" />
                          Balance
                        </div>
                        <span className="text-3xl font-semibold tabular-nums">{selectedDuplicate.balance}</span>
                        <span className="text-xs text-muted-foreground tabular-nums">{selectedDuplicate.balanceNative}</span>
                      </div>
                      {/* Bonus + Pending withdrawal */}
                      <div className="border-t border-border divide-y divide-border">
                        <div className="flex items-center justify-between px-4 py-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Gift className="size-4 shrink-0" />
                            Bonus
                          </div>
                          <span className="text-sm font-medium tabular-nums">{selectedDuplicate.bonus}</span>
                        </div>
                        <div className="flex items-center justify-between px-4 py-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="size-4 shrink-0" />
                            Pending withdrawal
                          </div>
                          <span className="text-sm font-medium tabular-nums">{selectedDuplicate.pendingWithdrawal}</span>
                        </div>
                      </div>
                      {/* Deposits / Withdrawals */}
                      <div className="border-t border-border grid grid-cols-2 divide-x divide-border">
                        <div className="px-4 py-3 flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <ArrowDownLeft className="size-4 shrink-0" />
                            Deposits
                          </div>
                          <span className="text-xl font-semibold tabular-nums">{selectedDuplicate.deposits}</span>
                          <span className="text-sm text-muted-foreground">{selectedDuplicate.depositCount} times</span>
                        </div>
                        <div className="px-4 py-3 flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <ArrowUpRight className="size-4 shrink-0" />
                            Withdrawals
                          </div>
                          <span className="text-xl font-semibold tabular-nums">{selectedDuplicate.withdrawals}</span>
                          <span className="text-sm text-muted-foreground">{selectedDuplicate.withdrawalCount} times</span>
                        </div>
                      </div>
                    </div>
                    </div>

                    {/* Active Bonus */}
                    <div className="flex flex-col gap-1.5">
                      <div>
                        <p className="text-base font-medium">Active Bonus</p>
                        <p className="text-sm text-muted-foreground">Current bonus and wagering progress.</p>
                      </div>
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Flame className="size-4 text-warning shrink-0" />
                        100% Deposit Bonus
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Wagered</span>
                        <span className="text-sm text-foreground">€340 / €500</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-muted-foreground/20">
                        <div className="h-1.5 rounded-full bg-warning" style={{width: '68%'}} />
                      </div>
                      <span className="text-xs text-muted-foreground">Expires Jan 20, 2026</span>
                    </div>

                    {/* Payment Methods table */}
                    <div className="flex flex-col gap-1.5">
                      <div>
                        <p className="text-base font-medium">Payment Methods</p>
                        <p className="text-sm text-muted-foreground">Deposits by payment method.</p>
                      </div>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="pb-2 text-left text-sm font-medium text-muted-foreground">Method</th>
                            <th className="pb-2 text-right text-sm font-medium text-muted-foreground">Q-ty</th>
                            <th className="pb-2 text-right text-sm font-medium text-muted-foreground">Amount</th>
                            <th className="pb-2 text-right text-sm font-medium text-muted-foreground">Amount (EUR)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {selectedDuplicate.paymentMethods.map(pm => (
                            <tr key={pm.method}>
                              <td className="py-2 text-sm pr-2">{pm.method}</td>
                              <td className="py-2 text-sm text-right tabular-nums text-muted-foreground">{pm.qty}</td>
                              <td className="py-2 text-sm text-right tabular-nums text-muted-foreground">{pm.amount}</td>
                              <td className="py-2 text-sm text-right tabular-nums text-muted-foreground">{pm.amountEur}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-border">
                            <td colSpan={3} className="pt-2 text-sm font-medium text-right pr-4">Total</td>
                            <td className="pt-2 text-sm font-medium text-right tabular-nums">
                              {(() => {
                                const total = selectedDuplicate.paymentMethods.reduce((sum, pm) => {
                                  const val = parseFloat(pm.amountEur.replace(/[^0-9.]/g, ''))
                                  return sum + (isNaN(val) ? 0 : val)
                                }, 0)
                                return `€${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              })()}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <hr className="border-border -mx-4" />

                    {/* Technical — muted card */}
                    <div className="flex flex-col gap-1.5">
                      <div>
                        <p className="text-base font-medium">Technical</p>
                        <p className="text-sm text-muted-foreground">Device and network fingerprint data.</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2 gap-4">
                          <span className="text-sm text-muted-foreground shrink-0">IP address</span>
                          <span className="text-xs font-mono">{selectedDuplicate.ipAddress}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2 gap-4">
                          <span className="text-sm text-muted-foreground shrink-0">Fingerprint</span>
                          <span className="text-xs font-mono">{selectedDuplicate.fingerprint}</span>
                        </div>
                        <div className="flex flex-col gap-1.5 rounded-lg border border-border px-3 py-2">
                          <span className="text-sm text-muted-foreground">User agent</span>
                          <span className="text-xs font-mono break-all leading-relaxed">{selectedDuplicate.userAgent}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
                {selectedDuplicate && (
                  <div className="shrink-0 border-t border-border bg-muted p-4">
                    <Link href={`/player/${selectedDuplicate.id}`}>
                      <Button variant="default" className="w-full gap-2">
                        <ExternalLink className="size-4" />
                        Open full profile
                      </Button>
                    </Link>
                  </div>
                )}
              </DrawerContent>
            </Drawer>
          </TabsContent>
          <TabsContent value="limits">
            <p className="text-sm text-muted-foreground">Limits content coming soon.</p>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
