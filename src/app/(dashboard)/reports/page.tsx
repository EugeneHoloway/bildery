'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { DashboardHeader } from '@/components/DashboardHeader'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Download, CalendarIcon, TrendingUp, TrendingDown, Info, ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { type DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
  AreaGradientDef,
  areaDefaults,
} from '@/components/ui/chart'

// ── helpers ────────────────────────────────────────────────────────────────

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-2 py-0.5 text-xs font-medium text-success">
      <span className="size-1.5 rounded-full bg-success" />
      Live
    </span>
  )
}

// ── Date Range Picker ──────────────────────────────────────────────────────

const PRESETS = [
  { label: 'Today', days: 0 },
  { label: 'Yesterday', days: 1 },
  { label: 'This Week', days: 7 },
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 28 Days', days: 28 },
  { label: 'This Month', days: 30 },
  { label: 'Last Month', days: 60 },
  { label: 'This Year', days: 365 },
]

function formatDate(d: Date) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function DateRangePicker({ compact = false }: { compact?: boolean }) {
  const today = new Date()
  const defaultFrom = new Date(today)
  defaultFrom.setDate(today.getDate() - 27)

  const [range, setRange] = useState<DateRange>({ from: defaultFrom, to: today })
  const [activePreset, setActivePreset] = useState('Last 28 Days')
  const [open, setOpen] = useState(false)

  function applyPreset(label: string, days: number) {
    const to = new Date()
    const from = new Date()
    from.setDate(to.getDate() - (days === 0 ? 0 : days - 1))
    setRange({ from, to })
    setActivePreset(label)
  }

  const fullLabel = range?.from && range?.to
    ? `${formatDate(range.from)} – ${formatDate(range.to)}`
    : 'Select range'

  const shortLabel = activePreset

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2 text-sm font-normal">
          <CalendarIcon className="size-4 text-muted-foreground shrink-0" />
          <span className={compact ? 'sm:hidden' : 'hidden'}>{shortLabel}</span>
          <span className={compact ? 'hidden sm:inline' : 'inline'}>{fullLabel}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex flex-col sm:flex-row">
          {/* Presets */}
          <div className="flex flex-row flex-wrap gap-0.5 border-b sm:border-b-0 sm:border-r border-border p-2 sm:p-3 sm:w-40 sm:flex-col">
            {PRESETS.map(({ label, days }) => (
              <button
                key={label}
                onClick={() => applyPreset(label, days)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-left text-sm transition-colors hover:bg-muted',
                  activePreset === label ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground'
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {/* Calendar */}
          <Calendar
            mode="range"
            selected={range}
            onSelect={(r) => { if (r) setRange(r) }}
            defaultMonth={range?.from}
            numberOfMonths={1}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ── Tickets Area Chart ────────────────────────────────────────────────────────

const TICKET_CHART_DATA = [
  { date: '2026-05-26', incoming: 34, resolved: 28 },
  { date: '2026-05-27', incoming: 41, resolved: 35 },
  { date: '2026-05-28', incoming: 29, resolved: 22 },
  { date: '2026-05-29', incoming: 18, resolved: 14 },
  { date: '2026-05-30', incoming: 22, resolved: 17 },
  { date: '2026-05-31', incoming: 37, resolved: 30 },
  { date: '2026-06-01', incoming: 45, resolved: 38 },
  { date: '2026-06-02', incoming: 52, resolved: 43 },
  { date: '2026-06-03', incoming: 48, resolved: 39 },
  { date: '2026-06-04', incoming: 31, resolved: 25 },
  { date: '2026-06-05', incoming: 27, resolved: 20 },
  { date: '2026-06-06', incoming: 44, resolved: 36 },
  { date: '2026-06-07', incoming: 58, resolved: 47 },
  { date: '2026-06-08', incoming: 63, resolved: 51 },
  { date: '2026-06-09', incoming: 55, resolved: 44 },
  { date: '2026-06-10', incoming: 39, resolved: 31 },
  { date: '2026-06-11', incoming: 24, resolved: 19 },
  { date: '2026-06-12', incoming: 47, resolved: 38 },
  { date: '2026-06-13', incoming: 60, resolved: 48 },
  { date: '2026-06-14', incoming: 53, resolved: 42 },
  { date: '2026-06-15', incoming: 46, resolved: 37 },
  { date: '2026-06-16', incoming: 68, resolved: 54 },
  { date: '2026-06-17', incoming: 72, resolved: 58 },
  { date: '2026-06-18', incoming: 35, resolved: 28 },
  { date: '2026-06-19', incoming: 41, resolved: 33 },
  { date: '2026-06-20', incoming: 57, resolved: 45 },
  { date: '2026-06-21', incoming: 64, resolved: 51 },
  { date: '2026-06-22', incoming: 49, resolved: 40 },
]

const ticketChartConfig = {
  incoming: { label: 'New conversations', color: 'var(--color-chart-1)' },
  resolved: { label: 'Closed conversations', color: 'var(--color-chart-2)' },
} satisfies ChartConfig

function TicketsAreaChart() {
  return (
    <ChartContainer config={ticketChartConfig} className="h-[200px] w-full">
      <AreaChart data={TICKET_CHART_DATA} margin={{ top: 8, right: 0, left: -16, bottom: 0 }}>
        <defs>
          <AreaGradientDef id="incomingGrad" colorVar="var(--color-incoming)" />
          <AreaGradientDef id="resolvedGrad" colorVar="var(--color-resolved)" />
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={28}
          tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              indicator="dot"
            />
          }
        />
        <Area {...areaDefaults} dataKey="incoming" stroke="var(--color-incoming)" fill="url(#incomingGrad)" />
        <Area {...areaDefaults} dataKey="resolved" stroke="var(--color-resolved)" fill="url(#resolvedGrad)" />
        <ChartLegend content={<ChartLegendContent />} />
      </AreaChart>
    </ChartContainer>
  )
}

// ── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  change,
  trend,
  tooltip,
}: {
  label: string
  value: string
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
      <span className="text-2xl sm:text-3xl font-semibold tabular-nums">{value}</span>
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

// ── Heatmap period select ──────────────────────────────────────────────────

function HeatmapPeriodSelect() {
  const [value, setValue] = useState('7d')
  return (
    <Select value={value} onValueChange={setValue}>
      <SelectTrigger className="h-8 w-[130px] text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7d">Last 7 days</SelectItem>
        <SelectItem value="14d">Last 14 days</SelectItem>
        <SelectItem value="30d">Last 30 days</SelectItem>
        <SelectSeparator />
        <SelectItem value="this_month">This month</SelectItem>
        <SelectItem value="may_2026">May 2026</SelectItem>
        <SelectItem value="apr_2026">April 2026</SelectItem>
      </SelectContent>
    </Select>
  )
}

// ── Heatmap ────────────────────────────────────────────────────────────────

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const DAYS = [
  { label: 'Mon', date: 'Jun 16, 2026' },
  { label: 'Tue', date: 'Jun 17, 2026' },
  { label: 'Wed', date: 'Jun 18, 2026' },
  { label: 'Thu', date: 'Jun 19, 2026' },
  { label: 'Fri', date: 'Jun 20, 2026' },
  { label: 'Sat', date: 'Jun 21, 2026' },
  { label: 'Sun', date: 'Jun 22, 2026' },
]

// Seeded pseudo-random so values are stable on re-render
function seededRand(seed: number) {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

const HEATMAP_DATA: number[][] = DAYS.map((_, di) =>
  HOURS.map((_, hi) => {
    const r = seededRand(di * 24 + hi)
    // Weekdays business hours get higher values
    const isWeekday = di < 5
    const isBusinessHour = hi >= 9 && hi <= 18
    if (isWeekday && isBusinessHour) return Math.floor(r * 20) + 3
    if (isWeekday) return Math.floor(r * 8)
    return Math.floor(r * 6)
  })
)

function heatmapCellClass(v: number): string {
  if (v === 0) return 'bg-muted'
  if (v <= 4)  return 'bg-brand/15'
  if (v <= 9)  return 'bg-brand/40'
  if (v <= 14) return 'bg-brand/65'
  return 'bg-brand'
}

function heatmapTextClass(v: number): string {
  if (v === 0) return 'text-muted-foreground'
  if (v <= 4)  return 'text-brand'
  if (v <= 9)  return 'text-brand'
  return 'text-primary-foreground'
}

function Heatmap() {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[720px]">
        <div className="flex flex-col gap-0.5">
          {DAYS.map((day, di) => (
            <div key={day.date} className="flex items-center gap-2">
              <div className="w-10 shrink-0 text-right">
                <div className="text-xs font-medium text-muted-foreground">{day.label}</div>
              </div>
              <div className="flex flex-1 gap-0.5">
                {HOURS.map((h) => {
                  const v = HEATMAP_DATA[di][h]
                  return (
                    <div
                      key={h}
                      className={`h-8 flex-1 rounded-sm flex items-center justify-center transition-opacity hover:opacity-80 cursor-default ${heatmapCellClass(v)}`}
                    >
                      <span className={`text-xs font-semibold leading-none ${heatmapTextClass(v)}`}>
                        {v}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* X-axis */}
        <div className="mt-1 flex gap-2 pl-12">
          <div className="flex flex-1 gap-0.5">
            {HOURS.map((h) => (
              <div key={h} className="flex-1 text-center text-xs text-muted-foreground">{h}</div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-3">
          {[
            { label: '0',     cls: 'bg-muted' },
            { label: '1–4',   cls: 'bg-brand/15' },
            { label: '5–9',   cls: 'bg-brand/40' },
            { label: '10–14', cls: 'bg-brand/65' },
            { label: '15+',   cls: 'bg-brand' },
          ].map(({ label, cls }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`size-2 shrink-0 rounded-[2px] ${cls}`} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Labels Overview ───────────────────────────────────────────────────────

const LABEL_ROWS = [
  {
    tag: 'billing',
    tagCls: 'bg-success-bg text-success border-success-border',
    conversations: 84,
    avgFirstResponse: '4m 12s',
    avgResolution: '1h 38m',
    avgWaiting: '2m 05s',
    resolutionCount: 71,
  },
  {
    tag: 'device-setup',
    tagCls: 'bg-destructive-bg text-destructive border-destructive/20',
    conversations: 57,
    avgFirstResponse: '6m 44s',
    avgResolution: '2h 15m',
    avgWaiting: '3m 30s',
    resolutionCount: 43,
  },
  {
    tag: 'lead',
    tagCls: 'bg-brand-bg text-brand border-brand/20',
    conversations: 38,
    avgFirstResponse: '2m 58s',
    avgResolution: '45m 20s',
    avgWaiting: '1m 12s',
    resolutionCount: 31,
  },
  {
    tag: 'refund',
    tagCls: 'bg-warning-bg text-warning border-warning-border',
    conversations: 29,
    avgFirstResponse: '8m 02s',
    avgResolution: '3h 50m',
    avgWaiting: '5m 47s',
    resolutionCount: 18,
  },
  {
    tag: 'account-access',
    tagCls: 'bg-info-bg text-info border-info-border',
    conversations: 62,
    avgFirstResponse: '3m 21s',
    avgResolution: '58m 10s',
    avgWaiting: '1m 55s',
    resolutionCount: 54,
  },
  {
    tag: 'technical-issue',
    tagCls: 'bg-chart-3/10 text-chart-3 border-chart-3/25',
    conversations: 45,
    avgFirstResponse: '10m 33s',
    avgResolution: '4h 22m',
    avgWaiting: '6m 18s',
    resolutionCount: 29,
  },
  {
    tag: 'onboarding',
    tagCls: 'bg-chart-4/10 text-chart-4 border-chart-4/25',
    conversations: 33,
    avgFirstResponse: '1m 48s',
    avgResolution: '22m 05s',
    avgWaiting: '0m 52s',
    resolutionCount: 30,
  },
]

const LABEL_TOTAL = LABEL_ROWS.reduce((s, r) => s + r.conversations, 0)

type SortKey = 'conversations' | 'pct' | 'resolutionCount'
type SortDir = 'asc' | 'desc' | null

function SortableTh({
  label,
  sortKey,
  active,
  dir,
  onSort,
}: {
  label: string
  sortKey: SortKey
  active: SortKey | null
  dir: SortDir
  onSort: (key: SortKey, dir: 'asc' | 'desc') => void
}) {
  return (
    <th className="text-center font-medium text-muted-foreground px-4 py-3">
      <Popover>
        <PopoverTrigger asChild>
          <button className="inline-flex items-center gap-1 hover:text-foreground transition-colors group">
            {label}
            {active === sortKey && dir === 'asc' ? (
              <ArrowUp className="size-3.5 text-foreground shrink-0" />
            ) : active === sortKey && dir === 'desc' ? (
              <ArrowDown className="size-3.5 text-foreground shrink-0" />
            ) : (
              <ChevronsUpDown className="size-3.5 opacity-40 group-hover:opacity-70 shrink-0" />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-36 p-1" align="end">
          <button
            onClick={() => onSort(sortKey, 'asc')}
            className={cn(
              'flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted',
              active === sortKey && dir === 'asc' ? 'font-medium text-foreground' : 'text-muted-foreground'
            )}
          >
            <ArrowUp className="size-3.5" /> Asc
          </button>
          <button
            onClick={() => onSort(sortKey, 'desc')}
            className={cn(
              'flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted',
              active === sortKey && dir === 'desc' ? 'font-medium text-foreground' : 'text-muted-foreground'
            )}
          >
            <ArrowDown className="size-3.5" /> Desc
          </button>
        </PopoverContent>
      </Popover>
    </th>
  )
}

function LabelsOverview() {
  const [businessHours, setBusinessHours] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)

  function handleSort(key: SortKey, dir: 'asc' | 'desc') {
    setSortKey(key)
    setSortDir(dir)
  }

  const rows = [...LABEL_ROWS].sort((a, b) => {
    if (!sortKey || !sortDir) return 0
    const aVal = sortKey === 'pct' ? a.conversations : a[sortKey]
    const bVal = sortKey === 'pct' ? b.conversations : b[sortKey]
    return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
  })

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-2xl font-semibold">Labels</h2>
        <div className="flex items-center gap-2">
          <DateRangePicker compact />
          <Button variant="default" size="default" className="gap-2 shrink-0">
            <Download className="size-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
      <h3 className="text-lg font-semibold mb-1">Label performance</h3>
      <p className="text-sm text-muted-foreground mb-5">
        Track label performance with key metrics including conversations, response times, resolution times, and resolved cases. Click a label name for detailed insights.
      </p>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left font-medium text-muted-foreground px-4 py-3 w-[180px]">Label</th>
              <SortableTh label="No. of conversations" sortKey="conversations" active={sortKey} dir={sortDir} onSort={handleSort} />
              <SortableTh label="% of total" sortKey="pct" active={sortKey} dir={sortDir} onSort={handleSort} />
              <th className="text-right font-medium text-muted-foreground px-4 py-3">Avg. First Response Time</th>
              <th className="text-right font-medium text-muted-foreground px-4 py-3">Avg. Resolution Time</th>
              <th className="text-right font-medium text-muted-foreground px-4 py-3">Avg. Customer Waiting Time</th>
              <SortableTh label="Resolution Count" sortKey="resolutionCount" active={sortKey} dir={sortDir} onSort={handleSort} />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.tag} className={cn('border-b border-border last:border-0', i % 2 === 1 && 'bg-muted/20')}>
                <td className="px-4 py-3">
                  <span className={cn('text-xs px-1.5 py-0.5 rounded border font-medium', row.tagCls)}>
                    {row.tag}
                  </span>
                </td>
                <td className="px-4 py-3 text-center tabular-nums">{row.conversations}</td>
                <td className="px-4 py-3 text-center tabular-nums text-muted-foreground">
                  {((row.conversations / LABEL_TOTAL) * 100).toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{row.avgFirstResponse}</td>
                <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{row.avgResolution}</td>
                <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{row.avgWaiting}</td>
                <td className="px-4 py-3 text-center tabular-nums font-medium">{row.resolutionCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.replace('/')
  }, [user, loading, router])

  if (loading || !user) return null

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: 'Bildery', href: '/dashboard' },
          { label: 'Reports', href: '/reports' },
          { label: 'Overview' },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 px-4 sm:px-6 pt-4 pb-8">

        {/* Header row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold">Conversations</h1>
          <div className="flex items-center gap-2">
            <DateRangePicker compact />
            <Button variant="default" size="default" className="gap-2 shrink-0">
              <Download className="size-4" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          </div>
        </div>

        {/* 8 stat cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <StatCard
            label="New conversations"
            value="243"
            change="3.6%"
            trend="up"
            tooltip="Number of new conversations, by the date of the customer's first message."
          />
          <StatCard
            label="Conversations replied to"
            value="198"
            change="2.1%"
            trend="up"
            tooltip="Number of conversations that have one or more teammate's responses."
          />
          <StatCard
            label="Replies sent"
            value="512"
            change="6.0%"
            trend="down"
            tooltip="Total teammate replies sent, on conversations where a customer participated."
          />
          <StatCard
            label="Closed conversations"
            value="170"
            change="5.0%"
            trend="up"
            tooltip="Number of unique conversations closed."
          />
          <StatCard
            label="Reopened conversations"
            value="14"
            change="1.2%"
            trend="down"
            tooltip="Number of conversations that were reopened after being closed."
          />
          <StatCard
            label="Open conversations"
            value="8"
            change="0.8%"
            trend="up"
            tooltip="Number of conversations currently open and being handled by teammates."
          />
          <StatCard
            label="Snoozed conversations"
            value="3"
            change="0.4%"
            trend="up"
            tooltip="Number of conversations snoozed and scheduled to reopen at a later time."
          />
          <StatCard
            label="Conversations marked as spam"
            value="21"
            change="4.3%"
            trend="down"
            tooltip="Number of conversations that were marked as spam and removed from the inbox."
          />
        </div>

        {/* Incoming vs Resolved */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <div className="mb-1">
            <span className="text-lg font-semibold">New conversations vs Closed conversations</span>
            <p className="text-sm text-muted-foreground mt-0.5">Conversations per day — last 28 days, excl. spam</p>
          </div>
          <div className="mt-4">
            <TicketsAreaChart />
          </div>
        </div>

        {/* Tickets Traffic heatmap */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-semibold">Hourly Distribution of New Conversations</span>
              <LiveBadge />
            </div>
            <div className="flex items-center gap-2">
              <HeatmapPeriodSelect />
              <Button variant="outline" size="icon-sm">
                <Download className="size-4" />
              </Button>
            </div>
          </div>
          <Heatmap />
        </div>

        {/* Labels Overview */}
        <LabelsOverview />

        {/* Agent status */}
        <div>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-2xl font-semibold">Agent status</span>
            <div className="flex items-center gap-2">
              <DateRangePicker compact />
              <Button variant="default" size="default" className="gap-2 shrink-0">
                <Download className="size-4" />
                <span className="hidden sm:inline">Download</span>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {[
              { label: 'Total agents', value: 3, tooltip: 'Total number of agents registered in the system.' },
              { label: 'Online', value: 1, tooltip: 'Agents currently online and available to receive new conversations.' },
              { label: 'Busy', value: 1, tooltip: 'Agents who are online but unavailable for new conversations — either set manually or because they reached their active conversation limit.' },
              { label: 'Offline', value: 1, tooltip: 'Agents who are not currently logged in or have set their status to offline.' },
            ].map(({ label, value, tooltip }) => (
              <div key={label} className="rounded-2xl border border-border bg-card p-4 sm:p-5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
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
                  <LiveBadge />
                </div>
                <span className="text-2xl sm:text-3xl font-semibold tabular-nums">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Agents Overview */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-1">Agents Overview</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Easily track agent performance with key metrics such as conversations, response times, resolution times, and resolved cases. Click an agent's name to learn more.
          </p>

          <div className="rounded-xl border border-border overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left font-medium text-muted-foreground px-4 py-3 w-[200px]">Agent</th>
                  <th className="text-right font-medium text-muted-foreground px-4 py-3">No. of conversations</th>
                  <th className="text-right font-medium text-muted-foreground px-4 py-3">Avg. First Response Time</th>
                  <th className="text-right font-medium text-muted-foreground px-4 py-3">Avg. Resolution Time</th>
                  <th className="text-right font-medium text-muted-foreground px-4 py-3">Avg. Customer Waiting Time</th>
                  <th className="text-right font-medium text-muted-foreground px-4 py-3">Resolution Count</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Eugene',  conversations: 98,  firstResponse: '3m 42s', resolution: '1h 12m', waiting: '1m 48s', resolutionCount: 81 },
                  { name: 'Anna',    conversations: 74,  firstResponse: '5m 10s', resolution: '1h 55m', waiting: '2m 33s', resolutionCount: 60 },
                  { name: 'Michael', conversations: 71,  firstResponse: '4m 28s', resolution: '2h 04m', waiting: '3m 05s', resolutionCount: 58 },
                ].map((agent, i) => (
                  <tr key={agent.name} className={cn('border-b border-border last:border-0', i % 2 === 1 && 'bg-muted/20')}>
                    <td className="px-4 py-3 font-medium">{agent.name}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{agent.conversations}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{agent.firstResponse}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{agent.resolution}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{agent.waiting}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">{agent.resolutionCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  )
}
