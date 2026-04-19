'use client'

// Allow CSS custom properties (e.g. --c) in style objects
declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined
  }
}

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';

function fmt(n: string | number | null | undefined) {
  if (n == null) return '—';
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function fmtMonth(iso: string | null | undefined) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function getDateFilter(range: string) {
  const now = new Date();
  if (range === '30d') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  if (range === '90d') return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
  return null;
}

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#f43f5e', '#3b82f6'];

interface TooltipPayloadItem {
  dataKey: string
  name: string
  value: number
  color: string
}

function RevenueTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadItem[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="stm-tooltip">
      <span className="stm-tooltip__label">{label}</span>
      {payload.map((p) => (
        <span key={p.dataKey} className="stm-tooltip__value" style={{ color: p.color }}>
          {p.name}: €{fmt(p.value)}
        </span>
      ))}
    </div>
  );
}

function BarTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadItem[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="stm-tooltip">
      <span className="stm-tooltip__label">{label}</span>
      <span className="stm-tooltip__value">GGR: €{fmt(payload[0]?.value)}</span>
    </div>
  );
}

export default function AnalyticsPage() {
  const [monthly, setMonthly]       = useState<any[]>([]);
  const [byCategory, setByCategory] = useState<any[]>([]);
  const [byProvider, setByProvider] = useState<any[]>([]);
  const [players, setPlayers]       = useState<any[]>([]);
  const [topGames, setTopGames]     = useState<any[]>([]);
  const [txMonthly, setTxMonthly]   = useState<any[]>([]);
  const [cohorts, setCohorts]       = useState<any[]>([]);
  const [rfm, setRfm]               = useState<any[]>([]);
  const [rfmSummary, setRfmSummary] = useState<any[]>([]);
  const [dateRange, setDateRange]   = useState('all');
  const [loading, setLoading]       = useState(true);
  const [ltv, setLtv] = useState<any[]>([]);
  const [ltvCurve, setLtvCurve] = useState<any>({ data: [], cohorts: [] });

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
      ]);

      setMonthly(
        (m.data || []).map((r) => ({ ...r, month: fmtMonth(r.month), raw_date: r.month }))
      );
      setByCategory(cat.data || []);
      setByProvider(prov.data || []);
      setPlayers(pl.data || []);
      setTopGames(games.data || []);
      setTxMonthly(
        (tx.data || []).map((r) => ({ ...r, month: fmtMonth(r.month) }))
      );
      setCohorts(coh.data || []);

      const rfmRows = rfmData.data || [];
      setRfm(rfmRows);

      const summary: Record<string, { segment: string; count: number; total: number; paying: number }> = {};
      rfmRows.forEach((r) => {
        if (!summary[r.segment]) {
          summary[r.segment] = { segment: r.segment, count: 0, total: 0, paying: 0 };
        }
        summary[r.segment].count  += 1;
        summary[r.segment].total  += Number(r.monetary);
        summary[r.segment].paying += Number(r.deposit_count) > 0 ? 1 : 0;
      });
      setRfmSummary(
        Object.values(summary)
          .map((s) => ({
            ...s,
            avg_ggr: Math.round(s.total / s.count),
            arppu:   s.paying > 0 ? Math.round(s.total / s.paying) : 0,
          }))
          .sort((a, b) => b.avg_ggr - a.avg_ggr)
      );
      
      setLtv(ltvData.data || []);

      // трансформируем для LineChart — каждая когорта как отдельная series
const curveRaw = ltvCurveData.data || [];
const cohortNames = [...new Set(curveRaw.map(r => r.cohort))];
// строим массив точек по week_day
const allWeeks = [...new Set(curveRaw.map(r => r.week_day))].sort((a,b) => a - b);
const curveData = allWeeks.map(week => {
  const point: Record<string, string | number | null> = { week: `W${Math.round(week/7)}` };
  cohortNames.forEach(c => {
    const row = curveRaw.find(r => r.cohort === c && r.week_day === week);
    point[c] = row ? Number(row.cumulative_arpu) : null;
  });
  return point;
});
setLtvCurve({ data: curveData, cohorts: cohortNames });
      

      setLoading(false);
      
    }
    load();
  }, []);

  // txChart
  type TxMonth = { month: string; deposits: number; withdrawals: number }
  const txMapSorted: Record<string, TxMonth> = {};
  txMonthly.forEach((r) => {
    if (!txMapSorted[r.month]) txMapSorted[r.month] = { month: r.month, deposits: 0, withdrawals: 0 };
    if (r.type === 'deposit')    txMapSorted[r.month].deposits    = Number(r.total_amount);
    if (r.type === 'withdrawal') txMapSorted[r.month].withdrawals = Number(r.total_amount);
  });
  const MONTH_ORDER = ['Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'];
  const sortByMonth = (a: TxMonth, b: TxMonth) => {
    const [am, ay] = a.month.split(' ');
    const [bm, by] = b.month.split(' ');
    return ay !== by ? Number(ay) - Number(by) : MONTH_ORDER.indexOf(am) - MONTH_ORDER.indexOf(bm);
  };
  const txChart = Object.values(txMapSorted).sort(sortByMonth);

  // filters
  const since = getDateFilter(dateRange);

  const filteredMonthly = since
    ? monthly.filter((r) => new Date(r.raw_date) >= new Date(since))
    : monthly;

  const filteredTxChart = since
    ? (() => {
        const sinceDate = new Date(since);
        const filtered = txMonthly.filter((r) => {
          const match = monthly.find((m) => m.month === r.month);
          return match ? new Date(match.raw_date) >= sinceDate : true;
        });
        const map: Record<string, TxMonth> = {};
        filtered.forEach((r) => {
          if (!map[r.month]) map[r.month] = { month: r.month, deposits: 0, withdrawals: 0 };
          if (r.type === 'deposit')    map[r.month].deposits    = Number(r.total_amount);
          if (r.type === 'withdrawal') map[r.month].withdrawals = Number(r.total_amount);
        });
        return Object.values(map).sort(sortByMonth);
      })()
    : txChart;

  const filteredTotalGGR      = filteredMonthly.reduce((s, r) => s + Number(r.ggr), 0);
  const filteredTotalBets     = filteredMonthly.reduce((s, r) => s + Number(r.total_bets), 0);
  const filteredTotalDeposits = filteredTxChart.reduce((s, r) => s + Number(r.deposits || 0), 0);
  const activePlayers         = players.filter((p) => p.status === 'active').length;

  const segmentCount = players.reduce<Record<string, number>>((acc, p) => {
    const tier = p.vip_tier || 'standard';
    acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {});
  const segmentData = Object.entries(segmentCount).map(([name, value]) => ({ name, value }));

  if (loading) {
    return (
      <div className="doc-page">
        <div className="container">
          <p style={{ color: '#6b7280', padding: '4rem 0' }}>Loading analytics…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="doc-page">
      <div className="container">

        <nav className="doc-breadcrumb" aria-label="Breadcrumb">
          <Link href="/sandbox" className="doc-breadcrumb__link">Sandbox</Link>
          <span className="doc-breadcrumb__sep">/</span>
          <span className="doc-breadcrumb__current">Analytics Dashboard · iGaming</span>
        </nav>

        <div className="doc-hero">
          <h1 className="doc-hero__title">Analytics Dashboard · iGaming</h1>
          <div className="doc-hero__tags">
            <span className="sandbox-card__status">Live Data</span>
            <span className="sandbox-card__tag">Supabase</span>
            <span className="sandbox-card__tag">iGaming Backoffice</span>
            <span className="sandbox-card__tag">Concept</span>
          </div>
          <p className="doc-hero__description">
            Operator analytics prototype — revenue, player activity, game performance and deposits pulled live from Supabase · Mock dataset · By Yevhenii Holovei
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', margin: '0 0 1.5rem', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'All time' },
            { key: '90d', label: 'Last 90 days' },
            { key: '30d', label: 'Last 30 days' },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setDateRange(opt.key)}
              className={dateRange === opt.key ? 'stm-range-tab stm-range-tab--active' : 'stm-range-tab'}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="doc-kpi-row">
          <div className="doc-kpi">
            <span className="doc-kpi__value">€{fmt(filteredTotalGGR)}</span>
            <span className="doc-kpi__label">Total GGR</span>
            <span className="doc-kpi__note">bets − wins</span>
          </div>
          <div className="doc-kpi">
            <span className="doc-kpi__value">€{fmt(filteredTotalBets)}</span>
            <span className="doc-kpi__label">Total Bets Volume</span>
            <span className="doc-kpi__note">gross wagered</span>
          </div>
          <div className="doc-kpi">
            <span className="doc-kpi__value">€{fmt(filteredTotalDeposits)}</span>
            <span className="doc-kpi__label">Total Deposits</span>
            <span className="doc-kpi__note">all currencies</span>
          </div>
          <div className="doc-kpi">
            <span className="doc-kpi__value">{activePlayers}</span>
            <span className="doc-kpi__label">Active Players</span>
            <span className="doc-kpi__note">status = active</span>
          </div>
        </div>

        {/* 01 Revenue */}
        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">01</span>
            <h2 className="doc-section__title">Revenue Overview</h2>
          </div>
          <div className="doc-block">
            <h3 className="doc-block__title">GGR &amp; NGR by month</h3>
            <p className="doc-block__subtitle">GGR = bets − wins · NGR = GGR − bonuses issued</p>
            <div className="stm-chart-wrap">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={filteredMonthly} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ggrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ngrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${v}`} />
                  <Tooltip content={<RevenueTooltip />} />
                  <Area type="monotone" dataKey="ggr" name="GGR" stroke="#6366f1" strokeWidth={2} fill="url(#ggrGrad)" dot={false} />
                  <Area type="monotone" dataKey="ngr" name="NGR" stroke="#10b981" strokeWidth={2} fill="url(#ngrGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="stm-legend">
                <span className="stm-legend__item" style={{ '--c': '#6366f1' }}>GGR</span>
                <span className="stm-legend__item" style={{ '--c': '#10b981' }}>NGR</span>
              </div>
            </div>
          </div>
          <div className="doc-block">
            <h3 className="doc-block__title">GGR by game category</h3>
            <div className="stm-chart-wrap">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={byCategory} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="game_category" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${v}`} />
                  <Tooltip content={<BarTooltip />} />
                  <Bar dataKey="ggr" radius={[4,4,0,0]}>
                    {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="doc-table-wrap" style={{ marginTop: '1rem' }}>
              <table className="doc-table">
                <thead>
                  <tr><th>Category</th><th>GGR</th><th>Total bets</th><th>Hold %</th><th>Players</th></tr>
                </thead>
                <tbody>
                  {byCategory.map((r) => (
                    <tr key={r.game_category}>
                      <td><strong>{r.game_category}</strong></td>
                      <td>€{fmt(r.ggr)}</td>
                      <td>€{fmt(r.total_bets)}</td>
                      <td>{fmt(r.hold_pct)}%</td>
                      <td>{r.players}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="doc-block">
            <h3 className="doc-block__title">GGR by provider</h3>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr><th>Provider</th><th>GGR</th><th>Bets</th><th>Rounds</th><th>Hold %</th></tr>
                </thead>
                <tbody>
                  {byProvider.map((r) => (
                    <tr key={r.provider}>
                      <td><strong>{r.provider}</strong></td>
                      <td>€{fmt(r.ggr)}</td>
                      <td>€{fmt(r.total_bets)}</td>
                      <td>{r.bet_count}</td>
                      <td>{fmt(r.hold_pct)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 02 Deposits */}
        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">02</span>
            <h2 className="doc-section__title">Deposits &amp; Withdrawals</h2>
          </div>
          <div className="doc-block">
            <h3 className="doc-block__title">Volume by month</h3>
            <p className="doc-block__subtitle">Deposits vs withdrawals · all payment methods</p>
            <div className="stm-chart-wrap">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={filteredTxChart} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${v}`} />
                  <Tooltip formatter={(v: string | number) => [`€${fmt(v)}`]} />
                  <Bar dataKey="deposits"    name="Deposits"    fill="#6366f1" radius={[4,4,0,0]} />
                  <Bar dataKey="withdrawals" name="Withdrawals" fill="#f59e0b" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="stm-legend">
                <span className="stm-legend__item" style={{ '--c': '#6366f1' }}>Deposits</span>
                <span className="stm-legend__item" style={{ '--c': '#f59e0b' }}>Withdrawals</span>
              </div>
            </div>
          </div>
        </section>

        {/* 03 Games */}
        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">03</span>
            <h2 className="doc-section__title">Game Performance</h2>
          </div>
          <div className="doc-block">
            <h3 className="doc-block__title">Top games by GGR</h3>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr><th>Game</th><th>Category</th><th>Provider</th><th>GGR</th><th>Rounds</th><th>Players</th><th>Hold %</th></tr>
                </thead>
                <tbody>
                  {topGames.map((r) => (
                    <tr key={r.game_id}>
                      <td><strong>{r.game_id}</strong></td>
                      <td>{r.game_category}</td>
                      <td>{r.provider}</td>
                      <td>€{fmt(r.ggr)}</td>
                      <td>{r.rounds_played}</td>
                      <td>{r.unique_players}</td>
                      <td>{fmt(r.hold_pct)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 04 Players */}
        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">04</span>
            <h2 className="doc-section__title">Player Overview</h2>
          </div>
          <div className="doc-block">
            <h3 className="doc-block__title">Players by VIP tier</h3>
            <div className="stm-chart-wrap">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={segmentData} layout="vertical" margin={{ top: 4, right: 32, left: 16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={64} />
                  <Tooltip formatter={(v: string | number) => [v, 'players']} />
                  <Bar dataKey="value" radius={[0,4,4,0]}>
                    {segmentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="doc-block">
            <h3 className="doc-block__title">Top players by GGR</h3>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr><th>#</th><th>Country</th><th>Channel</th><th>Tier</th><th>GGR</th><th>Deposits</th><th>Bets</th><th>Sessions</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {players.slice(0, 10).map((p, i) => (
                    <tr key={p.player_id}>
                      <td style={{ color: '#9ca3af', fontSize: '12px' }}>{i + 1}</td>
                      <td>{p.country}</td>
                      <td>{p.channel}</td>
                      <td><span className="sandbox-card__tag">{p.vip_tier}</span></td>
                      <td><strong>€{fmt(p.player_ggr)}</strong></td>
                      <td>€{fmt(p.total_deposits)}</td>
                      <td>€{fmt(p.total_bets)}</td>
                      <td>{p.session_count}</td>
                      <td>
                        <span className={p.status === 'active' ? 'sandbox-card__status' : 'sandbox-card__tag'}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 05 Retention */}
        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">05</span>
            <h2 className="doc-section__title">Retention Cohorts</h2>
          </div>
          <div className="doc-block">
            <h3 className="doc-block__title">D1 / D7 / D30 retention by registration cohort</h3>
            <p className="doc-block__subtitle">% of players who placed a bet within 1 / 7 / 30 days of registration</p>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr><th>Cohort</th><th>Size</th><th>D1</th><th>D1 %</th><th>D7</th><th>D7 %</th><th>D30</th><th>D30 %</th></tr>
                </thead>
                <tbody>
                  {cohorts.map((r) => {
                    const badge = (pct: string | number) => ({
                      display: 'inline-block', padding: '2px 8px', borderRadius: '20px', fontSize: '12px',
                      background: Number(pct) >= 50 ? '#EAF3DE' : Number(pct) > 0 ? '#FAEEDA' : '#F1EFE8',
                      color:      Number(pct) >= 50 ? '#27500A' : Number(pct) > 0 ? '#633806' : '#5F5E5A',
                    });
                    return (
                      <tr key={r.cohort}>
                        <td><strong>{r.cohort}</strong></td>
                        <td>{r.cohort_size}</td>
                        <td>{r.d1}</td>
                        <td><span style={badge(r.d1_pct)}>{r.d1_pct}%</span></td>
                        <td>{r.d7}</td>
                        <td><span style={badge(r.d7_pct)}>{r.d7_pct}%</span></td>
                        <td>{r.d30}</td>
                        <td><span style={badge(r.d30_pct)}>{r.d30_pct}%</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="doc-block">
            <h3 className="doc-block__title">D7 &amp; D30 retention trend</h3>
            <div className="stm-chart-wrap">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart
                  data={cohorts.map((r) => ({ cohort: r.cohort, d7: Number(r.d7_pct), d30: Number(r.d30_pct) }))}
                  margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="d7Grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="d30Grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="cohort" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                  <Tooltip formatter={(v: string | number) => [`${v}%`]} />
                  <Area type="monotone" dataKey="d7"  name="D7"  stroke="#6366f1" strokeWidth={2} fill="url(#d7Grad)"  dot={false} />
                  <Area type="monotone" dataKey="d30" name="D30" stroke="#10b981" strokeWidth={2} fill="url(#d30Grad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="stm-legend">
                <span className="stm-legend__item" style={{ '--c': '#6366f1' }}>D7 retention</span>
                <span className="stm-legend__item" style={{ '--c': '#10b981' }}>D30 retention</span>
              </div>
            </div>
          </div>
        </section>

        {/* 06 RFM */}
        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">06</span>
            <h2 className="doc-section__title">RFM Segmentation</h2>
          </div>
          <div className="doc-block">
            <h3 className="doc-block__title">Segments by player count &amp; avg GGR</h3>
            <p className="doc-block__subtitle">R = days since last bet · F = betting days · M = GGR · scores 1–5</p>
            <div className="stm-chart-wrap">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={rfmSummary} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="segment" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="stm-tooltip">
                          <span className="stm-tooltip__label">{label}</span>
                          {payload.map((p) => (
                            <span key={p.dataKey} className="stm-tooltip__value" style={{ color: p.fill }}>
                              {p.dataKey === 'count'   && `Players: ${p.value}`}
                              {p.dataKey === 'avg_ggr' && `Avg GGR: €${p.value}`}
                            </span>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="count"   name="Players" fill="#6366f1" radius={[4,4,0,0]} />
                  <Bar dataKey="avg_ggr" name="Avg GGR" fill="#10b981" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="stm-legend">
                <span className="stm-legend__item" style={{ '--c': '#6366f1' }}>Players count</span>
                <span className="stm-legend__item" style={{ '--c': '#10b981' }}>Avg GGR (€)</span>
              </div>
            </div>
          </div>
          <div className="doc-block">
            <h3 className="doc-block__title">Player detail by segment</h3>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr><th>Segment</th><th>Country</th><th>Channel</th><th>Tier</th><th>Recency</th><th>Frequency</th><th>GGR</th><th>R</th><th>F</th><th>M</th></tr>
                </thead>
                <tbody>
                  {rfm.map((r, i) => {
                    const segColors: Record<string, { bg: string; color: string }> = {
                      Champions:    { bg: '#EEEDFE', color: '#3C3489' },
                      Loyal:        { bg: '#E1F5EE', color: '#085041' },
                      Promising:    { bg: '#E6F1FB', color: '#0C447C' },
                      'New Players':{ bg: '#EAF3DE', color: '#27500A' },
                      'At Risk':    { bg: '#FAEEDA', color: '#633806' },
                      Lost:         { bg: '#FAECE7', color: '#712B13' },
                    };
                    const sc = segColors[r.segment] || { bg: '#F1EFE8', color: '#5F5E5A' };
                    const scoreColor = (s: number) => s >= 4 ? '#27500A' : s <= 2 ? '#712B13' : '#633806';
                    return (
                      <tr key={i}>
                        <td>
                          <span style={{ display:'inline-block', padding:'2px 8px', borderRadius:'20px', fontSize:'12px', background: sc.bg, color: sc.color, fontWeight: 500 }}>
                            {r.segment}
                          </span>
                        </td>
                        <td>{r.country}</td>
                        <td>{r.channel}</td>
                        <td>{r.vip_tier}</td>
                        <td>{r.recency_days}d ago</td>
                        <td>{r.frequency} days</td>
                        <td><strong>€{fmt(r.monetary)}</strong></td>
                        <td style={{ color: scoreColor(r.r_score), fontWeight: 500 }}>{r.r_score}</td>
                        <td style={{ color: scoreColor(r.f_score), fontWeight: 500 }}>{r.f_score}</td>
                        <td style={{ color: scoreColor(r.m_score), fontWeight: 500 }}>{r.m_score}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
        {/* 07 LTV */}
<section className="doc-section">
  <div className="doc-section__header">
    <span className="doc-section__num">07</span>
    <h2 className="doc-section__title">LTV Curves by Cohort</h2>
  </div>

  <div className="doc-block">
    <h3 className="doc-block__title">Cumulative ARPU over time</h3>
    <p className="doc-block__subtitle">
  Each line = one registration cohort · X = weeks since sign-up · Y = cumulative GGR per player · longer line = older cohort
</p>
    <div className="stm-chart-wrap">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={ltvCurve.data || []} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            {(ltvCurve.cohorts as string[] || []).map((c: string, i: number) => (
              <linearGradient key={c} id={`ltv${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={COLORS[i % COLORS.length]} stopOpacity={0.12} />
                <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
  dataKey="week"
  tick={{ fontSize: 11, fill: '#6b7280' }}
  axisLine={false}
  tickLine={false}
  interval={2}
  tickFormatter={(v) => v}
/>
          <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${v}`} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="stm-tooltip">
                  <span className="stm-tooltip__label">{label}</span>
                  {payload.filter(p => p.value != null).map((p) => (
                    <span key={p.dataKey} className="stm-tooltip__value" style={{ color: p.color }}>
                      {p.dataKey}: €{fmt(p.value as string | number)}
                    </span>
                  ))}
                </div>
              );
            }}
          />
          {(ltvCurve.cohorts as string[] || []).map((c: string, i: number) => (
            <Area
              key={c}
              type="monotone"
              dataKey={c}
              name={c}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              fill={`url(#ltv${i})`}
              dot={false}
              connectNulls={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      <div className="stm-legend" style={{ flexWrap: 'wrap' }}>
        {(ltvCurve.cohorts as string[] || []).map((c: string, i: number) => (
          <span key={c} className="stm-legend__item" style={{ '--c': COLORS[i % COLORS.length] }}>{c}</span>
        ))}
      </div>
    </div>
    <div className="doc-callout doc-callout--primary" style={{ marginTop: '1rem' }}>
      <strong>How to read this chart:</strong> steeper slope = faster monetisation · flat line = player stopped playing · gap between cohorts = acquisition quality difference
    </div>
  </div>

  <div className="doc-block">
    <h3 className="doc-block__title">Cohort summary</h3>
    <div className="doc-table-wrap">
      <table className="doc-table">
        <thead>
          <tr>
            <th>Cohort</th>
            <th>Players</th>
            <th>Total GGR</th>
            <th>ARPU (lifetime)</th>
            <th>ARPU D30</th>
            <th>ARPU D90</th>
            <th>Predicted LTV</th>
          </tr>
        </thead>
        <tbody>
          {ltv.map((r) => {
            const predictedLtv = Math.round(Number(r.arpu || 0) * 1.8);
            return (
              <tr key={r.cohort}>
                <td><strong>{r.cohort}</strong></td>
                <td>{r.cohort_size}</td>
                <td>€{fmt(r.total_ggr)}</td>
                <td>€{fmt(r.arpu)}</td>
                <td>€{fmt(r.arpu_d30 || 0)}</td>
                <td>€{fmt(r.arpu_d90 || 0)}</td>
                <td>
                  <span style={{
                    display: 'inline-block', padding: '2px 8px',
                    borderRadius: '20px', fontSize: '12px',
                    background: '#EEEDFE', color: '#3C3489', fontWeight: 500,
                  }}>
                    €{fmt(predictedLtv)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
      Predicted LTV = lifetime ARPU × 1.8 · simplified model · replace with regression in production
    </p>
  </div>
</section>

        <div className="doc-footnote">
          Analytics Dashboard · iGaming Backoffice Concept · Data: Supabase mock dataset · Author: Yevhenii Holovei · April 2026
        </div>

      </div>
    </div>
  );
}