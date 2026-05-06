'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// ── Canvas constants ───────────────────────────────────────────────────────────

const W           = 720
const H           = 420
const MAX_MULT    = 10
const LAUNCH_X    = 80
const END_X       = 670
const TOP_Y       = 20
const GROWTH_RATE = Math.log(MAX_MULT) / 10_000   // ×10 in exactly 10 s
const COUNTDOWN_S = 5
const RESULTS_MS  = 5000
const CRASH_HOLD  = 1500

// ── Smooth quadratic bezier arc ────────────────────────────────────────────────
// Control points: P0 = (LAUNCH_X, H), P1 = (LAUNCH_X, TOP_Y), P2 = (END_X, TOP_Y)
// x(t) = LAUNCH_X + t²·(END_X − LAUNCH_X)
// y(t) = H − (H − TOP_Y)·(2t − t²)

function multToT(m: number): number {
  return Math.min(Math.max((m - 1) / (MAX_MULT - 1), 0), 1)
}

function multToX(m: number): number {
  const t = multToT(m)
  return LAUNCH_X + t * t * (END_X - LAUNCH_X)
}

function multToY(m: number): number {
  const t = multToT(m)
  return H - (H - TOP_Y) * (2 * t - t * t)
}

// Tangent angle from "up" (0,−1) clockwise → SVG rotation degrees
function multToAngle(m: number): number {
  const t = multToT(m)
  const dx = 2 * t * (END_X - LAUNCH_X)
  const dy = -2 * (H - TOP_Y) * (1 - t)   // negative = upward in SVG coords
  return Math.atan2(dx, -dy) * 180 / Math.PI
}

function buildPath(mult: number): string {
  if (mult <= 1.001) return `M ${LAUNCH_X} ${H}`
  const pts = [`M ${LAUNCH_X} ${H}`]
  for (let i = 0; i <= 80; i++) {
    const m = 1 + ((mult - 1) / 80) * i
    pts.push(`L ${multToX(m).toFixed(1)} ${multToY(m).toFixed(1)}`)
  }
  pts.push(`L ${multToX(mult).toFixed(1)} ${H} Z`)
  return pts.join(' ')
}

function buildStroke(mult: number): string {
  if (mult <= 1.001) return `M ${LAUNCH_X} ${H}`
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

const PLAYER_NAMES = ['u***5', 'p***e', 'a***i', 'm***o', 'g***7', 's***5', 'r***k', 'k***a']
const BET_OPTS     = [0.10, 0.25, 0.50, 1.00]

// ── Types ─────────────────────────────────────────────────────────────────────

type Phase = 'idle' | 'countdown' | 'flying' | 'cashed_out' | 'crashed' | 'results'

interface LivePlayer {
  id: number
  name: string
  bet: number | null
  cashoutTarget: number       // auto-cashout at this mult
  cashedAt: number | null
  status: 'waiting' | 'in' | 'cashed_out' | 'crashed'
}

interface RoundResult {
  crashPoint: number
  myBet: number
  myCashedAt: number | null
  myProfit: number
  players: LivePlayer[]
  totalBank: number
  totalPlayerProfit: number
  providerProfit: number
}

interface HistoryRow {
  round: number
  crashPoint: number
  bank: number
  paidToWinners: number   // gross return to all winners
  providerEarned: number  // bank − paidToWinners
}

const SESSION_SIZE = 10

function makePlayers(): LivePlayer[] {
  return PLAYER_NAMES.map((name, id) => ({
    id,
    name,
    bet: null,
    cashoutTarget: 1.3 + Math.random() * (MAX_MULT * 0.8),
    cashedAt: null,
    status: 'waiting',
  }))
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RocketmanDemoPage() {
  const [phase,       setPhase]       = useState<Phase>('idle')
  const [mult,        setMult]        = useState(1.00)
  const [countdown,   setCountdown]   = useState(COUNTDOWN_S)
  const [cashedAt,    setCashedAt]    = useState<number | null>(null)
  const [betAmount,   setBetAmount]   = useState(1.00)
  const [customBet,   setCustomBet]   = useState('')
  const [livePlayers, setLivePlayers] = useState<LivePlayer[]>(makePlayers())
  const [roundResult,     setRoundResult]     = useState<RoundResult | null>(null)
  const [isStopping,      setIsStopping]      = useState(false)
  const [roundHistory,    setRoundHistory]    = useState<HistoryRow[]>([])
  const [sessionComplete, setSessionComplete] = useState(false)

  const multRef          = useRef(1.00)
  const phaseRef         = useRef<Phase>('idle')
  const betRef           = useRef(1.00)
  const cashedAtRef      = useRef<number | null>(null)
  const livePlayersRef   = useRef<LivePlayer[]>(makePlayers())
  const shouldStopRef    = useRef(false)
  const roundHistoryRef  = useRef<HistoryRow[]>([])
  const sessionRoundRef  = useRef(0)   // 1–10 within current session
  const actions          = useRef({ launch: () => {}, cashOut: () => {}, stop: () => {} })

  // Keep betRef in sync with React state
  useEffect(() => { betRef.current = betAmount }, [betAmount])

  useEffect(() => {
    let rafId: number | null = null
    const timers: ReturnType<typeof setTimeout>[] = []

    function clearAll() {
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null }
      timers.forEach(clearTimeout)
      timers.length = 0
    }

    function addTimer(fn: () => void, ms: number) {
      timers.push(setTimeout(fn, ms))
    }

    function tr(p: Phase) { phaseRef.current = p; setPhase(p) }

    // ── Results ──────────────────────────────────────────────────────────────
    function showResults(crashPoint: number) {
      clearAll()
      const players    = livePlayersRef.current
      const myBet      = betRef.current
      const myCashedAt = cashedAtRef.current

      const myProfit = myCashedAt !== null
        ? +(myBet * (myCashedAt - 1)).toFixed(2)
        : -myBet

      const totalBank = players.reduce((s, p) => s + (p.bet ?? 0), 0) + myBet

      const totalPlayerProfit = players.reduce((s, p) => {
        if (p.bet === null) return s
        return p.status === 'cashed_out' && p.cashedAt !== null
          ? s + +(p.bet * (p.cashedAt - 1)).toFixed(2)
          : s - p.bet
      }, myProfit)

      const totalPaid = players.reduce((s, p) => {
        if (p.bet === null || p.status !== 'cashed_out' || p.cashedAt === null) return s
        return s + p.bet * p.cashedAt
      }, myCashedAt !== null ? myBet * myCashedAt : 0)

      const providerProfit = +(totalBank - totalPaid).toFixed(2)

      // ── Save to session history ──────────────────────────────────────────
      const row: HistoryRow = {
        round: sessionRoundRef.current,
        crashPoint,
        bank: +totalBank.toFixed(2),
        paidToWinners: +totalPaid.toFixed(2),
        providerEarned: providerProfit,
      }
      const nextHistory = [...roundHistoryRef.current, row]
      roundHistoryRef.current = nextHistory
      setRoundHistory(nextHistory)

      const isSessionDone = sessionRoundRef.current >= SESSION_SIZE

      setRoundResult({ crashPoint, myBet, myCashedAt, myProfit, players, totalBank, totalPlayerProfit, providerProfit })
      tr('results')

      addTimer(() => {
        if (shouldStopRef.current || isSessionDone) {
          shouldStopRef.current = false
          setIsStopping(false)
          if (isSessionDone) setSessionComplete(true)
          tr('idle')
          setMult(1.00)
        } else {
          sessionRoundRef.current += 1
          startCountdown()
        }
      }, RESULTS_MS)
    }

    // ── Flying ────────────────────────────────────────────────────────────────
    function startFlying() {
      clearAll()
      const crashAt = simulateCrash()
      multRef.current = 1.00
      cashedAtRef.current = null
      setCashedAt(null)
      setMult(1.00)
      tr('flying')

      let t0 = 0
      function tick(now: number) {
        if (t0 === 0) t0 = now
        const m = Math.exp((now - t0) * GROWTH_RATE)

        // Auto-cashout other players
        let anyChange = false
        const updated = livePlayersRef.current.map(p => {
          if (p.status === 'in' && p.bet !== null && m >= p.cashoutTarget) {
            anyChange = true
            return { ...p, cashedAt: +p.cashoutTarget.toFixed(2), status: 'cashed_out' as const }
          }
          return p
        })
        if (anyChange) {
          livePlayersRef.current = updated
          setLivePlayers([...updated])
        }

        if (m >= crashAt) {
          multRef.current = crashAt
          setMult(crashAt)
          // Mark remaining players as crashed
          const final = livePlayersRef.current.map(p =>
            p.status === 'in' ? { ...p, status: 'crashed' as const } : p
          )
          livePlayersRef.current = final
          setLivePlayers([...final])
          tr('crashed')
          addTimer(() => showResults(crashAt), CRASH_HOLD)
          return
        }

        multRef.current = m
        setMult(m)
        rafId = requestAnimationFrame(tick)
      }
      rafId = requestAnimationFrame(tick)
    }

    // ── Countdown ─────────────────────────────────────────────────────────────
    function startCountdown() {
      clearAll()
      setMult(1.00)
      setCountdown(COUNTDOWN_S)
      setRoundResult(null)
      cashedAtRef.current = null
      setCashedAt(null)
      tr('countdown')

      // Reset players and schedule random bets
      const players = makePlayers()
      livePlayersRef.current = players
      setLivePlayers([...players])

      players.forEach(player => {
        const delay = 400 + Math.random() * (COUNTDOWN_S * 1000 - 800)
        addTimer(() => {
          if (phaseRef.current !== 'countdown') return
          const bet = BET_OPTS[Math.floor(Math.random() * BET_OPTS.length)]
          const next = livePlayersRef.current.map(p =>
            p.id === player.id ? { ...p, bet, status: 'in' as const } : p
          )
          livePlayersRef.current = next
          setLivePlayers([...next])
        }, delay)
      })

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

    // ── Cash out ──────────────────────────────────────────────────────────────
    // Does NOT stop RAF — round continues for other players until crash
    function cashOut() {
      if (phaseRef.current !== 'flying') return
      const m = multRef.current
      cashedAtRef.current = m
      setCashedAt(m)
      tr('cashed_out')
      // RAF keeps running; crash in tick() will call showResults
    }

    // ── Stop (after current round) ────────────────────────────────────────────
    function stop() {
      if (shouldStopRef.current) return
      shouldStopRef.current = true
      setIsStopping(true)
    }

    // ── New session: reset history, start round 1 ─────────────────────────────
    function startSession() {
      roundHistoryRef.current = []
      setRoundHistory([])
      setSessionComplete(false)
      sessionRoundRef.current = 1
      startCountdown()
    }

    actions.current = { launch: startSession, cashOut, stop }
    return clearAll
  }, [])

  // ── Derived display ────────────────────────────────────────────────────────

  const dm         = Math.max(mult, 1.001)
  const rocketX    = multToX(dm)
  const rocketY    = multToY(dm)
  const rocketAng  = multToAngle(dm)

  const showCurve  = ['flying', 'cashed_out', 'crashed', 'results'].includes(phase)
  const curvePath  = showCurve ? buildPath(dm)   : ''
  const strokePath = showCurve ? buildStroke(dm) : ''

  const isCrashed   = phase === 'crashed'
  const isCashedOut = phase === 'cashed_out'
  const isFlying    = phase === 'flying'
  const isIdle      = phase === 'idle'
  const isCountdown = phase === 'countdown'
  const isResults   = phase === 'results'

  const curveColor = isCrashed ? '#ef4444' : isCashedOut ? '#22c55e' : '#4d9eff'
  const multColor  = isCrashed ? '#ef4444' : isCashedOut ? 'var(--color-success)' : 'var(--color-foreground)'
  const fillGrad   = isCrashed ? 'url(#gradCrash)' : isCashedOut ? 'url(#gradWin)' : 'url(#gradFly)'

  const win = (betAmount * mult).toFixed(2)

  // Total bank includes my own bet once a round is running
  const totalBank = livePlayers.reduce((s, p) => s + (p.bet ?? 0), 0) +
    (isIdle ? 0 : betAmount)

  const handleBetPreset = (v: number) => { setBetAmount(v); setCustomBet('') }
  const handleCustomBet = (raw: string) => {
    setCustomBet(raw)
    const v = parseFloat(raw)
    if (!isNaN(v) && v > 0) setBetAmount(v)
  }

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
          <h1 className="text-2xl font-extrabold tracking-tight">Rocketman — Live demo</h1>
          <Badge
            variant="outline"
            className="border-brand/30 bg-brand-bg text-[0.65rem] font-semibold text-brand"
          >
            🛸 Orbit · ×10 jackpot
          </Badge>
        </div>

        {/* ── Game panel ──────────────────────────────────────────────────────── */}
        <div className={`mb-4 flex overflow-hidden rounded-2xl border bg-card transition-colors duration-500 ${
          isCrashed ? 'border-destructive/40' : 'border-border'
        }`}>

          {/* Left — player list */}
          <div className="w-52 shrink-0 border-r border-border">
            <div className="border-b border-border px-3 py-2.5">
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground">
                Total bank
              </p>
              <p className="text-sm font-extrabold text-foreground">${totalBank.toFixed(2)}</p>
              <p className="mt-0.5 text-[0.6rem] text-muted-foreground">
                {isIdle ? '9 players' : `${livePlayers.filter(p => p.bet !== null).length + 1} of 9 placed bets`}
              </p>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[0.6rem]">User</TableHead>
                  <TableHead className="text-right text-[0.6rem]">Bet</TableHead>
                  <TableHead className="text-right text-[0.6rem]">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* YOU row — always first */}
                <TableRow className="bg-brand-bg/30 hover:bg-brand-bg/40">
                  <TableCell className="text-xs font-bold text-brand">you</TableCell>
                  <TableCell className="text-right text-xs font-semibold text-foreground">
                    {!isIdle ? `$${betAmount.toFixed(2)}` : <span className="text-muted-foreground/30">—</span>}
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    {(isCashedOut || (isCrashed && cashedAt !== null) || (isResults && roundResult?.myCashedAt !== null)) ? (
                      <span className="font-bold text-success">
                        ×{(cashedAt ?? roundResult?.myCashedAt ?? 0).toFixed(2)}
                      </span>
                    ) : (isCrashed && cashedAt === null) || (isResults && roundResult?.myCashedAt === null) ? (
                      <span className="font-bold text-destructive">✗</span>
                    ) : isFlying ? (
                      <span className="animate-pulse text-[0.6rem] text-brand">flying</span>
                    ) : isCountdown ? (
                      <span className="text-[0.6rem] text-muted-foreground">waiting</span>
                    ) : (
                      <span className="text-muted-foreground/30">—</span>
                    )}
                  </TableCell>
                </TableRow>

                {/* Other players */}
                {livePlayers.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="text-xs font-medium text-muted-foreground">
                      {p.name}
                    </TableCell>
                    <TableCell className="text-right text-xs text-foreground">
                      {p.bet !== null
                        ? `$${p.bet.toFixed(2)}`
                        : <span className="text-muted-foreground/30">—</span>}
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {p.status === 'cashed_out' && p.cashedAt !== null ? (
                        <span className="font-bold text-success">×{p.cashedAt.toFixed(2)}</span>
                      ) : p.status === 'crashed' ? (
                        <span className="font-bold text-destructive">✗</span>
                      ) : p.status === 'in' ? (
                        <span className="animate-pulse text-[0.6rem] text-brand">flying</span>
                      ) : (
                        <span className="text-muted-foreground/30">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Right — SVG canvas */}
          <div className="relative flex-1">
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
                  key={i} cx={sx} cy={sy}
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
                      x={10}
                      y={isJackpot ? gy + 13 : gy - 5}
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

              {/* Animated curve */}
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
                  {/* Rocket rotated along trajectory tangent */}
                  <g transform={`rotate(${isCrashed ? rocketAng : rocketAng}, ${rocketX}, ${rocketY})`}>
                    <text
                      x={rocketX} y={rocketY + 7}
                      textAnchor="middle"
                      fontSize={isCrashed ? 20 : 22}
                      className="select-none"
                    >
                      {isCrashed ? '💥' : '🚀'}
                    </text>
                  </g>
                </>
              )}

              {/* Multiplier */}
              {(isFlying || isCrashed || isCashedOut || isResults) && (
                <text
                  x={W * 0.67} y={H * 0.42}
                  textAnchor="middle"
                  fontSize={72} fontWeight={800}
                  style={{ fill: multColor }}
                  opacity={0.92}
                  fontFamily="system-ui, sans-serif"
                  letterSpacing="-3"
                >
                  {mult.toFixed(2)}×
                </text>
              )}

              {/* Countdown — progress bar + timer */}
              {isCountdown && (
                <g>
                  {/* Label */}
                  <text
                    x={W / 2} y={H / 2 - 28}
                    textAnchor="middle"
                    fontSize={11} fontWeight={600} letterSpacing="0.1em"
                    style={{ fill: 'var(--color-muted-foreground)' }}
                    fontFamily="system-ui, sans-serif"
                  >
                    ROUND {sessionRoundRef.current} OF {SESSION_SIZE} · STARTING IN
                  </text>
                  {/* Timer number */}
                  <text
                    x={W / 2} y={H / 2 + 22}
                    textAnchor="middle"
                    fontSize={56} fontWeight={800}
                    style={{ fill: 'var(--color-foreground)' }}
                    opacity={0.9}
                    fontFamily="system-ui, sans-serif"
                    letterSpacing="-3"
                  >
                    {countdown.toFixed(1)}
                  </text>
                  {/* Progress bar track */}
                  <rect
                    x={60} y={H / 2 + 38}
                    width={W - 120} height={5} rx={2.5}
                    style={{ fill: 'var(--color-border)' }}
                    opacity={0.35}
                  />
                  {/* Progress bar fill — shrinks left to right */}
                  <rect
                    x={60} y={H / 2 + 38}
                    width={Math.max(0, (countdown / COUNTDOWN_S) * (W - 120))}
                    height={5} rx={2.5}
                    style={{ fill: '#4d9eff' }}
                    opacity={0.85}
                  />
                </g>
              )}

              {/* Results phase: show crash label on canvas */}
              {isResults && roundResult && (
                <text
                  x={W * 0.67} y={H * 0.68}
                  textAnchor="middle"
                  fontSize={13} fontWeight={600}
                  style={{ fill: 'var(--color-muted-foreground)' }}
                  fontFamily="system-ui, sans-serif"
                >
                  Crashed at ×{roundResult.crashPoint.toFixed(2)}
                </text>
              )}
            </svg>
          </div>
        </div>

        {/* ── Bottom controls ──────────────────────────────────────────────────── */}
        <div className={`mb-10 overflow-hidden rounded-2xl border bg-card transition-colors duration-300 ${
          isCrashed ? 'border-destructive/40' : 'border-border'
        }`}>

          {/* Bet selector — shown when idle or countdown */}
          {(isIdle || isCountdown) && (
            <div className="flex flex-wrap items-center gap-2 border-b border-border px-5 py-3">
              <span className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground">
                Bet
              </span>
              {BET_OPTS.map(v => (
                <button
                  key={v}
                  disabled={isCountdown}
                  onClick={() => handleBetPreset(v)}
                  className={`rounded-lg border px-3 py-1 text-xs font-bold transition-colors disabled:opacity-40 ${
                    betAmount === v && customBet === ''
                      ? 'border-brand bg-brand-bg text-brand'
                      : 'border-border text-muted-foreground hover:border-brand/40 hover:text-foreground'
                  }`}
                >
                  ${v.toFixed(2)}
                </button>
              ))}
              <Input
                type="number" min="0.01" step="0.01" placeholder="Custom $"
                value={customBet}
                onChange={e => handleCustomBet(e.target.value)}
                disabled={isCountdown}
                className="h-7 w-28 text-xs disabled:opacity-40"
              />
            </div>
          )}

          {/* Main controls row */}
          <div className="flex flex-wrap items-center gap-4 px-5 py-4">

            {/* IDLE */}
            {isIdle && (
              <>
                <div className="flex-1">
                  <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
                    {sessionComplete ? 'Session complete' : 'Ready to play'}
                  </p>
                  <p className="text-2xl font-extrabold tracking-tight text-foreground">
                    ${betAmount.toFixed(2)} bet
                  </p>
                </div>
                <p className="flex-1 text-sm text-muted-foreground">
                  {sessionComplete
                    ? `10 rounds played. Review the results below, then launch the next session.`
                    : 'Cash out before the rocket crashes to win. 10 rounds per session.'}
                </p>
                <Button
                  size="lg"
                  className="h-11 px-10 font-extrabold tracking-tight"
                  onClick={() => actions.current.launch()}
                >
                  🚀 {sessionComplete ? 'Next session' : 'Launch'}
                </Button>
              </>
            )}

            {/* COUNTDOWN */}
            {isCountdown && (
              <>
                <div className="flex-1">
                  <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
                    Bet locked
                  </p>
                  <p className="text-2xl font-extrabold tracking-tight text-foreground">
                    ${betAmount.toFixed(2)}
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
                <p className="flex-1 text-sm text-muted-foreground">Players placing bets…</p>
                <Button
                  size="lg" variant="outline"
                  className="h-11 px-6 font-bold"
                  disabled={isStopping}
                  onClick={() => actions.current.stop()}
                >
                  {isStopping ? 'Stopping…' : 'Stop'}
                </Button>
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
                    ${betAmount.toFixed(2)}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
                    Current win
                  </p>
                  <p className="text-2xl font-extrabold tracking-tight text-brand">${win}</p>
                </div>
                <Button
                  size="lg"
                  className="h-11 animate-pulse px-8 font-extrabold tracking-tight"
                  onClick={() => actions.current.cashOut()}
                >
                  I&apos;m out ${win}
                </Button>
                <Button
                  size="lg" variant="outline"
                  className="h-11 px-6 font-bold"
                  disabled={isStopping}
                  onClick={() => actions.current.stop()}
                >
                  {isStopping ? 'Stopping…' : 'Stop'}
                </Button>
              </>
            )}

            {/* CASHED OUT — waiting for crash */}
            {isCashedOut && (
              <>
                <div className="flex-1">
                  <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
                    You&apos;re out at
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
                    +${(betAmount * (cashedAt ?? 1)).toFixed(2)}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">Waiting for crash…</p>
                <Button
                  size="lg" variant="outline"
                  className="h-11 px-6 font-bold"
                  disabled={isStopping}
                  onClick={() => actions.current.stop()}
                >
                  {isStopping ? 'Stopping…' : 'Stop'}
                </Button>
              </>
            )}

            {/* CRASHED */}
            {isCrashed && (
              <>
                <div className="flex-1">
                  <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
                    {cashedAt ? 'Cashed out at' : 'Crashed at'}
                  </p>
                  <p className={`text-2xl font-extrabold tracking-tight ${cashedAt ? 'text-success' : 'text-destructive'}`}>
                    ×{mult.toFixed(2)}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
                    {cashedAt ? 'You won' : 'You lost'}
                  </p>
                  <p className={`text-2xl font-extrabold tracking-tight ${cashedAt ? 'text-success' : 'text-destructive'}`}>
                    {cashedAt
                      ? `+$${(betAmount * (cashedAt - 1)).toFixed(2)}`
                      : `-$${betAmount.toFixed(2)}`}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">Loading results…</p>
              </>
            )}

            {/* RESULTS */}
            {isResults && roundResult && (() => {
              // Total gross payout to all winners (bet × cashedAt)
              const totalPayout =
                roundResult.players.reduce((s, p) => {
                  if (p.status !== 'cashed_out' || p.cashedAt === null || p.bet === null) return s
                  return s + p.bet * p.cashedAt
                }, roundResult.myCashedAt !== null ? roundResult.myBet * roundResult.myCashedAt : 0)
              const providerEarned = +(roundResult.totalBank - totalPayout).toFixed(2)
              return (
                <div className="flex w-full flex-wrap items-start gap-5">
                  <div className="min-w-[80px]">
                    <p className="mb-0.5 text-[0.6rem] font-bold uppercase tracking-widest text-muted-foreground">
                      Crashed at
                    </p>
                    <p className="text-lg font-extrabold text-destructive">
                      ×{roundResult.crashPoint.toFixed(2)}
                    </p>
                  </div>
                  <div className="min-w-[80px]">
                    <p className="mb-0.5 text-[0.6rem] font-bold uppercase tracking-widest text-muted-foreground">
                      Your result
                    </p>
                    <p className={`text-lg font-extrabold ${roundResult.myProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {roundResult.myProfit >= 0 ? '+' : ''}${roundResult.myProfit.toFixed(2)}
                    </p>
                    {roundResult.myCashedAt !== null && (
                      <p className="text-[0.6rem] text-muted-foreground">
                        got back ${(roundResult.myBet * roundResult.myCashedAt).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div className="min-w-[80px]">
                    <p className="mb-0.5 text-[0.6rem] font-bold uppercase tracking-widest text-muted-foreground">
                      Total bank
                    </p>
                    <p className="text-lg font-extrabold text-foreground">
                      ${roundResult.totalBank.toFixed(2)}
                    </p>
                  </div>
                  <div className="min-w-[80px]">
                    <p className="mb-0.5 text-[0.6rem] font-bold uppercase tracking-widest text-muted-foreground">
                      Paid to winners
                    </p>
                    <p className="text-lg font-extrabold text-foreground">
                      ${totalPayout.toFixed(2)}
                    </p>
                    <p className="text-[0.6rem] text-muted-foreground">gross return</p>
                  </div>
                  <div className="min-w-[80px]">
                    <p className="mb-0.5 text-[0.6rem] font-bold uppercase tracking-widest text-muted-foreground">
                      Provider earned
                    </p>
                    <p className={`text-lg font-extrabold ${providerEarned >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {providerEarned >= 0 ? '+' : ''}${providerEarned.toFixed(2)}
                    </p>
                    <p className="text-[0.6rem] text-muted-foreground">
                      bank − payouts
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">Next round in 5s…</p>
                    <Button
                      size="lg" variant="outline"
                      className="h-11 px-6 font-bold"
                      disabled={isStopping}
                      onClick={() => actions.current.stop()}
                    >
                      {isStopping ? 'Stopping…' : 'Stop'}
                    </Button>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>

        {/* ── Session history table ────────────────────────────────────────────── */}
        {roundHistory.length > 0 && (() => {
          const gtBank    = roundHistory.reduce((s, r) => s + r.bank, 0)
          const gtPaid    = roundHistory.reduce((s, r) => s + r.paidToWinners, 0)
          const gtProvider = roundHistory.reduce((s, r) => s + r.providerEarned, 0)
          return (
            <div className="mb-10 overflow-hidden rounded-2xl border border-border bg-card">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <div>
                  <p className="text-sm font-bold text-foreground">Session history</p>
                  <p className="text-[0.65rem] text-muted-foreground">
                    {sessionComplete
                      ? `${SESSION_SIZE} rounds complete`
                      : `Round ${roundHistory.length} of ${SESSION_SIZE}`}
                  </p>
                </div>
                {sessionComplete && (
                  <Badge variant="outline" className="border-success/40 bg-success/10 text-[0.65rem] font-semibold text-success">
                    Session complete
                  </Badge>
                )}
              </div>

              {/* Table */}
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-10 text-[0.6rem]">#</TableHead>
                    <TableHead className="text-[0.6rem]">Crash</TableHead>
                    <TableHead className="text-right text-[0.6rem]">Bank</TableHead>
                    <TableHead className="text-right text-[0.6rem]">Paid to winners</TableHead>
                    <TableHead className="text-right text-[0.6rem]">Provider</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roundHistory.map(r => (
                    <TableRow key={r.round}>
                      <TableCell className="text-xs text-muted-foreground">{r.round}</TableCell>
                      <TableCell className="text-xs font-semibold">
                        ×{r.crashPoint.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-xs text-foreground">
                        ${r.bank.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-xs text-foreground">
                        ${r.paidToWinners.toFixed(2)}
                      </TableCell>
                      <TableCell className={`text-right text-xs font-bold ${r.providerEarned >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {r.providerEarned >= 0 ? '+' : ''}${r.providerEarned.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                {sessionComplete && (
                  <tfoot>
                    <tr className="border-t-2 border-border bg-muted/30 font-bold">
                      <td className="px-3 py-3 text-xs font-bold text-foreground" colSpan={2}>
                        Grand total
                      </td>
                      <td className="px-3 py-3 text-right text-xs font-bold text-foreground">
                        ${gtBank.toFixed(2)}
                      </td>
                      <td className="px-3 py-3 text-right text-xs font-bold text-foreground">
                        ${gtPaid.toFixed(2)}
                      </td>
                      <td className={`px-3 py-3 text-right text-xs font-bold ${gtProvider >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {gtProvider >= 0 ? '+' : ''}${gtProvider.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </Table>
            </div>
          )
        })()}

        <div className="doc-footnote">
          🚀 Iteration 3 — Animated demo · Orbit mode · Virtual bet · No backend yet
        </div>

      </div>
    </div>
  )
}
