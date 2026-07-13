'use client'

import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { DashboardHeader } from '@/components/DashboardHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Info, TrendingUp, TrendingDown, Flag, CircleDot, Copy, Check, Crown, X, ExternalLink, BadgeCheck, Gift, Clock, Wallet, ArrowDownLeft, ArrowUpRight, Flame, Trophy, Pencil, Plus, Shield, UserCog, User, Timer, Ban, Globe, Power, ArrowUpDown, CircleCheck, CircleMinus, CircleX, ShieldBan, MoreHorizontal, Search, Columns2, SlidersHorizontal, Download, Pin, PinOff, Banknote, Gamepad2, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Calendar } from '@/components/ui/calendar'
import { DateRangeFilter } from '@/components/ui/date-range-filter'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { addDays } from 'date-fns'
import type { DateRange } from 'react-day-picker'
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

const TAB_VALUES = new Set(TABS.map(t => t.value))
// benefits/packages are disabled sub-tabs -- not restorable from URL
const BONUS_SUBTAB_VALUES = new Set(['bonuses', 'shop'])

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

// Multi-currency wallets. Balances live in the wallet currency; `eurValue` is the
// real balance converted at the current rate. Historical figures (deposits, GGR)
// always use per-transaction FX snapshots and are never recomputed with live rates.
type WalletKind = 'Fiat' | 'Crypto' | 'Stablecoin'

type PlayerWallet = {
  currency: string
  glyph: string
  kind: WalletKind
  network?: string
  real: number
  bonus: number
  locked: number
  eurValue: number
  isBase?: boolean
  inPlay?: boolean
}

const PLAYER_WALLETS: PlayerWallet[] = [
  { currency: 'USDT', glyph: '₮',  kind: 'Stablecoin', network: 'TRC-20', real: 850,      bonus: 0,  locked: 120, eurValue: 724.20 },
  { currency: 'BTC',  glyph: '₿',  kind: 'Crypto',                        real: 0.00412,  bonus: 0,  locked: 0,   eurValue: 245.15 },
  { currency: 'AUD',  glyph: 'A$', kind: 'Fiat',                          real: 410.50,   bonus: 85, locked: 0,   eurValue: 240.06, isBase: true, inPlay: true },
  { currency: 'ETH',  glyph: 'Ξ',  kind: 'Crypto',                        real: 0.021,    bonus: 0,  locked: 0,   eurValue: 62.16 },
  { currency: 'DOGE', glyph: 'Ð',  kind: 'Crypto',                        real: 0,        bonus: 0,  locked: 0,   eurValue: 0 },
  { currency: 'XRP',  glyph: 'X',  kind: 'Crypto',                        real: 0,        bonus: 0,  locked: 0,   eurValue: 0 },
]

// Never truncate crypto amounts to 2 decimals -- 0.004 vs 0.0041 BTC is a real difference.
const WALLET_CRYPTO_DECIMALS: Record<string, number> = { BTC: 8, ETH: 6, DOGE: 2, XRP: 2 }

function fmtWalletAmount(n: number, w: PlayerWallet): string {
  const decimals = w.kind === 'Crypto' ? (WALLET_CRYPTO_DECIMALS[w.currency] ?? 8) : 2
  return n.toLocaleString('en', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

const fmtEur = (n: number) => `€${n.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const WALLETS_TOTAL_EUR = PLAYER_WALLETS.reduce((sum, w) => sum + w.eurValue, 0)
const FUNDED_WALLETS = PLAYER_WALLETS.filter(w => w.real > 0 || w.bonus > 0 || w.locked > 0)
const EMPTY_WALLETS = PLAYER_WALLETS.filter(w => !(w.real > 0 || w.bonus > 0 || w.locked > 0))

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

// duplicate flag state: 'ok' | 'duplicate' | 'blocked'
type DuplicateState = 'ok' | 'duplicate' | 'blocked'

type PlayerLimitItem = {
  name: string; scope: string; current: string; limit: string; unit: string
  pct: number | null; disabled: boolean; _type: string; _scope: string; _value: string
  setBy?: string; setByEmail?: string; setByDate?: string; setByPlayer?: boolean
}
type OperatorLimitItem = {
  name: string; scope: string; value: string; valueNative?: string; tag: string; meta: string
  metaHandle?: string; metaEmail?: string; metaDate?: string
  disabled: boolean; _type: string; _scope: string
}

const PL_TYPES = [
  { value: 'loss_limit', label: 'Loss limit', unit: '€', hint: 'Max amount player can lose' },
  { value: 'deposit_limit', label: 'Deposit limit', unit: '€', hint: 'Max amount player can deposit' },
  { value: 'wager_limit', label: 'Wager limit', unit: '€', hint: 'Max amount per single bet' },
  { value: 'session_time', label: 'Session time', unit: 'h', hint: 'Max hours per session' },
  { value: 'cooling_off', label: 'Cooling-off', unit: 'd', hint: 'Mandatory pause between sessions' },
]
const PL_SCOPES: Record<string, { value: string; label: string }[]> = {
  loss_limit:    [{ value:'daily',label:'Daily'},{value:'weekly',label:'Weekly'},{value:'monthly',label:'Monthly'}],
  deposit_limit: [{ value:'daily',label:'Daily'},{value:'weekly',label:'Weekly'},{value:'monthly',label:'Monthly'}],
  wager_limit:   [{ value:'per_bet',label:'Per bet'}],
  session_time:  [{ value:'daily',label:'Daily'}],
  cooling_off:   [{ value:'one_time',label:'One-time'}],
}
const PL_SCOPE_LABELS: Record<string, string> = {
  daily:'Daily', weekly:'Weekly', monthly:'Monthly', per_bet:'Per bet', one_time:'One-time',
}

const OL_TYPES = [
  { value:'max_withdrawal', label:'Max withdrawal' },
  { value:'max_deposit', label:'Max deposit' },
  { value:'bonus_restriction', label:'Bonus restriction' },
  { value:'review_threshold', label:'Review threshold' },
  { value:'custom', label:'Custom' },
]
const OL_TYPE_NAMES: Record<string,string> = {
  max_withdrawal:'Max withdrawal', max_deposit:'Max deposit',
  bonus_restriction:'Bonus restriction', review_threshold:'Review threshold', custom:'Custom',
}
const OL_SCOPES = [
  { value:'per_transaction', label:'Per transaction' },
  { value:'daily', label:'Daily' },
  { value:'weekly', label:'Weekly' },
  { value:'permanent', label:'Permanent' },
]
const OL_SCOPE_LABELS: Record<string,string> = {
  per_transaction:'Per transaction', daily:'Daily', weekly:'Weekly', permanent:'Permanent',
}
const OL_TAGS = ['AML flag','Abuse','Compliance','Manual review required','Fraud prevention']

function PillToggle({ label, selected, onToggle }: { label: string; selected: boolean; onToggle: () => void }) {
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

// ---- Games history ---------------------------------------------------------

type GameHistoryRow = {
  game: string
  time: string
  id: string
  exitId: string
  provider: string
  brand: string
  bet: number
  win: number
  balanceBet: number
  balanceWin: number
  bonusBet: number
  bonusWin: number
  balanceGgr: number
  bonusGgr: number
  ggr: number
  rollover: number
}

const GAME_HISTORY_COLS = [
  { key: 'game',       label: 'Game',        tip: 'Game the round was played in.' },
  { key: 'time',       label: 'Time',        tip: 'Date and time the round was played (server time).' },
  { key: 'id',         label: 'ID',          tip: 'Internal transaction ID assigned by the platform for each game round.' },
  { key: 'provider',   label: 'Provider',    tip: 'Game aggregator that supplies the game to the platform.' },
  { key: 'brand',      label: 'Brand',       tip: 'Game studio (brand) that produced the game.' },
  { key: 'bet',        label: 'Bet',         tip: 'Total amount staked in the round -- real balance plus bonus funds. Bet = Balance Bet + Bonus Bet.' },
  { key: 'win',        label: 'Win',         tip: 'Total amount won in the round, credited to real and bonus balance. Win = Balance Win + Bonus Win.' },
  { key: 'balanceBet', label: 'Balance Bet', tip: 'Part of the bet paid from the real (cash) balance.' },
  { key: 'balanceWin', label: 'Balance Win', tip: 'Part of the win credited to the real (cash) balance.' },
  { key: 'bonusBet',   label: 'Bonus Bet',   tip: 'Part of the bet paid from bonus funds.' },
  { key: 'bonusWin',   label: 'Bonus Win',   tip: 'Part of the win credited to the bonus balance.' },
  { key: 'balanceGgr', label: 'Balance GGR', tip: 'Gross gaming revenue from real-money play. Balance GGR = Balance Bet - Balance Win.' },
  { key: 'bonusGgr',   label: 'Bonus GGR',   tip: 'Gross gaming revenue from bonus play. Usually 0, since bonus funds are an operator liability, not real revenue.' },
  { key: 'ggr',        label: 'GGR',         tip: "Total gross gaming revenue -- the operator's result on the round. GGR = Balance GGR + Bonus GGR." },
  { key: 'rollover',   label: 'Rollover',    tip: 'Remaining wagering requirement after this round -- the amount still to be bet before bonus funds convert to real balance.' },
  { key: 'exitId',     label: 'Exit ID',     tip: 'External round ID (RID) returned by the game provider -- used to trace the round on the provider side.' },
] as const

type GameHistoryColKey = typeof GAME_HISTORY_COLS[number]['key']

const GAME_COL_TIP: Record<GameHistoryColKey, string> = Object.fromEntries(
  GAME_HISTORY_COLS.map(c => [c.key, c.tip]),
) as Record<GameHistoryColKey, string>

function GameHeadLabel({ label, tip }: { label: string; tip: string }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-default">{label}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[240px] text-xs">
          {tip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

const MOCK_GAME_HISTORY: GameHistoryRow[] = [
  { game: 'Betby Sportsbook',                 time: '2025-09-13 06:39:24.118', id: '226256391118', exitId: 'cc3a6d9b-be1d-53dc-b486-49f8de42d1a7', provider: 'BetBy',    brand: 'BetBy',         bet: 107,  win: 115.83, balanceBet: 107,  balanceWin: 115.83, bonusBet: 0, bonusWin: 0,    balanceGgr: -8.83, bonusGgr: 0, ggr: -8.83, rollover: 0 },
  { game: 'Junkyard Kings',                   time: '2025-09-13 06:38:52.904', id: '226256391112', exitId: 'c1f9ec7c-d60f-57a5-bdcf-e9e414048002', provider: 'Hacksaw',  brand: 'Hacksaw',       bet: 1.4,  win: 0.75,   balanceBet: 1.4,  balanceWin: 0.75,   bonusBet: 0, bonusWin: 0,    balanceGgr: 0.65,  bonusGgr: 0, ggr: 0.65, rollover: 0 },
  { game: 'Old Gun',                          time: '2025-09-13 06:38:11.560', id: '226256391108', exitId: '69a8da63-3cef-5e89-a62b-15fa885fd691', provider: 'Hacksaw',  brand: 'Hacksaw',       bet: 2,    win: 0.6,    balanceBet: 2,    balanceWin: 0.6,    bonusBet: 0, bonusWin: 0,    balanceGgr: 1.4,   bonusGgr: 0, ggr: 1.4, rollover: 0 },
  { game: 'Flame & Fortune: Hold & Win',      time: '2025-09-13 06:37:45.203', id: '226256391105', exitId: '6d5c2ee8-1bf6-5ea1-ad19-a1e72b719544', provider: 'Octoplay', brand: 'Penguin King',  bet: 20.4, win: 9,      balanceBet: 20.4, balanceWin: 9,      bonusBet: 0, bonusWin: 0,    balanceGgr: 11.4,  bonusGgr: 0, ggr: 11.4, rollover: 46975.6 },
  { game: 'Book of Dead',                     time: '2025-09-13 06:36:58.771', id: '226256391098', exitId: 'f3631a27-56bb-5143-9d6a-5091bf1f6382', provider: 'PlayNGo',  brand: 'PlaynGo',       bet: 4,    win: 0,      balanceBet: 4,    balanceWin: 0,      bonusBet: 0, bonusWin: 0,    balanceGgr: 4,     bonusGgr: 0, ggr: 4, rollover: 46980.6 },
  { game: 'Sweet Bonanza',                    time: '2025-09-13 06:36:12.049', id: '226256391087', exitId: '8dcfbc96-afd7-5a3a-9c85-80dca304e27f', provider: 'Pragmatic', brand: 'PragmaticPlay', bet: 0.4, win: 1.11,   balanceBet: 0.4,  balanceWin: 0.23,   bonusBet: 0, bonusWin: 0.88, balanceGgr: 0.17,  bonusGgr: 0, ggr: 0.17, rollover: 46985.6 },
  { game: 'Fruit Party',                      time: '2025-09-13 06:35:40.882', id: '226256391085', exitId: 'e9996606-d6a9-5745-bd7c-b530ae641308', provider: 'Pragmatic', brand: 'PragmaticPlay', bet: 0.4, win: 0.5,    balanceBet: 0.4,  balanceWin: 0.5,    bonusBet: 0, bonusWin: 0,    balanceGgr: -0.1,  bonusGgr: 0, ggr: -0.1, rollover: 46990.6 },
  { game: 'Gates of Olympus 1000',            time: '2025-09-13 06:35:03.417', id: '226256391079', exitId: 'ccd12b43-f763-5169-b9de-0db1e2557102', provider: 'Pragmatic', brand: 'PragmaticPlay', bet: 1.4, win: 1.84,   balanceBet: 1.4,  balanceWin: 1.84,   bonusBet: 0, bonusWin: 0,    balanceGgr: -0.44, bonusGgr: 0, ggr: -0.44, rollover: 46995.6 },
  { game: 'The Dog House - Muttley Crew',     time: '2025-09-13 06:34:29.660', id: '226256391064', exitId: 'a1b2c3d4-e5f6-5789-a0b1-c2d3e4f50617', provider: 'Pragmatic', brand: 'PragmaticPlay', bet: 2.4, win: 0,      balanceBet: 2.4,  balanceWin: 0,      bonusBet: 0, bonusWin: 0,    balanceGgr: 2.4,   bonusGgr: 0, ggr: 2.4, rollover: 47000 },
  { game: 'Big Bass Bonanza 1000',            time: '2025-09-13 06:33:57.238', id: '226256391052', exitId: 'b2c3d4e5-f607-5891-a1b2-c3d4e5f60718', provider: 'Pragmatic', brand: 'PragmaticPlay', bet: 1.2, win: 1.2,    balanceBet: 1.2,  balanceWin: 1.2,    bonusBet: 0, bonusWin: 0,    balanceGgr: 0,     bonusGgr: 0, ggr: 0, rollover: 47000 },
  { game: 'Gates of Olympus Super Scatter',   time: '2025-09-13 06:33:14.905', id: '226256391041', exitId: 'c3d4e5f6-0718-5912-a2b3-c4d5e6f70819', provider: 'Pragmatic', brand: 'PragmaticPlay', bet: 2.2, win: 0.44,   balanceBet: 2.2,  balanceWin: 0.44,   bonusBet: 0, bonusWin: 0,    balanceGgr: 1.76,  bonusGgr: 0, ggr: 1.76, rollover: 47000 },
  { game: 'Gates of Hades',                   time: '2025-09-13 06:32:48.331', id: '226256391033', exitId: 'd4e5f607-1829-5a23-b3c4-d5e6f7081920', provider: 'Pragmatic', brand: 'PragmaticPlay', bet: 4,    win: 5.9,    balanceBet: 4,    balanceWin: 5.9,    bonusBet: 0, bonusWin: 0,    balanceGgr: -1.9,  bonusGgr: 0, ggr: -1.9, rollover: 0 },
  { game: '15 Dragon Pearls: Hold and Win',   time: '2025-09-13 06:32:05.774', id: '226256391021', exitId: 'e5f60718-2930-5b34-c4d5-e6f708192031', provider: 'Redgenn',  brand: 'Booongo',       bet: 1.5,  win: 0.15,   balanceBet: 1.5,  balanceWin: 0.15,   bonusBet: 0, bonusWin: 0,    balanceGgr: 1.35,  bonusGgr: 0, ggr: 1.35, rollover: 0 },
  { game: 'Book of Ra Deluxe 6',              time: '2025-09-13 06:31:33.612', id: '226256391014', exitId: 'f6071829-3041-5c45-d5e6-f70819203142', provider: 'Redgenn',  brand: 'Novomatic',     bet: 3,    win: 0,      balanceBet: 3,    balanceWin: 0,      bonusBet: 0, bonusWin: 0,    balanceGgr: 3,     bonusGgr: 0, ggr: 3, rollover: 0 },
  { game: 'Wild Bingo',                       time: '2025-09-13 06:30:58.009', id: '226256391008', exitId: '07182930-4152-5d56-e6f7-081920314253', provider: 'Redgenn',  brand: 'Platipus',      bet: 0.4,  win: 0,      balanceBet: 0.4,  balanceWin: 0,      bonusBet: 0, bonusWin: 0,    balanceGgr: 0.4,   bonusGgr: 0, ggr: 0.4, rollover: 0 },
  { game: 'Supercharged Clovers: Hold And Win', time: '2025-09-13 06:30:21.487', id: '226256390995', exitId: '18293041-5263-5e67-f708-192031425364', provider: 'Redgenn', brand: 'PlaysonDirect', bet: 1.5, win: 0,     balanceBet: 1.5,  balanceWin: 0,      bonusBet: 0, bonusWin: 0,    balanceGgr: 1.5,   bonusGgr: 0, ggr: 1.5, rollover: 0 },
  { game: 'Purrrminator',                     time: '2025-09-13 06:29:47.155', id: '226256390981', exitId: '29304152-6374-5f78-0819-203142536475', provider: 'Relax',    brand: 'Relax',         bet: 0.5,  win: 0,      balanceBet: 0.5,  balanceWin: 0,      bonusBet: 0, bonusWin: 0,    balanceGgr: 0.5,   bonusGgr: 0, ggr: 0.5, rollover: 0 },
]

// ---- Bonuses ----------------------------------------------------------------

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
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Flag className="size-3.5 fill-destructive text-destructive" />
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
  const [selectedDuplicate, setSelectedDuplicate] = useState<DuplicateAccount | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [copiedDupId, setCopiedDupId] = useState<string | null>(null)
  const [copiedDrawerId, setCopiedDrawerId] = useState(false)
  const [seDrawerOpen, setSeDrawerOpen] = useState(false)
  const [seType, setSeType] = useState<'temporary' | 'permanent'>('temporary')
  const [sePeriod, setSePeriod] = useState('30d')
  const [seReason, setSeReason] = useState('')
  const [seNote, setSeNote] = useState('')
  const [coDrawerOpen, setCoDrawerOpen] = useState(false)
  const [coStartDate, setCoStartDate] = useState<Date | undefined>(undefined)
  const [coEndDate, setCoEndDate] = useState<Date | undefined>(undefined)
  const [coReason, setCoReason] = useState('')
  const [coNote, setCoNote] = useState('')

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

  const [gameScrollNode, setGameScrollNode] = useState<HTMLDivElement | null>(null)
  const [gameHasOverflow, setGameHasOverflow] = useState(false)
  const gameScrollRef = useCallback((node: HTMLDivElement | null) => setGameScrollNode(node), [])
  useLayoutEffect(() => {
    if (!gameScrollNode) return
    const check = () => setGameHasOverflow(gameScrollNode.scrollWidth > gameScrollNode.clientWidth)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(gameScrollNode)
    window.addEventListener('resize', check)
    return () => { ro.disconnect(); window.removeEventListener('resize', check) }
  }, [gameScrollNode])

  const [financeSearch, setFinanceSearch] = useState('')
  const [financeVisibleCols, setFinanceVisibleCols] = useState<Set<FinanceColKey>>(
    new Set<FinanceColKey>(['txId','debit','credit','rollover','wallet','type','txStatus','source','paymentMethod','paymentSystem','createdAt','finishedAt'])
  )
  const [financeColOpen, setFinanceColOpen] = useState(false)
  const [financeTxIdFrozen, setFinanceTxIdFrozen] = useState(true)

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

  function toggleBonusCol(key: BonusColKey) {
    setBonusVisibleCols(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const [gameSearch, setGameSearch] = useState('')
  const [gameVisibleCols, setGameVisibleCols] = useState<Set<GameHistoryColKey>>(
    new Set<GameHistoryColKey>(['time','id','provider','brand','bet','win','balanceBet','balanceWin','bonusBet','bonusWin','balanceGgr','bonusGgr','ggr','rollover','exitId'])
  )
  const [gameColOpen, setGameColOpen] = useState(false)
  const [gameNameFrozen, setGameNameFrozen] = useState(true)
  const [gameDateRange, setGameDateRange] = useState<DateRange | undefined>(undefined)

  function toggleGameCol(key: GameHistoryColKey) {
    setGameVisibleCols(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  // Money is stored in EUR; show EUR with the player's native currency (e.g. AUD) as a secondary line.
  const gameEur = (n: number) => `${n < 0 ? '-' : ''}€${Math.abs(n).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const gameNative = (n: number) => `${n < 0 ? '-' : ''}${Math.abs(n * fxRate).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${playerCurrency}`
  const gameMoneyCell = (n: number) => (
    <TableCell className="whitespace-nowrap">
      <span className="text-sm tabular-nums block">{gameEur(n)}</span>
      {playerCurrency !== 'EUR' && (
        <span className="text-xs text-muted-foreground tabular-nums block">{gameNative(n)}</span>
      )}
    </TableCell>
  )

  function copyBonusId(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    navigator.clipboard.writeText(id)
    setCopiedBonusId(id)
    setTimeout(() => setCopiedBonusId(null), 1500)
  }

  const statusOf = (b: Bonus): BonusStatus => bonusStatuses[b.id] ?? b.status
  const setBonusStatus = (id: string, s: BonusStatus) => setBonusStatuses(prev => ({ ...prev, [id]: s }))

  const [financeDateRange, setFinanceDateRange] = useState<DateRange | undefined>(undefined)

  function toggleFinanceCol(key: FinanceColKey) {
    setFinanceVisibleCols(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const [playerLimits, setPlayerLimits] = useState<PlayerLimitItem[]>([
    { name:'Loss limit', scope:'Daily', current:'€80', limit:'€200', unit:'€', pct:40, disabled:false, _type:'loss_limit', _scope:'daily', _value:'200', setByDate:'11.05.2025', setByPlayer:true },
    { name:'Deposit limit', scope:'Weekly', current:'€320', limit:'€500', unit:'€', pct:64, disabled:false, _type:'deposit_limit', _scope:'weekly', _value:'500', setBy:'@JasonDuval', setByEmail:'jason.duval@bildery.com', setByDate:'19.05.2026' },
    { name:'Session time', scope:'Daily', current:'1h 20m', limit:'3h', unit:'h', pct:44, disabled:false, _type:'session_time', _scope:'daily', _value:'3', setByDate:'11.05.2025', setByPlayer:true },
    { name:'Cooling-off', scope:'One-time', current:'—', limit:'Not set', unit:'', pct:null, disabled:false, _type:'cooling_off', _scope:'one_time', _value:'' },
  ])
  const [operatorLimits, setOperatorLimits] = useState<OperatorLimitItem[]>([
    { name:'Max withdrawal', scope:'Per transaction', value:'€2,000', valueNative:'3,420 AUD', tag:'AML flag', meta:'', metaHandle:'@JasonDuval', metaEmail:'jason.duval@bildery.com', metaDate:'2026-06-20', disabled:false, _type:'max_withdrawal', _scope:'per_transaction' },
    { name:'Bonus restriction', scope:'Permanent', value:'No bonuses', tag:'Abuse', meta:'', metaHandle:'@RiskTeam', metaEmail:'risk@bildery.com', metaDate:'2026-05-15', disabled:false, _type:'bonus_restriction', _scope:'permanent' },
    { name:'Review threshold', scope:'Per transaction', value:'> €500', valueNative:'855 AUD', tag:'Manual review required', meta:'', metaHandle:'@ComplianceTeam', metaEmail:'compliance@bildery.com', metaDate:'2026-06-10', disabled:false, _type:'review_threshold', _scope:'per_transaction' },
  ])

  const [plDrawerOpen, setPlDrawerOpen] = useState(false)
  const [plEditIndex, setPlEditIndex] = useState<number | null>(null)
  const [plType, setPlType] = useState('loss_limit')
  const [plScope, setPlScope] = useState('daily')
  const [plValue, setPlValue] = useState('')

  const [olDrawerOpen, setOlDrawerOpen] = useState(false)
  const [olEditIndex, setOlEditIndex] = useState<number | null>(null)
  const [olType, setOlType] = useState('max_withdrawal')
  const [olScope, setOlScope] = useState('per_transaction')
  const [olValue, setOlValue] = useState('')
  const [olCurrency, setOlCurrency] = useState('EUR')
  const [olTag, setOlTag] = useState('')
  const [olNote, setOlNote] = useState('')

  function openAddPl() {
    setPlEditIndex(null); setPlType('loss_limit'); setPlScope('daily'); setPlValue(''); setPlDrawerOpen(true)
  }
  function openEditPl(idx: number) {
    const l = playerLimits[idx]
    setPlEditIndex(idx); setPlType(l._type); setPlScope(l._scope); setPlValue(l._value); setPlDrawerOpen(true)
  }
  function savePl() {
    const typeDef = PL_TYPES.find(t => t.value === plType)!
    const unit = typeDef.unit
    const scopeLabel = PL_SCOPE_LABELS[plScope] || plScope
    const displayLimit = plType === 'cooling_off' ? 'Not set' : plValue ? (unit === '€' ? `€${plValue}` : `${plValue}${unit}`) : 'Not set'
    const newL: PlayerLimitItem = {
      name: typeDef.label, scope: scopeLabel,
      current: plType === 'cooling_off' ? '—' : unit === '€' ? '€0' : `0${unit}`,
      limit: displayLimit, unit, pct: plType === 'cooling_off' ? null : 0,
      disabled: false, _type: plType, _scope: plScope, _value: plValue,
    }
    if (plEditIndex !== null) {
      setPlayerLimits(prev => prev.map((l, i) => i === plEditIndex ? { ...newL, current: l.current, pct: l.pct } : l))
    } else {
      setPlayerLimits(prev => [...prev, newL])
    }
    setPlDrawerOpen(false)
  }
  function togglePl(idx: number) {
    setPlayerLimits(prev => prev.map((l, i) => i === idx ? { ...l, disabled: !l.disabled } : l))
  }

  function openAddOl() {
    setOlEditIndex(null); setOlType('max_withdrawal'); setOlScope('per_transaction')
    setOlValue(''); setOlCurrency('EUR'); setOlTag(''); setOlNote(''); setOlDrawerOpen(true)
  }
  function openEditOl(idx: number) {
    const l = operatorLimits[idx]
    setOlEditIndex(idx); setOlType(l._type); setOlScope(l._scope)
    setOlValue(l.value); setOlCurrency('EUR'); setOlTag(l.tag); setOlNote(''); setOlDrawerOpen(true)
  }
  function saveOl() {
    const name = OL_TYPE_NAMES[olType] || 'Custom'
    const scope = OL_SCOPE_LABELS[olScope] || olScope
    const today = new Date().toISOString().split('T')[0]
    const fxRate = player?.fxRate ?? 1.71
    const numericVal = parseFloat(olValue.replace(/[^\d.]/g, ''))
    let displayValue = olValue
    let valueNative: string | undefined
    if (!isNaN(numericVal) && olType !== 'bonus_restriction') {
      if (olCurrency === 'EUR') {
        displayValue = `€${numericVal.toLocaleString('en')}`
        valueNative = `${Math.round(numericVal * fxRate).toLocaleString('en')} ${playerCurrency}`
      } else {
        displayValue = `€${Math.round(numericVal / fxRate).toLocaleString('en')}`
        valueNative = `${numericVal.toLocaleString('en')} ${playerCurrency}`
      }
    }
    const newL: OperatorLimitItem = {
      name, scope, value: displayValue, valueNative, tag: olTag,
      meta: '', metaHandle: '@JasonDuval', metaEmail: 'jason.duval@bildery.com', metaDate: today,
      disabled: false, _type: olType, _scope: olScope,
    }
    if (olEditIndex !== null) {
      setOperatorLimits(prev => prev.map((l, i) => i === olEditIndex ? { ...newL, disabled: l.disabled } : l))
    } else {
      setOperatorLimits(prev => [...prev, newL])
    }
    setOlDrawerOpen(false)
  }
  function toggleOl(idx: number) {
    setOperatorLimits(prev => prev.map((l, i) => i === idx ? { ...l, disabled: !l.disabled } : l))
  }

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

          <TabsContent value="finance" className="flex flex-col gap-4">
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

                <DateRangeFilter value={financeDateRange} onChange={setFinanceDateRange} mobileLabel="none" />

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
          </TabsContent>
          <TabsContent value="statistics">
            <p className="text-sm text-muted-foreground">Statistics content coming soon.</p>
          </TabsContent>
          <TabsContent value="bonuses" className="flex flex-col gap-4">
            <div>
              <h2 className="text-base font-semibold">Bonuses</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Bonuses issued to this player and their wagering status.
              </p>
            </div>

            {/* Sub-tabs + toolbar */}
            <Tabs value={bonusSubtab} onValueChange={setBonusSubtab} className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <TabsList>
                  <TabsTrigger value="bonuses">Bonuses</TabsTrigger>
                  <TabsTrigger value="shop">Shop</TabsTrigger>
                  <TabsTrigger value="benefits" disabled>Benefits</TabsTrigger>
                  <TabsTrigger value="packages" disabled>Packages</TabsTrigger>
                </TabsList>

                {bonusSubtab === 'bonuses' && (
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
          </TabsContent>
          <TabsContent value="games-history" className="flex flex-col gap-4">
            <div>
              <h2 className="text-base font-semibold">Games history</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Games played by this player with bet, win and GGR breakdown.
              </p>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search..."
                  value={gameSearch}
                  onChange={e => setGameSearch(e.target.value)}
                  className="pl-8 h-8 w-48 text-sm"
                />
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <Popover open={gameColOpen} onOpenChange={setGameColOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Columns2 className="size-3.5" />
                      <span className="hidden sm:inline">Columns</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" sideOffset={6} className="w-48 p-1">
                    <button
                      type="button"
                      onClick={() => setGameNameFrozen(v => !v)}
                      className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
                    >
                      {gameNameFrozen
                        ? <PinOff className="size-3.5 shrink-0" />
                        : <Pin className="size-3.5 shrink-0" />}
                      Game
                    </button>
                    {GAME_HISTORY_COLS.filter(col => col.key !== 'game').map(col => (
                      <button
                        key={col.key}
                        type="button"
                        onClick={() => toggleGameCol(col.key)}
                        className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
                      >
                        <Check className={`size-3.5 shrink-0 ${gameVisibleCols.has(col.key) ? 'opacity-100' : 'opacity-0'}`} />
                        {col.label}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>

                <DateRangeFilter value={gameDateRange} onChange={setGameDateRange} mobileLabel="none" />

                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="size-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </div>
            </div>

            <div className="relative rounded-2xl border border-border bg-card overflow-hidden">
              {gameHasOverflow && <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-card to-transparent z-10" />}
              <div className="overflow-x-auto" ref={gameScrollRef}>
                <Table className="min-w-max">
                  <TableHeader className="bg-muted/60">
                    <TableRow className="hover:bg-transparent border-b border-border">
                      <TableHead className={`text-sm font-medium text-foreground pl-4 ${gameNameFrozen ? "sticky left-0 z-20 bg-muted after:absolute after:right-0 after:top-0 after:bottom-0 after:w-px after:bg-border after:content-['']" : ""}`}>
                        <GameHeadLabel label="Game" tip={GAME_COL_TIP.game} />
                      </TableHead>
                      {GAME_HISTORY_COLS.filter(col => col.key !== 'game').map(col => (
                        gameVisibleCols.has(col.key) && (
                          <TableHead key={col.key} className="text-sm font-medium text-foreground">
                            <GameHeadLabel label={col.label} tip={col.tip} />
                          </TableHead>
                        )
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_GAME_HISTORY.filter(g =>
                      gameSearch === '' ||
                      g.game.toLowerCase().includes(gameSearch.toLowerCase()) ||
                      g.provider.toLowerCase().includes(gameSearch.toLowerCase()) ||
                      g.brand.toLowerCase().includes(gameSearch.toLowerCase()) ||
                      g.exitId.toLowerCase().includes(gameSearch.toLowerCase())
                    ).map(g => (
                      <TableRow key={g.game}>
                        <TableCell className={`pl-4 ${gameNameFrozen ? "sticky left-0 z-10 bg-background after:absolute after:right-0 after:top-0 after:bottom-0 after:w-px after:bg-border after:content-['']" : ""}`}>
                          <span className="text-sm font-medium whitespace-nowrap">{g.game}</span>
                        </TableCell>
                        {gameVisibleCols.has('time')       && <TableCell className="text-sm text-muted-foreground tabular-nums whitespace-nowrap">{g.time}</TableCell>}
                        {gameVisibleCols.has('id')         && <TableCell className="text-sm tabular-nums whitespace-nowrap">{g.id}</TableCell>}
                        {gameVisibleCols.has('provider')   && <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{g.provider}</TableCell>}
                        {gameVisibleCols.has('brand')      && <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{g.brand}</TableCell>}
                        {gameVisibleCols.has('bet')        && gameMoneyCell(g.bet)}
                        {gameVisibleCols.has('win')        && gameMoneyCell(g.win)}
                        {gameVisibleCols.has('balanceBet') && gameMoneyCell(g.balanceBet)}
                        {gameVisibleCols.has('balanceWin') && gameMoneyCell(g.balanceWin)}
                        {gameVisibleCols.has('bonusBet')   && gameMoneyCell(g.bonusBet)}
                        {gameVisibleCols.has('bonusWin')   && gameMoneyCell(g.bonusWin)}
                        {gameVisibleCols.has('balanceGgr') && gameMoneyCell(g.balanceGgr)}
                        {gameVisibleCols.has('bonusGgr')   && gameMoneyCell(g.bonusGgr)}
                        {gameVisibleCols.has('ggr')        && gameMoneyCell(g.ggr)}
                        {gameVisibleCols.has('rollover')   && gameMoneyCell(g.rollover)}
                        {gameVisibleCols.has('exitId')     && <TableCell className="text-sm text-muted-foreground font-mono tabular-nums whitespace-nowrap">{g.exitId}</TableCell>}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
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
          <TabsContent value="duplicates" className="flex flex-col gap-4">
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
          </TabsContent>
          <TabsContent value="limits" className="flex flex-col gap-6">

            {/* Player limits + Operator limits */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Column 1: Player limits */}
            <div className="flex flex-col gap-6">
            {/* Player limits */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <User className="size-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">Player limits</p>
                    <p className="text-xs text-muted-foreground hidden sm:block">Set by the player or by the operator on the player's behalf.</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={openAddPl}>
                  <Pencil className="size-3.5" />
                  <span>Edit limits</span>
                </Button>
              </div>
              <div className="divide-y divide-border overflow-y-auto max-h-72">
                {playerLimits.map((limit, idx) => {
                  const barColor = 'bg-foreground'
                  return (
                    <div key={idx} className={`transition-opacity ${limit.disabled ? 'opacity-50' : ''}`}>
                      <div className="flex items-center gap-2 justify-between px-4 pt-3 pb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`text-sm font-medium ${limit.disabled ? 'line-through text-muted-foreground' : ''}`}>{limit.name}</span>
                          <span className="inline-flex items-center rounded-md border border-border px-1.5 py-0.5 text-xs text-muted-foreground shrink-0">{limit.scope}</span>
                          {limit.disabled && <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground shrink-0">Disabled</span>}
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <span className="text-sm tabular-nums text-muted-foreground">
                            {limit.pct !== null
                              ? <><span className="text-foreground font-semibold">{limit.current}</span> / {limit.limit}</>
                              : limit._type === 'cooling_off'
                                ? <span className="text-muted-foreground">Not set</span>
                                : <span>{limit.limit}</span>}
                          </span>
                          {limit.unit === '€' && limit.pct !== null && (() => {
                            const cur = parseFloat(limit.current.replace(/[€,]/g, ''))
                            const lim = parseFloat(limit._value)
                            const nCur = toNative(cur)
                            const nLim = toNative(lim)
                            return nLim ? <span className="text-xs text-muted-foreground tabular-nums">{nCur} / {nLim}</span> : null
                          })()}
                        </div>
                      </div>
                      {limit.pct !== null && !limit.disabled ? (
                        <div className="flex flex-col gap-1 px-4 pb-3">
                          <div className="h-1.5 rounded-full bg-muted-foreground/15">
                            <div className={`h-1.5 rounded-full ${barColor} transition-all`} style={{ width: `${limit.pct}%` }} />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-muted-foreground tabular-nums">{limit.pct}% achieved</span>
                            {(limit.setBy || limit.setByPlayer) && (
                              <span className="text-xs text-muted-foreground cursor-default">
                                {limit.setByPlayer ? (
                                  <>{limit.setByDate}{' · By Player'}</>
                                ) : (
                                  <>{limit.setByDate}{' · '}
                                    <TooltipProvider delayDuration={200}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span>{limit.setBy}</span>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="text-xs">{limit.setByEmail}</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    {' · On Player\'s behalf'}
                                  </>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="pb-3" />
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="border-t border-border bg-muted/50 px-4 py-5 flex items-center">
                <p className="text-xs text-muted-foreground">Changes take effect immediately and reset on schedule.</p>
              </div>
            </div>
            </div>{/* end column 1 */}

            {/* Column 2: Self-exclusion + Cooling-off */}
            <div className="flex flex-col gap-6">

            {/* Self-exclusion */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <Ban className="size-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm font-medium">Self-exclusion</p>
                  <p className="text-xs text-muted-foreground hidden sm:block">Player-initiated account freezes. Cannot be overridden by operator during active period.</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 text-center py-10">
                <div className="size-10 rounded-xl bg-muted flex items-center justify-center">
                  <Ban className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">No self-exclusion active</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Player has not requested any exclusion period.</p>
                </div>
                <Button variant="outline" size="sm" className="mt-1 gap-1.5" onClick={() => setSeDrawerOpen(true)}>
                  <Plus className="size-3.5" />
                  Apply self-exclusion
                </Button>
              </div>
            </div>

            {/* Cooling-off */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Timer className="size-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Cooling-off</p>
                    <p className="text-xs text-muted-foreground hidden sm:block">Player-requested temporary pause. Cannot be shortened.</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={() => setCoDrawerOpen(true)}>
                  <Pencil className="size-3.5" />
                  <span>Edit</span>
                </Button>
              </div>
              <div className="flex justify-center py-6">
                {(() => {
                  const size = 220
                  const cx = 110
                  const cy = 110
                  const r = 86
                  const stroke = 26
                  const pct = 0.71
                  const circ = 2 * Math.PI * r
                  const dash = pct * circ
                  const gap = circ - dash
                  return (
                    <svg width={size} height={size}>
                      {/* track */}
                      <circle cx={cx} cy={cy} r={r} fill="none" stroke="hsl(0,0%,90%)" strokeWidth={stroke} />
                      {/* progress — start at top (rotate -90deg) */}
                      <circle
                        cx={cx} cy={cy} r={r} fill="none"
                        stroke="hsl(220,9%,44%)"
                        strokeWidth={stroke}
                        strokeDasharray={`${dash} ${gap}`}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${cx} ${cy})`}
                      />
                      <text x={cx} y={cy - 10} textAnchor="middle" dominantBaseline="middle" fontSize={18} fontWeight={700} fill="currentColor">5d 17h 49m</text>
                      <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="middle" fontSize={12} fill="hsl(220,9%,44%)">remaining</text>
                    </svg>
                  )
                })()}
              </div>
              <div className="h-px bg-border" />
              <div className="bg-muted/40 flex flex-col px-4">
                {[
                  { label: 'Started', value: '2026-06-22' },
                  { label: 'Ends', value: '2026-06-29' },
                  { label: 'Duration', value: '7 days' },
                  { label: 'Times used', value: '3' },
                ].map((item, idx, arr) => (
                  <div key={item.label}>
                    <div className={`flex w-full items-center justify-between ${idx === 0 ? 'pt-4 pb-3' : idx === arr.length - 1 ? 'pt-3 pb-4' : 'py-3'}`}>
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className="text-sm font-semibold tabular-nums">{item.value}</span>
                    </div>
                    {idx < arr.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </div>

            </div>{/* end column 2 */}

            {/* Column 3: Operator limits + Regulatory limits */}
            <div className="flex flex-col gap-6">
            {/* Operator limits */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <UserCog className="size-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">Operator limits</p>
                    <p className="text-xs text-muted-foreground hidden sm:block">Manually applied by your team. Player cannot modify.</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={openAddOl}>
                  <Pencil className="size-3.5" />
                  <span>Edit limits</span>
                </Button>
              </div>
              <div className="divide-y divide-border">
                {operatorLimits.map((limit, idx) => (
                  <div key={idx} className={`flex items-start sm:items-center justify-between gap-3 px-4 py-3 transition-opacity ${limit.disabled ? 'opacity-50' : ''}`}>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-medium ${limit.disabled ? 'line-through text-muted-foreground' : ''}`}>{limit.name}</span>
                        <span className="inline-flex items-center rounded-md border border-border px-1.5 py-0.5 text-xs text-muted-foreground">{limit.scope}</span>
                        {limit.tag && !limit.disabled && (
                          <span className="inline-flex items-center rounded-md bg-destructive-bg px-1.5 py-0.5 text-xs text-destructive">{limit.tag}</span>
                        )}
                        {limit.disabled && <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">Disabled</span>}
                      </div>
                      {limit.metaHandle ? (
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-xs text-muted-foreground cursor-default">{limit.metaDate} · {limit.metaHandle}</p>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">{limit.metaEmail}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <p className="text-xs text-muted-foreground">{limit.meta}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-sm font-medium tabular-nums">{limit.value}</span>
                      {limit.valueNative && <span className="text-xs text-muted-foreground tabular-nums">{limit.valueNative}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Regulatory limits */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Shield className="size-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">Regulatory limits</p>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      Jurisdiction: <span className="text-foreground font-medium">Australia (ACMA)</span> -- read-only, enforced by law.
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-subtle px-2 py-1 text-xs text-muted-foreground border border-subtle-border shrink-0">
                  <Globe className="size-3" />
                  ACMA
                </span>
              </div>
              <div className="divide-y divide-border">
                {[
                  { name: 'Max single bet', scope: 'Per bet', value: '€29.00', valueEur: '50.00 AUD', ref: 'ACMA §4.2', active: true },
                  { name: 'Reality check', scope: 'Every 60 min', value: 'Enabled', ref: 'ACMA §6.1', active: true },
                  { name: 'Self-exclusion register', scope: 'National', value: 'Not enrolled', ref: 'BetStop', active: false },
                  { name: 'Credit card deposits', scope: 'Any amount', value: 'Prohibited', ref: 'ACMA §9', active: true },
                ].map((limit) => (
                  <div key={limit.name} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{limit.name}</span>
                        <span className="inline-flex items-center rounded-md border border-border px-1.5 py-0.5 text-xs text-muted-foreground">{limit.scope}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{limit.ref}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex flex-col items-end">
                        <span className={`text-sm font-medium tabular-nums ${limit.active ? 'text-foreground' : 'text-muted-foreground'}`}>{limit.value}</span>
                        {limit.valueEur && <span className="text-xs text-muted-foreground tabular-nums">{limit.valueEur}</span>}
                      </div>
                      <div className={`size-1.5 rounded-full shrink-0 ${limit.active ? 'bg-success' : 'bg-muted-foreground/40'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            </div>{/* end right column */}
            </div>{/* end grid */}

            {/* Player limit add/edit drawer */}
            <Drawer open={plDrawerOpen} onOpenChange={setPlDrawerOpen} direction={isMobile ? 'bottom' : 'right'}>
              <DrawerContent className="sm:max-w-[400px] flex flex-col">
                <DrawerHeader className="border-b border-border flex flex-row items-center justify-between">
                  <DrawerTitle>{plEditIndex !== null ? 'Edit player limit' : 'Add player limit'}</DrawerTitle>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon-sm"><X className="size-4" /></Button>
                  </DrawerClose>
                </DrawerHeader>
                <div className="flex flex-col gap-5 flex-1 overflow-y-auto px-4 py-5 min-h-0">

                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium">Limit type</p>
                    <div className="flex flex-col gap-1.5">
                      {PL_TYPES.filter(t => t.value !== 'cooling_off').map(t => (
                        <button key={t.value}
                          onClick={() => { setPlType(t.value); setPlScope(PL_SCOPES[t.value][0].value) }}
                          className={`rounded-xl border px-4 py-2.5 text-left transition-colors ${
                            plType === t.value
                              ? 'border-foreground bg-muted'
                              : 'border-border hover:border-foreground/40'
                          }`}
                        >
                          <span className={`text-sm font-medium ${plType === t.value ? 'text-foreground' : 'text-muted-foreground'}`}>{t.label}</span>
                          <span className="block text-xs text-muted-foreground mt-0.5">{t.hint}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {(PL_SCOPES[plType]?.length ?? 0) > 1 && (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-medium">Period</p>
                      <div className="flex flex-wrap gap-2">
                        {PL_SCOPES[plType].map(s => (
                          <button key={s.value} onClick={() => setPlScope(s.value)}
                            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                              plScope === s.value
                                ? 'border-foreground bg-muted font-medium text-foreground'
                                : 'border-border text-muted-foreground hover:border-foreground/40'
                            }`}>{s.label}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {plType !== 'cooling_off' && (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-medium">Limit value</p>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">
                          {PL_TYPES.find(t => t.value === plType)?.unit}
                        </span>
                        <input type="number" value={plValue} onChange={e => setPlValue(e.target.value)}
                          placeholder={plType === 'session_time' ? 'e.g. 3' : 'e.g. 500'}
                          min="0"
                          className="w-full rounded-xl border border-border bg-transparent pl-8 pr-4 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring" />
                      </div>
                    </div>
                  )}

                </div>
                <div className="shrink-0 border-t border-border bg-muted p-4 flex gap-2">
                  <DrawerClose asChild>
                    <Button variant="outline" className="flex-1">Cancel</Button>
                  </DrawerClose>
                  <Button className="flex-1" disabled={plType !== 'cooling_off' && !plValue} onClick={savePl}>
                    {plEditIndex !== null ? 'Save changes' : 'Add limit'}
                  </Button>
                </div>
              </DrawerContent>
            </Drawer>

            {/* Operator limit add/edit drawer */}
            <Drawer open={olDrawerOpen} onOpenChange={setOlDrawerOpen} direction={isMobile ? 'bottom' : 'right'}>
              <DrawerContent className="sm:max-w-[400px] flex flex-col">
                <DrawerHeader className="border-b border-border flex flex-row items-center justify-between">
                  <DrawerTitle>Edit operator limit</DrawerTitle>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon-sm"><X className="size-4" /></Button>
                  </DrawerClose>
                </DrawerHeader>
                <div className="flex flex-col gap-5 flex-1 overflow-y-auto px-4 py-5 min-h-0">

                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium">Limit type</p>
                    <Select value={olType} onValueChange={setOlType}>
                      <SelectTrigger className="w-full text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {OL_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium">Scope</p>
                    <div className="flex flex-wrap gap-2">
                      {OL_SCOPES.map(s => (
                        <button key={s.value} onClick={() => setOlScope(s.value)}
                          className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                            olScope === s.value
                              ? 'border-foreground bg-muted font-medium text-foreground'
                              : 'border-border text-muted-foreground hover:border-foreground/40'
                          }`}>{s.label}</button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium">Value</p>
                    <div className="flex gap-2">
                      {olType !== 'bonus_restriction' && (
                        <Select value={olCurrency} onValueChange={setOlCurrency}>
                          <SelectTrigger className="w-24 shrink-0 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value={playerCurrency}>{playerCurrency}</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <input type="text" value={olValue} onChange={e => setOlValue(e.target.value)}
                        placeholder={olType === 'bonus_restriction' ? 'e.g. No bonuses' : olType === 'review_threshold' ? 'e.g. 500' : 'e.g. 2000'}
                        className="w-full rounded-lg border border-border bg-transparent px-3 py-[7px] text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium">Reason tag <span className="text-muted-foreground font-normal">(optional)</span></p>
                    <Select value={olTag} onValueChange={setOlTag}>
                      <SelectTrigger className="w-full text-sm"><SelectValue placeholder="Select reason..." /></SelectTrigger>
                      <SelectContent>
                        {OL_TAGS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium">Note <span className="text-muted-foreground font-normal">(optional)</span></p>
                    <textarea value={olNote} onChange={e => setOlNote(e.target.value)}
                      placeholder="Internal note for audit log..." rows={3}
                      className="w-full resize-none rounded-xl border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
                  </div>

                </div>
                <div className="shrink-0 border-t border-border bg-muted p-4 flex gap-2">
                  <DrawerClose asChild>
                    <Button variant="outline" className="flex-1">Cancel</Button>
                  </DrawerClose>
                  <Button className="flex-1" disabled={!olValue} onClick={saveOl}>
                    {olEditIndex !== null ? 'Save changes' : 'Add limit'}
                  </Button>
                </div>
              </DrawerContent>
            </Drawer>

            {/* Self-exclusion drawer */}
            <Drawer open={seDrawerOpen} onOpenChange={setSeDrawerOpen} direction={isMobile ? 'bottom' : 'right'}>
              <DrawerContent className="sm:max-w-[400px] flex flex-col">
                <DrawerHeader className="border-b border-border flex flex-row items-center justify-between">
                  <div>
                    <DrawerTitle>Apply self-exclusion</DrawerTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">For player: {playerName}</p>
                  </div>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon-sm"><X className="size-4" /></Button>
                  </DrawerClose>
                </DrawerHeader>

                <div className="flex flex-col gap-5 flex-1 overflow-y-auto px-4 py-5 min-h-0">

                  {/* Type */}
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium">Type</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(['temporary', 'permanent'] as const).map(t => (
                        <button
                          key={t}
                          onClick={() => setSeType(t)}
                          className={`rounded-xl border px-4 py-3 text-sm font-medium text-left transition-colors ${
                            seType === t
                              ? 'border-foreground bg-muted text-foreground'
                              : 'border-border text-muted-foreground hover:border-foreground/40'
                          }`}
                        >
                          {t === 'temporary' ? 'Temporary' : 'Permanent'}
                          <span className="block text-xs font-normal text-muted-foreground mt-0.5">
                            {t === 'temporary' ? 'Fixed period, then auto-reopens' : 'Cannot be reversed by player'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Period (only if temporary) */}
                  {seType === 'temporary' && (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-medium">Period</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { value: '1d', label: '1 day' },
                          { value: '7d', label: '1 week' },
                          { value: '30d', label: '1 month' },
                          { value: '180d', label: '6 months' },
                          { value: '365d', label: '1 year' },
                        ].map(p => (
                          <button
                            key={p.value}
                            onClick={() => setSePeriod(p.value)}
                            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                              sePeriod === p.value
                                ? 'border-foreground bg-muted font-medium text-foreground'
                                : 'border-border text-muted-foreground hover:border-foreground/40'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reason */}
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium">Reason</p>
                    <Select value={seReason} onValueChange={setSeReason}>
                      <SelectTrigger size="sm" className="w-full">
                        <SelectValue placeholder="Select a reason..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="player_request">Player request</SelectItem>
                        <SelectItem value="problem_gambling">Problem gambling behaviour</SelectItem>
                        <SelectItem value="regulatory">Regulatory requirement</SelectItem>
                        <SelectItem value="operator_decision">Operator decision</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Note */}
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium">Note <span className="text-muted-foreground font-normal">(optional)</span></p>
                    <textarea
                      value={seNote}
                      onChange={e => setSeNote(e.target.value)}
                      placeholder="Internal note for audit log..."
                      rows={3}
                      className="w-full resize-none rounded-xl border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>

                  {/* Warning */}
                  <div className="rounded-xl border border-destructive/30 bg-destructive-bg px-4 py-3 flex flex-col gap-1">
                    <p className="text-sm font-medium text-destructive">This action takes effect immediately</p>
                    <p className="text-xs text-destructive/80">
                      {seType === 'temporary'
                        ? 'The player will be locked and cannot log in until the exclusion period ends. The period cannot be shortened by the player.'
                        : 'The player will be permanently locked. This cannot be reversed by the player and requires compliance review to lift.'}
                    </p>
                  </div>

                </div>

                <div className="shrink-0 border-t border-border bg-muted p-4 flex gap-2">
                  <DrawerClose asChild>
                    <Button variant="outline" className="flex-1">Cancel</Button>
                  </DrawerClose>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    disabled={!seReason}
                    onClick={() => setSeDrawerOpen(false)}
                  >
                    <Ban className="size-4" />
                    Apply exclusion
                  </Button>
                </div>
              </DrawerContent>
            </Drawer>

            {/* Cooling-off drawer */}
            <Drawer open={coDrawerOpen} onOpenChange={setCoDrawerOpen} direction={isMobile ? 'bottom' : 'right'}>
              <DrawerContent className="sm:max-w-[400px] flex flex-col">
                <DrawerHeader className="border-b border-border flex flex-row items-center justify-between">
                  <div>
                    <DrawerTitle>Edit cooling-off</DrawerTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">For player: {playerName}</p>
                  </div>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon-sm"><X className="size-4" /></Button>
                  </DrawerClose>
                </DrawerHeader>

                <div className="flex flex-col gap-5 flex-1 overflow-y-auto px-4 py-5 min-h-0">

                  {/* Duration */}
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium">Duration</p>
                    <Card className="mx-auto w-fit">
                      <CardContent className="pt-5">
                        <Calendar
                          mode="range"
                          selected={{ from: coStartDate, to: coEndDate }}
                          onSelect={range => {
                            if (!range) { setCoStartDate(undefined); setCoEndDate(undefined); return }
                            if (coStartDate && coEndDate) {
                              setCoStartDate(range.from); setCoEndDate(undefined)
                            } else {
                              setCoStartDate(range.from); setCoEndDate(range.to)
                            }
                          }}
                          disabled={{ before: new Date() }}
                          fixedWeeks
                          className="p-0 [--cell-size:--spacing(9.5)]"
                        />
                      </CardContent>
                      <CardFooter className="flex flex-wrap gap-2 border-t bg-muted p-3">
                        {[
                          { label: '1 day', days: 1 },
                          { label: '1 week', days: 7 },
                          { label: '1 month', days: 30 },
                        ].map(({ label, days }) => {
                          const from = new Date(); from.setHours(0,0,0,0)
                          const to = addDays(from, days - 1)
                          const active = coStartDate?.toDateString() === from.toDateString() && coEndDate?.toDateString() === to.toDateString()
                          return (
                            <Button key={label} variant={active ? 'default' : 'outline'} size="sm" className="flex-1"
                              onClick={() => { setCoStartDate(from); setCoEndDate(to) }}>
                              {label}
                            </Button>
                          )
                        })}
                      </CardFooter>
                    </Card>
                  </div>

                  {/* Reason */}
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium">Reason</p>
                    <Select value={coReason} onValueChange={setCoReason}>
                      <SelectTrigger className="w-full text-sm">
                        <SelectValue placeholder="Select a reason..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="player_request" className="text-sm">Player request</SelectItem>
                        <SelectItem value="problem_gambling" className="text-sm">Problem gambling behaviour</SelectItem>
                        <SelectItem value="regulatory" className="text-sm">Regulatory requirement</SelectItem>
                        <SelectItem value="operator_decision" className="text-sm">Operator decision</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Note */}
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium">Note <span className="text-muted-foreground font-normal">(optional)</span></p>
                    <textarea
                      value={coNote}
                      onChange={e => setCoNote(e.target.value)}
                      placeholder="Internal note for audit log..."
                      rows={3}
                      className="w-full resize-none rounded-xl border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>

                  {/* Info */}
                  <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 flex flex-col gap-1">
                    <p className="text-sm font-medium">Cooling-off takes effect immediately</p>
                    <p className="text-xs text-muted-foreground">
                      The player will be temporarily restricted. The period cannot be shortened once applied.
                    </p>
                  </div>

                </div>

                <div className="shrink-0 border-t border-border bg-muted p-4 flex gap-2">
                  <DrawerClose asChild>
                    <Button variant="outline" className="flex-1">Cancel</Button>
                  </DrawerClose>
                  <Button
                    className="flex-1"
                    disabled={!coReason}
                    onClick={() => setCoDrawerOpen(false)}
                  >
                    <Timer className="size-4" />
                    Apply cooling-off
                  </Button>
                </div>
              </DrawerContent>
            </Drawer>

          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
