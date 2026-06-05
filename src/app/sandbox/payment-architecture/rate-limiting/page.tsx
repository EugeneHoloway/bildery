'use client'

import { useState } from 'react'
import {
  Shield, Clock, AlertTriangle, Info, Hash, ArrowRight, CheckCircle2, XCircle,
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface RuleRow {
  check: I18n
  window: I18n
  limit: I18n
  scope: I18n
  action: I18n
}

interface ResponseField {
  field: string
  type: string
  desc: I18n
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

const VELOCITY_RULES: RuleRow[] = [
  {
    check:  { en: 'Deposit attempts',          ua: 'Спроби депозиту'          },
    window: { en: '1 minute',                  ua: '1 хвилина'                },
    limit:  { en: '5 per user',                ua: '5 на користувача'         },
    scope:  { en: 'user_id',                   ua: 'user_id'                  },
    action: { en: 'Block for 5 min',           ua: 'Блокування на 5 хв'       },
  },
  {
    check:  { en: 'Deposit attempts',          ua: 'Спроби депозиту'          },
    window: { en: '1 hour',                    ua: '1 година'                 },
    limit:  { en: '20 per user',               ua: '20 на користувача'        },
    scope:  { en: 'user_id',                   ua: 'user_id'                  },
    action: { en: 'Block for 1 hour',          ua: 'Блокування на 1 годину'   },
  },
  {
    check:  { en: 'Withdrawal attempts',       ua: 'Спроби виведення'         },
    window: { en: '1 hour',                    ua: '1 година'                 },
    limit:  { en: '3 per user',                ua: '3 на користувача'         },
    scope:  { en: 'user_id',                   ua: 'user_id'                  },
    action: { en: 'Block for 2 hours',         ua: 'Блокування на 2 години'   },
  },
  {
    check:  { en: 'Failed payment attempts',   ua: 'Невдалі спроби оплати'    },
    window: { en: '15 minutes',                ua: '15 хвилин'                },
    limit:  { en: '3 per user',                ua: '3 на користувача'         },
    scope:  { en: 'user_id',                   ua: 'user_id'                  },
    action: { en: 'Require re-auth / captcha', ua: 'Вимагати re-auth / captcha' },
  },
  {
    check:  { en: 'Deposit total amount',      ua: 'Загальна сума депозитів'  },
    window: { en: '24 hours',                  ua: '24 години'                },
    limit:  { en: 'Configurable per brand',    ua: 'Налаштовується на бренд'  },
    scope:  { en: 'user_id + brand_id',        ua: 'user_id + brand_id'       },
    action: { en: 'Soft block (KYC gate)',      ua: 'Мʼяке блокування (KYC)'  },
  },
  {
    check:  { en: 'Requests per IP',           ua: 'Запитів з IP'             },
    window: { en: '1 minute',                  ua: '1 хвилина'                },
    limit:  { en: '60 requests',               ua: '60 запитів'               },
    scope:  { en: 'IP address',                ua: 'IP-адреса'                },
    action: { en: 'HTTP 429 + exponential backoff', ua: 'HTTP 429 + exponential backoff' },
  },
]

const ERROR_RESPONSE_FIELDS: ResponseField[] = [
  { field: 'error',       type: 'string',  desc: { en: 'Machine-readable error code: "RATE_LIMIT_EXCEEDED"',      ua: 'Машинозчитуваний код помилки: "RATE_LIMIT_EXCEEDED"'  } },
  { field: 'message',     type: 'string',  desc: { en: 'Human-readable description of why the request was blocked', ua: 'Опис зрозумілий людині, чому запит заблоковано'       } },
  { field: 'retry_after', type: 'number',  desc: { en: 'Seconds until the client may retry',                       ua: 'Секунд до наступного дозволеного запиту'               } },
  { field: 'block_type',  type: 'string',  desc: { en: '"velocity" | "ip" | "amount" — which check triggered',     ua: '"velocity" | "ip" | "amount" — який чек спрацював'    } },
]

const STORAGE_OPTIONS: { label: I18n; pros: I18n[]; cons: I18n[]; recommended: boolean }[] = [
  {
    label: { en: 'Redis (recommended)', ua: 'Redis (рекомендовано)' },
    pros: [
      { en: 'Sub-millisecond counter increments with INCR + EXPIRE', ua: 'Лічильники INCR + EXPIRE менш ніж за мілісекунду' },
      { en: 'Atomic sliding window via sorted sets (ZADD / ZCOUNT)',  ua: 'Атомарне sliding window через sorted sets (ZADD / ZCOUNT)' },
      { en: 'TTL-based expiry — counters auto-clean',                 ua: 'Авто-очищення через TTL — лічильники зникають самі' },
      { en: 'Shared state across multiple API replicas',              ua: 'Спільний стан між репліками API' },
    ],
    cons: [
      { en: 'External dependency to deploy and monitor', ua: 'Додатковий сервіс для деплою та моніторингу' },
    ],
    recommended: true,
  },
  {
    label: { en: 'In-memory (per-instance)', ua: 'In-memory (per-instance)' },
    pros: [
      { en: 'Zero infrastructure overhead',    ua: 'Нульові інфраструктурні витрати' },
      { en: 'No network latency',              ua: 'Без мережевої затримки'          },
    ],
    cons: [
      { en: 'Limits not shared across API replicas — user can bypass by hitting different instances', ua: 'Ліміти не синхронізовані між репліками — користувач може обійти, звернувшись до іншого інстансу' },
      { en: 'State lost on restart',           ua: 'Стан втрачається при рестарті'   },
    ],
    recommended: false,
  },
  {
    label: { en: 'PostgreSQL',  ua: 'PostgreSQL' },
    pros: [
      { en: 'No extra infra — reuse existing DB', ua: 'Без додаткової інфраструктури — використовує існуючу БД' },
      { en: 'Durable audit log of rate-limit events', ua: 'Довговічний аудит-лог подій rate-limiting' },
    ],
    cons: [
      { en: 'Slower than Redis for hot-path counters (extra round-trip per request)', ua: 'Повільніше Redis для гарячих лічильників (додатковий round-trip на запит)' },
      { en: 'Write-heavy workload on counters at scale', ua: 'Велике навантаження на запис при масштабуванні' },
    ],
    recommended: false,
  },
]

const REQUEST_FLOW: I18n[] = [
  { en: 'Request arrives at API Gateway',                                 ua: 'Запит надходить до API Gateway'                        },
  { en: 'Auth middleware validates JWT → extracts user_id + brand_id',   ua: 'Auth middleware валідує JWT → отримує user_id + brand_id' },
  { en: 'Rate limiter middleware runs checks (IP → user velocity → amount)', ua: 'Rate limiter middleware запускає перевірки (IP → velocity → сума)' },
  { en: 'If any check fails → return HTTP 429 with retry_after',         ua: 'Якщо перевірка не пройшла → HTTP 429 з retry_after'     },
  { en: 'All checks pass → request forwarded to Request Router',         ua: 'Всі перевірки пройдено → запит передається до Request Router' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const [lang, setLang] = useState<Lang>('en')
  const ua = lang === 'ua'

  return (
    <DocLayout
      title={ua ? 'Rate Limiting' : 'Rate Limiting'}
      breadcrumbLabel="Payment module"
      breadcrumbHref="/sandbox/payment-architecture"
      parentCrumb={{ label: 'Sandbox', href: '/sandbox' }}
      description={ua
        ? 'Velocity checks та захист від зловживань на рівні API Gateway'
        : 'Velocity checks and abuse protection at the API Gateway layer'}
      tags={[
        { label: 'Phase 2', type: 'tag'    },
        { label: 'Spec',    type: 'status' },
      ]}
      titleExtra={<LangSwitcher lang={lang} onChange={setLang} />}
      footnote="DEPO44 | RATE LIMITING SPEC v1 | PHASE 2"
    >

      {/* ── Intro ─────────────────────────────────────────────────────────── */}
      <InfoCard>
        {ua
          ? <>Rate Limiting middleware стоїть у API Gateway одразу після Auth. Він блокує зловживання до того, як запит потрапляє до оркестратора. Всі перевірки атомарні та зберігаються в <strong>Redis</strong>. Два рівні захисту: <strong>IP-рівень</strong> (захист від DDoS та боти) та <strong>рівень користувача</strong> (velocity checks для депозитів/виведень).</>
          : <>Rate Limiting middleware sits in the API Gateway right after Auth. It blocks abuse before the request reaches the orchestrator. All checks are atomic and stored in <strong>Redis</strong>. Two protection layers: <strong>IP-level</strong> (DDoS and bot protection) and <strong>user-level</strong> (velocity checks for deposits/withdrawals).</>
        }
      </InfoCard>

      <WarnCard>
        {ua
          ? <>Velocity ліміти на суму депозиту (<code className="text-xs bg-muted rounded px-1.5 py-0.5">deposit_total_24h</code>) є <strong>налаштовуваними на рівні бренду</strong> через таблицю <code className="text-xs bg-muted rounded px-1.5 py-0.5">psp_configs</code>. Значення за замовчуванням задаються при ініціалізації бренду. Для Phase 2 хардкодяться в конфіг.</>
          : <>Velocity limits on deposit amount (<code className="text-xs bg-muted rounded px-1.5 py-0.5">deposit_total_24h</code>) are <strong>configurable per brand</strong> via the <code className="text-xs bg-muted rounded px-1.5 py-0.5">psp_configs</code> table. Defaults are set at brand initialization. For Phase 2, hard-coded in config.</>
        }
      </WarnCard>

      {/* ── Section 1: Request flow ───────────────────────────────────────── */}
      <DocSection num="1" title={ua ? 'Флоу запиту' : 'Request Flow'}>
        <div className="border border-border rounded-2xl p-4 mb-6">
          <div className="flex flex-col gap-2">
            {REQUEST_FLOW.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground tabular-nums mt-0.5">
                  {i + 1}
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className={cn(
                    'text-sm leading-snug',
                    (i === 3) ? 'text-destructive' : i === 4 ? 'text-success' : 'text-foreground',
                  )}>
                    {step[lang]}
                  </span>
                  {i === 3 && <XCircle className="size-3.5 shrink-0 text-destructive" />}
                  {i === 4 && <CheckCircle2 className="size-3.5 shrink-0 text-success" />}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="size-3.5 shrink-0" />
              <span>{ua ? 'Middleware виконується синхронно, до будь-якої бізнес-логіки. Overhead < 2ms при використанні Redis.' : 'Middleware runs synchronously, before any business logic. Overhead < 2ms with Redis.'}</span>
            </div>
          </div>
        </div>
      </DocSection>

      {/* ── Section 2: Velocity rules ─────────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="2" title={ua ? 'Velocity rules' : 'Velocity Rules'}>
        <DocTable>
          <DocTableHeader>
            <TableRow>
              <TableHead>{ua ? 'Перевірка' : 'Check'}</TableHead>
              <TableHead>{ua ? 'Вікно' : 'Window'}</TableHead>
              <TableHead>{ua ? 'Ліміт' : 'Limit'}</TableHead>
              <TableHead>{ua ? 'Область' : 'Scope'}</TableHead>
              <TableHead>{ua ? 'Дія' : 'Action'}</TableHead>
            </TableRow>
          </DocTableHeader>
          <TableBody>
            {VELOCITY_RULES.map((r, i) => (
              <TableRow key={i}>
                <TableCell className="text-sm font-medium text-foreground">{r.check[lang]}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-3 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground">{r.window[lang]}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm font-semibold text-foreground">{r.limit[lang]}</TableCell>
                <TableCell><code className="text-xs font-mono text-sky-500">{r.scope[lang]}</code></TableCell>
                <TableCell>
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded border',
                    r.action.en.includes('Block') || r.action.en.includes('429')
                      ? 'bg-destructive-bg text-destructive border-destructive/30'
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/30',
                  )}>
                    {r.action[lang]}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DocTable>
      </DocSection>
      </div>

      {/* ── Section 3: HTTP 429 response ─────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="3" title={ua ? 'Відповідь HTTP 429' : 'HTTP 429 Response'}>
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">

          {/* Schema */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {ua ? 'Поля відповіді' : 'Response Fields'}
            </p>
            <DocTable>
              <DocTableHeader>
                <TableRow>
                  <TableHead>{ua ? 'Поле' : 'Field'}</TableHead>
                  <TableHead>{ua ? 'Тип' : 'Type'}</TableHead>
                  <TableHead>{ua ? 'Опис' : 'Description'}</TableHead>
                </TableRow>
              </DocTableHeader>
              <TableBody>
                {ERROR_RESPONSE_FIELDS.map(f => (
                  <TableRow key={f.field}>
                    <TableCell><code className="text-xs font-mono text-foreground">{f.field}</code></TableCell>
                    <TableCell><code className="text-xs font-mono text-muted-foreground">{f.type}</code></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{f.desc[lang]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </DocTable>
          </div>

          {/* Example JSON */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {ua ? 'Приклад відповіді' : 'Example Response'}
            </p>
            <div className="border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-muted border-b border-border">
                <span className="text-xs font-mono text-muted-foreground">HTTP 429</span>
                <Badge variant="outline" className="text-xs bg-destructive-bg text-destructive border-destructive/30 pointer-events-none">Too Many Requests</Badge>
              </div>
              <pre className="text-xs font-mono text-foreground p-4 leading-relaxed overflow-x-auto bg-card">{`{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many deposit attempts.
    Please wait before retrying.",
  "retry_after": 300,
  "block_type": "velocity"
}`}</pre>
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-muted px-3 py-2.5">
              <Info className="size-3.5 shrink-0 mt-0.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground leading-snug">
                {ua
                  ? 'Заголовок Retry-After також має бути встановлений у HTTP-відповіді (RFC 6585). Фронтенд повинен читати retry_after та показувати countdown таймер.'
                  : 'The Retry-After header should also be set in the HTTP response (RFC 6585). Frontend should read retry_after and show a countdown timer.'}
              </p>
            </div>
          </div>
        </div>
      </DocSection>
      </div>

      {/* ── Section 4: Storage ───────────────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="4" title={ua ? 'Зберігання лічильників' : 'Counter Storage'}>
        <div className="flex flex-col gap-4">
          {STORAGE_OPTIONS.map(opt => (
            <div key={opt.label.en} className={cn(
              'border rounded-2xl p-4',
              opt.recommended ? 'border-success/30 bg-success-bg/30' : 'border-border bg-card',
            )}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-foreground">{opt.label[lang]}</span>
                {opt.recommended && (
                  <Badge variant="outline" className="text-xs bg-success-bg text-success border-success/30 pointer-events-none">
                    {ua ? 'Рекомендовано' : 'Recommended'}
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">{ua ? 'Переваги' : 'Pros'}</p>
                  <ul className="flex flex-col gap-1">
                    {opt.pros.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="size-3 shrink-0 mt-0.5 text-success" />
                        {p[lang]}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">{ua ? 'Недоліки' : 'Cons'}</p>
                  <ul className="flex flex-col gap-1">
                    {opt.cons.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <XCircle className="size-3 shrink-0 mt-0.5 text-destructive" />
                        {c[lang]}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {opt.recommended && (
                <div className="mt-3 pt-3 border-t border-success/20">
                  <div className="flex flex-col gap-1.5">
                    <p className="text-xs font-semibold text-foreground">{ua ? 'Redis патерн для sliding window:' : 'Redis pattern for sliding window:'}</p>
                    <pre className="text-xs font-mono text-muted-foreground leading-relaxed overflow-x-auto">{`ZADD rate:deposit:{user_id} {now_ms} {now_ms}
ZREMRANGEBYSCORE rate:deposit:{user_id} 0 {now_ms - window_ms}
count = ZCARD rate:deposit:{user_id}
EXPIRE rate:deposit:{user_id} {window_seconds}`}</pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </DocSection>
      </div>

    </DocLayout>
  )
}
