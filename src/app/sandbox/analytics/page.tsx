'use client'

import { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { DocLayout }  from '@/components/doc/DocLayout'
import { DocSection } from '@/components/doc/DocSection'
import { DocBlock }   from '@/components/doc/DocBlock'
import { Callout }    from '@/components/doc/Callout'
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

const COLORS = ['var(--color-chart-1)', 'var(--color-chart-3)', 'var(--color-chart-2)', 'var(--color-chart-5)', 'var(--color-chart-4)']

// ── Shared chart primitives ────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label, renderValue }: {
  active?: boolean
  payload?: Array<{ dataKey: string; name?: string; value: number; color?: string; fill?: string }>
  label?: string
  renderValue: (p: { dataKey: string; name?: string; value: number; color?: string; fill?: string }) => string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="flex flex-col gap-0.5 px-3 py-2 border border-border rounded-lg bg-card shadow-sm text-xs">
      <span className="text-muted-foreground">{label}</span>
      {payload.map((p, i) => (
        <span key={i} className="font-bold" style={{ color: p.color ?? p.fill }}>
          {renderValue(p)}
        </span>
      ))}
    </div>
  )
}

function ChartLegend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-4 px-2 pt-2">
      {items.map(item => (
        <span key={item.label} className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <span className="inline-block w-5 h-0.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  )
}

// ── Retention percentage badge ─────────────────────────────────────────────────

function retentionClass(pct: number): string {
  if (pct >= 50) return 'bg-success-bg text-success'
  if (pct > 0)   return 'bg-warning-bg text-warning'
  return 'bg-subtle text-muted-foreground'
}

// ── RFM segment badge ──────────────────────────────────────────────────────────

const RFM_SEG_CLASS: Record<string, string> = {
  'Champions':    'bg-brand-bg text-brand',
  'Loyal':        'bg-success-bg text-success',
  'Promising':    'bg-info-bg text-info',
  'New Players':  'bg-success-bg text-success',
  'At Risk':      'bg-warning-bg text-warning',
  'Lost':         'bg-destructive-bg text-destructive',
}

function scoreClass(s: number): string {
  if (s >= 4) return 'text-success font-medium'
  if (s <= 2) return 'text-destructive font-medium'
  return 'text-warning font-medium'
}

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
  const [ltv,         setLtv]         = useState<any[]>([])
  const [ltvCurve,    setLtvCurve]    = useState<any>({ data: [], cohorts: [] })

  useEffect(() => {
    async function load() {
      const [m, cat, prov, pl, games, tx, coh, rfmData, ltvData, ltvCurveData] = await Promise.all([
        supabase.from('v_revenue_monthly').select('*'),
        supabase.from('v_revenue_by_category').select('*'),
        supabase.from('v_revenue_by_provider').select('*'),
        supabase.from('v_player_summary').select('*').order('player_ggr', { ascending: false }),
        supabase.from('v_top_games').select('*').limit(8),
        supabase.from('v_transactions_monthly').select('*'),
        supabase.from('v_retention_cohorts').select('*'),
        supabase.from('v_rfm_segments').select('*').order('monetary', { ascending: false }),
        supabase.from('v_ltv_cohorts').select('*'),
        supabase.from('v_ltv_curve').select('*'),
      ])

      setMonthly((m.data || []).map(r => ({ ...r, month: fmtMonth(r.month), raw_date: r.month })))
      setByCategory(cat.data || [])
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

      setLtv(ltvData.data || [])

      const curveRaw = ltvCurveData.data || []
      const cohortNames = [...new Set(curveRaw.map((r: any) => r.cohort))]
      const allWeeks = [...new Set(curveRaw.map((r: any) => r.week_day))].sort((a: any, b: any) => a - b)
      const curveData = allWeeks.map(week => {
        const point: Record<string, any> = { week: `W${Math.round((week as number) / 7)}` }
        cohortNames.forEach(c => {
          const row = curveRaw.find((r: any) => r.cohort === c && r.week_day === week)
          point[c as string] = row ? Number(row.cumulative_arpu) : null
        })
        return point
      })
      setLtvCurve({ data: curveData, cohorts: cohortNames })

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
  const segmentData = Object.entries(segmentCount).map(([name, value]) => ({ name, value }))

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
          { value: `€${fmt(filteredTotalGGR)}`,      label: 'Total GGR',          note: 'bets − wins'    },
          { value: `€${fmt(filteredTotalBets)}`,      label: 'Total Bets Volume',  note: 'gross wagered'  },
          { value: `€${fmt(filteredTotalDeposits)}`,  label: 'Total Deposits',     note: 'all currencies' },
          { value: String(activePlayers),             label: 'Active Players',     note: 'status = active'},
        ].map(item => (
          <Card key={item.label} className="flex flex-col gap-1 p-5">
            <span className="text-2xl font-bold tracking-tight text-foreground">{item.value}</span>
            <span className="text-xs font-semibold text-foreground">{item.label}</span>
            <span className="text-xs text-muted-foreground">{item.note}</span>
          </Card>
        ))}
      </div>

      {/* 01 Revenue */}
      <DocSection num="01" title="Revenue Overview">

        <DocBlock title="GGR & NGR by month" subtitle="GGR = bets − wins | NGR = GGR − bonuses issued">
          <div className="border border-border rounded-xl p-4 bg-card mb-2">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={filteredMonthly} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="ggrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--color-chart-1)" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ngrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--color-chart-2)" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`} />
                <Tooltip content={<ChartTooltip renderValue={p => `${p.name ?? p.dataKey}: €${fmt(p.value)}`} />} />
                <Area type="monotone" dataKey="ggr" name="GGR" stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#ggrGrad)" dot={false} />
                <Area type="monotone" dataKey="ngr" name="NGR" stroke="var(--color-chart-2)" strokeWidth={2} fill="url(#ngrGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <ChartLegend items={[{ color: 'var(--color-chart-1)', label: 'GGR' }, { color: 'var(--color-chart-2)', label: 'NGR' }]} />
          </div>
        </DocBlock>

        <DocBlock title="GGR by game category">
          <div className="border border-border rounded-xl p-4 bg-card mb-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byCategory} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="game_category" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`} />
                <Tooltip content={<ChartTooltip renderValue={p => `GGR: €${fmt(p.value)}`} />} />
                <Bar dataKey="ggr" radius={[4,4,0,0]}>
                  {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <DocTable className="mt-4">
            <DocTableHeader>
              <TableRow><TableHead>Category</TableHead><TableHead>GGR</TableHead><TableHead>Total bets</TableHead><TableHead>Hold %</TableHead><TableHead>Players</TableHead></TableRow>
            </DocTableHeader>
            <TableBody>
              {byCategory.map(r => (
                <TableRow key={r.game_category}>
                  <TableCell className="font-semibold">{r.game_category}</TableCell>
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
          <div className="border border-border rounded-xl p-4 bg-card mb-2">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={filteredTxChart} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`} />
                <Tooltip formatter={(v: string | number) => [`€${fmt(v)}`]} />
                <Bar dataKey="deposits"    name="Deposits"    fill="var(--color-chart-1)" radius={[4,4,0,0]} />
                <Bar dataKey="withdrawals" name="Withdrawals" fill="var(--color-chart-3)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            <ChartLegend items={[{ color: 'var(--color-chart-1)', label: 'Deposits' }, { color: 'var(--color-chart-3)', label: 'Withdrawals' }]} />
          </div>
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
                  <TableCell>{r.game_category}</TableCell>
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
          <div className="border border-border rounded-xl p-4 bg-card mb-2">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={segmentData} layout="vertical" margin={{ top: 4, right: 32, left: 16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} width={64} />
                <Tooltip formatter={(v: string | number) => [v, 'players']} />
                <Bar dataKey="value" radius={[0,4,4,0]}>
                  {segmentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
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
                    <Badge variant="outline" className="bg-brand-bg text-brand border-brand/20 text-xs">
                      {p.vip_tier}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">€{fmt(p.player_ggr)}</TableCell>
                  <TableCell>€{fmt(p.total_deposits)}</TableCell>
                  <TableCell>€{fmt(p.total_bets)}</TableCell>
                  <TableCell>{p.session_count}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={p.status === 'active' ? 'bg-success-bg text-success border-success-border text-xs' : 'bg-brand-bg text-brand border-brand/20 text-xs'}
                    >
                      {p.status}
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
                  <TableCell><span className={cn('inline-block px-2 py-0.5 rounded-full text-xs', retentionClass(Number(r.d1_pct)))}>{r.d1_pct}%</span></TableCell>
                  <TableCell>{r.d7}</TableCell>
                  <TableCell><span className={cn('inline-block px-2 py-0.5 rounded-full text-xs', retentionClass(Number(r.d7_pct)))}>{r.d7_pct}%</span></TableCell>
                  <TableCell>{r.d30}</TableCell>
                  <TableCell><span className={cn('inline-block px-2 py-0.5 rounded-full text-xs', retentionClass(Number(r.d30_pct)))}>{r.d30_pct}%</span></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DocTable>
        </DocBlock>

        <DocBlock title="D7 & D30 retention trend">
          <div className="border border-border rounded-xl p-4 bg-card mb-2">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={cohorts.map(r => ({ cohort: r.cohort, d7: Number(r.d7_pct), d30: Number(r.d30_pct) }))}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="d7Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--color-chart-1)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="d30Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--color-chart-2)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="cohort" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[0, 100]} />
                <Tooltip formatter={(v: string | number) => [`${v}%`]} />
                <Area type="monotone" dataKey="d7"  name="D7"  stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#d7Grad)"  dot={false} />
                <Area type="monotone" dataKey="d30" name="D30" stroke="var(--color-chart-2)" strokeWidth={2} fill="url(#d30Grad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <ChartLegend items={[{ color: 'var(--color-chart-1)', label: 'D7 retention' }, { color: 'var(--color-chart-2)', label: 'D30 retention' }]} />
          </div>
        </DocBlock>

      </DocSection>

      {/* 06 RFM */}
      <DocSection num="06" title="RFM Segmentation">

        <DocBlock title="Segments by player count & avg GGR" subtitle="R = days since last bet | F = betting days | M = GGR | scores 1–5">
          <div className="border border-border rounded-xl p-4 bg-card mb-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={rfmSummary} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="segment" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    return (
                      <div className="flex flex-col gap-0.5 px-3 py-2 border border-border rounded-lg bg-card shadow-sm text-xs">
                        <span className="text-muted-foreground">{label}</span>
                        {payload.map(p => (
                          <span key={p.dataKey as string} className="font-bold" style={{ color: p.fill as string }}>
                            {p.dataKey === 'count'   && `Players: ${p.value}`}
                            {p.dataKey === 'avg_ggr' && `Avg GGR: €${p.value}`}
                          </span>
                        ))}
                      </div>
                    )
                  }}
                />
                <Bar dataKey="count"   name="Players" fill="var(--color-chart-1)" radius={[4,4,0,0]} />
                <Bar dataKey="avg_ggr" name="Avg GGR" fill="var(--color-chart-2)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            <ChartLegend items={[{ color: 'var(--color-chart-1)', label: 'Players count' }, { color: 'var(--color-chart-2)', label: 'Avg GGR (€)' }]} />
          </div>
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
                    <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium', RFM_SEG_CLASS[r.segment] ?? 'bg-subtle text-muted-foreground')}>
                      {r.segment}
                    </span>
                  </TableCell>
                  <TableCell>{r.country}</TableCell>
                  <TableCell>{r.channel}</TableCell>
                  <TableCell>{r.vip_tier}</TableCell>
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
        </DocBlock>

      </DocSection>

      {/* 07 LTV */}
      <DocSection num="07" title="LTV Curves by Cohort">

        <DocBlock title="Cumulative ARPU over time" subtitle="Each line = one registration cohort | X = weeks since sign-up | Y = cumulative GGR per player | longer line = older cohort">
          <div className="border border-border rounded-xl p-4 bg-card mb-2">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={ltvCurve.data || []} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  {(ltvCurve.cohorts as string[]).map((c, i) => (
                    <linearGradient key={c} id={`ltv${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={COLORS[i % COLORS.length]} stopOpacity={0.12} />
                      <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    return (
                      <div className="flex flex-col gap-0.5 px-3 py-2 border border-border rounded-lg bg-card shadow-sm text-xs">
                        <span className="text-muted-foreground">{label}</span>
                        {payload.filter(p => p.value != null).map(p => (
                          <span key={p.dataKey as string} className="font-bold" style={{ color: p.color }}>
                            {p.dataKey}: €{fmt(p.value as number)}
                          </span>
                        ))}
                      </div>
                    )
                  }}
                />
                {(ltvCurve.cohorts as string[]).map((c, i) => (
                  <Area key={c} type="monotone" dataKey={c} name={c} stroke={COLORS[i % COLORS.length]} strokeWidth={2} fill={`url(#ltv${i})`} dot={false} connectNulls={false} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
            <ChartLegend items={(ltvCurve.cohorts as string[]).map((c, i) => ({ color: COLORS[i % COLORS.length], label: c }))} />
          </div>
          <Callout variant="primary" title="How to read this chart">
            steeper slope = faster monetisation | flat line = player stopped playing | gap between cohorts = acquisition quality difference
          </Callout>
        </DocBlock>

        <DocBlock title="Cohort summary">
          <DocTable>
            <DocTableHeader>
              <TableRow><TableHead>Cohort</TableHead><TableHead>Players</TableHead><TableHead>Total GGR</TableHead><TableHead>ARPU (lifetime)</TableHead><TableHead>ARPU D30</TableHead><TableHead>ARPU D90</TableHead><TableHead>Predicted LTV</TableHead></TableRow>
            </DocTableHeader>
            <TableBody>
              {ltv.map(r => {
                const predictedLtv = Math.round(Number(r.arpu || 0) * 1.8)
                return (
                  <TableRow key={r.cohort}>
                    <TableCell className="font-semibold">{r.cohort}</TableCell>
                    <TableCell>{r.cohort_size}</TableCell>
                    <TableCell>€{fmt(r.total_ggr)}</TableCell>
                    <TableCell>€{fmt(r.arpu)}</TableCell>
                    <TableCell>€{fmt(r.arpu_d30 || 0)}</TableCell>
                    <TableCell>€{fmt(r.arpu_d90 || 0)}</TableCell>
                    <TableCell>
                      <span className="inline-block rounded-full bg-brand-bg px-2 py-0.5 text-xs font-medium text-brand">
                        €{fmt(predictedLtv)}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </DocTable>
          <p className="text-xs text-muted-foreground mt-2">
            Predicted LTV = lifetime ARPU × 1.8 | simplified model | replace with regression in production
          </p>
        </DocBlock>

      </DocSection>

    </DocLayout>
  )
}
