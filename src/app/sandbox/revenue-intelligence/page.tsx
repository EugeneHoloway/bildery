'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DocLayout } from '@/components/doc/DocLayout'

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

/** Tailwind classes for each insight type */
const INSIGHT_CLASSES: Record<InsightType, { wrapper: string; tag: string }> = {
  critical: { wrapper: 'border-l-2 border-l-destructive bg-destructive-bg', tag: 'text-destructive'  },
  warning:  { wrapper: 'border-l-2 border-l-warning bg-warning-bg',         tag: 'text-warning'      },
  good:     { wrapper: 'border-l-2 border-l-success bg-success-bg',         tag: 'text-success'      },
  info:     { wrapper: 'border-l-2 border-l-brand bg-brand-bg',             tag: 'text-brand'        },
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
      { metric: 'Payment Success Rate', weight: '30%', formula: '(v − 65) / 30',   explain: 'min 65% -- payment system is effectively broken below this; max 95% -- practical ceiling due to fraud rejections and bank limits' },
      { metric: 'GGR / Active Player',  weight: '25%', formula: '(v − 25) / 85',   explain: 'min €25 -- barely covers per-player operating costs; max €110 -- upper bound for mass-market (VIP excluded)' },
      { metric: 'Bonus ROI',            weight: '25%', formula: 'v / 3.5',          explain: 'min 0 -- promotions burn budget with zero return; max 3.5x -- rarely exceeded with healthy wagering requirements' },
      { metric: 'Avg Deposit Size',     weight: '10%', formula: '(v − 25) / 75',   explain: 'min €25 -- typical platform minimum deposit; max €100 -- above this is niche high-roller, not mass market' },
      { metric: 'FTD Conversion',       weight: '10%', formula: '(v − 0.5) / 4.5', explain: 'min 0.5% -- below this traffic is junk or onboarding is broken; max 5% -- top operators with strong brand and optimised flow' },
    ],
    threshold: 'Good ≥ 70 | At risk 45–69 | Critical < 45',
  },
  {
    score: 'Retention Score',
    description: 'How well the operator keeps and re-engages its player base.',
    components: [
      { metric: 'Month 1 Churn (inv.)', weight: '45%', formula: '(55 − v) / 40', explain: 'inverted: lower churn = higher score. min 15% -- best-in-class retention; max 55% -- operator is effectively losing its entire base monthly' },
      { metric: 'Reactivation Rate',    weight: '35%', formula: '(v − 5) / 35',  explain: 'min 5% -- lapsed player base is essentially unrecoverable; max 40% -- strong win-back campaigns with personalised offers' },
      { metric: 'Deposit Conversion',   weight: '20%', formula: '(v − 50) / 45', explain: 'min 50% -- half of registered users never deposit, severe funnel break; max 95% -- near-perfect onboarding and payment flow' },
    ],
    threshold: 'Good ≥ 70 | At risk 45–69 | Critical < 45',
  },
  {
    score: 'Risk Level',
    description: 'Aggregate risk exposure across critical failure points. Higher = more risk.',
    components: [
      { metric: 'Payment Success (inv.)', weight: '30%', formula: '(95 − v) / 30',   explain: 'inverted: lower success = higher risk. Range 65–95%; each point below 82% (benchmark floor) directly destroys deposit revenue' },
      { metric: 'Month 1 Churn',          weight: '25%', formula: '(v − 15) / 40',   explain: 'min 15% -- best-case churn baseline; max 55% -- catastrophic retention failure. Above 40% is the critical threshold' },
      { metric: 'Bonus ROI (inv.)',        weight: '20%', formula: '(3.5 − v) / 3.5', explain: 'inverted: below 1.0x operator loses money on every promotion. Range 0–3.5x; below 1.2x is considered a systemic risk' },
      { metric: 'FTD Conversion (inv.)',   weight: '15%', formula: '(3.5 − v) / 3',   explain: 'inverted: low FTD signals broken acquisition funnel. Range 0.5–3.5%; below 2% indicates critical top-of-funnel failure' },
      { metric: 'Support Tickets',         weight: '10%', formula: '(v − 1) / 11',    explain: 'min 1 ticket/100 -- near-perfect product; max 12 -- systemic product or payment issues. Above 7 is flagged as a systemic problem' },
    ],
    threshold: 'Low risk < 30 | Moderate 30–59 | High risk ≥ 60',
  },
  {
    score: 'Overall Score',
    description: 'Composite of all three scores, weighted by business impact.',
    components: [
      { metric: 'Revenue Health',   weight: '40%', formula: 'direct',        explain: 'largest weight -- revenue generation is the primary business objective' },
      { metric: 'Retention Score',  weight: '35%', formula: 'direct',        explain: 'retention directly drives LTV and reduces CAC payback period' },
      { metric: '100 − Risk Level', weight: '25%', formula: 'inverted risk', explain: 'risk is inverted so a low-risk operator contributes positively to overall health' },
    ],
    threshold: 'Good ≥ 70 | At risk 45–69 | Critical < 45',
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreColorClass(n: number, invert = false): string {
  if (invert) {
    if (n < 30) return 'text-success'
    if (n < 60) return 'text-warning'
    return 'text-destructive'
  }
  if (n >= 70) return 'text-success'
  if (n >= 45) return 'text-warning'
  return 'text-destructive'
}

function dotClass(n: number): string {
  if (n >= 70) return 'bg-success'
  if (n >= 45) return 'bg-warning'
  return 'bg-destructive'
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RevenueIntelligencePage() {
  const [values, setValues]     = useState<MetricValues>(DEFAULT_VALUES)
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState<AnalysisResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  function setMetric(key: MetricKey, val: string) {
    setValues(prev => ({ ...prev, [key]: parseFloat(val) || 0 }))
  }

  async function runAnalysis() {
    setLoading(true); setResult(null); setErrorMsg(null)
    await new Promise(r => setTimeout(r, 1200))
    setResult({
      scores: computeScores(values),
      top_action: 'Fix payment routing first -- resolving 71% success rate could recover 20%+ lost revenue immediately.',
      insights: [
        { type: 'critical', tag: 'Payment Failure Crisis',        text: '71% payment success rate is costing ~29% of deposit attempts. Audit PSP routing immediately and add 2 backup providers.' },
        { type: 'critical', tag: 'Bonus Budget Burning',          text: '0.9x bonus ROI means losing money on every promotion. Cap bonus at 15% of first deposit and add 5x wagering requirement.' },
        { type: 'critical', tag: 'Churn Destroying Base',         text: '43% month-1 churn is 8 points above critical threshold. Launch day-7 and day-14 triggered retention emails with 10% reload offer.' },
        { type: 'warning',  tag: 'Reactivation Far Below Benchmark', text: '12% reactivation vs 18% minimum benchmark. Deploy 30-day lapsed player SMS campaign with €5 free spin no-deposit incentive.' },
      ],
    })
    setLoading(false)
  }

  return (
    <DocLayout
      title="Revenue Intelligence | Depo44"
      breadcrumbLabel="Sandbox"
      breadcrumbHref="/sandbox"
      tags={[
        { label: 'iGaming',      type: 'tag' },
        { label: 'AI Prototype', type: 'tag' },
        { label: 'Revenue',      type: 'tag' },
      ]}
      description="Enter 9 operator KPIs and get AI-generated revenue health scores, risk assessment, and prioritized action recommendations. | Prototype v0.1"
      footnote="iGaming AI Prototype -- Revenue Intelligence | Author: Yevhenii Holovei | Scope: Operator KPI Analysis | API integration pending"
    >

        {/* Metrics grid */}
        <div className="mb-8 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {METRICS.map(m => (
            <div key={m.key}
              className="rounded-2xl border border-border bg-card px-4 py-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-[border-color,box-shadow] duration-200 hover:border-subtle-border hover:shadow-[0_4px_16px_rgba(16,24,40,0.08)]"
            >
              <p className="mb-2 text-xs text-muted-foreground">{m.label}</p>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  value={values[m.key]}
                  step={m.step}
                  onChange={e => setMetric(m.key, e.target.value)}
                  className="h-9 text-sm font-medium"
                />
                <span className="shrink-0 text-xs text-muted-foreground">{m.unit}</span>
              </div>
              <p className="mt-1.5 text-2xs text-muted-foreground/60">bench: {m.bench}</p>
            </div>
          ))}
        </div>

        {/* Analyze button */}
        <div className="mb-10 flex justify-center">
          <Button disabled={loading} onClick={runAnalysis}>
            <Sparkles data-icon="inline-start" /> Analyze &amp; Generate Insights
          </Button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mb-4 flex items-center gap-3 py-5 text-xs text-muted-foreground">
            <span className="size-3.5 shrink-0 animate-spin rounded-full border border-border border-t-success" />
            Analyzing operator metrics against benchmarks...
          </div>
        )}

        {/* Error */}
        {errorMsg !== null && (
          <div className="mb-10 rounded-lg border border-border border-l-2 border-l-destructive bg-card px-4 py-3.5">
            <p className="mb-1.5 text-2xs font-semibold text-destructive">Error</p>
            <p className="text-sm leading-relaxed text-foreground">
              Could not connect to AI service. Direct browser access requires a server-side proxy -- coming soon.
              {errorMsg ? ` (${errorMsg})` : ''}
            </p>
          </div>
        )}

        {/* Result */}
        {result !== null && (
          <>
            {/* Output header */}
            <div className="mb-6 flex items-center gap-2.5 border-b border-border pb-4">
              <span className={cn('size-[7px] shrink-0 rounded-full', dotClass(result.scores.overall))} />
              <p className="text-xs text-muted-foreground">
                AI Analysis Complete -- {new Date().toLocaleTimeString()}
              </p>
            </div>

            {/* Score cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-14">
              {SCORE_CARDS.map(s => {
                const status = s.invert
                  ? result.scores[s.key] < 30 ? 'Low risk' : result.scores[s.key] < 60 ? 'Moderate risk' : 'High risk'
                  : result.scores[s.key] >= 70 ? 'Good' : result.scores[s.key] >= 45 ? 'At risk' : 'Critical'
                return (
                  <Card key={s.key} className="flex flex-col gap-1 p-5">
                    <span className={cn('text-2xl font-bold tracking-tight', scoreColorClass(result.scores[s.key], s.invert))}>
                      {result.scores[s.key]}
                    </span>
                    <span className="text-xs font-semibold text-foreground">{s.label}</span>
                    <span className="text-xs text-muted-foreground">{status}</span>
                  </Card>
                )
              })}
            </div>

            {/* Top action */}
            <div className="mb-3 border-l-2 border-l-brand px-4 py-3">
              <p className="mb-1 text-2xs font-semibold text-brand">Top Priority Action</p>
              <p className="text-sm leading-relaxed text-foreground">{result.top_action}</p>
            </div>

            {/* Insights */}
            {result.insights.map((ins, i) => {
              const c = INSIGHT_CLASSES[ins.type]
              return (
                <div key={i} className={cn('mb-3 rounded-sm px-4 py-3', c.wrapper)}>
                  <p className={cn('mb-1 text-2xs font-semibold uppercase tracking-wider', c.tag)}>{ins.tag}</p>
                  <p className="text-sm leading-relaxed text-foreground">{ins.text}</p>
                </div>
              )
            })}

            {/* Methodology */}
            <div className="mt-12 border-t border-border pt-8">
              <h2 className="mb-1 text-base font-bold tracking-tight">How scores are calculated</h2>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                Each score is a weighted average of normalized metrics. Every metric is mapped to a 0–100 scale using its realistic min/max range, then multiplied by its weight.{' '}
                <strong className="font-semibold text-foreground">v</strong> = the value you entered for that metric.
              </p>

              <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
                {METHODOLOGY.map(m => (
                  <div key={m.score} className="rounded-2xl border border-border bg-card px-6 py-5">
                    <p className="mb-1 text-sm font-bold">{m.score}</p>
                    <p className="mb-4 text-xs leading-normal text-muted-foreground">{m.description}</p>

                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="pb-1.5 text-left font-semibold text-muted-foreground">Metric</th>
                          <th className="pb-1.5 text-right font-semibold text-muted-foreground">Weight</th>
                          <th className="pb-1.5 text-right font-semibold text-muted-foreground">Formula × 100</th>
                        </tr>
                      </thead>
                      <tbody>
                        {m.components.map((c, i) => (
                          <tr key={i} className="border-b border-border">
                            <td className="py-2">
                              <p className="text-xs text-foreground">{c.metric}</p>
                              <p className="mt-0.5 text-2xs leading-relaxed text-muted-foreground">{c.explain}</p>
                            </td>
                            <td className="py-2 pl-3 text-right align-top whitespace-nowrap text-muted-foreground">{c.weight}</td>
                            <td className="py-2 pl-3 text-right align-top whitespace-nowrap tabular-nums text-muted-foreground">{c.formula}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <p className="mt-3 text-2xs text-muted-foreground/70">{m.threshold}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

    </DocLayout>
  )
}
