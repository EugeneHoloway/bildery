'use client'

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

// ── Canvas geometry ────────────────────────────────────────────────────────────

const W = 720
const H = 420
const MAX_MULT = 10
const DEMO_MULT = 4.20  // static snapshot — rocket mid-flight

// Vertical launch with arc:
//   Y = primary axis — multiplier maps to height (bottom=×1, top=×10)
//   X = secondary axis — quadratic: nearly vertical at takeoff, arcs right at altitude
const LAUNCH_X = 80
const X_RANGE  = W - LAUNCH_X - 50  // 590px total horizontal sweep

// Non-linear Y: zone heights shrink as multiplier grows (Fibonacci-style)
// 20px top padding, then zones: ×1→×2=30% ×2→×4=25% ×4→×6=20% ×6→×8=15% ×8→×10=10%
// All scaled to fit H-20px so ×10 lands ~20px from the top edge
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
  return 0
}
function multToX(m: number) {
  const p = (m - 1) / (MAX_MULT - 1)  // 0 → 1
  return LAUNCH_X + p * p * X_RANGE    // quadratic easing: starts vertical, arcs right
}

const ROCKET_X = multToX(DEMO_MULT)
const ROCKET_Y = multToY(DEMO_MULT)

// Curve path (filled area below the arc)
function buildPath() {
  const pts: string[] = [`M ${LAUNCH_X} ${H}`]
  const steps = 120
  for (let i = 0; i <= steps; i++) {
    const m = 1 + ((DEMO_MULT - 1) / steps) * i
    pts.push(`L ${multToX(m).toFixed(1)} ${multToY(m).toFixed(1)}`)
  }
  pts.push(`L ${ROCKET_X.toFixed(1)} ${H} Z`)
  return pts.join(' ')
}

// Curve stroke only (no fill)
function buildStroke() {
  const pts: string[] = []
  const steps = 120
  for (let i = 0; i <= steps; i++) {
    const m = 1 + ((DEMO_MULT - 1) / steps) * i
    const cmd = i === 0 ? 'M' : 'L'
    pts.push(`${cmd} ${multToX(m).toFixed(1)} ${multToY(m).toFixed(1)}`)
  }
  return pts.join(' ')
}

const GRID_MULTS = [2, 4, 6, 8, 10]

// ── Mock stars ─────────────────────────────────────────────────────────────────

const STARS = [
  [60, 30], [140, 80], [220, 20], [310, 60], [400, 35], [490, 90],
  [570, 15], [650, 55], [700, 100], [80, 140], [180, 170], [270, 120],
  [360, 155], [450, 130], [540, 170], [620, 140], [690, 180],
  [30, 200], [120, 250], [200, 220], [290, 270], [380, 240],
  [470, 280], [560, 260], [640, 300], [710, 230],
  [50, 320], [150, 350], [240, 330], [330, 370],
  [600, 340], [680, 380],
]

// ── Mock players ───────────────────────────────────────────────────────────────

const PLAYERS = [
  { name: 'u***5', bet: 1.00, coeff: 1.63, win: 1.63,  done: true  },
  { name: 'p***e', bet: 0.50, coeff: null,  win: null,  done: false },
  { name: 'a***i', bet: 2.00, coeff: 2.10,  win: 4.20,  done: true  },
  { name: 'm***o', bet: 1.00, coeff: null,  win: null,  done: false },
  { name: 'g***7', bet: 0.50, coeff: 1.90,  win: 0.95,  done: true  },
  { name: 's***5', bet: 1.50, coeff: null,  win: null,  done: false },
  { name: 'r***k', bet: 0.10, coeff: 3.40,  win: 0.34,  done: true  },
  { name: 'k***a', bet: 0.50, coeff: null,  win: null,  done: false },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RocketmanDemoPage() {
  const curvePath  = buildPath()
  const strokePath = buildStroke()

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

        {/* Title row */}
        <div className="mb-6 flex items-center gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight">
            Rocketman — Visual prototype
          </h1>
          <Badge variant="outline" className="text-[0.65rem] font-semibold text-brand border-brand/30 bg-brand-bg">
            🛸 Orbit · ×10 jackpot · Static mockup
          </Badge>
        </div>

        {/* ── Game panel ─────────────────────────────────────────────────────── */}
        <div className="mb-6 flex overflow-hidden rounded-2xl border border-border bg-card">

          {/* Left — player list */}
          <div className="w-52 shrink-0 border-r border-border">

            {/* Header */}
            <div className="border-b border-border px-3 py-2.5">
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground">
                Total bets: {PLAYERS.length}
              </p>
            </div>

            {/* Table */}
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

          {/* Center — game canvas */}
          <div className="relative flex-1">

            {/* Mode badge top-right */}
            <div className="absolute right-3 top-3 z-10">
              <Badge variant="secondary" className="text-[0.6rem] font-semibold uppercase tracking-wider text-muted-foreground">
                Orbit target ×10
              </Badge>
            </div>

            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="block w-full h-auto"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Curve gradient fill */}
                <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4d9eff" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#4d9eff" stopOpacity="0.04" />
                </linearGradient>
                {/* Glow for rocket */}
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

              {/* Stars — subtle in light mode, visible in dark */}
              {STARS.map(([sx, sy], i) => (
                <circle
                  key={i}
                  cx={sx} cy={sy}
                  r={i % 5 === 0 ? 1.2 : 0.7}
                  style={{ fill: i % 7 === 0 ? '#4d9eff' : 'var(--color-muted-foreground)' }}
                  opacity={0.18 + (i % 4) * 0.08}
                />
              ))}

              {/* Grid lines + labels */}
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

              {/* Curve fill */}
              <path d={curvePath} fill="url(#curveGrad)" />

              {/* Curve stroke */}
              <path
                d={strokePath}
                fill="none"
                stroke="#4d9eff"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
              />

              {/* Rocket glow circle */}
              <circle
                cx={ROCKET_X} cy={ROCKET_Y}
                r={18}
                fill="#4d9eff"
                opacity={0.12}
              />

              {/* Rocket emoji */}
              <text
                x={ROCKET_X}
                y={ROCKET_Y + 6}
                textAnchor="middle"
                fontSize={22}
                className="select-none"
              >
                🚀
              </text>

              {/* Multiplier display — upper-right open space */}
              <text
                x={W * 0.67} y={H * 0.42}
                textAnchor="middle"
                fontSize={72}
                fontWeight={800}
                style={{ fill: 'var(--color-foreground)' }}
                opacity={0.92}
                fontFamily="system-ui, sans-serif"
                letterSpacing="-3"
              >
                {DEMO_MULT.toFixed(2)}×
              </text>

            </svg>
          </div>
        </div>

        {/* ── Bottom controls ────────────────────────────────────────────────── */}
        <div className="mb-10 flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4">

          {/* Bet info */}
          <div className="flex-1">
            <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
              Your bet
            </p>
            <p className="text-2xl font-extrabold tracking-tight text-foreground">
              $1.00
            </p>
          </div>

          {/* Current win */}
          <div className="flex-1">
            <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
              Current win
            </p>
            <p className="text-2xl font-extrabold tracking-tight text-brand">
              ${(1.00 * DEMO_MULT).toFixed(2)}
            </p>
          </div>

          {/* Cash out button */}
          <Button size="lg" className="h-11 px-8 text-sm font-extrabold tracking-tight">
            Cash out ${(1.00 * DEMO_MULT).toFixed(2)}
          </Button>
        </div>

        {/* Note */}
        <div className="doc-footnote">
          🚀 Static mockup — Iteration 2 · No animation yet · Real game loop coming in Iteration 3
        </div>

      </div>
    </div>
  )
}
