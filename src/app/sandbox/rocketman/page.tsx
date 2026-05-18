'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Play, Orbit, Moon, Globe2, Loader2, Check, CircleAlert, type LucideIcon } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis } from 'recharts'
import { cn } from '@/lib/utils'
import { DocLayout } from '@/components/doc/DocLayout'
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart'

// ── Mode config ────────────────────────────────────────────────────────────────

interface ModeConfig {
  id: string
  Icon: LucideIcon
  name: string
  jackpot: string
  houseEdge: number
  maxPayout: number
  color: string
  targets: number[]
}

const MODES: ModeConfig[] = [
  { id: 'orbit', Icon: Orbit,  name: 'Orbit', jackpot: '×10',  houseEdge: 0.04, maxPayout: 10,  color: 'var(--color-chart-4)',    targets: [1.5, 2, 3, 5, 10] },
  { id: 'moon',  Icon: Moon,   name: 'Moon',  jackpot: '×50',  houseEdge: 0.03, maxPayout: 50,  color: 'var(--color-warning)',    targets: [2, 5, 10, 25, 50] },
  { id: 'mars',  Icon: Globe2, name: 'Mars',  jackpot: '×100', houseEdge: 0.02, maxPayout: 100, color: 'var(--color-destructive)', targets: [5, 10, 25, 50, 100] },
]

const PLAYER_COUNTS = [1, 10, 100, 1000]
const ROUND_COUNTS  = [1, 10, 100, 1000]
const BET_PRESETS   = [{ label: '5¢', value: 0.05 }, { label: '10¢', value: 0.10 }, { label: '50¢', value: 0.50 }, { label: '$1', value: 1.00 }]

const BUCKETS = [
  { label: '1.00×',    min: 0,   max: 1.005, mid: 1.00 },
  { label: '1.01–1.5×',min: 1.005,max: 1.5,  mid: 1.25 },
  { label: '1.5–2×',  min: 1.5,  max: 2,     mid: 1.75 },
  { label: '2–3×',    min: 2,    max: 3,     mid: 2.5  },
  { label: '3–5×',    min: 3,    max: 5,     mid: 4    },
  { label: '5–10×',   min: 5,    max: 10,    mid: 7.5  },
  { label: '10–25×',  min: 10,   max: 25,    mid: 17.5 },
  { label: '25–100×', min: 25,   max: 100,   mid: 62.5 },
  { label: '> 100×',  min: 100,  max: Infinity, mid: 150 },
]

// ── Simulation ─────────────────────────────────────────────────────────────────

function simulateCrashPoint(houseEdge: number, maxPayout: number): number {
  if (Math.random() < houseEdge) return 1.00
  return Math.min(1 / (1 - Math.random()), maxPayout)
}

interface TargetStat { target: number; winRate: number; empiricalRtp: number; avgReturnPerRound: number; operatorPerRound: number }
interface SimResult {
  n: number; betAmount: number; instantCrash: number; below2x: number; above10x: number; above100x: number
  buckets: number[]; bucketSums: number[]; totalWagered: number; totalPaidOut: number
  operatorProfit: number; operatorPerRound: number; targetStats: TargetStat[]; mode: ModeConfig
}

function runSimulation(mode: ModeConfig, n: number, betAmount: number): SimResult {
  const bucketCounts = new Array(BUCKETS.length).fill(0)
  const bucketSums   = new Array(BUCKETS.length).fill(0)
  let instantCrashCount = 0, below2xCount = 0, above10xCount = 0, above100xCount = 0
  const targetWins = new Array(mode.targets.length).fill(0)
  for (let i = 0; i < n; i++) {
    const c = simulateCrashPoint(mode.houseEdge, mode.maxPayout)
    for (let b = 0; b < BUCKETS.length; b++) {
      if (c >= BUCKETS[b].min && c < BUCKETS[b].max) { bucketCounts[b]++; bucketSums[b] += c; break }
    }
    if (c <= 1.005) instantCrashCount++
    if (c < 2) below2xCount++
    if (c > 10) above10xCount++
    if (c > 100) above100xCount++
    for (let t = 0; t < mode.targets.length; t++) { if (c >= mode.targets[t]) targetWins[t]++ }
  }
  const totalWagered = n * betAmount
  const totalPaidOut = totalWagered * (1 - mode.houseEdge)
  const targetStats: TargetStat[] = mode.targets.map((target, t) => {
    const wins = targetWins[t]
    const winRate = wins / n
    const empiricalRtp = (wins * target) / n
    const avgReturnPerRound = (wins * target * betAmount - n * betAmount) / n
    return { target, winRate, empiricalRtp, avgReturnPerRound, operatorPerRound: -avgReturnPerRound }
  })
  return { n, betAmount, instantCrash: instantCrashCount / n, below2x: below2xCount / n, above10x: above10xCount / n, above100x: above100xCount / n, buckets: bucketCounts, bucketSums, totalWagered, totalPaidOut, operatorProfit: totalWagered * mode.houseEdge, operatorPerRound: betAmount * mode.houseEdge, targetStats, mode }
}

// ── Roadmap & changelog ────────────────────────────────────────────────────────

const ROADMAP = [
  { id: 1, label: 'Iteration 0', desc: 'Project page live', status: 'done' },
  { id: 2, label: 'Iteration 1', desc: 'Math simulator -- RNG, RTP, crash distribution', status: 'done' },
  { id: 3, label: 'Iteration 2', desc: 'Visual UI -- static prototype, SVG curve, space theme', status: 'done' },
  { id: 4, label: 'Iteration 3', desc: 'Animated demo -- live multiplier, cash out button, auto-restart', status: 'done' },
  { id: 5, label: 'Iteration 4', desc: 'Single-player -- Supabase, virtual balance', status: 'next' },
  { id: 6, label: 'Iteration 5', desc: 'Multiplayer prototype -- Supabase Realtime', status: 'todo' },
  { id: 7, label: 'Iteration 6', desc: 'Developer handoff -- production architecture', status: 'todo' },
]

const CHANGELOG = [
  { date: '2026-05-04', version: 'v0.5', title: 'Animated game loop -- Iteration 3', notes: 'Full game animation at /sandbox/rocketman/demo. 5-phase state machine: idle → countdown (5 s RAF timer) → flying → cashed_out | crashed → countdown loop. Multiplier grows at e^(t × ln(10)/10000) -- reaches ×10 in exactly 10 seconds. Crash RNG: 1/(1−u) capped at ×10, 4% instant-crash probability. RAF-based animation with stale-closure prevention via useRef. Visual phase feedback: blue curve (flying), green (cashed out), red (crashed). Rocket emoji → 💥 on crash. Bottom control bar adapts to each phase. Auto-restart: 1.8 s delay after crash, 2 s after cash out, then 5 s countdown.' },
  { date: '2026-05-04', version: 'v0.4', title: 'Visual prototype -- Orbit mode', notes: 'Iteration 2: static visual mockup of the Orbit game screen at /sandbox/rocketman/demo. SVG canvas (720×420) with space theme: dark background, star field, exponential multiplier curve (10^(t/10)) with gradient fill and glow stroke. Rocket emoji at curve tip, large 4.20× multiplier display. Left panel with mock player list (User/Bet/Win). Bottom controls: current bet, live win amount, CASH OUT button. No animation yet -- pure static snapshot at ×4.20.' },
  { date: '2026-05-04', version: 'v0.3', title: 'Math fixes + session model', notes: 'Fixed RNG formula bug: replaced (1−h)/(1−u) with 1/(1−u) -- crash points are now always ≥ 1×, instant crash rate correctly converges to house edge. Fixed operator earnings: switched from empirical "ride-to-crash" calculation (which showed operator losing money) to correct theoretical values (N × bet × houseEdge). Replaced "Simulation size" selector with "Players per round" (1/10/100/1000) and "Rounds" (1/10/100/1000) -- simulator now models a real session. Removed redundant "Operator edge/round" column, replaced with "Operator / 1K rounds" showing dollar earnings per 1,000 rounds. Hard payout caps confirmed for all modes: Orbit ×10, Moon ×50, Mars ×100. UI: aligned card heights across rows, added section titles, removed container background.' },
  { date: '2026-05-04', version: 'v0.2', title: 'Bet amount + operator earnings', notes: 'Added bet amount selector (5¢, 10¢, 50¢, $1, custom input). Crash distribution histogram now shows dollar returns per bucket. New Operator Earnings block: total wagered, paid out to players, operator profit, profit per round.' },
  { date: '2026-05-04', version: 'v0.1', title: 'Math simulator', notes: 'Interactive crash simulator with three modes (Orbit/Moon/Mars). Runs up to 1M rounds in browser using inverse-transform sampling. Verifies RTP convergence and shows crash distribution histogram.' },
  { date: '2026-05-04', version: 'v0.0', title: 'Project started', notes: 'Iteration 0 -- project page live on bildery.com/sandbox/rocketman.' },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function pct(n: number, decimals = 1) { return (n * 100).toFixed(decimals) + '%' }
function usd(n: number) {
  const abs = Math.abs(n), sign = n < 0 ? '-' : '+'
  if (abs >= 1000) return sign + '$' + (abs / 1000).toFixed(1) + 'K'
  if (abs >= 1)    return sign + '$' + abs.toFixed(2)
  return sign + (abs * 100).toFixed(1) + '¢'
}
function usdPlain(n: number) {
  if (Math.abs(n) >= 1000) return '$' + (n / 1000).toFixed(1) + 'K'
  if (Math.abs(n) >= 1)    return '$' + n.toFixed(2)
  return (n * 100).toFixed(1) + '¢'
}

function SelectorButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-2.5 py-1 rounded-md border text-xs font-semibold cursor-pointer transition-all',
        active ? 'bg-foreground text-background border-foreground' : 'bg-transparent text-muted-foreground border-border hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RocketmanPage() {
  const [activeModeId, setActiveModeId] = useState<string>('orbit')
  const [playerCount,  setPlayerCount]  = useState<number>(10)
  const [roundCount,   setRoundCount]   = useState<number>(100)
  const [betAmount,    setBetAmount]    = useState<number>(1.00)
  const [customBet,    setCustomBet]    = useState<string>('')
  const [running,      setRunning]      = useState(false)
  const [result,       setResult]       = useState<SimResult | null>(null)

  const activeMode = MODES.find(m => m.id === activeModeId)!
  const simCount = playerCount * roundCount

  const handleBetPreset = (val: number) => { setBetAmount(val); setCustomBet(''); setResult(null) }
  const handleCustomBet = (raw: string) => {
    setCustomBet(raw)
    const v = parseFloat(raw)
    if (!isNaN(v) && v > 0) { setBetAmount(v); setResult(null) }
  }
  const handleRun = useCallback(() => {
    setRunning(true); setResult(null)
    setTimeout(() => { setResult(runSimulation(activeMode, simCount, betAmount)); setRunning(false) }, 30)
  }, [activeMode, simCount, betAmount])

  return (
    <DocLayout
      title="Rocketman"
      breadcrumbLabel="Sandbox"
      breadcrumbHref="/sandbox"
      tags={[
        { label: 'Game',           type: 'tag' },
        { label: 'Crash',          type: 'tag' },
        { label: 'iGaming',        type: 'tag' },
        { label: 'Built in public',type: 'tag' },
      ]}
      description="A provably fair crash game with a space theme. Rocket flies -- multiplier grows. Cash out before it explodes. Three modes with different volatility and jackpots. Built solo as a side project alongside Depo44."
      footnote="Rocketman -- Crash Game | Side project by Yevhenii Holovei | Built in public alongside Depo44"
    >

      {/* Status */}
      <div className="flex items-center gap-2.5 px-4 py-3 border border-border rounded-xl bg-card mb-10">
        <div className="size-2 shrink-0 rounded-full bg-warning" />
        <p className="text-sm text-muted-foreground">
          Status: <strong className="text-foreground">In development</strong>
          &nbsp;|&nbsp; Current: Iteration 3 done -- animated game loop live
          &nbsp;|&nbsp; Next: Iteration 4 -- single-player with Supabase
        </p>
      </div>

      {/* Visual Demo banner */}
      <div className="flex items-center justify-between gap-4 flex-wrap px-5 py-3.5 border border-border rounded-xl bg-card mb-8">
        <div>
          <p className="text-sm font-bold mb-0.5">Iteration 3 -- Animated game loop</p>
          <p className="text-sm text-muted-foreground">
            Live multiplier, cash out button, 5-phase state machine, auto-restart with 5s countdown.
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link href="/sandbox/rocketman/demo">Open demo</Link>
        </Button>
      </div>

      {/* ── MATH SIMULATOR ─────────────────────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="text-base font-bold tracking-tight mb-1">Math simulator</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Runs crash rounds in the browser to verify that RTP and operator margin converge to target values.
          Set a bet amount to see results in dollars alongside percentages.
        </p>

        {/* Mode selector */}
        <div className="flex gap-1.5 flex-wrap mb-5">
          {MODES.map(m => (
            <button
              key={m.id}
              onClick={() => { setActiveModeId(m.id); setResult(null) }}
              className={cn(
                'px-2.5 py-1 rounded-md border text-xs font-semibold cursor-pointer transition-all',
                activeModeId === m.id
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-transparent text-muted-foreground border-border hover:text-foreground',
              )}
            >
              {m.name} {m.jackpot}
            </button>
          ))}
        </div>

        {/* Mode params */}
        <div className="flex flex-wrap gap-6 px-4 py-3 border border-border rounded-xl bg-card mb-5">
          {[
            { label: 'House edge',  value: pct(activeMode.houseEdge) },
            { label: 'Target RTP',  value: pct(1 - activeMode.houseEdge) },
            { label: 'Max payout',  value: '×' + activeMode.maxPayout },
            { label: 'Jackpot',     value: activeMode.jackpot },
          ].map(p => (
            <div key={p.label}>
              <p className="text-xs text-muted-foreground mb-0.5">{p.label}</p>
              <p className="text-sm font-bold">{p.value}</p>
            </div>
          ))}
        </div>

        {/* Bet amount */}
        <div className="flex items-center flex-wrap gap-2 mb-4">
          <span className="text-sm text-muted-foreground shrink-0">Bet per round:</span>
          {BET_PRESETS.map(p => (
            <SelectorButton key={p.value} active={betAmount === p.value && customBet === ''} onClick={() => handleBetPreset(p.value)}>
              {p.label}
            </SelectorButton>
          ))}
          <Input type="number" min="0.01" step="0.01" placeholder="Custom $" value={customBet} onChange={e => handleCustomBet(e.target.value)} className="h-8 w-28 text-sm" />
        </div>

        {/* Players per round */}
        <div className="flex items-center flex-wrap gap-2 mb-3">
          <span className="text-sm text-muted-foreground shrink-0 w-36">Players per round:</span>
          {PLAYER_COUNTS.map(p => (
            <SelectorButton key={p} active={playerCount === p} onClick={() => { setPlayerCount(p); setResult(null) }}>
              {p.toLocaleString()}
            </SelectorButton>
          ))}
        </div>

        {/* Rounds */}
        <div className="flex items-center flex-wrap gap-2 mb-5">
          <span className="text-sm text-muted-foreground shrink-0 w-36">Rounds:</span>
          {ROUND_COUNTS.map(r => (
            <SelectorButton key={r} active={roundCount === r} onClick={() => { setRoundCount(r); setResult(null) }}>
              {r.toLocaleString()}
            </SelectorButton>
          ))}
        </div>

        {/* Session summary + run */}
        <div className="flex items-center flex-wrap gap-3 mb-7">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 border border-border rounded-lg bg-card text-sm text-muted-foreground">
            Session:&nbsp;
            <strong className="text-foreground">
              {playerCount.toLocaleString()} players × {roundCount.toLocaleString()} rounds = {simCount.toLocaleString()} betting events
            </strong>
          </div>
          <Button onClick={handleRun} disabled={running}>
            <Play data-icon="inline-start" />
            {running ? 'Running…' : 'Run simulation'}
          </Button>
        </div>

        {/* Loading */}
        {running && (
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground py-4">
            <Loader2 className="size-4 shrink-0 animate-spin" />
            Simulating {playerCount.toLocaleString()} players × {roundCount.toLocaleString()} rounds ({simCount.toLocaleString()} events)…
          </div>
        )}

        {/* Results */}
        {result && (
          <>
            {/* Operator Earnings */}
            <div className="mb-6">
              <p className="text-sm font-semibold mb-3">
                Operator earnings -- {playerCount.toLocaleString()} players × {roundCount.toLocaleString()} rounds × {usdPlain(betAmount)} bet
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                {[
                  { label: 'Total wagered',      value: usdPlain(result.totalWagered),  note: `${result.n.toLocaleString()} × ${usdPlain(betAmount)}`,              highlight: false },
                  { label: 'Paid out to players', value: usdPlain(result.totalPaidOut),  note: pct(result.totalPaidOut / result.totalWagered) + ' of wagered',        highlight: false },
                  { label: 'Operator profit',     value: usdPlain(result.operatorProfit),note: pct(result.operatorProfit / result.totalWagered) + ' margin',          highlight: true  },
                  { label: 'Profit per round',    value: usdPlain(result.operatorPerRound),note: `target ${usdPlain(betAmount * activeMode.houseEdge)}`,             highlight: false },
                ].map(s => (
                  <Card key={s.label} className="flex flex-col justify-between p-4 min-h-[120px]">
                    <p className="text-xs text-muted-foreground mb-2">{s.label}</p>
                    <p className={cn('text-xl font-extrabold tracking-tight mb-auto', s.highlight ? 'text-success' : 'text-foreground')}>{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-2">{s.note}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Crash distribution stats */}
            <p className="text-sm font-semibold mb-3">Crash distribution stats</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-6">
              {[
                { label: 'Instant crash (1.00×)', value: pct(result.instantCrash),   sub: 'player loses ' + usdPlain(betAmount),                               expected: pct(activeMode.houseEdge),                                               ok: Math.abs(result.instantCrash - activeMode.houseEdge) < 0.005 },
                { label: 'Crash < 2×',             value: pct(result.below2x),        sub: 'return < ' + usdPlain(betAmount * 2),                               expected: pct(1 - (1 - activeMode.houseEdge) / 2),                                 ok: Math.abs(result.below2x - (1 - (1 - activeMode.houseEdge) / 2)) < 0.01 },
                { label: 'Crash > 10×',            value: pct(result.above10x),       sub: 'return > ' + usdPlain(betAmount * 10),                              expected: activeMode.maxPayout < 10 ? 'n/a' : pct((1 - activeMode.houseEdge) / 10), ok: activeMode.maxPayout < 10 || Math.abs(result.above10x - (1 - activeMode.houseEdge) / 10) < 0.005 },
                { label: 'Jackpot reached',        value: pct(result.buckets[result.buckets.length - 2] / result.n + (result.mode.maxPayout <= 100 ? result.buckets[result.buckets.length - 2] / result.n : 0), 2), sub: 'max win ' + usdPlain(betAmount * activeMode.maxPayout), expected: pct((1 - activeMode.houseEdge) / activeMode.maxPayout, 2), ok: true },
              ].map(s => (
                <Card key={s.label} className="p-4">
                  <p className="text-xs text-muted-foreground mb-2">{s.label}</p>
                  <p className="text-xl font-extrabold tracking-tight mb-0.5">{s.value}</p>
                  <p className="text-xs mb-1.5" style={{ color: activeMode.color }}>{s.sub}</p>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-muted-foreground">expected {s.expected}</span>
                    {s.ok
                      ? <Check className="size-3 text-success" />
                      : <CircleAlert className="size-3 text-warning" />
                    }
                  </div>
                </Card>
              ))}
            </div>

            {/* RTP table */}
            <p className="text-sm font-semibold mb-3">Auto-cashout analysis -- bet {usdPlain(betAmount)} per round</p>
            <Card className="mb-6 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    {['Cash out at', 'Win rate', 'Empirical RTP', 'Player avg/round', 'Operator / 1K rounds'].map(h => (
                      <TableHead key={h} className="text-xs">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.targetStats.map(ts => (
                    <TableRow key={ts.target}>
                      <TableCell className="text-xs font-bold" style={{ color: activeMode.color }}>×{ts.target}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{pct(ts.winRate)}</TableCell>
                      <TableCell className="text-xs font-semibold">{pct(ts.empiricalRtp)}</TableCell>
                      <TableCell className={cn('text-xs font-semibold', ts.avgReturnPerRound >= 0 ? 'text-success' : 'text-destructive')}>{usd(ts.avgReturnPerRound)}</TableCell>
                      <TableCell className="text-xs text-success font-semibold">+{usdPlain(ts.operatorPerRound * 1000)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableCaption className="text-left text-xs px-3 pb-3 opacity-70">
                  * &quot;Player avg/round&quot; = net per round for a player always cashing out at this target. Negative = loses on average (expected by design). &quot;Operator / 1K rounds&quot; = operator margin per 1,000 rounds at this bet size.
                </TableCaption>
              </Table>
            </Card>

            {/* Crash distribution histogram */}
            <Card className="p-5">
              <p className="text-sm font-semibold mb-1">Crash distribution -- {result.n.toLocaleString()} rounds</p>
              <p className="text-xs text-muted-foreground mb-4">
                Hover a bar to see share, rounds, and return if player rides to crash.
              </p>
              {(() => {
                const histData = BUCKETS
                  .map((b, i) => {
                    const count = result.buckets[i]
                    if (count === 0) return null
                    const avgCrash = count > 0 ? result.bucketSums[i] / count : b.mid
                    const ridingReturn = i === 0 ? -betAmount : (avgCrash - 1) * betAmount
                    return {
                      range: b.label,
                      count,
                      shareStr: pct(count / result.n),
                      ridingStr: (ridingReturn >= 0 ? '+' : '') + usdPlain(ridingReturn),
                      ridingPos: ridingReturn >= 0,
                    }
                  })
                  .filter((d): d is NonNullable<typeof d> => d !== null)

                const histConfig: ChartConfig = { count: { label: 'Rounds', color: activeMode.color } }

                return (
                  <ChartContainer config={histConfig} style={{ height: `${histData.length * 36 + 8}px` }} className="w-full">
                    <BarChart data={histData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <YAxis
                        dataKey="range"
                        type="category"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        width={60}
                        tick={{ fontSize: 12 }}
                      />
                      <XAxis dataKey="count" type="number" hide />
                      <ChartTooltip
                        cursor={false}
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null
                          const d = payload[0].payload as typeof histData[0]
                          return (
                            <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-md">
                              <p className="font-semibold mb-1.5">{d.range}</p>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between gap-6">
                                  <span className="text-muted-foreground">Rounds</span>
                                  <span className="font-mono font-medium">{d.count.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between gap-6">
                                  <span className="text-muted-foreground">Share</span>
                                  <span className="font-mono">{d.shareStr}</span>
                                </div>
                                <div className="flex items-center justify-between gap-6">
                                  <span className="text-muted-foreground">If riding</span>
                                  <span className={cn('font-mono font-medium', d.ridingPos ? 'text-success' : 'text-destructive')}>
                                    {d.ridingStr}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        }}
                      />
                      <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                    </BarChart>
                  </ChartContainer>
                )
              })()}
            </Card>
          </>
        )}
      </section>

      {/* Game modes */}
      <section className="mb-12">
        <h2 className="text-base font-bold tracking-tight mb-1">Game modes</h2>
        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
          Each mode has a hard payout cap -- the jackpot multiplier is the ceiling.
          If the rocket reaches it, the round ends and all active bets win at that multiplier.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MODES.map(m => (
            <Card key={m.id} className="p-5">
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-muted">
                <m.Icon className="size-5 text-muted-foreground" />
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-bold">{m.name}</span>
                <span className="text-sm font-bold" style={{ color: m.color }}>{m.jackpot}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                RTP {pct(1 - m.houseEdge)} | House edge {pct(m.houseEdge)}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {m.id === 'orbit' && 'Standard mode. Lower risk, frequent crashes, entry-level bets.'}
                {m.id === 'moon'  && 'Higher volatility. Rare big wins. For players who want more.'}
                {m.id === 'mars'  && 'Maximum volatility. Capped at ×100. High minimum bet. Few reach it.'}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Roadmap */}
      <section className="mb-12">
        <h2 className="text-base font-bold tracking-tight mb-5">Roadmap</h2>
        <div className="flex flex-col gap-2">
          {ROADMAP.map(item => (
            <div
              key={item.id}
              className={cn(
                'flex items-center gap-3.5 px-4 py-3 border border-border rounded-xl',
                item.status === 'done' ? 'bg-card' : 'bg-transparent',
                item.status === 'todo' ? 'opacity-45' : '',
              )}
            >
              <div className={cn('size-2 rounded-full shrink-0', item.status === 'done' ? 'bg-success' : item.status === 'next' ? 'bg-warning' : 'bg-border')} />
              <div className="flex-1">
                <span className="text-sm font-semibold mr-2">{item.label}</span>
                <span className="text-sm text-muted-foreground">{item.desc}</span>
              </div>
              {item.status === 'done' && <span className="text-xs text-success font-semibold">Done</span>}
              {item.status === 'next' && <span className="text-xs text-warning font-semibold">Next</span>}
            </div>
          ))}
        </div>
      </section>

      {/* Changelog */}
      <section className="mb-12">
        <h2 className="text-base font-bold tracking-tight mb-5">Changelog</h2>
        <div className="flex flex-col gap-3">
          {CHANGELOG.map((entry, i) => (
            <Card key={i} className="p-5">
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="text-xs font-bold">{entry.version}</span>
                <span className="text-xs text-muted-foreground">{entry.date}</span>
              </div>
              <p className="text-sm font-semibold mb-1">{entry.title}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{entry.notes}</p>
            </Card>
          ))}
        </div>
      </section>

    </DocLayout>
  )
}
