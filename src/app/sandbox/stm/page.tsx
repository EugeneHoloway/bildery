'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

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
};

const gmHistory = [
  { q: 'Q1 24', actual: 41.0 }, { q: 'Q2 24', actual: 39.3 },
  { q: 'Q3 24', actual: 36.1 }, { q: 'Q4 24', actual: 33.9 },
  { q: 'Q1 25', actual: 32.4 }, { q: 'Q2 25', actual: 33.1, forecast: 33.1 },
  { q: 'Q3 25', forecast: 34.5 }, { q: 'Q4 25', forecast: 36.0 },
  { q: 'Q1 26', forecast: 37.2 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="stm-tooltip">
        <span className="stm-tooltip__label">{label}</span>
        <span className="stm-tooltip__value">€{payload[0].value.toFixed(2)}</span>
      </div>
    );
  }
  return null;
};

const GmTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="stm-tooltip">
        <span className="stm-tooltip__label">{label}</span>
        <span className="stm-tooltip__value">{payload[0].value}%</span>
      </div>
    );
  }
  return null;
};

export default function STMPage() {
  const [priceRange, setPriceRange] = useState('1Y');

  return (
    <div className="doc-page">
      <div className="container">

        <nav className="doc-breadcrumb" aria-label="Breadcrumb">
          <Link href="/sandbox" className="doc-breadcrumb__link">Sandbox</Link>
          <span className="doc-breadcrumb__sep">/</span>
          <span className="doc-breadcrumb__current">STMicroelectronics</span>
        </nav>

        <div className="doc-hero">
          <h1 className="doc-hero__title">STMicroelectronics</h1>
          <div className="doc-hero__tags">
            <span className="sandbox-card__tag">STM · NYSE</span>
            <span className="sandbox-card__tag">STMPA · Euronext Paris</span>
            <span className="sandbox-card__tag">Semiconductors</span>
          </div>
          <p className="doc-hero__description">
            Power semiconductors, SiC, MEMS, MCU · Headquartered in Geneva
          </p>
        </div>

        <div className="stm-price-block">
          <div className="stm-price-block__header">
            <span className="stm-price-block__label">LIVE PRICE | EURONEXT PARIS: STMPA</span>
            <span className="stm-price-static">Static data · Live prices coming soon</span>
          </div>
          <div className="stm-price-grid">
            {[
              { label: 'Open', value: '—' },
              { label: 'Prev Close', value: '—' },
              { label: 'Day High', value: '—' },
              { label: 'Day Low', value: '—' },
            ].map((item) => (
              <div key={item.label} className="stm-price-item">
                <span className="stm-price-item__label">{item.label}</span>
                <span className="stm-price-item__value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">01</span>
            <h2 className="doc-section__title">Price History</h2>
          </div>
          <div className="doc-block">
            <div className="stm-chart-header">
              <p className="doc-block__subtitle" style={{ margin: 0 }}>Daily closes · Euronext Paris: STMPA</p>
              <div className="stm-range-tabs">
                {['1Y', '3Y', '5Y'].map((r) => (
                  <button
                    key={r}
                    className={`stm-range-tab${priceRange === r ? ' stm-range-tab--active' : ''}`}
                    onClick={() => setPriceRange(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="stm-chart-wrap">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={priceHistory[priceRange as keyof typeof priceHistory]} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${v}`} domain={['auto', 'auto']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={2} fill="url(#priceGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">02</span>
            <h2 className="doc-section__title">Key Financials — FY2025</h2>
          </div>
          <div className="doc-kpi-row">
            <div className="doc-kpi">
              <span className="doc-kpi__value">$11.8B</span>
              <span className="doc-kpi__label">FY2025 Revenue</span>
              <span className="doc-kpi__note">▼ 11.1% YoY</span>
            </div>
            <div className="doc-kpi">
              <span className="doc-kpi__value">33.9%</span>
              <span className="doc-kpi__label">Gross Margin (FY25)</span>
              <span className="doc-kpi__note">▼ from 39.3% in '24</span>
            </div>
            <div className="doc-kpi">
              <span className="doc-kpi__value">8.45×</span>
              <span className="doc-kpi__label">EV/EBITDA</span>
              <span className="doc-kpi__note">vs TXN 22×, ADI 28×</span>
            </div>
            <div className="doc-kpi">
              <span className="doc-kpi__value">4.8×</span>
              <span className="doc-kpi__label">P/S Ratio (peer avg)</span>
              <span className="doc-kpi__note">STM trading at discount</span>
            </div>
          </div>
        </section>

        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">03</span>
            <h2 className="doc-section__title">Segment Performance — FY2025</h2>
          </div>
          <div className="doc-block">
            <p className="doc-block__subtitle">Revenue trends & operating margins</p>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr><th>Segment</th><th>FY2025 Trend</th><th>Q3 Op. Margin</th></tr>
                </thead>
                <tbody>
                  {[
                    ['Analog, MEMS & Sensors', '+7.5% YoY', '15.4%'],
                    ['Power & Discrete (SiC)', '−31.6% YoY', '−15.6%'],
                    ['Embedded Processing (MCU)', '+1.2% YoY', '16.5%'],
                    ['Overall Company', '−11.1% YoY', '6.8% (non-GAAP)'],
                  ].map(([seg, trend, margin]) => (
                    <tr key={seg}>
                      <td><strong>{seg}</strong></td>
                      <td><span className={trend.startsWith('+') ? 'stm-trend stm-trend--up' : 'stm-trend stm-trend--down'}>{trend}</span></td>
                      <td><span className={margin.startsWith('−') ? 'stm-trend stm-trend--down' : ''}>{margin}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">04</span>
            <h2 className="doc-section__title">Peer Valuation Comparison</h2>
          </div>
          <div className="doc-block">
            <p className="doc-block__subtitle">Semiconductor sector benchmarks</p>
            <div className="doc-table-wrap">
              <table className="doc-table">
                <thead>
                  <tr><th>Company</th><th>Ticker</th><th>P/S (×)</th><th>EV/EBITDA</th><th>Gross Margin</th></tr>
                </thead>
                <tbody>
                  {[
                    ['STMicroelectronics', 'STMPA', '—', '8.45×', '33.9%', true],
                    ['Texas Instruments', 'TXN', '9.53×', '22.18×', '57.5%', false],
                    ['Analog Devices', 'ADI', '12.40×', '28.43×', '63.1%', false],
                    ['NXP Semiconductors', 'NXPI', '4.79×', '16.52×', '55.4%', false],
                    ['Sector Avg', '—', '4.8×', '~18×', '~55%', false],
                  ].map(([company, ticker, ps, ev, gm, highlight]) => (
                    <tr key={String(company)} className={highlight ? 'stm-row-highlight' : ''}>
                      <td><strong>{company}</strong></td>
                      <td><code>{ticker}</code></td>
                      <td>{ps}</td><td>{ev}</td><td>{gm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">05</span>
            <h2 className="doc-section__title">Gross Margin Trajectory</h2>
          </div>
          <div className="doc-block">
            <p className="doc-block__subtitle">Quarterly actuals vs forecast</p>
            <div className="stm-chart-wrap">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={gmHistory} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="q" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[28, 44]} />
                  <Tooltip content={<GmTooltip />} />
                  <Area type="monotone" dataKey="actual" stroke="#6366f1" strokeWidth={2} fill="url(#actualGrad)" dot={false} connectNulls={false} />
                  <Area type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 4" fill="url(#forecastGrad)" dot={false} connectNulls={false} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="stm-legend">
                <span className="stm-legend__item stm-legend__item--actual">Actual</span>
                <span className="stm-legend__item stm-legend__item--forecast">Forecast</span>
              </div>
            </div>
          </div>
        </section>

        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">06</span>
            <h2 className="doc-section__title">Risk Assessment</h2>
          </div>
          <div className="doc-block">
            <div className="doc-risks">
              {[
                { level: 'high', badge: 'High', title: 'SiC Revenue Decline', text: 'Power & Discrete segment down 31.6% YoY. EV adoption slowdown and intensifying competition from Wolfspeed, Onsemi directly impact the highest-growth segment.' },
                { level: 'high', badge: 'High', title: 'Gross Margin Compression', text: 'GM fell from 39.3% to 33.9% in FY2025. Recovery depends on cost program execution (€300–360M target) and volume recovery in SiC.' },
                { level: 'watch', badge: 'Medium', title: 'Macro & Auto Cycle', text: 'Automotive accounts for ~45% of revenue. Any further slowdown in EV ramp or ICE-to-EV transition delay extends the downcycle.' },
                { level: 'watch', badge: 'Medium', title: 'Geopolitical Risk', text: 'Manufacturing exposure in Crolles (France) and Catania (Italy). US-China trade tensions could affect customer supply chain decisions.' },
                { level: 'low', badge: 'Low', title: 'Currency Impact', text: 'Revenue reported in USD, listed in EUR. EUR/USD fluctuation creates P&L noise but is partially hedged operationally.' },
              ].map((r) => (
                <div key={r.title} className={`doc-risk doc-risk--${r.level}`}>
                  <div className="doc-risk__header">
                    <span className={`doc-risk__badge doc-risk__badge--${r.level}`}>{r.badge}</span>
                    <strong className="doc-risk__title">{r.title}</strong>
                  </div>
                  <p className="doc-risk__text">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">07</span>
            <h2 className="doc-section__title">Price Target Scenarios</h2>
          </div>
          <div className="doc-block">
            <div className="doc-scenarios">
              {[
                { label: 'Bull Case · 25%', value: '€40–45', note: 'SiC accelerates, GM returns to 40%+, cost savings fully delivered. Multiple re-rates toward NXP levels.' },
                { label: 'Base Case · 50%', value: '€28–32', note: 'Gradual recovery; GM reaches 36–38% by end-2026; SiC grows modestly; consensus target roughly achieved.', highlight: true },
                { label: 'Bear Case · 25%', value: '€18–22', note: 'EV demand delays, SiC competition intensifies, cost program stalls. April 2025 lows re-tested.' },
              ].map((s) => (
                <div key={s.label} className={`doc-scenario${s.highlight ? ' doc-scenario--highlight' : ''}`}>
                  <span className="doc-scenario__label">{s.label}</span>
                  <span className="doc-scenario__value">{s.value}</span>
                  <p className="doc-scenario__note">{s.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">08</span>
            <h2 className="doc-section__title">Rating Summary & Technical Levels</h2>
          </div>
          <div className="doc-block">
            <div className="stm-two-col">
              <div>
                <h3 className="doc-block__title">Rating Summary</h3>
                <div className="doc-table-wrap">
                  <table className="doc-table">
                    <tbody>
                      {[
                        ['Rating', <span className="doc-badge doc-badge--select">HOLD</span>],
                        ['Conviction', 'Medium'],
                        ['12M Price Target', '€30'],
                        ['Analyst Consensus', '€27.0 (range €20–€36.75)'],
                        ['Position Size', '1.5%–3.5%'],
                        ['Next Earnings', 'Apr 23, 2026'],
                      ].map(([label, value]) => (
                        <tr key={String(label)}><td><strong>{label}</strong></td><td>{value}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <h3 className="doc-block__title">Technical Levels</h3>
                <div className="doc-table-wrap">
                  <table className="doc-table">
                    <tbody>
                      {[
                        ['Support 1', '€22–23'],
                        ['Support 2', '€18–20 (2025 lows)'],
                        ['Resistance 1', '€30–31'],
                        ['Resistance 2', '€36–38'],
                        ['200-DMA', '€22.9'],
                        ['52-Wk Range', '€18 – €39'],
                      ].map(([label, value]) => (
                        <tr key={String(label)}><td><strong>{label}</strong></td><td>{value}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="doc-section">
          <div className="doc-section__header">
            <span className="doc-section__num">09</span>
            <h2 className="doc-section__title">Key Catalysts</h2>
          </div>
          <div className="doc-block">
            <div className="doc-flow">
              {[
                { date: 'Apr 23, 2026', title: 'Q1 2026 Earnings' },
                { date: 'H1 2026', title: 'SiC 4th-Gen Ramp' },
                { date: '2026 Ongoing', title: 'Mfg Cost Program (€300–360M)' },
                { date: 'H2 2026', title: 'Semi Cycle Recovery' },
                { date: '2026–27', title: 'NXP MEMS Integration' },
                { date: '2026+', title: 'AI Datacenter Power' },
              ].map((c) => (
                <div key={c.title} className="doc-flow__step">
                  <span className="stm-catalyst-date">{c.date}</span>
                  <div className="doc-flow__content">
                    <strong className="doc-flow__title">{c.title}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="doc-footnote">
          ⚠️ For educational and research purposes only. Not financial advice. Fundamental data reflects FY2025 reported figures. All investments carry risk. Consult a qualified financial advisor before making investment decisions.
        </div>

      </div>
    </div>
  );
}
