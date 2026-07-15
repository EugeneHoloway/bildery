'use client'

import { useCallback, useLayoutEffect, useState } from 'react'
import { Check, Columns2, Download, Pin, PinOff, Search } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { DateRangeFilter } from '@/components/ui/date-range-filter'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import type { DateRange } from 'react-day-picker'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type GameHistoryRow = {
  game: string
  time: string
  id: string
  exitId: string
  provider: string
  brand: string
  bet: number
  win: number
  balanceBet: number
  balanceWin: number
  bonusBet: number
  bonusWin: number
  balanceGgr: number
  bonusGgr: number
  ggr: number
  rollover: number
}

const GAME_HISTORY_COLS = [
  { key: 'game',       label: 'Game',        tip: 'Game the round was played in.' },
  { key: 'time',       label: 'Time',        tip: 'Date and time the round was played (server time).' },
  { key: 'id',         label: 'ID',          tip: 'Internal transaction ID assigned by the platform for each game round.' },
  { key: 'provider',   label: 'Provider',    tip: 'Game aggregator that supplies the game to the platform.' },
  { key: 'brand',      label: 'Brand',       tip: 'Game studio (brand) that produced the game.' },
  { key: 'bet',        label: 'Bet',         tip: 'Total amount staked in the round -- real balance plus bonus funds. Bet = Balance Bet + Bonus Bet.' },
  { key: 'win',        label: 'Win',         tip: 'Total amount won in the round, credited to real and bonus balance. Win = Balance Win + Bonus Win.' },
  { key: 'balanceBet', label: 'Balance Bet', tip: 'Part of the bet paid from the real (cash) balance.' },
  { key: 'balanceWin', label: 'Balance Win', tip: 'Part of the win credited to the real (cash) balance.' },
  { key: 'bonusBet',   label: 'Bonus Bet',   tip: 'Part of the bet paid from bonus funds.' },
  { key: 'bonusWin',   label: 'Bonus Win',   tip: 'Part of the win credited to the bonus balance.' },
  { key: 'balanceGgr', label: 'Balance GGR', tip: 'Gross gaming revenue from real-money play. Balance GGR = Balance Bet - Balance Win.' },
  { key: 'bonusGgr',   label: 'Bonus GGR',   tip: 'Gross gaming revenue from bonus play. Usually 0, since bonus funds are an operator liability, not real revenue.' },
  { key: 'ggr',        label: 'GGR',         tip: "Total gross gaming revenue -- the operator's result on the round. GGR = Balance GGR + Bonus GGR." },
  { key: 'rollover',   label: 'Rollover',    tip: 'Remaining wagering requirement after this round -- the amount still to be bet before bonus funds convert to real balance.' },
  { key: 'exitId',     label: 'Exit ID',     tip: 'External round ID (RID) returned by the game provider -- used to trace the round on the provider side.' },
] as const

type GameHistoryColKey = typeof GAME_HISTORY_COLS[number]['key']

const GAME_COL_TIP: Record<GameHistoryColKey, string> = Object.fromEntries(
  GAME_HISTORY_COLS.map(c => [c.key, c.tip]),
) as Record<GameHistoryColKey, string>

function GameHeadLabel({ label, tip }: { label: string; tip: string }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-default">{label}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[240px] text-xs">
          {tip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

const MOCK_GAME_HISTORY: GameHistoryRow[] = [
  { game: 'Betby Sportsbook',                 time: '2025-09-13 06:39:24.118', id: '226256391118', exitId: 'cc3a6d9b-be1d-53dc-b486-49f8de42d1a7', provider: 'BetBy',    brand: 'BetBy',         bet: 107,  win: 115.83, balanceBet: 107,  balanceWin: 115.83, bonusBet: 0, bonusWin: 0,    balanceGgr: -8.83, bonusGgr: 0, ggr: -8.83, rollover: 0 },
  { game: 'Junkyard Kings',                   time: '2025-09-13 06:38:52.904', id: '226256391112', exitId: 'c1f9ec7c-d60f-57a5-bdcf-e9e414048002', provider: 'Hacksaw',  brand: 'Hacksaw',       bet: 1.4,  win: 0.75,   balanceBet: 1.4,  balanceWin: 0.75,   bonusBet: 0, bonusWin: 0,    balanceGgr: 0.65,  bonusGgr: 0, ggr: 0.65, rollover: 0 },
  { game: 'Old Gun',                          time: '2025-09-13 06:38:11.560', id: '226256391108', exitId: '69a8da63-3cef-5e89-a62b-15fa885fd691', provider: 'Hacksaw',  brand: 'Hacksaw',       bet: 2,    win: 0.6,    balanceBet: 2,    balanceWin: 0.6,    bonusBet: 0, bonusWin: 0,    balanceGgr: 1.4,   bonusGgr: 0, ggr: 1.4, rollover: 0 },
  { game: 'Flame & Fortune: Hold & Win',      time: '2025-09-13 06:37:45.203', id: '226256391105', exitId: '6d5c2ee8-1bf6-5ea1-ad19-a1e72b719544', provider: 'Octoplay', brand: 'Penguin King',  bet: 20.4, win: 9,      balanceBet: 20.4, balanceWin: 9,      bonusBet: 0, bonusWin: 0,    balanceGgr: 11.4,  bonusGgr: 0, ggr: 11.4, rollover: 46975.6 },
  { game: 'Book of Dead',                     time: '2025-09-13 06:36:58.771', id: '226256391098', exitId: 'f3631a27-56bb-5143-9d6a-5091bf1f6382', provider: 'PlayNGo',  brand: 'PlaynGo',       bet: 4,    win: 0,      balanceBet: 4,    balanceWin: 0,      bonusBet: 0, bonusWin: 0,    balanceGgr: 4,     bonusGgr: 0, ggr: 4, rollover: 46980.6 },
  { game: 'Sweet Bonanza',                    time: '2025-09-13 06:36:12.049', id: '226256391087', exitId: '8dcfbc96-afd7-5a3a-9c85-80dca304e27f', provider: 'Pragmatic', brand: 'PragmaticPlay', bet: 0.4, win: 1.11,   balanceBet: 0.4,  balanceWin: 0.23,   bonusBet: 0, bonusWin: 0.88, balanceGgr: 0.17,  bonusGgr: 0, ggr: 0.17, rollover: 46985.6 },
  { game: 'Fruit Party',                      time: '2025-09-13 06:35:40.882', id: '226256391085', exitId: 'e9996606-d6a9-5745-bd7c-b530ae641308', provider: 'Pragmatic', brand: 'PragmaticPlay', bet: 0.4, win: 0.5,    balanceBet: 0.4,  balanceWin: 0.5,    bonusBet: 0, bonusWin: 0,    balanceGgr: -0.1,  bonusGgr: 0, ggr: -0.1, rollover: 46990.6 },
  { game: 'Gates of Olympus 1000',            time: '2025-09-13 06:35:03.417', id: '226256391079', exitId: 'ccd12b43-f763-5169-b9de-0db1e2557102', provider: 'Pragmatic', brand: 'PragmaticPlay', bet: 1.4, win: 1.84,   balanceBet: 1.4,  balanceWin: 1.84,   bonusBet: 0, bonusWin: 0,    balanceGgr: -0.44, bonusGgr: 0, ggr: -0.44, rollover: 46995.6 },
  { game: 'The Dog House - Muttley Crew',     time: '2025-09-13 06:34:29.660', id: '226256391064', exitId: 'a1b2c3d4-e5f6-5789-a0b1-c2d3e4f50617', provider: 'Pragmatic', brand: 'PragmaticPlay', bet: 2.4, win: 0,      balanceBet: 2.4,  balanceWin: 0,      bonusBet: 0, bonusWin: 0,    balanceGgr: 2.4,   bonusGgr: 0, ggr: 2.4, rollover: 47000 },
  { game: 'Big Bass Bonanza 1000',            time: '2025-09-13 06:33:57.238', id: '226256391052', exitId: 'b2c3d4e5-f607-5891-a1b2-c3d4e5f60718', provider: 'Pragmatic', brand: 'PragmaticPlay', bet: 1.2, win: 1.2,    balanceBet: 1.2,  balanceWin: 1.2,    bonusBet: 0, bonusWin: 0,    balanceGgr: 0,     bonusGgr: 0, ggr: 0, rollover: 47000 },
  { game: 'Gates of Olympus Super Scatter',   time: '2025-09-13 06:33:14.905', id: '226256391041', exitId: 'c3d4e5f6-0718-5912-a2b3-c4d5e6f70819', provider: 'Pragmatic', brand: 'PragmaticPlay', bet: 2.2, win: 0.44,   balanceBet: 2.2,  balanceWin: 0.44,   bonusBet: 0, bonusWin: 0,    balanceGgr: 1.76,  bonusGgr: 0, ggr: 1.76, rollover: 47000 },
  { game: 'Gates of Hades',                   time: '2025-09-13 06:32:48.331', id: '226256391033', exitId: 'd4e5f607-1829-5a23-b3c4-d5e6f7081920', provider: 'Pragmatic', brand: 'PragmaticPlay', bet: 4,    win: 5.9,    balanceBet: 4,    balanceWin: 5.9,    bonusBet: 0, bonusWin: 0,    balanceGgr: -1.9,  bonusGgr: 0, ggr: -1.9, rollover: 0 },
  { game: '15 Dragon Pearls: Hold and Win',   time: '2025-09-13 06:32:05.774', id: '226256391021', exitId: 'e5f60718-2930-5b34-c4d5-e6f708192031', provider: 'Redgenn',  brand: 'Booongo',       bet: 1.5,  win: 0.15,   balanceBet: 1.5,  balanceWin: 0.15,   bonusBet: 0, bonusWin: 0,    balanceGgr: 1.35,  bonusGgr: 0, ggr: 1.35, rollover: 0 },
  { game: 'Book of Ra Deluxe 6',              time: '2025-09-13 06:31:33.612', id: '226256391014', exitId: 'f6071829-3041-5c45-d5e6-f70819203142', provider: 'Redgenn',  brand: 'Novomatic',     bet: 3,    win: 0,      balanceBet: 3,    balanceWin: 0,      bonusBet: 0, bonusWin: 0,    balanceGgr: 3,     bonusGgr: 0, ggr: 3, rollover: 0 },
  { game: 'Wild Bingo',                       time: '2025-09-13 06:30:58.009', id: '226256391008', exitId: '07182930-4152-5d56-e6f7-081920314253', provider: 'Redgenn',  brand: 'Platipus',      bet: 0.4,  win: 0,      balanceBet: 0.4,  balanceWin: 0,      bonusBet: 0, bonusWin: 0,    balanceGgr: 0.4,   bonusGgr: 0, ggr: 0.4, rollover: 0 },
  { game: 'Supercharged Clovers: Hold And Win', time: '2025-09-13 06:30:21.487', id: '226256390995', exitId: '18293041-5263-5e67-f708-192031425364', provider: 'Redgenn', brand: 'PlaysonDirect', bet: 1.5, win: 0,     balanceBet: 1.5,  balanceWin: 0,      bonusBet: 0, bonusWin: 0,    balanceGgr: 1.5,   bonusGgr: 0, ggr: 1.5, rollover: 0 },
  { game: 'Purrrminator',                     time: '2025-09-13 06:29:47.155', id: '226256390981', exitId: '29304152-6374-5f78-0819-203142536475', provider: 'Relax',    brand: 'Relax',         bet: 0.5,  win: 0,      balanceBet: 0.5,  balanceWin: 0,      bonusBet: 0, bonusWin: 0,    balanceGgr: 0.5,   bonusGgr: 0, ggr: 0.5, rollover: 0 },
]

export function GameHistoryTab({ playerCurrency, fxRate, dateRange, onDateRangeChange }: {
  playerCurrency: string
  fxRate: number
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
}) {
  const [gameSearch, setGameSearch] = useState('')
  const [gameVisibleCols, setGameVisibleCols] = useState<Set<GameHistoryColKey>>(
    new Set<GameHistoryColKey>(['time','id','provider','brand','bet','win','balanceBet','balanceWin','bonusBet','bonusWin','balanceGgr','bonusGgr','ggr','rollover','exitId'])
  )
  const [gameColOpen, setGameColOpen] = useState(false)
  const [gameNameFrozen, setGameNameFrozen] = useState(true)

  function toggleGameCol(key: GameHistoryColKey) {
    setGameVisibleCols(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const [gameScrollNode, setGameScrollNode] = useState<HTMLDivElement | null>(null)
  const [gameHasOverflow, setGameHasOverflow] = useState(false)
  const gameScrollRef = useCallback((node: HTMLDivElement | null) => setGameScrollNode(node), [])
  useLayoutEffect(() => {
    if (!gameScrollNode) return
    const check = () => setGameHasOverflow(gameScrollNode.scrollWidth > gameScrollNode.clientWidth)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(gameScrollNode)
    window.addEventListener('resize', check)
    return () => { ro.disconnect(); window.removeEventListener('resize', check) }
  }, [gameScrollNode])

  // Money is stored in EUR; show EUR with the player's native currency (e.g. AUD) as a secondary line.
  const gameEur = (n: number) => `${n < 0 ? '-' : ''}€${Math.abs(n).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const gameNative = (n: number) => `${n < 0 ? '-' : ''}${Math.abs(n * fxRate).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${playerCurrency}`
  const gameMoneyCell = (n: number) => (
    <TableCell className="whitespace-nowrap">
      <span className="text-sm tabular-nums block">{gameEur(n)}</span>
      {playerCurrency !== 'EUR' && (
        <span className="text-xs text-muted-foreground tabular-nums block">{gameNative(n)}</span>
      )}
    </TableCell>
  )

  return (
    <>
      <div>
        <h2 className="text-base font-semibold">Games history</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Games played by this player with bet, win and GGR breakdown.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search..."
            value={gameSearch}
            onChange={e => setGameSearch(e.target.value)}
            className="pl-8 h-8 w-48 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Popover open={gameColOpen} onOpenChange={setGameColOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Columns2 className="size-3.5" />
                <span className="hidden sm:inline">Columns</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" sideOffset={6} className="w-48 p-1">
              <button
                type="button"
                onClick={() => setGameNameFrozen(v => !v)}
                className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
              >
                {gameNameFrozen
                  ? <PinOff className="size-3.5 shrink-0" />
                  : <Pin className="size-3.5 shrink-0" />}
                Game
              </button>
              {GAME_HISTORY_COLS.filter(col => col.key !== 'game').map(col => (
                <button
                  key={col.key}
                  type="button"
                  onClick={() => toggleGameCol(col.key)}
                  className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
                >
                  <Check className={`size-3.5 shrink-0 ${gameVisibleCols.has(col.key) ? 'opacity-100' : 'opacity-0'}`} />
                  {col.label}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          <DateRangeFilter value={dateRange} onChange={onDateRangeChange} mobileLabel="none" />

          <Button variant="outline" size="sm" className="gap-2">
            <Download className="size-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      <div className="relative rounded-2xl border border-border bg-card overflow-hidden">
        {gameHasOverflow && <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-card to-transparent z-10" />}
        <div className="overflow-x-auto" ref={gameScrollRef}>
          <Table className="min-w-max">
            <TableHeader className="bg-muted/60">
              <TableRow className="hover:bg-transparent border-b border-border">
                <TableHead className={`text-sm font-medium text-foreground pl-4 ${gameNameFrozen ? "sticky left-0 z-20 bg-muted after:absolute after:right-0 after:top-0 after:bottom-0 after:w-px after:bg-border after:content-['']" : ""}`}>
                  <GameHeadLabel label="Game" tip={GAME_COL_TIP.game} />
                </TableHead>
                {GAME_HISTORY_COLS.filter(col => col.key !== 'game').map(col => (
                  gameVisibleCols.has(col.key) && (
                    <TableHead key={col.key} className="text-sm font-medium text-foreground">
                      <GameHeadLabel label={col.label} tip={col.tip} />
                    </TableHead>
                  )
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_GAME_HISTORY.filter(g =>
                gameSearch === '' ||
                g.game.toLowerCase().includes(gameSearch.toLowerCase()) ||
                g.provider.toLowerCase().includes(gameSearch.toLowerCase()) ||
                g.brand.toLowerCase().includes(gameSearch.toLowerCase()) ||
                g.exitId.toLowerCase().includes(gameSearch.toLowerCase())
              ).map(g => (
                <TableRow key={g.game}>
                  <TableCell className={`pl-4 ${gameNameFrozen ? "sticky left-0 z-10 bg-background after:absolute after:right-0 after:top-0 after:bottom-0 after:w-px after:bg-border after:content-['']" : ""}`}>
                    <span className="text-sm font-medium whitespace-nowrap">{g.game}</span>
                  </TableCell>
                  {gameVisibleCols.has('time')       && <TableCell className="text-sm text-muted-foreground tabular-nums whitespace-nowrap">{g.time}</TableCell>}
                  {gameVisibleCols.has('id')         && <TableCell className="text-sm tabular-nums whitespace-nowrap">{g.id}</TableCell>}
                  {gameVisibleCols.has('provider')   && <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{g.provider}</TableCell>}
                  {gameVisibleCols.has('brand')      && <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{g.brand}</TableCell>}
                  {gameVisibleCols.has('bet')        && gameMoneyCell(g.bet)}
                  {gameVisibleCols.has('win')        && gameMoneyCell(g.win)}
                  {gameVisibleCols.has('balanceBet') && gameMoneyCell(g.balanceBet)}
                  {gameVisibleCols.has('balanceWin') && gameMoneyCell(g.balanceWin)}
                  {gameVisibleCols.has('bonusBet')   && gameMoneyCell(g.bonusBet)}
                  {gameVisibleCols.has('bonusWin')   && gameMoneyCell(g.bonusWin)}
                  {gameVisibleCols.has('balanceGgr') && gameMoneyCell(g.balanceGgr)}
                  {gameVisibleCols.has('bonusGgr')   && gameMoneyCell(g.bonusGgr)}
                  {gameVisibleCols.has('ggr')        && gameMoneyCell(g.ggr)}
                  {gameVisibleCols.has('rollover')   && gameMoneyCell(g.rollover)}
                  {gameVisibleCols.has('exitId')     && <TableCell className="text-sm text-muted-foreground font-mono tabular-nums whitespace-nowrap">{g.exitId}</TableCell>}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  )
}
