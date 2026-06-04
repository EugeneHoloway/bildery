'use client'

import { useState } from 'react'
import {
  Link2, Info, AlertTriangle, CheckCircle2, XCircle, ChevronDown,
  ArrowRight, SkipForward, Ban, RefreshCw, Clock,
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

// Failure types and how cascade reacts
interface FailureType {
  name: I18n
  examples: I18n
  retryable: boolean
  cascadeTo: I18n
  logLevel: 'warn' | 'error'
}

const FAILURE_TYPES: FailureType[] = [
  {
    name:      { en: 'Network / timeout',         ua: 'Мережева помилка / timeout'    },
    examples:  { en: 'Connection refused, read timeout, DNS failure',                  ua: 'Connection refused, read timeout, DNS failure'              },
    retryable: true,
    cascadeTo: { en: 'Next candidate in list',    ua: 'Наступний кандидат у списку'   },
    logLevel:  'warn',
  },
  {
    name:      { en: 'PSP soft rejection',        ua: 'Мʼяка відмова PSP'             },
    examples:  { en: 'Limit exceeded, method unavailable, currency mismatch',          ua: 'Перевищено ліміт, метод недоступний, невідповідність валюти' },
    retryable: true,
    cascadeTo: { en: 'Next candidate in list',    ua: 'Наступний кандидат у списку'   },
    logLevel:  'warn',
  },
  {
    name:      { en: 'PSP hard rejection',        ua: 'Жорстка відмова PSP'           },
    examples:  { en: 'Fraud block, KYC required, account suspended',                  ua: 'Блокування фроду, потрібен KYC, акаунт призупинено'         },
    retryable: false,
    cascadeTo: { en: 'Stop cascade, return FAILED', ua: 'Зупинити каскад, повернути FAILED' },
    logLevel:  'error',
  },
  {
    name:      { en: 'Adapter internal error',    ua: 'Внутрішня помилка адаптера'    },
    examples:  { en: 'Unexpected response format, missing required field in PSP response', ua: 'Неочікуваний формат відповіді, відсутнє обовʼязкове поле у відповіді PSP' },
    retryable: true,
    cascadeTo: { en: 'Next candidate in list',    ua: 'Наступний кандидат у списку'   },
    logLevel:  'error',
  },
]

// Step-by-step cascade algorithm
interface AlgorithmStep {
  title: I18n
  desc: I18n
  code?: string
  type?: 'normal' | 'branch-success' | 'branch-fail' | 'terminal-success' | 'terminal-fail'
}

const ALGORITHM: AlgorithmStep[] = [
  {
    title: { en: 'Receive ordered candidate list from Orchestrator', ua: 'Отримати впорядкований список кандидатів від Orchestrator' },
    desc:  { en: 'List is already filtered by brand, geo, direction, method and sorted by priority ASC. Cascade iterates it left to right.', ua: 'Список вже відфільтрований за brand, geo, direction, method і відсортований за priority ASC. Каскад ітерує зліва направо.' },
    type:  'normal',
  },
  {
    title: { en: 'Pick first candidate (attempt #1)', ua: 'Взяти першого кандидата (спроба №1)' },
    desc:  { en: 'Write psp_config_id to the transaction record. Log a cascade_attempt event to transaction_events.', ua: 'Записати psp_config_id у запис транзакції. Залогувати подію cascade_attempt у transaction_events.' },
    type:  'normal',
  },
  {
    title: { en: 'Call adapter.initiateDeposit()', ua: 'Викликати adapter.initiateDeposit()' },
    desc:  { en: 'Synchronous call with configured timeout (default: 30 s). Cascade wraps the call in try/catch.', ua: 'Синхронний виклик з налаштованим таймаутом (за замовч.: 30 с). Каскад обгортає виклик у try/catch.' },
    type:  'normal',
  },
  {
    title: { en: 'Success path', ua: 'Шлях успіху' },
    desc:  { en: 'Adapter returns UnifiedResponse. State machine transitions to PROCESSING. Cascade returns result immediately -- no further candidates tried.', ua: 'Адаптер повертає UnifiedResponse. State machine переходить до PROCESSING. Каскад відразу повертає результат -- більше жодних кандидатів.' },
    type:  'branch-success',
  },
  {
    title: { en: 'Failure path -- classify error', ua: 'Шлях помилки -- класифікувати помилку' },
    desc:  { en: 'Determine if the error is retryable (network, soft rejection, adapter error) or not (hard rejection). Log to transaction_events with full error detail.', ua: 'Визначити чи помилка підлягає повторній спробі (мережа, мʼяка відмова, помилка адаптера) чи ні (жорстка відмова). Залогувати у transaction_events з повною деталлю помилки.' },
    type:  'branch-fail',
  },
  {
    title: { en: 'Hard rejection -- stop immediately', ua: 'Жорстка відмова -- зупинитись одразу' },
    desc:  { en: 'Do not try remaining candidates. Transition transaction to FAILED. Return error code CASCADE_HARD_REJECTION.', ua: 'Не пробувати інших кандидатів. Перевести транзакцію до FAILED. Повернути код помилки CASCADE_HARD_REJECTION.' },
    type:  'terminal-fail',
  },
  {
    title: { en: 'Retryable error -- advance to next candidate', ua: 'Помилка з повторною спробою -- перейти до наступного кандидата' },
    desc:  { en: 'Remove failed PSP from candidate list. If candidates remain and attempt count < MAX_ATTEMPTS (3) -- go back to step 2 with next candidate.', ua: 'Видалити невдалий PSP зі списку кандидатів. Якщо кандидати залишились і кількість спроб < MAX_ATTEMPTS (3) -- повернутись до кроку 2 з наступним кандидатом.' },
    type:  'normal',
  },
  {
    title: { en: 'All candidates exhausted', ua: 'Всі кандидати вичерпано' },
    desc:  { en: 'No more PSPs to try or MAX_ATTEMPTS reached. Transition transaction to FAILED. Return error code CASCADE_ALL_FAILED.', ua: 'Немає більше PSP або досягнуто MAX_ATTEMPTS. Перевести транзакцію до FAILED. Повернути код помилки CASCADE_ALL_FAILED.' },
    type:  'terminal-fail',
  },
]

// Events logged to transaction_events during cascade
const CASCADE_EVENTS: { event: string; when: I18n; payload: I18n }[] = [
  {
    event:   'cascade_attempt',
    when:    { en: 'Before each adapter call',          ua: 'Перед кожним викликом адаптера'     },
    payload: { en: '{ psp_name, attempt_number, candidate_count }', ua: '{ psp_name, attempt_number, candidate_count }' },
  },
  {
    event:   'cascade_attempt_failed',
    when:    { en: 'After a retryable failure',         ua: 'Після помилки з повторною спробою'  },
    payload: { en: '{ psp_name, error_type, error_message, duration_ms }', ua: '{ psp_name, error_type, error_message, duration_ms }' },
  },
  {
    event:   'cascade_hard_stop',
    when:    { en: 'On hard rejection',                 ua: 'При жорсткій відмові'               },
    payload: { en: '{ psp_name, error_code, psp_raw_response }', ua: '{ psp_name, error_code, psp_raw_response }' },
  },
  {
    event:   'cascade_success',
    when:    { en: 'After successful adapter call',     ua: 'Після успішного виклику адаптера'   },
    payload: { en: '{ psp_name, attempt_number, duration_ms }', ua: '{ psp_name, attempt_number, duration_ms }' },
  },
  {
    event:   'cascade_all_failed',
    when:    { en: 'When all candidates exhausted',     ua: 'Коли всі кандидати вичерпано'       },
    payload: { en: '{ attempts: [{ psp_name, error }], total_duration_ms }', ua: '{ attempts: [{ psp_name, error }], total_duration_ms }' },
  },
]

// Visual cascade example: PSP1 fail → PSP2 fail → PSP3 success
const CASCADE_EXAMPLE = [
  { psp: 'PSP #1 (priority 1)', status: 'fail',    reason: { en: 'Timeout after 30 s',   ua: 'Timeout після 30 с'     }, attempt: 1 },
  { psp: 'PSP #2 (priority 2)', status: 'fail',    reason: { en: 'Soft rejection: limit', ua: 'Мʼяка відмова: ліміт'  }, attempt: 2 },
  { psp: 'PSP #3 (priority 3)', status: 'success', reason: { en: 'Invoice created',       ua: 'Інвойс створено'        }, attempt: 3 },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const [lang, setLang] = useState<Lang>('en')
  const ua = lang === 'ua'

  return (
    <DocLayout
      title="Cascade Manager"
      breadcrumbLabel="Payment Infrastructure"
      breadcrumbHref="/sandbox/payment-infra"
      parentCrumb={{ label: 'Sandbox', href: '/sandbox' }}
      description={ua
        ? 'Failover логіка між PSP. Перебирає кандидатів за пріоритетом до першого успіху.'
        : 'Failover logic across PSPs. Iterates candidates by priority until first success.'}
      tags={[
        { label: 'Phase 2', type: 'tag'    },
        { label: 'Spec',    type: 'status' },
      ]}
      titleExtra={<LangSwitcher lang={lang} onChange={setLang} />}
      footnote="DEPO44 | CASCADE MANAGER SPEC v1 | PHASE 2"
    >

      {/* ── Intro ─────────────────────────────────────────────────────────── */}
      <InfoCard>
        {ua
          ? <>Cascade Manager -- підкомпонент Orchestrator. Orchestrator будує список кандидатів і передає його в Cascade Manager. Cascade Manager повністю відповідає за логіку <strong>перебору та fallover</strong>: він не знає нічого про routing rules або базу даних PSP. Його єдина відповідальність -- <strong>спробувати кожного кандидата по черзі</strong> та зупинитись при першому успіху або при вичерпанні списку.</>
          : <>Cascade Manager is a sub-component of the Orchestrator. The Orchestrator builds the candidate list and passes it to the Cascade Manager. The Cascade Manager owns all <strong>iteration and failover logic</strong>: it knows nothing about routing rules or the PSP database. Its sole responsibility is to <strong>try each candidate in turn</strong> and stop at the first success or when the list is exhausted.</>
        }
      </InfoCard>

      <WarnCard>
        {ua
          ? <><strong>MAX_ATTEMPTS = 3</strong>. Навіть якщо в списку більше 3 кандидатів, каскад зупиняється після 3 спроб. Це обмеження запобігає надмірним затримкам для користувача при масових збоях PSP. Значення налаштовується через змінну середовища <code className="text-xs bg-muted rounded px-1.5 py-0.5">CASCADE_MAX_ATTEMPTS</code>.</>
          : <><strong>MAX_ATTEMPTS = 3</strong>. Even if there are more than 3 candidates in the list, the cascade stops after 3 attempts. This limit prevents excessive user-facing latency during widespread PSP outages. Configurable via the <code className="text-xs bg-muted rounded px-1.5 py-0.5">CASCADE_MAX_ATTEMPTS</code> environment variable.</>
        }
      </WarnCard>

      {/* ── Section 1: Visual example ─────────────────────────────────────── */}
      <DocSection num="1" title={ua ? 'Приклад каскаду' : 'Cascade Example'}>
        <p className="text-sm text-muted-foreground mb-4">
          {ua
            ? 'PSP #1 та PSP #2 недоступні. Каскад автоматично переходить до PSP #3, який успішно обробляє запит.'
            : 'PSP #1 and PSP #2 are unavailable. Cascade automatically falls over to PSP #3, which processes the request successfully.'
          }
        </p>
        <div className="flex flex-col gap-0">
          {CASCADE_EXAMPLE.map((step, i) => (
            <div key={i} className="flex flex-col items-start">
              <div className={cn(
                'w-full border rounded-2xl p-4 flex items-center gap-3',
                step.status === 'success'
                  ? 'border-success/30 bg-success-bg/30'
                  : 'border-destructive/20 bg-destructive-bg/30',
              )}>
                <div className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold',
                  step.status === 'success' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive',
                )}>
                  {step.attempt}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{step.psp}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.reason[lang]}</p>
                </div>
                {step.status === 'success'
                  ? <CheckCircle2 className="size-4 shrink-0 text-success" />
                  : <XCircle     className="size-4 shrink-0 text-destructive" />
                }
                <Badge variant="outline" className={cn(
                  'text-xs pointer-events-none shrink-0',
                  step.status === 'success'
                    ? 'bg-success-bg text-success border-success/30'
                    : 'bg-destructive-bg text-destructive border-destructive/30',
                )}>
                  {step.status === 'success' ? (ua ? 'Успіх' : 'Success') : (ua ? 'Невдача' : 'Failed')}
                </Badge>
              </div>
              {i < CASCADE_EXAMPLE.length - 1 && (
                <div className="pl-5 py-1">
                  <ChevronDown className="size-3.5 text-muted-foreground/40" />
                </div>
              )}
            </div>
          ))}
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-muted px-3 py-2.5">
            <Info className="size-3.5 shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground leading-snug">
              {ua
                ? 'Загальна затримка = sum(timeout кожного PSP що не відповів) + час успішного PSP. В прикладі: ~60 с + ~1 с. Тому важливо мати короткий timeout на рівні адаптера.'
                : 'Total latency = sum(timeout of each unresponsive PSP) + successful PSP time. In the example: ~60 s + ~1 s. This is why a short adapter-level timeout is critical.'
              }
            </p>
          </div>
        </div>
      </DocSection>

      {/* ── Section 2: Algorithm ──────────────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="2" title={ua ? 'Алгоритм' : 'Algorithm'}>
        <div className="flex flex-col gap-2">
          {ALGORITHM.map((step, i) => {
            const isBranchSuccess  = step.type === 'branch-success'
            const isBranchFail     = step.type === 'branch-fail'
            const isTerminalSuccess = step.type === 'terminal-success'
            const isTerminalFail   = step.type === 'terminal-fail'

            return (
              <div key={i} className="flex flex-col items-start">
                <div className={cn(
                  'w-full border rounded-2xl p-4 flex items-start gap-3',
                  isBranchSuccess  || isTerminalSuccess ? 'border-success/30 bg-success-bg/30' : '',
                  isBranchFail                          ? 'border-amber-500/30 bg-amber-500/5' : '',
                  isTerminalFail                        ? 'border-destructive/20 bg-destructive-bg/30' : '',
                  !isBranchSuccess && !isBranchFail && !isTerminalSuccess && !isTerminalFail ? 'border-border bg-card' : '',
                )}>
                  <div className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold tabular-nums mt-0.5',
                    isBranchSuccess || isTerminalSuccess ? 'bg-success/10 text-success' : '',
                    isBranchFail                        ? 'bg-amber-500/10 text-amber-500' : '',
                    isTerminalFail                      ? 'bg-destructive/10 text-destructive' : '',
                    !isBranchSuccess && !isBranchFail && !isTerminalSuccess && !isTerminalFail ? 'bg-muted text-muted-foreground' : '',
                  )}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className={cn(
                        'text-sm font-semibold',
                        isBranchSuccess || isTerminalSuccess ? 'text-success' : '',
                        isTerminalFail                       ? 'text-destructive' : '',
                        isBranchFail                         ? 'text-amber-500' : '',
                        !isBranchSuccess && !isBranchFail && !isTerminalSuccess && !isTerminalFail ? 'text-foreground' : '',
                      )}>
                        {step.title[lang]}
                      </p>
                      {isBranchSuccess  && <Badge variant="outline" className="text-xs bg-success-bg text-success border-success/30 pointer-events-none">{ua ? 'Успіх' : 'Success'}</Badge>}
                      {isBranchFail     && <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/30 pointer-events-none">{ua ? 'Помилка' : 'Failure'}</Badge>}
                      {isTerminalFail   && <Badge variant="outline" className="text-xs bg-destructive-bg text-destructive border-destructive/30 pointer-events-none">{ua ? 'Кінець' : 'Terminal'}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug">{step.desc[lang]}</p>
                    {step.code && (
                      <pre className="mt-2 text-xs font-mono text-muted-foreground bg-muted rounded-xl px-3 py-2.5 overflow-x-auto leading-relaxed">
                        {step.code}
                      </pre>
                    )}
                  </div>
                </div>
                {i < ALGORITHM.length - 1 && (
                  <div className="pl-5 py-1">
                    <ChevronDown className="size-3.5 text-muted-foreground/40" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </DocSection>
      </div>

      {/* ── Section 3: Business rules ─────────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="3" title={ua ? 'Правила каскадингу' : 'Cascade Rules'}>
        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
          {ua
            ? 'При кожній помилці Cascade Manager відповідає на два питання: чи допоможе інший PSP? чи безпечно пробувати далі? Якщо обидва "так" -- продовжуємо. Якщо хоча б одне "ні" -- hard stop.'
            : 'On every failure the Cascade Manager answers two questions: will another PSP help? is it safe to try further? If both are "yes" -- continue. If either is "no" -- hard stop.'
          }
        </p>

        {/* Continue */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <SkipForward className="size-3.5 text-success" />
            <p className="text-xs font-bold uppercase tracking-wide text-success">
              {ua ? 'Continue cascade -- пробуємо наступного PSP' : 'Continue cascade -- try next PSP'}
            </p>
          </div>
          <div className="border border-success/20 rounded-2xl overflow-hidden">
            <DocTable>
              <DocTableHeader>
                <TableRow>
                  <TableHead>{ua ? 'Ситуація' : 'Situation'}</TableHead>
                  <TableHead>{ua ? 'Чому continue' : 'Why continue'}</TableHead>
                </TableRow>
              </DocTableHeader>
              <TableBody>
                {([
                  { s: { en: 'Network error / timeout',                   ua: 'Мережева помилка / timeout'                    }, w: { en: 'Infrastructure failure of this specific PSP -- another may be alive',                                   ua: 'Інфраструктурний збій конкретного PSP -- інший може бути живий'                                 } },
                  { s: { en: 'PSP scheduled maintenance',                  ua: 'Технічне обслуговування PSP'                   }, w: { en: 'Temporary unavailability -- next PSP unaffected',                                                        ua: 'Тимчасова недоступність -- наступний PSP не зачеплено'                                          } },
                  { s: { en: 'Our merchant rate limit at this PSP',        ua: 'Наш ліміт запитів у цього PSP'                 }, w: { en: 'Quota exhausted on our merchant account -- next PSP has its own independent quota',                         ua: 'Вичерпано квоту нашого merchant-акаунту -- у наступного PSP своя незалежна квота'               } },
                  { s: { en: 'Method not supported by this PSP',           ua: 'Метод не підтримується цим PSP'                }, w: { en: 'PSP-level gap -- another PSP may support the same method',                                               ua: 'Прогалина на рівні PSP -- інший PSP може підтримувати той самий метод'                          } },
                  { s: { en: 'Amount outside this PSP\'s limits',          ua: 'Сума поза лімітами цього PSP'                  }, w: { en: 'PSP-specific limit -- next PSP may have different min/max',                                              ua: 'Ліміт конкретного PSP -- у наступного PSP можуть бути інші min/max'                             } },
                  { s: { en: 'PSP temporarily does not support currency',  ua: 'PSP тимчасово не підтримує валюту'             }, w: { en: 'Temporary or config issue on this PSP -- next PSP may accept',                                            ua: 'Тимчасова або конфігураційна проблема на цьому PSP -- наступний може прийняти'                  } },
                  { s: { en: 'Unexpected / unparseable PSP response',      ua: 'Неочікувана / нерозбірлива відповідь PSP'      }, w: { en: 'Bug in adapter or non-standard response -- different adapter, different code path',                         ua: 'Баг в адаптері або нестандартна відповідь -- інший адаптер, інший шлях виконання'               } },
                  { s: { en: 'User not registered in this PSP',            ua: 'Користувач не зареєстрований у цьому PSP'      }, w: { en: 'Some PSPs require pre-registration -- next PSP may not have this requirement',                             ua: 'Деякі PSP вимагають попередню реєстрацію -- у наступного PSP цієї вимоги може не бути'          } },
                ] as { s: I18n; w: I18n }[]).map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-sm text-foreground">{r.s[lang]}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.w[lang]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </DocTable>
          </div>
        </div>

        {/* Hard stop */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Ban className="size-3.5 text-destructive" />
            <p className="text-xs font-bold uppercase tracking-wide text-destructive">
              {ua ? 'Hard stop -- каскад зупиняємо' : 'Hard stop -- stop cascade'}
            </p>
          </div>
          <div className="border border-destructive/20 rounded-2xl overflow-hidden">
            <DocTable>
              <DocTableHeader>
                <TableRow>
                  <TableHead>{ua ? 'Ситуація' : 'Situation'}</TableHead>
                  <TableHead>{ua ? 'Чому stop' : 'Why stop'}</TableHead>
                </TableRow>
              </DocTableHeader>
              <TableBody>
                {([
                  { s: { en: 'Fraud block (confirmed)',         ua: 'Fraud block (підтверджений)'       }, w: { en: 'Cascading past a fraud block bypasses fraud controls -- legal and chargeback risk. Hard stop always.', ua: 'Продовження після fraud block обходить fraud-контроль -- юридичний ризик та ризик чарджбеків. Завжди hard stop.' } },
                  { s: { en: 'KYC required',                   ua: 'Потрібен KYC'                      }, w: { en: 'User must complete identity verification before any PSP will accept them -- not a PSP issue',             ua: 'Користувач повинен пройти верифікацію перш ніж будь-який PSP прийме -- не проблема PSP'         } },
                  { s: { en: 'Duplicate transaction',          ua: 'Дублікат транзакції'               }, w: { en: 'Trying next PSP creates another duplicate -- makes the situation worse',                                   ua: 'Спроба наступного PSP створить ще один дублікат -- ситуація погіршиться'                         } },
                  { s: { en: 'User account blocked at platform level', ua: 'Акаунт заблоковано на рівні платформи' }, w: { en: 'Platform-level block -- not a PSP problem, cascading will not help', ua: 'Блок на рівні платформи -- не проблема PSP, каскад не допоможе'                                  } },
                  { s: { en: 'Invalid wallet address (withdrawal)',    ua: 'Невалідна адреса гаманця (виведення)' }, w: { en: 'Malformed address -- every PSP will reject for the same reason',                                    ua: 'Невалідна адреса -- кожен PSP відхилить з тієї ж причини'                                       } },
                  { s: { en: 'Regulatory geo-block',           ua: 'Регуляторний гео-блок'             }, w: { en: 'Country is legally restricted -- no licensed PSP can process it',                                         ua: 'Країна юридично заборонена -- жоден ліцензований PSP не може обробити'                           } },
                  { s: { en: 'Amount exceeds limits of ALL active PSPs', ua: 'Сума перевищує ліміти ВСІХ активних PSP' }, w: { en: 'Can be detected in Router before cascade starts -- if amount > max of every candidate, no point trying', ua: 'Можна визначити у Router до старту каскаду -- якщо amount > max всіх кандидатів, немає сенсу пробувати' } },
                ] as { s: I18n; w: I18n }[]).map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-sm text-foreground">{r.s[lang]}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.w[lang]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </DocTable>
          </div>
        </div>

        {/* Grey zones */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="size-3.5 text-amber-500" />
            <p className="text-xs font-bold uppercase tracking-wide text-amber-500">
              {ua ? 'Сірі зони -- потрібне явне рішення оператора' : 'Grey zones -- require explicit operator decision'}
            </p>
          </div>
          <div className="border border-amber-500/20 rounded-2xl overflow-hidden">
            <DocTable>
              <DocTableHeader>
                <TableRow>
                  <TableHead>{ua ? 'Ситуація' : 'Situation'}</TableHead>
                  <TableHead>{ua ? 'Проблема' : 'Problem'}</TableHead>
                  <TableHead>{ua ? 'Рішення' : 'Decision needed'}</TableHead>
                </TableRow>
              </DocTableHeader>
              <TableBody>
                {([
                  {
                    s: { en: '"Insufficient funds" from PSP',        ua: '"Insufficient funds" від PSP'         },
                    p: { en: 'Could be PSP liquidity issue (continue) or player actually has no funds (stop)',  ua: 'Може бути проблема ліквідності PSP (continue) або гравець справді не має коштів (stop)' },
                    d: { en: 'Clarify with PassimPay which error code maps to which cause',                     ua: 'Уточнити з PassimPay який error code відповідає якій причині' },
                  },
                  {
                    s: { en: '"Fraud suspected" (soft signal)',       ua: '"Fraud suspected" (мʼякий сигнал)'   },
                    p: { en: 'PSPs vary: some return soft "suspicious" vs hard "confirmed fraud". Soft may be worth cascading.', ua: 'PSP різняться: одні повертають мʼяке "підозріло" vs жорстке "підтверджений фрод". При мʼякому можна каскадувати.' },
                    d: { en: 'Agree with PassimPay on exact error codes for soft vs hard fraud signals',        ua: 'Узгодити з PassimPay точні коди для мʼякого та жорсткого fraud-сигналу' },
                  },
                  {
                    s: { en: 'User deposit limit exceeded',          ua: 'Перевищено ліміт депозиту користувача' },
                    p: { en: '"Limit exceeded" can mean player\'s personal PSP limit (stop) OR our merchant quota at that PSP (continue)', ua: '"Limit exceeded" може означати персональний ліміт гравця у PSP (stop) АБО нашу merchant-квоту (continue)' },
                    d: { en: 'PSP must return distinct error codes for player limit vs merchant limit',          ua: 'PSP повинен повертати різні коди для ліміту гравця vs merchant-ліміту' },
                  },
                  {
                    s: { en: 'Method temporarily disabled by PSP',   ua: 'Метод тимчасово вимкнений PSP'        },
                    p: { en: 'Temporary PSP config (continue to next PSP) vs regulatory suspension (stop for all)', ua: 'Тимчасова конфігурація PSP (continue) vs регуляторне призупинення (stop для всіх)' },
                    d: { en: 'Track known regulatory suspensions in psp_configs.is_active -- keep PSP disabled until resolved', ua: 'Відстежувати регуляторні призупинення через psp_configs.is_active -- тримати PSP вимкненим до вирішення' },
                  },
                ] as { s: I18n; p: I18n; d: I18n }[]).map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-sm text-foreground">{r.s[lang]}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.p[lang]}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.d[lang]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </DocTable>
          </div>
        </div>

        {/* CascadeDecision pattern */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {ua ? 'Реалізація: рішення на рівні адаптера' : 'Implementation: decision at adapter level'}
          </p>
          <div className="flex items-start gap-2 rounded-xl bg-muted px-3 py-2.5 mb-3">
            <Info className="size-3.5 shrink-0 mt-0.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground leading-snug">
              {ua
                ? 'Cascade Manager не інтерпретує PSP-специфічні коди помилок -- це зона адаптера. Кожен адаптер повертає поле cascade разом з помилкою. Cascade Manager дивиться тільки на нього.'
                : 'Cascade Manager does not interpret PSP-specific error codes -- that is the adapter\'s responsibility. Each adapter returns a cascade field alongside the error. Cascade Manager only looks at that field.'
              }
            </p>
          </div>
          <pre className="text-xs font-mono text-muted-foreground bg-muted rounded-xl px-4 py-3 overflow-x-auto leading-relaxed">{`type CascadeDecision = 'continue' | 'hard_stop'

interface AdapterError {
  code:     string            // PSP-specific error code
  message:  string
  cascade:  CascadeDecision   // adapter decides, not Cascade Manager
  pspRaw?:  unknown           // raw PSP response for logs
}

// Example: PassimPay adapter maps its error codes
function mapPassimPayError(pspCode: string): CascadeDecision {
  const HARD_STOPS = ['FRAUD_CONFIRMED', 'KYC_REQUIRED', 'DUPLICATE_TX', 'USER_BLOCKED']
  return HARD_STOPS.includes(pspCode) ? 'hard_stop' : 'continue'
}`}</pre>
        </div>
      </DocSection>
      </div>

      {/* ── Section 4: Failure types ──────────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="4" title={ua ? 'Типи помилок та реакція' : 'Failure Types & Response'}>
        <DocTable>
          <DocTableHeader>
            <TableRow>
              <TableHead>{ua ? 'Тип помилки' : 'Failure type'}</TableHead>
              <TableHead>{ua ? 'Приклади' : 'Examples'}</TableHead>
              <TableHead>{ua ? 'Retryable?' : 'Retryable?'}</TableHead>
              <TableHead>{ua ? 'Каскад' : 'Cascade action'}</TableHead>
              <TableHead>{ua ? 'Лог' : 'Log'}</TableHead>
            </TableRow>
          </DocTableHeader>
          <TableBody>
            {FAILURE_TYPES.map((f, i) => (
              <TableRow key={i}>
                <TableCell className="text-sm font-medium text-foreground">{f.name[lang]}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{f.examples[lang]}</TableCell>
                <TableCell>
                  {f.retryable
                    ? <Badge variant="outline" className="text-xs bg-success-bg text-success border-success/30 pointer-events-none">{ua ? 'Так' : 'Yes'}</Badge>
                    : <Badge variant="outline" className="text-xs bg-destructive-bg text-destructive border-destructive/30 pointer-events-none">{ua ? 'Ні' : 'No'}</Badge>
                  }
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{f.cascadeTo[lang]}</TableCell>
                <TableCell>
                  <span className={cn('text-xs font-semibold', f.logLevel === 'error' ? 'text-destructive' : 'text-amber-500')}>
                    {f.logLevel}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DocTable>
      </DocSection>
      </div>

      {/* ── Section 5: Event log ──────────────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="5" title={ua ? 'Події в transaction_events' : 'Events in transaction_events'}>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {ua
            ? 'Кожна дія каскаду записується в таблицю transaction_events. Це забезпечує повний аудит-трейл для відлагодження та reconciliation.'
            : 'Every cascade action is written to transaction_events. This provides a full audit trail for debugging and reconciliation.'
          }
        </p>
        <DocTable>
          <DocTableHeader>
            <TableRow>
              <TableHead>event_type</TableHead>
              <TableHead>{ua ? 'Коли' : 'When'}</TableHead>
              <TableHead>payload</TableHead>
            </TableRow>
          </DocTableHeader>
          <TableBody>
            {CASCADE_EVENTS.map((e, i) => (
              <TableRow key={i}>
                <TableCell><code className="text-xs font-mono text-foreground">{e.event}</code></TableCell>
                <TableCell className="text-sm text-muted-foreground">{e.when[lang]}</TableCell>
                <TableCell><code className="text-xs font-mono text-muted-foreground">{e.payload[lang]}</code></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DocTable>
      </DocSection>
      </div>

      {/* ── Section 5: Timeouts ───────────────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="6" title={ua ? 'Таймаути' : 'Timeouts'}>
        <div className="grid grid-cols-1 gap-3 tablet:grid-cols-3">
          {[
            {
              label:   { en: 'Per-adapter timeout',   ua: 'Таймаут на адаптер'         },
              value:   '30 s',
              env:     'ADAPTER_TIMEOUT_MS',
              desc:    { en: 'Max time to wait for a single PSP response. After this, the call is classified as a network timeout and cascade proceeds to the next candidate.', ua: 'Максимальний час очікування відповіді одного PSP. Після цього виклик класифікується як мережевий timeout і каскад переходить до наступного кандидата.' },
              colorCls: 'text-sky-500',
              bgCls:    'bg-sky-500/10',
            },
            {
              label:   { en: 'Total cascade budget',  ua: 'Загальний бюджет каскаду'   },
              value:   '90 s',
              env:     'CASCADE_TOTAL_TIMEOUT_MS',
              desc:    { en: 'Hard limit for the entire cascade (all attempts combined). If exceeded, remaining candidates are skipped and the transaction transitions to TIMED_OUT.', ua: 'Жорсткий ліміт для всього каскаду (всі спроби разом). При перевищенні -- решта кандидатів пропускається і транзакція переходить до TIMED_OUT.' },
              colorCls: 'text-amber-500',
              bgCls:    'bg-amber-500/10',
            },
            {
              label:   { en: 'Max attempts',          ua: 'Максимум спроб'              },
              value:   '3',
              env:     'CASCADE_MAX_ATTEMPTS',
              desc:    { en: 'Maximum number of PSP candidates to try per request, regardless of how many are configured. Prevents tail latency from growing unbounded with many PSPs.', ua: 'Максимальна кількість кандидатів PSP для спроби на запит, незалежно від кількості налаштованих. Запобігає необмеженому зростанню tail latency з багатьма PSP.' },
              colorCls: 'text-violet-500',
              bgCls:    'bg-violet-500/10',
            },
          ].map((t) => (
            <div key={t.env} className="border border-border rounded-2xl p-4 bg-card">
              <div className={cn('text-3xl font-bold tabular-nums mb-1', t.colorCls)}>{t.value}</div>
              <p className="text-sm font-semibold text-foreground mb-0.5">{t.label[lang]}</p>
              <code className="text-xs text-muted-foreground">{t.env}</code>
              <p className="text-xs text-muted-foreground mt-2 leading-snug">{t.desc[lang]}</p>
            </div>
          ))}
        </div>
      </DocSection>
      </div>

      {/* ── Section 6: Health score (Phase 6 preview) ────────────────────── */}
      <div className="mt-6">
      <DocSection num="7" title={ua ? 'Health Score (Фаза 6)' : 'Health Score (Phase 6)'}>
        <div className="border border-dashed border-border rounded-2xl p-5 opacity-60">
          <div className="flex items-start gap-3">
            <RefreshCw className="size-4 shrink-0 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">
                {ua ? 'Не реалізовано у Фазі 2' : 'Not implemented in Phase 2'}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {ua
                  ? 'У Фазі 6 Cascade Manager отримає доступ до поля health_score з psp_configs. Замість чистого порядку пріоритету список кандидатів буде переранжований: priority * (health_score / 100). PSP з постійними збоями автоматично опускаються нижче в каскаді без ручного втручання ops-команди.'
                  : 'In Phase 6 the Cascade Manager will gain access to the health_score field from psp_configs. Instead of pure priority ordering, the candidate list will be re-ranked: priority * (health_score / 100). PSPs with sustained failures automatically sink lower in the cascade without manual ops intervention.'
                }
              </p>
            </div>
          </div>
        </div>
      </DocSection>
      </div>

    </DocLayout>
  )
}
