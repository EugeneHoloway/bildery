'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { DashboardHeader } from '@/components/DashboardHeader'
import { Button } from '@/components/ui/button'
import { DateRangeFilter } from '@/components/ui/date-range-filter'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Download, TrendingUp, TrendingDown, Info, ArrowUp, ArrowDown, ChevronsUpDown, Angry, Frown, Meh, Smile, Laugh, MessageSquareOff } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
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
  resolved: { label: 'Resolved conversations', color: 'var(--color-chart-2)' },
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
        <YAxis
          ticks={[20, 40, 60, 80]}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
        />
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
        <div className="mt-4 flex items-center justify-center gap-1.5">
          <span className="text-xs text-muted-foreground">Less</span>
          {['bg-muted', 'bg-brand/15', 'bg-brand/40', 'bg-brand/65', 'bg-brand'].map((cls) => (
            <div key={cls} className={`size-2 shrink-0 rounded-[2px] ${cls}`} />
          ))}
          <span className="text-xs text-muted-foreground">More</span>
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
          <DateRangeFilter size="default" mobileLabel="preset" defaultPreset="Last 28 Days" />
          <Button variant="default" size="default" className="gap-2 shrink-0">
            <Download className="size-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="p-2 px-3 pt-4 pb-4">
      <h3 className="text-lg font-semibold mb-1">Label performance</h3>
      <p className="text-sm text-muted-foreground">
        Track label performance with key metrics including conversations, response times, resolution times, and resolved cases. Click a label name for detailed insights.
      </p>
      </div>

      <Table className="min-w-[760px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[180px]">Label</TableHead>
            <TableHead className="text-center"><SortableTh label="No. of conversations" sortKey="conversations" active={sortKey} dir={sortDir} onSort={handleSort} /></TableHead>
            <TableHead className="text-center"><SortableTh label="% of total" sortKey="pct" active={sortKey} dir={sortDir} onSort={handleSort} /></TableHead>
            <TableHead className="text-right whitespace-nowrap">Avg. First Response Time</TableHead>
            <TableHead className="text-right whitespace-nowrap">Avg. Resolution Time</TableHead>
            <TableHead className="text-right whitespace-nowrap">Avg. Customer Waiting Time</TableHead>
            <TableHead className="text-center"><SortableTh label="Resolution Count" sortKey="resolutionCount" active={sortKey} dir={sortDir} onSort={handleSort} /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.tag}>
              <TableCell>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className={cn('text-xs px-1.5 py-0.5 rounded border font-medium inline-block max-w-[140px] truncate align-middle', row.tagCls)}>
                        {row.tag}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">{row.tag}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell className="text-center tabular-nums">{row.conversations}</TableCell>
              <TableCell className="text-center tabular-nums text-muted-foreground">
                {((row.conversations / LABEL_TOTAL) * 100).toFixed(1)}%
              </TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">{row.avgFirstResponse}</TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">{row.avgResolution}</TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">{row.avgWaiting}</TableCell>
              <TableCell className="text-center tabular-nums font-medium">{row.resolutionCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </div>
  )
}

// ── Agent Performance ─────────────────────────────────────────────────────

type AgentSortKey = 'conversations' | 'resolutionCount'

const AGENT_ROWS = [
  { name: 'David Wallace',  conversations: 98,  firstResponse: '3m 42s', resolution: '1h 12m', waiting: '1m 48s', resolutionCount: 81 },
  { name: 'Sarah Connor',   conversations: 74,  firstResponse: '5m 10s', resolution: '1h 55m', waiting: '2m 33s', resolutionCount: 60 },
  { name: 'James Holden',   conversations: 71,  firstResponse: '4m 28s', resolution: '2h 04m', waiting: '3m 05s', resolutionCount: 58 },
  { name: 'Nina Petrova',   conversations: 65,  firstResponse: '6m 01s', resolution: '2h 30m', waiting: '2m 50s', resolutionCount: 52 },
  { name: 'Omar Khalid',    conversations: 58,  firstResponse: '4m 55s', resolution: '1h 45m', waiting: '2m 10s', resolutionCount: 47 },
  { name: 'Lia Nakamura',   conversations: 49,  firstResponse: '3m 20s', resolution: '1h 28m', waiting: '1m 35s', resolutionCount: 41 },
]

function AgentSortableTh({
  label,
  sortKey,
  active,
  dir,
  onSort,
}: {
  label: string
  sortKey: AgentSortKey
  active: AgentSortKey | null
  dir: SortDir
  onSort: (key: AgentSortKey, dir: 'asc' | 'desc') => void
}) {
  return (
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
  )
}

function AgentPerformance() {
  const [sortKey, setSortKey] = useState<AgentSortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)

  function handleSort(key: AgentSortKey, dir: 'asc' | 'desc') {
    setSortKey(key)
    setSortDir(dir)
  }

  const rows = [...AGENT_ROWS].sort((a, b) => {
    if (!sortKey || !sortDir) return 0
    return sortDir === 'asc' ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]
  })

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="p-2 px-3 pt-4 pb-4">
        <h2 className="text-lg font-semibold mb-1">Agent Performance</h2>
        <p className="text-sm text-muted-foreground">
          Easily track agent performance with key metrics such as conversations, response times, resolution times, and resolved cases. Click an agent's name to learn more.
        </p>
      </div>
      <Table className="min-w-[640px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[200px]">Agent</TableHead>
            <TableHead className="text-center"><AgentSortableTh label="No. of conversations" sortKey="conversations" active={sortKey} dir={sortDir} onSort={handleSort} /></TableHead>
            <TableHead className="text-right whitespace-nowrap">Avg. First Response Time</TableHead>
            <TableHead className="text-right whitespace-nowrap">Avg. Resolution Time</TableHead>
            <TableHead className="text-right whitespace-nowrap">Avg. Customer Waiting Time</TableHead>
            <TableHead className="text-center"><AgentSortableTh label="Resolution Count" sortKey="resolutionCount" active={sortKey} dir={sortDir} onSort={handleSort} /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((agent) => (
            <TableRow key={agent.name}>
              <TableCell className="font-medium">{agent.name}</TableCell>
              <TableCell className="text-center tabular-nums">{agent.conversations}</TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">{agent.firstResponse}</TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">{agent.resolution}</TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">{agent.waiting}</TableCell>
              <TableCell className="text-center tabular-nums font-medium">{agent.resolutionCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// ── CSAT ─────────────────────────────────────────────────────────────────

const CSAT_RATINGS = [
  { Icon: Laugh, label: 'Excellent', count: 54, pct: 45, color: 'bg-success' },
  { Icon: Smile, label: 'Good',      count: 36, pct: 30, color: 'bg-brand'   },
  { Icon: Meh,   label: 'Average',   count: 18, pct: 15, color: 'bg-amber-400' },
  { Icon: Frown, label: 'Fair',      count:  7, pct:  6, color: 'bg-orange-400' },
  { Icon: Angry, label: 'Poor',      count:  5, pct:  4, color: 'bg-destructive' },
]

const CSAT_COMMENTS = [
  { name: 'Klaus Crawley',      Icon: Laugh, comment: 'Super fast response and the agent resolved everything in one go. Very impressed!',      agent: 'David Wallace'  },
  { name: 'Coreen Mewett',      Icon: Smile, comment: 'Good support overall. Would be nice to have a chat option on mobile too.',              agent: 'Sarah Mitchell' },
  { name: 'Nathaniel Vannuchi', Icon: Meh,   comment: 'The issue was resolved but it took a while. The agent was helpful though.',             agent: 'David Wallace'  },
  { name: 'Unknown user',       Icon: Frown, comment: 'Had to explain the same problem twice. Please improve handoff between agents.',         agent: 'James Kowalski' },
  { name: 'Candice Matherson',  Icon: Laugh, comment: 'David was amazing. Sorted out my billing issue within minutes. 10/10.',                 agent: 'David Wallace'  },
  { name: 'Sandra Mills',       Icon: Smile, comment: 'Really appreciate the quick turnaround. My subscription issue was handled professionally.', agent: 'Sarah Mitchell' },
  { name: 'Tom Harrigan',       Icon: Laugh, comment: "Best support experience I've had in a while. Clear, fast, and friendly.",               agent: 'James Kowalski' },
  { name: 'Merrile Petruk',     Icon: Meh,   comment: 'Average experience. The solution worked but I had to follow up twice.',                 agent: 'David Wallace'  },
  { name: 'Quent Dalliston',    Icon: Angry, comment: "Very disappointed. Waited 20 minutes and the problem still isn't fully resolved.",      agent: 'James Kowalski' },
  { name: 'Ben Nugent',         Icon: Smile, comment: 'Good experience overall. The agent was knowledgeable and explained everything clearly.', agent: 'Sarah Mitchell' },
]

function CsatSection() {
  const [showData, setShowData] = useState(false)

  const stats = showData
    ? [
        { label: 'Total responses', value: '120', tooltip: 'Total number of CSAT survey responses submitted by customers.' },
        { label: 'Satisfaction score', value: '75%', tooltip: 'Percentage of responses rated Good or Excellent out of all responses.' },
        { label: 'Response rate', value: '62%', tooltip: 'Percentage of customers who completed the CSAT survey after their conversation ended.' },
      ]
    : [
        { label: 'Total responses', value: '0', tooltip: 'Total number of CSAT survey responses submitted by customers.' },
        { label: 'Satisfaction score', value: '0%', tooltip: 'Percentage of responses rated Good or Excellent out of all responses.' },
        { label: 'Response rate', value: '0%', tooltip: 'Percentage of customers who completed the CSAT survey after their conversation ended.' },
      ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">CSAT Reports</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-sm text-muted-foreground">{showData ? 'Data' : 'Empty state'}</span>
            <Switch checked={showData} onCheckedChange={setShowData} />
          </label>
          <DateRangeFilter size="default" mobileLabel="preset" defaultPreset="Last 28 Days" />
          <Button variant="default" size="default" className="gap-2 shrink-0">
            <Download className="size-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="grid grid-cols-1 sm:grid-cols-3 sm:divide-x divide-y sm:divide-y-0 divide-border">
          {stats.map(({ label, value, tooltip }) => (
            <div key={label} className="flex flex-col gap-1 px-4 sm:px-6 py-4 sm:py-5">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                {label}
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="size-3.5 text-muted-foreground/50 hover:text-muted-foreground cursor-default shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[220px] text-xs">{tooltip}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
              <span className="text-3xl font-semibold tabular-nums">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rating distribution */}
      <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4">
        <span className="text-sm font-medium">Rating distribution</span>
        {showData ? (
          <div className="flex h-2.5 rounded-full overflow-hidden w-full gap-px">
            {CSAT_RATINGS.map(({ label, pct, color }) => (
              <div key={label} className={`${color} h-full`} style={{ width: `${pct}%` }} />
            ))}
          </div>
        ) : (
          <div className="h-2.5 rounded-full bg-muted w-full" />
        )}
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {CSAT_RATINGS.map(({ Icon, label, count, pct }) => (
            <span key={label} className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Icon className="size-4 shrink-0" />
              {label}{' '}
              <span className="font-medium text-foreground">{showData ? `${pct}%` : '0%'}</span>
              <span className="text-muted-foreground/60">({showData ? count : 0})</span>
            </span>
          ))}
        </div>
      </div>

      {/* Comments or empty state */}
      {showData ? (
        <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-y-auto max-h-[400px]">
          {CSAT_COMMENTS.map(({ name, Icon, comment, agent }, i) => (
            <div key={i} className="flex items-start gap-3 px-5 py-4">
              <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-sm font-medium text-muted-foreground">
                {name[0]}
              </div>
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{name}</span>
                    <Icon className="size-4 text-muted-foreground shrink-0" />
                  </div>
                  <span className="text-xs text-muted-foreground">Agent: {agent}</span>
                </div>
                <p className="text-sm text-muted-foreground">{comment}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card flex flex-col items-center justify-center py-16 gap-3">
          <div className="size-14 rounded-xl bg-muted flex items-center justify-center">
            <MessageSquareOff className="size-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">No responses yet</p>
            <p className="text-sm text-muted-foreground mt-0.5 max-w-xs">CSAT survey responses will appear here once customers start providing feedback.</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────

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
            <DateRangeFilter size="default" mobileLabel="preset" defaultPreset="Last 28 Days" />
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
            label="Resolved conversations"
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
            label="Conversations marked as junk"
            value="21"
            change="4.3%"
            trend="down"
            tooltip="Number of conversations that were marked as junk and removed from the inbox."
          />
        </div>

        {/* Incoming vs Resolved */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <div className="mb-1">
            <span className="text-lg font-semibold">New conversations vs Resolved conversations</span>
            <p className="text-sm text-muted-foreground mt-0.5">Conversations per day -- last 28 days, excl. junk</p>
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
              <DateRangeFilter size="default" mobileLabel="preset" defaultPreset="Last 28 Days" />
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
        <AgentPerformance />

        {/* CSAT Reports */}
        <CsatSection />

      </div>
    </>
  )
}
