'use client'

import { useState } from 'react'
import type { ElementType } from 'react'
import {
  CreditCard, ArrowUpFromLine, AlertTriangle, Plug,
  Tag, Repeat2, Link2, WifiOff, Percent, ArrowLeftRight, Lock,
  ArrowDown, MousePointer2, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DocLayout }  from '@/components/doc/DocLayout'
import { DocSection } from '@/components/doc/DocSection'

// ─── Types ───────────────────────────────────────────────────────────────────

type StatusKey = 'neutral' | 'processing' | 'success' | 'partial' | 'failed' | 'timeout'

interface StateDef {
  id: string
  label: string
  unified: string
  status: StatusKey
  desc: string
  passimpay: string
  notes: string[]
}

interface EdgeCase {
  id: string
  Icon: ElementType
  title: string
  severity: 'high' | 'medium' | 'low'
  desc: string
  action: string
}

interface NormRow {
  passimpay: string
  approve: string
  status: string
  unified: string
  unifiedStatus: StatusKey
}

// ─── Status color map ─────────────────────────────────────────────────────────

const STATUS: Record<StatusKey, { dot: string; text: string; selBorder: string; selBg: string; badge: string }> = {
  neutral:    { dot: 'bg-slate-400',   text: 'text-slate-400',   selBorder: 'border-slate-400/40',   selBg: 'bg-slate-500/10',   badge: 'bg-slate-500/10 text-slate-400'   },
  processing: { dot: 'bg-warning',     text: 'text-warning',     selBorder: 'border-warning/40',     selBg: 'bg-warning-bg',     badge: 'bg-warning-bg text-warning'       },
  success:    { dot: 'bg-success',     text: 'text-success',     selBorder: 'border-success/40',     selBg: 'bg-success-bg',     badge: 'bg-success-bg text-success'       },
  partial:    { dot: 'bg-violet-500',  text: 'text-violet-500',  selBorder: 'border-violet-500/40',  selBg: 'bg-violet-500/10',  badge: 'bg-violet-500/10 text-violet-500' },
  failed:     { dot: 'bg-destructive', text: 'text-destructive', selBorder: 'border-destructive/40', selBg: 'bg-destructive-bg', badge: 'bg-destructive-bg text-destructive'},
  timeout:    { dot: 'bg-orange-500',  text: 'text-orange-500',  selBorder: 'border-orange-500/40',  selBg: 'bg-orange-500/10',  badge: 'bg-orange-500/10 text-orange-500' },
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const DEPOSIT_STATES: StateDef[] = [
  {
    id: 'address_requested',
    label: 'ADDRESS_REQUESTED',
    unified: 'INITIATED',
    status: 'neutral',
    desc: 'Наш бэк вызвал /getaddress или /invoice. PassimPay вернул адрес + paymentId.',
    passimpay: 'GET /getaddress → { paymentId, addressTo }',
    notes: [],
  },
  {
    id: 'awaiting_payment',
    label: 'AWAITING_PAYMENT',
    unified: 'PROCESSING',
    status: 'processing',
    desc: 'Адрес показан игроку. Ждём перевод. Никакого события от PassimPay ещё нет.',
    passimpay: '-- (нет события)',
    notes: ['Нужен TTL / expiry таймер на нашей стороне', 'Invoice: expires через N минут'],
  },
  {
    id: 'blockchain_pending',
    label: 'BLOCKCHAIN_PENDING',
    unified: 'PROCESSING',
    status: 'processing',
    desc: 'Для BTC/LTC/DOGE/DASH/BCH: webhook пришёл с confirmations=1. Транзакция в мемпуле, ещё не финальная.',
    passimpay: 'Webhook: { type:"deposit", confirmations:1 }',
    notes: ['Только для UTXO-сетей', 'EVM/TRX/TON -- только одно событие'],
  },
  {
    id: 'confirmed',
    label: 'CONFIRMED',
    unified: 'COMPLETED',
    status: 'success',
    desc: 'Депозит финально подтверждён. Зачислить баланс игроку.',
    passimpay: 'Webhook: { type:"deposit", confirmations:2 } или confirmations:0 для EVM/TRX',
    notes: ['amountReceive -- сумма после комиссии сервиса', 'Это поле для зачисления на баланс'],
  },
  {
    id: 'partial_waiting',
    label: 'PARTIAL_WAITING',
    unified: 'PENDING_PARTIAL',
    status: 'partial',
    desc: 'Invoice: пришла оплата меньше требуемой суммы.',
    passimpay: 'Webhook Invoice: { status:"waiting", amount: фактическая }',
    notes: ['Только для Invoice метода', 'Два варианта: ждать доплату ИЛИ зачислить фактическую сумму'],
  },
  {
    id: 'expired_error',
    label: 'EXPIRED / ERROR',
    unified: 'FAILED',
    status: 'failed',
    desc: 'Invoice истёк или оплачен частично и время вышло.',
    passimpay: 'Webhook Invoice: { status:"error", amount: фактическая }',
    notes: ['amount в callback = реально полученная сумма', 'Частичная оплата → решение на нашей стороне'],
  },
  {
    id: 'no_callback',
    label: 'NO_CALLBACK',
    unified: 'TIMED_OUT',
    status: 'timeout',
    desc: 'Истёк наш внутренний TTL -- игрок не заплатил или не пришёл webhook.',
    passimpay: '-- (нет события от PassimPay)',
    notes: [
      'PassimPay: callback ONLY on success',
      'Если нет callback = нет оплаты (по документации)',
      'Но: нужна reconciliation job на случай потери webhook',
    ],
  },
]

const WITHDRAW_STATES: StateDef[] = [
  {
    id: 'w_initiated',
    label: 'W_INITIATED',
    unified: 'INITIATED',
    status: 'neutral',
    desc: 'Игрок запросил вывод. Наш бэк вызвал POST /withdraw.',
    passimpay: 'POST /withdraw → { transactionId }',
    notes: ['Сумма должна быть в крипте, не в USD', 'Нужна конвертация USD→крипта перед запросом'],
  },
  {
    id: 'w_wait',
    label: 'W_WAIT',
    unified: 'PROCESSING',
    status: 'processing',
    desc: 'PassimPay принял запрос, обрабатывает. Webhook с approve=0.',
    passimpay: 'Webhook: { type:"withdraw", approve:0 }',
    notes: [],
  },
  {
    id: 'w_success',
    label: 'W_SUCCESS',
    unified: 'COMPLETED',
    status: 'success',
    desc: 'Вывод выполнен. Деньги ушли на блокчейн-адрес игрока.',
    passimpay: 'Webhook: { type:"withdraw", approve:1, txhash }',
    notes: ['amountDebited -- итоговое списание с нашего баланса', 'txhash для верификации в блокчейне'],
  },
  {
    id: 'w_error',
    label: 'W_ERROR',
    unified: 'FAILED',
    status: 'failed',
    desc: 'Вывод не выполнен. Нужно вернуть средства на баланс игрока.',
    passimpay: 'Webhook: { type:"withdraw", approve:2 }',
    notes: ['Обязательный rollback баланса', 'Уведомить игрока', 'Логировать для ops'],
  },
  {
    id: 'w_btc_pending',
    label: 'W_BLOCKCHAIN_PENDING',
    unified: 'PROCESSING',
    status: 'processing',
    desc: 'BTC/LTC/DOGE: webhook пришёл с confirmations=1. Транзакция в сети, но ещё не финальная.',
    passimpay: 'Webhook: { type:"withdraw", confirmations:1 }',
    notes: ['Только UTXO-сети', 'Ждём confirmations=2 для финального статуса'],
  },
]

const EDGE_CASES: EdgeCase[] = [
  {
    id: 'tag_missing',
    Icon: Tag,
    title: 'Отсутствует tag / memo',
    severity: 'high',
    desc: 'XRP, TON и подобные сети требуют destinationTag. Если игрок не указал -- PassimPay не может идентифицировать платёж.',
    action: 'UI обязан показывать tag + предупреждение. Без тега -- деньги потеряны.',
  },
  {
    id: 'duplicate_webhook',
    Icon: Repeat2,
    title: 'Дублирующий webhook',
    severity: 'high',
    desc: 'PassimPay делает до 3 попыток доставки webhook (2 retry). Один и тот же paymentId может прийти дважды.',
    action: 'Idempotency check по paymentId перед любым изменением баланса.',
  },
  {
    id: 'double_confirmation',
    Icon: Link2,
    title: 'Двойной webhook (BTC/LTC/DOGE)',
    severity: 'medium',
    desc: 'UTXO-сети шлют webhook дважды: confirmations=1 и confirmations=2. Первый -- не финальный.',
    action: 'Зачислять баланс только при confirmations=2. Первый webhook -- только для UI (показать "в обработке").',
  },
  {
    id: 'webhook_lost',
    Icon: WifiOff,
    title: 'Потеря webhook',
    severity: 'medium',
    desc: 'Наш сервер не ответил 200 -- PassimPay сделал 2 retry и сдался. Транзакция на блокчейне есть, у нас -- нет.',
    action: 'Reconciliation job: сверка через /transactionstatus раз в час для PROCESSING транзакций.',
  },
  {
    id: 'partial_payment',
    Icon: Percent,
    title: 'Частичная оплата (Invoice)',
    severity: 'medium',
    desc: 'Игрок заплатил меньше суммы инвойса. PassimPay шлёт status=waiting с фактической суммой.',
    action: 'Бизнес-решение: зачислить фактическую сумму ИЛИ ждать доплату до expiry.',
  },
  {
    id: 'amount_mismatch',
    Icon: ArrowLeftRight,
    title: 'Расхождение суммы',
    severity: 'low',
    desc: 'H2H: игрок может заплатить любую сумму. Курс крипты изменился между запросом адреса и оплатой.',
    action: 'Зачислять amountReceive из webhook, не изначально запрошенную сумму.',
  },
  {
    id: 'signature_fail',
    Icon: Lock,
    title: 'Невалидная подпись webhook',
    severity: 'high',
    desc: 'Webhook без верной x-signature должен быть отклонён.',
    action: 'Верификация HMAC-SHA256: platform_id + body + secret. Reject 400 если не совпадает.',
  },
]

const NORMALIZATION_MAP: NormRow[] = [
  { passimpay: 'Deposit webhook (H2H)', approve: '--', status: 'confirmations ≥ 1',          unified: 'PROCESSING',      unifiedStatus: 'processing' },
  { passimpay: 'Deposit webhook (H2H)', approve: '--', status: 'confirmations ≥ 2 (или 0 для EVM)', unified: 'COMPLETED', unifiedStatus: 'success'    },
  { passimpay: 'Invoice status',        approve: '--', status: 'waiting',                     unified: 'PENDING_PARTIAL', unifiedStatus: 'partial'    },
  { passimpay: 'Invoice status',        approve: '--', status: 'error',                       unified: 'FAILED',          unifiedStatus: 'failed'     },
  { passimpay: 'Withdraw webhook',      approve: '0',  status: '--',                          unified: 'PROCESSING',      unifiedStatus: 'processing' },
  { passimpay: 'Withdraw webhook',      approve: '1',  status: '--',                          unified: 'COMPLETED',       unifiedStatus: 'success'    },
  { passimpay: 'Withdraw webhook',      approve: '2',  status: '--',                          unified: 'FAILED',          unifiedStatus: 'failed'     },
  { passimpay: 'No callback + TTL expired', approve: '--', status: '--',                      unified: 'TIMED_OUT',       unifiedStatus: 'timeout'    },
]

const NORM_FIELDS = [
  { passimpay: 'amount (webhook)',       unified: 'amount_crypto',    note: 'Сумма в крипте'                        },
  { passimpay: 'amountReceive',          unified: 'amount_credited',  note: 'После комиссии -- для зачисления'      },
  { passimpay: 'amountDebited',          unified: 'amount_debited',   note: 'Для вывода -- итоговое списание'        },
  { passimpay: 'feeService + feeNetwork',unified: 'fee_total',        note: 'Сумма двух полей'                      },
  { passimpay: 'txhash',                 unified: 'blockchain_tx_id', note: 'Для верификации'                       },
  { passimpay: 'paymentId (integer)',    unified: 'psp_payment_id',   note: 'Хранить для idempotency'               },
]

// ─── Components ───────────────────────────────────────────────────────────────

function StateNode({ state, selected, onClick }: {
  state: StateDef
  selected: boolean
  onClick: (s: StateDef) => void
}) {
  const s = STATUS[state.status]
  return (
    <div
      onClick={() => onClick(state)}
      className={cn(
        'border rounded-2xl p-3 cursor-pointer transition-all duration-200',
        selected
          ? cn(s.selBorder, s.selBg)
          : 'border-border bg-card hover:border-subtle-border hover:shadow-card',
      )}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div className={cn('size-2 rounded-full shrink-0', s.dot)} />
        <span className={cn('text-xs font-bold tracking-wide', s.text)}>{state.label}</span>
      </div>
      <span className={cn('inline-flex text-xs px-2 py-0.5 rounded-md border border-border', STATUS[state.status].badge)}>
        → {state.unified}
      </span>
    </div>
  )
}

function FlowArrow({ label, colorCls = 'text-muted-foreground/50' }: { label?: string; colorCls?: string }) {
  return (
    <div className="flex items-start gap-2 py-1 pl-3">
      <div className="flex flex-col items-center shrink-0 mt-0.5">
        <div className="w-px h-3 bg-border" />
        <ArrowDown className={cn('size-3', colorCls)} />
      </div>
      {label && <span className={cn('text-xs leading-snug', colorCls)}>{label}</span>}
    </div>
  )
}

function DetailPanel({ state, onClose }: { state: StateDef; onClose: () => void }) {
  const s = STATUS[state.status]
  return (
    <div className={cn('border rounded-2xl p-4 shrink-0 w-full tablet:w-72', s.selBorder, s.selBg)}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className={cn('text-xs font-bold', s.text)}>{state.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Unified: <span className="text-foreground">{state.unified}</span>
          </p>
        </div>
        <button onClick={onClose} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
          <X className="size-4" />
        </button>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{state.desc}</p>

      <div className="mb-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">PassimPay Event</p>
        <div className="rounded-xl bg-success-bg border border-success-border px-3 py-2">
          <span className="text-xs text-success leading-relaxed">{state.passimpay}</span>
        </div>
      </div>

      {state.notes.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Notes</p>
          <div className="flex flex-col gap-1.5">
            {state.notes.map((n, i) => (
              <div key={i} className="flex items-start gap-2">
                <AlertTriangle className="size-3 shrink-0 mt-0.5 text-warning" />
                <span className="text-xs text-muted-foreground leading-snug">{n}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyPanel() {
  return (
    <div className="border border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center gap-2 shrink-0 w-full tablet:w-72 text-center">
      <MousePointer2 className="size-5 text-muted-foreground/40" />
      <p className="text-xs text-muted-foreground">Кликни на любой статус<br />для деталей</p>
    </div>
  )
}

// ─── Tab: Deposit ─────────────────────────────────────────────────────────────

function DepositTab({ selected, onSelect }: {
  selected: StateDef | null
  onSelect: (s: StateDef) => void
}) {
  const byId = (id: string) => DEPOSIT_STATES.find(s => s.id === id)!
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col tablet:flex-row gap-6 items-start">
        {/* Main diagram */}
        <div className="flex-1 flex flex-col tablet:flex-row gap-6">

          {/* Happy path */}
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 text-center">Happy Path</p>
            <StateNode state={byId('address_requested')} selected={selected?.id === 'address_requested'} onClick={onSelect} />
            <FlowArrow label="Адрес показан игроку" />
            <StateNode state={byId('awaiting_payment')} selected={selected?.id === 'awaiting_payment'} onClick={onSelect} />
            <FlowArrow label="BTC/LTC/DOGE: confirmations=1" colorCls="text-warning/70" />
            <StateNode state={byId('blockchain_pending')} selected={selected?.id === 'blockchain_pending'} onClick={onSelect} />
            <FlowArrow label="confirmations=2 (или сразу для EVM/TRX)" colorCls="text-success/70" />
            <StateNode state={byId('confirmed')} selected={selected?.id === 'confirmed'} onClick={onSelect} />
          </div>

          {/* Alternative paths */}
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 text-center">Альтернативные пути</p>
            <div className="mb-5">
              <p className="text-xs text-orange-500 mb-2">TTL expired (H2H)</p>
              <StateNode state={byId('no_callback')} selected={selected?.id === 'no_callback'} onClick={onSelect} />
            </div>
            <div>
              <p className="text-xs text-violet-500 mb-2">Invoice: частичная оплата</p>
              <StateNode state={byId('partial_waiting')} selected={selected?.id === 'partial_waiting'} onClick={onSelect} />
              <FlowArrow label="invoice expired" colorCls="text-destructive/70" />
              <StateNode state={byId('expired_error')} selected={selected?.id === 'expired_error'} onClick={onSelect} />
            </div>
          </div>
        </div>

        {/* Detail panel */}
        {selected ? <DetailPanel state={selected} onClose={() => onSelect(selected)} /> : <EmptyPanel />}
      </div>

      {/* H2H vs Invoice info boxes */}
      <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
        <div className="border border-info-border bg-info-bg rounded-2xl p-4">
          <p className="text-xs font-bold text-info mb-2">H2H метод</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Callback ТОЛЬКО при успешном депозите.<br />
            Нет callback = нет оплаты.<br />
            Игрок платит любую сумму.<br />
            Используй <code className="bg-muted px-1 rounded text-foreground">amountReceive</code> для зачисления.
          </p>
        </div>
        <div className="border border-violet-500/30 bg-violet-500/10 rounded-2xl p-4">
          <p className="text-xs font-bold text-violet-500 mb-2">Invoice метод</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Фиксированная сумма.<br />
            Статус <code className="bg-muted px-1 rounded text-foreground">waiting</code> = частичная оплата.<br />
            Статус <code className="bg-muted px-1 rounded text-foreground">error</code> = истёк или partial fail.<br />
            Поддерживает split оплату (USDT + BTC).
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Withdraw ────────────────────────────────────────────────────────────

function WithdrawTab({ selected, onSelect }: {
  selected: StateDef | null
  onSelect: (s: StateDef) => void
}) {
  const byId = (id: string) => WITHDRAW_STATES.find(s => s.id === id)!
  return (
    <div className="flex flex-col tablet:flex-row gap-6 items-start">
      <div className="flex-1 flex flex-col tablet:flex-row gap-6">

        {/* Happy path */}
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 text-center">Happy Path</p>
          <StateNode state={byId('w_initiated')} selected={selected?.id === 'w_initiated'} onClick={onSelect} />
          <FlowArrow label="PassimPay принял запрос" />
          <StateNode state={byId('w_wait')} selected={selected?.id === 'w_wait'} onClick={onSelect} />
          <FlowArrow label="BTC/LTC/DOGE: confirmations=1" colorCls="text-warning/70" />
          <StateNode state={byId('w_btc_pending')} selected={selected?.id === 'w_btc_pending'} onClick={onSelect} />
          <FlowArrow label="approve=1 + txhash" colorCls="text-success/70" />
          <StateNode state={byId('w_success')} selected={selected?.id === 'w_success'} onClick={onSelect} />
        </div>

        {/* Error path */}
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 text-center">Error Path</p>
          <div className="mt-0 tablet:mt-20">
            <p className="text-xs text-destructive mb-2">approve=2</p>
            <StateNode state={byId('w_error')} selected={selected?.id === 'w_error'} onClick={onSelect} />
            <div className="mt-3 border border-destructive/30 bg-destructive-bg rounded-xl px-3 py-2.5">
              <div className="flex items-start gap-2">
                <AlertTriangle className="size-3.5 shrink-0 mt-0.5 text-destructive" />
                <p className="text-xs text-destructive leading-snug">Обязательный rollback баланса игрока</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selected ? <DetailPanel state={selected} onClose={() => onSelect(selected)} /> : <EmptyPanel />}
    </div>
  )
}

// ─── Tab: Edge Cases ──────────────────────────────────────────────────────────

function EdgeCasesTab() {
  const severityStyle: Record<EdgeCase['severity'], { border: string; bg: string; badge: string; text: string }> = {
    high:   { border: 'border-destructive/25', bg: 'bg-destructive-bg',  badge: 'bg-destructive-bg text-destructive',  text: 'text-destructive'  },
    medium: { border: 'border-warning/20',     bg: 'bg-warning-bg',      badge: 'bg-warning-bg text-warning',          text: 'text-warning'      },
    low:    { border: 'border-border',          bg: 'bg-card',            badge: 'bg-muted text-muted-foreground',      text: 'text-muted-foreground' },
  }
  return (
    <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
      {EDGE_CASES.map(ec => {
        const sty = severityStyle[ec.severity]
        return (
          <div key={ec.id} className={cn('border rounded-2xl p-4', sty.border, sty.bg)}>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <ec.Icon className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground leading-snug">{ec.title}</p>
                <span className={cn('text-xs font-semibold uppercase tracking-wide', sty.text)}>
                  {ec.severity} severity
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">{ec.desc}</p>
            <div className="border-l-2 border-success pl-3">
              <p className="text-xs text-success leading-relaxed">{ec.action}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Tab: Normalization ───────────────────────────────────────────────────────

function NormalizationTab() {
  return (
    <div className="flex flex-col gap-6">
      {/* Intro */}
      <div className="border border-success-border bg-success-bg rounded-2xl px-4 py-3">
        <p className="text-sm text-success leading-relaxed">
          Adapter Layer маппит PassimPay-специфичные поля (
          <code className="bg-muted px-1 rounded text-foreground">approve</code>,{' '}
          <code className="bg-muted px-1 rounded text-foreground">confirmations</code>,{' '}
          <code className="bg-muted px-1 rounded text-foreground">status</code>) в единый{' '}
          <code className="bg-muted px-1 rounded text-foreground">UnifiedStatus</code>.
          Оркестратор никогда не видит сырые данные PassimPay.
        </p>
      </div>

      {/* Mapping table */}
      <div className="border border-border rounded-2xl overflow-hidden">
        <div className="hidden tablet:grid grid-cols-4 bg-muted px-4 py-2.5 gap-4">
          {['PassimPay Event', 'approve', 'status / confirmations', '→ UnifiedStatus'].map(h => (
            <p key={h} className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{h}</p>
          ))}
        </div>
        {NORMALIZATION_MAP.map((row, i) => {
          const c = STATUS[row.unifiedStatus]
          return (
            <div
              key={i}
              className={cn(
                'grid grid-cols-1 tablet:grid-cols-4 gap-1 tablet:gap-4 px-4 py-3 border-t border-border text-sm',
                i % 2 === 1 ? 'bg-muted/30' : '',
              )}
            >
              <p className="text-foreground">{row.passimpay}</p>
              <p className={row.approve !== '--' ? 'text-warning font-semibold' : 'text-muted-foreground'}>{row.approve}</p>
              <p className="text-muted-foreground">{row.status}</p>
              <span className={cn('inline-flex w-fit text-xs font-bold px-2 py-0.5 rounded-md', c.badge)}>{row.unified}</span>
            </div>
          )
        })}
      </div>

      {/* Field mapping */}
      <div className="border border-border rounded-2xl p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">Поля для нормализации в адаптере</p>
        <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
          {NORM_FIELDS.map((f, i) => (
            <div key={i} className="flex items-start gap-2">
              <code className="text-xs bg-muted rounded px-1.5 py-0.5 text-violet-500 shrink-0">{f.passimpay}</code>
              <span className="text-xs text-muted-foreground shrink-0 mt-0.5">→</span>
              <div>
                <code className="text-xs bg-muted rounded px-1.5 py-0.5 text-success">{f.unified}</code>
                <p className="text-xs text-muted-foreground mt-0.5">{f.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Tabs config ──────────────────────────────────────────────────────────────

const TABS = [
  { key: 'deposit',       label: 'Deposit',      Icon: CreditCard      },
  { key: 'withdraw',      label: 'Withdraw',     Icon: ArrowUpFromLine },
  { key: 'edge_cases',    label: 'Edge Cases',   Icon: AlertTriangle   },
  { key: 'normalization', label: 'Normalization',Icon: Plug            },
] as const

type TabKey = typeof TABS[number]['key']

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const [tab, setTab]           = useState<TabKey>('deposit')
  const [selected, setSelected] = useState<StateDef | null>(null)

  const handleSelect = (state: StateDef) => {
    setSelected(prev => prev?.id === state.id ? null : state)
  }

  const handleTabChange = (t: TabKey) => {
    setTab(t)
    setSelected(null)
  }

  return (
    <DocLayout
      title="Transaction State Machine"
      breadcrumbLabel="Payment Infrastructure"
      breadcrumbHref="/sandbox/payment-infra"
      parentCrumb={{ label: 'Sandbox', href: '/sandbox' }}
      description="Реальные статусы PassimPay → маппинг в Unified Interface"
      tags={[
        { label: 'Phase 1',       type: 'tag'    },
        { label: 'Infrastructure',type: 'status' },
        { label: 'EN',            type: 'tag'    },
      ]}
      footnote="DEPO44 | PASSIMPAY ADAPTER | PHASE 0 | DRAFT -- ТРЕБУЕТ ВЕРИФИКАЦИИ ПО ДОКУМЕНТАЦИИ"
    >
      <DocSection num="1" title="State Diagram">

        {/* Tab switcher */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => handleTabChange(t.key)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all',
                tab === t.key
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-transparent text-muted-foreground border-border hover:text-foreground',
              )}
            >
              <t.Icon className="size-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'deposit'       && <DepositTab      selected={selected} onSelect={handleSelect} />}
        {tab === 'withdraw'      && <WithdrawTab     selected={selected} onSelect={handleSelect} />}
        {tab === 'edge_cases'    && <EdgeCasesTab />}
        {tab === 'normalization' && <NormalizationTab />}

      </DocSection>
    </DocLayout>
  )
}
