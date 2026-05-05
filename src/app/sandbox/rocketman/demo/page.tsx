'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// ── Canvas constants ───────────────────────────────────────────────────────────

const W            = 720
const H            = 420
const MAX_MULT     = 10
const LAUNCH_X     = 80
const X_RANGE      = W - LAUNCH_X - 50
const GROWTH_RATE  = Math.log(MAX_MULT) / 10_000   // ×10 in exactly 10 s
const COUNTDOWN_S  = 5
const CRASH_HOLD   = 1800                            // ms to show crash before countdown

// ── Non-linear Y scale (fibonacci-style zones) ────────────────────────────────

const Y_ZONES = [
  { m: 1,  t: 1.000 },
  { m: 2,  t: 0.714 },
  { m: 4,  t: 0.476 },
  { m: 6,  t: 0.286 },
  { m: 8,  t: 0.143 },
  { m: 10, t: 0.048 },
]

function multToY(m: number): number {
  for (let i = 0; i < Y_ZONES.length - 1; i++) {
    if (m <= Y_ZONES[i + 1].m) {
      const frac = (m - Y_ZONES[i].m) / (Y_ZONES[i + 1].m - Y_ZONES[i].m)
      return (Y_ZONES[i].t + frac * (Y_ZONES[i + 1].t - Y_ZONES[i].t)) * H
    }
  }
  return Y_ZONES[Y_ZONES.length - 1].t * H
}

function multToX(m: number): number {
  const p = (m - 1) / (MAX_MULT - 1)
  return LAUNCH_X + p * p * X_RANGE
}

function buildPath(mult: number): string {
  if (mult <= 1.01) return `M ${LAUNCH_X} ${H}`
  const rx = multToX(mult)
  const pts: string[] = [`M ${LAUNCH_X} ${H}`]
  for (let i = 0; i <= 80; i++) {
    const m = 1 + ((mult - 1) / 80) * i
    pts.push(`L ${multToX(m).toFixed(1)} ${multToY(m).toFixed(1)}`)
  }
  pts.push(`L ${rx.toFixed(1)} ${H} Z`)
  return pts.join(' ')
}

function buildStroke(mult: number): string {
  if (mult <= 1.01) return `M ${LAUNCH_X} ${H}`
  const pts: string[] = []
  for (let i = 0; i <= 80; i++) {
    const m = 1 + ((mult - 1) / 80) * i
    pts.push(`${i === 0 ? 'M' : 'L'} ${multToX(m).toFixed(1)} ${multToY(m).toFixed(1)}`)
  }
  return pts.join(' ')
}

// ── RNG ───────────────────────────────────────────────────────────────────────

function simulateCrash(): number {
  if (Math.random() < 0.04) return 1.00
  return Math.min(1 / (1 - Math.random()), MAX_MULT)
}

// ── Static data ───────────────────────────────────────────────────────────────

const GRID_MULTS = [2, 4, 6, 8, 10]

const STARS = [
  [60, 30], [140, 80], [220, 20], [310, 60], [400, 35], [490, 90],
  [570, 15], [650, 55], [700, 100], [80, 140], [180, 170], [270, 120],
  [360, 155], [450, 130], [540, 170], [620, 140], [690, 180],
  [30, 200], [120, 250], [200, 220], [290, 270], [380, 240],
  [470, 280], [560, 260], [640, 300], [710, 230],
  [50, 320], [150, 350], [240, 330], [330, 370],
  [600, 340], [680, 380],
]

const PLAYERS = [
  { name: 'u***5', bet: 1.00, win: 1.63, done: true  },
  { name: 'p***e', bet: 0.50, win: null, done: false },
  { name: 'a***i', bet: 2.00, win: 4.20, done: true  },
  { name: 'm***o', bet: 1.00, win: null, done: false },
  { name: 'g***7', bet: 0.50, win: 0.95, done: true  },
  { name: 's***5', bet: 1.50, win: null, done: false },
  { name: 'r***k', bet: 0.10, win: 0.34, done: true  },
  { name: 'k***a', bet: 0.50, win: null, done: false },
]

// ── Types ─────────────────────────────────────────────────────────────────────

type Phase = 'idle' | 'countdown' | 'flying' | 'cashed_out' | 'crashed'

const BET = 1.00

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RocketmanDemoPage() {
  const [phase,      setPhase]      = useState<Phase>('idle')
  const [mult,       setMult]       = useState(1.00)
  const [countdown,  setCountdown]  = useState(COUNTDOWN_S)
  const [cashedAt,   setCashedAt]   = useState<number | null>(null)

  // Refs: mutable values read inside animation loops
  const multRef  = useRef(1.00)
  const phaseRef = useRef<Phase>('idle')

  // All game-loop actions defined once in useEffect, exposed via this ref
  const actions = useRef({ launch: () => {}, cashOut: () => {} })

  useEffect(() => {
    let rafId: number | null = null
    let timerId: ReturnType<typeof setTimeout> | null = null

    function cancel() {
      if (rafId   !== null) { cancelAnimationFrame(rafId); rafId = null }
      if (timerId !== null) { clearTimeout(timerId);       timerId = null }
    }

    function transition(p: Phase) {
      phaseRef.current = p
      setPhase(p)
    }

    // ── Flying ──────────────────────────────────────────────────────────────
    function startFlying() {
      cancel()
      const crashAt = simulateCrash()
      multRef.current = 1.00
      setCashedAt(null)
      setMult(1.00)
      transition('flying')

      let t0 = 0
      function tick(now: number) {
        if (t0 === 0) t0 = now
        const m = Math.exp((now - t0) * GROWTH_RATE)
        if (m >= crashAt) {
          multRef.current = crashAt
          setMult(crashAt)
          transition('crashed')
          timerId = setTimeout(startCountdown, CRASH_HOLD)
          return
        }
        multRef.current = m
        setMult(m)
        rafId = requestAnimationFrame(tick)
      }
      rafId = requestAnimationFrame(tick)
    }

    // ── Countdown ───────────────────────────────────────────────────────────
    function startCountdown() {
      cancel()
      setMult(1.00)
      setCountdown(COUNTDOWN_S)
      transition('countdown')

      let t0 = 0
      function tickCd(now: number) {
        if (t0 === 0) t0 = now
        const remaining = Math.max(0, COUNTDOWN_S - (now - t0) / 1000)
        setCountdown(remaining)
        if (remaining <= 0) { startFlying(); return }
        rafId = requestAnimationFrame(tickCd)
      }
      rafId = requestAnimationFrame(tickCd)
    }

    // ── Cash out ────────────────────────────────────────────────────────────
    function cashOut() {
      if (phaseRef.current !== 'flying') return
      cancel()
      const m = multRef.current
      setCashedAt(m)
      setMult(m)
      transition('cashed_out')
      // Wait for "round to end", then kick off next countdown
      timerId = setTimeout(startCountdown, 2000)
    }

    actions.current = { launch: startCountdown, cashOut }
    return cancel
  }, [])

  // ── Derived display ────────────────────────────────────────────────────────

  const dm         = Math.max(mult, 1.001)
  const rocketX    = multToX(dm)
  const rocketY    = multToY(dm)
  const showCurve  = phase === 'flying' || phase === 'cashed_out' || phase === 'crashed'
  const curvePath  = showCurve ? buildPath(dm)  : ''
  const strokePath = showCurve ? buildStroke(dm) : ''

  const isCrashed   = phase === 'crashed'
  const isCashedOut = phase === 'cashed_out'
  const isFlying    = phase === 'flying'
  const isIdle      = phase === 'idle'
  const isCountdown = phase === 'countdown'

  const curveColor  = isCrashed ? '#ef4444' : isCashedOut ? '#22c55e' : '#4d9eff'
  const multColor   = isCrashed ? '#ef4444' : isCashedOut ? 'var(--color-success)' : 'var(--color-foreground)'
  const fillGrad    = isCrashed ? 'url(#gradCrash)' : isCashedOut ? 'url(#gradWin)' : 'url(#gradFly)'

  const win = (BET * mult).toFixed(2)

  return (
    <div className="doc-page">
      <div className="container">

        {/* Breadcrumb */}
        <nav className="doc-breadcrumb" aria-label="Breadcrumb">
          <Link href="/sandbox" className="doc-breadcrumb__link">Sandbox</Link>
          <span className="doc-breadcrumb__sep">/</span>
          <Link href="/sandbox/rocketman" className="doc-breadcrumb__link">Rocketman</Link>
          <span className="doc-breadcrumb__sep">/</span>
          <span className="doc-breadcrumb__current">Demo</span>
        </nav>

        {/* Title */}
        <div className="mb-6 flex items-center gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight">
            Rocketman — Live demo
          </h1>
          <Badge
            variant="outline"
            className="border-brand/30 bg-brand-bg text-[0.65rem] font-semibold text-brand"
          >
            🛸 Orbit · ×10 jackpot
          </Badge>
        </div>

        {/* ── Game panel ──────────────────────────────────────────────────────── */}
        <div className={`mb-6 flex overflow-hidden rounded-2xl border bg-card transition-colors duration-500 ${
          isCrashed ? 'border-destructive/40' : 'border-border'
        }`}>

          {/* Left — player list */}
          <div className="w-52 shrink-0 border-r border-border">
            <div className="border-b border-border px-3 py-2.5">
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground">
                Total bets: {PLAYERS.length}
              </p>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[0.6rem]">User</TableHead>
                  <TableHead className="text-right text-[0.6rem]">Bet</TableHead>
                  <TableHead className="text-right text-[0.6rem]">Win</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PLAYERS.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs font-medium text-muted-foreground">
                      {p.name}
                    </TableCell>
                    <TableCell className="text-right text-xs text-foreground">
                      ${p.bet.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {p.done && p.win !== null ? (
                        <span className="font-bold text-success">${p.win.toFixed(2)}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Right — canvas */}
          <div className="relative flex-1">

            {/* Mode badge */}
            <div className="absolute right-3 top-3 z-10">
              <Badge
                variant="secondary"
                className="text-[0.6rem] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Orbit target ×10
              </Badge>
            </div>

            <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full">
              <defs>
                <linearGradient id="gradFly" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#4d9eff" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#4d9eff" stopOpacity="0.04" />
                </linearGradient>
                <linearGradient id="gradCrash" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#ef4444" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.04" />
                </linearGradient>
                <linearGradient id="gradWin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#22c55e" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0.04" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Background */}
              <rect width={W} height={H} style={{ fill: 'var(--color-card)' }} />

              {/* Stars */}
              {STARS.map(([sx, sy], i) => (
                <circle
                  key={i}
                  cx={sx} cy={sy}
                  r={i % 5 === 0 ? 1.2 : 0.7}
                  style={{ fill: i % 7 === 0 ? '#4d9eff' : 'var(--color-muted-foreground)' }}
                  opacity={0.18 + (i % 4) * 0.08}
                />
              ))}

              {/* Grid */}
              {GRID_MULTS.map(m => {
                const gy = multToY(m)
                const isJackpot = m === MAX_MULT
                return (
                  <g key={m}>
                    <line
                      x1={0} y1={gy} x2={W} y2={gy}
                      style={{ stroke: isJackpot ? '#4d9eff' : 'var(--color-border)' }}
                      strokeWidth={isJackpot ? 1 : 0.8}
                      strokeDasharray="4 6"
                      opacity={isJackpot ? 0.7 : 1}
                    />
                    <text
                      x={10} y={isJackpot ? gy + 13 : gy - 5}
                      fontSize={10}
                      style={{ fill: isJackpot ? '#4d9eff' : 'var(--color-foreground)' }}
                      fontWeight={isJackpot ? 700 : 500}
                      fontFamily="system-ui, sans-serif"
                    >
                      ×{m}{isJackpot ? ' — Orbit is reached' : ''}
                    </text>
                  </g>
                )
              })}

              {/* Animated curve + rocket */}
              {showCurve && (
                <>
                  <path d={curvePath} fill={fillGrad} />
                  <path
                    d={strokePath}
                    fill="none"
                    stroke={curveColor}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glow)"
                  />
                  <circle cx={rocketX} cy={rocketY} r={18} fill={curveColor} opacity={0.12} />
                  <text
                    x={rocketX} y={rocketY + 6}
                    textAnchor="middle"
                    fontSize={isCrashed ? 20 : 22}
                    className="select-none"
                  >
                    {isCrashed ? '💥' : '🚀'}
                  </text>
                </>
              )}

              {/* Multiplier */}
              {(isFlying || isCrashed || isCashedOut) && (
                <text
                  x={W * 0.67} y={H * 0.42}
                  textAnchor="middle"
                  fontSize={72}
                  fontWeight={800}
                  style={{ fill: multColor }}
                  opacity={0.92}
                  fontFamily="system-ui, sans-serif"
                  letterSpacing="-3"
                >
                  {mult.toFixed(2)}×
                </text>
              )}

              {/* Countdown overlay */}
              {isCountdown && (
                <g>
                  <text
                    x={W / 2} y={H / 2 - 16}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={600}
                    letterSpacing="0.1em"
                    style={{ fill: 'var(--color-muted-foreground)' }}
                    fontFamily="system-ui, sans-serif"
                  >
                    NEXT ROUND IN
                  </text>
                  <text
                    x={W / 2} y={H / 2 + 52}
                    textAnchor="middle"
                    fontSize={80}
                    fontWeight={800}
                    style={{ fill: 'var(--color-foreground)' }}
                    opacity={0.88}
                    fontFamily="system-ui, sans-serif"
                    letterSpacing="-4"
                  >
                    {countdown.toFixed(1)}
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* ── Bottom controls ──────────────────────────────────────────────────── */}
        <div className={`mb-10 flex items-center gap-4 rounded-2xl border bg-card px-5 py-4 transition-colors duration-300 ${
          isCrashed ? 'border-destructive/40' : 'border-border'
        }`}>

          {/* IDLE */}
          {isIdle && (
            <>
              <div className="flex-1">
                <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
                  Your bet
                </p>
                <p className="text-2xl font-extrabold tracking-tight text-foreground">
                  ${BET.toFixed(2)}
                </p>
              </div>
              <p className="flex-1 text-sm text-muted-foreground">
                Cash out before the rocket crashes to win.
              </p>
              <Button
                size="lg"
                className="h-11 px-10 font-extrabold tracking-tight"
                onClick={() => actions.current.launch()}
              >
                🚀 Launch
              </Button>
            </>
          )}

          {/* COUNTDOWN */}
          {isCountdown && (
            <>
              <div className="flex-1">
                <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
                  Your bet
                </p>
                <p className="text-2xl font-extrabold tracking-tight text-foreground">
                  ${BET.toFixed(2)}
                </p>
              </div>
              <div className="flex-1">
                <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
                  Starting in
                </p>
                <p className="text-2xl font-extrabold tracking-tight text-foreground">
                  {countdown.toFixed(1)}s
                </p>
              </div>
              <p className="text-sm text-muted-foreground">Placing bets…</p>
            </>
          )}

          {/* FLYING */}
          {isFlying && (
            <>
              <div className="flex-1">
                <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
                  Your bet
                </p>
                <p className="text-2xl font-extrabold tracking-tight text-foreground">
                  ${BET.toFixed(2)}
                </p>
              </div>
              <div className="flex-1">
                <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
                  Current win
                </p>
                <p className="text-2xl font-extrabold tracking-tight text-brand">
                  ${win}
                </p>
              </div>
              <Button
                size="lg"
                className="h-11 animate-pulse px-8 font-extrabold tracking-tight"
                onClick={() => actions.current.cashOut()}
              >
                Cash out ${win}
              </Button>
            </>
          )}

          {/* CASHED OUT */}
          {isCashedOut && (
            <>
              <div className="flex-1">
                <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
                  Cashed out at
                </p>
                <p className="text-2xl font-extrabold tracking-tight text-foreground">
                  ×{cashedAt?.toFixed(2)}
                </p>
              </div>
              <div className="flex-1">
                <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
                  You won
                </p>
                <p className="text-2xl font-extrabold tracking-tight text-success">
                  +${(BET * (cashedAt ?? 1)).toFixed(2)}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">Waiting for next round…</p>
            </>
          )}

          {/* CRASHED */}
          {isCrashed && (
            <>
              <div className="flex-1">
                <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
                  Crashed at
                </p>
                <p className="text-2xl font-extrabold tracking-tight text-destructive">
                  ×{mult.toFixed(2)}
                </p>
              </div>
              <div className="flex-1">
                <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
                  You lost
                </p>
                <p className="text-2xl font-extrabold tracking-tight text-destructive">
                  −${BET.toFixed(2)}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">New round starting…</p>
            </>
          )}
        </div>

        <div className="doc-footnote">
          🚀 Iteration 3 — Animated demo · Orbit mode · Virtual bet $1 · No backend yet
        </div>

      </div>
    </div>
  )
}
