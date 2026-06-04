'use client'

import { useState } from 'react'
import {
  ArrowUpRight, ArrowDownLeft, ArrowRight, Info, AlertTriangle,
  CheckCircle2, XCircle, Globe, Tag, ArrowLeftRight, ChevronRight,
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

// Endpoints exposed by the router
interface EndpointDef {
  method: 'POST' | 'GET'
  path: string
  auth: boolean
  desc: I18n
  body?: { field: string; type: string; required: boolean; desc: I18n }[]
  response?: { field: string; type: string; desc: I18n }[]
}

const ENDPOINTS: EndpointDef[] = [
  {
    method: 'POST',
    path: '/payments/deposit',
    auth: true,
    desc: {
      en: 'Initiates a new deposit. Validates the request, then forwards to the Orchestrator.',
      ua: 'Ініціює новий депозит. Валідує запит, потім передає до Оркестратора.',
    },
    body: [
      { field: 'amount',    type: 'number',  required: true,  desc: { en: 'Amount in the smallest currency unit (e.g. cents)', ua: 'Сума в мінімальних одиницях валюти (наприклад, центи)' } },
      { field: 'currency',  type: 'string',  required: true,  desc: { en: 'ISO 4217 code, e.g. "USD"', ua: 'Код ISO 4217, наприклад "USD"' } },
      { field: 'method',    type: 'string',  required: true,  desc: { en: 'Payment method slug, e.g. "btc"', ua: 'Slug платіжного методу, наприклад "btc"' } },
      { field: 'metadata',  type: 'object',  required: false, desc: { en: 'Arbitrary key-value pairs passed through to transaction.metadata', ua: 'Довільні пари ключ-значення, зберігаються в transaction.metadata' } },
    ],
    response: [
      { field: 'transaction_id', type: 'string', desc: { en: 'UUID of the created transaction', ua: 'UUID створеної транзакції' } },
      { field: 'status',         type: 'string', desc: { en: '"INITIATED" -- initial status', ua: '"INITIATED" -- початковий статус' } },
      { field: 'wallet_address', type: 'string', desc: { en: 'Crypto address to show the player', ua: 'Крипто-адреса для показу гравцю' } },
      { field: 'destination_tag',type: 'string | null', desc: { en: 'Required memo for XRP/TON, null otherwise', ua: 'Обовʼязковий memo для XRP/TON, інакше null' } },
      { field: 'expires_at',     type: 'string', desc: { en: 'ISO 8601 datetime when the invoice expires', ua: 'ISO 8601 дата/час закінчення дії інвойсу' } },
      { field: 'amount_crypto',  type: 'string', desc: { en: 'Exact crypto amount the player must send', ua: 'Точна крипто-сума яку гравець повинен надіслати' } },
    ],
  },
  {
    method: 'POST',
    path: '/payments/withdrawal',
    auth: true,
    desc: {
      en: 'Initiates a withdrawal. Requires KYC gate and balance check before forwarding to Orchestrator. Phase 3 feature -- stub in Phase 2.',
      ua: 'Ініціює виведення коштів. Вимагає KYC gate та перевірку балансу перед передачею до Оркестратора. Функція Фази 3 -- stub у Фазі 2.',
    },
    body: [
      { field: 'amount',         type: 'number', required: true,  desc: { en: 'Amount to withdraw in the smallest currency unit', ua: 'Сума виведення в мінімальних одиницях валюти' } },
      { field: 'currency',       type: 'string', required: true,  desc: { en: 'ISO 4217 currency code', ua: 'Код валюти ISO 4217' } },
      { field: 'method',         type: 'string', required: true,  desc: { en: 'Payment method slug', ua: 'Slug платіжного методу' } },
      { field: 'wallet_address', type: 'string', required: true,  desc: { en: 'Player\'s destination wallet address', ua: 'Адреса гаманця гравця для виведення' } },
      { field: 'destination_tag',type: 'string', required: false, desc: { en: 'Memo / destination tag for XRP, TON', ua: 'Memo / destination tag для XRP, TON' } },
    ],
    response: [
      { field: 'transaction_id', type: 'string', desc: { en: 'UUID of the created transaction', ua: 'UUID створеної транзакції' } },
      { field: 'status',         type: 'string', desc: { en: '"INITIATED" -- pending KYC/manual review in Phase 3', ua: '"INITIATED" -- очікує KYC/ручний огляд у Фазі 3' } },
    ],
  },
  {
    method: 'GET',
    path: '/payments/:transaction_id/status',
    auth: true,
    desc: {
      en: 'Returns current transaction status. Polled by the frontend. See Status Polling spec.',
      ua: 'Повертає поточний статус транзакції. Опитується фронтендом. Дивись специфікацію Status Polling.',
    },
    response: [
      { field: 'transaction_id', type: 'string', desc: { en: 'Transaction UUID', ua: 'UUID транзакції' } },
      { field: 'status',         type: 'string', desc: { en: 'Current UnifiedStatus', ua: 'Поточний UnifiedStatus' } },
      { field: 'direction',      type: 'string', desc: { en: '"deposit" | "withdrawal"', ua: '"deposit" | "withdrawal"' } },
      { field: 'amount_requested', type: 'number', desc: { en: 'Original requested amount (smallest unit)', ua: 'Оригінальна запитана сума (мінімальні одиниці)' } },
      { field: 'amount_credited',  type: 'number | null', desc: { en: 'Credited amount, null until COMPLETED', ua: 'Зарахована сума, null до COMPLETED' } },
      { field: 'wallet_address', type: 'string | null', desc: { en: 'For deposits: address to show player', ua: 'Для депозитів: адреса для показу гравцю' } },
      { field: 'expires_at',     type: 'string | null', desc: { en: 'Invoice expiry, null if already expired/completed', ua: 'Закінчення інвойсу, null якщо вже закінчився/завершено' } },
      { field: 'created_at',     type: 'string', desc: { en: 'ISO 8601 transaction creation time', ua: 'Час створення транзакції ISO 8601' } },
      { field: 'updated_at',     type: 'string', desc: { en: 'ISO 8601 last status change time', ua: 'Час останньої зміни статусу ISO 8601' } },
    ],
  },
  {
    method: 'GET',
    path: '/payments/methods',
    auth: true,
    desc: {
      en: 'Returns available payment methods for the player\'s brand + geo. Read from payment_methods cache table.',
      ua: 'Повертає доступні платіжні методи для бренду + гео гравця. Зчитується з кеш-таблиці payment_methods.',
    },
    response: [
      { field: 'methods', type: 'Method[]', desc: { en: 'Array of available methods: { slug, name, network, min_amount, max_amount, fee_pct, logo_url, requires_tag }', ua: 'Масив доступних методів: { slug, name, network, min_amount, max_amount, fee_pct, logo_url, requires_tag }' } },
    ],
  },
]

// Validation steps run by the router before forwarding
interface ValidationStep {
  name: I18n
  desc: I18n
  errorCode: string
  httpStatus: number
  phase2: boolean
}

const VALIDATION_STEPS: ValidationStep[] = [
  {
    name:       { en: 'JWT present & valid',           ua: 'JWT присутній та валідний'              },
    desc:       { en: 'Auth middleware already ran -- Router trusts the injected user context',       ua: 'Auth middleware вже відпрацював -- Router довіряє інжектованому контексту користувача' },
    errorCode:  'UNAUTHORIZED',
    httpStatus: 401,
    phase2: true,
  },
  {
    name:       { en: 'Brand resolved',                ua: 'Бренд визначений'                       },
    desc:       { en: 'brand_id must be present in JWT claims. Router rejects requests without a resolved brand.', ua: 'brand_id має бути присутній у JWT claims. Router відхиляє запити без визначеного бренду.' },
    errorCode:  'BRAND_NOT_RESOLVED',
    httpStatus: 400,
    phase2: true,
  },
  {
    name:       { en: 'Required fields present',       ua: 'Обовʼязкові поля присутні'              },
    desc:       { en: 'Checks that amount, currency, method are non-null and match expected types',  ua: 'Перевіряє що amount, currency, method -- не null і відповідають очікуваним типам'         },
    errorCode:  'VALIDATION_ERROR',
    httpStatus: 422,
    phase2: true,
  },
  {
    name:       { en: 'Currency supported',            ua: 'Валюта підтримується'                   },
    desc:       { en: 'ISO 4217 code must be in the brand\'s allowed currency list',                 ua: 'Код ISO 4217 повинен бути у списку дозволених валют бренду'                              },
    errorCode:  'CURRENCY_NOT_SUPPORTED',
    httpStatus: 422,
    phase2: true,
  },
  {
    name:       { en: 'Method available for geo',      ua: 'Метод доступний для гео'                },
    desc:       { en: 'Checks payment_methods cache: method must be active for the player\'s country', ua: 'Перевіряє кеш payment_methods: метод повинен бути активним для країни гравця'          },
    errorCode:  'METHOD_NOT_AVAILABLE',
    httpStatus: 422,
    phase2: true,
  },
  {
    name:       { en: 'Amount within PSP limits',      ua: 'Сума в межах лімітів PSP'               },
    desc:       { en: 'amount must be ≥ min_amount and ≤ max_amount from payment_methods cache',     ua: 'amount повинен бути ≥ min_amount і ≤ max_amount з кешу payment_methods'                  },
    errorCode:  'AMOUNT_OUT_OF_RANGE',
    httpStatus: 422,
    phase2: true,
  },
  {
    name:       { en: 'Balance check (withdrawal)',    ua: 'Перевірка балансу (виведення)'          },
    desc:       { en: 'For withdrawals only: player balance must be ≥ amount. Phase 3 -- stub returns 501 in Phase 2.', ua: 'Лише для виведень: баланс гравця має бути ≥ amount. Фаза 3 -- stub повертає 501 у Фазі 2.' },
    errorCode:  'INSUFFICIENT_BALANCE',
    httpStatus: 422,
    phase2: false,
  },
]

// Context injected into every downstream call
const CONTEXT_FIELDS: { field: string; source: I18n; desc: I18n }[] = [
  { field: 'user_id',    source: { en: 'JWT claim',      ua: 'JWT claim'       }, desc: { en: 'Authenticated player identifier',                     ua: 'Ідентифікатор автентифікованого гравця'       } },
  { field: 'brand_id',   source: { en: 'JWT claim',      ua: 'JWT claim'       }, desc: { en: 'Tenant that owns this request',                       ua: 'Тенант власник цього запиту'                   } },
  { field: 'session_id', source: { en: 'JWT claim',      ua: 'JWT claim'       }, desc: { en: 'Session ID for fraud correlation',                    ua: 'ID сесії для кореляції фроду'                  } },
  { field: 'geo',        source: { en: 'IP geolocation', ua: 'IP-геолокація'   }, desc: { en: 'ISO 3166-1 alpha-2 country code resolved from client IP', ua: 'Код країни ISO 3166-1 alpha-2 за IP клієнта' } },
  { field: 'ip',         source: { en: 'Request header', ua: 'Request header'  }, desc: { en: 'Client IP (X-Forwarded-For or socket, sanitized)',     ua: 'IP клієнта (X-Forwarded-For або socket, очищений)' } },
  { field: 'direction',  source: { en: 'Route path',     ua: 'Шлях маршруту'   }, desc: { en: '"deposit" | "withdrawal" -- derived from which endpoint was called', ua: '"deposit" | "withdrawal" -- з якого ендпоінту' } },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const [lang, setLang] = useState<Lang>('en')
  const ua = lang === 'ua'

  return (
    <DocLayout
      title="Request Router"
      breadcrumbLabel="Payment Infrastructure"
      breadcrumbHref="/sandbox/payment-infra"
      parentCrumb={{ label: 'Sandbox', href: '/sandbox' }}
      description={ua
        ? 'Маршрутизація запитів депозиту та виведення. Валідація вхідних даних перед Оркестратором.'
        : 'Routes deposit and withdrawal requests. Input validation before the Orchestrator.'}
      tags={[
        { label: 'Phase 2', type: 'tag'    },
        { label: 'Spec',    type: 'status' },
      ]}
      titleExtra={<LangSwitcher lang={lang} onChange={setLang} />}
      footnote="DEPO44 | REQUEST ROUTER SPEC v1 | PHASE 2"
    >

      {/* ── Intro ─────────────────────────────────────────────────────────── */}
      <InfoCard>
        {ua
          ? <>Request Router -- перший компонент у API Gateway, який знає про <strong>бізнес-логіку</strong>. Він отримує вже автентифіковані запити від Auth middleware і Rate Limiter, <strong>валідує вхідні дані</strong>, збагачує контекст (geo, session), і передає нормалізований запит до <strong>Orchestrator</strong>. Сам не виконує жодних платіжних операцій.</>
          : <>Request Router is the first component in the API Gateway that understands <strong>business logic</strong>. It receives already-authenticated requests from Auth middleware and Rate Limiter, <strong>validates input</strong>, enriches context (geo, session), and forwards a normalized request to the <strong>Orchestrator</strong>. It performs no payment operations itself.</>
        }
      </InfoCard>

      <WarnCard>
        {ua
          ? <>Ендпоінт <code className="text-xs bg-muted rounded px-1.5 py-0.5">POST /payments/withdrawal</code> у Фазі 2 повертає <code className="text-xs bg-muted rounded px-1.5 py-0.5">501 Not Implemented</code>. Заглушка потрібна щоб фронтенд міг будуватись без помилок типів. Повна реалізація -- Фаза 3.</>
          : <>The <code className="text-xs bg-muted rounded px-1.5 py-0.5">POST /payments/withdrawal</code> endpoint returns <code className="text-xs bg-muted rounded px-1.5 py-0.5">501 Not Implemented</code> in Phase 2. The stub exists so the frontend can build without type errors. Full implementation is Phase 3.</>
        }
      </WarnCard>

      {/* ── Section 1: Endpoints ──────────────────────────────────────────── */}
      <DocSection num="1" title={ua ? 'Ендпоінти' : 'Endpoints'}>
        <div className="flex flex-col gap-6">
          {ENDPOINTS.map(ep => (
            <div key={ep.path} className="border border-border rounded-2xl overflow-hidden">

              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-muted border-b border-border flex-wrap gap-y-2">
                <Badge variant="outline" className={cn(
                  'text-xs font-mono font-bold pointer-events-none shrink-0',
                  ep.method === 'POST'
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                    : 'bg-sky-500/10 text-sky-500 border-sky-500/30',
                )}>
                  {ep.method}
                </Badge>
                <code className="text-sm font-mono font-semibold text-foreground">{ep.path}</code>
                {ep.auth && (
                  <Badge variant="outline" className="text-xs bg-violet-500/10 text-violet-500 border-violet-500/30 pointer-events-none ml-auto shrink-0">
                    JWT required
                  </Badge>
                )}
              </div>

              <div className="px-4 py-3 bg-card border-b border-border">
                <p className="text-sm text-muted-foreground leading-relaxed">{ep.desc[lang]}</p>
              </div>

              <div className="divide-y divide-border">
                {/* Request body */}
                {ep.body && (
                  <div className="px-4 py-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      {ua ? 'Тіло запиту' : 'Request Body'}
                    </p>
                    <DocTable>
                      <DocTableHeader>
                        <TableRow>
                          <TableHead>{ua ? 'Поле' : 'Field'}</TableHead>
                          <TableHead>{ua ? 'Тип' : 'Type'}</TableHead>
                          <TableHead>{ua ? 'Обовʼязкове' : 'Required'}</TableHead>
                          <TableHead>{ua ? 'Опис' : 'Description'}</TableHead>
                        </TableRow>
                      </DocTableHeader>
                      <TableBody>
                        {ep.body.map(f => (
                          <TableRow key={f.field}>
                            <TableCell><code className="text-xs font-mono text-foreground">{f.field}</code></TableCell>
                            <TableCell><code className="text-xs font-mono text-muted-foreground">{f.type}</code></TableCell>
                            <TableCell>
                              {f.required
                                ? <Badge variant="outline" className="text-xs bg-destructive-bg text-destructive border-destructive/30 pointer-events-none">{ua ? 'Так' : 'Yes'}</Badge>
                                : <Badge variant="outline" className="text-xs bg-muted text-muted-foreground border-border pointer-events-none">{ua ? 'Ні' : 'No'}</Badge>
                              }
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{f.desc[lang]}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </DocTable>
                  </div>
                )}

                {/* Response */}
                {ep.response && (
                  <div className="px-4 py-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      {ua ? 'Відповідь (200 OK)' : 'Response (200 OK)'}
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
                        {ep.response.map(f => (
                          <TableRow key={f.field}>
                            <TableCell><code className="text-xs font-mono text-foreground">{f.field}</code></TableCell>
                            <TableCell><code className="text-xs font-mono text-muted-foreground">{f.type}</code></TableCell>
                            <TableCell className="text-sm text-muted-foreground">{f.desc[lang]}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </DocTable>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </DocSection>

      {/* ── Section 2: Validation pipeline ───────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="2" title={ua ? 'Пайплайн валідації' : 'Validation Pipeline'}>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {ua
            ? 'Перевірки виконуються послідовно. Перша невдала перевірка зупиняє пайплайн та повертає помилку. Запит до Оркестратора відбувається лише якщо всі перевірки пройдено.'
            : 'Checks run in sequence. The first failing check stops the pipeline and returns an error. The Orchestrator is called only if all checks pass.'
          }
        </p>
        <div className="flex flex-col gap-2">
          {VALIDATION_STEPS.map((step, i) => (
            <div key={i} className={cn(
              'border rounded-2xl p-4 flex items-start gap-3',
              !step.phase2 ? 'opacity-50 border-dashed' : 'border-border bg-card',
            )}>
              <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground tabular-nums mt-0.5">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-semibold text-foreground">{step.name[lang]}</span>
                  <Badge variant="outline" className="text-xs font-mono bg-destructive-bg text-destructive border-destructive/30 pointer-events-none">
                    {step.httpStatus}
                  </Badge>
                  <code className="text-xs text-muted-foreground">{step.errorCode}</code>
                  {!step.phase2 && (
                    <Badge variant="outline" className="text-xs bg-muted text-muted-foreground border-border pointer-events-none">
                      {ua ? 'Фаза 3' : 'Phase 3'}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-snug">{step.desc[lang]}</p>
              </div>
              {step.phase2
                ? <CheckCircle2 className="size-4 shrink-0 text-success mt-0.5" />
                : <XCircle className="size-4 shrink-0 text-muted-foreground mt-0.5" />
              }
            </div>
          ))}

          {/* Terminal: forward to orchestrator */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-success-bg border border-success/30">
            <ArrowRight className="size-4 shrink-0 text-success" />
            <span className="text-sm font-semibold text-success">
              {ua ? 'Всі перевірки пройдено → передача до Orchestrator' : 'All checks passed → forward to Orchestrator'}
            </span>
          </div>
        </div>
      </DocSection>
      </div>

      {/* ── Section 3: Request context ───────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="3" title={ua ? 'Контекст запиту' : 'Request Context'}>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {ua
            ? 'Router збагачує кожен запит перед тим як передати його далі. Ці поля доступні Оркестратору, Адаптерам та State Machine без додаткових викликів.'
            : 'The Router enriches every request before forwarding it downstream. These fields are available to the Orchestrator, Adapters, and State Machine without additional calls.'
          }
        </p>
        <DocTable>
          <DocTableHeader>
            <TableRow>
              <TableHead>{ua ? 'Поле' : 'Field'}</TableHead>
              <TableHead>{ua ? 'Джерело' : 'Source'}</TableHead>
              <TableHead>{ua ? 'Опис' : 'Description'}</TableHead>
            </TableRow>
          </DocTableHeader>
          <TableBody>
            {CONTEXT_FIELDS.map(f => (
              <TableRow key={f.field}>
                <TableCell><code className="text-xs font-mono text-foreground">{f.field}</code></TableCell>
                <TableCell>
                  <span className="text-xs text-sky-500">{f.source[lang]}</span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{f.desc[lang]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DocTable>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-muted px-3 py-2.5">
          <Info className="size-3.5 shrink-0 mt-0.5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground leading-snug">
            {ua
              ? 'Геолокація визначається один раз у Router та кешується в контексті запиту. Повторно не запитується в Оркестраторі чи Адаптерах.'
              : 'Geolocation is resolved once in the Router and cached in the request context. It is not re-resolved in the Orchestrator or Adapters.'}
          </p>
        </div>
      </DocSection>
      </div>

      {/* ── Section 4: Error codes ───────────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="4" title={ua ? 'Коди помилок' : 'Error Codes'}>
        <DocTable>
          <DocTableHeader>
            <TableRow>
              <TableHead>{ua ? 'HTTP' : 'HTTP'}</TableHead>
              <TableHead>{ua ? 'Код' : 'Code'}</TableHead>
              <TableHead>{ua ? 'Коли виникає' : 'When'}</TableHead>
              <TableHead>{ua ? 'Retry?' : 'Retry?'}</TableHead>
            </TableRow>
          </DocTableHeader>
          <TableBody>
            {[
              { status: 401, code: 'UNAUTHORIZED',          when: { en: 'JWT missing, expired, or invalid signature', ua: 'JWT відсутній, прострочений або невалідний підпис' }, retry: false },
              { status: 400, code: 'BRAND_NOT_RESOLVED',    when: { en: 'brand_id not found in JWT claims',            ua: 'brand_id відсутній у JWT claims'                   }, retry: false },
              { status: 422, code: 'VALIDATION_ERROR',      when: { en: 'Required fields missing or wrong type',       ua: 'Відсутні обовʼязкові поля або неправильний тип'    }, retry: false },
              { status: 422, code: 'CURRENCY_NOT_SUPPORTED',when: { en: 'Currency not in brand\'s allowed list',       ua: 'Валюта не в списку дозволених для бренду'          }, retry: false },
              { status: 422, code: 'METHOD_NOT_AVAILABLE',  when: { en: 'Method inactive for player\'s geo',           ua: 'Метод неактивний для гео гравця'                   }, retry: false },
              { status: 422, code: 'AMOUNT_OUT_OF_RANGE',   when: { en: 'amount < min_amount or > max_amount',         ua: 'amount < min_amount або > max_amount'               }, retry: false },
              { status: 429, code: 'RATE_LIMIT_EXCEEDED',   when: { en: 'Rate limiter blocked the request (see Rate Limiting spec)', ua: 'Rate limiter заблокував запит (дивись spec Rate Limiting)' }, retry: true  },
              { status: 422, code: 'INSUFFICIENT_BALANCE',  when: { en: 'Withdrawal amount exceeds player balance (Phase 3)', ua: 'Сума виведення перевищує баланс гравця (Фаза 3)' }, retry: false },
              { status: 501, code: 'NOT_IMPLEMENTED',       when: { en: 'Withdrawal endpoint stub in Phase 2',         ua: 'Заглушка ендпоінту виведення у Фазі 2'             }, retry: false },
            ].map((r, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Badge variant="outline" className={cn(
                    'text-xs font-mono pointer-events-none',
                    r.status >= 500 ? 'bg-muted text-muted-foreground border-border' :
                    r.status >= 400 ? 'bg-destructive-bg text-destructive border-destructive/30' : '',
                  )}>{r.status}</Badge>
                </TableCell>
                <TableCell><code className="text-xs font-mono text-foreground">{r.code}</code></TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.when[lang]}</TableCell>
                <TableCell>
                  {r.retry
                    ? <span className="text-xs text-amber-500">{ua ? 'Так (після retry_after)' : 'Yes (after retry_after)'}</span>
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
