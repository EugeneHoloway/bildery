'use client'

import { useCallback, useLayoutEffect, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, BadgeCheck, Check, Clock, Columns2, Copy, Crown, Download, ExternalLink, Flag, Flame, Gift, Pin, PinOff, Search, SlidersHorizontal, Wallet, X } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer'
import { DateRangeFilter } from '@/components/ui/date-range-filter'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import type { DateRange } from 'react-day-picker'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PillToggle, type DuplicateState } from './shared'

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
    name: 'Tony S.',
    email: 'tony.stark@starkindustries.com',
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
    name: 'T. Stark',
    email: 't.stark.alt@proton.me',
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
    name: 'Toni Stark',
    email: 'toni.stark@yahoo.de',
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
    name: 'Anton Stark',
    email: 'anton.stark@gmail.com',
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
    name: 'T. S.',
    email: 't.s.anon@proton.me',
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

const DUP_COLS = [
  { key: 'id',             label: 'Player ID' },
  { key: 'name',           label: 'Name' },
  { key: 'status',         label: 'Status' },
  { key: 'matchReasons',   label: 'Match reason' },
  { key: 'paymentMethods', label: 'Payment methods' },
  { key: 'balance',        label: 'Balance' },
  { key: 'lastLogin',      label: 'Last login' },
] as const

type DupColKey = typeof DUP_COLS[number]['key']

const DUP_STATUSES = ['active', 'restricted', 'closed', 'archived'] as const
const MATCH_REASONS: MatchReason[] = ['Email', 'Phone', 'IP', 'Device', 'Payment']
const DUP_FLAGS: DuplicateState[] = ['ok', 'duplicate', 'blocked']
const DUP_CURRENCIES = ['EUR', 'AUD', 'USD', 'GBP']

type DupFilterState = {
  statusGroups: Set<string>
  matchReasons: Set<MatchReason>
  flags: Set<DuplicateState>
  currencies: Set<string>
  vip: '' | 'yes' | 'no'
  verified: '' | 'yes' | 'no'
}

function emptyDupFilters(): DupFilterState {
  return { statusGroups: new Set(), matchReasons: new Set(), flags: new Set(), currencies: new Set(), vip: '', verified: '' }
}

function DupFiltersPopover() {
  const [filters, setFilters] = useState<DupFilterState>(emptyDupFilters)

  function toggleSet<T extends string>(key: 'statusGroups' | 'matchReasons' | 'flags' | 'currencies', val: T) {
    setFilters(prev => {
      const next = new Set(prev[key]) as Set<T>
      if (next.has(val)) next.delete(val)
      else next.add(val)
      return { ...prev, [key]: next }
    })
  }

  const dirtyCount =
    filters.statusGroups.size + filters.matchReasons.size + filters.flags.size +
    filters.currencies.size + (filters.vip ? 1 : 0) + (filters.verified ? 1 : 0)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="size-3.5" />
          <span className="hidden sm:inline">Filters</span>
          {dirtyCount > 0 && (
            <span className="ml-0.5 flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background">
              {dirtyCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-[300px] p-0 flex flex-col max-h-[min(480px,var(--radix-popover-content-available-height))]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-semibold">Filters</span>
          <button
            type="button"
            onClick={() => setFilters(emptyDupFilters())}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        </div>
        <div className="flex flex-col gap-4 px-4 py-4 flex-1 overflow-y-auto min-h-0">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Status</span>
            <div className="flex flex-wrap gap-2">
              {DUP_STATUSES.map(s => (
                <PillToggle
                  key={s}
                  label={s.charAt(0).toUpperCase() + s.slice(1)}
                  selected={filters.statusGroups.has(s)}
                  onToggle={() => toggleSet('statusGroups', s)}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Match reason</span>
            <div className="flex flex-wrap gap-2">
              {MATCH_REASONS.map(r => (
                <PillToggle key={r} label={r} selected={filters.matchReasons.has(r)} onToggle={() => toggleSet('matchReasons', r)} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Flag</span>
            <div className="flex flex-wrap gap-2">
              {DUP_FLAGS.map(f => (
                <PillToggle
                  key={f}
                  label={f.charAt(0).toUpperCase() + f.slice(1)}
                  selected={filters.flags.has(f)}
                  onToggle={() => toggleSet('flags', f)}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Currency</span>
            <div className="flex flex-wrap gap-2">
              {DUP_CURRENCIES.map(c => (
                <PillToggle key={c} label={c} selected={filters.currencies.has(c)} onToggle={() => toggleSet('currencies', c)} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">VIP</span>
            <div className="flex gap-2">
              {(['', 'yes', 'no'] as const).map(v => (
                <PillToggle key={v || 'any'} label={v === '' ? 'Any' : v === 'yes' ? 'Yes' : 'No'} selected={filters.vip === v} onToggle={() => setFilters(f => ({ ...f, vip: f.vip === v ? '' : v }))} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Verified</span>
            <div className="flex gap-2">
              {(['', 'yes', 'no'] as const).map(v => (
                <PillToggle key={v || 'any'} label={v === '' ? 'Any' : v === 'yes' ? 'Yes' : 'No'} selected={filters.verified === v} onToggle={() => setFilters(f => ({ ...f, verified: f.verified === v ? '' : v }))} />
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-border px-4 py-3">
          <Button className="w-full">Apply</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function DuplicatesTab() {
  const [selectedDuplicate, setSelectedDuplicate] = useState<DuplicateAccount | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [copiedDupId, setCopiedDupId] = useState<string | null>(null)
  const [copiedDrawerId, setCopiedDrawerId] = useState(false)

  const [dupScrollNode, setDupScrollNode] = useState<HTMLDivElement | null>(null)
  const [dupHasOverflow, setDupHasOverflow] = useState(false)
  const dupScrollRef = useCallback((node: HTMLDivElement | null) => setDupScrollNode(node), [])
  useLayoutEffect(() => {
    if (!dupScrollNode) return
    const check = () => setDupHasOverflow(dupScrollNode.scrollWidth > dupScrollNode.clientWidth)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(dupScrollNode)
    window.addEventListener('resize', check)
    return () => { ro.disconnect(); window.removeEventListener('resize', check) }
  }, [dupScrollNode])

  const [dupSearch, setDupSearch] = useState('')
  const [dupVisibleCols, setDupVisibleCols] = useState<Set<DupColKey>>(
    new Set<DupColKey>(['id','name','status','matchReasons','paymentMethods','balance','lastLogin'])
  )
  const [dupColOpen, setDupColOpen] = useState(false)
  const [dupPlayerIdFrozen, setDupPlayerIdFrozen] = useState(true)
  const [dupDateRange, setDupDateRange] = useState<DateRange | undefined>(undefined)

  function toggleDupCol(key: DupColKey) {
    setDupVisibleCols(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function copyDupId(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    navigator.clipboard.writeText(id)
    setCopiedDupId(id)
    setTimeout(() => setCopiedDupId(null), 1500)
  }
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <>
      <div>
        <h2 className="text-base font-semibold">Duplicate accounts</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Other accounts in the system linked to this player.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search..."
            value={dupSearch}
            onChange={e => setDupSearch(e.target.value)}
            className="pl-8 h-8 w-48 text-sm"
          />
        </div>

        <DupFiltersPopover />

        <div className="flex items-center gap-2 ml-auto">
          <Popover open={dupColOpen} onOpenChange={setDupColOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Columns2 className="size-3.5" />
                <span className="hidden sm:inline">Columns</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" sideOffset={6} className="w-48 p-1">
              <button
                type="button"
                onClick={() => setDupPlayerIdFrozen(v => !v)}
                className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
              >
                {dupPlayerIdFrozen
                  ? <PinOff className="size-3.5 shrink-0" />
                  : <Pin className="size-3.5 shrink-0" />}
                Player ID
              </button>
              {DUP_COLS.filter(col => col.key !== 'id').map(col => (
                <button
                  key={col.key}
                  type="button"
                  onClick={() => toggleDupCol(col.key)}
                  className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
                >
                  <Check className={`size-3.5 shrink-0 ${dupVisibleCols.has(col.key) ? 'opacity-100' : 'opacity-0'}`} />
                  {col.label}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          <DateRangeFilter value={dupDateRange} onChange={setDupDateRange} mobileLabel="none" />

          <Button variant="outline" size="sm" className="gap-2">
            <Download className="size-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      <div className="relative rounded-2xl border border-border bg-card overflow-hidden">
        {dupHasOverflow && <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-card to-transparent z-10" />}
        <div className="overflow-x-auto" ref={dupScrollRef}>
          <Table className="min-w-max">
            <TableHeader className="bg-muted/60">
              <TableRow className="hover:bg-transparent border-b border-border">
                <TableHead className={`text-sm font-medium text-foreground pl-4 ${dupPlayerIdFrozen ? "sticky left-0 z-20 bg-muted after:absolute after:right-0 after:top-0 after:bottom-0 after:w-px after:bg-border after:content-['']" : ""}`}>Player ID</TableHead>
                {dupVisibleCols.has('name')           && <TableHead className="text-sm font-medium text-foreground">Name</TableHead>}
                {dupVisibleCols.has('status')         && <TableHead className="text-sm font-medium text-foreground">Status</TableHead>}
                {dupVisibleCols.has('matchReasons')   && <TableHead className="text-sm font-medium text-foreground">Match reason</TableHead>}
                {dupVisibleCols.has('paymentMethods') && <TableHead className="text-sm font-medium text-foreground">Payment methods</TableHead>}
                {dupVisibleCols.has('balance')        && <TableHead className="text-sm font-medium text-foreground">Balance</TableHead>}
                {dupVisibleCols.has('lastLogin')      && <TableHead className="text-sm font-medium text-foreground">Last login</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_DUPLICATES.filter(dup =>
                dupSearch === '' ||
                dup.id.toLowerCase().includes(dupSearch.toLowerCase()) ||
                dup.name.toLowerCase().includes(dupSearch.toLowerCase())
              ).map(dup => (
                <TableRow
                  key={dup.id}
                  className="cursor-pointer"
                  onClick={() => { setSelectedDuplicate(dup); setDrawerOpen(true) }}
                >
                  <TableCell className={`pl-4 ${dupPlayerIdFrozen ? "sticky left-0 z-10 bg-background after:absolute after:right-0 after:top-0 after:bottom-0 after:w-px after:bg-border after:content-['']" : ""}`}>
                    <div className="flex items-center gap-1.5">
                      {dup.duplicateFlag === 'blocked' ? (
                        <Flag className="size-3.5 fill-destructive text-destructive shrink-0" />
                      ) : (
                        <Flag className="size-3.5 fill-warning text-warning shrink-0" />
                      )}
                      <span className="text-sm font-medium underline underline-offset-2 whitespace-nowrap">{dup.id}</span>
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
                  {dupVisibleCols.has('name') && (
                    <TableCell className="max-w-[140px]">
                      <TooltipProvider delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5 text-sm min-w-0">
                              <span className="truncate">{dup.name}</span>
                              {dup.verified && <BadgeCheck className="size-3.5 text-brand shrink-0" />}
                              {dup.vip && <Crown className="size-3.5 text-warning shrink-0" />}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">{dup.name}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  )}
                  {dupVisibleCols.has('status') && (
                    <TableCell className="max-w-[140px]">
                      <TooltipProvider delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block text-sm text-muted-foreground truncate">{dup.status}</span>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">{dup.status}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  )}
                  {dupVisibleCols.has('matchReasons') && (
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {dup.matchReasons.map(r => (
                          <span key={r} className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-medium ${MATCH_REASON_COLORS[r]}`}>
                            {r}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                  )}
                  {dupVisibleCols.has('paymentMethods') && (
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
                  )}
                  {dupVisibleCols.has('balance') && (
                    <TableCell>
                      <span className="text-sm font-medium tabular-nums">{dup.balance}</span>
                      <span className="block text-xs text-muted-foreground tabular-nums">{dup.balanceNative}</span>
                    </TableCell>
                  )}
                  {dupVisibleCols.has('lastLogin') && (
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{dup.lastLogin}</TableCell>
                  )}
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
                {/* Deposits / Withdrawals */}
                <div className="grid grid-cols-2 divide-x divide-border">
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
                {/* Bonuses received + Pending withdrawals */}
                <div className="border-t border-border divide-y divide-border">
                  <div className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Gift className="size-4 shrink-0" />
                      Bonuses received
                    </div>
                    <span className="text-sm font-medium tabular-nums">{selectedDuplicate.bonus}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="size-4 shrink-0" />
                      Pending withdrawals
                    </div>
                    <span className="text-sm font-medium tabular-nums">{selectedDuplicate.pendingWithdrawal}</span>
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
    </>
  )
}
