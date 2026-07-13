'use client'

import { useCallback, useLayoutEffect, useState } from 'react'
import { Ban, Check, Columns2, Copy, Download, Gift, Info, Pin, PinOff, Search, ShoppingBag, SlidersHorizontal, X } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { DateRangeFilter } from '@/components/ui/date-range-filter'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import type { DateRange } from 'react-day-picker'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PillToggle } from './shared'

type BonusStatus = 'Active' | 'Wagering' | 'Completed' | 'Expired' | 'Cancelled'
type BonusType = 'freespin' | 'casino' | 'sport' | 'cashback'

const BONUS_STATUSES: BonusStatus[] = ['Active', 'Wagering', 'Completed', 'Expired', 'Cancelled']
const BONUS_TYPES: BonusType[] = ['freespin', 'casino', 'sport', 'cashback']

type Bonus = {
  id: string
  name: string
  parentId?: string
  description?: string
  amount: string
  wager: number
  wagered?: number
  type: BonusType
  status: BonusStatus
  grantedAt?: string
  activatedAt?: string
  wageringAt?: string
  deactivatedAt?: string
  creditedAt?: string
}

const BONUS_COLS = [
  { key: 'id',            label: 'Bonus ID' },
  { key: 'name',          label: 'Bonus name' },
  { key: 'parentId',      label: 'Parent ID' },
  { key: 'description',   label: 'Description' },
  { key: 'amount',        label: 'Amount' },
  { key: 'wager',         label: 'Wager' },
  { key: 'type',          label: 'Type' },
  { key: 'status',        label: 'Status' },
] as const

type BonusColKey = typeof BONUS_COLS[number]['key']

const MOCK_BONUSES: Bonus[] = [
  { id: '23254071', name: 'Welcome Bonus on second deposit: 75 freespin bonus day 3', parentId: '23254069', description: 'Game: Elvis Frog TRUEWAYS', amount: '25', wager: 40, wagered: 400, type: 'freespin', status: 'Expired', grantedAt: '12 Dec 2025, 10:20', activatedAt: '12 Dec 2025, 10:24', wageringAt: '12 Dec 2025, 10:31', deactivatedAt: '19 Dec 2025, 10:24', creditedAt: '12 Dec 2025, 10:24' },
  { id: '23254070', name: 'Welcome Bonus on second deposit: 75 freespin bonus day 2', parentId: '23254069', description: 'Game: Elvis Frog TRUEWAYS', amount: '25', wager: 40, wagered: 620, type: 'freespin', status: 'Expired', grantedAt: '11 Dec 2025, 10:20', activatedAt: '11 Dec 2025, 10:24', wageringAt: '11 Dec 2025, 10:29', deactivatedAt: '18 Dec 2025, 10:24', creditedAt: '11 Dec 2025, 10:24' },
  { id: '23254114', name: 'Gift for lvl 3: 10 EUR casino bonus', amount: '10', wager: 5, wagered: 20, type: 'casino', status: 'Expired', grantedAt: '10 Dec 2025, 08:55', activatedAt: '10 Dec 2025, 09:00', wageringAt: '10 Dec 2025, 09:12', deactivatedAt: '17 Dec 2025, 09:00', creditedAt: '10 Dec 2025, 09:00' },
  { id: '23254115', name: 'Gift for lvl 3: 30 freespin bonus', description: 'Game: Fruit Machine x25', amount: '30', wager: 10, wagered: 165, type: 'freespin', status: 'Expired', grantedAt: '10 Dec 2025, 08:55', activatedAt: '10 Dec 2025, 09:00', wageringAt: '10 Dec 2025, 09:05', deactivatedAt: '17 Dec 2025, 09:00', creditedAt: '10 Dec 2025, 09:00' },
  { id: '23254068', name: 'Welcome Bonus on second deposit: 100% casino bonus', amount: '500', wager: 40, wagered: 8200, type: 'casino', status: 'Expired', grantedAt: '09 Dec 2025, 21:03', activatedAt: '10 Dec 2025, 10:24', wageringAt: '10 Dec 2025, 10:40', deactivatedAt: '17 Dec 2025, 10:24', creditedAt: '10 Dec 2025, 10:24' },
  { id: '23254069', name: 'Welcome Bonus on second deposit: 75 freespin bonus day 1', description: 'Game: Elvis Frog TRUEWAYS', amount: '25', wager: 40, wagered: 1000, type: 'freespin', status: 'Completed', grantedAt: '10 Dec 2025, 10:20', activatedAt: '10 Dec 2025, 10:24', wageringAt: '10 Dec 2025, 10:33', deactivatedAt: '13 Dec 2025, 08:02', creditedAt: '10 Dec 2025, 10:24' },
  { id: '23253551', name: 'Gift for lvl 2', description: 'Game: For The Realm', amount: '20', wager: 10, wagered: 90, type: 'freespin', status: 'Expired', grantedAt: '05 Dec 2025, 14:05', activatedAt: '05 Dec 2025, 14:10', wageringAt: '05 Dec 2025, 14:22', deactivatedAt: '12 Dec 2025, 14:10', creditedAt: '05 Dec 2025, 14:10' },
  { id: '23253492', name: 'Highroller Bonus on first deposit', amount: '1174.89', wager: 40, wagered: 5200, type: 'casino', status: 'Cancelled', grantedAt: '02 Dec 2025, 18:40', activatedAt: '02 Dec 2025, 18:47', wageringAt: '02 Dec 2025, 18:55', deactivatedAt: '03 Dec 2025, 09:12', creditedAt: '02 Dec 2025, 18:47' },
  { id: '23255002', name: 'Weekly Cashback', description: '10% cashback on weekly losses', amount: '85.50', wager: 1, wagered: 31, type: 'cashback', status: 'Active', grantedAt: '30 Dec 2025, 00:00', activatedAt: '30 Dec 2025, 00:00', wageringAt: '30 Dec 2025, 09:15', creditedAt: '30 Dec 2025, 00:00' },
  { id: '23255010', name: 'Free Bet: Champions League', description: 'Sport: Football', amount: '15', wager: 3, wagered: 27, type: 'sport', status: 'Wagering', grantedAt: '01 Jan 2026, 11:58', activatedAt: '01 Jan 2026, 12:00', wageringAt: '01 Jan 2026, 12:03', creditedAt: '01 Jan 2026, 12:00' },
]

type BonusFilterState = {
  statuses: Set<BonusStatus>
  types: Set<BonusType>
}

function emptyBonusFilters(): BonusFilterState {
  return { statuses: new Set(), types: new Set() }
}

function BonusFiltersPopover() {
  const [filters, setFilters] = useState<BonusFilterState>(emptyBonusFilters)

  function toggleStatus(s: BonusStatus) {
    setFilters(prev => {
      const next = new Set(prev.statuses)
      if (next.has(s)) next.delete(s)
      else next.add(s)
      return { ...prev, statuses: next }
    })
  }

  function toggleType(t: BonusType) {
    setFilters(prev => {
      const next = new Set(prev.types)
      if (next.has(t)) next.delete(t)
      else next.add(t)
      return { ...prev, types: next }
    })
  }

  const dirtyCount = filters.statuses.size + filters.types.size

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
            onClick={() => setFilters(emptyBonusFilters())}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        </div>
        <div className="flex flex-col gap-4 px-4 py-4 flex-1 overflow-y-auto min-h-0">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Status</span>
            <div className="flex flex-wrap gap-2">
              {BONUS_STATUSES.map(s => (
                <PillToggle key={s} label={s} selected={filters.statuses.has(s)} onToggle={() => toggleStatus(s)} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Type</span>
            <div className="flex flex-wrap gap-2">
              {BONUS_TYPES.map(t => (
                <PillToggle key={t} label={t.charAt(0).toUpperCase() + t.slice(1)} selected={filters.types.has(t)} onToggle={() => toggleType(t)} />
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

export function BonusesTab({ playerCurrency, fxRate, subtab, onSubtabChange }: {
  playerCurrency: string
  fxRate: number
  subtab: string
  onSubtabChange: (v: string) => void
}) {
  const [bonusScrollNode, setBonusScrollNode] = useState<HTMLDivElement | null>(null)
  const [bonusHasOverflow, setBonusHasOverflow] = useState(false)
  const bonusScrollRef = useCallback((node: HTMLDivElement | null) => setBonusScrollNode(node), [])
  useLayoutEffect(() => {
    if (!bonusScrollNode) return
    const check = () => setBonusHasOverflow(bonusScrollNode.scrollWidth > bonusScrollNode.clientWidth)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(bonusScrollNode)
    window.addEventListener('resize', check)
    return () => { ro.disconnect(); window.removeEventListener('resize', check) }
  }, [bonusScrollNode])

  const [bonusSearch, setBonusSearch] = useState('')
  const [bonusVisibleCols, setBonusVisibleCols] = useState<Set<BonusColKey>>(
    new Set<BonusColKey>(['id','name','parentId','description','amount','wager','type','status'])
  )
  const [bonusColOpen, setBonusColOpen] = useState(false)
  const [bonusIdFrozen, setBonusIdFrozen] = useState(true)
  const [bonusDateRange, setBonusDateRange] = useState<DateRange | undefined>(undefined)
  const [bonusStatuses, setBonusStatuses] = useState<Record<string, BonusStatus>>({})
  const [pendingBonusStatus, setPendingBonusStatus] = useState<{ id: string; from: BonusStatus; to: BonusStatus } | null>(null)
  const [copiedBonusId, setCopiedBonusId] = useState<string | null>(null)
  const [selectedBonus, setSelectedBonus] = useState<Bonus | null>(null)
  const [bonusDrawerOpen, setBonusDrawerOpen] = useState(false)
  const [copiedBonusDrawerId, setCopiedBonusDrawerId] = useState(false)

  function toggleBonusCol(key: BonusColKey) {
    setBonusVisibleCols(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function copyBonusId(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    navigator.clipboard.writeText(id)
    setCopiedBonusId(id)
    setTimeout(() => setCopiedBonusId(null), 1500)
  }

  const statusOf = (b: Bonus): BonusStatus => bonusStatuses[b.id] ?? b.status
  const setBonusStatus = (id: string, s: BonusStatus) => setBonusStatuses(prev => ({ ...prev, [id]: s }))

  const toNative = (eurValue: number): string => {
    if (playerCurrency === 'EUR') return ''
    const native = eurValue * fxRate
    return `${(native % 1 === 0 ? native.toFixed(0) : native.toFixed(0))} ${playerCurrency}`
  }
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <>
      <div>
        <h2 className="text-base font-semibold">Bonuses</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Bonuses issued to this player and their wagering status.
        </p>
      </div>

      {/* Sub-tabs + toolbar */}
      <Tabs value={subtab} onValueChange={onSubtabChange} className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <TabsList>
            <TabsTrigger value="bonuses">Bonuses</TabsTrigger>
            <TabsTrigger value="shop">Shop</TabsTrigger>
            <TabsTrigger value="benefits" disabled>Benefits</TabsTrigger>
            <TabsTrigger value="packages" disabled>Packages</TabsTrigger>
          </TabsList>

          {subtab === 'bonuses' && (
          <>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search..."
              value={bonusSearch}
              onChange={e => setBonusSearch(e.target.value)}
              className="pl-8 h-8 w-48 text-sm"
            />
          </div>

          <BonusFiltersPopover />

          <div className="flex items-center gap-2 ml-auto">
          <Popover open={bonusColOpen} onOpenChange={setBonusColOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Columns2 className="size-3.5" />
                <span className="hidden sm:inline">Columns</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" sideOffset={6} className="w-48 p-1">
              <button
                type="button"
                onClick={() => setBonusIdFrozen(v => !v)}
                className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
              >
                {bonusIdFrozen
                  ? <PinOff className="size-3.5 shrink-0" />
                  : <Pin className="size-3.5 shrink-0" />}
                Bonus ID
              </button>
              {BONUS_COLS.filter(col => col.key !== 'id').map(col => (
                <button
                  key={col.key}
                  type="button"
                  onClick={() => toggleBonusCol(col.key)}
                  className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
                >
                  <Check className={`size-3.5 shrink-0 ${bonusVisibleCols.has(col.key) ? 'opacity-100' : 'opacity-0'}`} />
                  {col.label}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          <DateRangeFilter value={bonusDateRange} onChange={setBonusDateRange} mobileLabel="none" />

          <Button variant="outline" size="sm" className="gap-2">
            <Download className="size-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          </div>
          </>
          )}
        </div>

        <TabsContent value="bonuses" className="flex flex-col gap-4">
        <div className="relative rounded-2xl border border-border bg-card overflow-hidden">
        {bonusHasOverflow && <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-card to-transparent z-10" />}
        <div className="overflow-x-auto" ref={bonusScrollRef}>
          <Table className="min-w-max">
            <TableHeader className="bg-muted/60">
              <TableRow className="hover:bg-transparent border-b border-border">
                <TableHead className={`text-sm font-medium text-foreground pl-4 ${bonusIdFrozen ? "sticky left-0 z-20 bg-muted after:absolute after:right-0 after:top-0 after:bottom-0 after:w-px after:bg-border after:content-['']" : ""}`}>Bonus ID</TableHead>
                {bonusVisibleCols.has('name')          && <TableHead className="text-sm font-medium text-foreground">Bonus name</TableHead>}
                {bonusVisibleCols.has('parentId')      && <TableHead className="text-sm font-medium text-foreground">Parent ID</TableHead>}
                {bonusVisibleCols.has('description')   && <TableHead className="text-sm font-medium text-foreground">Description</TableHead>}
                {bonusVisibleCols.has('amount')        && <TableHead className="text-sm font-medium text-foreground">Amount</TableHead>}
                {bonusVisibleCols.has('wager')         && <TableHead className="text-sm font-medium text-foreground">Wager</TableHead>}
                {bonusVisibleCols.has('type')          && <TableHead className="text-sm font-medium text-foreground">Type</TableHead>}
                {bonusVisibleCols.has('status')        && <TableHead className="text-sm font-medium text-foreground">Status</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_BONUSES.filter(b =>
                bonusSearch === '' ||
                b.id.toLowerCase().includes(bonusSearch.toLowerCase()) ||
                b.name.toLowerCase().includes(bonusSearch.toLowerCase())
              ).map(b => (
                <TableRow
                  key={b.id}
                  className="cursor-pointer"
                  onClick={() => { setSelectedBonus(b); setBonusDrawerOpen(true) }}
                >
                  <TableCell className={`pl-4 ${bonusIdFrozen ? "sticky left-0 z-10 bg-background after:absolute after:right-0 after:top-0 after:bottom-0 after:w-px after:bg-border after:content-['']" : ""}`}>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium tabular-nums underline underline-offset-2 whitespace-nowrap">{b.id}</span>
                      <button
                        onClick={(e) => copyBonusId(e, b.id)}
                        className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                        aria-label="Copy ID"
                      >
                        {copiedBonusId === b.id
                          ? <Check className="size-3.5 text-muted-foreground" />
                          : <Copy className="size-3.5" />}
                      </button>
                    </div>
                  </TableCell>
                  {bonusVisibleCols.has('name') && (
                    <TableCell className="max-w-[280px]">
                      <TooltipProvider delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block text-sm truncate">{b.name}</span>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">{b.name}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  )}
                  {bonusVisibleCols.has('parentId') && (
                    <TableCell className="text-sm text-muted-foreground tabular-nums whitespace-nowrap">{b.parentId}</TableCell>
                  )}
                  {bonusVisibleCols.has('description') && (
                    <TableCell className="max-w-[220px]">
                      {b.description && (
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="block text-sm text-muted-foreground truncate">{b.description}</span>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">{b.description}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </TableCell>
                  )}
                  {bonusVisibleCols.has('amount') && (
                    <TableCell>
                      <span className="text-sm font-medium tabular-nums block">€{Number(b.amount).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      {playerCurrency !== 'EUR' && (
                        <span className="text-xs text-muted-foreground tabular-nums">{(Number(b.amount) * fxRate).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {playerCurrency}</span>
                      )}
                    </TableCell>
                  )}
                  {bonusVisibleCols.has('wager') && (
                    <TableCell className="text-sm tabular-nums text-muted-foreground">{b.wager}×</TableCell>
                  )}
                  {bonusVisibleCols.has('type') && (
                    <TableCell>
                      <span className="inline-flex items-center rounded-md border border-border bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground capitalize whitespace-nowrap">{b.type}</span>
                    </TableCell>
                  )}
                  {bonusVisibleCols.has('status') && (
                    <TableCell onClick={e => e.stopPropagation()}>
                      <Select value={statusOf(b)} onValueChange={v => setPendingBonusStatus({ id: b.id, from: statusOf(b), to: v as BonusStatus })}>
                        <SelectTrigger size="sm" className="w-[150px]">
                          <span className="text-sm text-foreground">{statusOf(b)}</span>
                        </SelectTrigger>
                        <SelectContent>
                          {BONUS_STATUSES.map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Bonus status change confirmation */}
      <AlertDialog open={pendingBonusStatus !== null} onOpenChange={open => { if (!open) setPendingBonusStatus(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change bonus status?</AlertDialogTitle>
            <AlertDialogDescription>
              Status of bonus <span className="font-medium text-foreground">#{pendingBonusStatus?.id}</span> will be changed from <span className="font-medium text-foreground">{pendingBonusStatus?.from}</span> to <span className="font-medium text-foreground">{pendingBonusStatus?.to}</span>. This action will take effect immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingBonusStatus(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (pendingBonusStatus) { setBonusStatus(pendingBonusStatus.id, pendingBonusStatus.to); setPendingBonusStatus(null) } }}>Apply</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bonus detail drawer */}
      <Drawer
        open={bonusDrawerOpen}
        onOpenChange={setBonusDrawerOpen}
        direction={isMobile ? 'bottom' : 'right'}
      >
        <DrawerContent className="sm:max-w-[400px] flex flex-col">
          <DrawerHeader className="border-b border-border flex flex-row items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Gift className="size-4 text-muted-foreground" />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <DrawerTitle className="truncate">{selectedBonus?.name}</DrawerTitle>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground font-mono">#{selectedBonus?.id}</span>
                  <button
                    onClick={() => {
                      if (selectedBonus) {
                        navigator.clipboard.writeText(selectedBonus.id)
                        setCopiedBonusDrawerId(true)
                        setTimeout(() => setCopiedBonusDrawerId(false), 1500)
                      }
                    }}
                    className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                    aria-label="Copy ID"
                  >
                    {copiedBonusDrawerId
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

          {selectedBonus && (() => {
            const sb = selectedBonus
            const amountNum = Number(sb.amount)
            const required = amountNum * sb.wager
            const wagered = Math.min(sb.wagered ?? 0, required)
            const remaining = Math.max(required - wagered, 0)
            const pct = required > 0 ? Math.min(Math.round((wagered / required) * 100), 100) : 0
            const children = MOCK_BONUSES.filter(x => x.parentId === sb.id)
            const eur = (n: number) => `€${n.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            const liveStatus = statusOf(sb)
            const outcome = liveStatus === 'Cancelled' ? 'Cancelled' : liveStatus === 'Completed' ? 'Completed' : liveStatus === 'Expired' ? 'Expired' : null
            // Full bonus lifecycle. currentIdx = the stage the bonus is at right now.
            const currentIdx = outcome ? 4 : 3
            const lifecycle: { label: string; at?: string; note?: string; terminal?: boolean }[] = [
              { label: 'Granted', at: sb.grantedAt, note: 'Bonus assigned to player' },
              { label: 'Credited', at: sb.creditedAt, note: 'Funds credited to bonus balance' },
              { label: 'Activated', at: sb.activatedAt, note: 'Active and available to wager' },
              { label: 'Wagering', at: sb.wageringAt },
              { label: 'Completed / Expired / Cancelled', at: outcome ? sb.deactivatedAt : undefined, terminal: true },
            ]
            return (
              <div className="flex flex-col gap-5 flex-1 overflow-y-auto px-4 py-5 min-h-0">

                {/* Status history */}
                <div className="flex flex-col gap-1.5">
                  <div>
                    <p className="text-base font-medium">Status history</p>
                    <p className="text-sm text-muted-foreground">Full lifecycle of this bonus.</p>
                  </div>
                  <div className="flex flex-col">
                    {lifecycle.map((stage, i) => {
                      const reached = i <= currentIdx
                      const current = i === currentIdx
                      const dotClass = current
                        ? 'bg-brand ring-2 ring-brand/20'
                        : reached ? 'bg-foreground' : 'bg-muted-foreground/25'
                      return (
                        <div key={stage.label} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <span className={`size-2 rounded-full shrink-0 mt-1.5 ${dotClass}`} />
                            {i < lifecycle.length - 1 && <span className={`w-px flex-1 my-0.5 ${i < currentIdx ? 'bg-foreground/30' : 'bg-border'}`} />}
                          </div>
                          <div className="flex flex-col pb-4">
                            {stage.terminal ? (
                              <span className="text-sm font-medium">
                                <span className={outcome === 'Completed' ? 'text-foreground' : 'text-muted-foreground/50'}>Completed</span>
                                <span className="text-muted-foreground/40"> / </span>
                                <span className={outcome === 'Expired' ? 'text-foreground' : 'text-muted-foreground/50'}>Expired</span>
                                <span className="text-muted-foreground/40"> / </span>
                                <span className={outcome === 'Cancelled' ? 'text-foreground' : 'text-muted-foreground/50'}>Cancelled</span>
                              </span>
                            ) : (
                              <span className={`text-sm font-medium ${reached ? '' : 'text-muted-foreground'}`}>{stage.label}</span>
                            )}
                            {stage.at ? (
                              <span className="text-xs text-muted-foreground tabular-nums">{stage.at}</span>
                            ) : stage.note ? (
                              <span className="text-xs text-muted-foreground">{stage.note}</span>
                            ) : (
                              <span className="text-xs text-muted-foreground/50">Pending</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <hr className="border-border -mx-4" />

                {/* Wagering progress */}
                <div className="flex flex-col gap-1.5">
                  <div>
                    <p className="text-base font-medium">Wagering progress</p>
                    <p className="text-sm text-muted-foreground">Amount that must be wagered before withdrawal.</p>
                  </div>
                  <div className="rounded-xl bg-muted/60 px-4 py-4 flex flex-col gap-3">
                    <div className="flex items-end justify-between gap-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-muted-foreground">Wagered</span>
                        <span className="text-2xl font-semibold tabular-nums">{eur(wagered)}</span>
                        {(() => { const n = toNative(wagered); return n ? <span className="text-xs text-muted-foreground tabular-nums">{n}</span> : null })()}
                      </div>
                      <div className="flex flex-col gap-0.5 items-end text-right">
                        <span className="text-sm text-muted-foreground">Required</span>
                        <span className="text-sm font-medium tabular-nums">{eur(required)}</span>
                        {(() => { const n = toNative(required); return n ? <span className="text-xs text-muted-foreground tabular-nums">{n}</span> : null })()}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="h-1.5 rounded-full bg-muted-foreground/15">
                        <div className="h-1.5 rounded-full bg-foreground transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground tabular-nums">{pct}% wagered</span>
                        <span className="text-xs text-muted-foreground tabular-nums">{eur(remaining)} left</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground border-t border-border pt-2">
                      <Info className="size-3.5 shrink-0" />
                      Required = bonus amount {eur(amountNum)} × wager {sb.wager}
                    </div>
                  </div>
                </div>

                {/* Related free spins */}
                {children.length > 0 && (
                  <>
                    <hr className="border-border -mx-4" />
                    <div className="flex flex-col gap-1.5">
                      <div>
                        <p className="text-base font-medium">Related free spins</p>
                        <p className="text-sm text-muted-foreground">Child bonuses linked to this one.</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {children.map(c => (
                          <button
                            key={c.id}
                            onClick={() => setSelectedBonus(c)}
                            className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-left hover:bg-muted transition-colors"
                          >
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="text-sm font-medium truncate">{c.name}</span>
                              <span className="text-xs text-muted-foreground font-mono">#{c.id}</span>
                            </div>
                            <div className="flex flex-col items-end gap-0.5 shrink-0">
                              <span className="text-sm font-medium tabular-nums">{eur(Number(c.amount))}</span>
                              <span className="text-xs text-muted-foreground">{statusOf(c)}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

              </div>
            )
          })()}

          {selectedBonus && (statusOf(selectedBonus) === 'Active' || statusOf(selectedBonus) === 'Wagering') && (
            <div className="shrink-0 border-t border-border bg-muted p-4">
              <Button
                variant="outline"
                className="w-full gap-2 text-destructive hover:text-destructive"
                onClick={() => setPendingBonusStatus({ id: selectedBonus.id, from: statusOf(selectedBonus), to: 'Cancelled' })}
              >
                <Ban className="size-4" />
                Cancel bonus
              </Button>
            </div>
          )}
        </DrawerContent>
      </Drawer>
        </TabsContent>

        <TabsContent value="shop">
          <div className="flex flex-col items-center gap-3 text-center py-20">
            <div className="size-12 rounded-xl bg-muted flex items-center justify-center">
              <ShoppingBag className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-base font-medium text-foreground">Shop is empty</p>
              <p className="text-sm text-muted-foreground mt-1">No shop items are available for this player yet.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}
