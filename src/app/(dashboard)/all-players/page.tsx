'use client'

import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
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
  Columns3,
  Download,
  Pin,
  PinOff,
  Search,
  SlidersHorizontal,
  Copy,
  Check,
  TrendingUp,
} from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, LabelList, Tooltip as RechartsTooltip,
  Pie, PieChart, Sector, Label,
} from 'recharts'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  AreaGradientDef,
  areaDefaults,
  type ChartConfig,
} from '@/components/ui/chart'
import { DateRangeFilter } from '@/components/ui/date-range-filter'
import type { DateRange } from 'react-day-picker'

// ─── Chart data ───────────────────────────────────────────────────────────────

const regData = {
  day: [
    { t: '00:00', count: 3 }, { t: '02:00', count: 1 }, { t: '04:00', count: 0 },
    { t: '06:00', count: 2 }, { t: '08:00', count: 8 }, { t: '10:00', count: 14 },
    { t: '12:00', count: 11 }, { t: '14:00', count: 16 }, { t: '16:00', count: 12 },
    { t: '18:00', count: 9 }, { t: '20:00', count: 7 }, { t: '22:00', count: 5 },
  ],
  week: [
    { t: 'Mon', count: 42 }, { t: 'Tue', count: 57 }, { t: 'Wed', count: 63 },
    { t: 'Thu', count: 48 }, { t: 'Fri', count: 71 }, { t: 'Sat', count: 35 }, { t: 'Sun', count: 28 },
  ],
  month: [
    { t: 'Jun 1', count: 22 }, { t: 'Jun 5', count: 31 }, { t: 'Jun 10', count: 45 },
    { t: 'Jun 15', count: 38 }, { t: 'Jun 20', count: 52 }, { t: 'Jun 25', count: 61 }, { t: 'Jun 28', count: 44 },
  ],
}

const regChartConfig = {
  count: { label: 'Registrations', color: 'var(--color-chart-1)' },
} satisfies ChartConfig

const statusEntries = [
  { key: 'active',    name: 'Active',    value: 13 },
  { key: 'suspended', name: 'Suspended', value: 2  },
  { key: 'inactive',  name: 'Inactive',  value: 1  },
  { key: 'blocked',   name: 'Blocked',   value: 1  },
]

const STATUS_COLORS: Record<string, string> = {
  active:    'hsl(213,94%,75%)',
  suspended: 'hsl(217,91%,60%)',
  inactive:  'hsl(224,76%,48%)',
  blocked:   'hsl(226,71%,35%)',
}

const statusData = statusEntries.map(d => ({ ...d, fill: STATUS_COLORS[d.key] }))

const statusChartConfig = {
  value:     { label: 'Players' },
  active:    { label: 'Active',    color: STATUS_COLORS.active },
  suspended: { label: 'Suspended', color: STATUS_COLORS.suspended },
  inactive:  { label: 'Inactive',  color: STATUS_COLORS.inactive },
  blocked:   { label: 'Blocked',   color: STATUS_COLORS.blocked },
} satisfies ChartConfig

const allCountriesRaw = [
  { country: 'United States', count: 324 },
  { country: 'United Kingdom', count: 87 },
  { country: 'Germany',       count: 64  },
  { country: 'France',        count: 51  },
  { country: 'Japan',         count: 38  },
  { country: 'Canada',        count: 29  },
  { country: 'Australia',     count: 22  },
  { country: 'Netherlands',   count: 18  },
  { country: 'Spain',         count: 15  },
  { country: 'Brazil',        count: 12  },
]
const countriesTotal = allCountriesRaw.reduce((s, d) => s + d.count, 0)
const top5 = allCountriesRaw.slice(0, 3).map(d => ({
  country: d.country,
  count: d.count,
  pct: Math.round(d.count / countriesTotal * 100),
  others: null as null | { country: string; count: number; pct: number }[],
}))
const othersRaw = allCountriesRaw.slice(3)
const othersCount = othersRaw.reduce((s, d) => s + d.count, 0)
const countriesData = [
  ...top5,
  {
    country: 'Other',
    count: othersCount,
    pct: Math.round(othersCount / countriesTotal * 100),
    others: othersRaw.map(d => ({ country: d.country, count: d.count, pct: Math.round(d.count / countriesTotal * 100) })),
  },
]

const countriesChartConfig = {
  count: { label: 'Players', color: 'var(--color-chart-1)' },
  label: { color: 'var(--background)' },
} satisfies ChartConfig

// ─── Chart sub-components ─────────────────────────────────────────────────────

function CountryTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  const full = payload?.value ?? ''
  const maxChars = 6
  const isTruncated = full.length > maxChars
  const truncated = isTruncated ? full.slice(0, maxChars) + '…' : full

  const textEl = (
    <text x={-58} y={0} dy={4} textAnchor="start" fontSize={12} fill="currentColor" className="fill-muted-foreground">
      {truncated}
    </text>
  )

  return (
    <g transform={`translate(${x},${y})`} overflow="visible">
      {isTruncated ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <g style={{ cursor: 'default' }}>{textEl}</g>
          </TooltipTrigger>
          <TooltipContent>{full}</TooltipContent>
        </Tooltip>
      ) : textEl}
    </g>
  )
}

function CountriesTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof countriesData[number] }> }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl min-w-[180px]">
      <div className="flex justify-between gap-4 font-semibold mb-1">
        <span>{d.country}</span>
        <span className="tabular-nums">{d.count.toLocaleString()}</span>
      </div>
      <span className="text-muted-foreground">{d.pct}% of total</span>
      {d.others && (
        <div className="mt-2 pt-2 border-t border-border flex flex-col gap-1">
          {d.others.map(o => (
            <div key={o.country} className="flex gap-4">
              <span className="text-muted-foreground flex-1">{o.country}</span>
              <span className="font-medium tabular-nums text-right w-6">{o.count}</span>
              <span className="text-muted-foreground tabular-nums text-right w-6">{o.pct}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

type RegPeriod = 'day' | 'week' | 'month' | 'custom'

function PlayerCharts() {
  const [period, setPeriod] = useState<RegPeriod>('month')

  const chartData = period === 'custom' ? regData.month : regData[period]
  const totalPlayers = statusEntries.reduce((s, d) => s + d.value, 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] gap-4">

      {/* Left: Registrations */}
      <Card className="pt-0 min-w-0 md:col-span-2 lg:col-span-1">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-4 sm:flex-row">
          <p className="flex-1 text-sm text-muted-foreground">New player registrations</p>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={regChartConfig} className="h-[200px] w-full">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <AreaGradientDef id="fillReg" colorVar="var(--color-count)" />
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="t" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} domain={[0, 80]} ticks={[0, 20, 40, 60, 80]} />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel={false}
                    indicator="dot"
                    formatter={(value) => (
                      <>
                        <div className="size-2.5 shrink-0 rounded-[2px]" style={{ background: 'var(--color-count)' }} />
                        <div className="flex flex-1 justify-between items-center leading-none gap-2">
                          <span className="text-muted-foreground">Registrations</span>
                          <span className="font-mono font-medium tabular-nums text-foreground">{Number(value)}</span>
                        </div>
                      </>
                    )}
                  />
                }
              />
              <Area
                {...areaDefaults}
                dataKey="count"
                stroke="var(--color-count)"
                fill="url(#fillReg)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Status donut */}
        <Card className="flex flex-col min-w-0">
          <CardHeader className="flex items-center gap-2 space-y-0 border-b py-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">Player status distribution</p>
          </CardHeader>
          <CardContent className="px-0 pb-0 pt-4 sm:pt-4 flex-1 flex items-start justify-center">
            <div className="w-full aspect-square max-w-[170px]">
            <ChartContainer config={statusChartConfig} className="w-full h-full">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={47}
                  strokeWidth={4}
                  activeIndex={0}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  activeShape={(props: any) => <Sector {...props} outerRadius={(props.outerRadius ?? 0) + 8} />}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                            <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) - 7} className="fill-foreground text-base font-bold">{totalPlayers}</tspan>
                            <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 9} className="fill-muted-foreground" fontSize={10}>Players</tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-1 text-sm px-5 pt-0 pb-5 text-center">
            <div className="flex items-center gap-1.5 font-medium leading-none">
              Active players +5% this month <TrendingUp className="size-4" />
            </div>
            <div className="text-xs text-muted-foreground">
              Showing player status distribution
            </div>
          </CardFooter>
        </Card>

        {/* Countries bar */}
        <Card className="min-w-0 flex flex-col">
          <CardHeader className="flex items-center gap-2 space-y-0 border-b py-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">Players by country</p>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-4 sm:pt-4 flex-1">
            <ChartContainer config={countriesChartConfig} className="h-[150px] w-full">
              <BarChart
                data={countriesData}
                layout="vertical"
                margin={{ top: 0, right: 40, left: 12, bottom: 0 }}
                barSize={24}
              >
                <YAxis
                  dataKey="country"
                  type="category"
                  tickLine={false}
                  tickMargin={8}
                  axisLine={false}
                  width={60}
                  tick={<CountryTick />}
                />
                <XAxis dataKey="count" type="number" hide />
                <RechartsTooltip
                  cursor={false}
                  content={<CountriesTooltip />}
                />
                <Bar dataKey="count" fill="var(--color-count)" radius={4}>
                  <LabelList
                    dataKey="count"
                    position="right"
                    offset={8}
                    className="fill-foreground"
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-1 text-sm px-5 pt-4 pb-5 text-center">
            <div className="flex items-center gap-1.5 font-medium leading-none">
              US leads with 53% of all players <TrendingUp className="size-4" />
            </div>
            <div className="text-xs text-muted-foreground">
              Showing top 3 countries by player count
            </div>
          </CardFooter>
        </Card>

    </div>
  )
}

// ─── Player types & data ──────────────────────────────────────────────────────

type Player = {
  id: string
  name: string
  email: string
  phone: string
  country: string
  locale: string
  status: 'Active' | 'Inactive' | 'Suspended' | 'Blocked'
  balanceEur: string | null
  balanceNative: string | null
  currency: string
  currencies: string
}

const MOCK_PLAYERS: Player[] = [
  { id: '2883575941', name: 'Tony Stark',       email: 'tony.stark@starkindustries.com', phone: '+1 310 555 0101', country: 'US',      locale: 'en-US', status: 'Active',    balanceEur: '€0.00',      balanceNative: '0.00 AUD',      currency: 'AUD', currencies: 'AUD, EUR' },
  { id: '4515450354', name: 'John Wick',        email: 'j.wick@continental.com',        phone: 'N/A',             country: 'US',      locale: 'en-US', status: 'Active',    balanceEur: null,          balanceNative: null,            currency: 'AUD', currencies: 'AUD' },
  { id: '4712202994', name: 'Walter White',     email: 'walter.white@gmail.com',        phone: '+1 505 555 0134', country: 'US',      locale: 'en-US', status: 'Active',    balanceEur: null,          balanceNative: null,            currency: 'EUR', currencies: 'EUR' },
  { id: '2940440381', name: 'Ellen Ripley',     email: 'e.ripley@weyland-yutani.com',   phone: '+1 323 555 0177', country: 'US',      locale: 'en-US', status: 'Active',    balanceEur: null,          balanceNative: null,            currency: 'AUD', currencies: 'AUD, EUR' },
  { id: '2598013005', name: 'Holly Golightly',  email: 'holly.golightly@outlook.com',   phone: 'N/A',             country: 'US',      locale: 'en-US', status: 'Active',    balanceEur: null,          balanceNative: null,            currency: 'EUR', currencies: 'EUR' },
  { id: '1018817027', name: 'Tyler Durden',     email: 't.durden@paperstreet.com',      phone: '+1 313 555 0199', country: 'US',      locale: 'en-US', status: 'Active',    balanceEur: null,          balanceNative: null,            currency: 'AUD', currencies: 'AUD' },
  { id: '8167315858', name: 'Patrick Bateman',  email: 'p.bateman@piercepierce.com',    phone: 'N/A',             country: 'US',      locale: 'en-US', status: 'Suspended', balanceEur: null,          balanceNative: null,            currency: 'EUR', currencies: 'EUR' },
  { id: '3392817465', name: 'Don Corleone',     email: 'don.corleone@proton.me',        phone: '+1 212 555 0192', country: 'US',      locale: 'en-US', status: 'Active',    balanceEur: '€140.35',    balanceNative: '240.00 AUD',    currency: 'AUD', currencies: 'AUD, EUR' },
  { id: '7741209863', name: 'Lara Croft',       email: 'lara.croft@croft-manor.co.uk',  phone: '+44 20 7946 0147',country: 'UK',      locale: 'en-GB', status: 'Inactive',  balanceEur: null,          balanceNative: null,            currency: 'GBP', currencies: 'GBP' },
  { id: '5520334871', name: 'Jack Torrance',    email: 'jack.torrance@overlook.com',    phone: 'N/A',             country: 'US',      locale: 'en-US', status: 'Active',    balanceEur: '€50.00',     balanceNative: '85.50 AUD',     currency: 'AUD', currencies: 'AUD' },
  { id: '9903847102', name: 'Hannibal Lecter',  email: 'h.lecter@proton.me',            phone: '+49 30 9876543',  country: 'Germany', locale: 'de-DE', status: 'Active',    balanceEur: '€1,200.00',  balanceNative: null,            currency: 'EUR', currencies: 'EUR' },
  { id: '1147382956', name: 'Jules Winnfield',  email: 'jules.winnfield@gmail.com',     phone: '+1 213 555 0011', country: 'US',      locale: 'en-US', status: 'Suspended', balanceEur: null,          balanceNative: null,            currency: 'AUD', currencies: 'AUD' },
  { id: '6628401739', name: 'Clarice Starling', email: 'c.starling@fbi.gov',            phone: '+1 202 555 0133', country: 'US',      locale: 'en-US', status: 'Active',    balanceEur: '€320.75',    balanceNative: '548.48 AUD',    currency: 'AUD', currencies: 'AUD' },
  { id: '4480129357', name: 'Travis Bickle',    email: 'travis.bickle@yahoo.com',       phone: '+1 212 555 0178', country: 'US',      locale: 'en-US', status: 'Active',    balanceEur: '€29.24',     balanceNative: '50.00 AUD',     currency: 'AUD', currencies: 'AUD' },
  { id: '2271893640', name: 'Marge Gunderson',  email: 'm.gunderson@brainerd-pd.gov',   phone: 'N/A',             country: 'US',      locale: 'en-US', status: 'Blocked',   balanceEur: null,          balanceNative: null,            currency: 'EUR', currencies: 'EUR' },
  { id: '8834567012', name: 'Vincent Vega',     email: 'vincent.vega@gmail.com',        phone: '+33 1 5555 5678', country: 'France',  locale: 'fr-FR', status: 'Active',    balanceEur: '€760.20',    balanceNative: '1,300.94 AUD',  currency: 'AUD', currencies: 'AUD, EUR' },
  { id: '3315892074', name: 'Beatrix Kiddo',    email: 'b.kiddo@divasofviolence.com',   phone: '+81 3 5555 4567', country: 'Japan',   locale: 'ja-JP', status: 'Active',    balanceEur: '€130.00',    balanceNative: '21,541.00 JPY', currency: 'JPY', currencies: 'JPY' },
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
          <span className="hidden sm:inline">Filters</span>
          {isDirty && (
            <span className="ml-0.5 flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background">
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

const ALL_COLS = [
  { key: 'fullName',   label: 'Full name' },
  { key: 'email',      label: 'Email' },
  { key: 'phone',      label: 'Phone number' },
  { key: 'country',    label: 'Country' },
  { key: 'locale',     label: 'Locale' },
  { key: 'status',     label: 'Status' },
  { key: 'balance',    label: 'Balance' },
  { key: 'currencies', label: 'Currency' },
] as const
type ColKey = typeof ALL_COLS[number]['key']

export default function AllPlayersPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [pageSize, setPageSize] = useState(20)
  const [currentPage, setCurrentPage] = useState(1)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [playerIdFrozen, setPlayerIdFrozen] = useState(true)
  const [colOpen, setColOpen] = useState(false)
  const [visibleCols, setVisibleCols] = useState<Set<ColKey>>(
    new Set<ColKey>(['fullName', 'email', 'phone', 'country', 'locale', 'status', 'balance', 'currencies'])
  )

  const [scrollNode, setScrollNode] = useState<HTMLDivElement | null>(null)
  const [hasOverflow, setHasOverflow] = useState(false)
  const scrollRef = useCallback((node: HTMLDivElement | null) => setScrollNode(node), [])
  useLayoutEffect(() => {
    if (!scrollNode) return
    const check = () => setHasOverflow(scrollNode.scrollWidth > scrollNode.clientWidth)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(scrollNode)
    window.addEventListener('resize', check)
    return () => { ro.disconnect(); window.removeEventListener('resize', check) }
  }, [scrollNode])

  function toggleCol(key: ColKey) {
    setVisibleCols(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function copyPlayerId(id: string) {
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

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
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 h-8 w-48 text-sm"
              />
            </div>
            <FiltersPopover />
          </div>
          <div className="flex items-center gap-2">
            <Popover open={colOpen} onOpenChange={setColOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Columns3 className="size-3.5" />
                  <span className="hidden sm:inline">Columns</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" sideOffset={6} className="w-48 p-1">
                <button
                  type="button"
                  onClick={() => setPlayerIdFrozen(v => !v)}
                  className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
                >
                  {playerIdFrozen
                    ? <PinOff className="size-3.5 shrink-0" />
                    : <Pin className="size-3.5 shrink-0" />}
                  Player ID
                </button>
                {ALL_COLS.map(col => (
                  <button
                    key={col.key}
                    type="button"
                    onClick={() => toggleCol(col.key)}
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
                  >
                    <Check className={`size-3.5 shrink-0 ${visibleCols.has(col.key) ? 'opacity-100' : 'opacity-0'}`} />
                    {col.label}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
            <DateRangeFilter value={dateRange} onChange={setDateRange} mobileLabel="none" />
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="size-3.5" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* Charts */}
        <PlayerCharts />

        {/* Table card */}
        <div className="relative rounded-2xl border border-border bg-card overflow-hidden">
          {hasOverflow && <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-card to-transparent z-10" />}

          <div className="overflow-x-auto" ref={scrollRef}>
            <Table className="min-w-max">
              <TableHeader className="bg-muted/60">
                <TableRow className="hover:bg-transparent border-b border-border">
                  <TableHead className="w-10 pl-4 sticky left-0 z-20 bg-muted">
                    <Checkbox
                      checked={allOnPageSelected ? true : someOnPageSelected ? 'indeterminate' : false}
                      onCheckedChange={toggleAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <SortableHead className={playerIdFrozen ? "sticky left-10 z-20 bg-muted after:absolute after:right-0 after:top-0 after:bottom-0 after:w-px after:bg-border after:content-['']" : undefined}>Player ID</SortableHead>
                  {visibleCols.has('fullName') && <SortableHead>Full name</SortableHead>}
                  {visibleCols.has('email') && <SortableHead>Email</SortableHead>}
                  {visibleCols.has('phone') && <TableHead className="text-sm font-medium text-foreground">Phone number</TableHead>}
                  {visibleCols.has('country') && <SortableHead>Country</SortableHead>}
                  {visibleCols.has('locale') && <SortableHead>Locale</SortableHead>}
                  {visibleCols.has('status') && <SortableHead>Status</SortableHead>}
                  {visibleCols.has('balance') && <TableHead className="text-sm font-medium text-foreground">Balance</TableHead>}
                  {visibleCols.has('currencies') && <TableHead className="text-sm font-medium text-foreground">Currency</TableHead>}
                </TableRow>
              </TableHeader>

              <TableBody>
                {pageRows.map(player => (
                  <TableRow
                    key={player.id}
                    data-state={selectedRows.has(player.id) ? 'selected' : undefined}
                    className=""
                  >
                    <TableCell className="pl-4 sticky left-0 z-10 bg-background">
                      <Checkbox
                        checked={selectedRows.has(player.id)}
                        onCheckedChange={() => toggleRow(player.id)}
                        aria-label={`Select ${player.name}`}
                      />
                    </TableCell>
                    <TableCell className={playerIdFrozen ? "sticky left-10 z-10 bg-background after:absolute after:right-0 after:top-0 after:bottom-0 after:w-px after:bg-border after:content-['']" : undefined}>
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/player/${player.id}`}
                          className="text-sm font-medium underline underline-offset-2 text-foreground hover:text-muted-foreground transition-colors"
                        >
                          {player.id}
                        </Link>
                        <button
                          onClick={() => copyPlayerId(player.id)}
                          className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                          aria-label="Copy ID"
                        >
                          {copiedId === player.id
                            ? <Check className="size-3.5 text-muted-foreground" />
                            : <Copy className="size-3.5" />}
                        </button>
                      </div>
                    </TableCell>
                    {visibleCols.has('fullName') && <TableCell className="text-sm"><TruncCell text={player.name} /></TableCell>}
                    {visibleCols.has('email') && <TableCell className="text-sm text-muted-foreground"><TruncCell text={player.email} className="text-muted-foreground" /></TableCell>}
                    {visibleCols.has('phone') && <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{player.phone}</TableCell>}
                    {visibleCols.has('country') && <TableCell className="text-sm whitespace-nowrap">{player.country}</TableCell>}
                    {visibleCols.has('locale') && <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{player.locale}</TableCell>}
                    {visibleCols.has('status') && <TableCell><StatusBadge status={player.status} /></TableCell>}
                    {visibleCols.has('balance') && (
                      <TableCell className="whitespace-nowrap">
                        {player.balanceEur ? (
                          <>
                            <span className="text-sm font-medium tabular-nums block">{player.balanceEur}</span>
                            {player.balanceNative && (
                              <span className="text-xs text-muted-foreground tabular-nums">{player.balanceNative}</span>
                            )}
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground">--</span>
                        )}
                      </TableCell>
                    )}
                    {visibleCols.has('currencies') && <TableCell className="text-sm text-muted-foreground">{player.currency}</TableCell>}
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

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
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

            <div className="flex items-center gap-2">
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
      </div>
    </>
  )
}
