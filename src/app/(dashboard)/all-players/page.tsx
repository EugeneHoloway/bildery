'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { DashboardHeader } from '@/components/DashboardHeader'
import Link from 'next/link'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowUpDown,
  CircleCheck,
  CircleMinus,
  CircleX,
  ShieldBan,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Download,
  MoreHorizontal,
  SlidersHorizontal,
} from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'

type Player = {
  id: string
  name: string
  email: string
  phone: string
  country: string
  locale: string
  status: 'Active' | 'Inactive' | 'Suspended' | 'Blocked'
  balance: string
  currencies: string
}

const MOCK_PLAYERS: Player[] = [
  { id: '2883575941', name: 'Eugene Holoway',  email: 'eugene.holoway@gmail.com',  phone: 'N/A', country: 'Germany', locale: 'EN',    status: 'Active', balance: 'N/A', currencies: 'USD, EUR, UAH' },
  { id: '4515450354', name: 'Dmytro Bevz',     email: 'test@test.com',             phone: 'N/A', country: 'US',      locale: 'en',    status: 'Active', balance: 'N/A', currencies: 'USD' },
  { id: '4712202994', name: 'Test Test1',      email: 'dimabevz652@gmail.com',     phone: 'N/A', country: 'Ukraine', locale: 'en-US', status: 'Active', balance: 'N/A', currencies: 'USD' },
  { id: '2940440381', name: 'Test Test',       email: 'dimabevz25@gmail.com',      phone: 'N/A', country: 'Ukraine', locale: 'en-US', status: 'Active', balance: 'N/A', currencies: 'USD' },
  { id: '2598013005', name: 'Test Dima',       email: 'dimabevz62@gmail.com',      phone: 'N/A', country: 'Ukraine', locale: 'en-US', status: 'Active', balance: 'N/A', currencies: 'USD' },
  { id: '1018817027', name: 'Dmytro Bevz',     email: 'dimabevz63@gmail.com',      phone: 'N/A', country: 'Ukraine', locale: 'en-US', status: 'Active', balance: 'N/A', currencies: 'USD' },
  { id: '8167315858', name: 'Dmytro Bevz',     email: 'dimabevz65@gmail.com',      phone: 'N/A',          country: 'Ukraine',     locale: 'en-US', status: 'Active',    balance: 'N/A',      currencies: 'USD' },
  { id: '3392817465', name: 'Ariana Kowalski', email: 'a.kowalski@proton.me',      phone: '+48 600 123 456', country: 'Poland',    locale: 'pl-PL', status: 'Active',    balance: '$240.00',  currencies: 'USD, EUR' },
  { id: '7741209863', name: 'Marco Ferretti',  email: 'marco.ferretti@gmail.com',  phone: '+39 02 1234567',  country: 'Italy',     locale: 'it-IT', status: 'Inactive',  balance: 'N/A',      currencies: 'EUR' },
  { id: '5520334871', name: 'Sofia Andersen',  email: 's.andersen@outlook.com',    phone: 'N/A',            country: 'Denmark',   locale: 'da-DK', status: 'Active',    balance: '$85.50',   currencies: 'EUR, DKK' },
  { id: '9903847102', name: 'Luca Müller',     email: 'luca.mueller@web.de',       phone: '+49 30 9876543',  country: 'Germany',   locale: 'de-DE', status: 'Active',    balance: '$1,200.00',currencies: 'EUR' },
  { id: '1147382956', name: 'Oksana Petrenko', email: 'oksana.p@ukr.net',          phone: '+380 67 555 0011',country: 'Ukraine',   locale: 'uk-UA', status: 'Suspended', balance: 'N/A',      currencies: 'UAH' },
  { id: '6628401739', name: 'James Okafor',    email: 'j.okafor@gmail.com',        phone: '+1 212 555 0133', country: 'US',        locale: 'en-US', status: 'Active',    balance: '$320.75',  currencies: 'USD' },
  { id: '4480129357', name: 'Yuki Tanaka',     email: 'yuki.tanaka@yahoo.co.jp',   phone: '+81 3 1234 5678', country: 'Japan',     locale: 'ja-JP', status: 'Active',    balance: '$50.00',   currencies: 'USD, JPY' },
  { id: '2271893640', name: 'Fatima Al-Rashid',email: 'fatima.r@hotmail.com',      phone: 'N/A',            country: 'UAE',       locale: 'ar-AE', status: 'Blocked',   balance: 'N/A',      currencies: 'USD, AED' },
  { id: '8834567012', name: 'Carlos Vega',     email: 'carlos.vega@gmail.com',     phone: '+52 55 1234 5678',country: 'Mexico',    locale: 'es-MX', status: 'Active',    balance: '$760.20',  currencies: 'USD, MXN' },
  { id: '3315892074', name: 'Emma Johansson',  email: 'emma.j@live.se',            phone: '+46 8 123 456',   country: 'Sweden',    locale: 'sv-SE', status: 'Active',    balance: '$130.00',  currencies: 'EUR, SEK' },
]

function TruncCell({ text, className, maxW = 'max-w-[160px]' }: { text: string; className?: string; maxW?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`block truncate ${maxW} ${className ?? ''}`}>{text}</span>
      </TooltipTrigger>
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  )
}

const STATUSES = ['Active', 'Inactive', 'Suspended', 'Blocked'] as const
const SEGMENTS = ['Switzerland', 'VIP', 'Active', 'Special offer', 'UAE', 'Austria', 'New Zealand']
const CURRENCIES = ['USD', 'EUR', 'UAH', 'GBP', 'DKK', 'JPY', 'AED', 'MXN', 'SEK']
const COUNTRIES = ['Any', 'Germany', 'US', 'Ukraine', 'Poland', 'Italy', 'Denmark', 'Japan', 'UAE', 'Mexico', 'Sweden']
const NAME_OPS = ['Starts with', 'Contains', 'Equals']

type FilterState = {
  email: string
  phone: string
  firstNameOp: string
  firstName: string
  lastNameOp: string
  lastName: string
  country: string
  statuses: Set<string>
  segments: Set<string>
  currencies: Set<string>
  signUp: string
  lockedAt: string
}

function emptyFilters(): FilterState {
  return {
    email: '', phone: '',
    firstNameOp: 'Starts with', firstName: '',
    lastNameOp: 'Starts with', lastName: '',
    country: 'Any',
    statuses: new Set(),
    segments: new Set(),
    currencies: new Set(),
    signUp: '',
    lockedAt: '',
  }
}

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

function FiltersPopover() {
  const [filters, setFilters] = useState<FilterState>(emptyFilters)

  function toggleSet(key: 'statuses' | 'segments' | 'currencies', val: string) {
    setFilters(prev => {
      const next = new Set(prev[key])
      if (next.has(val)) next.delete(val)
      else next.add(val)
      return { ...prev, [key]: next }
    })
  }

  const isDirty =
    filters.email || filters.phone || filters.firstName || filters.lastName ||
    filters.country !== 'Any' || filters.statuses.size > 0 || filters.segments.size > 0 || filters.currencies.size > 0 ||
    filters.signUp || filters.lockedAt

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="size-3.5" />
          Filters
          {isDirty && (
            <span className="ml-0.5 flex size-4 items-center justify-center rounded-full bg-brand text-[10px] font-semibold text-white">
              {[filters.email, filters.phone, filters.firstName, filters.lastName]
                .filter(Boolean).length +
                (filters.country !== 'Any' ? 1 : 0) +
                (filters.statuses.size > 0 ? 1 : 0) +
                (filters.currencies.size > 0 ? 1 : 0)}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" sideOffset={6} className="w-[340px] p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-semibold">Filters</span>
          <button
            type="button"
            onClick={() => setFilters(emptyFilters())}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex flex-col gap-4 px-4 py-4 max-h-[440px] overflow-y-auto">

          {/* Email */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Email contains</span>
            <Input
              placeholder="Placeholder"
              value={filters.email}
              onChange={e => setFilters(f => ({ ...f, email: e.target.value }))}
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Phone</span>
            <Input
              placeholder="Placeholder"
              value={filters.phone}
              onChange={e => setFilters(f => ({ ...f, phone: e.target.value }))}
            />
          </div>

          {/* First name */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">First name</span>
            <div className="flex gap-2">
              <Select value={filters.firstNameOp} onValueChange={v => setFilters(f => ({ ...f, firstNameOp: v }))}>
                <SelectTrigger size="default" className="w-[130px] shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NAME_OPS.map(op => <SelectItem key={op} value={op}>{op}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input
                placeholder="John"
                value={filters.firstName}
                onChange={e => setFilters(f => ({ ...f, firstName: e.target.value }))}
              />
            </div>
          </div>

          {/* Last name */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Last name</span>
            <div className="flex gap-2">
              <Select value={filters.lastNameOp} onValueChange={v => setFilters(f => ({ ...f, lastNameOp: v }))}>
                <SelectTrigger size="default" className="w-[130px] shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NAME_OPS.map(op => <SelectItem key={op} value={op}>{op}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input
                placeholder="Placeholder"
                value={filters.lastName}
                onChange={e => setFilters(f => ({ ...f, lastName: e.target.value }))}
              />
            </div>
          </div>

          {/* Country */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Country</span>
            <Select value={filters.country} onValueChange={v => setFilters(f => ({ ...f, country: v }))}>
              <SelectTrigger size="default">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Status</span>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map(s => (
                <PillToggle
                  key={s}
                  label={s}
                  selected={filters.statuses.has(s)}
                  onToggle={() => toggleSet('statuses', s)}
                />
              ))}
            </div>
          </div>

          {/* Segments */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Segments</span>
            <div className="flex flex-wrap gap-2">
              {SEGMENTS.map(s => (
                <PillToggle
                  key={s}
                  label={s}
                  selected={filters.segments.has(s)}
                  onToggle={() => toggleSet('segments', s)}
                />
              ))}
            </div>
          </div>

          {/* Currency */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Currency</span>
            <div className="flex flex-wrap gap-2">
              {CURRENCIES.map(c => (
                <PillToggle
                  key={c}
                  label={c}
                  selected={filters.currencies.has(c)}
                  onToggle={() => toggleSet('currencies', c)}
                />
              ))}
            </div>
          </div>

          {/* Sign up */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Sign up</span>
            <Input
              type="date"
              value={filters.signUp}
              onChange={e => setFilters(f => ({ ...f, signUp: e.target.value }))}
              className="text-muted-foreground"
            />
          </div>

          {/* Locked at */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Locked at</span>
            <Input
              type="date"
              value={filters.lockedAt}
              onChange={e => setFilters(f => ({ ...f, lockedAt: e.target.value }))}
              className="text-muted-foreground"
            />
          </div>
        </div>

        {/* Sticky footer */}
        <div className="border-t border-border px-4 py-3">
          <Button className="w-full">Apply</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function SortableHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <TableHead className={className}>
      <button className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-foreground/70 transition-colors">
        {children}
        <ArrowUpDown className="size-3.5 text-muted-foreground shrink-0" />
      </button>
    </TableHead>
  )
}

function StatusBadge({ status }: { status: Player['status'] }) {
  const base = 'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium'
  if (status === 'Active') return (
    <span className={`${base} bg-success-bg text-success`}>
      <CircleCheck className="size-3 shrink-0" />
      Active
    </span>
  )
  if (status === 'Inactive') return (
    <span className={`${base} bg-muted text-muted-foreground`}>
      <CircleMinus className="size-3 shrink-0" />
      Inactive
    </span>
  )
  if (status === 'Suspended') return (
    <span className={`${base} bg-destructive-bg text-destructive`}>
      <CircleX className="size-3 shrink-0" />
      Suspended
    </span>
  )
  return (
    <span className={`${base} bg-warning-bg text-warning`}>
      <ShieldBan className="size-3 shrink-0" />
      Blocked
    </span>
  )
}

const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100']

export default function AllPlayersPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [pageSize, setPageSize] = useState(20)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (!loading && !user) router.replace('/')
  }, [user, loading, router])

  if (loading || !user) return null

  const totalRows = MOCK_PLAYERS.length
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize))
  const pageStart = (currentPage - 1) * pageSize
  const pageRows = MOCK_PLAYERS.slice(pageStart, pageStart + pageSize)

  const allOnPageSelected = pageRows.length > 0 && pageRows.every(p => selectedRows.has(p.id))
  const someOnPageSelected = pageRows.some(p => selectedRows.has(p.id)) && !allOnPageSelected

  function toggleAll() {
    if (allOnPageSelected) {
      setSelectedRows(prev => {
        const next = new Set(prev)
        pageRows.forEach(p => next.delete(p.id))
        return next
      })
    } else {
      setSelectedRows(prev => {
        const next = new Set(prev)
        pageRows.forEach(p => next.add(p.id))
        return next
      })
    }
  }

  function toggleRow(id: string) {
    setSelectedRows(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handlePageSizeChange(val: string) {
    setPageSize(Number(val))
    setCurrentPage(1)
  }

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: 'Bildery', href: '/dashboard' },
          { label: 'PAM', href: '/all-players' },
          { label: 'All Players' },
        ]}
      />

      <div className="flex flex-1 flex-col gap-3 px-6 pt-4 pb-8">
        <div>
          <h1 className="text-2xl font-semibold">All Players</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Player Account Manager -- manage and view all player accounts.
          </p>
        </div>

        {/* Toolbar — outside the table card */}
        <div className="flex items-center justify-between">
          <FiltersPopover />
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="size-3.5" />
            Export
          </Button>
        </div>

        {/* Table card */}
        <div className="rounded-2xl border border-border bg-background overflow-hidden">

          {/* Scrollable table wrapper for mobile */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/60">
                <TableRow className="hover:bg-transparent border-b border-border">
                  <TableHead className="w-10 pl-4">
                    <Checkbox
                      checked={allOnPageSelected ? true : someOnPageSelected ? 'indeterminate' : false}
                      onCheckedChange={toggleAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <SortableHead>Player ID</SortableHead>
                  <SortableHead>Full name</SortableHead>
                  <SortableHead>Email</SortableHead>
                  <TableHead className="text-sm font-medium text-foreground">Phone number</TableHead>
                  <SortableHead>Country</SortableHead>
                  <SortableHead>Locale</SortableHead>
                  <SortableHead>Status</SortableHead>
                  <TableHead className="text-sm font-medium text-foreground">Balance</TableHead>
                  <TableHead className="text-sm font-medium text-foreground">Currencies</TableHead>
                  <TableHead className="w-10 pr-4" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {pageRows.map(player => (
                  <TableRow
                    key={player.id}
                    data-state={selectedRows.has(player.id) ? 'selected' : undefined}
                    className=""
                  >
                    <TableCell className="pl-4">
                      <Checkbox
                        checked={selectedRows.has(player.id)}
                        onCheckedChange={() => toggleRow(player.id)}
                        aria-label={`Select ${player.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/player/${player.id}`}
                        className="text-sm font-medium underline underline-offset-2 text-foreground hover:text-muted-foreground transition-colors"
                      >
                        {player.id}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm max-w-[140px]">
                      <TruncCell text={player.name} maxW="max-w-full" />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[180px]">
                      <TruncCell text={player.email} maxW="max-w-full" className="text-muted-foreground" />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{player.phone}</TableCell>
                    <TableCell className="text-sm">{player.country}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{player.locale}</TableCell>
                    <TableCell>
                      <StatusBadge status={player.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{player.balance}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[120px]">
                      <TruncCell text={player.currencies} maxW="max-w-full" className="text-muted-foreground" />
                    </TableCell>
                    <TableCell className="pr-4">
                      <Button variant="ghost" size="icon-sm" aria-label="Actions">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

        </div>

        {/* Pagination — outside the table card */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            {selectedRows.size} of {totalRows} row(s) selected.
          </span>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="whitespace-nowrap font-medium text-foreground">Rows per page</span>
              <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                <SelectTrigger size="sm" className="w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <span className="whitespace-nowrap text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                aria-label="First page"
              >
                <ChevronsLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                <ChevronRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                aria-label="Last page"
              >
                <ChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
