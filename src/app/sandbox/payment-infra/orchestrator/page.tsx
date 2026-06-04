'use client'

import { useState } from 'react'
import {
  Cpu, Info, AlertTriangle, CheckCircle2, XCircle, ArrowRight,
  ChevronDown, Link2, Tag, Globe, ArrowUpDown, ArrowLeftRight, User,
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

// Orchestration flow steps
interface FlowStep {
  title: I18n
  desc: I18n
  code?: string
  terminal?: 'success' | 'error'
}

const FLOW_STEPS: FlowStep[] = [
  {
    title: { en: 'Receive normalized request from Router', ua: 'Отримати нормалізований запит від Router' },
    desc:  { en: 'Context includes user_id, brand_id, geo, direction, method, amount, currency, session_id.', ua: 'Контекст містить user_id, brand_id, geo, direction, method, amount, currency, session_id.' },
  },
  {
    title: { en: 'Load PSP candidates from psp_configs', ua: 'Завантажити кандидатів PSP з psp_configs' },
    desc:  { en: 'Query: WHERE brand_id = ? AND is_active = true AND (geo = ? OR geo IS NULL) AND direction IN (?, "both") ORDER BY priority ASC', ua: 'Запит: WHERE brand_id = ? AND is_active = true AND (geo = ? OR geo IS NULL) AND direction IN (?, "both") ORDER BY priority ASC' },
    code: `SELECT * FROM psp_configs
WHERE brand_id     = :brand_id
  AND is_active    = true
  AND direction    IN (:direction, 'both')
  AND (geo = :geo OR geo IS NULL)
  AND :method = ANY(methods)
ORDER BY priority ASC`,
  },
  {
    title: { en: 'Apply routing_rules overrides', ua: 'Застосувати перевизначення routing_rules' },
    desc:  { en: 'Evaluate active rules for this brand, ordered by priority. First matching rule pins a specific psp_config_id. If no rule matches -- use the priority-ordered list from step 2.', ua: 'Обчислити активні правила для цього бренду, впорядковані за пріоритетом. Перше правило що збіглось закріплює конкретний psp_config_id. Якщо жодне не збіглось -- використати список за пріоритетом з кроку 2.' },
  },
  {
    title: { en: 'Select first PSP from candidate list', ua: 'Вибрати перший PSP зі списку кандидатів' },
    desc:  { en: 'The top candidate (lowest priority number) becomes the active PSP. Its psp_config_id is written to the transaction record immediately.', ua: 'Перший кандидат (найменше число пріоритету) стає активним PSP. Його psp_config_id відразу записується в запис транзакції.' },
  },
  {
    title: { en: 'Resolve adapter and call initiateDeposit / initiateWithdrawal', ua: 'Знайти адаптер та викликати initiateDeposit / initiateWithdrawal' },
    desc:  { en: 'Adapter is resolved by psp_name from the adapter registry. The call is synchronous -- Orchestrator awaits the UnifiedResponse.', ua: 'Адаптер знаходиться за psp_name з реєстру адаптерів. Виклик синхронний -- Orchestrator очікує UnifiedResponse.' },
    code: `const adapter = adapterRegistry.get(pspConfig.psp_name)
const response = await adapter.initiateDeposit({
  transactionId: tx.id,
  orderId:       tx.psp_order_id,
  amount:        tx.amount_requested,
  currency:      tx.currency,
  method:        tx.method,
  credentials:   pspConfig.credentials,
})`,
  },
  {
    title: { en: 'Handle adapter response', ua: 'Обробити відповідь адаптера' },
    desc:  { en: 'On success -- transition state machine to PROCESSING and return data to Router. On PSP error -- attempt cascade to next candidate (see Cascade Manager).', ua: 'При успіху -- перевести state machine до PROCESSING та повернути дані до Router. При помилці PSP -- спробувати каскад до наступного кандидата (дивись Cascade Manager).' },
  },
  {
    title: { en: 'Return UnifiedResponse to Router', ua: 'Повернути UnifiedResponse до Router' },
    desc:  { en: 'Router maps the UnifiedResponse to the HTTP response shape and sends it to the client.', ua: 'Router перетворює UnifiedResponse у форму HTTP відповіді та відправляє клієнту.' },
    terminal: 'success',
  },
]

// Routing dimensions used to select PSP
const ROUTING_DIMENSIONS = [
  { Icon: Tag,          label: { en: 'Brand',     ua: 'Бренд'     }, desc: { en: 'brand_id -- mandatory. Every PSP config is scoped to a brand.',                   ua: 'brand_id -- обовʼязково. Кожен PSP config прив\'язаний до бренду.' } },
  { Icon: Globe,        label: { en: 'GEO',        ua: 'ГЕО'       }, desc: { en: 'player\'s country from request context. NULL in psp_configs matches any geo.',    ua: 'Країна гравця з контексту запиту. NULL у psp_configs збігається з будь-яким гео.' } },
  { Icon: ArrowUpDown,  label: { en: 'Direction',  ua: 'Напрямок'  }, desc: { en: '"deposit" | "withdrawal". Configs with direction="both" match either.',          ua: '"deposit" | "withdrawal". Конфіги з direction="both" підходять для обох.' } },
  { Icon: ArrowLeftRight,label:{ en: 'Currency',   ua: 'Валюта'    }, desc: { en: 'Filtered implicitly via method slug -- each method maps to a specific currency.', ua: 'Фільтрується через slug методу -- кожен метод відповідає конкретній валюті.' } },
  { Icon: Link2,        label: { en: 'Method',     ua: 'Метод'     }, desc: { en: 'method slug must be present in psp_config.methods[] array.',                      ua: 'slug методу повинен бути присутнім у масиві psp_config.methods[].' } },
  { Icon: User,         label: { en: 'Priority',   ua: 'Пріоритет' }, desc: { en: 'Lowest priority number wins within a brand+geo+direction group.',                 ua: 'Найменше число пріоритету виграє в межах групи brand+geo+direction.' } },
]

// Cascade behavior
interface CascadeRow {
  trigger: I18n
  behavior: I18n
  maxAttempts: number
}

const CASCADE_RULES: CascadeRow[] = [
  {
    trigger:     { en: 'Adapter throws network / timeout error',          ua: 'Адаптер кидає помилку мережі / timeout'            },
    behavior:    { en: 'Remove failed PSP from candidate list. Retry with next candidate. Log error to transaction_events.',      ua: 'Видалити невдалий PSP зі списку кандидатів. Повторити з наступним кандидатом. Залогувати помилку в transaction_events.' },
    maxAttempts: 3,
  },
  {
    trigger:     { en: 'PSP returns explicit rejection (e.g. currency not supported)', ua: 'PSP повертає явну відмову (наприклад, валюта не підтримується)' },
    behavior:    { en: 'Treat as hard failure for this PSP. Cascade to next candidate. Do NOT retry the same PSP.',               ua: 'Вважати жорсткою відмовою для цього PSP. Каскад до наступного кандидата. НЕ повторювати той самий PSP.' },
    maxAttempts: 3,
  },
  {
    trigger:     { en: 'All candidates exhausted',                        ua: 'Всі кандидати вичерпано'                           },
    behavior:    { en: 'Transition transaction to FAILED. Return error to Router. No further retries.',                           ua: 'Перевести транзакцію до FAILED. Повернути помилку до Router. Жодних повторних спроб.' },
    maxAttempts: 0,
  },
]

// Internal interface methods
interface MethodDef {
  signature: string
  desc: I18n
  returns: I18n
}

const METHODS: MethodDef[] = [
  {
    signature: 'orchestrateDeposit(ctx: RequestContext): Promise<OrchestratorResult>',
    desc:      { en: 'Main entry point for deposit requests. Runs the full routing + adapter + cascade pipeline.', ua: 'Головна точка входу для запитів депозиту. Запускає повний пайплайн роутингу + адаптер + каскад.' },
    returns:   { en: 'OrchestratorResult: { transactionId, status, walletAddress, destinationTag, expiresAt, amountCrypto }', ua: 'OrchestratorResult: { transactionId, status, walletAddress, destinationTag, expiresAt, amountCrypto }' },
  },
  {
    signature: 'orchestrateWithdrawal(ctx: RequestContext): Promise<OrchestratorResult>',
    desc:      { en: 'Entry point for withdrawal requests. Phase 3 -- throws NotImplementedError in Phase 2.', ua: 'Точка входу для запитів виведення. Фаза 3 -- кидає NotImplementedError у Фазі 2.' },
    returns:   { en: 'OrchestratorResult: { transactionId, status }', ua: 'OrchestratorResult: { transactionId, status }' },
  },
  {
    signature: 'selectPsp(ctx: RequestContext): Promise<PspConfig[]>',
    desc:      { en: 'Queries psp_configs + routing_rules and returns ordered candidate list. Separated for testability.', ua: 'Запитує psp_configs + routing_rules і повертає впорядкований список кандидатів. Виділено для тестованості.' },
    returns:   { en: 'PspConfig[] -- ordered by effective priority after rules applied', ua: 'PspConfig[] -- впорядкований за ефективним пріоритетом після застосування правил' },
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const [lang, setLang] = useState<Lang>('en')
  const ua = lang === 'ua'

  return (
    <DocLayout
      title="Payment Orchestrator"
      breadcrumbLabel="Payment Infrastructure"
      breadcrumbHref="/sandbox/payment-infra"
      parentCrumb={{ label: 'Sandbox', href: '/sandbox' }}
      description={ua
        ? 'Routing rules engine. Вибирає PSP, запускає каскад, делегує адаптеру.'
        : 'Routing rules engine. Selects PSP, runs cascade, delegates to the adapter.'}
      tags={[
        { label: 'Phase 2', type: 'tag'    },
        { label: 'Spec',    type: 'status' },
      ]}
      titleExtra={<LangSwitcher lang={lang} onChange={setLang} />}
      footnote="DEPO44 | ORCHESTRATOR SPEC v1 | PHASE 2"
    >

      {/* ── Intro ─────────────────────────────────────────────────────────── */}
      <InfoCard>
        {ua
          ? <>Orchestrator -- єдиний компонент, який знає <strong>який PSP використовувати</strong> і <strong>в якому порядку</strong>. Він не спілкується з PSP напряму -- завжди через Adapter Layer. Не знає нічого про HTTP-шар над ним. Отримує нормалізований <code className="text-xs bg-muted rounded px-1.5 py-0.5">RequestContext</code> від Router і повертає <code className="text-xs bg-muted rounded px-1.5 py-0.5">OrchestratorResult</code>.</>
          : <>Orchestrator is the only component that knows <strong>which PSP to use</strong> and <strong>in what order</strong>. It never talks to a PSP directly -- always through the Adapter Layer. It has no knowledge of the HTTP layer above it. It receives a normalized <code className="text-xs bg-muted rounded px-1.5 py-0.5">RequestContext</code> from the Router and returns an <code className="text-xs bg-muted rounded px-1.5 py-0.5">OrchestratorResult</code>.</>
        }
      </InfoCard>

      <WarnCard>
        {ua
          ? <>Orchestrator <strong>не зберігає стан між запитами</strong>. Він stateless -- будь-який стан (статус транзакції, вибраний PSP, спроби каскаду) записується в БД через State Machine і доступний при наступному виклику.</>
          : <>The Orchestrator <strong>holds no state between requests</strong>. It is stateless -- any state (transaction status, selected PSP, cascade attempts) is written to the DB via the State Machine and available on the next call.</>
        }
      </WarnCard>

      {/* ── Section 1: Orchestration flow ────────────────────────────────── */}
      <DocSection num="1" title={ua ? 'Флоу оркестрації' : 'Orchestration Flow'}>
        <div className="flex flex-col gap-2">
          {FLOW_STEPS.map((step, i) => (
            <div key={i}>
              <div className={cn(
                'border rounded-2xl p-4 flex items-start gap-3',
                step.terminal === 'success' ? 'border-success/30 bg-success-bg/30' : 'border-border bg-card',
              )}>
                <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground tabular-nums mt-0.5">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-semibold mb-1', step.terminal === 'success' ? 'text-success' : 'text-foreground')}>
                    {step.title[lang]}
                  </p>
                  <p className="text-xs text-muted-foreground leading-snug">{step.desc[lang]}</p>
                  {step.code && (
                    <pre className="mt-2 text-xs font-mono text-muted-foreground bg-muted rounded-xl px-3 py-2.5 overflow-x-auto leading-relaxed">
                      {step.code}
                    </pre>
                  )}
                </div>
                {step.terminal === 'success' && <CheckCircle2 className="size-4 shrink-0 text-success mt-0.5" />}
              </div>
              {i < FLOW_STEPS.length - 1 && (
                <div className="flex justify-start pl-5 py-1">
                  <ChevronDown className="size-3.5 text-muted-foreground/40" />
                </div>
              )}
            </div>
          ))}
        </div>
      </DocSection>

      {/* ── Section 2: Routing dimensions ────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="2" title={ua ? 'Виміри роутингу' : 'Routing Dimensions'}>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {ua
            ? 'Orchestrator будує SQL запит динамічно на основі контексту запиту. Всі виміри застосовуються одночасно як AND-умови.'
            : 'The Orchestrator builds the SQL query dynamically from the request context. All dimensions are applied simultaneously as AND conditions.'
          }
        </p>
        <div className="grid grid-cols-1 gap-2.5 tablet:grid-cols-2">
          {ROUTING_DIMENSIONS.map((d) => (
            <div key={d.label.en} className="border border-border rounded-2xl p-3.5 flex items-start gap-3 bg-card">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <d.Icon className="size-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{d.label[lang]}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{d.desc[lang]}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-muted px-3 py-2.5">
          <Info className="size-3.5 shrink-0 mt-0.5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground leading-snug">
            {ua
              ? 'Якщо жодного кандидата не знайдено після фільтрації -- Orchestrator повертає PSP_NOT_AVAILABLE (503). Це означає що для даного бренду/гео/методу не налаштовано жодного активного PSP.'
              : 'If no candidates are found after filtering -- the Orchestrator returns PSP_NOT_AVAILABLE (503). This means no active PSP is configured for the given brand/geo/method combination.'
            }
          </p>
        </div>
      </DocSection>
      </div>

      {/* ── Section 3: Cascade behavior ──────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="3" title={ua ? 'Каскадна поведінка' : 'Cascade Behavior'}>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {ua
            ? 'Якщо перший PSP не відповів або повернув помилку, Orchestrator автоматично пробує наступного кандидата. Cascade Manager відповідає за логіку перебору. Максимум 3 спроби на один запит.'
            : 'If the first PSP fails or returns an error, the Orchestrator automatically tries the next candidate. The Cascade Manager handles the iteration logic. Maximum 3 attempts per request.'
          }
        </p>
        <div className="flex flex-col gap-3">
          {CASCADE_RULES.map((r, i) => (
            <div key={i} className="border border-border rounded-2xl p-4 bg-card">
              <div className="flex items-start gap-3 mb-2">
                <div className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-md text-xs font-bold mt-0.5',
                  i < CASCADE_RULES.length - 1 ? 'bg-amber-500/10 text-amber-500' : 'bg-destructive-bg text-destructive',
                )}>
                  {i + 1}
                </div>
                <p className="text-sm font-semibold text-foreground">{r.trigger[lang]}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-snug pl-8">{r.behavior[lang]}</p>
              {r.maxAttempts > 0 && (
                <div className="mt-2 pl-8">
                  <span className="text-xs text-muted-foreground">
                    {ua ? `Макс. спроб: ` : `Max attempts: `}
                    <span className="font-semibold text-foreground">{r.maxAttempts}</span>
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {ua ? 'Псевдокод каскаду' : 'Cascade pseudocode'}
          </p>
          <pre className="text-xs font-mono text-muted-foreground bg-muted rounded-xl px-4 py-3 overflow-x-auto leading-relaxed">{`for (const pspConfig of candidates) {
  try {
    const result = await adapter.initiateDeposit(ctx, pspConfig)
    await stateMachine.transition(tx.id, 'PROCESSING', { pspConfigId: pspConfig.id })
    return result
  } catch (err) {
    await transactionEvents.log(tx.id, 'cascade_attempt_failed', { pspName: pspConfig.psp_name, err })
    continue  // try next candidate
  }
}
// all candidates failed
await stateMachine.transition(tx.id, 'FAILED')
throw new OrchestratorError('PSP_ALL_FAILED')`}</pre>
        </div>
      </DocSection>
      </div>

      {/* ── Section 4: Internal interface ────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="4" title={ua ? 'Внутрішній інтерфейс' : 'Internal Interface'}>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {ua
            ? 'Orchestrator не є HTTP-сервісом. Він викликається напряму з Router як TypeScript-модуль. Методи нижче -- публічний контракт модуля.'
            : 'The Orchestrator is not an HTTP service. It is called directly from the Router as a TypeScript module. The methods below are the module\'s public contract.'
          }
        </p>
        <div className="flex flex-col gap-3">
          {METHODS.map((m, i) => (
            <div key={i} className="border border-border rounded-2xl overflow-hidden">
              <div className="px-4 py-3 bg-muted border-b border-border">
                <code className="text-xs font-mono text-foreground break-all">{m.signature}</code>
              </div>
              <div className="px-4 py-3 bg-card divide-y divide-border">
                <p className="text-sm text-muted-foreground pb-3 leading-relaxed">{m.desc[lang]}</p>
                <div className="pt-3 flex items-start gap-2">
                  <span className="text-xs font-semibold text-muted-foreground shrink-0 mt-0.5">
                    {ua ? 'Повертає:' : 'Returns:'}
                  </span>
                  <code className="text-xs font-mono text-foreground leading-relaxed">{m.returns[lang]}</code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DocSection>
      </div>

      {/* ── Section 5: Error codes ───────────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="5" title={ua ? 'Коди помилок' : 'Error Codes'}>
        <DocTable>
          <DocTableHeader>
            <TableRow>
              <TableHead>{ua ? 'Код' : 'Code'}</TableHead>
              <TableHead>{ua ? 'HTTP' : 'HTTP'}</TableHead>
              <TableHead>{ua ? 'Коли виникає' : 'When'}</TableHead>
            </TableRow>
          </DocTableHeader>
          <TableBody>
            {[
              { code: 'PSP_NOT_AVAILABLE',  status: 503, when: { en: 'No active PSP found for brand + geo + method combination',            ua: 'Немає активного PSP для комбінації brand + geo + method'             } },
              { code: 'PSP_ALL_FAILED',     status: 502, when: { en: 'All cascade candidates exhausted without a successful response',       ua: 'Всі кандидати каскаду вичерпано без успішної відповіді'              } },
              { code: 'ADAPTER_TIMEOUT',    status: 504, when: { en: 'PSP adapter did not respond within the configured timeout (default 30s)', ua: 'PSP адаптер не відповів в межах таймауту (за замовч. 30 сек)'      } },
              { code: 'ADAPTER_ERROR',      status: 502, when: { en: 'Adapter returned an error response that is not retryable',             ua: 'Адаптер повернув помилку що не підлягає повторній спробі'            } },
              { code: 'STATE_WRITE_FAILED', status: 500, when: { en: 'Failed to persist transaction or state transition to DB',              ua: 'Не вдалось зберегти транзакцію або перехід стану в БД'               } },
            ].map((r, i) => (
              <TableRow key={i}>
                <TableCell><code className="text-xs font-mono text-foreground">{r.code}</code></TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn(
                    'text-xs font-mono pointer-events-none',
                    r.status >= 500 ? 'bg-destructive-bg text-destructive border-destructive/30' : 'bg-amber-500/10 text-amber-500 border-amber-500/30',
                  )}>{r.status}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.when[lang]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DocTable>
      </DocSection>
      </div>

    </DocLayout>
  )
}
