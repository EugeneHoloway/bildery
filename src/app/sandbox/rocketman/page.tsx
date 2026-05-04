'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
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
    maxPayout: Infinity,
    color: '#4d9eff',
    targets: [1.5, 2, 3, 5, 10],
  },
  {
    id: 'moon',
    emoji: '🌙',
    name: 'Moon',
    jackpot: '×50',
    houseEdge: 0.03,
    maxPayout: Infinity,
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

const SIM_COUNTS = [
  { label: '10K', value: 10_000 },
  { label: '100K', value: 100_000 },
  { label: '1M', value: 1_000_000 },
]

const BUCKETS = [
  { label: '1.00×', min: 0, max: 1.005 },
  { label: '1.01–1.5×', min: 1.005, max: 1.5 },
  { label: '1.5–2×', min: 1.5, max: 2 },
  { label: '2–3×', min: 2, max: 3 },
  { label: '3–5×', min: 3, max: 5 },
  { label: '5–10×', min: 5, max: 10 },
  { label: '10–25×', min: 10, max: 25 },
  { label: '25–100×', min: 25, max: 100 },
  { label: '> 100×', min: 100, max: Infinity },
]

// ── Simulation logic ───────────────────────────────────────────────────────────

function simulateCrashPoint(houseEdge: number, maxPayout: number): number {
  const r = Math.random()
  if (r < houseEdge) return 1.00
  const u = Math.random()
  const raw = (1 - houseEdge) / (1 - u)
  return Math.min(raw, maxPayout)
}

interface TargetStat {
  target: number
  winRate: number
  empiricalRtp: number
}

interface SimResult {
  n: number
  instantCrash: number
  below2x: number
  above10x: number
  above100x: number
  buckets: number[]
  targetStats: TargetStat[]
  mode: ModeConfig
}

function runSimulation(mode: ModeConfig, n: number): SimResult {
  const bucketCounts = new Array(BUCKETS.length).fill(0)
  let instantCrashCount = 0
  let below2xCount = 0
  let above10xCount = 0
  let above100xCount = 0

  // Target win counters
  const targetWins = new Array(mode.targets.length).fill(0)

  for (let i = 0; i < n; i++) {
    const c = simulateCrashPoint(mode.houseEdge, mode.maxPayout)

    // Buckets
    for (let b = 0; b < BUCKETS.length; b++) {
      if (c >= BUCKETS[b].min && c < BUCKETS[b].max) {
        bucketCounts[b]++
        break
      }
    }

    // Stats
    if (c <= 1.005) instantCrashCount++
    if (c < 2) below2xCount++
    if (c > 10) above10xCount++
    if (c > 100) above100xCount++

    // Target wins
    for (let t = 0; t < mode.targets.length; t++) {
      if (c >= mode.targets[t]) targetWins[t]++
    }
  }

  const targetStats: TargetStat[] = mode.targets.map((target, t) => ({
    target,
    winRate: targetWins[t] / n,
    empiricalRtp: (targetWins[t] * target) / n,
  }))

  return {
    n,
    instantCrash: instantCrashCount / n,
    below2x: below2xCount / n,
    above10x: above10xCount / n,
    above100x: above100xCount / n,
    buckets: bucketCounts,
    mode,
  targetStats,
  }
}

// ── Roadmap & changelog data ───────────────────────────────────────────────────

const ROADMAP = [
  { id: 1, label: 'Iteration 0', desc: 'Project page live', status: 'done' },
  { id: 2, label: 'Iteration 1', desc: 'Math simulator — RNG, RTP, crash distribution', status: 'done' },
  { id: 3, label: 'Iteration 2', desc: 'Visual UI — rocket animation, multiplier curve', status: 'next' },
  { id: 4, label: 'Iteration 3', desc: 'Single-player demo — Supabase, virtual balance', status: 'todo' },
  { id: 5, label: 'Iteration 4', desc: 'Multiplayer prototype — Supabase Realtime', status: 'todo' },
  { id: 6, label: 'Iteration 5', desc: 'Developer handoff — production architecture', status: 'todo' },
]

const CHANGELOG = [
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

function fmt(n: number) {
  return n.toFixed(2)
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RocketmanPage() {
  const [activeModeId, setActiveModeId] = useState<string>('orbit')
  const [simCount, setSimCount] = useState<number>(100_000)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<SimResult | null>(null)

  const activeMode = MODES.find(m => m.id === activeModeId)!

  const handleRun = useCallback(() => {
    setRunning(true)
    setResult(null)
    // Defer to allow loading state to paint
    setTimeout(() => {
      const r = runSimulation(activeMode, simCount)
      setResult(r)
      setRunning(false)
    }, 30)
  }, [activeMode, simCount])

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

        {/* Status banner */}
        <div
          className="bg-card border border-border rounded-xl"
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', marginBottom: 40 }}
        >
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ffb340', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: 'var(--color-muted-foreground)' }}>
            Status: <strong style={{ color: 'var(--color-foreground)' }}>In development</strong>
            &nbsp;·&nbsp; Current: Iteration 1 — math simulator
            &nbsp;·&nbsp; Demo: coming in Iteration 3
          </span>
        </div>

        {/* ── MATH SIMULATOR ─────────────────────────────────────────────────── */}
        <section style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Math simulator
          </h2>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', marginBottom: 24, lineHeight: 1.6 }}>
            Runs crash rounds in the browser using inverse-transform sampling — the same math that will
            power the real game. Select a mode and round count, then verify that RTP converges to target.
          </p>

          {/* Mode selector */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
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
              { label: 'Max payout', value: activeMode.maxPayout === Infinity ? 'Unlimited' : '×' + activeMode.maxPayout },
              { label: 'Jackpot', value: activeMode.jackpot },
            ].map(p => (
              <div key={p.label}>
                <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)', marginBottom: 2 }}>{p.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{p.value}</div>
              </div>
            ))}
          </div>

          {/* N selector + run */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <span style={{ fontSize: 13, color: 'var(--color-muted-foreground)' }}>Rounds:</span>
            {SIM_COUNTS.map(s => (
              <button
                key={s.value}
                onClick={() => { setSimCount(s.value); setResult(null) }}
                className="rounded-lg border transition-colors duration-150"
                style={{
                  padding: '5px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: simCount === s.value ? 'var(--color-foreground)' : 'transparent',
                  borderColor: simCount === s.value ? 'var(--color-foreground)' : 'var(--color-border)',
                  color: simCount === s.value ? 'var(--color-background)' : 'var(--color-muted-foreground)',
                }}
              >
                {s.label}
              </button>
            ))}
            <Button onClick={handleRun} disabled={running} style={{ marginLeft: 8 }}>
              <Play data-icon="inline-start" />
              {running ? 'Running…' : 'Run simulation'}
            </Button>
          </div>

          {/* Loading */}
          {running && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--color-muted-foreground)', padding: '16px 0' }}>
              <div style={{ width: 14, height: 14, border: '1px solid var(--color-border)', borderTopColor: activeMode.color, borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
              Simulating {simCount.toLocaleString()} rounds…
            </div>
          )}

          {/* Results */}
          {result && (
            <>
              {/* Key stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
                {[
                  {
                    label: 'Instant crash (1.00×)',
                    value: pct(result.instantCrash),
                    expected: pct(activeMode.houseEdge),
                    ok: Math.abs(result.instantCrash - activeMode.houseEdge) < 0.005,
                  },
                  {
                    label: 'Crash < 2×',
                    value: pct(result.below2x),
                    expected: pct(1 - (1 - activeMode.houseEdge) / 2),
                    ok: Math.abs(result.below2x - (1 - (1 - activeMode.houseEdge) / 2)) < 0.01,
                  },
                  {
                    label: 'Crash > 10×',
                    value: pct(result.above10x),
                    expected: pct((1 - activeMode.houseEdge) / 10),
                    ok: Math.abs(result.above10x - (1 - activeMode.houseEdge) / 10) < 0.005,
                  },
                  {
                    label: 'Crash > 100×',
                    value: pct(result.above100x, 2),
                    expected: activeMode.maxPayout < 100 ? 'n/a (capped)' : pct((1 - activeMode.houseEdge) / 100, 2),
                    ok: activeMode.maxPayout < 100 || Math.abs(result.above100x - (1 - activeMode.houseEdge) / 100) < 0.001,
                  },
                ].map(s => (
                  <div key={s.label} className="bg-card border border-border rounded-xl" style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)', marginBottom: 8 }}>{s.label}</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>{s.value}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                      <span style={{ color: 'var(--color-muted-foreground)' }}>expected {s.expected}</span>
                      <span style={{ color: s.ok ? '#00d68f' : '#ffb340', fontWeight: 600 }}>{s.ok ? '✓' : '~'}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* RTP table */}
              <div className="bg-card border border-border rounded-xl" style={{ padding: '16px 20px', marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
                  RTP by auto-cashout target — expected {pct(1 - activeMode.houseEdge)} for all
                </div>
                <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
                  {result.targetStats.map(ts => (
                    <div key={ts.target} style={{ flex: '1 1 80px', padding: '8px 12px', borderRight: '1px solid var(--color-border)' }}>
                      <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)', marginBottom: 4 }}>Cash out at {ts.target}×</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: activeMode.color }}>{pct(ts.empiricalRtp)}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)', marginTop: 2 }}>
                        win rate {pct(ts.winRate)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Histogram */}
              <div className="bg-card border border-border rounded-xl" style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
                  Crash distribution — {result.n.toLocaleString()} rounds
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {BUCKETS.map((b, i) => {
                    const count = result.buckets[i]
                    const share = count / result.n
                    const barWidth = (count / maxBucket) * 100
                    return (
                      <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 80, fontSize: 11, color: 'var(--color-muted-foreground)', flexShrink: 0, textAlign: 'right' }}>
                          {b.label}
                        </div>
                        <div style={{ flex: 1, height: 20, background: 'var(--color-subtle)', borderRadius: 4, overflow: 'hidden' }}>
                          <div
                            style={{
                              width: barWidth + '%',
                              height: '100%',
                              background: activeMode.color,
                              opacity: 0.7,
                              borderRadius: 4,
                              transition: 'width 0.4s ease',
                            }}
                          />
                        </div>
                        <div style={{ width: 52, fontSize: 11, color: 'var(--color-muted-foreground)', flexShrink: 0 }}>
                          {pct(share)}
                        </div>
                        <div style={{ width: 56, fontSize: 11, color: 'var(--color-muted-foreground)', flexShrink: 0, textAlign: 'right' }}>
                          {count.toLocaleString()}
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
            Each mode has its own math model, volatility curve, and visual theme.
            The rocket flies higher as the multiplier grows — further destinations mean higher risk and reward.
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
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background:
                      item.status === 'done' ? '#00d68f' :
                      item.status === 'next' ? '#ffb340' :
                      'var(--color-border)',
                  }}
                />
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
