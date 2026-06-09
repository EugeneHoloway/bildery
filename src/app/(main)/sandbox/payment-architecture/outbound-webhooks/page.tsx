'use client'

import { useState } from 'react'
import {
  Send, Info, AlertTriangle, AlertCircle, CheckCircle2, XCircle,
  Clock, RefreshCw, Database, Globe, ChevronRight, Shield,
  Zap, Bell, Key, Settings, FileText, RotateCcw, List,
  ArrowUpRight, Wallet, Lock,
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

function DangerCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-destructive/30 bg-destructive-bg rounded-2xl px-4 py-3 flex items-start gap-3 mb-4">
      <AlertCircle className="size-4 shrink-0 mt-0.5 text-destructive" />
      <div className="text-sm text-foreground leading-relaxed">{children}</div>
    </div>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────

// Why outbound webhooks
const WHY_NEEDED: { icon: React.ElementType; title: I18n; desc: I18n }[] = [
  {
    icon: Zap,
    title: { en: 'Real-time operator awareness', ua: "Обізнаність оператора в реальному часі" },
    desc: {
      en: 'Operators need to know immediately when a player deposits -- to unlock game access, apply a bonus, or update player account state. Polling the platform API every few seconds at scale is wasteful and introduces latency. Push events eliminate both problems.',
      ua: 'Оператори повинні знати негайно коли гравець вносить депозит -- щоб відкрити доступ до ігор, застосувати бонус або оновити стан акаунту гравця. Polling API платформи кожні кілька секунд у масштабі марнотратний та вносить затримку. Push-події вирішують обидві проблеми.',
    },
  },
  {
    icon: Globe,
    title: { en: 'Operator-side automation', ua: 'Автоматизація на стороні оператора' },
    desc: {
      en: "Operators run their own backend logic triggered by payment events -- updating CRM records, triggering email notifications to players, adjusting loyalty points, feeding analytics pipelines. Without webhooks, operators must build polling infrastructure. With webhooks, the platform drives the event.",
      ua: "Оператори запускають власну бекенд-логіку тригеровану платіжними подіями -- оновлення CRM записів, тригер email-сповіщень гравцям, нарахування loyalty points, наповнення аналітичних пайплайнів. Без webhooks оператори мусять будувати polling інфраструктуру. З webhooks -- платформа ініціює подію.",
    },
  },
  {
    icon: Shield,
    title: { en: 'Decoupled architecture', ua: 'Розв\'язана архітектура' },
    desc: {
      en: "Operators don't need API access into the platform's internal state. The webhook payload contains everything the operator needs for that event. This limits the operator's surface area and keeps platform internals private.",
      ua: "Оператори не потребують API доступу до внутрішнього стану платформи. Payload webhook містить все що потрібно оператору для цієї події. Це обмежує поверхню взаємодії оператора та зберігає внутрішню будову платформи приватною.",
    },
  },
  {
    icon: Bell,
    title: { en: 'Compliance event trail', ua: 'Аудитний слід для compliance' },
    desc: {
      en: 'Every webhook delivery -- attempt, response code, timestamp -- is stored in webhook_deliveries. This gives regulators and operators a verifiable record of when and what the platform communicated. Critical for AML reporting disputes and chargeback evidence.',
      ua: "Кожна доставка webhook -- спроба, код відповіді, часова мітка -- зберігається в webhook_deliveries. Це дає регуляторам та операторам верифікований запис того коли і що платформа комунікувала. Критично для вирішення суперечок AML звітності та доказів chargeback.",
    },
  },
]

// Event catalog
type EventCategory = 'deposit' | 'withdrawal' | 'chargeback' | 'kyc' | 'player' | 'system'

interface WebhookEvent {
  event: string
  category: EventCategory
  trigger: I18n
  payload_highlights: I18n
  critical: boolean
}

const EVENT_CATALOG: WebhookEvent[] = [
  // Deposit
  {
    event: 'deposit.initiated',
    category: 'deposit',
    trigger: { en: 'Player submits deposit form -- PSP call not yet made', ua: "Гравець підтверджує форму депозиту -- виклик PSP ще не зроблено" },
    payload_highlights: { en: 'transaction_id, player_id, amount, currency, method, psp_id', ua: 'transaction_id, player_id, amount, currency, method, psp_id' },
    critical: false,
  },
  {
    event: 'deposit.processing',
    category: 'deposit',
    trigger: { en: 'PSP accepted the request -- awaiting confirmation (e.g. crypto awaiting blockchain)', ua: 'PSP прийняв запит -- очікуємо підтвердження (напр. крипто очікує blockchain)' },
    payload_highlights: { en: 'transaction_id, psp_reference, estimated_confirmation_time', ua: 'transaction_id, psp_reference, estimated_confirmation_time' },
    critical: false,
  },
  {
    event: 'deposit.completed',
    category: 'deposit',
    trigger: { en: 'PSP confirmed payment -- balance credited to Wallet', ua: 'PSP підтвердив платіж -- баланс зарахований у Wallet' },
    payload_highlights: { en: 'transaction_id, player_id, settlement_amount, settlement_currency, display_amount, display_currency, fx_rate, wallet_balance_after', ua: 'transaction_id, player_id, settlement_amount, settlement_currency, display_amount, display_currency, fx_rate, wallet_balance_after' },
    critical: true,
  },
  {
    event: 'deposit.failed',
    category: 'deposit',
    trigger: { en: 'PSP declined or transaction expired -- no balance change', ua: 'PSP відхилив або транзакція закінчилась -- зміни балансу немає' },
    payload_highlights: { en: 'transaction_id, player_id, failure_reason, failure_code, psp_id', ua: 'transaction_id, player_id, failure_reason, failure_code, psp_id' },
    critical: true,
  },
  {
    event: 'deposit.cascade_fallback',
    category: 'deposit',
    trigger: { en: 'First PSP failed -- Cascade Manager is retrying with next PSP', ua: 'Перший PSP відмовив -- Cascade Manager повторює спробу з наступним PSP' },
    payload_highlights: { en: 'transaction_id, failed_psp_id, next_psp_id, attempt_number', ua: 'transaction_id, failed_psp_id, next_psp_id, attempt_number' },
    critical: false,
  },
  // Withdrawal
  {
    event: 'withdrawal.requested',
    category: 'withdrawal',
    trigger: { en: 'Player submitted withdrawal request -- pending approval or auto-processing', ua: 'Гравець подав запит на виведення -- очікує схвалення або авто-обробки' },
    payload_highlights: { en: 'transaction_id, player_id, amount, currency, method, kyc_level', ua: 'transaction_id, player_id, amount, currency, method, kyc_level' },
    critical: true,
  },
  {
    event: 'withdrawal.approved',
    category: 'withdrawal',
    trigger: { en: 'Ops or auto-approval rule approved the withdrawal -- PSP call imminent', ua: 'Ops або правило авто-схвалення схвалили виведення -- виклик PSP відбудеться' },
    payload_highlights: { en: 'transaction_id, player_id, approved_by (user_id or "auto"), approved_at', ua: 'transaction_id, player_id, approved_by (user_id або "auto"), approved_at' },
    critical: true,
  },
  {
    event: 'withdrawal.rejected',
    category: 'withdrawal',
    trigger: { en: 'Ops rejected the withdrawal manually -- balance hold released back to player', ua: 'Ops відхилили виведення вручну -- блокування балансу знято, кошти повернуто гравцю' },
    payload_highlights: { en: 'transaction_id, player_id, rejection_reason, rejected_by, wallet_balance_after', ua: 'transaction_id, player_id, rejection_reason, rejected_by, wallet_balance_after' },
    critical: true,
  },
  {
    event: 'withdrawal.completed',
    category: 'withdrawal',
    trigger: { en: 'PSP confirmed funds sent to player -- balance deducted from Wallet', ua: 'PSP підтвердив відправку коштів гравцю -- баланс списаний з Wallet' },
    payload_highlights: { en: 'transaction_id, player_id, settlement_amount, psp_reference, wallet_balance_after', ua: 'transaction_id, player_id, settlement_amount, psp_reference, wallet_balance_after' },
    critical: true,
  },
  {
    event: 'withdrawal.failed',
    category: 'withdrawal',
    trigger: { en: 'PSP failed to send funds -- balance hold released back to player', ua: 'PSP не зміг відправити кошти -- блокування балансу знято, кошти повернуто' },
    payload_highlights: { en: 'transaction_id, player_id, failure_reason, failure_code, wallet_balance_after', ua: 'transaction_id, player_id, failure_reason, failure_code, wallet_balance_after' },
    critical: true,
  },
  // Chargeback
  {
    event: 'chargeback.opened',
    category: 'chargeback',
    trigger: { en: 'PSP notified platform of a new dispute on a transaction', ua: 'PSP повідомив платформу про новий диспут по транзакції' },
    payload_highlights: { en: 'chargeback_id, transaction_id, player_id, amount, reason_code, evidence_deadline', ua: 'chargeback_id, transaction_id, player_id, amount, reason_code, evidence_deadline' },
    critical: true,
  },
  {
    event: 'chargeback.won',
    category: 'chargeback',
    trigger: { en: 'Card network ruled in platform\'s favor -- disputed funds returned', ua: 'Карткова мережа винесла рішення на користь платформи -- спірні кошти повернуто' },
    payload_highlights: { en: 'chargeback_id, transaction_id, player_id, amount, resolved_at', ua: 'chargeback_id, transaction_id, player_id, amount, resolved_at' },
    critical: true,
  },
  {
    event: 'chargeback.lost',
    category: 'chargeback',
    trigger: { en: 'Card network ruled in cardholder\'s favor -- funds permanently reversed', ua: 'Карткова мережа винесла рішення на користь власника картки -- кошти остаточно повернуто' },
    payload_highlights: { en: 'chargeback_id, transaction_id, player_id, amount, resolved_at', ua: 'chargeback_id, transaction_id, player_id, amount, resolved_at' },
    critical: true,
  },
  // KYC
  {
    event: 'kyc.level_upgraded',
    category: 'kyc',
    trigger: { en: 'Player completed a verification step -- KYC level increased', ua: 'Гравець пройшов крок верифікації -- рівень KYC підвищено' },
    payload_highlights: { en: 'player_id, previous_level, new_level, verified_at, documents_submitted', ua: 'player_id, previous_level, new_level, verified_at, documents_submitted' },
    critical: false,
  },
  {
    event: 'kyc.rejected',
    category: 'kyc',
    trigger: { en: 'KYC provider rejected submitted documents', ua: 'Провайдер KYC відхилив подані документи' },
    payload_highlights: { en: 'player_id, rejection_reason, rejected_documents, can_resubmit', ua: 'player_id, rejection_reason, rejected_documents, can_resubmit' },
    critical: false,
  },
  {
    event: 'kyc.documents_expired',
    category: 'kyc',
    trigger: { en: "Player's identity documents have passed their expiry date -- re-verification required", ua: 'Документи гравця вийшли за термін дії -- потрібна повторна верифікація' },
    payload_highlights: { en: 'player_id, expired_document_type, expiry_date, grace_period_ends_at', ua: 'player_id, expired_document_type, expiry_date, grace_period_ends_at' },
    critical: false,
  },
  // Player
  {
    event: 'player.self_excluded',
    category: 'player',
    trigger: { en: 'Player activated self-exclusion -- all payment processing blocked', ua: 'Гравець активував самовиключення -- вся обробка платежів заблокована' },
    payload_highlights: { en: 'player_id, exclusion_type (temporary|permanent), exclusion_ends_at (null if permanent)', ua: 'player_id, exclusion_type (temporary|permanent), exclusion_ends_at (null якщо permanent)' },
    critical: true,
  },
  {
    event: 'player.limit_reached',
    category: 'player',
    trigger: { en: 'Player hit a configured deposit/spending limit (daily, weekly, or monthly cap)', ua: 'Гравець досяг налаштованого ліміту депозитів/витрат (денний, тижневий або місячний кеп)' },
    payload_highlights: { en: 'player_id, limit_type, limit_period, limit_amount, currency, resets_at', ua: 'player_id, limit_type, limit_period, limit_amount, currency, resets_at' },
    critical: false,
  },
  {
    event: 'player.account_blocked',
    category: 'player',
    trigger: { en: 'Platform or operator blocked player account due to suspicious activity or compliance', ua: 'Платформа або оператор заблокували акаунт гравця через підозрілу активність або compliance' },
    payload_highlights: { en: 'player_id, blocked_by, reason, block_type (temporary|permanent), unblock_at', ua: 'player_id, blocked_by, reason, block_type (temporary|permanent), unblock_at' },
    critical: true,
  },
  // System
  {
    event: 'system.psp_degraded',
    category: 'system',
    trigger: { en: 'Platform detected elevated failure rate on a PSP -- Cascade Manager now routing around it', ua: 'Платформа виявила підвищений рівень відмов на PSP -- Cascade Manager тепер обходить його' },
    payload_highlights: { en: 'psp_id, failure_rate, threshold, detected_at, expected_recovery_at', ua: 'psp_id, failure_rate, threshold, detected_at, expected_recovery_at' },
    critical: false,
  },
  {
    event: 'system.psp_recovered',
    category: 'system',
    trigger: { en: 'PSP failure rate returned to normal -- routing restored to include it', ua: 'Рівень відмов PSP повернувся до норми -- маршрутизація відновлена з його участю' },
    payload_highlights: { en: 'psp_id, recovered_at, failure_rate_now', ua: 'psp_id, recovered_at, failure_rate_now' },
    critical: false,
  },
]

const CATEGORY_META: Record<EventCategory, { label: string; color: string; bg: string }> = {
  deposit:     { label: 'Deposit',     color: 'text-brand',       bg: 'bg-brand-bg'       },
  withdrawal:  { label: 'Withdrawal',  color: 'text-violet-500',  bg: 'bg-violet-500/10'  },
  chargeback:  { label: 'Chargeback',  color: 'text-destructive', bg: 'bg-destructive/10' },
  kyc:         { label: 'KYC',         color: 'text-success',     bg: 'bg-success-bg'     },
  player:      { label: 'Player',      color: 'text-amber-500',   bg: 'bg-amber-500/10'   },
  system:      { label: 'System',      color: 'text-slate-400',   bg: 'bg-slate-500/10'   },
}

// Retry schedule
const RETRY_SCHEDULE: { attempt: number; delay: I18n; total_elapsed: I18n; action_if_fail: I18n }[] = [
  { attempt: 1, delay: { en: 'Immediate', ua: 'Негайно' },          total_elapsed: { en: '0s',    ua: '0с'    }, action_if_fail: { en: 'Schedule attempt 2', ua: 'Запланувати спробу 2' } },
  { attempt: 2, delay: { en: '30 seconds', ua: '30 секунд' },       total_elapsed: { en: '30s',   ua: '30с'   }, action_if_fail: { en: 'Schedule attempt 3', ua: 'Запланувати спробу 3' } },
  { attempt: 3, delay: { en: '5 minutes', ua: '5 хвилин' },         total_elapsed: { en: '5m 30s',ua: '5хв 30с'}, action_if_fail: { en: 'Schedule attempt 4', ua: 'Запланувати спробу 4' } },
  { attempt: 4, delay: { en: '30 minutes', ua: '30 хвилин' },       total_elapsed: { en: '35m',   ua: '35хв'  }, action_if_fail: { en: 'Schedule attempt 5', ua: 'Запланувати спробу 5' } },
  { attempt: 5, delay: { en: '2 hours', ua: '2 години' },           total_elapsed: { en: '2h 35m',ua: '2г 35хв'}, action_if_fail: { en: 'Schedule attempt 6', ua: 'Запланувати спробу 6' } },
  { attempt: 6, delay: { en: '6 hours', ua: '6 годин' },            total_elapsed: { en: '8h 35m',ua: '8г 35хв'}, action_if_fail: { en: 'Move to dead letter queue', ua: 'Перемістити до dead letter queue' } },
]

// DB schema
const ENDPOINTS_COLUMNS: { col: string; type: string; desc: I18n }[] = [
  { col: 'id',                  type: 'uuid PK',     desc: { en: 'Endpoint record ID',                                                                          ua: 'ID запису ендпоінту'                                                                       } },
  { col: 'operator_id',         type: 'uuid FK',     desc: { en: 'Operator this endpoint belongs to',                                                            ua: 'Оператор якому належить цей ендпоінт'                                                      } },
  { col: 'url',                 type: 'text',        desc: { en: 'HTTPS URL to POST events to -- must be HTTPS, validated on save',                              ua: 'HTTPS URL для POST подій -- обов\'язково HTTPS, валідується при збереженні'             } },
  { col: 'signing_secret',      type: 'text',        desc: { en: 'HMAC-SHA256 secret -- generated by platform, shown once to operator, stored hashed',           ua: 'HMAC-SHA256 секрет -- генерується платформою, показується оператору один раз, зберігається хешованим' } },
  { col: 'subscribed_events',   type: 'text[]',      desc: { en: 'Array of event types this endpoint receives -- empty array means all events',                   ua: 'Масив типів подій які отримує цей ендпоінт -- порожній масив означає всі події'           } },
  { col: 'is_active',           type: 'boolean',     desc: { en: 'Inactive endpoints are skipped during delivery -- operator can disable without deleting',       ua: 'Неактивні ендпоінти пропускаються при доставці -- оператор може вимкнути без видалення'   } },
  { col: 'timeout_ms',          type: 'int',         desc: { en: 'Max ms to wait for operator response -- default 5000. If exceeded, counted as failed attempt.', ua: 'Макс. мс очікування відповіді оператора -- за замовчуванням 5000. При перевищенні -- лічиться як невдала спроба.' } },
  { col: 'created_at',          type: 'timestamptz', desc: { en: 'When the endpoint was registered',                                                              ua: 'Коли ендпоінт був зареєстрований'                                                          } },
  { col: 'last_success_at',     type: 'timestamptz', desc: { en: 'Timestamp of last successful delivery to this endpoint -- null if never succeeded',             ua: 'Час останньої успішної доставки до цього ендпоінту -- null якщо ще не було успіху'       } },
]

const DELIVERIES_COLUMNS: { col: string; type: string; desc: I18n }[] = [
  { col: 'id',              type: 'uuid PK',     desc: { en: 'Delivery attempt record ID',                                                                ua: 'ID запису спроби доставки'                                                          } },
  { col: 'endpoint_id',     type: 'uuid FK',     desc: { en: 'Which endpoint this delivery was sent to',                                                  ua: 'До якого ендпоінту відправлялась ця доставка'                                       } },
  { col: 'event_id',        type: 'uuid',        desc: { en: 'Unique event ID -- same across all retry attempts for the same event (idempotency key)',    ua: 'Унікальний ID події -- однаковий для всіх повторних спроб однієї події (ключ ідемпотентності)' } },
  { col: 'event_type',      type: 'text',        desc: { en: 'Event type string (e.g. deposit.completed)',                                                ua: 'Рядок типу події (напр. deposit.completed)'                                         } },
  { col: 'payload',         type: 'jsonb',       desc: { en: 'Full event payload as sent -- snapshot, never mutated after creation',                      ua: 'Повний payload події як надіслано -- знімок, ніколи не змінюється після створення'   } },
  { col: 'attempt_number',  type: 'int',         desc: { en: 'Which retry attempt this row represents (1 = first attempt)',                               ua: 'Яка спроба повторення представлена цим рядком (1 = перша спроба)'                   } },
  { col: 'http_status',     type: 'int',         desc: { en: 'HTTP status code returned by operator -- null if request timed out or connection failed',   ua: 'HTTP статус-код повернутий оператором -- null якщо request timeout або connection failed' } },
  { col: 'response_body',   type: 'text',        desc: { en: 'First 1000 chars of operator response body -- for debugging failed deliveries',             ua: 'Перші 1000 символів тіла відповіді оператора -- для дебагу невдалих доставок'     } },
  { col: 'duration_ms',     type: 'int',         desc: { en: 'Time from request sent to response received (or timeout)',                                  ua: 'Час від відправки запиту до отримання відповіді (або timeout)'                      } },
  { col: 'status',          type: 'text',        desc: { en: 'PENDING | DELIVERED | FAILED | DEAD_LETTER',                                                ua: 'PENDING | DELIVERED | FAILED | DEAD_LETTER'                                         } },
  { col: 'next_attempt_at', type: 'timestamptz', desc: { en: 'Scheduled time for next retry -- null if DELIVERED or DEAD_LETTER',                         ua: 'Запланований час наступної спроби -- null якщо DELIVERED або DEAD_LETTER'           } },
  { col: 'created_at',      type: 'timestamptz', desc: { en: 'When this delivery attempt was created',                                                    ua: 'Коли цей запис спроби доставки був створений'                                       } },
]

// Payload structure
const PAYLOAD_FIELDS: { field: string; type: string; desc: I18n }[] = [
  { field: 'id',           type: 'string (uuid)', desc: { en: 'Unique event ID -- operator must use this as idempotency key', ua: 'Унікальний ID події -- оператор повинен використовувати як ключ ідемпотентності' } },
  { field: 'type',         type: 'string',        desc: { en: 'Event type (e.g. "deposit.completed")',                        ua: 'Тип події (напр. "deposit.completed")'                                           } },
  { field: 'operator_id',  type: 'string (uuid)', desc: { en: 'Operator this event belongs to',                               ua: 'Оператор якому належить ця подія'                                                } },
  { field: 'brand_id',     type: 'string (uuid)', desc: { en: 'Brand (casino site) within the operator',                     ua: 'Бренд (сайт казино) в рамках оператора'                                          } },
  { field: 'created_at',   type: 'string (ISO8601)',desc: { en: 'UTC timestamp when the event was created on the platform',   ua: 'UTC часова мітка коли подія була створена на платформі'                          } },
  { field: 'api_version',  type: 'string',        desc: { en: 'Webhook API version -- allows operators to handle schema changes gracefully', ua: 'Версія Webhook API -- дозволяє операторам обробляти зміни схеми плавно' } },
  { field: 'data',         type: 'object',        desc: { en: 'Event-specific payload -- schema varies by event type (see catalog)', ua: 'Payload специфічний для події -- схема відрізняється залежно від типу події (дивіться каталог)' } },
]

// ─── Component ─────────────────────────────────────────────────────────────────

export default function OutboundWebhooksPage() {
  const [lang, setLang] = useState<Lang>('en')
  const [activeCategory, setActiveCategory] = useState<EventCategory | 'all'>('all')
  const ua = lang === 'ua'

  const categories: { key: EventCategory | 'all'; label: string }[] = [
    { key: 'all',        label: ua ? 'Всі' : 'All'        },
    { key: 'deposit',    label: ua ? 'Депозит' : 'Deposit'    },
    { key: 'withdrawal', label: ua ? 'Виведення' : 'Withdrawal' },
    { key: 'chargeback', label: 'Chargeback' },
    { key: 'kyc',        label: 'KYC'        },
    { key: 'player',     label: ua ? 'Гравець' : 'Player'  },
    { key: 'system',     label: ua ? 'Система' : 'System'  },
  ]

  const filteredEvents = activeCategory === 'all'
    ? EVENT_CATALOG
    : EVENT_CATALOG.filter(e => e.category === activeCategory)

  return (
    <DocLayout
      title="Outbound Webhooks"
      breadcrumbLabel="Payment module"
      breadcrumbHref="/sandbox/payment-architecture"
      parentCrumb={{ label: 'Sandbox', href: '/sandbox' }}
      description={ua
        ? 'Push-сповіщення від платформи до операторів -- платіжні події, retry-логіка, підпис та гарантії доставки'
        : 'Platform-to-operator push notifications -- payment events, retry logic, signing, and delivery guarantees'}
      tags={[
        { label: 'Next',  type: 'tag'    },
        { label: 'Spec',  type: 'status' },
      ]}
      titleExtra={<LangSwitcher lang={lang} onChange={setLang} />}
    >

      {/* ── When is this needed ──────────────────────────────────────────── */}
      <div className="mb-8 border border-border rounded-2xl p-5 flex flex-col gap-4">
        <p className="text-sm font-semibold text-foreground">
          {ua ? 'Коли це потрібно?' : 'When is this needed?'}
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {ua
            ? 'Це потрібно тільки якщо оператор має власний бекенд, який повинен реагувати на платіжні події незалежно від платформи. Наприклад: у оператора своя CRM, своя система бонусів, свій game server.'
            : 'This is only needed if the operator has their own backend that must react to payment events independently of the platform. For example: the operator has their own CRM, their own bonus system, their own game server.'}
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {ua
            ? 'Якщо платформа повністю управляє ігровим флоу (гра, бонуси, баланс -- все всередині платформи), тоді оператору немає сенсу отримувати ці пуші -- він і так працює через платформу.'
            : 'If the platform fully manages the game flow (game, bonuses, balance -- everything inside the platform), then there is no point for the operator to receive these pushes -- they already work through the platform.'}
        </p>
        <div className="border-t border-border pt-4 flex flex-col gap-2">
          <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
            {ua ? 'Висновок для архітектури' : 'Conclusion for this architecture'}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {ua
              ? 'Якщо оператори -- це casino operators у яких свій продукт (свої ігри, своя CRM, свій фронтенд), а платформа лише обробляє платежі -- тоді Outbound Webhooks потрібні.'
              : 'If operators are casino operators with their own product (their own games, CRM, frontend), and the platform only handles payments -- then Outbound Webhooks are needed.'}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {ua
              ? 'Якщо платформа сама є продуктом (оператори працюють всередині неї, без власного бекенду) -- тоді цей модуль або не потрібен взагалі, або можна відкласти на Phase 5-6 коли з\'явиться реальний запит від конкретного оператора.'
              : "If the platform itself is the product (operators work inside it, without their own backend) -- then this module is either not needed at all, or can be deferred to Phase 5-6 when there is a real request from a specific operator."}
          </p>
        </div>
      </div>

      {/* ── Section 1: Why it matters ─────────────────────────────────────── */}
      <DocSection num="1" title={ua ? 'Навіщо потрібно' : 'Why It Is Needed'}>
        <InfoCard>
          {ua
            ? <>Outbound Webhooks -- це event bus платформи назовні. Кожен оператор реєструє один або кілька HTTPS ендпоінтів і підписується на потрібні типи подій. Платформа push-надсилає підписані JSON-payload при кожній значущій платіжній події. Оператор відповідає <code className="text-xs bg-muted rounded px-1.5 py-0.5">2xx</code> для підтвердження отримання -- якщо ні, платформа повторює за розкладом exponential backoff.</>
            : <>Outbound Webhooks are the platform's outward-facing event bus. Each operator registers one or more HTTPS endpoints and subscribes to the event types they need. The platform push-delivers signed JSON payloads on every significant payment event. The operator responds with <code className="text-xs bg-muted rounded px-1.5 py-0.5">2xx</code> to acknowledge receipt -- if not, the platform retries on an exponential backoff schedule.</>}
        </InfoCard>
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
          {WHY_NEEDED.map((item, i) => (
            <div key={i} className="border border-border rounded-2xl p-4">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <item.icon className="size-3.5" />
                </div>
                <p className="text-sm font-semibold text-foreground">{item.title[lang]}</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc[lang]}</p>
            </div>
          ))}
        </div>
      </DocSection>

      {/* ── Section 2: Event catalog ──────────────────────────────────────── */}
      <div className="mt-8">
        <DocSection num="2" title={ua ? 'Каталог подій' : 'Event Catalog'}>
          <InfoCard>
            {ua
              ? <>Кожна подія несе <strong>унікальний event_id</strong> (UUID). Оператори повинні зберігати оброблені event_id та повертати <code className="text-xs bg-muted rounded px-1.5 py-0.5">2xx</code> на повторні доставки тієї самої події без повторної обробки. Позначені <Badge className="text-xs bg-destructive/10 text-destructive ml-0.5">Critical</Badge> події вимагають надійної ідемпотентної обробки на стороні оператора.</>
              : <>Every event carries a <strong>unique event_id</strong> (UUID). Operators must store processed event_ids and return <code className="text-xs bg-muted rounded px-1.5 py-0.5">2xx</code> on re-delivery of the same event without reprocessing. Events marked <Badge className="text-xs bg-destructive/10 text-destructive ml-0.5">Critical</Badge> require reliable idempotent handling on the operator side.</>}
          </InfoCard>

          {/* Category filter */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {categories.map(c => (
              <button
                key={c.key}
                onClick={() => setActiveCategory(c.key)}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-semibold transition-colors border',
                  activeCategory === c.key
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-muted text-muted-foreground border-border hover:text-foreground',
                )}
              >{c.label}</button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {filteredEvents.map((ev) => {
              const meta = CATEGORY_META[ev.category]
              return (
                <div key={ev.event} className="border border-border rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-sm font-mono font-semibold text-foreground">{ev.event}</code>
                      <Badge className={cn('text-xs', meta.bg, meta.color)}>{meta.label}</Badge>
                      {ev.critical && <Badge className="text-xs bg-destructive/10 text-destructive">Critical</Badge>}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{ev.trigger[lang]}</p>
                  <div className="flex items-start gap-1.5 rounded-xl bg-muted px-3 py-2">
                    <ChevronRight className="size-3.5 shrink-0 mt-0.5 text-muted-foreground/50" />
                    <p className="text-xs font-mono text-muted-foreground leading-relaxed">
                      <span className="text-muted-foreground/70">{ua ? 'data: ' : 'data: '}</span>
                      {ev.payload_highlights[lang]}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </DocSection>
      </div>

      {/* ── Section 3: Payload structure ──────────────────────────────────── */}
      <div className="mt-8">
        <DocSection num="3" title={ua ? 'Структура payload' : 'Payload Structure'}>
          <InfoCard>
            {ua
              ? <>Всі події мають однаковий верхній рівень envelope. Поле <code className="text-xs bg-muted rounded px-1.5 py-0.5">data</code> містить payload специфічний для типу події. Така структура дозволяє операторам парсити envelope один раз і диспетчеризувати по <code className="text-xs bg-muted rounded px-1.5 py-0.5">type</code>.</>
              : <>All events share the same top-level envelope. The <code className="text-xs bg-muted rounded px-1.5 py-0.5">data</code> field contains the event-specific payload. This structure lets operators parse the envelope once and dispatch on <code className="text-xs bg-muted rounded px-1.5 py-0.5">type</code>.</>}
          </InfoCard>
          <DocTable>
            <DocTableHeader>
              <TableRow>
                <TableHead>{ua ? 'Поле' : 'Field'}</TableHead>
                <TableHead>{ua ? 'Тип' : 'Type'}</TableHead>
                <TableHead>{ua ? 'Опис' : 'Description'}</TableHead>
              </TableRow>
            </DocTableHeader>
            <TableBody>
              {PAYLOAD_FIELDS.map((f) => (
                <TableRow key={f.field}>
                  <TableCell><code className="text-xs font-mono text-foreground">{f.field}</code></TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs font-mono">{f.type}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{f.desc[lang]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DocTable>

          {/* Example payload */}
          <p className="text-sm font-semibold text-foreground mt-6 mb-3">
            {ua ? 'Приклад -- deposit.completed' : 'Example -- deposit.completed'}
          </p>
          <div className="rounded-2xl bg-muted px-4 py-3 overflow-x-auto">
            <pre className="text-xs font-mono text-foreground leading-relaxed">{`{
  "id": "evt_01HZ9K3XMVQ7J8N4P2R6T5W0YB",
  "type": "deposit.completed",
  "operator_id": "op_7f3a2c1b-...",
  "brand_id": "brand_a9e4f2d1-...",
  "created_at": "2025-06-05T14:32:17.841Z",
  "api_version": "2025-06-01",
  "data": {
    "transaction_id": "txn_4b8e1f92-...",
    "player_id": "player_c3d7a2e0-...",
    "settlement_amount": 99.60,
    "settlement_currency": "USD",
    "display_amount": 500.00,
    "display_currency": "BRL",
    "fx_rate": 5.020080,
    "method": "card",
    "psp_id": "psp_passimpay",
    "psp_reference": "pp_TXN_8827461",
    "wallet_balance_after": 199.60,
    "completed_at": "2025-06-05T14:32:15.002Z"
  }
}`}</pre>
          </div>
        </DocSection>
      </div>

      {/* ── Section 4: Signing & security ─────────────────────────────────── */}
      <div className="mt-8">
        <DocSection num="4" title={ua ? 'Підписання та безпека' : 'Signing & Security'}>
          <WarnCard>
            {ua
              ? <>Оператор <strong>зобов\'язаний</strong> верифікувати підпис на кожному вхідному webhook перед обробкою payload. Ігнорування верифікації підпису дозволяє будь-кому надсилати фейкові події на ендпоінт оператора.</>
              : <>The operator <strong>must</strong> verify the signature on every incoming webhook before processing the payload. Skipping signature verification allows anyone to send fake events to the operator's endpoint.</>}
          </WarnCard>
          <div className="flex flex-col gap-3">
            {[
              {
                icon: Key,
                title: { en: 'Signing algorithm', ua: 'Алгоритм підписання' },
                desc: { en: 'HMAC-SHA256. The platform computes: HMAC-SHA256(signing_secret, timestamp + "." + raw_body) and sends the result in the X-Signature header. The operator must read raw_body (unparsed bytes) before any JSON parsing.', ua: 'HMAC-SHA256. Платформа обчислює: HMAC-SHA256(signing_secret, timestamp + "." + raw_body) та надсилає результат у заголовку X-Signature. Оператор повинен читати raw_body (непарсовані байти) до будь-якого JSON парсингу.' },
              },
              {
                icon: Clock,
                title: { en: 'Timestamp header', ua: 'Заголовок timestamp' },
                desc: { en: 'Every request includes X-Timestamp (Unix seconds). Operator should reject events where abs(now - timestamp) > 300s (5 minutes). This prevents replay attacks -- an attacker replaying a valid captured webhook after 5 minutes will have the request rejected.', ua: "Кожен запит включає X-Timestamp (Unix секунди). Оператор повинен відхиляти події де abs(now - timestamp) > 300с (5 хвилин). Це запобігає replay attacks -- зловмисник що відтворює захоплений валідний webhook через 5 хвилин отримає відмову." },
              },
              {
                icon: Lock,
                title: { en: 'Secret rotation', ua: 'Ротація секрету' },
                desc: { en: 'Operators can rotate the signing secret from Admin Panel. During rotation, the platform accepts both old and new secrets for a 10-minute overlap window to allow zero-downtime rotation. After 10 minutes, only the new secret is valid.', ua: 'Оператори можуть ротувати signing secret з Admin Panel. Під час ротації платформа приймає як старий так і новий секрет протягом 10-хвилинного вікна перекриття для забезпечення zero-downtime ротації. Після 10 хвилин дійсний тільки новий секрет.' },
              },
              {
                icon: Shield,
                title: { en: 'HTTPS requirement', ua: 'Вимога HTTPS' },
                desc: { en: "Operator endpoints must be HTTPS. The platform validates the SSL certificate and rejects self-signed certificates. HTTP endpoints are rejected at registration time -- they cannot be saved in webhook_endpoints.", ua: 'Ендпоінти операторів мають бути HTTPS. Платформа валідує SSL сертифікат та відхиляє самопідписані сертифікати. HTTP ендпоінти відхиляються при реєстрації -- їх не можна зберегти у webhook_endpoints.' },
              },
            ].map((item, i) => (
              <div key={i} className="border border-border rounded-2xl p-4 flex items-start gap-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground mt-0.5">
                  <item.icon className="size-3.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">{item.title[lang]}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc[lang]}</p>
                </div>
              </div>
            ))}
          </div>
        </DocSection>
      </div>

      {/* ── Section 5: Retry logic ────────────────────────────────────────── */}
      <div className="mt-8">
        <DocSection num="5" title={ua ? 'Retry-логіка та гарантії доставки' : 'Retry Logic & Delivery Guarantees'}>
          <InfoCard>
            {ua
              ? <>Гарантія доставки -- <strong>at-least-once</strong>. Оператор може отримати одну і ту саму подію більше ніж один раз (наприклад якщо відповідь <code className="text-xs bg-muted rounded px-1.5 py-0.5">2xx</code> оператора досягла платформи після timeout). Ідемпотентна обробка за <code className="text-xs bg-muted rounded px-1.5 py-0.5">event_id</code> є обов\'язковою на стороні оператора.</>
              : <>Delivery guarantee is <strong>at-least-once</strong>. The operator may receive the same event more than once (e.g. if the operator's <code className="text-xs bg-muted rounded px-1.5 py-0.5">2xx</code> response reached the platform after a timeout). Idempotent processing on <code className="text-xs bg-muted rounded px-1.5 py-0.5">event_id</code> is mandatory on the operator side.</>}
          </InfoCard>
          <DocTable>
            <DocTableHeader>
              <TableRow>
                <TableHead>{ua ? 'Спроба' : 'Attempt'}</TableHead>
                <TableHead>{ua ? 'Затримка' : 'Delay'}</TableHead>
                <TableHead>{ua ? 'Час від початку' : 'Elapsed'}</TableHead>
                <TableHead>{ua ? 'Якщо невдача' : 'If failed'}</TableHead>
              </TableRow>
            </DocTableHeader>
            <TableBody>
              {RETRY_SCHEDULE.map((r) => (
                <TableRow key={r.attempt}>
                  <TableCell>
                    <span className={cn(
                      'text-sm font-semibold tabular-nums',
                      r.attempt === 6 ? 'text-destructive' : 'text-foreground',
                    )}>{r.attempt}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.delay[lang]}</TableCell>
                  <TableCell className="text-sm font-mono text-muted-foreground">{r.total_elapsed[lang]}</TableCell>
                  <TableCell className={cn(
                    'text-sm',
                    r.attempt === 6 ? 'text-destructive font-medium' : 'text-muted-foreground',
                  )}>{r.action_if_fail[lang]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DocTable>

          <div className="flex flex-col gap-3 mt-4">
            {[
              {
                icon: RotateCcw,
                title: { en: 'Success condition', ua: 'Умова успіху' },
                desc: { en: 'Any 2xx response code from the operator endpoint within timeout_ms is counted as successful delivery. The response body is ignored -- only the status code matters. If the operator returns 200 but logs an internal error, the platform considers it delivered.', ua: 'Будь-який код відповіді 2xx від ендпоінту оператора в межах timeout_ms вважається успішною доставкою. Тіло відповіді ігнорується -- важливий лише статус-код. Якщо оператор повертає 200 але логує внутрішню помилку, платформа вважає доставку виконаною.' },
              },
              {
                icon: Database,
                title: { en: 'Dead letter queue', ua: 'Dead letter queue' },
                desc: { en: 'After 6 failed attempts (~8.5 hours), the delivery is moved to dead letter queue. Ops can inspect failed deliveries in Admin Panel, manually re-trigger them after the operator fixes their endpoint, or mark them as permanently abandoned.', ua: 'Після 6 невдалих спроб (~8.5 годин), доставка переміщується до dead letter queue. Ops може переглянути невдалі доставки в Admin Panel, вручну повторно запустити їх після усунення проблеми оператором, або позначити як остаточно відхилені.' },
              },
              {
                icon: Bell,
                title: { en: 'Operator alerts', ua: 'Сповіщення оператора' },
                desc: { en: 'If an endpoint fails 3 consecutive deliveries, the operator receives an email alert (to their registered admin email). If it fails all 6 attempts for any critical event, ops is also notified internally.', ua: 'Якщо ендпоінт отримує 3 невдалі доставки поспіль, оператор отримує email сповіщення (на зареєстрований admin email). Якщо всі 6 спроб для будь-якої critical події невдалі, ops також сповіщається внутрішньо.' },
              },
            ].map((item, i) => (
              <div key={i} className="border border-border rounded-2xl p-4 flex items-start gap-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground mt-0.5">
                  <item.icon className="size-3.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">{item.title[lang]}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc[lang]}</p>
                </div>
              </div>
            ))}
          </div>
        </DocSection>
      </div>

      {/* ── Section 6: Data model ──────────────────────────────────────────── */}
      <div className="mt-8">
        <DocSection num="6" title={ua ? 'Модель даних' : 'Data Model'}>
          <p className="text-sm font-semibold text-foreground mb-3">
            {ua ? 'Таблиця webhook_endpoints -- ендпоінти операторів' : 'Table webhook_endpoints -- operator endpoints'}
          </p>
          <DocTable>
            <DocTableHeader>
              <TableRow>
                <TableHead>{ua ? 'Колонка' : 'Column'}</TableHead>
                <TableHead>{ua ? 'Тип' : 'Type'}</TableHead>
                <TableHead>{ua ? 'Опис' : 'Description'}</TableHead>
              </TableRow>
            </DocTableHeader>
            <TableBody>
              {ENDPOINTS_COLUMNS.map((col) => (
                <TableRow key={col.col}>
                  <TableCell><code className="text-xs font-mono text-foreground">{col.col}</code></TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs font-mono">{col.type}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{col.desc[lang]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DocTable>

          <p className="text-sm font-semibold text-foreground mt-6 mb-3">
            {ua ? 'Таблиця webhook_deliveries -- журнал доставок' : 'Table webhook_deliveries -- delivery log'}
          </p>
          <InfoCard>
            {ua
              ? <>Кожна спроба доставки -- це окремий рядок. Для однієї події з 3 спробами буде 3 рядки з однаковим <code className="text-xs bg-muted rounded px-1.5 py-0.5">event_id</code> та зростаючим <code className="text-xs bg-muted rounded px-1.5 py-0.5">attempt_number</code>. Таблиця лише для запису -- рядки ніколи не оновлюються після створення.</>
              : <>Each delivery attempt is a separate row. One event with 3 attempts produces 3 rows with the same <code className="text-xs bg-muted rounded px-1.5 py-0.5">event_id</code> and increasing <code className="text-xs bg-muted rounded px-1.5 py-0.5">attempt_number</code>. The table is append-only -- rows are never updated after creation.</>}
          </InfoCard>
          <DocTable>
            <DocTableHeader>
              <TableRow>
                <TableHead>{ua ? 'Колонка' : 'Column'}</TableHead>
                <TableHead>{ua ? 'Тип' : 'Type'}</TableHead>
                <TableHead>{ua ? 'Опис' : 'Description'}</TableHead>
              </TableRow>
            </DocTableHeader>
            <TableBody>
              {DELIVERIES_COLUMNS.map((col) => (
                <TableRow key={col.col}>
                  <TableCell><code className="text-xs font-mono text-foreground">{col.col}</code></TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs font-mono">{col.type}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{col.desc[lang]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DocTable>
        </DocSection>
      </div>

      {/* ── Section 7: Admin Panel config ─────────────────────────────────── */}
      <div className="mt-8">
        <DocSection num="7" title={ua ? 'Налаштування в Admin Panel' : 'Admin Panel Configuration'}>
          <DangerCard>
            {ua
              ? <>Signing secret показується оператору <strong>лише один раз</strong> при реєстрації ендпоінту. Платформа зберігає тільки хеш. Якщо оператор втрачає секрет -- він повинен ротувати його через Admin Panel. Обов\'язково попередити оператора про це в UI при показі секрету.</>
              : <>The signing secret is shown to the operator <strong>only once</strong> at endpoint registration. The platform stores only the hash. If the operator loses the secret -- they must rotate it via Admin Panel. Always warn the operator about this in the UI when displaying the secret.</>}
          </DangerCard>
          <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
            {[
              {
                icon: Globe,
                title: { en: 'Register endpoint', ua: 'Реєстрація ендпоінту' },
                desc: { en: 'Operator enters their HTTPS URL in Admin Panel. Platform validates URL format and performs a test ping (POST with test event type "webhook.test"). If the endpoint returns 2xx within 5s, registration succeeds. Signing secret is generated and shown once.', ua: 'Оператор вводить свій HTTPS URL в Admin Panel. Платформа валідує формат URL та виконує тестовий ping (POST з тестовим типом події "webhook.test"). Якщо ендпоінт повертає 2xx протягом 5с, реєстрація успішна. Signing secret генерується та показується один раз.' },
              },
              {
                icon: List,
                title: { en: 'Event subscription', ua: 'Підписка на події' },
                desc: { en: 'Operator selects which event types to receive via checkbox list in Admin Panel -- or selects "All events". Subscription can be changed at any time without re-registering the endpoint. Changes take effect for events generated after the save.', ua: 'Оператор вибирає типи подій для отримання через список чекбоксів в Admin Panel -- або вибирає "Всі події". Підписку можна змінити будь-коли без повторної реєстрації ендпоінту. Зміни набирають чинності для подій згенерованих після збереження.' },
              },
              {
                icon: Settings,
                title: { en: 'Multiple endpoints', ua: 'Кілька ендпоінтів' },
                desc: { en: 'One operator can register multiple endpoints -- e.g. one for payment events (high-priority, own server) and one for analytics events (lower priority, data warehouse). Each endpoint has its own subscription list, secret, and delivery log.', ua: 'Один оператор може зареєструвати кілька ендпоінтів -- напр. один для платіжних подій (high-priority, власний сервер) і один для аналітичних подій (нижчий пріоритет, data warehouse). Кожен ендпоінт має власний список підписок, секрет та журнал доставок.' },
              },
              {
                icon: FileText,
                title: { en: 'Delivery log in Admin Panel', ua: 'Журнал доставок в Admin Panel' },
                desc: { en: 'Operator can see last 30 days of delivery history per endpoint: event type, attempt number, HTTP status, response time, status (DELIVERED / FAILED / DEAD_LETTER). Failed deliveries can be manually re-triggered from the UI after fixing the endpoint.', ua: 'Оператор може бачити останні 30 днів історії доставок для кожного ендпоінту: тип події, номер спроби, HTTP статус, час відповіді, статус (DELIVERED / FAILED / DEAD_LETTER). Невдалі доставки можна вручну повторно запустити з UI після виправлення ендпоінту.' },
              },
              {
                icon: RefreshCw,
                title: { en: 'Secret rotation', ua: 'Ротація секрету' },
                desc: { en: 'Operator clicks "Rotate secret" in Admin Panel. New secret is shown once. Old secret remains valid for 10 minutes to allow zero-downtime rotation. A rotation event is logged in the audit trail.', ua: 'Оператор натискає "Rotate secret" в Admin Panel. Новий секрет показується один раз. Старий секрет залишається дійсним 10 хвилин для zero-downtime ротації. Подія ротації логується в audit trail.' },
              },
              {
                icon: ArrowUpRight,
                title: { en: 'Test event delivery', ua: 'Відправка тестової події' },
                desc: { en: 'Operator can trigger a synthetic "webhook.test" event from Admin Panel at any time to verify the endpoint is responding correctly. Test events are clearly marked in delivery logs and are never confused with real payment events.', ua: 'Оператор може тригерувати синтетичну подію "webhook.test" з Admin Panel будь-коли щоб перевірити що ендпоінт відповідає коректно. Тестові події чітко позначені в журналах доставок та ніколи не плутаються з реальними платіжними подіями.' },
              },
            ].map((item, i) => (
              <div key={i} className="border border-border rounded-2xl p-4">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <item.icon className="size-3.5" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{item.title[lang]}</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc[lang]}</p>
              </div>
            ))}
          </div>
        </DocSection>
      </div>

    </DocLayout>
  )
}
