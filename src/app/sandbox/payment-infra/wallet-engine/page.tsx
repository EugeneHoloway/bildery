'use client'

import { useState } from 'react'
import {
  Wallet, Info, AlertTriangle, CheckCircle2, XCircle,
  ArrowDownLeft, ArrowUpRight, Lock, Unlock, RefreshCw,
  Cpu, Zap, Shield, ArrowRight, ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DocLayout  } from '@/components/doc/DocLayout'
import { DocSection } from '@/components/doc/DocSection'
import { DocTable, DocTableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/doc/DocTable'
import { Badge } from '@/components/ui/badge'

// ─── Lang ─────────────────────────────────────────────────────────────────────

type Lang = 'en' | 'ua'

interface I18n { en: string; ua: string }

function LangSwitcher({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted p-0.5">
      {(['en', 'ua'] as Lang[]).map((l) => (
        <button key={l} onClick={() => onChange(l)}
          className={['px-2.5 py-1 rounded-md text-xs font-semibold transition-colors',
            lang === l ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
          ].join(' ')}
        >{l.toUpperCase()}</button>
      ))}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-border bg-card rounded-2xl px-4 py-3 flex items-start gap-3 mb-6">
      <Info className="size-4 shrink-0 mt-0.5 text-muted-foreground" />
      <div className="text-sm text-foreground leading-relaxed">{children}</div>
    </div>
  )
}

function WarnCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-warning/30 bg-warning-bg rounded-2xl px-4 py-3 flex items-start gap-3 mb-4">
      <AlertTriangle className="size-4 shrink-0 mt-0.5 text-warning" />
      <div className="text-sm text-foreground leading-relaxed">{children}</div>
    </div>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────

// Balance structure
const BALANCE_FIELDS: { field: string; colorCls: string; bgCls: string; borderCls: string; desc: I18n; formula?: I18n }[] = [
  {
    field:     'available',
    colorCls:  'text-success',
    bgCls:     'bg-success-bg',
    borderCls: 'border-success/30',
    desc: {
      en: 'Amount the player can spend right now. Used by game engine for bet validation and by withdrawal flow for balance check.',
      ua: 'Сума яку гравець може витратити прямо зараз. Використовується ігровим рушієм для валідації ставок та флоу виведення для перевірки балансу.',
    },
  },
  {
    field:     'locked',
    colorCls:  'text-amber-500',
    bgCls:     'bg-amber-500/10',
    borderCls: 'border-amber-500/30',
    desc: {
      en: 'Amount reserved for a pending withdrawal. Cannot be bet or spent. Released back to available if withdrawal fails, or deducted permanently on COMPLETED.',
      ua: 'Сума зарезервована для очікуваного виведення. Не може бути поставлена або витрачена. Повертається до available якщо виведення невдале, або остаточно списується при COMPLETED.',
    },
  },
  {
    field:     'total',
    colorCls:  'text-foreground',
    bgCls:     'bg-muted',
    borderCls: 'border-border',
    desc: {
      en: 'available + locked. What the player "owns" in total. Shown in the UI header balance.',
      ua: 'available + locked. Загальна сума яку гравець "має". Показується у хедері балансу в UI.',
    },
    formula: { en: 'total = available + locked', ua: 'total = available + locked' }, // keep as formula, it's clear
  },
]

// Core operations
interface OperationDef {
  name: string
  direction: 'credit' | 'debit' | 'lock' | 'release' | 'read'
  signature: string
  desc: I18n
  callers: I18n
  effect: I18n
  idempotent: boolean
}

const OPERATIONS: OperationDef[] = [
  {
    name:       'credit',
    direction:  'credit',
    signature:  'credit(playerId, amount, currency, txId): WalletResult',
    desc: {
      en: 'Adds funds to available balance. Called when a deposit reaches COMPLETED status.',
      ua: 'Додає кошти до available балансу. Викликається коли депозит досягає статусу COMPLETED.',
    },
    callers:   { en: 'Orchestrator (on deposit COMPLETED webhook)', ua: 'Orchestrator (при webhook COMPLETED депозиту)' },
    effect:    { en: 'available balance + amount credited', ua: 'available баланс + сума зарахування' },
    idempotent: true,
  },
  {
    name:       'debit',
    direction:  'debit',
    signature:  'debit(playerId, amount, currency, reason, txId): WalletResult',
    desc: {
      en: 'Subtracts from available balance. Used for game bets and fee deductions. Fails atomically if available < amount.',
      ua: 'Списує з available балансу. Використовується для ставок у грі та списання комісій. Атомарно відмовляє якщо available < amount.',
    },
    callers:   { en: 'Game engine (bet placement), fee service', ua: 'Ігровий рушій (розміщення ставки), fee service' },
    effect:    { en: 'available balance - amount debited (rejected if balance insufficient)', ua: 'available баланс - сума списання (відмова якщо балансу недостатньо)' },
    idempotent: true,
  },
  {
    name:       'hold',
    direction:  'lock',
    signature:  'hold(playerId, amount, currency, withdrawalTxId): WalletResult',
    desc: {
      en: 'Moves amount from available to locked. Called at the start of a withdrawal flow before PSP is contacted.',
      ua: 'Переміщує суму з available до locked. Викликається на початку флоу виведення до звернення до PSP.',
    },
    callers:   { en: 'Withdrawal flow (Phase 3), before Orchestrator call', ua: 'Флоу виведення (Фаза 3), до виклику Orchestrator' },
    effect:    { en: 'available balance - amount, locked balance + amount', ua: 'available баланс - сума, locked баланс + сума' },
    idempotent: true,
  },
  {
    name:       'release',
    direction:  'release',
    signature:  'release(playerId, amount, currency, withdrawalTxId): WalletResult',
    desc: {
      en: 'Moves amount back from locked to available. Called when a withdrawal fails or is cancelled.',
      ua: 'Повертає суму з locked назад до available. Викликається коли виведення невдале або скасоване.',
    },
    callers:   { en: 'Withdrawal flow on FAILED / CANCELLED status', ua: 'Флоу виведення при статусі FAILED / CANCELLED' },
    effect:    { en: 'locked balance - amount, available balance + amount returned', ua: 'locked баланс - сума, available баланс + сума повернута' },
    idempotent: true,
  },
  {
    name:       'finalizeWithdrawal',
    direction:  'debit',
    signature:  'finalizeWithdrawal(playerId, amount, currency, withdrawalTxId): WalletResult',
    desc: {
      en: 'Permanently removes locked funds when withdrawal reaches COMPLETED. The funds leave the platform.',
      ua: 'Остаточно видаляє locked кошти коли виведення досягає COMPLETED. Кошти покидають платформу.',
    },
    callers:   { en: 'Withdrawal flow on COMPLETED status', ua: 'Флоу виведення при статусі COMPLETED' },
    effect:    { en: 'locked balance - amount withdrawn (total balance decreases)', ua: 'locked баланс - сума виведення (загальний баланс зменшується)' },
    idempotent: true,
  },
  {
    name:       'getBalance',
    direction:  'read',
    signature:  'getBalance(playerId, currency): BalanceSnapshot',
    desc: {
      en: 'Returns current available, locked and total for a given currency. Read-only, no state change.',
      ua: 'Повертає поточні available, locked та total для вказаної валюти. Тільки читання, без змін стану.',
    },
    callers:   { en: 'Frontend (balance display), Router (withdrawal pre-check), game engine', ua: 'Фронтенд (відображення балансу), Router (перевірка перед виведенням), ігровий рушій' },
    effect:    { en: 'No state change', ua: 'Без змін стану' },
    idempotent: true,
  },
]

// Integration points
const INTEGRATIONS: { caller: I18n; event: I18n; operation: string; phase: string }[] = [
  { caller: { en: 'Orchestrator',   ua: 'Orchestrator'      }, event: { en: 'Deposit webhook received, status → COMPLETED',          ua: 'Отримано webhook депозиту, статус → COMPLETED'           }, operation: 'credit',              phase: '2' },
  { caller: { en: 'Game engine',    ua: 'Ігровий рушій'     }, event: { en: 'Player places a bet',                                   ua: 'Гравець робить ставку'                                   }, operation: 'debit',               phase: '2' },
  { caller: { en: 'Game engine',    ua: 'Ігровий рушій'     }, event: { en: 'Player wins -- payout from game',                       ua: 'Гравець виграє -- виплата з гри'                         }, operation: 'credit',              phase: '2' },
  { caller: { en: 'Frontend',       ua: 'Фронтенд'          }, event: { en: 'Player opens cashier / any page showing balance',       ua: 'Гравець відкриває касу / будь-яку сторінку з балансом'  }, operation: 'getBalance',          phase: '2' },
  { caller: { en: 'Withdrawal flow',ua: 'Флоу виведення'    }, event: { en: 'Withdrawal request created',                            ua: 'Створено запит на виведення'                             }, operation: 'hold',                phase: '3' },
  { caller: { en: 'Withdrawal flow',ua: 'Флоу виведення'    }, event: { en: 'Withdrawal FAILED or CANCELLED',                        ua: 'Виведення FAILED або CANCELLED'                          }, operation: 'release',             phase: '3' },
  { caller: { en: 'Withdrawal flow',ua: 'Флоу виведення'    }, event: { en: 'Withdrawal COMPLETED',                                  ua: 'Виведення COMPLETED'                                     }, operation: 'finalizeWithdrawal',  phase: '3' },
]

// Race condition scenario
const RACE_EXAMPLE: { actor: I18n; action: I18n; result: 'ok' | 'queued' | 'rejected' }[] = [
  { actor: { en: 'Game engine',          ua: 'Ігровий рушій'     }, action: { en: 'debit $50 (bet)',          ua: 'debit $50 (ставка)'          }, result: 'ok'      },
  { actor: { en: 'Deposit webhook',      ua: 'Deposit webhook'   }, action: { en: 'credit $100 (deposit)',    ua: 'credit $100 (депозит)'       }, result: 'queued'  },
  { actor: { en: 'Game engine',          ua: 'Ігровий рушій'     }, action: { en: 'debit $30 (next bet)',     ua: 'debit $30 (наступна ставка)' }, result: 'queued'  },
]

const directionStyle: Record<OperationDef['direction'], { icon: React.ElementType; colorCls: string; bgCls: string; borderCls: string; label: I18n }> = {
  credit:  { icon: ArrowDownLeft,  colorCls: 'text-success',     bgCls: 'bg-success-bg',     borderCls: 'border-success/30',     label: { en: 'Credit',  ua: 'Кредит'  } },
  debit:   { icon: ArrowUpRight,   colorCls: 'text-destructive', bgCls: 'bg-destructive-bg', borderCls: 'border-destructive/30', label: { en: 'Debit',   ua: 'Дебет'   } },
  lock:    { icon: Lock,           colorCls: 'text-amber-500',   bgCls: 'bg-amber-500/10',   borderCls: 'border-amber-500/30',   label: { en: 'Hold',    ua: 'Hold'    } },
  release: { icon: Unlock,         colorCls: 'text-sky-500',     bgCls: 'bg-sky-500/10',     borderCls: 'border-sky-500/30',     label: { en: 'Release', ua: 'Release' } },
  read:    { icon: RefreshCw,      colorCls: 'text-muted-foreground', bgCls: 'bg-muted',     borderCls: 'border-border',         label: { en: 'Read',    ua: 'Читання' } },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const [lang, setLang] = useState<Lang>('en')
  const ua = lang === 'ua'

  return (
    <DocLayout
      title="Wallet Engine"
      breadcrumbLabel="Payment Infrastructure"
      breadcrumbHref="/sandbox/payment-infra"
      parentCrumb={{ label: 'Sandbox', href: '/sandbox' }}
      description={ua
        ? 'Баланс гравця: зарахування, списання, блокування. Побудований на Microsoft Orleans (.NET).'
        : 'Player balance: credit, debit, hold. Built on Microsoft Orleans (.NET).'}
      tags={[
        { label: 'Phase 2', type: 'tag'    },
        { label: 'Spec',    type: 'status' },
        { label: '.NET / Orleans', type: 'tag' },
      ]}
      titleExtra={<LangSwitcher lang={lang} onChange={setLang} />}
      footnote="DEPO44 | WALLET ENGINE SPEC v1 | PHASE 2"
    >

      {/* ── Intro ─────────────────────────────────────────────────────────── */}
      <InfoCard>
        {ua
          ? <>Wallet Engine -- єдине місце де зберігається та змінюється баланс гравця. Жоден інший компонент не пише в баланс напряму. Весь рух коштів -- депозит, ставка, виграш, виведення -- проходить через одне місце з <strong>атомарними операціями та гарантованою послідовністю</strong>. Реалізований на <strong>.NET + Microsoft Orleans</strong>.</>
          : <>Wallet Engine is the single place where a player's balance is stored and modified. No other component writes to the balance directly. All money movement -- deposit, bet, win, withdrawal -- flows through one place with <strong>atomic operations and guaranteed ordering</strong>. Built on <strong>.NET + Microsoft Orleans</strong>.</>
        }
      </InfoCard>

      <WarnCard>
        {ua
          ? <>У Фазі 2 реалізується лише <strong>credit</strong> (депозит) та <strong>debit</strong> (ставка/гра) + <strong>getBalance</strong>. Операції hold/release/finalizeWithdrawal -- Фаза 3. Але інтерфейс проектується повністю вже зараз, щоб уникнути рефакторингу пізніше.</>
          : <>In Phase 2 only <strong>credit</strong> (deposit) and <strong>debit</strong> (bet/game) + <strong>getBalance</strong> are implemented. hold/release/finalizeWithdrawal operations are Phase 3. But the full interface is designed now to avoid refactoring later.</>
        }
      </WarnCard>

      {/* ── Section 1: Microsoft Orleans ─────────────────────────────────── */}
      <DocSection num="1" title="Microsoft Orleans">
        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
          {ua
            ? 'Orleans -- це actor-based фреймворк від Microsoft для .NET. Основна ідея: кожен гравець має свій власний "actor" (Grain) який обробляє всі операції з його балансом строго по черзі, одну за одною.'
            : 'Orleans is an actor-based framework by Microsoft for .NET. The core idea: each player has their own "actor" (Grain) that processes all balance operations strictly in sequence, one at a time.'
          }
        </p>

        <div className="grid grid-cols-1 gap-3 tablet:grid-cols-3 mb-5">
          {[
            {
              icon: Cpu,
              title: { en: 'Grain = Player wallet', ua: 'Grain = Гаманець гравця' },
              desc:  { en: 'PlayerWalletGrain is keyed by player_id. One grain instance per player, always. Orleans activates it on first call and keeps it in memory.', ua: 'PlayerWalletGrain ідентифікується за player_id. Один екземпляр grain на гравця, завжди. Orleans активує його при першому зверненні та тримає в памʼяті.' },
              colorCls: 'text-sky-500',
            },
            {
              icon: Shield,
              title: { en: 'Single-threaded per grain', ua: 'Однопотоковий на grain' },
              desc:  { en: 'Orleans guarantees that only one operation runs inside a grain at a time. Concurrent calls are queued automatically. No locks, no race conditions by design.', ua: 'Orleans гарантує що всередині grain одночасно виконується лише одна операція. Паралельні виклики автоматично ставляться в чергу. Без locks, без race conditions за дизайном.' },
              colorCls: 'text-violet-500',
            },
            {
              icon: Zap,
              title: { en: 'Persistent state', ua: 'Persistent state' },
              desc:  { en: 'Grain state (available, locked) is persisted to storage (SQL or Redis) after every write. If the server restarts, Orleans reactivates the grain and reloads state from storage.', ua: 'Стан grain (available, locked) зберігається в сховищі (SQL або Redis) після кожного запису. Якщо сервер перезапускається, Orleans реактивує grain та завантажує стан зі сховища.' },
              colorCls: 'text-amber-500',
            },
          ].map((c, i) => (
            <div key={i} className="border border-border rounded-2xl p-4 bg-card">
              <c.icon className={cn('size-4 mb-2.5', c.colorCls)} />
              <p className="text-sm font-semibold text-foreground mb-1">{c.title[lang]}</p>
              <p className="text-xs text-muted-foreground leading-snug">{c.desc[lang]}</p>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 rounded-xl bg-muted px-3 py-2.5">
          <Info className="size-3.5 shrink-0 mt-0.5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground leading-snug">
            {ua
              ? 'Для продакта та фронтенд-розробника Orleans -- деталь реалізації. Важливо знати: будь-який виклик до Wallet Engine атомарний і не може призвести до некоректного стану балансу незалежно від паралельного навантаження.'
              : 'For a product manager and frontend developer, Orleans is an implementation detail. What matters: any call to Wallet Engine is atomic and cannot result in an incorrect balance state regardless of concurrent load.'
            }
          </p>
        </div>
      </DocSection>

      {/* ── Section 2: Balance structure ──────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="2" title={ua ? 'Структура балансу' : 'Balance Structure'}>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {ua
            ? 'Баланс гравця -- це не одне число. Він складається з трьох значень, кожне зберігається окремо. Грошові суми -- завжди bigint в мінімальних одиницях валюти (центи для USD).'
            : 'A player\'s balance is not a single number. It consists of three values, each stored separately. Monetary amounts are always bigint in the smallest currency unit (cents for USD).'
          }
        </p>
        <div className="flex flex-col gap-3 mb-5">
          {BALANCE_FIELDS.map((f) => (
            <div key={f.field} className={cn('border rounded-2xl px-4 py-3.5 flex items-center gap-4', f.borderCls)}>
              <code className={cn('text-xs font-mono px-2.5 py-1 rounded-lg border shrink-0', f.colorCls, f.bgCls, f.borderCls)}>
                {f.field}
              </code>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground leading-snug">{f.desc[lang]}</p>
                {f.formula && (
                  <code className="text-xs text-muted-foreground mt-1 block">{f.formula[lang]}</code>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="border border-border rounded-2xl p-4 bg-card">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {ua ? 'Приклад: гравець вносить $100, ставить $50, виводить $30' : 'Example: player deposits $100, bets $50, withdraws $30'}
          </p>
          <DocTable>
            <DocTableHeader>
              <TableRow>
                <TableHead>{ua ? 'Подія' : 'Event'}</TableHead>
                <TableHead>{ua ? 'Операція' : 'Operation'}</TableHead>
                <TableHead className="text-right text-success">available</TableHead>
                <TableHead className="text-right text-amber-500">locked</TableHead>
                <TableHead className="text-right">total</TableHead>
              </TableRow>
            </DocTableHeader>
            <TableBody>
              {[
                { event: { en: 'Initial state',       ua: 'Початковий стан'       }, available: 0,   locked: 0,  total: 0,   op: '' },
                { event: { en: 'Deposit $100',         ua: 'Депозит $100'          }, available: 100, locked: 0,  total: 100, op: 'credit(100)' },
                { event: { en: 'Bet $50',              ua: 'Ставка $50'            }, available: 50,  locked: 0,  total: 50,  op: 'debit(50)'  },
                { event: { en: 'Withdrawal hold $30',  ua: 'Hold $30 на виведення' }, available: 20,  locked: 30, total: 50,  op: 'hold(30)'   },
                { event: { en: 'Withdrawal completed', ua: 'Виведення завершено'   }, available: 20,  locked: 0,  total: 20,  op: 'finalizeWithdrawal(30)' },
              ].map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="text-sm text-foreground">{row.event[lang]}</TableCell>
                  <TableCell><code className="text-xs font-mono text-muted-foreground">{row.op || '--'}</code></TableCell>
                  <TableCell className="text-right tabular-nums text-success">${row.available}</TableCell>
                  <TableCell className="text-right tabular-nums text-amber-500">${row.locked}</TableCell>
                  <TableCell className="text-right tabular-nums text-foreground">${row.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DocTable>
        </div>
      </DocSection>
      </div>

      {/* ── Section 3: Core operations ────────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="3" title={ua ? 'Основні операції' : 'Core Operations'}>
        <div className="flex flex-col gap-3">
          {OPERATIONS.map((op) => {
            const style = directionStyle[op.direction]
            const Icon  = style.icon
            return (
              <div key={op.name} className="border border-border rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 bg-muted border-b border-border flex-wrap gap-y-2">
                  <Icon className={cn('size-3.5 shrink-0', style.colorCls)} />
                  <code className="text-sm font-mono font-semibold text-foreground">{op.name}</code>
                  <Badge variant="outline" className={cn('text-xs pointer-events-none shrink-0', style.bgCls, style.colorCls, style.borderCls)}>
                    {style.label[lang]}
                  </Badge>
                  {op.idempotent && (
                    <Badge variant="outline" className="text-xs bg-muted text-muted-foreground border-border pointer-events-none ml-auto shrink-0">
                      Idempotent
                    </Badge>
                  )}
                </div>
                <div className="px-4 py-3 bg-card divide-y divide-border">
                  <div className="pb-3">
                    <code className="text-xs font-mono text-muted-foreground break-all block mb-2">{op.signature}</code>
                    <p className="text-sm text-muted-foreground leading-relaxed">{op.desc[lang]}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 pt-3 tablet:grid-cols-2">
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{ua ? 'Хто викликає' : 'Callers'}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{op.callers[lang]}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{ua ? 'Ефект на баланс' : 'Balance effect'}</span>
                      <code className="text-xs text-foreground mt-0.5 block">{op.effect[lang]}</code>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </DocSection>
      </div>

      {/* ── Section 4: Who calls what ─────────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="4" title={ua ? 'Інтеграційні точки' : 'Integration Points'}>
        <DocTable>
          <DocTableHeader>
            <TableRow>
              <TableHead>{ua ? 'Хто' : 'Caller'}</TableHead>
              <TableHead>{ua ? 'Подія' : 'Event'}</TableHead>
              <TableHead>{ua ? 'Операція' : 'Operation'}</TableHead>
              <TableHead>{ua ? 'Фаза' : 'Phase'}</TableHead>
            </TableRow>
          </DocTableHeader>
          <TableBody>
            {INTEGRATIONS.map((r, i) => (
              <TableRow key={i}>
                <TableCell className="text-sm font-medium text-foreground">{r.caller[lang]}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.event[lang]}</TableCell>
                <TableCell><code className="text-xs font-mono text-sky-500">{r.operation}</code></TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">Phase {r.phase}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DocTable>
      </DocSection>
      </div>

      {/* ── Section 5: Concurrency model ──────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="5" title={ua ? 'Модель конкурентності' : 'Concurrency Model'}>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {ua
            ? 'Найнебезпечніша ситуація в кошельку -- два одночасні списання. Наприклад, гравець робить ставку поки надходить webhook про підтвердження депозиту. Без захисту баланс може стати некоректним.'
            : 'The most dangerous scenario in a wallet is two simultaneous debits. For example, a player places a bet while a deposit confirmation webhook arrives. Without protection, the balance can become incorrect.'
          }
        </p>

        {/* Without Orleans */}
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 mb-5">
          <div className="border border-destructive/20 rounded-2xl p-4 bg-destructive-bg/20">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="size-3.5 text-destructive shrink-0" />
              <p className="text-xs font-bold text-destructive uppercase tracking-wide">
                {ua ? 'Без Orleans (race condition)' : 'Without Orleans (race condition)'}
              </p>
            </div>
            <div className="flex flex-col gap-1.5 text-xs font-mono text-muted-foreground">
              <span>{ua ? '// Баланс: $100' : '// Balance: $100'}</span>
              <span className="text-destructive">Thread A: read balance → $100</span>
              <span className="text-destructive">Thread B: read balance → $100</span>
              <span>Thread A: write $100 - $50 = $50</span>
              <span>Thread B: write $100 - $60 = $40</span>
              <span className="text-destructive">{ua ? '// Результат: $40 замість $-10 (помилка!)' : '// Result: $40 instead of -$10 (wrong!)'}</span>
            </div>
          </div>

          <div className="border border-success/20 rounded-2xl p-4 bg-success-bg/20">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="size-3.5 text-success shrink-0" />
              <p className="text-xs font-bold text-success uppercase tracking-wide">
                {ua ? 'З Orleans (гарантована черга)' : 'With Orleans (guaranteed queue)'}
              </p>
            </div>
            <div className="flex flex-col gap-1.5 text-xs font-mono text-muted-foreground">
              <span>{ua ? '// Баланс: $100' : '// Balance: $100'}</span>
              <span className="text-success">Grain queue: [debit $50, debit $60]</span>
              <span>Step 1: $100 - $50 = $50 ✓</span>
              <span className="text-destructive">Step 2: $50 - $60 = INSUFFICIENT ✗</span>
              <span className="text-success">{ua ? '// Результат: коректний баланс $50' : '// Result: correct balance $50'}</span>
            </div>
          </div>
        </div>

        {/* Idempotency */}
        <div className="border border-border rounded-2xl p-4 bg-card">
          <p className="text-sm font-semibold text-foreground mb-2">{ua ? 'Ідемпотентність через txId' : 'Idempotency via txId'}</p>
          <p className="text-xs text-muted-foreground leading-snug mb-3">
            {ua
              ? 'Кожна операція приймає txId (transaction UUID). Якщо та сама операція прийде двічі (наприклад, webhook доставлений повторно) -- Grain перевіряє що txId вже оброблений і повертає попередній результат без повторного списання/зарахування.'
              : 'Every operation accepts a txId (transaction UUID). If the same operation arrives twice (e.g. webhook redelivered) -- the Grain checks that txId was already processed and returns the previous result without re-debiting/re-crediting.'
            }
          </p>
          <pre className="text-xs font-mono text-muted-foreground bg-muted rounded-xl px-3 py-2.5 overflow-x-auto leading-relaxed">{`// Grain internal check
if (this.state.processedTxIds.has(txId)) {
  return this.state.processedTxIds.get(txId) // cached result
}
// ... process and store result
this.state.processedTxIds.set(txId, result)`}</pre>
        </div>
      </DocSection>
      </div>

      {/* ── Section 6: Error codes ───────────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="6" title={ua ? 'Коди помилок' : 'Error Codes'}>
        <DocTable>
          <DocTableHeader>
            <TableRow>
              <TableHead>{ua ? 'Код' : 'Code'}</TableHead>
              <TableHead>{ua ? 'Операція' : 'Operation'}</TableHead>
              <TableHead>{ua ? 'Причина' : 'Reason'}</TableHead>
              <TableHead>{ua ? 'Retry?' : 'Retry?'}</TableHead>
            </TableRow>
          </DocTableHeader>
          <TableBody>
            {[
              { code: 'INSUFFICIENT_BALANCE', ops: 'debit, hold',              reason: { en: 'available < requested amount',                               ua: 'available < запитана сума'                                }, retry: false },
              { code: 'INVALID_AMOUNT',        ops: 'credit, debit, hold',     reason: { en: 'amount <= 0 or non-integer',                                 ua: 'amount <= 0 або не ціле число'                            }, retry: false },
              { code: 'CURRENCY_MISMATCH',     ops: 'all',                     reason: { en: 'Operation currency does not match wallet currency',          ua: 'Валюта операції не відповідає валюті гаманця'             }, retry: false },
              { code: 'DUPLICATE_TX',          ops: 'all write ops',           reason: { en: 'txId already processed -- idempotency guard, not an error', ua: 'txId вже оброблено -- захист ідемпотентності, не помилка' }, retry: false },
              { code: 'HOLD_NOT_FOUND',        ops: 'release, finalize',       reason: { en: 'No active hold found for this withdrawalTxId',              ua: 'Не знайдено активний hold для цього withdrawalTxId'       }, retry: false },
              { code: 'GRAIN_UNAVAILABLE',     ops: 'all',                     reason: { en: 'Orleans silo unreachable or restarting (transient)',         ua: 'Orleans silo недоступний або перезапускається (тимчасово)' }, retry: true  },
              { code: 'PERSISTENCE_FAILED',    ops: 'all write ops',           reason: { en: 'State could not be persisted to storage after operation',    ua: 'Стан не вдалось зберегти у сховище після операції'        }, retry: true  },
            ].map((r, i) => (
              <TableRow key={i}>
                <TableCell><code className="text-xs font-mono text-foreground">{r.code}</code></TableCell>
                <TableCell><code className="text-xs font-mono text-muted-foreground">{r.ops}</code></TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.reason[lang]}</TableCell>
                <TableCell>
                  {r.retry
                    ? <span className="text-xs text-amber-500">{ua ? 'Так' : 'Yes'}</span>
                    : <span className="text-xs text-muted-foreground">{ua ? 'Ні' : 'No'}</span>
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DocTable>
      </DocSection>
      </div>

    </DocLayout>
  )
}
