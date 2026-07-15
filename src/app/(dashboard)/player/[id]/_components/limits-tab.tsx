'use client'

import { useState } from 'react'
import { Ban, Globe, Pencil, Plus, Shield, Timer, User, UserCog, X } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { addDays } from 'date-fns'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type PlayerLimitItem = {
  name: string; scope: string; current: string; limit: string; unit: string
  pct: number | null; disabled: boolean; _type: string; _scope: string; _value: string
  setBy?: string; setByEmail?: string; setByDate?: string; setByPlayer?: boolean
}
type OperatorLimitItem = {
  name: string; scope: string; value: string; valueNative?: string; tag: string; meta: string
  metaHandle?: string; metaEmail?: string; metaDate?: string
  disabled: boolean; _type: string; _scope: string
}

const PL_TYPES = [
  { value: 'loss_limit', label: 'Loss limit', unit: '€', hint: 'Max amount player can lose' },
  { value: 'deposit_limit', label: 'Deposit limit', unit: '€', hint: 'Max amount player can deposit' },
  { value: 'wager_limit', label: 'Wager limit', unit: '€', hint: 'Max amount per single bet' },
  { value: 'session_time', label: 'Session time', unit: 'h', hint: 'Max hours per session' },
  { value: 'cooling_off', label: 'Cooling-off', unit: 'd', hint: 'Mandatory pause between sessions' },
]
const PL_SCOPES: Record<string, { value: string; label: string }[]> = {
  loss_limit:    [{ value:'daily',label:'Daily'},{value:'weekly',label:'Weekly'},{value:'monthly',label:'Monthly'}],
  deposit_limit: [{ value:'daily',label:'Daily'},{value:'weekly',label:'Weekly'},{value:'monthly',label:'Monthly'}],
  wager_limit:   [{ value:'per_bet',label:'Per bet'}],
  session_time:  [{ value:'daily',label:'Daily'}],
  cooling_off:   [{ value:'one_time',label:'One-time'}],
}
const PL_SCOPE_LABELS: Record<string, string> = {
  daily:'Daily', weekly:'Weekly', monthly:'Monthly', per_bet:'Per bet', one_time:'One-time',
}

const OL_TYPES = [
  { value:'max_withdrawal', label:'Max withdrawal' },
  { value:'max_deposit', label:'Max deposit' },
  { value:'bonus_restriction', label:'Bonus restriction' },
  { value:'review_threshold', label:'Review threshold' },
  { value:'custom', label:'Custom' },
]
const OL_TYPE_NAMES: Record<string,string> = {
  max_withdrawal:'Max withdrawal', max_deposit:'Max deposit',
  bonus_restriction:'Bonus restriction', review_threshold:'Review threshold', custom:'Custom',
}
const OL_SCOPES = [
  { value:'per_transaction', label:'Per transaction' },
  { value:'daily', label:'Daily' },
  { value:'weekly', label:'Weekly' },
  { value:'permanent', label:'Permanent' },
]
const OL_SCOPE_LABELS: Record<string,string> = {
  per_transaction:'Per transaction', daily:'Daily', weekly:'Weekly', permanent:'Permanent',
}
const OL_TAGS = ['AML flag','Abuse','Compliance','Manual review required','Fraud prevention']

export function LimitsTab({ playerName, playerCurrency, fxRate }: {
  playerName: string
  playerCurrency: string
  fxRate: number
}) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const toNative = (eurValue: number): string => {
    if (playerCurrency === 'EUR') return ''
    const native = eurValue * fxRate
    return `${(native % 1 === 0 ? native.toFixed(0) : native.toFixed(0))} ${playerCurrency}`
  }

  const [seDrawerOpen, setSeDrawerOpen] = useState(false)
  const [seType, setSeType] = useState<'temporary' | 'permanent'>('temporary')
  const [sePeriod, setSePeriod] = useState('30d')
  const [seReason, setSeReason] = useState('')
  const [seNote, setSeNote] = useState('')
  const [coDrawerOpen, setCoDrawerOpen] = useState(false)
  const [coStartDate, setCoStartDate] = useState<Date | undefined>(undefined)
  const [coEndDate, setCoEndDate] = useState<Date | undefined>(undefined)
  const [coReason, setCoReason] = useState('')
  const [coNote, setCoNote] = useState('')

  const [playerLimits, setPlayerLimits] = useState<PlayerLimitItem[]>([
    { name:'Loss limit', scope:'Daily', current:'€80', limit:'€200', unit:'€', pct:40, disabled:false, _type:'loss_limit', _scope:'daily', _value:'200', setByDate:'11.05.2025', setByPlayer:true },
    { name:'Deposit limit', scope:'Weekly', current:'€320', limit:'€500', unit:'€', pct:64, disabled:false, _type:'deposit_limit', _scope:'weekly', _value:'500', setBy:'@JasonDuval', setByEmail:'jason.duval@bildery.com', setByDate:'19.05.2026' },
    { name:'Session time', scope:'Daily', current:'1h 20m', limit:'3h', unit:'h', pct:44, disabled:false, _type:'session_time', _scope:'daily', _value:'3', setByDate:'11.05.2025', setByPlayer:true },
    { name:'Cooling-off', scope:'One-time', current:'—', limit:'Not set', unit:'', pct:null, disabled:false, _type:'cooling_off', _scope:'one_time', _value:'' },
  ])
  const [operatorLimits, setOperatorLimits] = useState<OperatorLimitItem[]>([
    { name:'Max withdrawal', scope:'Per transaction', value:'€2,000', valueNative:'3,420 AUD', tag:'AML flag', meta:'', metaHandle:'@JasonDuval', metaEmail:'jason.duval@bildery.com', metaDate:'2026-06-20', disabled:false, _type:'max_withdrawal', _scope:'per_transaction' },
    { name:'Bonus restriction', scope:'Permanent', value:'No bonuses', tag:'Abuse', meta:'', metaHandle:'@RiskTeam', metaEmail:'risk@bildery.com', metaDate:'2026-05-15', disabled:false, _type:'bonus_restriction', _scope:'permanent' },
    { name:'Review threshold', scope:'Per transaction', value:'> €500', valueNative:'855 AUD', tag:'Manual review required', meta:'', metaHandle:'@ComplianceTeam', metaEmail:'compliance@bildery.com', metaDate:'2026-06-10', disabled:false, _type:'review_threshold', _scope:'per_transaction' },
  ])

  const [plDrawerOpen, setPlDrawerOpen] = useState(false)
  const [plEditIndex, setPlEditIndex] = useState<number | null>(null)
  const [plType, setPlType] = useState('loss_limit')
  const [plScope, setPlScope] = useState('daily')
  const [plValue, setPlValue] = useState('')

  const [olDrawerOpen, setOlDrawerOpen] = useState(false)
  const [olEditIndex, setOlEditIndex] = useState<number | null>(null)
  const [olType, setOlType] = useState('max_withdrawal')
  const [olScope, setOlScope] = useState('per_transaction')
  const [olValue, setOlValue] = useState('')
  const [olCurrency, setOlCurrency] = useState('EUR')
  const [olTag, setOlTag] = useState('')
  const [olNote, setOlNote] = useState('')

  function openAddPl() {
    setPlEditIndex(null); setPlType('loss_limit'); setPlScope('daily'); setPlValue(''); setPlDrawerOpen(true)
  }
  function openEditPl(idx: number) {
    const l = playerLimits[idx]
    setPlEditIndex(idx); setPlType(l._type); setPlScope(l._scope); setPlValue(l._value); setPlDrawerOpen(true)
  }
  function savePl() {
    const typeDef = PL_TYPES.find(t => t.value === plType)!
    const unit = typeDef.unit
    const scopeLabel = PL_SCOPE_LABELS[plScope] || plScope
    const displayLimit = plType === 'cooling_off' ? 'Not set' : plValue ? (unit === '€' ? `€${plValue}` : `${plValue}${unit}`) : 'Not set'
    const newL: PlayerLimitItem = {
      name: typeDef.label, scope: scopeLabel,
      current: plType === 'cooling_off' ? '—' : unit === '€' ? '€0' : `0${unit}`,
      limit: displayLimit, unit, pct: plType === 'cooling_off' ? null : 0,
      disabled: false, _type: plType, _scope: plScope, _value: plValue,
    }
    if (plEditIndex !== null) {
      setPlayerLimits(prev => prev.map((l, i) => i === plEditIndex ? { ...newL, current: l.current, pct: l.pct } : l))
    } else {
      setPlayerLimits(prev => [...prev, newL])
    }
    setPlDrawerOpen(false)
  }
  function togglePl(idx: number) {
    setPlayerLimits(prev => prev.map((l, i) => i === idx ? { ...l, disabled: !l.disabled } : l))
  }

  function openAddOl() {
    setOlEditIndex(null); setOlType('max_withdrawal'); setOlScope('per_transaction')
    setOlValue(''); setOlCurrency('EUR'); setOlTag(''); setOlNote(''); setOlDrawerOpen(true)
  }
  function openEditOl(idx: number) {
    const l = operatorLimits[idx]
    setOlEditIndex(idx); setOlType(l._type); setOlScope(l._scope)
    setOlValue(l.value); setOlCurrency('EUR'); setOlTag(l.tag); setOlNote(''); setOlDrawerOpen(true)
  }
  function saveOl() {
    const name = OL_TYPE_NAMES[olType] || 'Custom'
    const scope = OL_SCOPE_LABELS[olScope] || olScope
    const today = new Date().toISOString().split('T')[0]
    const numericVal = parseFloat(olValue.replace(/[^\d.]/g, ''))
    let displayValue = olValue
    let valueNative: string | undefined
    if (!isNaN(numericVal) && olType !== 'bonus_restriction') {
      if (olCurrency === 'EUR') {
        displayValue = `€${numericVal.toLocaleString('en')}`
        valueNative = `${Math.round(numericVal * fxRate).toLocaleString('en')} ${playerCurrency}`
      } else {
        displayValue = `€${Math.round(numericVal / fxRate).toLocaleString('en')}`
        valueNative = `${numericVal.toLocaleString('en')} ${playerCurrency}`
      }
    }
    const newL: OperatorLimitItem = {
      name, scope, value: displayValue, valueNative, tag: olTag,
      meta: '', metaHandle: '@JasonDuval', metaEmail: 'jason.duval@bildery.com', metaDate: today,
      disabled: false, _type: olType, _scope: olScope,
    }
    if (olEditIndex !== null) {
      setOperatorLimits(prev => prev.map((l, i) => i === olEditIndex ? { ...newL, disabled: l.disabled } : l))
    } else {
      setOperatorLimits(prev => [...prev, newL])
    }
    setOlDrawerOpen(false)
  }
  function toggleOl(idx: number) {
    setOperatorLimits(prev => prev.map((l, i) => i === idx ? { ...l, disabled: !l.disabled } : l))
  }

  return (
    <>

      {/* Player limits + Operator limits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Column 1: Player limits */}
      <div className="flex flex-col gap-6">
      {/* Player limits */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <User className="size-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium">Player limits</p>
              <p className="text-xs text-muted-foreground hidden sm:block">Set by the player or by the operator on the player's behalf.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={openAddPl}>
            <Pencil className="size-3.5" />
            <span>Edit limits</span>
          </Button>
        </div>
        <div className="divide-y divide-border overflow-y-auto max-h-72">
          {playerLimits.map((limit, idx) => {
            const barColor = 'bg-foreground'
            return (
              <div key={idx} className={`transition-opacity ${limit.disabled ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-2 justify-between px-4 pt-3 pb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-sm font-medium ${limit.disabled ? 'line-through text-muted-foreground' : ''}`}>{limit.name}</span>
                    <span className="inline-flex items-center rounded-md border border-border px-1.5 py-0.5 text-xs text-muted-foreground shrink-0">{limit.scope}</span>
                    {limit.disabled && <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground shrink-0">Disabled</span>}
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {limit.pct !== null
                        ? <><span className="text-foreground font-semibold">{limit.current}</span> / {limit.limit}</>
                        : limit._type === 'cooling_off'
                          ? <span className="text-muted-foreground">Not set</span>
                          : <span>{limit.limit}</span>}
                    </span>
                    {limit.unit === '€' && limit.pct !== null && (() => {
                      const cur = parseFloat(limit.current.replace(/[€,]/g, ''))
                      const lim = parseFloat(limit._value)
                      const nCur = toNative(cur)
                      const nLim = toNative(lim)
                      return nLim ? <span className="text-xs text-muted-foreground tabular-nums">{nCur} / {nLim}</span> : null
                    })()}
                  </div>
                </div>
                {limit.pct !== null && !limit.disabled ? (
                  <div className="flex flex-col gap-1 px-4 pb-3">
                    <div className="h-1.5 rounded-full bg-muted-foreground/15">
                      <div className={`h-1.5 rounded-full ${barColor} transition-all`} style={{ width: `${limit.pct}%` }} />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground tabular-nums">{limit.pct}% achieved</span>
                      {(limit.setBy || limit.setByPlayer) && (
                        <span className="text-xs text-muted-foreground cursor-default">
                          {limit.setByPlayer ? (
                            <>{limit.setByDate}{' · By Player'}</>
                          ) : (
                            <>{limit.setByDate}{' · '}
                              <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span>{limit.setBy}</span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-xs">{limit.setByEmail}</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              {' · On Player\'s behalf'}
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="pb-3" />
                )}
              </div>
            )
          })}
        </div>
        <div className="border-t border-border bg-muted/50 px-4 py-5 flex items-center">
          <p className="text-xs text-muted-foreground">Changes take effect immediately and reset on schedule.</p>
        </div>
      </div>
      </div>{/* end column 1 */}

      {/* Column 2: Self-exclusion + Cooling-off */}
      <div className="flex flex-col gap-6">

      {/* Self-exclusion */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Ban className="size-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm font-medium">Self-exclusion</p>
            <p className="text-xs text-muted-foreground hidden sm:block">Player-initiated account freezes. Cannot be overridden by operator during active period.</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3 text-center py-10">
          <div className="size-10 rounded-xl bg-muted flex items-center justify-center">
            <Ban className="size-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">No self-exclusion active</p>
            <p className="text-xs text-muted-foreground mt-0.5">Player has not requested any exclusion period.</p>
          </div>
          <Button variant="outline" size="sm" className="mt-1 gap-1.5" onClick={() => setSeDrawerOpen(true)}>
            <Plus className="size-3.5" />
            Apply self-exclusion
          </Button>
        </div>
      </div>

      {/* Cooling-off */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Timer className="size-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-sm font-medium">Cooling-off</p>
              <p className="text-xs text-muted-foreground hidden sm:block">Player-requested temporary pause. Cannot be shortened.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={() => setCoDrawerOpen(true)}>
            <Pencil className="size-3.5" />
            <span>Edit</span>
          </Button>
        </div>
        <div className="flex justify-center py-6">
          {(() => {
            const size = 220
            const cx = 110
            const cy = 110
            const r = 86
            const stroke = 26
            const pct = 0.71
            const circ = 2 * Math.PI * r
            const dash = pct * circ
            const gap = circ - dash
            return (
              <svg width={size} height={size}>
                {/* track */}
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="hsl(0,0%,90%)" strokeWidth={stroke} />
                {/* progress — start at top (rotate -90deg) */}
                <circle
                  cx={cx} cy={cy} r={r} fill="none"
                  stroke="hsl(220,9%,44%)"
                  strokeWidth={stroke}
                  strokeDasharray={`${dash} ${gap}`}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${cx} ${cy})`}
                />
                <text x={cx} y={cy - 10} textAnchor="middle" dominantBaseline="middle" fontSize={18} fontWeight={700} fill="currentColor">5d 17h 49m</text>
                <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="middle" fontSize={12} fill="hsl(220,9%,44%)">remaining</text>
              </svg>
            )
          })()}
        </div>
        <div className="h-px bg-border" />
        <div className="bg-muted/40 flex flex-col px-4">
          {[
            { label: 'Started', value: '2026-06-22' },
            { label: 'Ends', value: '2026-06-29' },
            { label: 'Duration', value: '7 days' },
            { label: 'Times used', value: '3' },
          ].map((item, idx, arr) => (
            <div key={item.label}>
              <div className={`flex w-full items-center justify-between ${idx === 0 ? 'pt-4 pb-3' : idx === arr.length - 1 ? 'pt-3 pb-4' : 'py-3'}`}>
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-semibold tabular-nums">{item.value}</span>
              </div>
              {idx < arr.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      </div>

      </div>{/* end column 2 */}

      {/* Column 3: Operator limits + Regulatory limits */}
      <div className="flex flex-col gap-6">
      {/* Operator limits */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <UserCog className="size-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium">Operator limits</p>
              <p className="text-xs text-muted-foreground hidden sm:block">Manually applied by your team. Player cannot modify.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={openAddOl}>
            <Pencil className="size-3.5" />
            <span>Edit limits</span>
          </Button>
        </div>
        <div className="divide-y divide-border">
          {operatorLimits.map((limit, idx) => (
            <div key={idx} className={`flex items-start sm:items-center justify-between gap-3 px-4 py-3 transition-opacity ${limit.disabled ? 'opacity-50' : ''}`}>
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-medium ${limit.disabled ? 'line-through text-muted-foreground' : ''}`}>{limit.name}</span>
                  <span className="inline-flex items-center rounded-md border border-border px-1.5 py-0.5 text-xs text-muted-foreground">{limit.scope}</span>
                  {limit.tag && !limit.disabled && (
                    <span className="inline-flex items-center rounded-md bg-destructive-bg px-1.5 py-0.5 text-xs text-destructive">{limit.tag}</span>
                  )}
                  {limit.disabled && <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">Disabled</span>}
                </div>
                {limit.metaHandle ? (
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-xs text-muted-foreground cursor-default">{limit.metaDate} · {limit.metaHandle}</p>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">{limit.metaEmail}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <p className="text-xs text-muted-foreground">{limit.meta}</p>
                )}
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="text-sm font-medium tabular-nums">{limit.value}</span>
                {limit.valueNative && <span className="text-xs text-muted-foreground tabular-nums">{limit.valueNative}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regulatory limits */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Shield className="size-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium">Regulatory limits</p>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Jurisdiction: <span className="text-foreground font-medium">Australia (ACMA)</span> -- read-only, enforced by law.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-subtle px-2 py-1 text-xs text-muted-foreground border border-subtle-border shrink-0">
            <Globe className="size-3" />
            ACMA
          </span>
        </div>
        <div className="divide-y divide-border">
          {[
            { name: 'Max single bet', scope: 'Per bet', value: '€29.00', valueEur: '50.00 AUD', ref: 'ACMA §4.2', active: true },
            { name: 'Reality check', scope: 'Every 60 min', value: 'Enabled', ref: 'ACMA §6.1', active: true },
            { name: 'Self-exclusion register', scope: 'National', value: 'Not enrolled', ref: 'BetStop', active: false },
            { name: 'Credit card deposits', scope: 'Any amount', value: 'Prohibited', ref: 'ACMA §9', active: true },
          ].map((limit) => (
            <div key={limit.name} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{limit.name}</span>
                  <span className="inline-flex items-center rounded-md border border-border px-1.5 py-0.5 text-xs text-muted-foreground">{limit.scope}</span>
                </div>
                <span className="text-xs text-muted-foreground">{limit.ref}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex flex-col items-end">
                  <span className={`text-sm font-medium tabular-nums ${limit.active ? 'text-foreground' : 'text-muted-foreground'}`}>{limit.value}</span>
                  {limit.valueEur && <span className="text-xs text-muted-foreground tabular-nums">{limit.valueEur}</span>}
                </div>
                <div className={`size-1.5 rounded-full shrink-0 ${limit.active ? 'bg-success' : 'bg-muted-foreground/40'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      </div>{/* end right column */}
      </div>{/* end grid */}

      {/* Player limit add/edit drawer */}
      <Drawer open={plDrawerOpen} onOpenChange={setPlDrawerOpen} direction={isMobile ? 'bottom' : 'right'}>
        <DrawerContent className="sm:max-w-[400px] flex flex-col">
          <DrawerHeader className="border-b border-border flex flex-row items-center justify-between">
            <DrawerTitle>{plEditIndex !== null ? 'Edit player limit' : 'Add player limit'}</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon-sm"><X className="size-4" /></Button>
            </DrawerClose>
          </DrawerHeader>
          <div className="flex flex-col gap-5 flex-1 overflow-y-auto px-4 py-5 min-h-0">

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Limit type</p>
              <div className="flex flex-col gap-1.5">
                {PL_TYPES.filter(t => t.value !== 'cooling_off').map(t => (
                  <button key={t.value}
                    onClick={() => { setPlType(t.value); setPlScope(PL_SCOPES[t.value][0].value) }}
                    className={`rounded-xl border px-4 py-2.5 text-left transition-colors ${
                      plType === t.value
                        ? 'border-foreground bg-muted'
                        : 'border-border hover:border-foreground/40'
                    }`}
                  >
                    <span className={`text-sm font-medium ${plType === t.value ? 'text-foreground' : 'text-muted-foreground'}`}>{t.label}</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">{t.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            {(PL_SCOPES[plType]?.length ?? 0) > 1 && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Period</p>
                <div className="flex flex-wrap gap-2">
                  {PL_SCOPES[plType].map(s => (
                    <button key={s.value} onClick={() => setPlScope(s.value)}
                      className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                        plScope === s.value
                          ? 'border-foreground bg-muted font-medium text-foreground'
                          : 'border-border text-muted-foreground hover:border-foreground/40'
                      }`}>{s.label}</button>
                  ))}
                </div>
              </div>
            )}

            {plType !== 'cooling_off' && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Limit value</p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">
                    {PL_TYPES.find(t => t.value === plType)?.unit}
                  </span>
                  <input type="number" value={plValue} onChange={e => setPlValue(e.target.value)}
                    placeholder={plType === 'session_time' ? 'e.g. 3' : 'e.g. 500'}
                    min="0"
                    className="w-full rounded-xl border border-border bg-transparent pl-8 pr-4 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
              </div>
            )}

          </div>
          <div className="shrink-0 border-t border-border bg-muted p-4 flex gap-2">
            <DrawerClose asChild>
              <Button variant="outline" className="flex-1">Cancel</Button>
            </DrawerClose>
            <Button className="flex-1" disabled={plType !== 'cooling_off' && !plValue} onClick={savePl}>
              {plEditIndex !== null ? 'Save changes' : 'Add limit'}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Operator limit add/edit drawer */}
      <Drawer open={olDrawerOpen} onOpenChange={setOlDrawerOpen} direction={isMobile ? 'bottom' : 'right'}>
        <DrawerContent className="sm:max-w-[400px] flex flex-col">
          <DrawerHeader className="border-b border-border flex flex-row items-center justify-between">
            <DrawerTitle>Edit operator limit</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon-sm"><X className="size-4" /></Button>
            </DrawerClose>
          </DrawerHeader>
          <div className="flex flex-col gap-5 flex-1 overflow-y-auto px-4 py-5 min-h-0">

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Limit type</p>
              <Select value={olType} onValueChange={setOlType}>
                <SelectTrigger className="w-full text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {OL_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Scope</p>
              <div className="flex flex-wrap gap-2">
                {OL_SCOPES.map(s => (
                  <button key={s.value} onClick={() => setOlScope(s.value)}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                      olScope === s.value
                        ? 'border-foreground bg-muted font-medium text-foreground'
                        : 'border-border text-muted-foreground hover:border-foreground/40'
                    }`}>{s.label}</button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Value</p>
              <div className="flex gap-2">
                {olType !== 'bonus_restriction' && (
                  <Select value={olCurrency} onValueChange={setOlCurrency}>
                    <SelectTrigger className="w-24 shrink-0 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value={playerCurrency}>{playerCurrency}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                <input type="text" value={olValue} onChange={e => setOlValue(e.target.value)}
                  placeholder={olType === 'bonus_restriction' ? 'e.g. No bonuses' : olType === 'review_threshold' ? 'e.g. 500' : 'e.g. 2000'}
                  className="w-full rounded-lg border border-border bg-transparent px-3 py-[7px] text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Reason tag <span className="text-muted-foreground font-normal">(optional)</span></p>
              <Select value={olTag} onValueChange={setOlTag}>
                <SelectTrigger className="w-full text-sm"><SelectValue placeholder="Select reason..." /></SelectTrigger>
                <SelectContent>
                  {OL_TAGS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Note <span className="text-muted-foreground font-normal">(optional)</span></p>
              <textarea value={olNote} onChange={e => setOlNote(e.target.value)}
                placeholder="Internal note for audit log..." rows={3}
                className="w-full resize-none rounded-xl border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>

          </div>
          <div className="shrink-0 border-t border-border bg-muted p-4 flex gap-2">
            <DrawerClose asChild>
              <Button variant="outline" className="flex-1">Cancel</Button>
            </DrawerClose>
            <Button className="flex-1" disabled={!olValue} onClick={saveOl}>
              {olEditIndex !== null ? 'Save changes' : 'Add limit'}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Self-exclusion drawer */}
      <Drawer open={seDrawerOpen} onOpenChange={setSeDrawerOpen} direction={isMobile ? 'bottom' : 'right'}>
        <DrawerContent className="sm:max-w-[400px] flex flex-col">
          <DrawerHeader className="border-b border-border flex flex-row items-center justify-between">
            <div>
              <DrawerTitle>Apply self-exclusion</DrawerTitle>
              <p className="text-xs text-muted-foreground mt-0.5">For player: {playerName}</p>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon-sm"><X className="size-4" /></Button>
            </DrawerClose>
          </DrawerHeader>

          <div className="flex flex-col gap-5 flex-1 overflow-y-auto px-4 py-5 min-h-0">

            {/* Type */}
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Type</p>
              <div className="grid grid-cols-2 gap-2">
                {(['temporary', 'permanent'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setSeType(t)}
                    className={`rounded-xl border px-4 py-3 text-sm font-medium text-left transition-colors ${
                      seType === t
                        ? 'border-foreground bg-muted text-foreground'
                        : 'border-border text-muted-foreground hover:border-foreground/40'
                    }`}
                  >
                    {t === 'temporary' ? 'Temporary' : 'Permanent'}
                    <span className="block text-xs font-normal text-muted-foreground mt-0.5">
                      {t === 'temporary' ? 'Fixed period, then auto-reopens' : 'Cannot be reversed by player'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Period (only if temporary) */}
            {seType === 'temporary' && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Period</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: '1d', label: '1 day' },
                    { value: '7d', label: '1 week' },
                    { value: '30d', label: '1 month' },
                    { value: '180d', label: '6 months' },
                    { value: '365d', label: '1 year' },
                  ].map(p => (
                    <button
                      key={p.value}
                      onClick={() => setSePeriod(p.value)}
                      className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                        sePeriod === p.value
                          ? 'border-foreground bg-muted font-medium text-foreground'
                          : 'border-border text-muted-foreground hover:border-foreground/40'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reason */}
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Reason</p>
              <Select value={seReason} onValueChange={setSeReason}>
                <SelectTrigger size="sm" className="w-full">
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="player_request">Player request</SelectItem>
                  <SelectItem value="problem_gambling">Problem gambling behaviour</SelectItem>
                  <SelectItem value="regulatory">Regulatory requirement</SelectItem>
                  <SelectItem value="operator_decision">Operator decision</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Note */}
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Note <span className="text-muted-foreground font-normal">(optional)</span></p>
              <textarea
                value={seNote}
                onChange={e => setSeNote(e.target.value)}
                placeholder="Internal note for audit log..."
                rows={3}
                className="w-full resize-none rounded-xl border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            {/* Warning */}
            <div className="rounded-xl border border-destructive/30 bg-destructive-bg px-4 py-3 flex flex-col gap-1">
              <p className="text-sm font-medium text-destructive">This action takes effect immediately</p>
              <p className="text-xs text-destructive/80">
                {seType === 'temporary'
                  ? 'The player will be locked and cannot log in until the exclusion period ends. The period cannot be shortened by the player.'
                  : 'The player will be permanently locked. This cannot be reversed by the player and requires compliance review to lift.'}
              </p>
            </div>

          </div>

          <div className="shrink-0 border-t border-border bg-muted p-4 flex gap-2">
            <DrawerClose asChild>
              <Button variant="outline" className="flex-1">Cancel</Button>
            </DrawerClose>
            <Button
              variant="destructive"
              className="flex-1"
              disabled={!seReason}
              onClick={() => setSeDrawerOpen(false)}
            >
              <Ban className="size-4" />
              Apply exclusion
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Cooling-off drawer */}
      <Drawer open={coDrawerOpen} onOpenChange={setCoDrawerOpen} direction={isMobile ? 'bottom' : 'right'}>
        <DrawerContent className="sm:max-w-[400px] flex flex-col">
          <DrawerHeader className="border-b border-border flex flex-row items-center justify-between">
            <div>
              <DrawerTitle>Edit cooling-off</DrawerTitle>
              <p className="text-xs text-muted-foreground mt-0.5">For player: {playerName}</p>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon-sm"><X className="size-4" /></Button>
            </DrawerClose>
          </DrawerHeader>

          <div className="flex flex-col gap-5 flex-1 overflow-y-auto px-4 py-5 min-h-0">

            {/* Duration */}
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Duration</p>
              <Card className="mx-auto w-fit">
                <CardContent className="pt-5">
                  <Calendar
                    mode="range"
                    selected={{ from: coStartDate, to: coEndDate }}
                    onSelect={range => {
                      if (!range) { setCoStartDate(undefined); setCoEndDate(undefined); return }
                      if (coStartDate && coEndDate) {
                        setCoStartDate(range.from); setCoEndDate(undefined)
                      } else {
                        setCoStartDate(range.from); setCoEndDate(range.to)
                      }
                    }}
                    disabled={{ before: new Date() }}
                    fixedWeeks
                    className="p-0 [--cell-size:--spacing(9.5)]"
                  />
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2 border-t bg-muted p-3">
                  {[
                    { label: '1 day', days: 1 },
                    { label: '1 week', days: 7 },
                    { label: '1 month', days: 30 },
                  ].map(({ label, days }) => {
                    const from = new Date(); from.setHours(0,0,0,0)
                    const to = addDays(from, days - 1)
                    const active = coStartDate?.toDateString() === from.toDateString() && coEndDate?.toDateString() === to.toDateString()
                    return (
                      <Button key={label} variant={active ? 'default' : 'outline'} size="sm" className="flex-1"
                        onClick={() => { setCoStartDate(from); setCoEndDate(to) }}>
                        {label}
                      </Button>
                    )
                  })}
                </CardFooter>
              </Card>
            </div>

            {/* Reason */}
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Reason</p>
              <Select value={coReason} onValueChange={setCoReason}>
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="player_request" className="text-sm">Player request</SelectItem>
                  <SelectItem value="problem_gambling" className="text-sm">Problem gambling behaviour</SelectItem>
                  <SelectItem value="regulatory" className="text-sm">Regulatory requirement</SelectItem>
                  <SelectItem value="operator_decision" className="text-sm">Operator decision</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Note */}
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Note <span className="text-muted-foreground font-normal">(optional)</span></p>
              <textarea
                value={coNote}
                onChange={e => setCoNote(e.target.value)}
                placeholder="Internal note for audit log..."
                rows={3}
                className="w-full resize-none rounded-xl border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            {/* Info */}
            <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 flex flex-col gap-1">
              <p className="text-sm font-medium">Cooling-off takes effect immediately</p>
              <p className="text-xs text-muted-foreground">
                The player will be temporarily restricted. The period cannot be shortened once applied.
              </p>
            </div>

          </div>

          <div className="shrink-0 border-t border-border bg-muted p-4 flex gap-2">
            <DrawerClose asChild>
              <Button variant="outline" className="flex-1">Cancel</Button>
            </DrawerClose>
            <Button
              className="flex-1"
              disabled={!coReason}
              onClick={() => setCoDrawerOpen(false)}
            >
              <Timer className="size-4" />
              Apply cooling-off
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

    </>
  )
}
