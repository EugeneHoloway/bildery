'use client'

import { useState } from 'react'
import type { ElementType } from 'react'
import {
  CreditCard, ArrowUpFromLine, AlertTriangle, Plug,
  Tag, Repeat2, Link2, WifiOff, Percent, ArrowLeftRight, Lock,
  ArrowDown, X, Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DocLayout }  from '@/components/doc/DocLayout'
import { DocSection } from '@/components/doc/DocSection'
import { DocTable, DocTableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/doc/DocTable'
import { Badge } from '@/components/ui/badge'

// ─── Lang ─────────────────────────────────────────────────────────────────────

type Lang = 'en' | 'ua'

function LangSwitcher({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted p-0.5">
      {(['en', 'ua'] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={[
            'px-2.5 py-1 rounded-md text-xs font-semibold transition-colors',
            lang === l
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          ].join(' ')}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

// ─── Types ───────────────────────────────────────────────────────────────────

type StatusKey = 'neutral' | 'processing' | 'success' | 'partial' | 'failed' | 'timeout'

interface I18n { en: string; ua: string }

interface StateDef {
  id: string
  label: string
  unified: string
  status: StatusKey
  desc: I18n
  passimpay: string
  notes: I18n[]
}

interface EdgeCase {
  id: string
  Icon: ElementType
  title: I18n
  severity: 'high' | 'medium' | 'low'
  desc: I18n
  action: I18n
}

interface NormRow {
  passimpay: string
  approve: string
  status: string
  unified: string
  unifiedStatus: StatusKey
}

// ─── Status color map ─────────────────────────────────────────────────────────

const STATUS: Record<StatusKey, { dot: string; selBorder: string; selBg: string; badge: string }> = {
  neutral:    { dot: 'bg-slate-400',   selBorder: 'border-slate-400/40',   selBg: 'bg-slate-500/10',   badge: 'bg-slate-500/10 text-slate-400'   },
  processing: { dot: 'bg-warning',     selBorder: 'border-warning/40',     selBg: 'bg-warning-bg',     badge: 'bg-warning-bg text-warning'       },
  success:    { dot: 'bg-success',     selBorder: 'border-success/40',     selBg: 'bg-success-bg',     badge: 'bg-success-bg text-success'       },
  partial:    { dot: 'bg-violet-500',  selBorder: 'border-violet-500/40',  selBg: 'bg-violet-500/10',  badge: 'bg-violet-500/10 text-violet-500' },
  failed:     { dot: 'bg-destructive', selBorder: 'border-destructive/40', selBg: 'bg-destructive-bg', badge: 'bg-destructive-bg text-destructive'},
  timeout:    { dot: 'bg-orange-500',  selBorder: 'border-orange-500/40',  selBg: 'bg-orange-500/10',  badge: 'bg-orange-500/10 text-orange-500' },
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const DEPOSIT_STATES: StateDef[] = [
  {
    id: 'address_requested',
    label: 'ADDRESS_REQUESTED',
    unified: 'INITIATED',
    status: 'neutral',
    desc: {
      en: 'Our backend called /getaddress or /invoice. PassimPay returned address + paymentId.',
      ua: 'Наш бекенд викликав /getaddress або /invoice. PassimPay повернув адресу + paymentId.',
    },
    passimpay: 'GET /getaddress → { paymentId, addressTo }',
    notes: [],
  },
  {
    id: 'awaiting_payment',
    label: 'AWAITING_PAYMENT',
    unified: 'PROCESSING',
    status: 'processing',
    desc: {
      en: 'Address shown to player. Waiting for transfer. No event from PassimPay yet.',
      ua: 'Адресу показано гравцю. Чекаємо переказу. Жодної події від PassimPay ще немає.',
    },
    passimpay: '-- (no event)',
    notes: [
      { en: 'TTL / expiry timer needed on our side', ua: 'Потрібен TTL / expiry таймер на нашому боці' },
      { en: 'Invoice: expires in N minutes',         ua: 'Invoice: закінчується через N хвилин' },
    ],
  },
  {
    id: 'blockchain_pending',
    label: 'BLOCKCHAIN_PENDING',
    unified: 'PROCESSING',
    status: 'processing',
    desc: {
      en: 'For BTC/LTC/DOGE/DASH/BCH: webhook received with confirmations=1. Transaction in mempool, not yet final.',
      ua: 'Для BTC/LTC/DOGE/DASH/BCH: webhook отримано з confirmations=1. Транзакція у мемпулі, ще не фінальна.',
    },
    passimpay: 'Webhook: { type:"deposit", confirmations:1 }',
    notes: [
      { en: 'UTXO networks only',           ua: 'Тільки для UTXO-мереж' },
      { en: 'EVM/TRX/TON -- one event only', ua: 'EVM/TRX/TON -- тільки одна подія' },
    ],
  },
  {
    id: 'confirmed',
    label: 'CONFIRMED',
    unified: 'COMPLETED',
    status: 'success',
    desc: {
      en: 'Deposit finally confirmed. Credit balance to player.',
      ua: 'Депозит остаточно підтверджено. Зарахувати баланс гравцю.',
    },
    passimpay: 'Webhook: { type:"deposit", confirmations:2 } or confirmations:0 for EVM/TRX',
    notes: [
      { en: 'amountReceive -- amount after service fee', ua: 'amountReceive -- сума після комісії сервісу' },
      { en: 'This field is used for crediting balance', ua: 'Це поле використовується для зарахування на баланс' },
    ],
  },
  {
    id: 'partial_waiting',
    label: 'PARTIAL_WAITING',
    unified: 'PENDING_PARTIAL',
    status: 'partial',
    desc: {
      en: 'Invoice: payment received is less than the required amount.',
      ua: 'Invoice: надійшла оплата менша за необхідну суму.',
    },
    passimpay: 'Webhook Invoice: { status:"waiting", amount: actual }',
    notes: [
      { en: 'Invoice method only', ua: 'Тільки для методу Invoice' },
      { en: 'Two options: wait for additional payment OR credit actual amount', ua: 'Два варіанти: чекати доплати АБО зарахувати фактичну суму' },
    ],
  },
  {
    id: 'expired_error',
    label: 'EXPIRED / ERROR',
    unified: 'FAILED',
    status: 'failed',
    desc: {
      en: 'Invoice expired or partially paid and time ran out.',
      ua: 'Invoice закінчився або частково оплачений і час вийшов.',
    },
    passimpay: 'Webhook Invoice: { status:"error", amount: actual }',
    notes: [
      { en: 'amount in callback = actually received amount', ua: 'amount у callback = реально отримана сума' },
      { en: 'Partial payment → decision on our side',        ua: 'Часткова оплата → рішення на нашому боці' },
    ],
  },
  {
    id: 'no_callback',
    label: 'NO_CALLBACK',
    unified: 'TIMED_OUT',
    status: 'timeout',
    desc: {
      en: 'Our internal TTL expired -- player did not pay or webhook did not arrive.',
      ua: 'Наш внутрішній TTL закінчився -- гравець не заплатив або webhook не надійшов.',
    },
    passimpay: '-- (no event from PassimPay)',
    notes: [
      { en: 'PassimPay: callback ONLY on success',                          ua: 'PassimPay: callback ТІЛЬКИ при успіху' },
      { en: 'No callback = no payment (per documentation)',                 ua: 'Немає callback = немає оплати (за документацією)' },
      { en: 'But: reconciliation job needed in case of webhook loss',       ua: 'Але: потрібен reconciliation job на випадок втрати webhook' },
    ],
  },
]

const WITHDRAW_STATES: StateDef[] = [
  {
    id: 'w_initiated',
    label: 'W_INITIATED',
    unified: 'INITIATED',
    status: 'neutral',
    desc: {
      en: 'Player requested withdrawal. Our backend called POST /withdraw.',
      ua: 'Гравець запросив виведення. Наш бекенд викликав POST /withdraw.',
    },
    passimpay: 'POST /withdraw → { transactionId }',
    notes: [
      { en: 'Amount must be in crypto, not USD',             ua: 'Сума має бути у крипті, не в USD' },
      { en: 'USD→crypto conversion needed before request',   ua: 'Потрібна конвертація USD→крипта перед запитом' },
    ],
  },
  {
    id: 'w_wait',
    label: 'W_WAIT',
    unified: 'PROCESSING',
    status: 'processing',
    desc: {
      en: 'PassimPay accepted the request, processing. Webhook with approve=0.',
      ua: 'PassimPay прийняв запит, обробляє. Webhook з approve=0.',
    },
    passimpay: 'Webhook: { type:"withdraw", approve:0 }',
    notes: [],
  },
  {
    id: 'w_success',
    label: 'W_SUCCESS',
    unified: 'COMPLETED',
    status: 'success',
    desc: {
      en: 'Withdrawal completed. Funds sent to player\'s blockchain address.',
      ua: 'Виведення виконано. Кошти відправлено на блокчейн-адресу гравця.',
    },
    passimpay: 'Webhook: { type:"withdraw", approve:1, txhash }',
    notes: [
      { en: 'amountDebited -- final deduction from our balance', ua: 'amountDebited -- підсумкове списання з нашого балансу' },
      { en: 'txhash for blockchain verification',               ua: 'txhash для верифікації у блокчейні' },
    ],
  },
  {
    id: 'w_error',
    label: 'W_ERROR',
    unified: 'FAILED',
    status: 'failed',
    desc: {
      en: 'Withdrawal failed. Funds must be returned to player balance.',
      ua: 'Виведення не виконано. Кошти потрібно повернути на баланс гравця.',
    },
    passimpay: 'Webhook: { type:"withdraw", approve:2 }',
    notes: [
      { en: 'Mandatory balance rollback', ua: 'Обов\'язковий rollback балансу' },
      { en: 'Notify player',              ua: 'Повідомити гравця' },
      { en: 'Log for ops',                ua: 'Логувати для ops' },
    ],
  },
  {
    id: 'w_btc_pending',
    label: 'W_BLOCKCHAIN_PENDING',
    unified: 'PROCESSING',
    status: 'processing',
    desc: {
      en: 'BTC/LTC/DOGE: webhook received with confirmations=1. Transaction in network, not yet final.',
      ua: 'BTC/LTC/DOGE: webhook отримано з confirmations=1. Транзакція у мережі, ще не фінальна.',
    },
    passimpay: 'Webhook: { type:"withdraw", confirmations:1 }',
    notes: [
      { en: 'UTXO networks only',                             ua: 'Тільки UTXO-мережі' },
      { en: 'Waiting for confirmations=2 for final status',   ua: 'Чекаємо confirmations=2 для фінального статусу' },
    ],
  },
]

const EDGE_CASES: EdgeCase[] = [
  {
    id: 'tag_missing',
    Icon: Tag,
    title:  { en: 'Missing tag / memo',            ua: 'Відсутній tag / memo' },
    severity: 'high',
    desc:   { en: 'XRP, TON and similar networks require destinationTag. If the player did not specify it -- PassimPay cannot identify the payment.', ua: 'XRP, TON та подібні мережі вимагають destinationTag. Якщо гравець не вказав -- PassimPay не може ідентифікувати платіж.' },
    action: { en: 'UI must show tag + warning. Without tag -- funds are lost.',                                                                          ua: 'UI зобов\'язаний показувати tag + попередження. Без тегу -- кошти втрачено.' },
  },
  {
    id: 'duplicate_webhook',
    Icon: Repeat2,
    title:  { en: 'Duplicate webhook',             ua: 'Дублюючий webhook' },
    severity: 'high',
    desc:   { en: 'PassimPay makes up to 3 delivery attempts (2 retries). The same paymentId may arrive twice.',                                       ua: 'PassimPay робить до 3 спроб доставки webhook (2 retry). Той самий paymentId може надійти двічі.' },
    action: { en: 'Idempotency check by paymentId before any balance change.',                                                                         ua: 'Перевірка ідемпотентності по paymentId перед будь-якою зміною балансу.' },
  },
  {
    id: 'double_confirmation',
    Icon: Link2,
    title:  { en: 'Double webhook (BTC/LTC/DOGE)', ua: 'Подвійний webhook (BTC/LTC/DOGE)' },
    severity: 'medium',
    desc:   { en: 'UTXO networks send webhook twice: confirmations=1 and confirmations=2. The first is not final.',                                    ua: 'UTXO-мережі надсилають webhook двічі: confirmations=1 та confirmations=2. Перший -- не фінальний.' },
    action: { en: 'Credit balance only at confirmations=2. First webhook -- UI only (show "processing").',                                             ua: 'Зараховувати баланс тільки при confirmations=2. Перший webhook -- тільки для UI (показати "в обробці").' },
  },
  {
    id: 'webhook_lost',
    Icon: WifiOff,
    title:  { en: 'Webhook loss',                  ua: 'Втрата webhook' },
    severity: 'medium',
    desc:   { en: 'Our server did not respond 200 -- PassimPay made 2 retries and gave up. Transaction exists on blockchain, not on our side.',         ua: 'Наш сервер не відповів 200 -- PassimPay зробив 2 retry і здався. Транзакція в блокчейні є, у нас -- ні.' },
    action: { en: 'Reconciliation job: check via /transactionstatus hourly for PROCESSING transactions.',                                             ua: 'Reconciliation job: звірка через /transactionstatus раз на годину для PROCESSING транзакцій.' },
  },
  {
    id: 'partial_payment',
    Icon: Percent,
    title:  { en: 'Partial payment (Invoice)',      ua: 'Часткова оплата (Invoice)' },
    severity: 'medium',
    desc:   { en: 'Player paid less than the invoice amount. PassimPay sends status=waiting with the actual amount.',                                  ua: 'Гравець заплатив менше суми інвойсу. PassimPay надсилає status=waiting з фактичною сумою.' },
    action: { en: 'Business decision: credit actual amount OR wait for additional payment until expiry.',                                             ua: 'Бізнес-рішення: зарахувати фактичну суму АБО чекати доплати до expiry.' },
  },
  {
    id: 'amount_mismatch',
    Icon: ArrowLeftRight,
    title:  { en: 'Amount mismatch',               ua: 'Розбіжність суми' },
    severity: 'low',
    desc:   { en: 'H2H: player can pay any amount. Crypto rate changed between address request and payment.',                                          ua: 'H2H: гравець може заплатити будь-яку суму. Курс крипти змінився між запитом адреси та оплатою.' },
    action: { en: 'Credit amountReceive from webhook, not the originally requested amount.',                                                          ua: 'Зараховувати amountReceive з webhook, а не спочатку запрошену суму.' },
  },
  {
    id: 'signature_fail',
    Icon: Lock,
    title:  { en: 'Invalid webhook signature',     ua: 'Невалідний підпис webhook' },
    severity: 'high',
    desc:   { en: 'Webhook without a valid x-signature must be rejected.',                                                                            ua: 'Webhook без дійсного x-signature має бути відхилено.' },
    action: { en: 'HMAC-SHA256 verification: platform_id + body + secret. Reject 400 if mismatch.',                                                  ua: 'Верифікація HMAC-SHA256: platform_id + body + secret. Reject 400 якщо не збігається.' },
  },
]

const NORMALIZATION_MAP: NormRow[] = [
  { passimpay: 'Deposit webhook (H2H)', approve: '--', status: 'confirmations ≥ 1',                   unified: 'PROCESSING',      unifiedStatus: 'processing' },
  { passimpay: 'Deposit webhook (H2H)', approve: '--', status: 'confirmations ≥ 2 (or 0 for EVM)',    unified: 'COMPLETED',       unifiedStatus: 'success'    },
  { passimpay: 'Invoice status',        approve: '--', status: 'waiting',                             unified: 'PENDING_PARTIAL', unifiedStatus: 'partial'    },
  { passimpay: 'Invoice status',        approve: '--', status: 'error',                               unified: 'FAILED',          unifiedStatus: 'failed'     },
  { passimpay: 'Withdraw webhook',      approve: '0',  status: '--',                                  unified: 'PROCESSING',      unifiedStatus: 'processing' },
  { passimpay: 'Withdraw webhook',      approve: '1',  status: '--',                                  unified: 'COMPLETED',       unifiedStatus: 'success'    },
  { passimpay: 'Withdraw webhook',      approve: '2',  status: '--',                                  unified: 'FAILED',          unifiedStatus: 'failed'     },
  { passimpay: 'No callback + TTL expired', approve: '--', status: '--',                              unified: 'TIMED_OUT',       unifiedStatus: 'timeout'    },
]

interface NormField { passimpay: string; unified: string; note: I18n }

const NORM_FIELDS: NormField[] = [
  { passimpay: 'amount (webhook)',        unified: 'amount_crypto',    note: { en: 'Amount in crypto',                   ua: 'Сума у крипті' } },
  { passimpay: 'amountReceive',           unified: 'amount_credited',  note: { en: 'After fee -- for crediting',           ua: 'Після комісії -- для зарахування' } },
  { passimpay: 'amountDebited',           unified: 'amount_debited',   note: { en: 'For withdrawal -- final deduction',    ua: 'Для виведення -- підсумкове списання' } },
  { passimpay: 'feeService + feeNetwork', unified: 'fee_total',        note: { en: 'Sum of two fields',                  ua: 'Сума двох полів' } },
  { passimpay: 'txhash',                  unified: 'blockchain_tx_id', note: { en: 'For verification',                   ua: 'Для верифікації' } },
  { passimpay: 'paymentId (integer)',     unified: 'psp_payment_id',   note: { en: 'Store for idempotency',              ua: 'Зберігати для ідемпотентності' } },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_BADGE_CLS: Record<StatusKey, string> = {
  neutral:    'bg-muted text-muted-foreground border-border',
  processing: 'bg-warning-bg text-warning border-warning/30',
  success:    'bg-success-bg text-success border-success-border',
  partial:    'bg-violet-500/10 text-violet-500 border-violet-500/30',
  failed:     'bg-destructive-bg text-destructive border-destructive/30',
  timeout:    'bg-orange-500/10 text-orange-500 border-orange-500/30',
}

function fmtLabel(label: string) {
  return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase().replace(/_/g, ' ')
}

function fmtUnified(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase().replace(/_/g, ' ')
}

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
          ? 'bg-muted border-foreground/30 shadow-card'
          : 'bg-card border-border shadow-card hover:border-subtle-border hover:shadow-card-hover',
      )}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div className={cn('size-2 rounded-full shrink-0', s.dot)} />
        <span className="text-sm font-bold leading-snug tracking-heading text-foreground">
          {fmtLabel(state.label)}
        </span>
      </div>
      <span className="inline-flex text-xs px-2 py-0.5 rounded-md border border-border bg-muted text-foreground">
        → {fmtUnified(state.unified)}
      </span>
    </div>
  )
}

function FlowArrow({ label, hideArrow = false }: { label?: string; hideArrow?: boolean }) {
  return (
    <div className="flex items-start gap-2 py-1 pl-3">
      <div className="flex flex-col items-center shrink-0 mt-0.5">
        {hideArrow
          ? <div className="w-3 h-6" />
          : <>
              <div className="w-px h-3 bg-border" />
              <ArrowDown className="size-3 text-foreground" />
            </>
        }
      </div>
      {label && <span className="text-xs leading-snug text-foreground">{label}</span>}
    </div>
  )
}

function DetailPanel({ state, lang, onClose }: { state: StateDef; lang: Lang; onClose: () => void }) {
  return (
    <div className="border border-border bg-card shadow-card rounded-2xl p-4 flex-1">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-sm font-bold leading-snug tracking-heading text-foreground">
            {fmtLabel(state.label)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Unified: <span className="text-foreground font-medium">{fmtUnified(state.unified)}</span>
          </p>
        </div>
        <button onClick={onClose} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
          <X className="size-4" />
        </button>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{state.desc[lang]}</p>

      <div className="mb-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          {lang === 'ua' ? 'Подія PassimPay' : 'PassimPay Event'}
        </p>
        <div className="rounded-xl bg-muted border border-border px-3 py-2">
          <span className="text-xs text-foreground leading-relaxed">{state.passimpay}</span>
        </div>
      </div>

      {state.notes.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {lang === 'ua' ? 'Нотатки' : 'Notes'}
          </p>
          <div className="flex flex-col gap-1.5">
            {state.notes.map((n, i) => (
              <div key={i} className="flex items-start gap-2">
                <Info className="size-3 shrink-0 mt-0.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground leading-snug">{n[lang]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyPanel({ lang }: { lang: Lang }) {
  return (
    <div className="border border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-center flex-1">
      <Info className="size-5 text-muted-foreground/40" />
      <p className="text-xs text-muted-foreground">
        {lang === 'ua'
          ? 'Натисни на будь-який статус\nдля деталей'
          : 'Click any state\nfor details'}
      </p>
    </div>
  )
}

// ─── Tab: Deposit ─────────────────────────────────────────────────────────────

function DepositTab({ selected, lang, onSelect }: {
  selected: StateDef | null
  lang: Lang
  onSelect: (s: StateDef) => void
}) {
  const byId = (id: string) => DEPOSIT_STATES.find(s => s.id === id)!
  const ua = lang === 'ua'
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col tablet:flex-row gap-6 items-stretch">
        {/* Main diagram */}
        <div className="flex-1 flex flex-col tablet:flex-row gap-6 items-stretch">

          {/* Happy path */}
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 text-center">
              {ua ? 'Основний шлях' : 'Happy Path'}
            </p>
            <StateNode state={byId('address_requested')} selected={selected?.id === 'address_requested'} onClick={onSelect} />
            <FlowArrow label={ua ? 'Адресу показано гравцю' : 'Address shown to player'} />
            <StateNode state={byId('awaiting_payment')} selected={selected?.id === 'awaiting_payment'} onClick={onSelect} />
            <FlowArrow label="BTC/LTC/DOGE: confirmations=1" />
            <StateNode state={byId('blockchain_pending')} selected={selected?.id === 'blockchain_pending'} onClick={onSelect} />
            <FlowArrow label={ua ? 'confirmations=2 (або відразу для EVM/TRX)' : 'confirmations=2 (or immediately for EVM/TRX)'} />
            <StateNode state={byId('confirmed')} selected={selected?.id === 'confirmed'} onClick={onSelect} />
          </div>

          {/* Alternative paths */}
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 text-center">
              {ua ? 'Альтернативні шляхи' : 'Alternative Paths'}
            </p>
            <div>
              <StateNode state={byId('no_callback')} selected={selected?.id === 'no_callback'} onClick={onSelect} />
              <FlowArrow label="TTL expired (H2H)" hideArrow />
            </div>
            <div>
              <StateNode state={byId('partial_waiting')} selected={selected?.id === 'partial_waiting'} onClick={onSelect} />
              <FlowArrow label={ua ? 'Invoice: часткова оплата → invoice expired' : 'Invoice: partial payment → invoice expired'} hideArrow />
              <StateNode state={byId('expired_error')} selected={selected?.id === 'expired_error'} onClick={onSelect} />
            </div>
          </div>
        </div>

        {/* Additional information column */}
        <div className="flex flex-col shrink-0 w-full tablet:w-72">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 text-center">
            {ua ? 'Додаткова інформація' : 'Additional Information'}
          </p>
          {selected
            ? <DetailPanel state={selected} lang={lang} onClose={() => onSelect(selected)} />
            : <EmptyPanel lang={lang} />}
        </div>
      </div>

      {/* H2H vs Invoice info boxes */}
      <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
        <div className="bg-card border border-border shadow-card rounded-2xl p-4">
          <p className="text-sm font-bold leading-snug tracking-heading text-foreground mb-2">
            {ua ? 'H2H метод' : 'H2H method'}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {ua ? (
              <>
                Callback ТІЛЬКИ при успішному депозиті.<br />
                Немає callback = немає оплати.<br />
                Гравець платить будь-яку суму.<br />
                Використовуй <code className="text-xs bg-muted rounded px-1.5 py-0.5 font-mono">amountReceive</code> для зарахування.
              </>
            ) : (
              <>
                Callback ONLY on successful deposit.<br />
                No callback = no payment.<br />
                Player pays any amount.<br />
                Use <code className="text-xs bg-muted rounded px-1.5 py-0.5 font-mono">amountReceive</code> for crediting.
              </>
            )}
          </p>
        </div>
        <div className="bg-card border border-border shadow-card rounded-2xl p-4">
          <p className="text-sm font-bold leading-snug tracking-heading text-foreground mb-2">
            {ua ? 'Invoice метод' : 'Invoice method'}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {ua ? (
              <>
                Фіксована сума.<br />
                Статус <code className="text-xs bg-muted rounded px-1.5 py-0.5 font-mono">waiting</code> = часткова оплата.<br />
                Статус <code className="text-xs bg-muted rounded px-1.5 py-0.5 font-mono">error</code> = закінчився або partial fail.<br />
                Підтримує split оплату (USDT + BTC).
              </>
            ) : (
              <>
                Fixed amount.<br />
                Status <code className="text-xs bg-muted rounded px-1.5 py-0.5 font-mono">waiting</code> = partial payment.<br />
                Status <code className="text-xs bg-muted rounded px-1.5 py-0.5 font-mono">error</code> = expired or partial fail.<br />
                Supports split payment (USDT + BTC).
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Withdraw ────────────────────────────────────────────────────────────

function WithdrawTab({ selected, lang, onSelect }: {
  selected: StateDef | null
  lang: Lang
  onSelect: (s: StateDef) => void
}) {
  const byId = (id: string) => WITHDRAW_STATES.find(s => s.id === id)!
  const ua = lang === 'ua'
  return (
    <div className="flex flex-col tablet:flex-row gap-6 items-stretch">
      <div className="flex-1 flex flex-col tablet:flex-row gap-6 items-stretch">

        {/* Happy path */}
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 text-center">
            {ua ? 'Основний шлях' : 'Happy Path'}
          </p>
          <StateNode state={byId('w_initiated')} selected={selected?.id === 'w_initiated'} onClick={onSelect} />
          <FlowArrow label={ua ? 'PassimPay прийняв запит' : 'PassimPay accepted request'} />
          <StateNode state={byId('w_wait')} selected={selected?.id === 'w_wait'} onClick={onSelect} />
          <FlowArrow label="BTC/LTC/DOGE: confirmations=1" />
          <StateNode state={byId('w_btc_pending')} selected={selected?.id === 'w_btc_pending'} onClick={onSelect} />
          <FlowArrow label="approve=1 + txhash" />
          <StateNode state={byId('w_success')} selected={selected?.id === 'w_success'} onClick={onSelect} />
        </div>

        {/* Error path */}
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 text-center">
            {ua ? 'Шлях помилки' : 'Error Path'}
          </p>
          <div>
            <StateNode state={byId('w_error')} selected={selected?.id === 'w_error'} onClick={onSelect} />
            <p className="text-xs text-destructive mt-2 pl-1">approve=2</p>
            <div className="mt-3 border border-border bg-muted rounded-xl px-3 py-2.5">
              <div className="flex items-start gap-2">
                <Info className="size-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground leading-snug">
                  {ua ? 'Обов\'язковий rollback балансу гравця' : 'Mandatory player balance rollback'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional information column */}
      <div className="flex flex-col shrink-0 w-full tablet:w-72">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 text-center">
          {ua ? 'Додаткова інформація' : 'Additional Information'}
        </p>
        {selected
          ? <DetailPanel state={selected} lang={lang} onClose={() => onSelect(selected)} />
          : <EmptyPanel lang={lang} />}
      </div>
    </div>
  )
}

// ─── Tab: Edge Cases ──────────────────────────────────────────────────────────

function EdgeCasesTab({ lang }: { lang: Lang }) {
  const severityStyle: Record<EdgeCase['severity'], { border: string; bg: string; text: string }> = {
    high:   { border: 'border-border', bg: 'bg-card', text: 'text-destructive' },
    medium: { border: 'border-border', bg: 'bg-card', text: 'text-warning'     },
    low:    { border: 'border-border', bg: 'bg-card', text: 'text-info'        },
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
                <p className="text-sm font-semibold text-foreground leading-snug">{ec.title[lang]}</p>
                <span className={cn('text-xs font-semibold uppercase tracking-wide', sty.text)}>
                  {ec.severity} severity
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">{ec.desc[lang]}</p>
            <div className="flex items-baseline gap-2 rounded-xl bg-muted px-3 py-2.5">
              <span className="text-xs font-semibold text-foreground shrink-0">
                {lang === 'ua' ? 'Дія:' : 'Action:'}
              </span>
              <span className="text-xs text-muted-foreground leading-relaxed">{ec.action[lang]}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Tab: Normalization ───────────────────────────────────────────────────────

function NormalizationTab({ lang }: { lang: Lang }) {
  const ua = lang === 'ua'
  return (
    <div className="flex flex-col gap-6">
      {/* Intro */}
      <div className="border border-border bg-card shadow-card rounded-2xl px-4 py-3">
        <p className="text-sm text-foreground leading-relaxed">
          {ua
            ? <>Adapter Layer маппить PassimPay-специфічні поля (<code className="text-xs bg-muted rounded px-1.5 py-0.5 font-mono">approve</code>, <code className="text-xs bg-muted rounded px-1.5 py-0.5 font-mono">confirmations</code>, <code className="text-xs bg-muted rounded px-1.5 py-0.5 font-mono">status</code>) в єдиний <code className="text-xs bg-muted rounded px-1.5 py-0.5 font-mono">UnifiedStatus</code>. Оркестратор ніколи не бачить сирі дані PassimPay.</>
            : <>Adapter Layer maps PassimPay-specific fields (<code className="text-xs bg-muted rounded px-1.5 py-0.5 font-mono">approve</code>, <code className="text-xs bg-muted rounded px-1.5 py-0.5 font-mono">confirmations</code>, <code className="text-xs bg-muted rounded px-1.5 py-0.5 font-mono">status</code>) into a single <code className="text-xs bg-muted rounded px-1.5 py-0.5 font-mono">UnifiedStatus</code>. The Orchestrator never sees raw PassimPay data.</>
          }
        </p>
      </div>

      {/* Mapping table */}
      <DocTable>
        <DocTableHeader>
          <TableRow>
            <TableHead>PassimPay Event</TableHead>
            <TableHead>approve</TableHead>
            <TableHead>status / confirmations</TableHead>
            <TableHead>→ UnifiedStatus</TableHead>
          </TableRow>
        </DocTableHeader>
        <TableBody>
          {NORMALIZATION_MAP.map((row, i) => (
            <TableRow key={i}>
              <TableCell className="text-foreground">{row.passimpay}</TableCell>
              <TableCell className={row.approve !== '--' ? 'text-warning font-semibold' : 'text-muted-foreground'}>{row.approve}</TableCell>
              <TableCell className="text-muted-foreground">{row.status}</TableCell>
              <TableCell>
                <Badge variant="outline" className={cn('pointer-events-none', STATUS_BADGE_CLS[row.unifiedStatus])}>
                  {fmtUnified(row.unified)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </DocTable>

      {/* Field mapping */}
      <DocTable>
        <DocTableHeader>
          <TableRow>
            <TableHead>{ua ? 'Поле PassimPay' : 'PassimPay Field'}</TableHead>
            <TableHead>{ua ? 'Unified поле' : 'Unified Field'}</TableHead>
            <TableHead>{ua ? 'Примітка' : 'Note'}</TableHead>
          </TableRow>
        </DocTableHeader>
        <TableBody>
          {NORM_FIELDS.map((f, i) => (
            <TableRow key={i}>
              <TableCell><code className="text-xs bg-muted rounded px-1.5 py-0.5 font-mono">{f.passimpay}</code></TableCell>
              <TableCell><code className="text-xs bg-muted rounded px-1.5 py-0.5 font-mono">{f.unified}</code></TableCell>
              <TableCell className="text-muted-foreground">{f.note[lang]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </DocTable>
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
  const [lang, setLang]         = useState<Lang>('en')

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
      description={lang === 'ua'
        ? 'Реальні статуси PassimPay → маппинг в Unified Interface'
        : 'Real PassimPay statuses → mapping to Unified Interface'}
      tags={[
        { label: 'Phase 1',        type: 'tag'    },
        { label: 'Infrastructure', type: 'status' },
      ]}
      titleExtra={<LangSwitcher lang={lang} onChange={setLang} />}
      footnote="DEPO44 | PASSIMPAY ADAPTER | PHASE 0 | DRAFT -- REQUIRES VERIFICATION AGAINST DOCUMENTATION"
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
        {tab === 'deposit'       && <DepositTab      selected={selected} lang={lang} onSelect={handleSelect} />}
        {tab === 'withdraw'      && <WithdrawTab     selected={selected} lang={lang} onSelect={handleSelect} />}
        {tab === 'edge_cases'    && <EdgeCasesTab    lang={lang} />}
        {tab === 'normalization' && <NormalizationTab lang={lang} />}

      </DocSection>
    </DocLayout>
  )
}
