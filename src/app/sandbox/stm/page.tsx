'use client'

import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DocLayout } from '@/components/doc/DocLayout'
import { DocSection } from '@/components/doc/DocSection'
import { DocBlock } from '@/components/doc/DocBlock'
import { KpiRow } from '@/components/doc/KpiRow'
import { DocRisks } from '@/components/doc/DocRisks'
import { DocScenarios } from '@/components/doc/DocScenarios'
import { DocTable, DocTableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/doc/DocTable'

const priceHistory = {
  '1Y': [
    { date: 'Apr 24', price: 30.12 }, { date: 'May 24', price: 31.45 },
    { date: 'Jun 24', price: 28.90 }, { date: 'Jul 24', price: 27.60 },
    { date: 'Aug 24', price: 25.80 }, { date: 'Sep 24', price: 24.10 },
    { date: 'Oct 24', price: 22.50 }, { date: 'Nov 24', price: 23.80 },
    { date: 'Dec 24', price: 24.40 }, { date: 'Jan 25', price: 22.10 },
    { date: 'Feb 25', price: 21.30 }, { date: 'Mar 25', price: 22.60 },
    { date: 'Apr 25', price: 18.20 }, { date: 'Mar 26', price: 21.80 },
  ],
  '3Y': [
    { date: 'Apr 23', price: 42.10 }, { date: 'Jul 23', price: 45.30 },
    { date: 'Oct 23', price: 38.90 }, { date: 'Jan 24', price: 41.20 },
    { date: 'Apr 24', price: 30.12 }, { date: 'Jul 24', price: 27.60 },
    { date: 'Oct 24', price: 22.50 }, { date: 'Jan 25', price: 22.10 },
    { date: 'Apr 25', price: 18.20 }, { date: 'Mar 26', price: 21.80 },
  ],
  '5Y': [
    { date: 'Apr 21', price: 28.40 }, { date: 'Oct 21', price: 38.20 },
    { date: 'Apr 22', price: 35.60 }, { date: 'Oct 22', price: 30.10 },
    { date: 'Apr 23', price: 42.10 }, { date: 'Oct 23', price: 38.90 },
    { date: 'Apr 24', price: 30.12 }, { date: 'Oct 24', price: 22.50 },
    { date: 'Apr 25', price: 18.20 }, { date: 'Mar 26', price: 21.80 },
  ],
}

const gmHistory = [
  { q: 'Q1 24', actual: 41.0 }, { q: 'Q2 24', actual: 39.3 },
  { q: 'Q3 24', actual: 36.1 }, { q: 'Q4 24', actual: 33.9 },
  { q: 'Q1 25', actual: 32.4 }, { q: 'Q2 25', actual: 33.1, forecast: 33.1 },
  { q: 'Q3 25', forecast: 34.5 }, { q: 'Q4 25', forecast: 36.0 },
  { q: 'Q1 26', forecast: 37.2 },
]

function ChartTooltip({ active, payload, label, formatter }: {
  active?: boolean
  payload?: Array<{ value: number; color?: string; name?: string }>
  label?: string
  formatter: (v: number) => string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="flex flex-col gap-0.5 px-3 py-2 border border-border rounded-lg bg-card shadow-sm text-xs">
      <span className="text-muted-foreground">{label}</span>
      {payload.map((p, i) => (
        <span key={i} className="font-bold" style={{ color: p.color }}>
          {p.name ? `${p.name}: ` : ''}{formatter(p.value)}
        </span>
      ))}
    </div>
  )
}

function LegendItem({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
      <span
        className="inline-block w-5 h-0.5 rounded-full flex-shrink-0"
        style={{ background: dashed
          ? `repeating-linear-gradient(90deg, ${color} 0, ${color} 5px, transparent 5px, transparent 9px)`
          : color }}
      />
      {label}
    </span>
  )
}

export default function STMPage() {
  const [priceRange, setPriceRange] = useState('1Y')

  return (
    <DocLayout
      title="STMicroelectronics"
      breadcrumbLabel="Sandbox"
      breadcrumbHref="/sandbox"
      tags={[
        { label: 'STM | NYSE',        type: 'tag' },
        { label: 'STMPA | Euronext',  type: 'tag' },
        { label: 'Semiconductors',    type: 'tag' },
      ]}
      description="Power semiconductors, SiC, MEMS, MCU | Headquartered in Geneva"
      footnote="⚠️ For educational and research purposes only. Not financial advice. Fundamental data reflects FY2025 reported figures. All investments carry risk. Consult a qualified financial advisor before making investment decisions."
    >

      {/* Live Price Block */}
      <div className="border border-border rounded-2xl bg-card p-5 mb-10">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <span className="text-[0.7rem] font-bold tracking-widest uppercase text-muted-foreground">
            Live Price | Euronext Paris: STMPA
          </span>
          <span className="text-xs text-muted-foreground bg-subtle px-2.5 py-1 rounded-full">
            Static data | Live prices coming soon
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Open',       value: '--' },
            { label: 'Prev Close', value: '--' },
            { label: 'Day High',   value: '--' },
            { label: 'Day Low',    value: '--' },
          ].map(item => (
            <div key={item.label} className="flex flex-col gap-0.5">
              <span className="text-[0.72rem] text-muted-foreground font-medium">{item.label}</span>
              <span className="text-lg font-semibold tracking-tight">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 01 – Price History */}
      <DocSection num="01" title="Price History">
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <p className="text-sm text-muted-foreground">Daily closes | Euronext Paris: STMPA</p>
            <div className="flex gap-1">
              {(['1Y', '3Y', '5Y'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setPriceRange(r)}
                  className={cn(
                    'px-2.5 py-1 rounded-md border text-xs font-semibold transition-all',
                    priceRange === r
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-transparent text-muted-foreground border-border hover:text-foreground',
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="border border-border rounded-xl p-4 bg-card">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart
                data={priceHistory[priceRange as keyof typeof priceHistory]}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--color-chart-1)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`} domain={['auto', 'auto']} />
                <Tooltip content={<ChartTooltip formatter={v => `€${v.toFixed(2)}`} />} />
                <Area type="monotone" dataKey="price" stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#priceGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </DocSection>

      {/* 02 – Key Financials */}
      <DocSection num="02" title="Key Financials -- FY2025">
        <KpiRow items={[
          { value: '$11.8B', label: 'FY2025 Revenue',       note: '▼ 11.1% YoY'         },
          { value: '33.9%',  label: 'Gross Margin (FY25)', note: "▼ from 39.3% in '24"  },
          { value: '8.45×',  label: 'EV/EBITDA',           note: 'vs TXN 22×, ADI 28×' },
          { value: '4.8×',   label: 'P/S Ratio (peer avg)', note: 'STM trading at discount' },
        ]} />
      </DocSection>

      {/* 03 – Segment Performance */}
      <DocSection num="03" title="Segment Performance -- FY2025">
        <DocBlock title="Revenue trends & operating margins">
          <DocTable>
            <DocTableHeader>
              <TableRow><TableHead>Segment</TableHead><TableHead>FY2025 Trend</TableHead><TableHead>Q3 Op. Margin</TableHead></TableRow>
            </DocTableHeader>
            <TableBody>
              {[
                ['Analog, MEMS & Sensors', '+7.5% YoY',   '15.4%'],
                ['Power & Discrete (SiC)', '−31.6% YoY',  '−15.6%'],
                ['Embedded Processing (MCU)', '+1.2% YoY', '16.5%'],
                ['Overall Company',          '−11.1% YoY', '6.8% (non-GAAP)'],
              ].map(([seg, trend, margin]) => (
                <TableRow key={seg}>
                  <TableCell className="font-semibold">{seg}</TableCell>
                  <TableCell>
                    <span className={cn('font-semibold', trend.startsWith('+') ? 'text-success' : 'text-destructive')}>
                      {trend}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={cn(margin.startsWith('−') ? 'text-destructive font-semibold' : '')}>
                      {margin}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DocTable>
        </DocBlock>
      </DocSection>

      {/* 04 – Peer Valuation */}
      <DocSection num="04" title="Peer Valuation Comparison">
        <DocBlock subtitle="Semiconductor sector benchmarks">
          <DocTable>
            <DocTableHeader>
              <TableRow><TableHead>Company</TableHead><TableHead>Ticker</TableHead><TableHead>P/S (×)</TableHead><TableHead>EV/EBITDA</TableHead><TableHead>Gross Margin</TableHead></TableRow>
            </DocTableHeader>
            <TableBody>
              {[
                ['STMicroelectronics', 'STMPA',   '--',      '8.45×', '33.9%', true],
                ['Texas Instruments',  'TXN',     '9.53×',  '22.18×','57.5%', false],
                ['Analog Devices',     'ADI',     '12.40×', '28.43×','63.1%', false],
                ['NXP Semiconductors', 'NXPI',    '4.79×',  '16.52×','55.4%', false],
                ['Sector Avg',         '--',       '4.8×',   '~18×',  '~55%',  false],
              ].map(([company, ticker, ps, ev, gm, highlight]) => (
                <TableRow key={String(company)} className={highlight ? 'bg-brand-bg [&>td]:font-semibold' : ''}>
                  <TableCell className="font-semibold">{company}</TableCell>
                  <TableCell><code>{ticker}</code></TableCell>
                  <TableCell>{ps}</TableCell><TableCell>{ev}</TableCell><TableCell>{gm}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DocTable>
        </DocBlock>
      </DocSection>

      {/* 05 – Gross Margin */}
      <DocSection num="05" title="Gross Margin Trajectory">
        <DocBlock subtitle="Quarterly actuals vs forecast">
          <div className="border border-border rounded-xl p-4 bg-card mb-2">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={gmHistory} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--color-chart-1)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--color-chart-3)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--color-chart-3)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="q" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[28, 44]} />
                <Tooltip content={<ChartTooltip formatter={v => `${v}%`} />} />
                <Area type="monotone" dataKey="actual"   stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#actualGrad)"   dot={false} connectNulls={false} />
                <Area type="monotone" dataKey="forecast" stroke="var(--color-chart-3)" strokeWidth={2} strokeDasharray="5 4" fill="url(#forecastGrad)" dot={false} connectNulls={false} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex gap-4 px-2 pt-2">
              <LegendItem color="var(--color-chart-1)" label="Actual" />
              <LegendItem color="var(--color-chart-3)" label="Forecast" dashed />
            </div>
          </div>
        </DocBlock>
      </DocSection>

      {/* 06 – Risk Assessment */}
      <DocSection num="06" title="Risk Assessment">
        <DocBlock>
          <DocRisks items={[
            { level: 'high',  badge: 'High',   title: 'SiC Revenue Decline',    text: 'Power & Discrete segment down 31.6% YoY. EV adoption slowdown and intensifying competition from Wolfspeed, Onsemi directly impact the highest-growth segment.' },
            { level: 'high',  badge: 'High',   title: 'Gross Margin Compression', text: 'GM fell from 39.3% to 33.9% in FY2025. Recovery depends on cost program execution (€300–360M target) and volume recovery in SiC.' },
            { level: 'watch', badge: 'Medium', title: 'Macro & Auto Cycle',       text: 'Automotive accounts for ~45% of revenue. Any further slowdown in EV ramp or ICE-to-EV transition delay extends the downcycle.' },
            { level: 'watch', badge: 'Medium', title: 'Geopolitical Risk',        text: 'Manufacturing exposure in Crolles (France) and Catania (Italy). US-China trade tensions could affect customer supply chain decisions.' },
            { level: 'low',   badge: 'Low',    title: 'Currency Impact',          text: 'Revenue reported in USD, listed in EUR. EUR/USD fluctuation creates P&L noise but is partially hedged operationally.' },
          ]} />
        </DocBlock>
      </DocSection>

      {/* 07 – Price Target Scenarios */}
      <DocSection num="07" title="Price Target Scenarios">
        <DocBlock>
          <DocScenarios items={[
            { label: 'Bull Case | 25%', value: '€40–45', note: 'SiC accelerates, GM returns to 40%+, cost savings fully delivered. Multiple re-rates toward NXP levels.' },
            { label: 'Base Case | 50%', value: '€28–32', note: 'Gradual recovery; GM reaches 36–38% by end-2026; SiC grows modestly; consensus target roughly achieved.', highlight: true },
            { label: 'Bear Case | 25%', value: '€18–22', note: 'EV demand delays, SiC competition intensifies, cost program stalls. April 2025 lows re-tested.' },
          ]} />
        </DocBlock>
      </DocSection>

      {/* 08 – Rating Summary & Technical Levels */}
      <DocSection num="08" title="Rating Summary & Technical Levels">
        <DocBlock>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-base font-bold mb-1">Rating Summary</h3>
              <DocTable>
                <TableBody>
                  {[
                    ['Rating',             <Badge key="hold" variant="outline" className="bg-success-bg text-success border-success-border">HOLD</Badge>],
                    ['Conviction',          'Medium'],
                    ['12M Price Target',    '€30'],
                    ['Analyst Consensus',   '€27.0 (range €20–€36.75)'],
                    ['Position Size',       '1.5%–3.5%'],
                    ['Next Earnings',       'Apr 23, 2026'],
                  ].map(([label, value]) => (
                    <TableRow key={String(label)}><TableCell className="font-semibold">{label}</TableCell><TableCell>{value}</TableCell></TableRow>
                  ))}
                </TableBody>
              </DocTable>
            </div>
            <div>
              <h3 className="text-base font-bold mb-1">Technical Levels</h3>
              <DocTable>
                <TableBody>
                  {[
                    ['Support 1',    '€22–23'],
                    ['Support 2',    '€18–20 (2025 lows)'],
                    ['Resistance 1', '€30–31'],
                    ['Resistance 2', '€36–38'],
                    ['200-DMA',      '€22.9'],
                    ['52-Wk Range',  '€18 – €39'],
                  ].map(([label, value]) => (
                    <TableRow key={String(label)}><TableCell className="font-semibold">{label}</TableCell><TableCell>{value}</TableCell></TableRow>
                  ))}
                </TableBody>
              </DocTable>
            </div>
          </div>
        </DocBlock>
      </DocSection>

      {/* 09 – Key Catalysts */}
      <DocSection num="09" title="Key Catalysts">
        <DocBlock>
          <div className="flex flex-col gap-2">
            {[
              { date: 'Apr 23, 2026',   title: 'Q1 2026 Earnings' },
              { date: 'H1 2026',        title: 'SiC 4th-Gen Ramp' },
              { date: '2026 Ongoing',   title: 'Mfg Cost Program (€300–360M)' },
              { date: 'H2 2026',        title: 'Semi Cycle Recovery' },
              { date: '2026–27',        title: 'NXP MEMS Integration' },
              { date: '2026+',          title: 'AI Datacenter Power' },
            ].map(c => (
              <div key={c.title} className="flex items-start gap-4 px-4 py-3 bg-card border border-border rounded-xl">
                <span className="text-xs font-bold text-muted-foreground shrink-0 min-w-[100px] pt-0.5">
                  {c.date}
                </span>
                <span className="text-sm font-bold">{c.title}</span>
              </div>
            ))}
          </div>
        </DocBlock>
      </DocSection>

    </DocLayout>
  )
}
