'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type InsightType = 'critical' | 'warning' | 'good' | 'info'

interface Scores {
  revenue_health: number
  risk_level: number
  retention_score: number
  overall: number
}

interface Insight { type: InsightType; tag: string; text: string }

interface AnalysisResult { scores: Scores; insights: Insight[]; top_action: string }

// ── Config ────────────────────────────────────────────────────────────────────

const METRICS = [
  { key: 'ftd',         label: 'FTD Conversion Rate',   unit: '%',       step: 0.1, bench: '2.1 – 3.4%'   },
  { key: 'dep_conv',    label: 'Deposit Conversion',    unit: '%',       step: 1,   bench: '68 – 78%'      },
  { key: 'churn',       label: 'Month 1 Churn',         unit: '%',       step: 1,   bench: '28 – 35%'      },
  { key: 'bonus_roi',   label: 'Bonus ROI',             unit: 'x',       step: 0.1, bench: '1.5 – 2.5x'   },
  { key: 'avg_dep',     label: 'Avg Deposit Size',      unit: '€',       step: 1,   bench: '€45 – €80'     },
  { key: 'pay_success', label: 'Payment Success Rate',  unit: '%',       step: 1,   bench: '82 – 91%'      },
  { key: 'ggr',         label: 'GGR / Active Player',   unit: '€/mo',    step: 1,   bench: '€55 – €95'     },
  { key: 'react',       label: 'Reactivation Rate',     unit: '%',       step: 1,   bench: '18 – 28%'      },
  { key: 'tickets',     label: 'Support Tickets / 100', unit: 'tickets', step: 1,   bench: '2 – 5 tickets' },
] as const

type MetricKey = typeof METRICS[number]['key']
type MetricValues = Record<MetricKey, number>

const DEFAULT_VALUES: MetricValues = {
  ftd: 1.8, dep_conv: 61, churn: 43, bonus_roi: 0.9,
  avg_dep: 42, pay_success: 71, ggr: 38, react: 12, tickets: 8,
}

const SCORE_CARDS = [
  { key: 'revenue_health',  label: 'Revenue Health',  invert: false },
  { key: 'risk_level',      label: 'Risk Level',      invert: true  },
  { key: 'retention_score', label: 'Retention Score', invert: false },
  { key: 'overall',         label: 'Overall Score',   invert: false },
] as const

const INSIGHT_C: Record<InsightType, { border: string; bg: string; tag: string }> = {
  critical: { border: '#ff4d6a', bg: '#1a0f11', tag: '#ff4d6a' },
  warning:  { border: '#ffb340', bg: '#1a160a', tag: '#ffb340' },
  good:     { border: '#00d68f', bg: '#0a1a12', tag: '#00d68f' },
  info:     { border: '#4d9eff', bg: '#0a1020', tag: '#4d9eff' },
}

// ── Score calculation ─────────────────────────────────────────────────────────

function clamp(v: number) { return Math.max(0, Math.min(100, v)) }
function norm(v: number, min: number, max: number) { return clamp((v - min) / (max - min) * 100) }

function computeScores(v: MetricValues): Scores {
  const revenue_health = Math.round(
    norm(v.pay_success, 65, 95) * 0.30 +
    norm(v.ggr,         25, 110) * 0.25 +
    norm(v.bonus_roi,    0, 3.5) * 0.25 +
    norm(v.avg_dep,     25, 100) * 0.10 +
    norm(v.ftd,        0.5,   5) * 0.10
  )
  const retention_score = Math.round(
    norm(55 - v.churn, 0,  40) * 0.45 +
    norm(v.react,      5,  40) * 0.35 +
    norm(v.dep_conv,  50,  95) * 0.20
  )
  const risk_level = Math.round(
    norm(95 - v.pay_success,   0, 30) * 0.30 +
    norm(v.churn - 15,         0, 40) * 0.25 +
    norm(3.5 - v.bonus_roi,    0, 3.5) * 0.20 +
    norm(3.5 - v.ftd,          0,  3) * 0.15 +
    norm(v.tickets - 1,        0, 11) * 0.10
  )
  const overall = Math.round(revenue_health * 0.40 + retention_score * 0.35 + (100 - risk_level) * 0.25)
  return { revenue_health, risk_level, retention_score, overall }
}

// ── Methodology data ──────────────────────────────────────────────────────────

const METHODOLOGY = [
  {
    score: 'Revenue Health',
    description: 'How effectively the operator generates and captures revenue.',
    components: [
      { metric: 'Payment Success Rate', weight: '30%', formula: '(v − 65) / 30',   explain: 'min 65% — payment system is effectively broken below this; max 95% — practical ceiling due to fraud rejections and bank limits' },
      { metric: 'GGR / Active Player',  weight: '25%', formula: '(v − 25) / 85',   explain: 'min €25 — barely covers per-player operating costs; max €110 — upper bound for mass-market (VIP excluded)' },
      { metric: 'Bonus ROI',            weight: '25%', formula: 'v / 3.5',          explain: 'min 0 — promotions burn budget with zero return; max 3.5x — rarely exceeded with healthy wagering requirements' },
      { metric: 'Avg Deposit Size',     weight: '10%', formula: '(v − 25) / 75',   explain: 'min €25 — typical platform minimum deposit; max €100 — above this is niche high-roller, not mass market' },
      { metric: 'FTD Conversion',       weight: '10%', formula: '(v − 0.5) / 4.5', explain: 'min 0.5% — below this traffic is junk or onboarding is broken; max 5% — top operators with strong brand and optimised flow' },
    ],
    threshold: 'Good ≥ 70 · At risk 45–69 · Critical < 45',
  },
  {
    score: 'Retention Score',
    description: 'How well the operator keeps and re-engages its player base.',
    components: [
      { metric: 'Month 1 Churn (inv.)', weight: '45%', formula: '(55 − v) / 40', explain: 'inverted: lower churn = higher score. min 15% — best-in-class retention; max 55% — operator is effectively losing its entire base monthly' },
      { metric: 'Reactivation Rate',    weight: '35%', formula: '(v − 5) / 35',  explain: 'min 5% — lapsed player base is essentially unrecoverable; max 40% — strong win-back campaigns with personalised offers' },
      { metric: 'Deposit Conversion',   weight: '20%', formula: '(v − 50) / 45', explain: 'min 50% — half of registered users never deposit, severe funnel break; max 95% — near-perfect onboarding and payment flow' },
    ],
    threshold: 'Good ≥ 70 · At risk 45–69 · Critical < 45',
  },
  {
    score: 'Risk Level',
    description: 'Aggregate risk exposure across critical failure points. Higher = more risk.',
    components: [
      { metric: 'Payment Success (inv.)', weight: '30%', formula: '(95 − v) / 30',   explain: 'inverted: lower success = higher risk. Range 65–95%; each point below 82% (benchmark floor) directly destroys deposit revenue' },
      { metric: 'Month 1 Churn',          weight: '25%', formula: '(v − 15) / 40',   explain: 'min 15% — best-case churn baseline; max 55% — catastrophic retention failure. Above 40% is the critical threshold' },
      { metric: 'Bonus ROI (inv.)',        weight: '20%', formula: '(3.5 − v) / 3.5', explain: 'inverted: below 1.0x operator loses money on every promotion. Range 0–3.5x; below 1.2x is considered a systemic risk' },
      { metric: 'FTD Conversion (inv.)',   weight: '15%', formula: '(3.5 − v) / 3',   explain: 'inverted: low FTD signals broken acquisition funnel. Range 0.5–3.5%; below 2% indicates critical top-of-funnel failure' },
      { metric: 'Support Tickets',         weight: '10%', formula: '(v − 1) / 11',    explain: 'min 1 ticket/100 — near-perfect product; max 12 — systemic product or payment issues. Above 7 is flagged as a systemic problem' },
    ],
    threshold: 'Low risk < 30 · Moderate 30–59 · High risk ≥ 60',
  },
  {
    score: 'Overall Score',
    description: 'Composite of all three scores, weighted by business impact.',
    components: [
      { metric: 'Revenue Health',   weight: '40%', formula: 'direct',        explain: 'largest weight — revenue generation is the primary business objective' },
      { metric: 'Retention Score',  weight: '35%', formula: 'direct',        explain: 'retention directly drives LTV and reduces CAC payback period' },
      { metric: '100 − Risk Level', weight: '25%', formula: 'inverted risk', explain: 'risk is inverted so a low-risk operator contributes positively to overall health' },
    ],
    threshold: 'Good ≥ 70 · At risk 45–69 · Critical < 45',
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreColor(n: number, invert = false) {
  if (invert) { if (n < 30) return '#00d68f'; if (n < 60) return '#ffb340'; return '#ff4d6a'; }
  if (n >= 70) return '#00d68f'; if (n >= 45) return '#ffb340'; return '#ff4d6a';
}

// ── Scoped CSS — only for what inline styles can't do ────────────────────────

const LOCAL_CSS = `
  .ri-grid       { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
  @media(max-width:640px){ .ri-grid{ grid-template-columns:repeat(2,1fr); } }

  @keyframes ri-spin { to{ transform:rotate(360deg); } }
  .ri-spin       { animation:ri-spin .8s linear infinite; }
`

// ── Shared micro-styles ───────────────────────────────────────────────────────


// ── Page ──────────────────────────────────────────────────────────────────────

export default function RevenueIntelligencePage() {
  const [values, setValues]         = useState<MetricValues>(DEFAULT_VALUES)
  const [loading, setLoading]       = useState(false)
  const [result, setResult]         = useState<AnalysisResult | null>(null)
  const [errorMsg, setErrorMsg]     = useState<string | null>(null)
  function setMetric(key: MetricKey, val: string) {
    setValues(prev => ({ ...prev, [key]: parseFloat(val) || 0 }))
  }

  async function runAnalysis() {
    setLoading(true); setResult(null); setErrorMsg(null)

    await new Promise(r => setTimeout(r, 1200))
    setResult({
      scores: computeScores(values),
      top_action: 'Fix payment routing first — resolving 71% success rate could recover 20%+ lost revenue immediately.',
      insights: [
        {
          type: 'critical',
          tag: 'Payment Failure Crisis',
          text: '71% payment success rate is costing ~29% of deposit attempts. Audit PSP routing immediately and add 2 backup providers.',
        },
        {
          type: 'critical',
          tag: 'Bonus Budget Burning',
          text: '0.9x bonus ROI means losing money on every promotion. Cap bonus at 15% of first deposit and add 5x wagering requirement.',
        },
        {
          type: 'critical',
          tag: 'Churn Destroying Base',
          text: '43% month-1 churn is 8 points above critical threshold. Launch day-7 and day-14 triggered retention emails with 10% reload offer.',
        },
        {
          type: 'warning',
          tag: 'Reactivation Far Below Benchmark',
          text: '12% reactivation vs 18% minimum benchmark. Deploy 30-day lapsed player SMS campaign with €5 free spin no-deposit incentive.',
        },
      ],
    })

    setLoading(false)
  }

  const dotColor = result
    ? result.scores.overall >= 70 ? '#00d68f' : result.scores.overall >= 45 ? '#ffb340' : '#ff4d6a'
    : '#00d68f'

  return (
    <div className="doc-page">
      {/* Scoped styles */}
      <style>{LOCAL_CSS}</style>

      <div className="container">

        {/* Breadcrumb */}
        <nav className="doc-breadcrumb" aria-label="Breadcrumb">
          <Link href="/sandbox" className="doc-breadcrumb__link">Sandbox</Link>
          <span className="doc-breadcrumb__sep">/</span>
          <span className="doc-breadcrumb__current">Revenue Intelligence | Depo44</span>
        </nav>

        {/* Hero */}
        <div className="doc-hero">
          <h1 className="doc-hero__title">Revenue Intelligence | Depo44</h1>
          <div className="doc-hero__tags">
            <span className="sandbox-card__tag">iGaming</span>
            <span className="sandbox-card__tag">AI Prototype</span>
            <span className="sandbox-card__tag">Revenue</span>
          </div>
          <p className="doc-hero__description">
            Enter 9 operator KPIs and get AI-generated revenue health scores, risk assessment, and prioritized action recommendations. | Prototype v0.1
          </p>
        </div>


        {/* Metrics grid */}
        <div className="ri-grid" style={{ marginBottom: 32 }}>
          {METRICS.map(m => (
            <div key={m.key} className="bg-card border border-border rounded-2xl shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-[border-color,box-shadow] duration-200 hover:border-subtle-border hover:shadow-[0_4px_16px_rgba(16,24,40,0.08)]" style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)', marginBottom: 8 }}>
                {m.label}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Input
                  type="number"
                  value={values[m.key]}
                  step={m.step}
                  onChange={e => setMetric(m.key, e.target.value)}
                  className="h-9 text-sm font-medium"
                />
                <span style={{ fontSize: 12, color: 'var(--color-muted-foreground)', flexShrink: 0 }}>{m.unit}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)', opacity: 0.6, marginTop: 6 }}>
                bench: {m.bench}
              </div>
            </div>
          ))}
        </div>

        {/* Analyze button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
          <Button disabled={loading} onClick={runAnalysis}>
            <Sparkles data-icon="inline-start" /> Analyze &amp; Generate Insights
          </Button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--color-muted-foreground)', padding: '20px 0', marginBottom: 16 }}>
            <div className="ri-spin" style={{ width: 14, height: 14, border: '1px solid var(--color-border)', borderTopColor: '#00d68f', borderRadius: '50%', flexShrink: 0 }} />
            Analyzing operator metrics against benchmarks...
          </div>
        )}

        {/* Error */}
        {errorMsg !== null && (
          <div style={{ marginBottom: 40, padding: '14px 16px', borderRadius: 8, borderLeft: '2px solid #ff4d6a', background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6, color: '#ff4d6a' }}>Error</div>
            <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--color-foreground)' }}>
              Could not connect to AI service. Direct browser access requires a server-side proxy — coming soon.
              {errorMsg ? ` (${errorMsg})` : ''}
            </div>
          </div>
        )}

        {/* Result */}
        {result !== null && (
          <>
            {/* Output header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
              <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}>
                AI Analysis Complete — {new Date().toLocaleTimeString()}
              </div>
            </div>

            {/* Score cards — full width */}
            <div className="doc-kpi-row">
              {SCORE_CARDS.map(s => {
                const color = scoreColor(result.scores[s.key], s.invert)
                const status = s.invert
                  ? result.scores[s.key] < 30 ? 'Low risk' : result.scores[s.key] < 60 ? 'Moderate risk' : 'High risk'
                  : result.scores[s.key] >= 70 ? 'Good' : result.scores[s.key] >= 45 ? 'At risk' : 'Critical'
                return (
                  <div key={s.key} className="doc-kpi">
                    <span className="doc-kpi__value" style={{ color }}>{result.scores[s.key]}</span>
                    <span className="doc-kpi__label">{s.label}</span>
                    <span className="doc-kpi__note">{status}</span>
                  </div>
                )
              })}
            </div>

            {/* Top action */}
            <div style={{ marginBottom: 12, padding: '12px 16px', borderLeft: '2px solid #4d9eff' }}>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, color: '#4d9eff' }}>Top Priority Action</div>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--color-foreground)' }}>{result.top_action}</div>
            </div>

            {/* Insights */}
            {result.insights.map((ins, i) => {
              const c = INSIGHT_C[ins.type]
              return (
                <div key={i} style={{ marginBottom: 12, padding: '12px 16px', borderLeft: `2px solid ${c.border}` }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, color: c.tag }}>{ins.tag}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--color-foreground)' }}>{ins.text}</div>
                </div>
              )
            })}

            {/* ── Methodology ─────────────────────────────────────────────── */}
            <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid var(--color-border)' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
                How scores are calculated
              </h2>
              <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', marginBottom: 24, lineHeight: 1.6 }}>
                Each score is a weighted average of normalized metrics. Every metric is mapped to a 0–100 scale using its realistic min/max range, then multiplied by its weight. <strong style={{ fontWeight: 600, color: 'var(--color-foreground)' }}>v</strong> = the value you entered for that metric.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                {METHODOLOGY.map(m => (
                  <div key={m.score} className="bg-card border border-border rounded-2xl" style={{ padding: '20px 24px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>{m.score}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-muted-foreground)', marginBottom: 16, lineHeight: 1.5 }}>{m.description}</div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <th style={{ textAlign: 'left', paddingBottom: 6, fontWeight: 600, color: 'var(--color-muted-foreground)' }}>Metric</th>
                          <th style={{ textAlign: 'right', paddingBottom: 6, fontWeight: 600, color: 'var(--color-muted-foreground)' }}>Weight</th>
                          <th style={{ textAlign: 'right', paddingBottom: 6, fontWeight: 600, color: 'var(--color-muted-foreground)' }}>Formula × 100</th>
                        </tr>
                      </thead>
                      <tbody>
                        {m.components.map((c, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <td style={{ padding: '8px 0' }}>
                              <div style={{ fontSize: 12, color: 'var(--color-foreground)', marginBottom: 3 }}>{c.metric}</div>
                              <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)', lineHeight: 1.5 }}>{c.explain}</div>
                            </td>
                            <td style={{ padding: '8px 0 8px 12px', textAlign: 'right', verticalAlign: 'top', color: 'var(--color-muted-foreground)', whiteSpace: 'nowrap' }}>{c.weight}</td>
                            <td style={{ padding: '8px 0 8px 12px', textAlign: 'right', verticalAlign: 'top', color: 'var(--color-muted-foreground)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{c.formula}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div style={{ marginTop: 12, fontSize: 11, color: 'var(--color-muted-foreground)', opacity: 0.7 }}>
                      {m.threshold}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </>
        )}

        <div className="doc-footnote">
          📋 iGaming AI Prototype — Revenue Intelligence · Author: Yevhenii Holovei · Scope: Operator KPI Analysis · API integration pending
        </div>

      </div>
    </div>
  )
}
