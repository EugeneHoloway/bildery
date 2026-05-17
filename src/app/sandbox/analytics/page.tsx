'use client'

import { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  AreaGradientDef,
  areaDefaults,
  type ChartConfig,
} from '@/components/ui/chart'
import { DocLayout }  from '@/components/doc/DocLayout'
import { DocSection } from '@/components/doc/DocSection'
import { DocBlock }   from '@/components/doc/DocBlock'
import { DocTable, DocTableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/doc/DocTable'

function fmt(n: string | number | null | undefined) {
  if (n == null) return '--'
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

function fmtMonth(iso: string | null | undefined) {
  if (!iso) return '--'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

function getDateFilter(range: string) {
  const now = new Date()
  if (range === '30d') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
  if (range === '90d') return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
  return null
}

const CHART_COLOR_KEYS = ['chart-1', 'chart-3', 'chart-2', 'chart-5', 'chart-4'] as const

// ── Retention badge ────────────────────────────────────────────────────────────

function retentionBadgeClass(pct: number): string {
  if (pct >= 50) return 'bg-success-bg text-success border-success-border'
  if (pct > 0)   return 'bg-warning-bg text-warning border-warning-border'
  return 'bg-subtle text-muted-foreground border-subtle-border'
}

// ── RFM segment badge ──────────────────────────────────────────────────────────

const RFM_SEG_CLASS: Record<string, string> = {
  'Champions':   'bg-brand-bg text-brand border-brand/20',
  'Loyal':       'bg-success-bg text-success border-success-border',
  'Promising':   'bg-info-bg text-info border-info-border',
  'New Players': 'bg-success-bg text-success border-success-border',
  'At Risk':     'bg-warning-bg text-warning border-warning-border',
  'Lost':        'bg-destructive-bg text-destructive border-destructive/20',
}

function scoreClass(s: number): string {
  if (s >= 4) return 'text-success font-medium'
  if (s <= 2) return 'text-destructive font-medium'
  return 'text-warning font-medium'
}

// ── Chart configs ─────────────────────────────────────────────────────────────

const revenueChartConfig = {
  ggr: { label: 'GGR', color: 'var(--color-chart-1)' },
  ngr: { label: 'NGR', color: 'var(--color-chart-2)' },
} satisfies ChartConfig

const retentionChartConfig = {
  d7:  { label: 'D7 retention',  color: 'var(--color-chart-1)' },
  d30: { label: 'D30 retention', color: 'var(--color-chart-2)' },
} satisfies ChartConfig

const depositChartConfig = {
  deposits:    { label: 'Deposits',    color: 'var(--color-chart-1)' },
  withdrawals: { label: 'Withdrawals', color: 'var(--color-chart-3)' },
} satisfies ChartConfig

const rfmSegChartConfig = {
  count:   { label: 'Players',  color: 'var(--color-chart-1)' },
  avg_ggr: { label: 'Avg GGR', color: 'var(--color-chart-2)' },
} satisfies ChartConfig

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [monthly,     setMonthly]     = useState<any[]>([])
  const [byCategory,  setByCategory]  = useState<any[]>([])
  const [byProvider,  setByProvider]  = useState<any[]>([])
  const [players,     setPlayers]     = useState<any[]>([])
  const [topGames,    setTopGames]    = useState<any[]>([])
  const [txMonthly,   setTxMonthly]   = useState<any[]>([])
  const [cohorts,     setCohorts]     = useState<any[]>([])
  const [rfm,         setRfm]         = useState<any[]>([])
  const [rfmSummary,  setRfmSummary]  = useState<any[]>([])
  const [dateRange,   setDateRange]   = useState('all')
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    async function load() {
      const [m, cat, prov, pl, games, tx, coh, rfmData] = await Promise.all([
        supabase.from('v_revenue_monthly').select('*'),
        supabase.from('v_revenue_by_category').select('*'),
        supabase.from('v_revenue_by_provider').select('*'),
        supabase.from('v_player_summary').select('*').order('player_ggr', { ascending: false }),
        supabase.from('v_top_games').select('*').limit(8),
        supabase.from('v_transactions_monthly').select('*'),
        supabase.from('v_retention_cohorts').select('*'),
        supabase.from('v_rfm_segments').select('*').order('monetary', { ascending: false }),
      ])

      setMonthly((m.data || []).map(r => ({ ...r, month: fmtMonth(r.month), raw_date: r.month })))
      setByCategory((cat.data || []).map((r: any, i: number) => ({
        ...r,
        fill: `var(--color-${CHART_COLOR_KEYS[i % CHART_COLOR_KEYS.length]})`,
      })))
      setByProvider(prov.data || [])
      setPlayers(pl.data || [])
      setTopGames(games.data || [])
      setTxMonthly((tx.data || []).map(r => ({ ...r, month: fmtMonth(r.month) })))
      setCohorts(coh.data || [])

      const rfmRows = rfmData.data || []
      setRfm(rfmRows)

      const summary: Record<string, { segment: string; count: number; total: number; paying: number }> = {}
      rfmRows.forEach(r => {
        if (!summary[r.segment]) summary[r.segment] = { segment: r.segment, count: 0, total: 0, paying: 0 }
        summary[r.segment].count  += 1
        summary[r.segment].total  += Number(r.monetary)
        summary[r.segment].paying += Number(r.deposit_count) > 0 ? 1 : 0
      })
      setRfmSummary(
        Object.values(summary)
          .map(s => ({ ...s, avg_ggr: Math.round(s.total / s.count), arppu: s.paying > 0 ? Math.round(s.total / s.paying) : 0 }))
          .sort((a, b) => b.avg_ggr - a.avg_ggr),
      )

      setLoading(false)
    }
    load()
  }, [])

  // ── Derived data ─────────────────────────────────────────────────────────────

  type TxMonth = { month: string; deposits: number; withdrawals: number }
  const txMapSorted: Record<string, TxMonth> = {}
  txMonthly.forEach(r => {
    if (!txMapSorted[r.month]) txMapSorted[r.month] = { month: r.month, deposits: 0, withdrawals: 0 }
    if (r.type === 'deposit')    txMapSorted[r.month].deposits    = Number(r.total_amount)
    if (r.type === 'withdrawal') txMapSorted[r.month].withdrawals = Number(r.total_amount)
  })
  const MONTH_ORDER = ['Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep']
  const sortByMonth = (a: TxMonth, b: TxMonth) => {
    const [am, ay] = a.month.split(' ')
    const [bm, by] = b.month.split(' ')
    return ay !== by ? Number(ay) - Number(by) : MONTH_ORDER.indexOf(am) - MONTH_ORDER.indexOf(bm)
  }
  const txChart = Object.values(txMapSorted).sort(sortByMonth)

  const since = getDateFilter(dateRange)
  const filteredMonthly = since ? monthly.filter(r => new Date(r.raw_date) >= new Date(since)) : monthly
  const filteredTxChart = since ? (() => {
    const sinceDate = new Date(since)
    const filtered = txMonthly.filter(r => {
      const match = monthly.find(m => m.month === r.month)
      return match ? new Date(match.raw_date) >= sinceDate : true
    })
    const map: Record<string, TxMonth> = {}
    filtered.forEach(r => {
      if (!map[r.month]) map[r.month] = { month: r.month, deposits: 0, withdrawals: 0 }
      if (r.type === 'deposit')    map[r.month].deposits    = Number(r.total_amount)
      if (r.type === 'withdrawal') map[r.month].withdrawals = Number(r.total_amount)
    })
    return Object.values(map).sort(sortByMonth)
  })() : txChart

  const filteredTotalGGR      = filteredMonthly.reduce((s, r) => s + Number(r.ggr), 0)
  const filteredTotalBets     = filteredMonthly.reduce((s, r) => s + Number(r.total_bets), 0)
  const filteredTotalDeposits = filteredTxChart.reduce((s, r) => s + Number(r.deposits || 0), 0)
  const activePlayers         = players.filter(p => p.status === 'active').length

  const segmentCount = players.reduce<Record<string, number>>((acc, p) => {
    const tier = p.vip_tier || 'standard'
    acc[tier] = (acc[tier] || 0) + 1
    return acc
  }, {})
  const categoryChartConfig: ChartConfig = {
    ggr: { label: 'GGR' },
    ...Object.fromEntries(
      byCategory.map((r: any, i: number) => [r.game_category, {
        label: r.game_category ? r.game_category.charAt(0).toUpperCase() + r.game_category.slice(1) : r.game_category,
        color: `var(--color-${CHART_COLOR_KEYS[i % CHART_COLOR_KEYS.length]})`,
      }])
    ),
  }

  const segmentData = Object.entries(segmentCount).map(([name, value], i) => ({
    name,
    value,
    fill: `var(--color-${CHART_COLOR_KEYS[i % CHART_COLOR_KEYS.length]})`,
  }))
  const vipChartConfig: ChartConfig = {
    value: { label: 'Players' },
    ...Object.fromEntries(
      segmentData.map((d, i) => [d.name, {
        label: d.name.charAt(0).toUpperCase() + d.name.slice(1),
        color: `var(--color-${CHART_COLOR_KEYS[i % CHART_COLOR_KEYS.length]})`,
      }])
    ),
  }

  if (loading) {
    return (
      <div className="py-10 pb-20">
        <div className="container">
          <p className="text-muted-foreground py-16">Loading analytics…</p>
        </div>
      </div>
    )
  }

  return (
    <DocLayout
      title="Analytics Dashboard | iGaming"
      breadcrumbLabel="Sandbox"
      breadcrumbHref="/sandbox"
      tags={[
        { label: 'Live Data',          type: 'status' },
        { label: 'Supabase',           type: 'tag'    },
        { label: 'iGaming Backoffice', type: 'tag'    },
        { label: 'Concept',            type: 'tag'    },
      ]}
      description="Operator analytics prototype -- revenue, player activity, game performance and deposits pulled live from Supabase | Mock dataset | By Yevhenii Holovei"
      footnote="Analytics Dashboard | iGaming Backoffice Concept | Data: Supabase mock dataset | Author: Yevhenii Holovei | April 2026"
    >

      {/* Date range filter */}
      <div className="flex gap-1.5 flex-wrap mb-6">
        {[{ key: 'all', label: 'All time' }, { key: '90d', label: 'Last 90 days' }, { key: '30d', label: 'Last 30 days' }].map(opt => (
          <button
            key={opt.key}
            onClick={() => setDateRange(opt.key)}
            className={cn(
              'px-2.5 py-1 rounded-md border text-xs font-semibold transition-all',
              dateRange === opt.key
                ? 'bg-foreground text-background border-foreground'
                : 'bg-transparent text-muted-foreground border-border hover:text-foreground',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-14">
        {[
          { value: `€${fmt(filteredTotalGGR)}`,      label: 'Total GGR',         note: 'bets − wins'     },
          { value: `€${fmt(filteredTotalBets)}`,      label: 'Total Bets Volume', note: 'gross wagered'   },
          { value: `€${fmt(filteredTotalDeposits)}`,  label: 'Total Deposits',    note: 'all currencies'  },
          { value: String(activePlayers),             label: 'Active Players',    note: 'status = active' },
        ].map(item => (
          <Card key={item.label} className="flex flex-col gap-1 p-5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{item.value}</span>
            <span className="text-xs font-semibold text-foreground">{item.label}</span>
            <span className="text-xs text-muted-foreground">{item.note}</span>
          </Card>
        ))}
      </div>

      {/* 01 Revenue */}
      <DocSection num="01" title="Revenue Overview">

        <DocBlock title="GGR & NGR by month" subtitle="GGR = bets − wins | NGR = GGR − bonuses issued">
          <Card>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
              <ChartContainer config={revenueChartConfig} className="h-[240px] w-full">
                <AreaChart data={filteredMonthly} margin={{ top: 8, right: 24, left: -16, bottom: 0 }}>
                  <defs>
                    <AreaGradientDef id="ggrGrad" colorVar="var(--color-ggr)" />
                    <AreaGradientDef id="ngrGrad" colorVar="var(--color-ngr)" />
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} interval="preserveStartEnd" />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={v => `€${v}`} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel={false} indicator="dot" />}
                  />
                  <Area {...areaDefaults} dataKey="ggr" stroke="var(--color-ggr)" fill="url(#ggrGrad)" />
                  <Area {...areaDefaults} dataKey="ngr" stroke="var(--color-ngr)" fill="url(#ngrGrad)" />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </DocBlock>

        <DocBlock title="GGR by game category">
          <Card className="mb-4">
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
              <ChartContainer config={categoryChartConfig} className="h-[200px] w-full">
                <BarChart data={byCategory} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="game_category" tickLine={false} axisLine={false} tickMargin={10} tickFormatter={v => v.charAt(0).toUpperCase() + v.slice(1)} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={v => `€${v}`} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel={false} indicator="dot" />}
                  />
                  <Bar dataKey="ggr" radius={8} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <DocTable>
            <DocTableHeader>
              <TableRow><TableHead>Category</TableHead><TableHead>GGR</TableHead><TableHead>Total bets</TableHead><TableHead>Hold %</TableHead><TableHead>Players</TableHead></TableRow>
            </DocTableHeader>
            <TableBody>
              {byCategory.map(r => (
                <TableRow key={r.game_category}>
                  <TableCell className="font-semibold">{r.game_category.charAt(0).toUpperCase() + r.game_category.slice(1)}</TableCell>
                  <TableCell>€{fmt(r.ggr)}</TableCell>
                  <TableCell>€{fmt(r.total_bets)}</TableCell>
                  <TableCell>{fmt(r.hold_pct)}%</TableCell>
                  <TableCell>{r.players}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DocTable>
        </DocBlock>

        <DocBlock title="GGR by provider">
          <DocTable>
            <DocTableHeader>
              <TableRow><TableHead>Provider</TableHead><TableHead>GGR</TableHead><TableHead>Bets</TableHead><TableHead>Rounds</TableHead><TableHead>Hold %</TableHead></TableRow>
            </DocTableHeader>
            <TableBody>
              {byProvider.map(r => (
                <TableRow key={r.provider}>
                  <TableCell className="font-semibold">{r.provider}</TableCell>
                  <TableCell>€{fmt(r.ggr)}</TableCell>
                  <TableCell>€{fmt(r.total_bets)}</TableCell>
                  <TableCell>{r.bet_count}</TableCell>
                  <TableCell>{fmt(r.hold_pct)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DocTable>
        </DocBlock>

      </DocSection>

      {/* 02 Deposits */}
      <DocSection num="02" title="Deposits & Withdrawals">
        <DocBlock title="Volume by month" subtitle="Deposits vs withdrawals | all payment methods">
          <Card>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
              <ChartContainer config={depositChartConfig} className="h-[220px] w-full">
                <BarChart data={filteredTxChart} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} interval="preserveStartEnd" />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={v => `€${v}`} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel={false} indicator="dot" />}
                  />
                  <Bar dataKey="deposits"    fill="var(--color-deposits)"    radius={[4, 4, 0, 0]} />
                  <Bar dataKey="withdrawals" fill="var(--color-withdrawals)" radius={[4, 4, 0, 0]} />
                  <ChartLegend content={<ChartLegendContent />} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </DocBlock>
      </DocSection>

      {/* 03 Games */}
      <DocSection num="03" title="Game Performance">
        <DocBlock title="Top games by GGR">
          <DocTable>
            <DocTableHeader>
              <TableRow><TableHead>Game</TableHead><TableHead>Category</TableHead><TableHead>Provider</TableHead><TableHead>GGR</TableHead><TableHead>Rounds</TableHead><TableHead>Players</TableHead><TableHead>Hold %</TableHead></TableRow>
            </DocTableHeader>
            <TableBody>
              {topGames.map(r => (
                <TableRow key={r.game_id}>
                  <TableCell className="font-semibold">{r.game_id}</TableCell>
                  <TableCell>{r.game_category ? r.game_category.charAt(0).toUpperCase() + r.game_category.slice(1) : '—'}</TableCell>
                  <TableCell>{r.provider}</TableCell>
                  <TableCell>€{fmt(r.ggr)}</TableCell>
                  <TableCell>{r.rounds_played}</TableCell>
                  <TableCell>{r.unique_players}</TableCell>
                  <TableCell>{fmt(r.hold_pct)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DocTable>
        </DocBlock>
      </DocSection>

      {/* 04 Players */}
      <DocSection num="04" title="Player Overview">

        <DocBlock title="Players by VIP tier">
          <Card className="mb-2">
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
              <ChartContainer config={vipChartConfig} className="h-[180px] w-full">
                <BarChart data={segmentData} layout="vertical" margin={{ top: 4, right: 16, left: 16, bottom: 0 }}>
                  <XAxis type="number" dataKey="value" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    width={72}
                    tickFormatter={v => v.charAt(0).toUpperCase() + v.slice(1)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel={false} indicator="dot" />}
                  />
                  <Bar dataKey="value" radius={5} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </DocBlock>

        <DocBlock title="Top players by GGR">
          <DocTable>
            <DocTableHeader>
              <TableRow><TableHead>#</TableHead><TableHead>Country</TableHead><TableHead>Channel</TableHead><TableHead>Tier</TableHead><TableHead>GGR</TableHead><TableHead>Deposits</TableHead><TableHead>Bets</TableHead><TableHead>Sessions</TableHead><TableHead>Status</TableHead></TableRow>
            </DocTableHeader>
            <TableBody>
              {players.slice(0, 10).map((p, i) => (
                <TableRow key={p.player_id}>
                  <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                  <TableCell>{p.country}</TableCell>
                  <TableCell>{p.channel}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-brand-bg text-brand border-brand/20">
                      {p.vip_tier ? p.vip_tier.charAt(0).toUpperCase() + p.vip_tier.slice(1) : '—'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">€{fmt(p.player_ggr)}</TableCell>
                  <TableCell>€{fmt(p.total_deposits)}</TableCell>
                  <TableCell>€{fmt(p.total_bets)}</TableCell>
                  <TableCell>{p.session_count}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={p.status === 'active' ? 'bg-success-bg text-success border-success-border' : 'bg-brand-bg text-brand border-brand/20'}
                    >
                      {p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : '—'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DocTable>
        </DocBlock>

      </DocSection>

      {/* 05 Retention */}
      <DocSection num="05" title="Retention Cohorts">

        <DocBlock title="D1 / D7 / D30 retention by registration cohort" subtitle="% of players who placed a bet within 1 / 7 / 30 days of registration">
          <DocTable>
            <DocTableHeader>
              <TableRow><TableHead>Cohort</TableHead><TableHead>Size</TableHead><TableHead>D1</TableHead><TableHead>D1 %</TableHead><TableHead>D7</TableHead><TableHead>D7 %</TableHead><TableHead>D30</TableHead><TableHead>D30 %</TableHead></TableRow>
            </DocTableHeader>
            <TableBody>
              {cohorts.map(r => (
                <TableRow key={r.cohort}>
                  <TableCell className="font-semibold">{r.cohort}</TableCell>
                  <TableCell>{r.cohort_size}</TableCell>
                  <TableCell>{r.d1}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={retentionBadgeClass(Number(r.d1_pct))}>{r.d1_pct}%</Badge>
                  </TableCell>
                  <TableCell>{r.d7}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={retentionBadgeClass(Number(r.d7_pct))}>{r.d7_pct}%</Badge>
                  </TableCell>
                  <TableCell>{r.d30}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={retentionBadgeClass(Number(r.d30_pct))}>{r.d30_pct}%</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DocTable>
        </DocBlock>

        <DocBlock title="D7 & D30 retention trend">
          <Card>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
              <ChartContainer config={retentionChartConfig} className="h-[220px] w-full">
                <AreaChart
                  data={cohorts.map(r => ({ cohort: r.cohort, d7: Number(r.d7_pct), d30: Number(r.d30_pct) }))}
                  margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                >
                  <defs>
                    <AreaGradientDef id="d7Grad"  colorVar="var(--color-d7)"  />
                    <AreaGradientDef id="d30Grad" colorVar="var(--color-d30)" />
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="cohort" tickLine={false} axisLine={false} tickMargin={8} interval="preserveStartEnd" />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} domain={[0, 110]} ticks={[0, 25, 50, 75, 100]} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel={false} indicator="dot" />}
                  />
                  <Area {...areaDefaults} dataKey="d7"  stroke="var(--color-d7)"  fill="url(#d7Grad)"  />
                  <Area {...areaDefaults} dataKey="d30" stroke="var(--color-d30)" fill="url(#d30Grad)" />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </DocBlock>

      </DocSection>

      {/* 06 RFM */}
      <DocSection num="06" title="RFM Segmentation">

        <DocBlock title="Segments by player count & avg GGR" subtitle="R = days since last bet | F = betting days | M = GGR | scores 1–5">
          <Card className="mb-2">
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
              <ChartContainer config={rfmSegChartConfig} className="h-[200px] w-full">
                <BarChart data={rfmSummary} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="segment" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        hideLabel={false}
                        indicator="dot"
                        formatter={(value, name, item) => (
                          <>
                            <div className="size-2.5 shrink-0 rounded-[2px]" style={{ background: item.color }} />
                            <span className="text-muted-foreground">{name === 'avg_ggr' ? 'Avg GGR' : 'Players'}</span>
                            <span className="ml-auto font-mono font-medium tabular-nums text-foreground">
                              {name === 'avg_ggr' ? `€${value}` : value}
                            </span>
                          </>
                        )}
                      />
                    }
                  />
                  <Bar dataKey="count"   fill="var(--color-count)"   radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avg_ggr" fill="var(--color-avg_ggr)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </DocBlock>

        <DocBlock title="Player detail by segment">
          <DocTable>
            <DocTableHeader>
              <TableRow><TableHead>Segment</TableHead><TableHead>Country</TableHead><TableHead>Channel</TableHead><TableHead>Tier</TableHead><TableHead>Recency</TableHead><TableHead>Frequency</TableHead><TableHead>GGR</TableHead><TableHead>R</TableHead><TableHead>F</TableHead><TableHead>M</TableHead></TableRow>
            </DocTableHeader>
            <TableBody>
              {rfm.map((r, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Badge variant="outline" className={cn(RFM_SEG_CLASS[r.segment] ?? 'bg-subtle text-muted-foreground border-subtle-border')}>
                      {r.segment}
                    </Badge>
                  </TableCell>
                  <TableCell>{r.country}</TableCell>
                  <TableCell>{r.channel}</TableCell>
                  <TableCell>{r.vip_tier ? r.vip_tier.charAt(0).toUpperCase() + r.vip_tier.slice(1) : '—'}</TableCell>
                  <TableCell>{r.recency_days}d ago</TableCell>
                  <TableCell>{r.frequency} days</TableCell>
                  <TableCell className="font-semibold">€{fmt(r.monetary)}</TableCell>
                  <TableCell className={scoreClass(r.r_score)}>{r.r_score}</TableCell>
                  <TableCell className={scoreClass(r.f_score)}>{r.f_score}</TableCell>
                  <TableCell className={scoreClass(r.m_score)}>{r.m_score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DocTable>

          <div className="mt-4 rounded-xl border border-border bg-subtle px-4 py-3 text-xs text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">RFM scoring thresholds</p>
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-3">
              <div>
                <span className="font-medium text-foreground">R -- Recency</span> (days since last bet)
                <div className="mt-1 space-y-0.5">
                  <div><span className="font-mono text-success font-medium">5</span> -- ≤ 14 days</div>
                  <div><span className="font-mono text-success font-medium">4</span> -- 15–30 days</div>
                  <div><span className="font-mono text-warning font-medium">3</span> -- 31–60 days</div>
                  <div><span className="font-mono text-warning font-medium">2</span> -- 61–90 days</div>
                  <div><span className="font-mono text-destructive font-medium">1</span> -- &gt; 90 days</div>
                </div>
              </div>
              <div>
                <span className="font-medium text-foreground">F -- Frequency</span> (unique betting days)
                <div className="mt-1 space-y-0.5">
                  <div><span className="font-mono text-success font-medium">5</span> -- ≥ 5 days</div>
                  <div><span className="font-mono text-success font-medium">4</span> -- 4 days</div>
                  <div><span className="font-mono text-warning font-medium">3</span> -- 3 days</div>
                  <div><span className="font-mono text-warning font-medium">2</span> -- 2 days</div>
                  <div><span className="font-mono text-destructive font-medium">1</span> -- 1 day</div>
                </div>
              </div>
              <div>
                <span className="font-medium text-foreground">M -- Monetary</span> (player GGR)
                <div className="mt-1 space-y-0.5">
                  <div><span className="font-mono text-success font-medium">5</span> -- ≥ €200</div>
                  <div><span className="font-mono text-success font-medium">4</span> -- €100–199</div>
                  <div><span className="font-mono text-warning font-medium">3</span> -- €50–99</div>
                  <div><span className="font-mono text-warning font-medium">2</span> -- €20–49</div>
                  <div><span className="font-mono text-destructive font-medium">1</span> -- &lt; €20</div>
                </div>
              </div>
            </div>
            <p className="pt-1 border-t border-border">
              <span className="font-medium text-foreground">Segments: </span>
              Champions (R≥4, F≥4, M≥4) · Loyal (R≥3, F≥3, M≥3) · New Players (R≥4, F≤2) · At Risk (R≤2, F≥3) · Lost (R≤2, F≤2) · Promising (все остальные)
            </p>
          </div>
        </DocBlock>

      </DocSection>

    </DocLayout>
  )
}
