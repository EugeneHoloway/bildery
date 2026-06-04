'use client'

import { useState } from 'react'
import {
  BarChart2, Info, AlertTriangle, CheckCircle2, XCircle,
  Clock, RefreshCw, AlertCircle, ChevronDown, Shield,
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

// Why reconciliation is needed
const WHY_NEEDED: { icon: React.ElementType; title: I18n; desc: I18n }[] = [
  {
    icon:  AlertCircle,
    title: { en: 'Webhooks get lost',               ua: 'Webhooks губляться'                    },
    desc:  { en: 'A PSP webhook can fail to deliver due to network issues, server restarts, or our endpoint being temporarily unavailable. Without reconciliation, a successful payment sits as TIMED_OUT forever.', ua: 'Webhook від PSP може не доставитись через мережеві проблеми, перезапуск сервера або тимчасову недоступність нашого ендпоінту. Без reconciliation успішний платіж вічно залишається в TIMED_OUT.' },
  },
  {
    icon:  Clock,
    title: { en: 'TTL fires before blockchain confirms', ua: 'TTL спрацьовує до підтвердження блокчейну' },
    desc:  { en: 'A player sends crypto just as our TTL timer fires. Our system marks the transaction TIMED_OUT while the payment is actually on its way. Reconciliation detects this and credits the balance retroactively.', ua: 'Гравець надсилає крипту саме в момент коли спрацьовує наш TTL таймер. Система позначає транзакцію TIMED_OUT поки платіж насправді в дорозі. Reconciliation це виявляє і зараховує баланс заднім числом.' },
  },
  {
    icon:  RefreshCw,
    title: { en: 'PSP status diverges from ours',    ua: 'Статус PSP розходиться з нашим'        },
    desc:  { en: 'Our state machine shows PROCESSING but the PSP has already settled the transaction as paid or rejected. This can happen after a cascade attempt where the first PSP actually processed the payment despite returning an error.', ua: 'Наша state machine показує PROCESSING а PSP вже фінально закрив транзакцію як оплачену або відхилену. Це може статись після cascade attempt де перший PSP насправді обробив платіж попри повернуту помилку.' },
  },
]

// Flow steps
const FLOW_STEPS: { title: I18n; desc: I18n; code?: string; type?: 'normal' | 'action-credit' | 'action-fail' | 'terminal' }[] = [
  {
    title: { en: 'Select candidate transactions',          ua: 'Вибрати транзакції-кандидати'              },
    desc:  { en: 'Query transactions table for rows in states that may need resolution: PROCESSING older than 30 min, TIMED_OUT within the last 48 hours, PENDING_CONFIRMATION older than 2 hours.', ua: 'Запит до таблиці transactions для рядків у станах що потребують вирішення: PROCESSING старше 30 хвилин, TIMED_OUT за останні 48 годин, PENDING_CONFIRMATION старше 2 годин.' },
    code:  `SELECT * FROM transactions
WHERE status IN ('PROCESSING', 'TIMED_OUT', 'PENDING_CONFIRMATION')
  AND updated_at < NOW() - INTERVAL '30 minutes'
  AND created_at > NOW() - INTERVAL '48 hours'`,
    type:  'normal',
  },
  {
    title: { en: 'Call getTransactionStatus() for each',  ua: 'Викликати getTransactionStatus() для кожної' },
    desc:  { en: 'For each candidate, call the adapter\'s getTransactionStatus(psp_payment_id) to get the current status directly from the PSP. Adapter returns a UnifiedStatus.', ua: 'Для кожного кандидата викликати getTransactionStatus(psp_payment_id) адаптера щоб отримати поточний статус безпосередньо від PSP. Адаптер повертає UnifiedStatus.' },
    type:  'normal',
  },
  {
    title: { en: 'Compare PSP status with our status',    ua: 'Порівняти статус PSP з нашим статусом'      },
    desc:  { en: 'If statuses match -- no action, log a reconciliation_check event. If they differ -- discrepancy detected, proceed to resolution.', ua: 'Якщо статуси збігаються -- жодних дій, залогувати подію reconciliation_check. Якщо розходяться -- виявлено розбіжність, переходимо до вирішення.' },
    type:  'normal',
  },
  {
    title: { en: 'PSP = COMPLETED, ours = TIMED_OUT / PROCESSING', ua: 'PSP = COMPLETED, у нас = TIMED_OUT / PROCESSING' },
    desc:  { en: 'Payment was successful but we missed it. Transition transaction to COMPLETED via state machine, credit player balance via Wallet Engine. Log reconciliation_credit event.', ua: 'Платіж був успішним але ми його пропустили. Перевести транзакцію до COMPLETED через state machine, зарахувати баланс гравця через Wallet Engine. Залогувати подію reconciliation_credit.' },
    type:  'action-credit',
  },
  {
    title: { en: 'PSP = FAILED / EXPIRED, ours = PROCESSING / TIMED_OUT', ua: 'PSP = FAILED / EXPIRED, у нас = PROCESSING / TIMED_OUT' },
    desc:  { en: 'Payment definitively failed. Transition transaction to FAILED. No balance change. Log reconciliation_failed event. If a withdrawal hold was active -- release it back to available.', ua: 'Платіж остаточно невдалий. Перевести транзакцію до FAILED. Без змін балансу. Залогувати подію reconciliation_failed. Якщо було активне hold виведення -- повернути до available.' },
    type:  'action-fail',
  },
  {
    title: { en: 'PSP status still pending',              ua: 'Статус PSP ще в очікуванні'                },
    desc:  { en: 'PSP also shows PROCESSING or equivalent. Leave our status unchanged. Schedule for re-check in the next reconciliation run.', ua: 'PSP також показує PROCESSING або аналог. Залишити наш статус без змін. Запланувати повторну перевірку в наступному запуску reconciliation.' },
    type:  'normal',
  },
  {
    title: { en: 'Generate reconciliation report',        ua: 'Сформувати звіт reconciliation'             },
    desc:  { en: 'After processing all candidates, write a summary to reconciliation_reports: total checked, credits applied, failures resolved, errors encountered. Alert ops team if credit count exceeds threshold.', ua: 'Після обробки всіх кандидатів записати підсумок до reconciliation_reports: перевірено, зараховано, вирішено невдач, помилок. Сповістити ops якщо кількість зарахувань перевищує поріг.' },
    type:  'terminal',
  },
]

// Discrepancy types
const DISCREPANCIES: { our: string; psp: I18n; action: I18n; risk: 'high' | 'medium' | 'low' }[] = [
  {
    our:    'TIMED_OUT',
    psp:    { en: 'COMPLETED',   ua: 'COMPLETED'   },
    action: { en: 'Credit balance, transition to COMPLETED', ua: 'Зарахувати баланс, перевести до COMPLETED' },
    risk:   'high',
  },
  {
    our:    'PROCESSING',
    psp:    { en: 'COMPLETED',   ua: 'COMPLETED'   },
    action: { en: 'Credit balance, transition to COMPLETED', ua: 'Зарахувати баланс, перевести до COMPLETED' },
    risk:   'high',
  },
  {
    our:    'PROCESSING',
    psp:    { en: 'FAILED',      ua: 'FAILED'      },
    action: { en: 'Transition to FAILED, no balance change', ua: 'Перевести до FAILED, без змін балансу' },
    risk:   'medium',
  },
  {
    our:    'TIMED_OUT',
    psp:    { en: 'FAILED',      ua: 'FAILED'      },
    action: { en: 'Confirm FAILED state, log only',          ua: 'Підтвердити стан FAILED, лише лог'       },
    risk:   'low',
  },
  {
    our:    'COMPLETED',
    psp:    { en: 'FAILED',      ua: 'FAILED'      },
    action: { en: 'Critical alert to ops -- do not auto-resolve, manual review required', ua: 'Критичне сповіщення ops -- не вирішувати автоматично, потрібен ручний огляд' },
    risk:   'high',
  },
  {
    our:    'PROCESSING',
    psp:    { en: 'Not found',   ua: 'Не знайдено' },
    action: { en: 'Alert ops -- psp_payment_id mismatch or PSP data loss', ua: 'Сповістити ops -- невідповідність psp_payment_id або втрата даних PSP' },
    risk:   'high',
  },
]

const riskStyle = {
  high:   { label: { en: 'High',   ua: 'Високий'   }, cls: 'bg-destructive-bg text-destructive border-destructive/30' },
  medium: { label: { en: 'Medium', ua: 'Середній'  }, cls: 'bg-amber-500/10 text-amber-500 border-amber-500/30'       },
  low:    { label: { en: 'Low',    ua: 'Низький'   }, cls: 'bg-muted text-muted-foreground border-border'             },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const [lang, setLang] = useState<Lang>('en')
  const ua = lang === 'ua'

  return (
    <DocLayout
      title="Reconciliation"
      breadcrumbLabel="Payment Infrastructure"
      breadcrumbHref="/sandbox/payment-infra"
      parentCrumb={{ label: 'Sandbox', href: '/sandbox' }}
      description={ua
        ? 'Нічна синхронізація з PSP. Виявляє та виправляє розбіжності між нашими даними та даними PSP.'
        : 'Nightly PSP sync. Detects and resolves discrepancies between our records and PSP data.'}
      tags={[
        { label: 'Phase 2', type: 'tag'    },
        { label: 'Spec',    type: 'status' },
      ]}
      titleExtra={<LangSwitcher lang={lang} onChange={setLang} />}
      footnote="DEPO44 | RECONCILIATION SPEC v1 | PHASE 2"
    >

      {/* ── Intro ─────────────────────────────────────────────────────────── */}
      <InfoCard>
        {ua
          ? <>Reconciliation -- це фоновий job який запускається щоночі і порівнює наші записи транзакцій з актуальними статусами від PSP. Він існує для одного: <strong>знайти платежі які ми пропустили або неправильно записали</strong> -- і виправити їх до того як гравець напише в підтримку. Для продакта це safety net. Для розробника -- cron job що викликає getTransactionStatus() для підозрілих транзакцій.</>
          : <>Reconciliation is a background job that runs every night and compares our transaction records with current statuses from the PSP. It exists for one reason: <strong>find payments we missed or misrecorded</strong> -- and fix them before the player contacts support. For a product manager it is a safety net. For a developer -- a cron job that calls getTransactionStatus() on suspicious transactions.</>
        }
      </InfoCard>

      <WarnCard>
        {ua
          ? <>Reconciliation <strong>не замінює webhook handling</strong>. Webhooks залишаються основним механізмом -- reconciliation лише підхоплює те що випало. Якщо reconciliation регулярно знаходить багато розбіжностей, це сигнал що webhook delivery зламаний і треба виправляти в першу чергу.</>
          : <>Reconciliation <strong>does not replace webhook handling</strong>. Webhooks remain the primary mechanism -- reconciliation only catches what fell through. If reconciliation regularly finds many discrepancies, that is a signal that webhook delivery is broken and should be fixed first.</>
        }
      </WarnCard>

      {/* ── Section 1: Why it's needed ───────────────────────────────────── */}
      <DocSection num="1" title={ua ? 'Навіщо це потрібно' : 'Why It Is Needed'}>
        <div className="flex flex-col gap-3">
          {WHY_NEEDED.map((item, i) => (
            <div key={i} className="border border-border rounded-2xl p-4 bg-card flex items-start gap-3">
              <item.icon className="size-4 shrink-0 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">{item.title[lang]}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc[lang]}</p>
              </div>
            </div>
          ))}
        </div>
      </DocSection>

      {/* ── Section 2: Schedule ───────────────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="2" title={ua ? 'Розклад та налаштування' : 'Schedule & Configuration'}>
        <div className="grid grid-cols-1 gap-3 tablet:grid-cols-3">
          {[
            {
              label: { en: 'Primary run',        ua: 'Основний запуск'        },
              value: '03:00 UTC',
              env:   'RECONCILIATION_CRON',
              desc:  { en: 'Daily at 03:00 UTC -- low-traffic window. Processes all candidates from the previous 48 hours.', ua: 'Щодня о 03:00 UTC -- вікно низького трафіку. Обробляє всіх кандидатів за останні 48 годин.' },
              colorCls: 'text-sky-500',
            },
            {
              label: { en: 'Lookback window',    ua: 'Вікно перегляду'        },
              value: '48 h',
              env:   'RECONCILIATION_LOOKBACK_HOURS',
              desc:  { en: 'Transactions older than 48 hours are considered final and excluded. Prevents re-processing settled transactions.', ua: 'Транзакції старше 48 годин вважаються фінальними і виключаються. Запобігає повторній обробці закритих транзакцій.' },
              colorCls: 'text-amber-500',
            },
            {
              label: { en: 'Alert threshold',    ua: 'Поріг сповіщення'       },
              value: '10',
              env:   'RECONCILIATION_ALERT_THRESHOLD',
              desc:  { en: 'If more than 10 credits are applied in a single run, ops team is notified. Signals a systemic webhook delivery problem.', ua: 'Якщо за один запуск застосовано більше 10 зарахувань, сповіщається ops команда. Сигналізує про системну проблему з доставкою webhook.' },
              colorCls: 'text-violet-500',
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

      {/* ── Section 3: Flow ───────────────────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="3" title={ua ? 'Алгоритм' : 'Algorithm'}>
        <div className="flex flex-col gap-2">
          {FLOW_STEPS.map((step, i) => (
            <div key={i} className="flex flex-col items-start">
              <div className={cn(
                'w-full border rounded-2xl p-4 flex items-start gap-3',
                step.type === 'action-credit' ? 'border-success/30 bg-success-bg/30'      : '',
                step.type === 'action-fail'   ? 'border-destructive/20 bg-destructive-bg/20' : '',
                step.type === 'terminal'      ? 'border-sky-500/30 bg-sky-500/5'          : '',
                !step.type || step.type === 'normal' ? 'border-border bg-card'            : '',
              )}>
                <div className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold tabular-nums mt-0.5',
                  step.type === 'action-credit' ? 'bg-success/10 text-success'         : '',
                  step.type === 'action-fail'   ? 'bg-destructive/10 text-destructive' : '',
                  step.type === 'terminal'      ? 'bg-sky-500/10 text-sky-500'         : '',
                  !step.type || step.type === 'normal' ? 'bg-muted text-muted-foreground' : '',
                )}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className={cn(
                      'text-sm font-semibold',
                      step.type === 'action-credit' ? 'text-success'         : '',
                      step.type === 'action-fail'   ? 'text-destructive'     : '',
                      step.type === 'terminal'      ? 'text-sky-500'         : '',
                      !step.type || step.type === 'normal' ? 'text-foreground' : '',
                    )}>
                      {step.title[lang]}
                    </p>
                    {step.type === 'action-credit' && <Badge variant="outline" className="text-xs bg-success-bg text-success border-success/30 pointer-events-none">{ua ? 'Зарахування' : 'Credit'}</Badge>}
                    {step.type === 'action-fail'   && <Badge variant="outline" className="text-xs bg-destructive-bg text-destructive border-destructive/30 pointer-events-none">{ua ? 'Відмова' : 'Failure'}</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">{step.desc[lang]}</p>
                  {step.code && (
                    <pre className="mt-2 text-xs font-mono text-muted-foreground bg-muted rounded-xl px-3 py-2.5 overflow-x-auto leading-relaxed">
                      {step.code}
                    </pre>
                  )}
                </div>
              </div>
              {i < FLOW_STEPS.length - 1 && (
                <div className="pl-5 py-1">
                  <ChevronDown className="size-3.5 text-muted-foreground/40" />
                </div>
              )}
            </div>
          ))}
        </div>
      </DocSection>
      </div>

      {/* ── Section 4: Discrepancy types ──────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="4" title={ua ? 'Типи розбіжностей' : 'Discrepancy Types'}>
        <DocTable>
          <DocTableHeader>
            <TableRow>
              <TableHead>{ua ? 'Наш статус' : 'Our status'}</TableHead>
              <TableHead>{ua ? 'Статус PSP' : 'PSP status'}</TableHead>
              <TableHead>{ua ? 'Дія' : 'Action'}</TableHead>
              <TableHead>{ua ? 'Ризик' : 'Risk'}</TableHead>
            </TableRow>
          </DocTableHeader>
          <TableBody>
            {DISCREPANCIES.map((d, i) => (
              <TableRow key={i}>
                <TableCell><code className="text-xs font-mono text-foreground">{d.our}</code></TableCell>
                <TableCell><code className="text-xs font-mono text-muted-foreground">{d.psp[lang]}</code></TableCell>
                <TableCell className="text-sm text-muted-foreground">{d.action[lang]}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn('text-xs pointer-events-none', riskStyle[d.risk].cls)}>
                    {riskStyle[d.risk].label[lang]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DocTable>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-muted px-3 py-2.5">
          <Shield className="size-3.5 shrink-0 mt-0.5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground leading-snug">
            {ua
              ? 'Сценарій COMPLETED → FAILEDніколи не вирішується автоматично. Баланс вже зарахований -- автоматичне списання означає пряму фінансову втрату гравця без його відома. Тільки ручний огляд ops.'
              : 'The COMPLETED → FAILED scenario is never auto-resolved. The balance was already credited -- automatic debit means a direct financial loss to the player without their knowledge. Manual ops review only.'
            }
          </p>
        </div>
      </DocSection>
      </div>

      {/* ── Section 5: Events & reporting ────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="5" title={ua ? 'Події та звітність' : 'Events & Reporting'}>
        <DocTable>
          <DocTableHeader>
            <TableRow>
              <TableHead>event_type</TableHead>
              <TableHead>{ua ? 'Коли' : 'When'}</TableHead>
              <TableHead>payload</TableHead>
            </TableRow>
          </DocTableHeader>
          <TableBody>
            {[
              { event: 'reconciliation_check',  when: { en: 'Each transaction checked, statuses match',       ua: 'Кожна перевірена транзакція, статуси збігаються'    }, payload: '{ psp_status, our_status, checked_at }' },
              { event: 'reconciliation_credit', when: { en: 'Missed payment found, balance credited',         ua: 'Знайдено пропущений платіж, баланс зараховано'      }, payload: '{ psp_status, amount_credited, wallet_tx_id }' },
              { event: 'reconciliation_failed', when: { en: 'Transaction resolved as FAILED',                 ua: 'Транзакцію вирішено як FAILED'                       }, payload: '{ psp_status, previous_status }' },
              { event: 'reconciliation_alert',  when: { en: 'Critical discrepancy, manual review needed',     ua: 'Критична розбіжність, потрібен ручний огляд'         }, payload: '{ our_status, psp_status, reason }' },
              { event: 'reconciliation_run',    when: { en: 'End of each reconciliation job run',             ua: 'Кінець кожного запуску reconciliation job'           }, payload: '{ total_checked, credits, failures, alerts, duration_ms }' },
            ].map((e, i) => (
              <TableRow key={i}>
                <TableCell><code className="text-xs font-mono text-foreground">{e.event}</code></TableCell>
                <TableCell className="text-sm text-muted-foreground">{e.when[lang]}</TableCell>
                <TableCell><code className="text-xs font-mono text-muted-foreground">{e.payload}</code></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DocTable>

        <div className="mt-4 border border-border rounded-2xl p-4 bg-card">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {ua ? 'Таблиця reconciliation_reports (окрема від transaction_events)' : 'reconciliation_reports table (separate from transaction_events)'}
          </p>
          <div className="flex flex-col gap-1.5">
            {[
              { col: 'id',              type: 'uuid',        desc: { en: 'Primary key',                                      ua: 'Первинний ключ'                                  } },
              { col: 'run_at',          type: 'timestamptz', desc: { en: 'When the job ran',                                  ua: 'Коли запустився job'                             } },
              { col: 'total_checked',   type: 'int',         desc: { en: 'Total transactions inspected',                      ua: 'Загальна кількість перевірених транзакцій'       } },
              { col: 'credits_applied', type: 'int',         desc: { en: 'Transactions where balance was credited',           ua: 'Транзакцій де баланс було зараховано'            } },
              { col: 'failures_closed', type: 'int',         desc: { en: 'Transactions resolved as FAILED',                   ua: 'Транзакцій вирішених як FAILED'                  } },
              { col: 'alerts_raised',   type: 'int',         desc: { en: 'Critical discrepancies requiring manual review',    ua: 'Критичних розбіжностей що потребують ручного огляду' } },
              { col: 'duration_ms',     type: 'int',         desc: { en: 'Total run time in milliseconds',                    ua: 'Загальний час виконання в мілісекундах'          } },
            ].map((r, i) => (
              <div key={i} className="flex items-start gap-3 text-xs">
                <code className="shrink-0 text-foreground w-36">{r.col}</code>
                <code className="shrink-0 text-muted-foreground w-24">{r.type}</code>
                <span className="text-muted-foreground">{r.desc[lang]}</span>
              </div>
            ))}
          </div>
        </div>
      </DocSection>
      </div>

    </DocLayout>
  )
}
