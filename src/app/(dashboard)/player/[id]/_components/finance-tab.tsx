'use client'

import { useCallback, useLayoutEffect, useState } from 'react'
import { ArrowUpDown, Check, CircleCheck, CircleMinus, CircleX, Columns2, Copy, Download, Gift, Pin, PinOff, Search, SlidersHorizontal, X } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer'
import { DateRangeFilter } from '@/components/ui/date-range-filter'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import type { DateRange } from 'react-day-picker'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PillToggle, StatCard, PLAYER_WALLETS, FUNDED_WALLETS, WALLETS_TOTAL_EUR, fmtEur } from './shared'

const FINANCE_COLS = [
  { key: 'txId',          label: 'Transaction ID' },
  { key: 'debit',         label: 'Debit' },
  { key: 'credit',        label: 'Credit' },
  { key: 'rollover',      label: 'Rollover' },
  { key: 'wallet',        label: 'Wallet' },
  { key: 'type',          label: 'Type' },
  { key: 'txStatus',      label: 'Status' },
  { key: 'source',        label: 'Source' },
  { key: 'paymentMethod', label: 'Payment Method' },
  { key: 'paymentSystem', label: 'Payment System' },
  { key: 'createdAt',     label: 'Created at' },
  { key: 'finishedAt',    label: 'Finished at' },
] as const

type FinanceColKey = typeof FINANCE_COLS[number]['key']

type TxStatus = 'Completed' | 'Pending' | 'Failed' | 'Cancelled'
type TxType = 'Deposit' | 'Withdrawal' | 'Bonus' | 'Adjustment'

type FinanceRow = {
  txId: string
  debit: string
  credit: string
  rollover: string
  wallet: string
  type: TxType
  txStatus: TxStatus
  source: string
  paymentMethod: string
  paymentSystem: string
  psStatus: TxStatus
  successFlag: boolean
  manual: boolean
  approvedBy: string
  returnType: string
  by: string
  comments: string
  sumsubPmv: string
  createdAt: string
  finishedAt: string
  fxAmountEur?: string
  fxAmountNative?: string
  fxRate?: string
  fxMethod?: string
  fxDate?: string
  binBankName?: string
  binBankCountry?: string
  binCardType?: string
  binStage?: string
  errorCode?: string
  errorMessage?: string
}

const FINANCE_ROWS: FinanceRow[] = [
  { txId: 'TXN-00183988', debit: '€102.24', credit: '€0.00',   rollover: '€0.00',  wallet: 'USDT', type: 'Withdrawal', txStatus: 'Pending',   source: 'Coinbase Commerce -- crypto',         paymentMethod: 'TQrYx8...fKz3 (USDT · TRC-20)', paymentSystem: 'Coinbase', psStatus: 'Pending',   successFlag: false, manual: false, approvedBy: 'Auto',         returnType: '--',      by: 'Player', comments: 'Awaiting on-chain confirmation', sumsubPmv: 'Approved', createdAt: '2026-06-22 16:40', finishedAt: '--',               fxAmountEur: '€102.24', fxAmountNative: '120.00 USDT', fxRate: '1 EUR = 1.1737 USDT', fxMethod: 'Kraken mid-price', fxDate: '2026-06-22 16:40' },
  { txId: 'TXN-00183950', debit: '€0.00',   credit: '€724.20', rollover: '€0.00',  wallet: 'USDT', type: 'Deposit',    txStatus: 'Completed', source: 'Coinbase Commerce -- crypto',         paymentMethod: 'TQrYx8...fKz3 (USDT · TRC-20)', paymentSystem: 'Coinbase', psStatus: 'Completed', successFlag: true,  manual: false, approvedBy: 'Auto',         returnType: '--',      by: 'Player', comments: '',                      sumsubPmv: 'Approved', createdAt: '2026-06-21 10:05', finishedAt: '2026-06-21 10:07', fxAmountEur: '€724.20', fxAmountNative: '850.00 USDT', fxRate: '1 EUR = 1.1737 USDT', fxMethod: 'Kraken mid-price', fxDate: '2026-06-21 10:05' },
  { txId: 'TXN-00183821', debit: '€0.00',   credit: '€250.00', rollover: '€0.00',  wallet: 'AUD',  type: 'Deposit',    txStatus: 'Completed', source: 'Finteqhub Seamless -- card-acquirer', paymentMethod: 'Visa •••• 4242',      paymentSystem: 'Stripe',   psStatus: 'Completed', successFlag: true,  manual: false, approvedBy: 'Auto',         returnType: '--',      by: 'Player', comments: '',                      sumsubPmv: 'Approved', createdAt: '2026-06-20 14:32', finishedAt: '2026-06-20 14:33', fxAmountEur: '€250.00', fxAmountNative: '427.50 AUD', fxRate: '1 EUR = 1.7100 AUD', fxMethod: 'Frankfurter API', fxDate: '2026-06-20 14:32', binBankName: 'Commonwealth Bank', binBankCountry: 'AU', binCardType: 'debit',   binStage: 'succeeded' },
  { txId: 'TXN-00183654', debit: '€120.00', credit: '€0.00',   rollover: '€0.00',  wallet: 'AUD',  type: 'Withdrawal', txStatus: 'Pending',   source: 'Finteqhub Seamless -- card-acquirer', paymentMethod: 'Mastercard •••• 1881', paymentSystem: 'Adyen',    psStatus: 'Pending',   successFlag: false, manual: false, approvedBy: 'Auto',         returnType: '--',      by: 'Player', comments: 'Pending AML review',    sumsubPmv: 'Pending',  createdAt: '2026-06-19 09:11', finishedAt: '--',               fxAmountEur: '€120.00', fxAmountNative: '205.20 AUD', fxRate: '1 EUR = 1.7100 AUD', fxMethod: 'Frankfurter API', fxDate: '2026-06-19 09:11', binBankName: 'ANZ',               binBankCountry: 'AU', binCardType: 'credit',  binStage: 'pending'   },
  { txId: 'TXN-00183201', debit: '€0.00',   credit: '€50.00',  rollover: '€50.00', wallet: 'AUD',  type: 'Bonus',      txStatus: 'Completed', source: '--',                                  paymentMethod: '--',                  paymentSystem: '--',       psStatus: 'Completed', successFlag: true,  manual: true,  approvedBy: 'System',       returnType: '--',      by: 'System', comments: '',                      sumsubPmv: '--',       createdAt: '2026-06-18 17:05', finishedAt: '2026-06-18 17:05' },
  { txId: 'TXN-00183112', debit: '€0.00',   credit: '€62.16',  rollover: '€0.00',  wallet: 'ETH',  type: 'Deposit',    txStatus: 'Completed', source: 'Coinbase Commerce -- crypto',         paymentMethod: '0x3aF2...9c1D (ETH · ERC-20)',  paymentSystem: 'Coinbase', psStatus: 'Completed', successFlag: true,  manual: false, approvedBy: 'Auto',         returnType: '--',      by: 'Player', comments: '',                      sumsubPmv: 'Approved', createdAt: '2026-06-17 19:24', finishedAt: '2026-06-17 19:26', fxAmountEur: '€62.16',  fxAmountNative: '0.021000 ETH', fxRate: '1 ETH = 2,960.00 EUR', fxMethod: 'Kraken mid-price', fxDate: '2026-06-17 19:24' },
  { txId: 'TXN-00182998', debit: '€75.00',  credit: '€0.00',   rollover: '€0.00',  wallet: 'BTC',  type: 'Withdrawal', txStatus: 'Failed',    source: 'Coinbase Commerce -- crypto',         paymentMethod: 'bc1qxy2...k3z (BTC)', paymentSystem: 'Coinbase', psStatus: 'Failed',    successFlag: false, manual: false, approvedBy: 'Auto',         returnType: 'Chargeback', by: 'Player', comments: 'Crypto tx hash mismatch', sumsubPmv: '--',    createdAt: '2026-06-15 11:48', finishedAt: '2026-06-15 11:50', fxAmountEur: '€75.00',  fxAmountNative: '0.00126046 BTC', fxRate: '1 BTC = 59,502.43 EUR', fxMethod: 'Kraken mid-price', fxDate: '2026-06-15 11:48', errorCode: 'INSUFFICIENT_FUNDS', errorMessage: 'Insufficient funds' },
  { txId: 'TXN-00182741', debit: '€0.00',   credit: '€500.00', rollover: '€0.00',  wallet: 'AUD',  type: 'Deposit',    txStatus: 'Completed', source: 'Paysafe Group -- voucher',            paymentMethod: 'Paysafe •••• 3391',   paymentSystem: 'Paysafe',  psStatus: 'Completed', successFlag: true,  manual: false, approvedBy: 'j.smith (ops)', returnType: '--',      by: 'Player', comments: '',                      sumsubPmv: 'Approved', createdAt: '2026-06-12 08:22', finishedAt: '2026-06-12 08:24', fxAmountEur: '€500.00', fxAmountNative: '855.00 AUD',  fxRate: '1 EUR = 1.7100 AUD', fxMethod: 'Frankfurter API', fxDate: '2026-06-12 08:22' },
]

function FinanceTruncCell({ text, className }: { text: string; className?: string }) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`block truncate max-w-[160px] ${className ?? ''}`}>{text}</span>
        </TooltipTrigger>
        <TooltipContent>{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function FinanceSortableHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <TableHead className={className}>
      <button className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-foreground/70 transition-colors">
        {children}
        <ArrowUpDown className="size-3.5 text-muted-foreground shrink-0" />
      </button>
    </TableHead>
  )
}

function TxStatusBadge({ status }: { status: TxStatus }) {
  const base = 'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap'
  if (status === 'Completed') return <span className={`${base} bg-success-bg text-success`}><CircleCheck className="size-3 shrink-0" />Completed</span>
  if (status === 'Pending')   return <span className={`${base} bg-muted text-muted-foreground`}><CircleMinus className="size-3 shrink-0" />Pending</span>
  if (status === 'Failed')    return <span className={`${base} bg-destructive-bg text-destructive`}><CircleX className="size-3 shrink-0" />Failed</span>
  return <span className={`${base} bg-warning-bg text-warning`}><CircleMinus className="size-3 shrink-0" />Cancelled</span>
}

const TX_TYPES: TxType[] = ['Deposit', 'Withdrawal', 'Bonus', 'Adjustment']
const TX_STATUSES: TxStatus[] = ['Completed', 'Pending', 'Failed', 'Cancelled']
const PAYMENT_SYSTEMS = ['Visa', 'Mastercard', 'PayPal', 'Bitcoin', 'Ethereum', 'Paysafe', 'Bank Transfer']
const TX_WALLETS = ['AUD', 'USDT', 'BTC', 'ETH']

type FinanceFilterState = {
  types: Set<TxType>
  statuses: Set<TxStatus>
  wallets: Set<string>
  paymentSystems: Set<string>
  amountMin: string
  amountMax: string
}

function emptyFinanceFilters(): FinanceFilterState {
  return { types: new Set(), statuses: new Set(), wallets: new Set(), paymentSystems: new Set(), amountMin: '', amountMax: '' }
}

function FinanceFiltersPopover() {
  const [filters, setFilters] = useState<FinanceFilterState>(emptyFinanceFilters)

  function toggleSet<T extends string>(key: 'types' | 'statuses' | 'wallets' | 'paymentSystems', val: T) {
    setFilters(prev => {
      const next = new Set(prev[key]) as Set<T>
      if (next.has(val)) next.delete(val)
      else next.add(val)
      return { ...prev, [key]: next }
    })
  }

  const dirtyCount =
    filters.types.size + filters.statuses.size + filters.wallets.size + filters.paymentSystems.size +
    (filters.amountMin ? 1 : 0) + (filters.amountMax ? 1 : 0)

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
            onClick={() => setFilters(emptyFinanceFilters())}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        </div>
        <div className="flex flex-col gap-4 px-4 py-4 flex-1 overflow-y-auto min-h-0">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Type</span>
            <div className="flex flex-wrap gap-2">
              {TX_TYPES.map(t => (
                <PillToggle key={t} label={t} selected={filters.types.has(t)} onToggle={() => toggleSet('types', t)} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Status</span>
            <div className="flex flex-wrap gap-2">
              {TX_STATUSES.map(s => (
                <PillToggle key={s} label={s} selected={filters.statuses.has(s)} onToggle={() => toggleSet('statuses', s)} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Wallet</span>
            <div className="flex flex-wrap gap-2">
              {TX_WALLETS.map(w => (
                <PillToggle key={w} label={w} selected={filters.wallets.has(w)} onToggle={() => toggleSet('wallets', w)} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Payment system</span>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_SYSTEMS.map(p => (
                <PillToggle key={p} label={p} selected={filters.paymentSystems.has(p)} onToggle={() => toggleSet('paymentSystems', p)} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Amount (EUR)</span>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Min"
                type="number"
                value={filters.amountMin}
                onChange={e => setFilters(f => ({ ...f, amountMin: e.target.value }))}
              />
              <span className="text-muted-foreground text-sm shrink-0">—</span>
              <Input
                placeholder="Max"
                type="number"
                value={filters.amountMax}
                onChange={e => setFilters(f => ({ ...f, amountMax: e.target.value }))}
              />
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

export function FinanceTab({ playerCurrency, fxRate, dateRange, onDateRangeChange }: {
  playerCurrency: string
  fxRate: number
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
}) {
  const [selectedTx, setSelectedTx] = useState<FinanceRow | null>(null)
  const [txDrawerOpen, setTxDrawerOpen] = useState(false)
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null)

  function copyTxId(e: React.MouseEvent, txId: string) {
    e.stopPropagation()
    navigator.clipboard.writeText(txId)
    setCopiedTxId(txId)
    setTimeout(() => setCopiedTxId(null), 1500)
  }

  const [financeScrollNode, setFinanceScrollNode] = useState<HTMLDivElement | null>(null)
  const [financeHasOverflow, setFinanceHasOverflow] = useState(false)
  const financeScrollRef = useCallback((node: HTMLDivElement | null) => setFinanceScrollNode(node), [])
  useLayoutEffect(() => {
    if (!financeScrollNode) return
    const check = () => setFinanceHasOverflow(financeScrollNode.scrollWidth > financeScrollNode.clientWidth)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(financeScrollNode)
    window.addEventListener('resize', check)
    return () => { ro.disconnect(); window.removeEventListener('resize', check) }
  }, [financeScrollNode])

  const [financeSearch, setFinanceSearch] = useState('')
  const [financeVisibleCols, setFinanceVisibleCols] = useState<Set<FinanceColKey>>(
    new Set<FinanceColKey>(['txId','debit','credit','rollover','wallet','type','txStatus','source','paymentMethod','paymentSystem','createdAt','finishedAt'])
  )
  const [financeColOpen, setFinanceColOpen] = useState(false)
  const [financeTxIdFrozen, setFinanceTxIdFrozen] = useState(true)


  function toggleFinanceCol(key: FinanceColKey) {
    setFinanceVisibleCols(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const toNative = (eurValue: number): string => {
    if (playerCurrency === 'EUR') return ''
    const native = eurValue * fxRate
    return `${(native % 1 === 0 ? native.toFixed(0) : native.toFixed(0))} ${playerCurrency}`
  }
  // Secondary line for money cells: base-currency wallets convert like before,
  // crypto wallets show the FX snapshot amount in the wallet currency.
  const txSecondary = (row: FinanceRow, eurStr: string): string | null => {
    const amount = parseFloat(eurStr.replace(/[^0-9.]/g, ''))
    if (row.wallet === playerCurrency) return toNative(amount) || null
    if (amount === 0) return null
    return row.fxAmountNative ?? null
  }
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

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

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search..."
            value={financeSearch}
            onChange={e => setFinanceSearch(e.target.value)}
            className="pl-8 h-8 w-48 text-sm"
          />
        </div>

        <FinanceFiltersPopover />

        <div className="flex items-center gap-2 ml-auto">
          <Popover open={financeColOpen} onOpenChange={setFinanceColOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Columns2 className="size-3.5" />
                <span className="hidden sm:inline">Columns</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" sideOffset={6} className="w-48 p-1">
              <button
                type="button"
                onClick={() => setFinanceTxIdFrozen(v => !v)}
                className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
              >
                {financeTxIdFrozen
                  ? <PinOff className="size-3.5 shrink-0" />
                  : <Pin className="size-3.5 shrink-0" />}
                Transaction ID
              </button>
              {FINANCE_COLS.filter(col => col.key !== 'txId').map(col => (
                <button
                  key={col.key}
                  type="button"
                  onClick={() => toggleFinanceCol(col.key)}
                  className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
                >
                  <Check className={`size-3.5 shrink-0 ${financeVisibleCols.has(col.key) ? 'opacity-100' : 'opacity-0'}`} />
                  {col.label}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          <DateRangeFilter value={dateRange} onChange={onDateRangeChange} mobileLabel="none" />

          <Button variant="outline" size="sm" className="gap-2">
            <Download className="size-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      <div className="relative rounded-2xl border border-border bg-card overflow-hidden">
        {financeHasOverflow && <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-card to-transparent z-10" />}
        <div className="overflow-x-auto" ref={financeScrollRef}>
          <Table className="min-w-max">
            <TableHeader className="bg-muted/60">
              <TableRow className="hover:bg-transparent border-b border-border">
                <FinanceSortableHead className={financeTxIdFrozen ? "sticky left-0 z-20 bg-muted after:absolute after:right-0 after:top-0 after:bottom-0 after:w-px after:bg-border after:content-['']" : undefined}>Transaction ID</FinanceSortableHead>
                {financeVisibleCols.has('debit')         && <FinanceSortableHead>Debit</FinanceSortableHead>}
                {financeVisibleCols.has('credit')        && <FinanceSortableHead>Credit</FinanceSortableHead>}
                {financeVisibleCols.has('rollover')      && <FinanceSortableHead>Rollover</FinanceSortableHead>}
                {financeVisibleCols.has('wallet')        && <TableHead className="text-sm font-medium text-foreground">Wallet</TableHead>}
                {financeVisibleCols.has('type')          && <TableHead className="text-sm font-medium text-foreground">Type</TableHead>}
                {financeVisibleCols.has('txStatus')      && <FinanceSortableHead>Status</FinanceSortableHead>}
                {financeVisibleCols.has('source')        && <TableHead className="text-sm font-medium text-foreground">Source</TableHead>}
                {financeVisibleCols.has('paymentMethod') && <TableHead className="text-sm font-medium text-foreground">Payment Method</TableHead>}
                {financeVisibleCols.has('paymentSystem') && <TableHead className="text-sm font-medium text-foreground">Payment System</TableHead>}
                {financeVisibleCols.has('createdAt')     && <FinanceSortableHead>Created at</FinanceSortableHead>}
                {financeVisibleCols.has('finishedAt')    && <TableHead className="text-sm font-medium text-foreground">Finished at</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {FINANCE_ROWS
                .filter(row =>
                  financeSearch === '' ||
                  row.txId.toLowerCase().includes(financeSearch.toLowerCase()) ||
                  row.paymentMethod.toLowerCase().includes(financeSearch.toLowerCase()) ||
                  row.source.toLowerCase().includes(financeSearch.toLowerCase()) ||
                  row.wallet.toLowerCase().includes(financeSearch.toLowerCase())
                )
                .map(row => (
                  <TableRow
                    key={row.txId}
                    className="cursor-pointer"
                    onClick={() => { setSelectedTx(row); setTxDrawerOpen(true) }}
                  >
                    <TableCell className={financeTxIdFrozen ? "sticky left-0 z-10 bg-background after:absolute after:right-0 after:top-0 after:bottom-0 after:w-px after:bg-border after:content-['']" : undefined}>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium underline underline-offset-2 whitespace-nowrap">{row.txId}</span>
                          <button
                            onClick={(e) => copyTxId(e, row.txId)}
                            className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                            aria-label="Copy transaction ID"
                          >
                            {copiedTxId === row.txId
                              ? <Check className="size-3.5 text-muted-foreground" />
                              : <Copy className="size-3.5" />}
                          </button>
                        </div>
                      </TableCell>
                    {financeVisibleCols.has('debit') && (
                      <TableCell>
                        <span className="text-sm font-medium tabular-nums block">{row.debit}</span>
                        {(() => { const n = txSecondary(row, row.debit); return n ? <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">{n}</span> : null })()}
                      </TableCell>
                    )}
                    {financeVisibleCols.has('credit') && (
                      <TableCell>
                        <span className="text-sm font-medium tabular-nums block">{row.credit}</span>
                        {(() => { const n = txSecondary(row, row.credit); return n ? <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">{n}</span> : null })()}
                      </TableCell>
                    )}
                    {financeVisibleCols.has('rollover') && (
                      <TableCell>
                        <span className="text-sm tabular-nums block">{row.rollover}</span>
                        {(() => { const n = txSecondary(row, row.rollover); return n ? <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">{n}</span> : null })()}
                      </TableCell>
                    )}
                    {financeVisibleCols.has('wallet') && (
                      <TableCell>
                        <span className="inline-flex items-center rounded-md border border-border bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">{row.wallet}</span>
                      </TableCell>
                    )}
                    {financeVisibleCols.has('type') && (
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm">
                          {row.type}
                          {row.type === 'Bonus' && <Gift className="size-3.5 text-warning shrink-0" />}
                        </div>
                      </TableCell>
                    )}
                    {financeVisibleCols.has('txStatus')      && <TableCell><TxStatusBadge status={row.txStatus} /></TableCell>}
                    {financeVisibleCols.has('source') && (
                      <TableCell>
                        {(() => {
                          const tag = row.source.split(' -- ')[1]
                          return tag
                            ? <span className="inline-flex items-center rounded-md border border-border bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground whitespace-nowrap">{tag}</span>
                            : <span className="text-sm text-muted-foreground">--</span>
                        })()}
                      </TableCell>
                    )}
                    {financeVisibleCols.has('paymentMethod') && (
                      <TableCell className="text-sm text-muted-foreground max-w-[160px]">
                        <FinanceTruncCell text={row.paymentMethod} className="text-muted-foreground" />
                      </TableCell>
                    )}
                    {financeVisibleCols.has('paymentSystem') && <TableCell className="text-sm text-muted-foreground">{row.paymentSystem}</TableCell>}
                    {financeVisibleCols.has('createdAt')     && <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{row.createdAt}</TableCell>}
                    {financeVisibleCols.has('finishedAt')    && <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{row.finishedAt}</TableCell>}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Transaction detail drawer */}
      <Drawer
        open={txDrawerOpen}
        onOpenChange={setTxDrawerOpen}
        direction={isMobile ? 'bottom' : 'right'}
      >
        <DrawerContent className="sm:max-w-[400px] flex flex-col">
          <DrawerHeader className="border-b border-border flex flex-row items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <DrawerTitle className="text-base">Transaction details</DrawerTitle>
              {selectedTx && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground font-mono">{selectedTx.txId}</span>
                  <button
                    onClick={() => {
                      if (selectedTx) {
                        navigator.clipboard.writeText(selectedTx.txId)
                        setCopiedTxId(selectedTx.txId)
                        setTimeout(() => setCopiedTxId(null), 1500)
                      }
                    }}
                    className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                    aria-label="Copy ID"
                  >
                    {copiedTxId === selectedTx.txId
                      ? <Check className="size-3 text-muted-foreground" />
                      : <Copy className="size-3" />}
                  </button>
                </div>
              )}
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon-sm">
                <X className="size-4" />
              </Button>
            </DrawerClose>
          </DrawerHeader>

          {selectedTx && (
            <div className="flex flex-col flex-1 overflow-y-auto min-h-0">

              {/* Hero */}
              <div className="px-4 py-5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{selectedTx.type}</span>
                  <TxStatusBadge status={selectedTx.txStatus} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-3xl font-semibold tabular-nums">
                    {selectedTx.credit !== '€0.00' ? selectedTx.credit : selectedTx.debit}
                  </span>
                  {selectedTx.fxAmountNative && (
                    <span className="text-sm text-muted-foreground tabular-nums">{selectedTx.fxAmountNative}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{selectedTx.createdAt}</span>
                  {selectedTx.rollover !== '€0.00' && (
                    <span className="inline-flex items-center gap-1">
                      <span className="text-muted-foreground/50">·</span>
                      Rollover {selectedTx.rollover}
                    </span>
                  )}
                </div>
              </div>

              {/* Payment */}
              <hr className="border-border" />
              <div className="flex flex-col gap-1.5 px-4 py-5">
                <div>
                  <p className="text-base font-medium">Payment</p>
                  <p className="text-sm text-muted-foreground">Payment method and processor details.</p>
                </div>
                <div className="divide-y divide-border">
                  {[
                    { label: 'Source', value: (() => {
                      const [name, tag] = selectedTx.source.split(' -- ')
                      return tag
                        ? <span className="flex items-center gap-1.5 justify-end flex-wrap">
                            <span className="text-sm font-medium">{name}</span>
                            <span className="inline-flex items-center rounded-md border border-border bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">{tag}</span>
                          </span>
                        : <span className="text-sm font-medium">{selectedTx.source}</span>
                    })() },
                    { label: 'Payment System', value: selectedTx.paymentSystem },
                    { label: 'Payment Method', value: selectedTx.paymentMethod },
                    { label: 'PS Status', value: <TxStatusBadge status={selectedTx.psStatus} /> },
                    { label: 'Success', value: selectedTx.successFlag
                      ? <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-success-bg text-success"><CircleCheck className="size-3 shrink-0" />Yes</span>
                      : <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-destructive-bg text-destructive"><CircleX className="size-3 shrink-0" />No</span>
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <span className="text-sm font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* BIN info — only for card transactions */}
              {selectedTx.binBankName && (
                <>
                  <hr className="border-border" />
                  <div className="flex flex-col gap-1.5 px-4 py-5">
                    <div>
                      <p className="text-base font-medium">BIN info</p>
                      <p className="text-sm text-muted-foreground">Issuing bank and card details.</p>
                    </div>
                    <div className="rounded-xl border border-border divide-y divide-border">
                      {[
                        { label: 'Bank', value: selectedTx.binBankName },
                        { label: 'Country', value: selectedTx.binBankCountry },
                        { label: 'Card type', value: selectedTx.binCardType },
                        { label: 'Stage', value: selectedTx.binStage },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between px-3 py-2.5">
                          <span className="text-sm text-muted-foreground">{label}</span>
                          <span className="text-sm font-medium capitalize">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Error — only for failed transactions */}
              {selectedTx.errorCode && (
                <>
                  <hr className="border-border" />
                  <div className="flex flex-col gap-1.5 px-4 py-5">
                    <div>
                      <p className="text-base font-medium">Error</p>
                      <p className="text-sm text-muted-foreground">Failure reason returned by the payment processor.</p>
                    </div>
                    <div className="rounded-xl border border-destructive/30 bg-destructive-bg divide-y divide-destructive/10">
                      <div className="flex items-center justify-between px-3 py-2.5">
                        <span className="text-sm text-muted-foreground">Code</span>
                        <span className="text-sm font-mono font-medium text-destructive">{selectedTx.errorCode}</span>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2.5">
                        <span className="text-sm text-muted-foreground">Description</span>
                        <span className="text-sm font-medium text-destructive">{selectedTx.errorMessage}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Currency conversion */}
              {selectedTx.fxAmountEur && (
                <>
                  <hr className="border-border" />
                  <div className="flex flex-col gap-1.5 px-4 py-5">
                    <div>
                      <p className="text-base font-medium">Currency conversion</p>
                      <p className="text-sm text-muted-foreground">FX rate applied to this transaction.</p>
                    </div>
                    <div className="rounded-xl border border-border divide-y divide-border">
                      <div className="flex items-center justify-between px-3 py-2.5">
                        <span className="text-sm text-muted-foreground">Amount (EUR)</span>
                        <span className="text-sm font-medium tabular-nums">{selectedTx.fxAmountEur}</span>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2.5">
                        <span className="text-sm text-muted-foreground">Amount ({selectedTx.wallet})</span>
                        <span className="text-sm font-medium tabular-nums">{selectedTx.fxAmountNative}</span>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2.5">
                        <span className="text-sm text-muted-foreground">Exchange rate</span>
                        <span className="text-sm font-medium tabular-nums">{selectedTx.fxRate}</span>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2.5">
                        <span className="text-sm text-muted-foreground">Rate provider</span>
                        <span className="text-sm font-medium">{selectedTx.fxMethod}</span>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2.5">
                        <span className="text-sm text-muted-foreground">Rate fetched at</span>
                        <span className="text-sm font-medium tabular-nums">{selectedTx.fxDate}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Processing */}
              <hr className="border-border" />
              <div className="flex flex-col gap-1.5 px-4 py-5">
                <div>
                  <p className="text-base font-medium">Processing</p>
                  <p className="text-sm text-muted-foreground">Approval and handling details.</p>
                </div>
                <div className="divide-y divide-border">
                  {[
                    { label: 'By', value: selectedTx.by },
                    { label: 'Manual', value: selectedTx.manual ? 'Yes' : 'No' },
                    { label: 'Approved by', value: selectedTx.approvedBy },
                    { label: 'Return type', value: selectedTx.returnType },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <span className="text-sm font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments */}
              {selectedTx.comments && (
                <>
                  <hr className="border-border" />
                  <div className="flex flex-col gap-1.5 px-4 py-5">
                    <div>
                      <p className="text-base font-medium">Comments</p>
                      <p className="text-sm text-muted-foreground">Operator notes for this transaction.</p>
                    </div>
                    <p className="text-sm text-foreground bg-muted rounded-xl px-3 py-2.5">{selectedTx.comments}</p>
                  </div>
                </>
              )}

              {/* Dates */}
              <hr className="border-border" />
              <div className="flex flex-col gap-1.5 px-4 py-5">
                <div>
                  <p className="text-base font-medium">Dates</p>
                  <p className="text-sm text-muted-foreground">When this transaction was created and settled.</p>
                </div>
                <div className="divide-y divide-border">
                  {[
                    { label: 'Created at', value: selectedTx.createdAt },
                    { label: 'Finished at', value: selectedTx.finishedAt },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <span className="text-sm font-medium tabular-nums">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance */}
              <hr className="border-border" />
              <div className="flex flex-col gap-1.5 px-4 py-5">
                <div>
                  <p className="text-base font-medium">Compliance</p>
                  <p className="text-sm text-muted-foreground">AML and KYC verification results.</p>
                </div>
                <div className="divide-y divide-border">
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-muted-foreground">Sumsub PMV</span>
                    <span className="text-sm font-medium">{selectedTx.sumsubPmv}</span>
                  </div>
                </div>
              </div>

            </div>
          )}
        </DrawerContent>
      </Drawer>
    </>
  )
}
