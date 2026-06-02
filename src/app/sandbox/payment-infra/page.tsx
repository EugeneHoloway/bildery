'use client'

import { useState, useEffect, useRef } from 'react'
import type { ElementType } from 'react'
import {
  CreditCard, Settings, RefreshCw, Lock, Shield, ArrowUpRight,
  Cpu, Link2, Repeat2, User, SlidersHorizontal, Plug, Zap,
  Plus, Wrench, Globe, Wallet, CheckCircle2, Gift, BarChart2,
  Tag, ArrowLeftRight, ArrowUpDown, ChevronDown,
  LockOpen, Lock as LockIcon, GripVertical, Pencil, Trash2, Check, X,
} from 'lucide-react'
import Link from 'next/link'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { Badge }      from '@/components/ui/badge'
import { Button }     from '@/components/ui/button'
import { Checkbox }   from '@/components/ui/checkbox'
import { Input }      from '@/components/ui/input'
import { DocLayout }  from '@/components/doc/DocLayout'
import { DocSection } from '@/components/doc/DocSection'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

// ─── Types ───────────────────────────────────────────────────────────────────

interface NodeDef {
  id: string
  label: string
  sub: string
  Icon: ElementType
  wide?: boolean
  accent?: boolean
  phases?: number[]
  href?: string
  newTab?: boolean
}

const phaseBadgeColors: Record<number, { bg: string; text: string }> = {
  0: { bg: 'bg-slate-500/10',   text: 'text-slate-500'   },
  1: { bg: 'bg-sky-500/10',     text: 'text-sky-500'     },
  2: { bg: 'bg-amber-500/10',   text: 'text-amber-500'   },
  3: { bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
  4: { bg: 'bg-violet-500/10',  text: 'text-violet-500'  },
  5: { bg: 'bg-pink-500/10',    text: 'text-pink-500'    },
  6: { bg: 'bg-orange-500/10',  text: 'text-orange-500'  },
}

interface LayerDef {
  id: string
  label: string
  colorCls:        string
  dividerCls:      string
  borderActiveCls: string
  bgActiveCls:     string
  accentBgCls:     string
  accentBorderCls: string
  accentTextCls:   string
  nodes: NodeDef[]
}

// ─── Data ────────────────────────────────────────────────────────────────────

const layers: LayerDef[] = [
  {
    id: 'frontend',
    label: 'FRONTEND LAYER',
    colorCls:        'text-violet-500',
    dividerCls:      'bg-violet-500',
    borderActiveCls: 'border-violet-500/40',
    bgActiveCls:     'bg-violet-500/10',
    accentBgCls:     'bg-violet-500/10',
    accentBorderCls: 'border-violet-500/30',
    accentTextCls:   'text-violet-500',
    nodes: [
      { id: 'checkout', label: 'Checkout UI',    sub: 'Deposit | Withdrawal',         Icon: CreditCard, phases: [2],   href: '/sandbox/brand-canvas', newTab: true },
      { id: 'admin',    label: 'Admin Panel',    sub: 'PSP Management | Routing',     Icon: Settings,   phases: [4]    },
      { id: 'status',   label: 'Status Polling', sub: 'Webhook events -- UI',         Icon: RefreshCw,  phases: [2],   href: '/sandbox/payment-infra/status-polling' },
    ],
  },
  {
    id: 'api',
    label: 'API GATEWAY',
    colorCls:        'text-sky-500',
    dividerCls:      'bg-sky-500',
    borderActiveCls: 'border-sky-500/40',
    bgActiveCls:     'bg-sky-500/10',
    accentBgCls:     'bg-sky-500/10',
    accentBorderCls: 'border-sky-500/30',
    accentTextCls:   'text-sky-500',
    nodes: [
      { id: 'auth',   label: 'Auth & Brand',    sub: 'JWT + Brand context',           Icon: Lock,         phases: [1]    },
      { id: 'rate',   label: 'Rate Limiting',   sub: 'Velocity checks',               Icon: Shield,       phases: [2]    },
      { id: 'router', label: 'Request Router',  sub: 'Deposit | Withdrawal routes',   Icon: ArrowUpRight, phases: [2]    },
    ],
  },
  {
    id: 'orchestration',
    label: 'ORCHESTRATION LAYER',
    colorCls:        'text-amber-500',
    dividerCls:      'bg-amber-500',
    borderActiveCls: 'border-amber-500/40',
    bgActiveCls:     'bg-amber-500/10',
    accentBgCls:     'bg-amber-500/10',
    accentBorderCls: 'border-amber-500/30',
    accentTextCls:   'text-amber-500',
    nodes: [
      { id: 'orchestrator',    label: 'Payment Orchestrator', sub: 'Routing rules engine',          Icon: Cpu,               wide: true, phases: [2]    },
      { id: 'cascade',         label: 'Cascade Manager',      sub: 'Failover PSP1 → PSP2 → PSP3',       Icon: Link2,                         phases: [2]    },
      { id: 'statemachine',    label: 'State Machine',        sub: 'INITIATED → PROCESSING → DONE',     Icon: Repeat2,                       phases: [1],   href: '/sandbox/payment-infra/state-machine' },
      { id: 'personalization', label: 'Personalization',      sub: 'BIN + preferred method',        Icon: User,                          phases: [5]    },
      { id: 'limits',          label: 'Limits & Rules',       sub: 'Min/max, velocity, KYC gate',   Icon: SlidersHorizontal,             phases: [3]    },
    ],
  },
  {
    id: 'adapter',
    label: 'ADAPTER LAYER -- IPaymentProvider',
    colorCls:        'text-emerald-500',
    dividerCls:      'bg-emerald-500',
    borderActiveCls: 'border-emerald-500/40',
    bgActiveCls:     'bg-emerald-500/10',
    accentBgCls:     'bg-emerald-500/10',
    accentBorderCls: 'border-emerald-500/30',
    accentTextCls:   'text-emerald-500',
    nodes: [
      { id: 'interface', label: 'Unified Interface', sub: 'initiateDeposit | getStatus | handleWebhook', Icon: Plug,   wide: true, phases: [1],   href: '/sandbox/payment-infra/unified-interface' },
      { id: 'adapter1',  label: 'PSP #1 Adapter',    sub: 'Your current provider',                      Icon: Zap,   accent: true, phases: [1] },
      { id: 'adapter2',  label: 'PSP #2 Adapter',    sub: 'Next integration',                            Icon: Plus,                phases: [5] },
      { id: 'adapterN',  label: 'PSP #N Adapter',    sub: 'Pluggable',                                   Icon: Wrench,              phases: [5] },
    ],
  },
  {
    id: 'psp',
    label: 'EXTERNAL PSPs',
    colorCls:        'text-slate-400',
    dividerCls:      'bg-slate-400',
    borderActiveCls: 'border-slate-400/40',
    bgActiveCls:     'bg-slate-500/10',
    accentBgCls:     'bg-amber-500/10',
    accentBorderCls: 'border-amber-500/30',
    accentTextCls:   'text-amber-500',
    nodes: [
      { id: 'psp1', label: 'PSP #1 API', sub: 'Cards | Crypto',  Icon: Globe, accent: true, phases: [1] },
      { id: 'psp2', label: 'PSP #2 API', sub: 'e-Wallets',       Icon: Globe,              phases: [5] },
      { id: 'pspN', label: 'PSP #N API', sub: 'Local methods',   Icon: Globe,              phases: [5] },
    ],
  },
  {
    id: 'support',
    label: 'SUPPORT SERVICES',
    colorCls:        'text-pink-500',
    dividerCls:      'bg-pink-500',
    borderActiveCls: 'border-pink-500/40',
    bgActiveCls:     'bg-pink-500/10',
    accentBgCls:     'bg-pink-500/10',
    accentBorderCls: 'border-pink-500/30',
    accentTextCls:   'text-pink-500',
    nodes: [
      { id: 'wallet',         label: 'Wallet Engine', sub: 'Balance | ledger',    Icon: Wallet,       phases: [2] },
      { id: 'kyc',            label: 'KYC | AML',     sub: 'Verification gates',  Icon: CheckCircle2, phases: [3] },
      { id: 'bonus',          label: 'Bonus Engine',  sub: 'Wager | locks',       Icon: Gift,         phases: [3] },
      { id: 'reconciliation', label: 'Reconciliation',sub: 'Nightly PSP sync',    Icon: BarChart2,    phases: [2] },
    ],
  },
]

const interfaceMethods = [
  'initiateDeposit(req) → UnifiedResponse',
  'initiateWithdrawal(req) → UnifiedResponse',
  'getTransactionStatus(id) → UnifiedStatus',
  'handleWebhook(payload) → UnifiedEvent',
  'getSupportedMethods(geo, currency) → Method[]',
]

const depositFlow = [
  'Player → Checkout UI',
  ' → API Gateway (auth + brand)',
  ' → Orchestrator (routing rules)',
  ' → Cascade Manager (PSP select)',
  ' → Adapter Layer (normalize)',
  ' → PSP API (execute)',
  '← Webhook → State Machine',
  '← Balance update → Wallet',
]

const transactionStates = [
  { state: 'INITIATED',                  colorCls: 'text-slate-400',          bgCls: 'bg-slate-500/10',    borderCls: 'border-slate-500/20'   },
  { state: 'PROCESSING',                 colorCls: 'text-amber-500',           bgCls: 'bg-amber-500/10',    borderCls: 'border-amber-500/20'   },
  { state: 'PENDING_CONFIRMATION',       colorCls: 'text-sky-500',             bgCls: 'bg-sky-500/10',      borderCls: 'border-sky-500/20'     },
  { state: 'COMPLETED',                  colorCls: 'text-emerald-500',         bgCls: 'bg-emerald-500/10',  borderCls: 'border-emerald-500/20' },
  { state: 'FAILED',                     colorCls: 'text-destructive',         bgCls: 'bg-destructive-bg',  borderCls: 'border-destructive/20' },
  { state: 'TIMED_OUT → reconciliation', colorCls: 'text-orange-500',          bgCls: 'bg-orange-500/10',   borderCls: 'border-orange-500/20'  },
  { state: 'CANCELLED',                  colorCls: 'text-muted-foreground',    bgCls: 'bg-muted',           borderCls: 'border-border'         },
]

const routingDimensions = [
  { label: 'Brand',     value: 'brand_id → PSP config',   Icon: Tag              },
  { label: 'GEO',       value: 'country → methods + PSP', Icon: Globe            },
  { label: 'Currency',  value: 'currency → PSP filter',   Icon: ArrowLeftRight   },
  { label: 'Direction', value: 'deposit vs withdrawal',   Icon: ArrowUpDown      },
  { label: 'Player',    value: 'BIN + last success',      Icon: User             },
  { label: 'Cascade',   value: 'priority + health score', Icon: Link2            },
]

// ─── Truncated label with tooltip ────────────────────────────────────────────

function TruncatedLabel({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [truncated, setTruncated] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const check = () => setTruncated(el.scrollWidth > el.clientWidth)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <Tooltip open={truncated ? undefined : false}>
      <TooltipTrigger asChild>
        <span ref={ref} className="truncate text-sm font-semibold leading-snug text-foreground">
          {text}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">{text}</TooltipContent>
    </Tooltip>
  )
}

// ─── Node card ────────────────────────────────────────────────────────────────

function NodeCard({
  node,
  layer,
  phaseFilter,
}: {
  node: NodeDef
  layer: LayerDef
  phaseFilter: number | 'all'
}) {
  const { Icon } = node
  const dimmed = phaseFilter !== 'all' && !(node.phases?.includes(phaseFilter))


  const cardCls = cn(
    'border rounded-2xl p-3 flex items-start gap-2.5 transition-all',
    'bg-card border-border shadow-card',
    node.href && 'cursor-pointer hover:border-subtle-border hover:shadow-card-hover',
    dimmed && 'opacity-30',
  )

  const inner = (
    <>
      <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <TruncatedLabel text={node.label} />
          {node.phases && node.phases.length > 0 && (
            <div className="flex gap-1 shrink-0">
              {node.phases.map(p => (
                <Badge key={p} variant="secondary">Phase {p}</Badge>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{node.sub}</p>
      </div>
    </>
  )

  if (node.href) {
    return (
      <Link href={node.href} className={cardCls} {...(node.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {inner}
      </Link>
    )
  }

  return <div className={cardCls}>{inner}</div>
}

// ─── Layer card ───────────────────────────────────────────────────────────────

function LayerCard({
  layer,
  index,
  isLast,
  phaseFilter,
}: {
  layer: LayerDef
  index: number
  isLast: boolean
  phaseFilter: number | 'all'
}) {
  return (
    <div>

      {/* Header row: number + label aligned */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-muted text-xs font-bold text-muted-foreground tabular-nums">
          {index + 1}
        </div>
        <span className="text-xs font-bold uppercase text-foreground">
          {layer.label}
        </span>
      </div>

      {/* Body row: line + nodes */}
      <div className="flex gap-4">
        <div className="flex flex-col items-center w-7 shrink-0">
          {!isLast && <div className="w-px bg-border flex-1" />}
        </div>
        <div className={cn('flex-1 min-w-0', !isLast && 'pb-8')}>
          <div className="grid grid-cols-2 gap-2.5 tablet:grid-cols-3 desktop:grid-cols-5">
            {layer.nodes.map((node) => (
              <NodeCard
                key={node.id}
                node={node}
                layer={layer}
                phaseFilter={phaseFilter}
              />
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}

// ─── Delivery phases data ────────────────────────────────────────────────────

interface PhaseGroup { label: string; items: string[] }
interface Phase {
  id: string
  title: string
  subtitle?: string
  items?: string[]
  groups?: PhaseGroup[]
  output: string
  badgeCls: string
  badgeTextCls: string
}

const deliveryPhases: Phase[] = [
  {
    id: '0',
    badgeCls: 'bg-slate-500/10',
    badgeTextCls: 'text-slate-500',
    title: 'Architecture & Contracts',
    subtitle: 'Documents only -- no code',
    items: [
      'System Context diagram (C4) -- all components and connections',
      'Transaction State Machine -- all statuses and transitions',
      'Unified Payment Interface -- request/response types, error codes',
      'Data model -- transactions, payment_methods, psp_configs, routing_rules tables',
      'API contract frontend ↔ backend (deposit and withdrawal endpoints)',
    ],
    output: 'FigJam with diagrams + Notion with contracts. All three parties have signed off.',
  },
  {
    id: '1',
    badgeCls: 'bg-sky-500/10',
    badgeTextCls: 'text-sky-500',
    title: 'Adapter Layer + First PSP',
    subtitle: 'Backend only -- frontend not needed yet',
    items: [
      'Implement IPaymentProvider interface',
      'Write adapter for PSP #1 (your current provider)',
      'Map its statuses → UnifiedStatus',
      'Normalize PSP #1 webhooks',
      'Basic error handling and timeouts',
      'Idempotency mechanism (unique payment_id, duplicate protection)',
      'Transaction state machine in code',
    ],
    output: 'Deposit via PSP #1 is working. Adapter tests in place.',
  },
  {
    id: '2',
    badgeCls: 'bg-amber-500/10',
    badgeTextCls: 'text-amber-500',
    title: 'Orchestration Layer',
    subtitle: 'Backend continues, frontend starts in parallel',
    groups: [
      {
        label: 'Backend:',
        items: [
          'Payment Orchestrator -- accepts request, selects PSP by routing rules',
          'Basic routing: brand → geo → method → PSP',
          'PSP config in database (not in code) -- brand, geo, methods, priority',
          'Cascading -- fallback to next PSP on failure',
          'Webhook receiver + event processing from PSP',
          'Reconciliation job -- nightly status sync',
        ],
      },
      {
        label: 'Frontend (in parallel):',
        items: [
          'Checkout UI -- method list, deposit form',
          'Polling or webhook transaction status',
          'Handle all statuses (pending, success, failed, timeout)',
        ],
      },
    ],
    output: 'Working end-to-end deposit flow with one PSP and basic routing.',
  },
  {
    id: '3',
    badgeCls: 'bg-emerald-500/10',
    badgeTextCls: 'text-emerald-500',
    title: 'Withdrawal + Compliance',
    items: [
      'Withdrawal flow (often more complex than deposit -- manual approval, queues)',
      'Card-to-card rule -- withdrawal only to deposit method',
      'Limits -- min/max, daily, velocity checks',
      'KYC gate -- block withdrawal until verification',
      'Pending withdrawal queue in admin panel',
    ],
    output: 'Full payment cycle: deposit → play → withdraw.',
  },
  {
    id: '4',
    badgeCls: 'bg-violet-500/10',
    badgeTextCls: 'text-violet-500',
    title: 'Admin Panel',
    items: [
      'PSP Management -- add/disable, credentials, health status',
      'Routing rules UI -- configure without deploy',
      'Transaction search + manual retry / refund / void',
      'Limits per brand / geo / method via UI',
      'Basic analytics -- success rate, conversion by method',
    ],
    output: 'Operations team can manage PSPs and routing without engineer involvement.',
  },
  {
    id: '5',
    badgeCls: 'bg-pink-500/10',
    badgeTextCls: 'text-pink-500',
    title: 'Personalization + Second PSP',
    items: [
      'Save BIN and preferred player method',
      'Pre-fill last successful method in checkout',
      'Saved instruments (if PSP supports tokenization)',
      'Adapter for PSP #2 -- verify the interface is truly universal',
      'A/B test payment methods (optional)',
    ],
    output: 'Checkout conversion improves. Second PSP connected with zero interface changes.',
  },
  {
    id: '6',
    badgeCls: 'bg-orange-500/10',
    badgeTextCls: 'text-orange-500',
    title: 'Advanced Routing + Risk',
    items: [
      'Smart routing by success rate (dynamic PSP priority)',
      'Fraud checks -- velocity, BIN checks, device fingerprint',
      'FX / multi-currency',
      'Fee tracking and P&L analytics',
    ],
    output: 'Self-optimizing routing. Full risk and analytics layer.',
  },
]

// ─── Types & helpers for Supabase phase items ─────────────────────────────────

interface PhaseItem {
  id: number
  phase_id: string
  group_label: string | null
  text: string
  is_done: boolean
  order: number | null
}

const PASSWORD = process.env.NEXT_PUBLIC_TODO_PASSWORD

// ─── Sortable checklist item ──────────────────────────────────────────────────

function SortableItem({
  item,
  isUnlocked,
  onToggle,
  onEdit,
  onDelete,
}: {
  item: PhaseItem
  isUnlocked: boolean
  onToggle: (item: PhaseItem) => void
  onEdit: (item: PhaseItem, text: string) => void
  onDelete: (item: PhaseItem) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id, disabled: !isUnlocked })

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(item.text)
  const inputRef = useRef<HTMLInputElement>(null)

  function startEdit() {
    setDraft(item.text)
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function commitEdit() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== item.text) onEdit(item, trimmed)
    setEditing(false)
  }

  function cancelEdit() {
    setDraft(item.text)
    setEditing(false)
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-2 rounded-lg py-0.5',
        isDragging && 'z-10',
      )}
    >
      {/* drag handle */}
      {isUnlocked && (
        <button
          {...attributes}
          {...listeners}
          className="shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground transition-colors touch-none"
          tabIndex={-1}
        >
          <GripVertical className="size-4" />
        </button>
      )}

      <Checkbox
        checked={item.is_done}
        onCheckedChange={() => isUnlocked && onToggle(item)}
        className={cn('shrink-0', !isUnlocked && 'pointer-events-none')}
      />

      {editing ? (
        <div className="flex flex-1 items-center gap-1">
          <Input
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') commitEdit()
              if (e.key === 'Escape') cancelEdit()
            }}
            className="h-7 text-sm flex-1"
          />
          <Button variant="ghost" size="icon-sm" onClick={commitEdit} aria-label="Save">
            <Check className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={cancelEdit} aria-label="Cancel">
            <X className="size-3.5" />
          </Button>
        </div>
      ) : (
        <>
          <span
            className={cn(
              'flex-1 text-sm leading-snug transition-colors text-foreground',
              item.is_done && 'line-through text-muted-foreground',
            )}
          >
            {item.text}
          </span>
          {isUnlocked && (
            <div className="flex items-center gap-0.5 shrink-0">
              <Button variant="ghost" size="icon-sm" onClick={startEdit} aria-label="Edit">
                <Pencil className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="hover:bg-destructive-bg hover:text-destructive"
                onClick={() => onDelete(item)}
                aria-label="Delete"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Add item input ───────────────────────────────────────────────────────────

function AddItemInput({ onAdd }: { onAdd: (text: string) => void }) {
  const [value, setValue] = useState('')

  function submit() {
    const trimmed = value.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setValue('')
  }

  return (
    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
      <Plus className="size-3.5 text-muted-foreground shrink-0" />
      <Input
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') submit()
          if (e.key === 'Escape') setValue('')
        }}
        placeholder="Add item…"
        className="h-7 text-sm flex-1"
      />
      <Button size="sm" onClick={submit} disabled={!value.trim()} className="h-7 px-2.5 text-xs">
        Add
      </Button>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Page() {
  const [phaseFilter, setPhaseFilter]     = useState<number | 'all'>('all')

  // Supabase state
  const [items, setItems]                 = useState<PhaseItem[]>([])
  const [isUnlocked, setIsUnlocked]       = useState(false)
  const [showPassword, setShowPassword]   = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  useEffect(() => { fetchItems() }, [])

  async function fetchItems() {
    const { data } = await supabase
      .from('phase_items')
      .select('*')
      .order('order', { ascending: true })
    if (data) setItems(data)
  }

  async function toggleItem(item: PhaseItem) {
    if (!isUnlocked) return
    await supabase.from('phase_items').update({ is_done: !item.is_done }).eq('id', item.id)
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_done: !i.is_done } : i))
  }

  async function editItem(item: PhaseItem, text: string) {
    await supabase.from('phase_items').update({ text }).eq('id', item.id)
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, text } : i))
  }

  async function deleteItem(item: PhaseItem) {
    await supabase.from('phase_items').delete().eq('id', item.id)
    setItems(prev => prev.filter(i => i.id !== item.id))
  }

  async function addItem(phaseId: string, groupLabel: string | null, text: string) {
    const siblings = items.filter(i => i.phase_id === phaseId && i.group_label === groupLabel)
    const maxOrder = siblings.reduce((m, i) => Math.max(m, i.order ?? 0), 0)
    const { data } = await supabase
      .from('phase_items')
      .insert({ phase_id: phaseId, group_label: groupLabel, text, is_done: false, order: maxOrder + 1 })
      .select()
      .single()
    if (data) setItems(prev => [...prev, data])
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setItems(prev => {
      const oldIndex = prev.findIndex(i => i.id === active.id)
      const newIndex = prev.findIndex(i => i.id === over.id)
      const next = arrayMove(prev, oldIndex, newIndex)
      // persist new orders for affected phase/group
      const movedItem = prev[oldIndex]
      const siblings = next.filter(
        i => i.phase_id === movedItem.phase_id && i.group_label === movedItem.group_label,
      )
      siblings.forEach((item, idx) => {
        supabase.from('phase_items').update({ order: idx }).eq('id', item.id)
      })
      return next
    })
  }

  function handleUnlock() {
    if (passwordInput === PASSWORD) {
      setIsUnlocked(true); setShowPassword(false)
      setPasswordError(false); setPasswordInput('')
    } else {
      setPasswordError(true)
    }
  }

  return (
    <DocLayout
      title="Payment Infrastructure"
      breadcrumbLabel="Sandbox"
      breadcrumbHref="/sandbox"
      description="Multi-tenant | Multi-PSP | Cascading | Adapter Pattern"
      tags={[
        { label: 'Prototype',       type: 'tag'    },
        { label: 'Infrastructure',  type: 'status' },
        { label: 'EN',              type: 'tag'    },
      ]}
      footnote="DEPO44 | PAYMENT MODULE v1 | PHASE 0 ARCHITECTURE"
    >

      {/* ── Phase filter ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5 mb-8">
        <button
          onClick={() => setPhaseFilter('all')}
          className={cn(
            'px-2.5 py-1 rounded-md border text-xs font-semibold transition-all',
            phaseFilter === 'all'
              ? 'bg-foreground text-background border-foreground'
              : 'bg-transparent text-muted-foreground border-border hover:text-foreground',
          )}
        >
          All
        </button>
        {Object.entries(phaseBadgeColors).map(([p, c]) => (
          <button
            key={p}
            onClick={() => setPhaseFilter(phaseFilter === Number(p) ? 'all' : Number(p))}
            className={cn(
              'px-2.5 py-1 rounded-md border text-xs font-semibold transition-all',
              phaseFilter === Number(p)
                ? 'bg-foreground text-background border-foreground'
                : 'bg-transparent text-muted-foreground border-border hover:text-foreground',
            )}
          >
            Phase {p}
          </button>
        ))}
      </div>

      {/* ── Section 1: Architecture diagram ─────────────────────────────── */}
      <DocSection num="1" title="Architecture Overview">
        <div className="flex flex-col gap-3 mb-8">
          {layers.map((layer, i) => (
            <div key={layer.id}>
              <LayerCard
                layer={layer}
                index={i}
                isLast={i === layers.length - 1}
                phaseFilter={phaseFilter}
              />
            </div>
          ))}
        </div>
      </DocSection>

      {/* ── Section 2: Info cards ────────────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="2" title="Key Flows & Reference">
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-3">

          {/* Deposit flow */}
          <div className="border border-border rounded-2xl p-4">
            <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4">
              DEPOSIT FLOW
            </p>
            <div className="flex flex-col gap-1">
              {depositFlow.map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="shrink-0 text-muted-foreground/60 tabular-nums w-5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className={cn(
                    'text-muted-foreground',
                    (i === 0 || i === depositFlow.length - 1) && 'font-semibold text-foreground',
                  )}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction states */}
          <div className="border border-border rounded-2xl p-4">
            <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4">
              TRANSACTION STATES
            </p>
            <div className="flex flex-col items-start gap-0">
              {transactionStates.map((s, i) => (
                <div key={i} className="flex flex-col items-start">
                  {i > 0 && (
                    <ChevronDown className="size-3 text-muted-foreground/30 my-1 ml-2" />
                  )}
                  <span className={cn(
                    'text-xs border rounded px-2 py-0.5',
                    s.colorCls, s.bgCls, s.borderCls,
                  )}>
                    {s.state}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Routing dimensions */}
          <div className="border border-border rounded-2xl p-4">
            <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4">
              ROUTING DIMENSIONS
            </p>
            <div className="flex flex-col divide-y divide-border">
              {routingDimensions.map((r) => (
                <div key={r.label} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <r.Icon className="size-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-foreground">{r.label}</span>
                    <span className="text-xs text-muted-foreground ml-2">{r.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </DocSection>
      </div>

      {/* ── Section 3: Delivery phases ───────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="3" title="Delivery Phases">

        {/* Lock / Unlock bar */}
        <div className="flex items-center justify-end gap-2 mb-5">
          {showPassword && !isUnlocked && (
            <div className="flex gap-2 flex-1 max-w-xs">
              <Input
                type="password"
                placeholder="Password"
                value={passwordInput}
                onChange={e => { setPasswordInput(e.target.value); setPasswordError(false) }}
                onKeyDown={e => e.key === 'Enter' && handleUnlock()}
                aria-invalid={passwordError || undefined}
                autoFocus
                className="flex-1"
              />
              <Button onClick={handleUnlock} size="sm">Unlock</Button>
            </div>
          )}
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => {
              if (isUnlocked) { setIsUnlocked(false) }
              else setShowPassword(v => !v)
            }}
            aria-label={isUnlocked ? 'Lock' : 'Unlock'}
          >
            {isUnlocked ? <LockOpen className="size-4" /> : <LockIcon className="size-4" />}
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          {deliveryPhases.map((phase) => {
            const phaseItems = items.filter(i => i.phase_id === phase.id)
            const groups = phase.groups
              ? phase.groups.map(g => ({
                  label: g.label,
                  items: phaseItems.filter(i => i.group_label === g.label),
                }))
              : null
            const flatItems = phase.groups ? null : phaseItems

            const doneCount  = phaseItems.filter(i => i.is_done).length
            const totalCount = phaseItems.length

            return (
              <div key={phase.id} className="border border-border rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-muted text-xs font-bold text-muted-foreground tabular-nums">
                    {phase.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className={cn('text-sm font-bold', phase.badgeTextCls)}>{phase.title}</div>
                      {totalCount > 0 && (
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {doneCount}/{totalCount}
                        </span>
                      )}
                    </div>
                    {phase.subtitle && (
                      <p className="text-xs text-muted-foreground mt-0.5">{phase.subtitle}</p>
                    )}

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    {groups ? (
                      groups.map(group => (
                        <div key={group.label} className="mt-3">
                          <p className="text-xs font-semibold text-foreground mb-2">{group.label}</p>
                          <SortableContext items={group.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                            <div className="flex flex-col gap-0.5">
                              {group.items.map(item => (
                                <SortableItem
                                  key={item.id}
                                  item={item}
                                  isUnlocked={isUnlocked}
                                  onToggle={toggleItem}
                                  onEdit={editItem}
                                  onDelete={deleteItem}
                                />
                              ))}
                            </div>
                          </SortableContext>
                          {isUnlocked && (
                            <AddItemInput onAdd={text => addItem(phase.id, group.label, text)} />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="mt-3">
                        <SortableContext items={(flatItems ?? []).map(i => i.id)} strategy={verticalListSortingStrategy}>
                          <div className="flex flex-col gap-0.5">
                            {(flatItems ?? []).map(item => (
                              <SortableItem
                                key={item.id}
                                item={item}
                                isUnlocked={isUnlocked}
                                onToggle={toggleItem}
                                onEdit={editItem}
                                onDelete={deleteItem}
                              />
                            ))}
                          </div>
                        </SortableContext>
                        {isUnlocked && (
                          <AddItemInput onAdd={text => addItem(phase.id, null, text)} />
                        )}
                      </div>
                    )}
                    </DndContext>

                    <div className="mt-4 flex items-baseline gap-2 rounded-xl bg-muted px-3 py-2.5">
                      <span className="text-xs font-semibold text-foreground shrink-0">Output:</span>
                      <span className="text-xs text-muted-foreground leading-relaxed">{phase.output}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </DocSection>
      </div>

    </DocLayout>
  )
}
