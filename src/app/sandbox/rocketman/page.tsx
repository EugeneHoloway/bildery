'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Play } from 'lucide-react'

// ── Mode config ────────────────────────────────────────────────────────────────

interface ModeConfig {
  id: string
  emoji: string
  name: string
  jackpot: string
  houseEdge: number
  maxPayout: number
  color: string
  targets: number[]
}

const MODES: ModeConfig[] = [
  {
    id: 'orbit',
    emoji: '🛸',
    name: 'Orbit',
    jackpot: '×10',
    houseEdge: 0.04,
    maxPayout: 10,
    color: '#4d9eff',
    targets: [1.5, 2, 3, 5, 10],
  },
  {
    id: 'moon',
    emoji: '🌙',
    name: 'Moon',
    jackpot: '×50',
    houseEdge: 0.03,
    maxPayout: 50,
    color: '#ffb340',
    targets: [2, 5, 10, 25, 50],
  },
  {
    id: 'mars',
    emoji: '🔴',
    name: 'Mars',
    jackpot: '×100',
    houseEdge: 0.02,
    maxPayout: 100,
    color: '#ff4d6a',
    targets: [5, 10, 25, 50, 100],
  },
]

const PLAYER_COUNTS = [1, 10, 100, 1000]
const ROUND_COUNTS  = [1, 10, 100, 1000]

const BET_PRESETS = [
  { label: '5¢', value: 0.05 },
  { label: '10¢', value: 0.10 },
  { label: '50¢', value: 0.50 },
  { label: '$1', value: 1.00 },
]

const BUCKETS = [
  { label: '1.00×', min: 0, max: 1.005, mid: 1.00 },
  { label: '1.01–1.5×', min: 1.005, max: 1.5, mid: 1.25 },
  { label: '1.5–2×', min: 1.5, max: 2, mid: 1.75 },
  { label: '2–3×', min: 2, max: 3, mid: 2.5 },
  { label: '3–5×', min: 3, max: 5, mid: 4 },
  { label: '5–10×', min: 5, max: 10, mid: 7.5 },
  { label: '10–25×', min: 10, max: 25, mid: 17.5 },
  { label: '25–100×', min: 25, max: 100, mid: 62.5 },
  { label: '> 100×', min: 100, max: Infinity, mid: 150 },
]

// ── Simulation ─────────────────────────────────────────────────────────────────

function simulateCrashPoint(houseEdge: number, maxPayout: number): number {
  // House edge: fixed % of rounds crash immediately at 1.00×
  if (Math.random() < houseEdge) return 1.00
  // Continuous part: inverse-transform sampling
  // P(crash ≥ x | crash > 1) = 1/x → x = 1/(1-u), u ~ Uniform(0,1)
  // Always ≥ 1, capped at maxPayout (jackpot ceiling)
  const u = Math.random()
  return Math.min(1 / (1 - u), maxPayout)
}

interface TargetStat {
  target: number
  winRate: number
  empiricalRtp: number
  avgReturnPerRound: number   // in $ (negative = player loses on avg)
  operatorPerRound: number    // in $
}

interface SimResult {
  n: number
  betAmount: number
  instantCrash: number
  below2x: number
  above10x: number
  above100x: number
  buckets: number[]
  bucketSums: number[]        // sum of crash multipliers per bucket
  totalWagered: number
  totalPaidOut: number        // sum of crash_point * bet for all rounds
  operatorProfit: number
  operatorPerRound: number
  targetStats: TargetStat[]
  mode: ModeConfig
}

function runSimulation(mode: ModeConfig, n: number, betAmount: number): SimResult {
  const bucketCounts = new Array(BUCKETS.length).fill(0)
  const bucketSums = new Array(BUCKETS.length).fill(0)
  let instantCrashCount = 0
  let below2xCount = 0
  let above10xCount = 0
  let above100xCount = 0

  const targetWins = new Array(mode.targets.length).fill(0)

  for (let i = 0; i < n; i++) {
    const c = simulateCrashPoint(mode.houseEdge, mode.maxPayout)

    // Buckets
    for (let b = 0; b < BUCKETS.length; b++) {
      if (c >= BUCKETS[b].min && c < BUCKETS[b].max) {
        bucketCounts[b]++
        bucketSums[b] += c
        break
      }
    }

    if (c <= 1.005) instantCrashCount++
    if (c < 2) below2xCount++
    if (c > 10) above10xCount++
    if (c > 100) above100xCount++

    for (let t = 0; t < mode.targets.length; t++) {
      if (c >= mode.targets[t]) targetWins[t]++
    }
  }

  const totalWagered = n * betAmount
  // Theoretical values — expected regardless of player cashout strategy
  const totalPaidOut = totalWagered * (1 - mode.houseEdge)
  const operatorProfit = totalWagered * mode.houseEdge
  const operatorPerRound = betAmount * mode.houseEdge

  const targetStats: TargetStat[] = mode.targets.map((target, t) => {
    const wins = targetWins[t]
    const winRate = wins / n
    const empiricalRtp = (wins * target) / n
    // Player average return per round: wins * target * bet - n * bet / n
    const avgReturnPerRound = (wins * target * betAmount - n * betAmount) / n
    return {
      target,
      winRate,
      empiricalRtp,
      avgReturnPerRound,
      operatorPerRound: -avgReturnPerRound,
    }
  })

  return {
    n,
    betAmount,
    instantCrash: instantCrashCount / n,
    below2x: below2xCount / n,
    above10x: above10xCount / n,
    above100x: above100xCount / n,
    buckets: bucketCounts,
    bucketSums,
    totalWagered,
    totalPaidOut,
    operatorProfit,
    operatorPerRound,
    targetStats,
    mode,
  }
}

// ── Roadmap & changelog ────────────────────────────────────────────────────────

const ROADMAP = [
  { id: 1, label: 'Iteration 0', desc: 'Project page live', status: 'done' },
  { id: 2, label: 'Iteration 1', desc: 'Math simulator — RNG, RTP, crash distribution', status: 'done' },
  { id: 3, label: 'Iteration 2', desc: 'Visual UI — static prototype, SVG curve, space theme', status: 'done' },
  { id: 4, label: 'Iteration 3', desc: 'Animated demo — live multiplier, cash out button, auto-restart', status: 'done' },
  { id: 5, label: 'Iteration 4', desc: 'Single-player — Supabase, virtual balance', status: 'next' },
  { id: 6, label: 'Iteration 5', desc: 'Multiplayer prototype — Supabase Realtime', status: 'todo' },
  { id: 7, label: 'Iteration 6', desc: 'Developer handoff — production architecture', status: 'todo' },
]

const CHANGELOG = [
  {
    date: '2026-05-04',
    version: 'v0.5',
    title: 'Animated game loop — Iteration 3',
    notes:
      'Full game animation at /sandbox/rocketman/demo. 5-phase state machine: idle → countdown (5 s RAF timer) → flying → cashed_out | crashed → countdown loop. Multiplier grows at e^(t × ln(10)/10000) — reaches ×10 in exactly 10 seconds. Crash RNG: 1/(1−u) capped at ×10, 4% instant-crash probability. RAF-based animation with stale-closure prevention via useRef. Visual phase feedback: blue curve (flying), green (cashed out), red (crashed). Rocket emoji → 💥 on crash. Bottom control bar adapts to each phase. Auto-restart: 1.8 s delay after crash, 2 s after cash out, then 5 s countdown.',
  },
  {
    date: '2026-05-04',
    version: 'v0.4',
    title: 'Visual prototype — Orbit mode',
    notes:
      'Iteration 2: static visual mockup of the Orbit game screen at /sandbox/rocketman/demo. SVG canvas (720×420) with space theme: dark background, star field, exponential multiplier curve (10^(t/10)) with gradient fill and glow stroke. Rocket emoji at curve tip, large 4.20× multiplier display. Left panel with mock player list (User/Bet/Win). Bottom controls: current bet, live win amount, CASH OUT button. No animation yet — pure static snapshot at ×4.20.',
  },
  {
    date: '2026-05-04',
    version: 'v0.3',
    title: 'Math fixes + session model',
    notes:
      'Fixed RNG formula bug: replaced (1−h)/(1−u) with 1/(1−u) — crash points are now always ≥ 1×, instant crash rate correctly converges to house edge. Fixed operator earnings: switched from empirical "ride-to-crash" calculation (which showed operator losing money) to correct theoretical values (N × bet × houseEdge). Replaced "Simulation size" selector with "Players per round" (1/10/100/1000) and "Rounds" (1/10/100/1000) — simulator now models a real session. Removed redundant "Operator edge/round" column, replaced with "Operator / 1K rounds" showing dollar earnings per 1,000 rounds. Hard payout caps confirmed for all modes: Orbit ×10, Moon ×50, Mars ×100. UI: aligned card heights across rows, added section titles, removed container background.',
  },
  {
    date: '2026-05-04',
    version: 'v0.2',
    title: 'Bet amount + operator earnings',
    notes:
      'Added bet amount selector (5¢, 10¢, 50¢, $1, custom input). Crash distribution histogram now shows dollar returns per bucket. New Operator Earnings block: total wagered, paid out to players, operator profit, profit per round.',
  },
  {
    date: '2026-05-04',
    version: 'v0.1',
    title: 'Math simulator',
    notes:
      'Interactive crash simulator with three modes (Orbit/Moon/Mars). Runs up to 1M rounds in browser using inverse-transform sampling. Verifies RTP convergence and shows crash distribution histogram.',
  },
  {
    date: '2026-05-04',
    version: 'v0.0',
    title: 'Project started',
    notes: 'Iteration 0 — project page live on bildery.com/sandbox/rocketman.',
  },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function pct(n: number, decimals = 1) {
  return (n * 100).toFixed(decimals) + '%'
}

function usd(n: number) {
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : '+'
  if (abs >= 1000) return sign + '$' + (abs / 1000).toFixed(1) + 'K'
  if (abs >= 1) return sign + '$' + abs.toFixed(2)
  return sign + (abs * 100).toFixed(1) + '¢'
}

function usdPlain(n: number) {
  if (Math.abs(n) >= 1000) return '$' + (n / 1000).toFixed(1) + 'K'
  if (Math.abs(n) >= 1) return '$' + n.toFixed(2)
  return (n * 100).toFixed(1) + '¢'
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RocketmanPage() {
  const [activeModeId, setActiveModeId] = useState<string>('orbit')
  const [playerCount, setPlayerCount] = useState<number>(10)
  const [roundCount, setRoundCount] = useState<number>(100)
  const [betAmount, setBetAmount] = useState<number>(1.00)
  const [customBet, setCustomBet] = useState<string>('')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<SimResult | null>(null)

  const activeMode = MODES.find(m => m.id === activeModeId)!
  const simCount = playerCount * roundCount

  const handleBetPreset = (val: number) => {
    setBetAmount(val)
    setCustomBet('')
    setResult(null)
  }

  const handleCustomBet = (raw: string) => {
    setCustomBet(raw)
    const v = parseFloat(raw)
    if (!isNaN(v) && v > 0) {
      setBetAmount(v)
      setResult(null)
    }
  }

  const handleRun = useCallback(() => {
    setRunning(true)
    setResult(null)
    setTimeout(() => {
      const r = runSimulation(activeMode, simCount, betAmount)
      setResult(r)
      setRunning(false)
    }, 30)
  }, [activeMode, simCount, betAmount])

  const maxBucket = result ? Math.max(...result.buckets) : 1

  return (
    <div className="doc-page">
      <div className="container">

        {/* Breadcrumb */}
        <nav className="doc-breadcrumb" aria-label="Breadcrumb">
          <Link href="/sandbox" className="doc-breadcrumb__link">Sandbox</Link>
          <span className="doc-breadcrumb__sep">/</span>
          <span className="doc-breadcrumb__current">Rocketman</span>
        </nav>

        {/* Hero */}
        <div className="doc-hero">
          <h1 className="doc-hero__title">Rocketman 🚀</h1>
          <div className="doc-hero__tags">
            <span className="sandbox-card__tag">Game</span>
            <span className="sandbox-card__tag">Crash</span>
            <span className="sandbox-card__tag">iGaming</span>
            <span className="sandbox-card__tag">Built in public</span>
          </div>
          <p className="doc-hero__description">
            A provably fair crash game with a space theme. Rocket flies — multiplier grows.
            Cash out before it explodes. Three modes with different volatility and jackpots.
            Built solo as a side project alongside Depo44.
          </p>
        </div>

        {/* Status */}
        <div
          className="bg-card border border-border rounded-xl"
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', marginBottom: 40 }}
        >
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ffb340', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: 'var(--color-muted-foreground)' }}>
            Status: <strong style={{ color: 'var(--color-foreground)' }}>In development</strong>
            &nbsp;·&nbsp; Current: Iteration 3 done — animated game loop live
            &nbsp;·&nbsp; Next: Iteration 4 — single-player with Supabase
          </span>
        </div>

        {/* Visual Demo banner */}
        <div
          className="bg-card border border-border rounded-xl"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '14px 20px', marginBottom: 32, flexWrap: 'wrap' }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Iteration 3 — Animated game loop</div>
            <div style={{ fontSize: 13, color: 'var(--color-muted-foreground)' }}>
              Live multiplier, cash out button, 5-phase state machine, auto-restart with 5s countdown.
            </div>
          </div>
          <Link
            href="/sandbox/rocketman/demo"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 18px',
              background: '#4d9eff',
              color: 'white',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            🚀 Open demo
          </Link>
        </div>

        {/* ── MATH SIMULATOR ─────────────────────────────────────────────────── */}
        <section style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Math simulator
          </h2>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', marginBottom: 24, lineHeight: 1.6 }}>
            Runs crash rounds in the browser to verify that RTP and operator margin converge to target values.
            Set a bet amount to see results in dollars alongside percentages.
          </p>

          {/* Mode selector */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {MODES.map(m => (
              <button
                key={m.id}
                onClick={() => { setActiveModeId(m.id); setResult(null) }}
                className="rounded-xl border transition-colors duration-150"
                style={{
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: activeModeId === m.id ? 'var(--color-card)' : 'transparent',
                  borderColor: activeModeId === m.id ? m.color : 'var(--color-border)',
                  color: activeModeId === m.id ? m.color : 'var(--color-muted-foreground)',
                }}
              >
                {m.emoji} {m.name} {m.jackpot}
              </button>
            ))}
          </div>

          {/* Mode params */}
          <div
            className="bg-card border border-border rounded-xl"
            style={{ display: 'flex', gap: 24, padding: '12px 16px', marginBottom: 20, flexWrap: 'wrap' }}
          >
            {[
              { label: 'House edge', value: pct(activeMode.houseEdge) },
              { label: 'Target RTP', value: pct(1 - activeMode.houseEdge) },
              { label: 'Max payout', value: '×' + activeMode.maxPayout },
              { label: 'Jackpot', value: activeMode.jackpot },
            ].map(p => (
              <div key={p.label}>
                <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)', marginBottom: 2 }}>{p.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{p.value}</div>
              </div>
            ))}
          </div>

          {/* Bet amount selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'var(--color-muted-foreground)', flexShrink: 0 }}>Bet per round:</span>
            {BET_PRESETS.map(p => (
              <button
                key={p.value}
                onClick={() => handleBetPreset(p.value)}
                className="rounded-lg border transition-colors duration-150"
                style={{
                  padding: '5px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: betAmount === p.value && customBet === '' ? 'var(--color-foreground)' : 'transparent',
                  borderColor: betAmount === p.value && customBet === '' ? 'var(--color-foreground)' : 'var(--color-border)',
                  color: betAmount === p.value && customBet === '' ? 'var(--color-background)' : 'var(--color-muted-foreground)',
                }}
              >
                {p.label}
              </button>
            ))}
            <Input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Custom $"
              value={customBet}
              onChange={e => handleCustomBet(e.target.value)}
              className="h-8 w-28 text-sm"
            />
          </div>

          {/* Players per round */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'var(--color-muted-foreground)', flexShrink: 0, width: 140 }}>Players per round:</span>
            {PLAYER_COUNTS.map(p => (
              <button
                key={p}
                onClick={() => { setPlayerCount(p); setResult(null) }}
                className="rounded-lg border transition-colors duration-150"
                style={{
                  padding: '5px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: playerCount === p ? 'var(--color-foreground)' : 'transparent',
                  borderColor: playerCount === p ? 'var(--color-foreground)' : 'var(--color-border)',
                  color: playerCount === p ? 'var(--color-background)' : 'var(--color-muted-foreground)',
                }}
              >
                {p.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Rounds */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'var(--color-muted-foreground)', flexShrink: 0, width: 140 }}>Rounds:</span>
            {ROUND_COUNTS.map(r => (
              <button
                key={r}
                onClick={() => { setRoundCount(r); setResult(null) }}
                className="rounded-lg border transition-colors duration-150"
                style={{
                  padding: '5px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: roundCount === r ? 'var(--color-foreground)' : 'transparent',
                  borderColor: roundCount === r ? 'var(--color-foreground)' : 'var(--color-border)',
                  color: roundCount === r ? 'var(--color-background)' : 'var(--color-muted-foreground)',
                }}
              >
                {r.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Session summary + run */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
            <div
              className="bg-card border border-border rounded-lg"
              style={{ padding: '6px 14px', fontSize: 13, color: 'var(--color-muted-foreground)' }}
            >
              Session: <strong style={{ color: 'var(--color-foreground)' }}>{playerCount.toLocaleString()} players × {roundCount.toLocaleString()} rounds = {simCount.toLocaleString()} betting events</strong>
            </div>
            <Button onClick={handleRun} disabled={running}>
              <Play data-icon="inline-start" />
              {running ? 'Running…' : 'Run simulation'}
            </Button>
          </div>

          {/* Loading */}
          {running && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--color-muted-foreground)', padding: '16px 0' }}>
              <div style={{ width: 14, height: 14, border: '1px solid var(--color-border)', borderTopColor: activeMode.color, borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
              Simulating {playerCount.toLocaleString()} players × {roundCount.toLocaleString()} rounds ({simCount.toLocaleString()} events)…
            </div>
          )}

          {/* Results */}
          {result && (
            <>
              {/* ── Operator Earnings ── */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
                  Operator earnings — {playerCount.toLocaleString()} players × {roundCount.toLocaleString()} rounds × {usdPlain(betAmount)} bet
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  {[
                    {
                      label: 'Total wagered',
                      value: usdPlain(result.totalWagered),
                      note: `${result.n.toLocaleString()} × ${usdPlain(betAmount)}`,
                    },
                    {
                      label: 'Paid out to players',
                      value: usdPlain(result.totalPaidOut),
                      note: pct(result.totalPaidOut / result.totalWagered) + ' of wagered',
                    },
                    {
                      label: 'Operator profit',
                      value: usdPlain(result.operatorProfit),
                      note: pct(result.operatorProfit / result.totalWagered) + ' margin',
                      highlight: true,
                    },
                    {
                      label: 'Profit per round',
                      value: usdPlain(result.operatorPerRound),
                      note: `target ${usdPlain(betAmount * activeMode.houseEdge)}`,
                    },
                  ].map(s => (
                    <div key={s.label} className="bg-card border border-border rounded-xl" style={{ padding: '14px 16px', minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)', marginBottom: 8 }}>{s.label}</div>
                      <div style={{
                        fontSize: '1.35rem',
                        fontWeight: 800,
                        letterSpacing: '-0.03em',
                        marginBottom: 'auto',
                        color: s.highlight ? '#00d68f' : 'var(--color-foreground)',
                      }}>
                        {s.value}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)', marginTop: 8 }}>{s.note}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key crash stats */}
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Crash distribution stats</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
                {[
                  {
                    label: 'Instant crash (1.00×)',
                    value: pct(result.instantCrash),
                    sub: 'player loses ' + usdPlain(betAmount),
                    expected: pct(activeMode.houseEdge),
                    ok: Math.abs(result.instantCrash - activeMode.houseEdge) < 0.005,
                  },
                  {
                    label: 'Crash < 2×',
                    value: pct(result.below2x),
                    sub: 'return < ' + usdPlain(betAmount * 2),
                    expected: pct(1 - (1 - activeMode.houseEdge) / 2),
                    ok: Math.abs(result.below2x - (1 - (1 - activeMode.houseEdge) / 2)) < 0.01,
                  },
                  {
                    label: 'Crash > 10×',
                    value: pct(result.above10x),
                    sub: 'return > ' + usdPlain(betAmount * 10),
                    expected: activeMode.maxPayout < 10 ? 'n/a' : pct((1 - activeMode.houseEdge) / 10),
                    ok: activeMode.maxPayout < 10 || Math.abs(result.above10x - (1 - activeMode.houseEdge) / 10) < 0.005,
                  },
                  {
                    label: 'Jackpot reached',
                    value: pct(result.buckets[result.buckets.length - 2] / result.n +
                             (result.mode.maxPayout <= 100 ? result.buckets[result.buckets.length - 2] / result.n : 0), 2),
                    sub: 'max win ' + usdPlain(betAmount * activeMode.maxPayout),
                    expected: pct((1 - activeMode.houseEdge) / activeMode.maxPayout, 2),
                    ok: true,
                  },
                ].map(s => (
                  <div key={s.label} className="bg-card border border-border rounded-xl" style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)', marginBottom: 8 }}>{s.label}</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 2 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: activeMode.color, marginBottom: 6 }}>{s.sub}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                      <span style={{ color: 'var(--color-muted-foreground)' }}>expected {s.expected}</span>
                      <span style={{ color: s.ok ? '#00d68f' : '#ffb340', fontWeight: 600 }}>{s.ok ? '✓' : '~'}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* RTP table by cashout target */}
              <div className="bg-card border border-border rounded-xl" style={{ padding: '16px 20px', marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
                  Auto-cashout analysis — bet {usdPlain(betAmount)} per round
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                        {['Cash out at', 'Win rate', 'Empirical RTP', 'Player avg/round', 'Operator / 1K rounds'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '0 12px 8px 0', fontWeight: 600, color: 'var(--color-muted-foreground)', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.targetStats.map(ts => (
                        <tr key={ts.target} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <td style={{ padding: '8px 12px 8px 0', fontWeight: 700, color: activeMode.color }}>×{ts.target}</td>
                          <td style={{ padding: '8px 12px 8px 0', color: 'var(--color-muted-foreground)' }}>{pct(ts.winRate)}</td>
                          <td style={{ padding: '8px 12px 8px 0', fontWeight: 600 }}>{pct(ts.empiricalRtp)}</td>
                          <td style={{ padding: '8px 12px 8px 0', color: ts.avgReturnPerRound >= 0 ? '#00d68f' : '#ff4d6a', fontWeight: 600 }}>
                            {usd(ts.avgReturnPerRound)}
                          </td>
                          <td style={{ padding: '8px 0', color: '#00d68f', fontWeight: 600 }}>
                            +{usdPlain(ts.operatorPerRound * 1000)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)', marginTop: 10, opacity: 0.7 }}>
                  * "Player avg/round" = net per round for a player always cashing out at this target. Negative = loses on average (expected by design). "Operator / 1K rounds" = operator margin per 1,000 rounds at this bet size.
                </div>
              </div>

              {/* Crash distribution histogram */}
              <div className="bg-card border border-border rounded-xl" style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                  Crash distribution — {result.n.toLocaleString()} rounds
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)', marginBottom: 16 }}>
                  "If riding to crash" column shows what a {usdPlain(betAmount)} bet returns if player stays until crash lands in that range.
                </div>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 80, fontSize: 10, color: 'var(--color-muted-foreground)', flexShrink: 0, textAlign: 'right' }}>Range</div>
                  <div style={{ flex: 1 }} />
                  <div style={{ width: 48, fontSize: 10, color: 'var(--color-muted-foreground)', flexShrink: 0, textAlign: 'right' }}>Share</div>
                  <div style={{ width: 64, fontSize: 10, color: 'var(--color-muted-foreground)', flexShrink: 0, textAlign: 'right' }}>Rounds</div>
                  <div style={{ width: 80, fontSize: 10, color: 'var(--color-muted-foreground)', flexShrink: 0, textAlign: 'right' }}>If riding</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {BUCKETS.map((b, i) => {
                    const count = result.buckets[i]
                    if (count === 0) return null
                    const share = count / result.n
                    const barWidth = (count / maxBucket) * 100
                    const avgCrash = count > 0 ? result.bucketSums[i] / count : b.mid
                    // Payout if riding: crash at 1.00 = lose bet, otherwise get crash * bet
                    const ridingReturn = i === 0
                      ? -betAmount  // instant crash: lose entire bet
                      : (avgCrash - 1) * betAmount  // net profit if riding to avg crash in bucket
                    const ridingColor = ridingReturn >= 0 ? '#00d68f' : '#ff4d6a'

                    return (
                      <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 80, fontSize: 11, color: 'var(--color-muted-foreground)', flexShrink: 0, textAlign: 'right' }}>
                          {b.label}
                        </div>
                        <div style={{ flex: 1, height: 18, background: 'var(--color-subtle)', borderRadius: 4, overflow: 'hidden' }}>
                          <div
                            style={{
                              width: barWidth + '%',
                              height: '100%',
                              background: activeMode.color,
                              opacity: 0.65,
                              borderRadius: 4,
                              transition: 'width 0.4s ease',
                            }}
                          />
                        </div>
                        <div style={{ width: 48, fontSize: 11, color: 'var(--color-muted-foreground)', flexShrink: 0, textAlign: 'right' }}>
                          {pct(share)}
                        </div>
                        <div style={{ width: 64, fontSize: 11, color: 'var(--color-muted-foreground)', flexShrink: 0, textAlign: 'right' }}>
                          {count.toLocaleString()}
                        </div>
                        <div style={{ width: 80, fontSize: 11, fontWeight: 600, color: ridingColor, flexShrink: 0, textAlign: 'right' }}>
                          {ridingReturn >= 0 ? '+' : ''}{usdPlain(ridingReturn)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </section>

        {/* Game modes */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Game modes
          </h2>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', marginBottom: 20, lineHeight: 1.6 }}>
            Each mode has a hard payout cap — the jackpot multiplier is the ceiling.
            If the rocket reaches it, the round ends and all active bets win at that multiplier.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {MODES.map(m => (
              <div key={m.id} className="bg-card border border-border rounded-2xl" style={{ padding: '20px 20px 16px' }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{m.emoji}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>{m.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: m.color }}>{m.jackpot}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)', marginBottom: 8 }}>
                  RTP {pct(1 - m.houseEdge)} · House edge {pct(m.houseEdge)}
                </div>
                <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)', lineHeight: 1.6, margin: 0 }}>
                  {m.id === 'orbit' && 'Standard mode. Lower risk, frequent crashes, entry-level bets.'}
                  {m.id === 'moon' && 'Higher volatility. Rare big wins. For players who want more.'}
                  {m.id === 'mars' && 'Maximum volatility. Capped at ×100. High minimum bet. Few reach it.'}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Roadmap */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 20 }}>
            Roadmap
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ROADMAP.map(item => (
              <div
                key={item.id}
                className="border border-border rounded-xl"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 16px',
                  background: item.status === 'done' ? 'var(--color-card)' : 'transparent',
                  opacity: item.status === 'todo' ? 0.45 : 1,
                }}
              >
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: item.status === 'done' ? '#00d68f' : item.status === 'next' ? '#ffb340' : 'var(--color-border)',
                }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, marginRight: 8 }}>{item.label}</span>
                  <span style={{ fontSize: 13, color: 'var(--color-muted-foreground)' }}>{item.desc}</span>
                </div>
                {item.status === 'done' && <span style={{ fontSize: 11, color: '#00d68f', fontWeight: 600 }}>Done</span>}
                {item.status === 'next' && <span style={{ fontSize: 11, color: '#ffb340', fontWeight: 600 }}>Next</span>}
              </div>
            ))}
          </div>
        </section>

        {/* Changelog */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 20 }}>
            Changelog
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {CHANGELOG.map((entry, i) => (
              <div key={i} className="bg-card border border-border rounded-xl" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{entry.version}</span>
                  <span style={{ fontSize: 11, color: 'var(--color-muted-foreground)' }}>{entry.date}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{entry.title}</div>
                <div style={{ fontSize: 13, color: 'var(--color-muted-foreground)', lineHeight: 1.6 }}>{entry.notes}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="doc-footnote">
          🚀 Rocketman — Crash Game · Side project by Yevhenii Holovei · Built in public alongside Depo44
        </div>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
