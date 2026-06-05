'use client'

import { useState } from 'react'
import {
  ShieldAlert, Info, AlertTriangle, CheckCircle2, XCircle,
  Clock, RefreshCw, AlertCircle, FileText, Scale, Gavel,
  TrendingDown, CreditCard, Database, Bell, Eye, ChevronDown, ChevronRight,
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

// Why chargebacks matter
const WHY_MATTERS: { icon: React.ElementType; title: I18n; desc: I18n }[] = [
  {
    icon: TrendingDown,
    title: { en: 'PSP account termination', ua: 'Розірвання договору з PSP' },
    desc: {
      en: 'Visa and Mastercard enforce chargeback thresholds on PSPs, not on merchants. If our chargeback rate exceeds 1% (Visa) or 1.5% (Mastercard) of monthly transaction volume, the PSP faces fines and may terminate our account to protect their own standing.',
      ua: 'Visa та Mastercard застосовують пороги chargebacks до PSP, а не до мерчантів. Якщо наш рівень chargebacks перевищить 1% (Visa) або 1.5% (Mastercard) від місячного обсягу транзакцій, PSP отримує штрафи і може розірвати наш договір щоб захистити власний статус.',
    },
  },
  {
    icon: Scale,
    title: { en: 'Financial loss per dispute', ua: 'Фінансові збитки на кожен диспут' },
    desc: {
      en: 'Each chargeback costs more than the disputed amount: the original transaction is reversed, plus a dispute fee ($15–$100 depending on PSP), plus any Visa/MC scheme fees. In iGaming, the original funds may have already been wagered -- recovering them requires clear evidence.',
      ua: 'Кожен chargeback коштує більше ніж сума диспуту: оригінальна транзакція повертається, плюс комісія за диспут ($15–$100 залежно від PSP), плюс комісії схеми Visa/MC. В iGaming оригінальні кошти могли вже бути поставлені на кін -- повернення вимагає чітких доказів.',
    },
  },
  {
    icon: CreditCard,
    title: { en: 'Fraud pattern in iGaming', ua: 'Схема шахрайства в iGaming' },
    desc: {
      en: 'A common pattern: player deposits, wagers, withdraws winnings, then files a chargeback on the original deposit claiming it was unauthorized. Without proper evidence collection at transaction time, these disputes are very hard to win.',
      ua: "Поширена схема: гравець робить депозит, ставить, виводить виграш, потім подає chargeback на оригінальний депозит стверджуючи що він був несанкціонованим. Без належного збору доказів на момент транзакції такі диспути дуже важко виграти.",
    },
  },
  {
    icon: AlertCircle,
    title: { en: 'Multi-tenant exposure', ua: 'Ризик мультитенантної платформи' },
    desc: {
      en: 'On a B2B platform, chargebacks from one operator affect the shared PSP account. High chargeback rates from a single operator can jeopardize payment access for all other operators on the platform.',
      ua: 'На B2B платформі chargebacks від одного оператора впливають на спільний PSP акаунт. Високий рівень chargebacks від одного оператора може поставити під загрозу доступ до платежів для всіх інших операторів на платформі.',
    },
  },
]

// Chargeback lifecycle steps
const LIFECYCLE_STEPS: {
  step: number
  title: I18n
  desc: I18n
  deadline?: I18n
  type: 'normal' | 'action' | 'terminal-win' | 'terminal-loss'
}[] = [
  {
    step: 1,
    title: { en: 'Cardholder files a dispute', ua: 'Власник картки подає диспут' },
    desc: {
      en: "The cardholder contacts their bank (issuer) claiming the transaction was unauthorized or the goods/services were not delivered. The issuer initiates a chargeback against the PSP. We learn about this via a PSP webhook (chargebackCreated) or PSP dispute API polling.",
      ua: 'Власник картки звертається до свого банку (емітента) стверджуючи що транзакція була несанкціонована або товари/послуги не були надані. Емітент ініціює chargeback проти PSP. Ми дізнаємось про це через PSP webhook (chargebackCreated) або polling dispute API.',
    },
    type: 'normal',
  },
  {
    step: 2,
    title: { en: 'Platform receives notification', ua: 'Платформа отримує сповіщення' },
    desc: {
      en: 'A chargeback_webhook_handler creates a record in the chargebacks table with status OPEN. The original transaction is flagged. Player balance may be placed on hold if the amount was already credited (platform policy decision). Ops team is notified immediately via alert.',
      ua: 'chargeback_webhook_handler створює запис у таблиці chargebacks зі статусом OPEN. Оригінальна транзакція позначається. Баланс гравця може бути заблокований якщо сума вже була зарахована (рішення policy платформи). Ops команда негайно сповіщається через alert.',
    },
    type: 'action',
    deadline: { en: 'Happens in real time', ua: 'Відбувається в реальному часі' },
  },
  {
    step: 3,
    title: { en: 'Evidence collection window', ua: 'Вікно збору доказів' },
    desc: {
      en: 'Platform automatically assembles the evidence package: transaction record with IP and device fingerprint, KYC verification status and documents, game session logs (timestamps, bets placed, winnings), login history around the transaction time, any prior successful withdrawals by this player (strong counter-evidence).',
      ua: 'Платформа автоматично збирає пакет доказів: запис транзакції з IP та fingerprint пристрою, статус та документи KYC верифікації, логи ігрових сесій (часові мітки, ставки, виграші), історія входів навколо часу транзакції, будь-які попередні успішні виведення цим гравцем (сильний контраргумент).',
    },
    type: 'action',
    deadline: { en: 'Typically 7–21 days from notification', ua: 'Зазвичай 7–21 день з моменту сповіщення' },
  },
  {
    step: 4,
    title: { en: 'Evidence submission to PSP', ua: 'Подання доказів до PSP' },
    desc: {
      en: "Ops submits the assembled evidence package via PSP dispute API (or manually via PSP dashboard if the PSP doesn't provide an API). Chargeback status transitions to EVIDENCE_SUBMITTED. The PSP forwards the evidence to the card network (Visa/MC) for arbitration.",
      ua: "Ops подає зібраний пакет доказів через PSP dispute API (або вручну через dashboard PSP якщо PSP не надає API). Статус chargeback переходить в EVIDENCE_SUBMITTED. PSP передає докази до карткової мережі (Visa/MC) для арбітражу.",
    },
    type: 'action',
    deadline: { en: 'Must be done before PSP deadline', ua: 'Має бути виконано до дедлайну PSP' },
  },
  {
    step: 5,
    title: { en: 'Card network arbitration', ua: 'Арбітраж карткової мережі' },
    desc: {
      en: "The card network reviews evidence from both sides (issuer's claim vs merchant's evidence). Decision takes 30–75 days. Neither platform nor PSP can influence this phase -- it's purely in the card network's hands.",
      ua: 'Карткова мережа розглядає докази обох сторін (вимога емітента vs докази мерчанта). Рішення приймається за 30–75 днів. Ні платформа ні PSP не можуть вплинути на цю фазу -- вона повністю в руках карткової мережі.',
    },
    type: 'normal',
    deadline: { en: '30–75 days', ua: '30–75 днів' },
  },
  {
    step: 6,
    title: { en: 'Won -- funds returned', ua: 'Виграш -- кошти повертаються' },
    desc: {
      en: 'Card network rules in our favor. Chargeback status → WON. The disputed amount is credited back to our PSP account. If the player balance was placed on hold, it is released. A won_chargeback event is logged against the transaction.',
      ua: 'Карткова мережа виносить рішення на нашу користь. Статус chargeback → WON. Спірна сума зараховується назад на наш PSP акаунт. Якщо баланс гравця був заблокований -- він розблоковується. Подія won_chargeback логується до транзакції.',
    },
    type: 'terminal-win',
  },
  {
    step: 7,
    title: { en: 'Lost -- funds are gone', ua: 'Програш -- кошти втрачені' },
    desc: {
      en: 'Card network rules in favor of the cardholder. Chargeback status → LOST. The disputed amount is permanently reversed. Platform must decide: absorb the loss, recover from operator (per contract), or flag the player account. A lost_chargeback event is logged and the ops team is alerted.',
      ua: 'Карткова мережа виносить рішення на користь власника картки. Статус chargeback → LOST. Спірна сума остаточно повертається. Платформа вирішує: поглинути збиток, стягнути з оператора (згідно контракту), або позначити акаунт гравця. Подія lost_chargeback логується і ops команда сповіщається.',
    },
    type: 'terminal-loss',
  },
]

// DB schema
const DB_COLUMNS: { col: string; type: string; desc: I18n }[] = [
  { col: 'id',                   type: 'uuid PK',         desc: { en: 'Unique chargeback record ID',                                               ua: 'Унікальний ID запису chargeback'                                               } },
  { col: 'transaction_id',       type: 'uuid FK',         desc: { en: 'Reference to the original transaction in transactions table',               ua: "Посилання на оригінальну транзакцію в таблиці transactions"                    } },
  { col: 'operator_id',          type: 'uuid FK',         desc: { en: 'Which operator this chargeback belongs to (multi-tenant)',                   ua: 'Якому оператору належить цей chargeback (мультитенант)'                        } },
  { col: 'psp_id',               type: 'uuid FK',         desc: { en: 'Which PSP reported the chargeback',                                         ua: 'Який PSP повідомив про chargeback'                                             } },
  { col: 'psp_dispute_id',       type: 'text',            desc: { en: 'PSP-side dispute/case ID for API calls',                                     ua: 'ID диспуту/кейсу на боці PSP для API викликів'                                } },
  { col: 'amount',               type: 'numeric',         desc: { en: 'Disputed amount in original transaction currency',                           ua: 'Спірна сума у валюті оригінальної транзакції'                                  } },
  { col: 'currency',             type: 'char(3)',          desc: { en: 'ISO 4217 currency code',                                                     ua: 'Код валюти ISO 4217'                                                           } },
  { col: 'reason_code',          type: 'text',            desc: { en: 'Visa/MC reason code (e.g. 10.4 -- Fraud, 13.1 -- Merchandise not received)',   ua: 'Код причини Visa/MC (напр. 10.4 -- Fraud, 13.1 -- Merchandise not received)'    } },
  { col: 'status',               type: 'text',            desc: { en: 'OPEN | EVIDENCE_SUBMITTED | WON | LOST | EXPIRED',                           ua: 'OPEN | EVIDENCE_SUBMITTED | WON | LOST | EXPIRED'                              } },
  { col: 'evidence_package',     type: 'jsonb',           desc: { en: 'Assembled evidence: transaction data, KYC refs, game logs, IP, device',      ua: 'Зібрані докази: дані транзакції, посилання KYC, логи гри, IP, пристрій'       } },
  { col: 'evidence_deadline',    type: 'timestamptz',     desc: { en: 'Hard deadline for submitting evidence to PSP -- set from PSP notification',   ua: 'Жорсткий дедлайн для подання доказів до PSP -- береться з повідомлення PSP'   } },
  { col: 'balance_held',         type: 'boolean',         desc: { en: 'Whether player balance was placed on hold when chargeback was opened',       ua: 'Чи був баланс гравця заблокований при відкритті chargeback'                   } },
  { col: 'resolved_at',          type: 'timestamptz',     desc: { en: 'Timestamp when WON or LOST decision was received',                           ua: 'Час коли було отримано рішення WON або LOST'                                   } },
  { col: 'created_at',           type: 'timestamptz',     desc: { en: 'When the chargeback record was created in our system',                       ua: 'Коли запис chargeback був створений у нашій системі'                           } },
]

// Evidence items
const EVIDENCE_ITEMS: { icon: React.ElementType; title: I18n; items: I18n[]; weight: 'critical' | 'strong' | 'supporting' }[] = [
  {
    icon: Database,
    title: { en: 'Transaction record', ua: 'Запис транзакції' },
    weight: 'critical',
    items: [
      { en: 'Transaction ID, amount, currency, timestamp', ua: 'ID транзакції, сума, валюта, часова мітка' },
      { en: 'IP address at time of payment', ua: 'IP адреса на момент платежу' },
      { en: 'Device fingerprint and user-agent', ua: 'Fingerprint пристрою та user-agent' },
      { en: 'Billing address provided by cardholder', ua: 'Платіжна адреса вказана власником картки' },
    ],
  },
  {
    icon: CheckCircle2,
    title: { en: 'KYC verification', ua: 'KYC верифікація' },
    weight: 'critical',
    items: [
      { en: 'KYC level at time of transaction (verified / unverified)', ua: "Рівень KYC на момент транзакції (верифіковано / ні)" },
      { en: 'Verified identity documents (ID/passport)', ua: 'Верифіковані документи особи (ID/паспорт)' },
      { en: 'Selfie match result and timestamp', ua: 'Результат та час перевірки selfie' },
      { en: 'Verified email and phone number', ua: 'Верифіковані email та номер телефону' },
    ],
  },
  {
    icon: Eye,
    title: { en: 'Player activity logs', ua: 'Логи активності гравця' },
    weight: 'strong',
    items: [
      { en: 'Login events before and after the disputed deposit', ua: 'Події входу до і після спірного депозиту' },
      { en: 'Game session records: games played, bets, wins, timestamps', ua: 'Записи ігрових сесій: ігри, ставки, виграші, часові мітки' },
      { en: 'Prior successful withdrawals by the same player (strongest counter-evidence)', ua: 'Попередні успішні виведення тим самим гравцем (найсильніший контраргумент)' },
      { en: 'Any prior deposits using the same card without dispute', ua: 'Будь-які попередні депозити тією самою карткою без диспуту' },
    ],
  },
  {
    icon: FileText,
    title: { en: 'Terms & consent records', ua: 'Умови та записи згоди' },
    weight: 'supporting',
    items: [
      { en: 'Timestamp and IP of terms of service acceptance', ua: 'Час та IP прийняття умов надання послуг' },
      { en: 'Responsible gambling acknowledgements', ua: 'Підтвердження відповідальної гри' },
      { en: 'Account creation record and verification email', ua: 'Запис створення акаунту та верифікаційний email' },
    ],
  },
]

// Thresholds
const THRESHOLDS: { network: string; program: I18n; threshold: string; consequence: I18n; color: 'warning' | 'destructive' }[] = [
  {
    network: 'Visa',
    program: { en: 'Visa Dispute Monitoring Program (VDMP)', ua: 'Visa Dispute Monitoring Program (VDMP)' },
    threshold: '> 0.65% of monthly txns',
    consequence: { en: 'Early warning -- PSP contacts merchant. No fine yet but monitoring begins.', ua: 'Раннє попередження -- PSP звертається до мерчанта. Штрафу ще немає але моніторинг починається.' },
    color: 'warning',
  },
  {
    network: 'Visa',
    program: { en: 'Visa Fraud Monitoring Program (VFMP)', ua: 'Visa Fraud Monitoring Program (VFMP)' },
    threshold: '> 1.0% of monthly txns',
    consequence: { en: 'PSP faces monthly fines ($50 per dispute). Risk of account termination after 4 months.', ua: 'PSP отримує місячні штрафи ($50 за диспут). Ризик розірвання договору після 4 місяців.' },
    color: 'destructive',
  },
  {
    network: 'Mastercard',
    program: { en: 'Excessive Chargeback Program (ECP)', ua: 'Excessive Chargeback Program (ECP)' },
    threshold: '> 1.5% of monthly txns',
    consequence: { en: 'Fines begin immediately. PSP may terminate the merchant account without notice.', ua: 'Штрафи починаються негайно. PSP може розірвати договір з мерчантом без попередження.' },
    color: 'destructive',
  },
]

// ─── Component ─────────────────────────────────────────────────────────────────

export default function ChargebackPage() {
  const [lang, setLang] = useState<Lang>('en')
  const ua = lang === 'ua'

  return (
    <DocLayout
      title="Chargeback Management"
      breadcrumbLabel="Payment module"
      breadcrumbHref="/sandbox/payment-architecture"
      parentCrumb={{ label: 'Sandbox', href: '/sandbox' }}
      description={ua
        ? 'Обробка диспутів, збір доказів, контроль рівня chargebacks per operator.'
        : 'Dispute lifecycle, evidence collection, chargeback rate control per operator.'}
      tags={[
        { label: 'Phase 4', type: 'tag'    },
        { label: 'Spec',    type: 'status' },
      ]}
      titleExtra={<LangSwitcher lang={lang} onChange={setLang} />}
    >

      {/* ── Section 1: Why it matters ─────────────────────────────────────── */}
      <DocSection num="1" title={ua ? 'Чому важливо' : 'Why It Matters'}>
        <InfoCard>
          {ua
            ? <>Chargeback -- це примусове повернення коштів ініційоване банком-емітентом картки власника, в обхід платформи та PSP. В iGaming рівень chargebacks є однією з ключових метрик ризику: PSP може розірвати договір якщо рівень перевищить пороги карткових мереж. На B2B платформі один оператор з поганою поведінкою гравців ставить під загрозу доступ до платежів для всіх.</>
            : <>A chargeback is a forced reversal of funds initiated by the cardholder's issuing bank, bypassing both the platform and the PSP. In iGaming, chargeback rate is one of the key risk metrics: a PSP can terminate the contract if the rate exceeds card network thresholds. On a B2B platform, one operator with bad player behavior puts payment access at risk for everyone.</>}
        </InfoCard>
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
          {WHY_MATTERS.map((item, i) => (
            <div key={i} className="border border-border rounded-2xl p-4 flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                  <item.icon className="size-3.5" />
                </div>
                <p className="text-sm font-semibold text-foreground">{item.title[lang]}</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc[lang]}</p>
            </div>
          ))}
        </div>
      </DocSection>

      {/* ── Section 2: Lifecycle ──────────────────────────────────────────── */}
      <div className="mt-8">
        <DocSection num="2" title={ua ? 'Lifecycle chargeback' : 'Chargeback Lifecycle'}>
          <WarnCard>
            {ua
              ? <>Дедлайн подання доказів -- жорсткий. PSP встановлює вікно (зазвичай 7–21 день). Якщо докази не подані вчасно, диспут автоматично програється незалежно від їх якості. Система повинна генерувати алерти <strong>за 72 години</strong> до дедлайну.</>
              : <>The evidence submission deadline is hard. The PSP sets a window (usually 7–21 days). If evidence is not submitted in time, the dispute is automatically lost regardless of its strength. The system must generate alerts <strong>72 hours before</strong> the deadline.</>}
          </WarnCard>
          <div className="flex flex-col gap-3">
            {LIFECYCLE_STEPS.map((step) => {
              const isWin  = step.type === 'terminal-win'
              const isLoss = step.type === 'terminal-loss'
              const isAction = step.type === 'action'
              return (
                <div key={step.step} className={cn(
                  'border rounded-2xl p-4',
                  isWin   ? 'border-success/30 bg-success-bg'      :
                  isLoss  ? 'border-destructive/30 bg-destructive-bg' :
                  isAction ? 'border-brand/20 bg-brand-bg'          :
                  'border-border bg-card',
                )}>
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold mt-0.5',
                      isWin   ? 'bg-success/20 text-success'           :
                      isLoss  ? 'bg-destructive/20 text-destructive'   :
                      isAction ? 'bg-brand/20 text-brand'              :
                      'bg-muted text-muted-foreground',
                    )}>
                      {step.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-semibold text-foreground">{step.title[lang]}</p>
                        {step.deadline && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="size-3" />{step.deadline[lang]}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.desc[lang]}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </DocSection>
      </div>

      {/* ── Section 3: Data model ─────────────────────────────────────────── */}
      <div className="mt-8">
        <DocSection num="3" title={ua ? 'Модель даних' : 'Data Model'}>
          <InfoCard>
            {ua
              ? <>Таблиця <code className="text-xs bg-muted rounded px-1.5 py-0.5">chargebacks</code> живе поруч з <code className="text-xs bg-muted rounded px-1.5 py-0.5">transactions</code>. Один запис chargeback на одну транзакцію (відношення 1:1 -- теоретично можна отримати кілька diспутів на одну транзакцію але на практиці це крайній випадок що потребує ручного розгляду).</>
              : <>The <code className="text-xs bg-muted rounded px-1.5 py-0.5">chargebacks</code> table lives alongside <code className="text-xs bg-muted rounded px-1.5 py-0.5">transactions</code>. One chargeback record per transaction (1:1 relationship -- theoretically you can receive multiple disputes on one transaction but in practice this is an edge case requiring manual review).</>}
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
              {DB_COLUMNS.map((col) => (
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

      {/* ── Section 4: Evidence collection ───────────────────────────────── */}
      <div className="mt-8">
        <DocSection num="4" title={ua ? 'Збір доказів' : 'Evidence Collection'}>
          <InfoCard>
            {ua
              ? <>Докази збираються <strong>автоматично в момент відкриття chargeback</strong> через запити до суміжних сервісів. Ops не повинен вручну шукати логи -- система формує пакет доказів і зберігає в <code className="text-xs bg-muted rounded px-1.5 py-0.5">evidence_package</code> (JSONB). Ops тільки перевіряє і підтверджує перед відправкою до PSP.</>
              : <>Evidence is collected <strong>automatically when the chargeback is opened</strong> via queries to adjacent services. Ops should not manually hunt for logs -- the system assembles the evidence package and stores it in <code className="text-xs bg-muted rounded px-1.5 py-0.5">evidence_package</code> (JSONB). Ops only reviews and confirms before submission to the PSP.</>}
          </InfoCard>
          <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
            {EVIDENCE_ITEMS.map((group, i) => {
              const weightLabel = group.weight === 'critical' ? { en: 'Critical', ua: 'Критично' }
                : group.weight === 'strong' ? { en: 'Strong', ua: 'Сильне' }
                : { en: 'Supporting', ua: 'Додаткове' }
              const weightCls = group.weight === 'critical' ? 'bg-destructive/10 text-destructive'
                : group.weight === 'strong' ? 'bg-brand-bg text-brand'
                : 'bg-muted text-muted-foreground'
              return (
                <div key={i} className="border border-border rounded-2xl p-4">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                        <group.icon className="size-3.5" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">{group.title[lang]}</p>
                    </div>
                    <Badge className={cn('text-xs shrink-0', weightCls)}>{weightLabel[lang]}</Badge>
                  </div>
                  <ul className="flex flex-col gap-1.5">
                    {group.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <ChevronRight className="size-3.5 shrink-0 mt-0.5 text-muted-foreground/50" />
                        {item[lang]}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </DocSection>
      </div>

      {/* ── Section 5: Thresholds & alerts ───────────────────────────────── */}
      <div className="mt-8">
        <DocSection num="5" title={ua ? 'Пороги та алерти' : 'Thresholds & Alerts'}>
          <DangerCard>
            {ua
              ? <>Рівень chargebacks розраховується як відсоток від <strong>кількості транзакцій</strong>, не від суми. PSP може мати власні пороги нижчі за пороги карткових мереж -- перевіряти в договорі. Цей рівень відстежується <strong>окремо для кожного оператора</strong> на платформі.</>
              : <>Chargeback rate is calculated as a percentage of <strong>transaction count</strong>, not amount. PSPs may have their own thresholds lower than card network thresholds -- check the contract. This rate is tracked <strong>separately per operator</strong> on the platform.</>}
          </DangerCard>
          <div className="flex flex-col gap-3 mb-6">
            {THRESHOLDS.map((t, i) => (
              <div key={i} className={cn(
                'border rounded-2xl p-4',
                t.color === 'destructive' ? 'border-destructive/30 bg-destructive-bg' : 'border-warning/30 bg-warning-bg',
              )}>
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-xl mt-0.5',
                    t.color === 'destructive' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning',
                  )}>
                    {t.color === 'destructive' ? <XCircle className="size-3.5" /> : <AlertTriangle className="size-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant="secondary" className="text-xs">{t.network}</Badge>
                      <span className="text-sm font-semibold text-foreground">{t.program[lang]}</span>
                    </div>
                    <p className="text-xs font-mono text-foreground mb-1">{t.threshold}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t.consequence[lang]}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Alert rules */}
          <p className="text-sm font-semibold text-foreground mb-3">
            {ua ? 'Правила алертів системи' : 'System alert rules'}
          </p>
          <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
            {[
              {
                icon: Bell,
                title: { en: 'New chargeback opened',    ua: 'Відкрито новий chargeback'      },
                desc:  { en: 'Immediate alert to ops. Player balance hold check triggered.',   ua: 'Негайний алерт для ops. Запускається перевірка блокування балансу гравця.' },
                urgency: 'high',
              },
              {
                icon: Clock,
                title: { en: 'Evidence deadline in 72h', ua: 'Дедлайн доказів через 72 год'  },
                desc:  { en: 'Alert if evidence_package not yet submitted. Escalates to manager.', ua: 'Алерт якщо evidence_package ще не подано. Ескалується до менеджера.' },
                urgency: 'critical',
              },
              {
                icon: TrendingDown,
                title: { en: 'Operator rate > 0.5%',    ua: 'Рівень оператора > 0.5%'         },
                desc:  { en: 'Weekly threshold check per operator. Alert sent to operator account manager.', ua: 'Щотижнева перевірка порогу для кожного оператора. Алерт надсилається акаунт-менеджеру оператора.' },
                urgency: 'medium',
              },
              {
                icon: RefreshCw,
                title: { en: 'Dispute status changed',   ua: 'Статус диспуту змінився'        },
                desc:  { en: 'PSP dispute API polling detects WON/LOST. Balance hold released or written off accordingly.', ua: 'Polling dispute API PSP виявляє WON/LOST. Блокування балансу знімається або списується відповідно.' },
                urgency: 'normal',
              },
            ].map((alert, i) => {
              const urgencyCls = alert.urgency === 'critical' ? 'bg-destructive/10 text-destructive'
                : alert.urgency === 'high' ? 'bg-warning/10 text-warning'
                : alert.urgency === 'medium' ? 'bg-brand-bg text-brand'
                : 'bg-muted text-muted-foreground'
              return (
                <div key={i} className="border border-border rounded-2xl p-4">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className={cn('flex size-7 shrink-0 items-center justify-center rounded-xl', urgencyCls)}>
                      <alert.icon className="size-3.5" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">{alert.title[lang]}</p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{alert.desc[lang]}</p>
                </div>
              )
            })}
          </div>
        </DocSection>
      </div>

      {/* ── Section 6: PSP integration ────────────────────────────────────── */}
      <div className="mt-8">
        <DocSection num="6" title={ua ? 'Інтеграція з PSP dispute API' : 'PSP Dispute API Integration'}>
          <InfoCard>
            {ua
              ? <>Кожен PSP надає власний механізм для роботи з диспутами -- деякі через webhook + API, деякі тільки через dashboard. Інтерфейс <code className="text-xs bg-muted rounded px-1.5 py-0.5">IDisputeProvider</code> абстрагує цю різницю аналогічно до <code className="text-xs bg-muted rounded px-1.5 py-0.5">IPaymentProvider</code>.</>
              : <>Each PSP provides its own mechanism for dispute handling -- some via webhook + API, some only through a dashboard. The <code className="text-xs bg-muted rounded px-1.5 py-0.5">IDisputeProvider</code> interface abstracts this difference analogously to <code className="text-xs bg-muted rounded px-1.5 py-0.5">IPaymentProvider</code>.</>}
          </InfoCard>
          <DocTable>
            <DocTableHeader>
              <TableRow>
                <TableHead>{ua ? 'Метод' : 'Method'}</TableHead>
                <TableHead>{ua ? 'Опис' : 'Description'}</TableHead>
                <TableHead>{ua ? 'Примітка' : 'Note'}</TableHead>
              </TableRow>
            </DocTableHeader>
            <TableBody>
              {[
                {
                  method: 'onChargebackReceived(payload)',
                  desc: { en: 'Called by webhook handler when PSP notifies of a new dispute. Creates chargeback record, triggers evidence assembly.', ua: 'Викликається webhook handler коли PSP повідомляє про новий диспут. Створює запис chargeback, запускає збір доказів.' },
                  note: { en: 'Must respond 200 within 3s to PSP', ua: 'Має відповісти 200 протягом 3с до PSP' },
                },
                {
                  method: 'submitEvidence(disputeId, pkg)',
                  desc: { en: 'Submits the assembled evidence package to the PSP dispute API. Updates status to EVIDENCE_SUBMITTED.', ua: 'Подає зібраний пакет доказів до PSP dispute API. Оновлює статус до EVIDENCE_SUBMITTED.' },
                  note: { en: 'Idempotent -- safe to retry', ua: 'Ідемпотентний -- безпечно повторювати' },
                },
                {
                  method: 'pollDisputeStatus(disputeId)',
                  desc: { en: 'Polls the PSP for the current dispute outcome. Called by background job every 6 hours for open disputes.', ua: 'Опитує PSP щодо поточного результату диспуту. Викликається фоновим завданням кожні 6 годин для відкритих диспутів.' },
                  note: { en: 'Fallback when PSP has no outcome webhook', ua: 'Fallback коли PSP не має webhook для результату' },
                },
                {
                  method: 'onDisputeResolved(payload)',
                  desc: { en: 'Called when PSP sends WON/LOST outcome webhook. Transitions chargeback to terminal state, releases or writes off balance hold.', ua: 'Викликається коли PSP надсилає webhook з результатом WON/LOST. Переводить chargeback до термінального стану, знімає або списує блокування балансу.' },
                  note: { en: 'Triggers financial settlement update', ua: 'Запускає оновлення фінансового розрахунку' },
                },
              ].map((row, i) => (
                <TableRow key={i}>
                  <TableCell><code className="text-xs font-mono text-foreground">{row.method}</code></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{row.desc[lang]}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{row.note[lang]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DocTable>
        </DocSection>
      </div>

      {/* ── Section 7: Multi-tenant rules ─────────────────────────────────── */}
      <div className="mt-8">
        <DocSection num="7" title={ua ? 'Мультитенантні правила' : 'Multi-Tenant Rules'}>
          <div className="flex flex-col gap-3">
            {[
              {
                icon: Scale,
                title: { en: 'Operator isolation', ua: 'Ізоляція операторів' },
                desc: { en: 'Each chargeback is tagged with operator_id. Chargeback rate metrics are calculated per-operator and never aggregated across operators in reports -- each operator sees only their own exposure.', ua: 'Кожен chargeback позначений operator_id. Метрики рівня chargebacks розраховуються для кожного оператора окремо і ніколи не агрегуються по операторах у звітах -- кожен оператор бачить тільки своє.' },
              },
              {
                icon: Gavel,
                title: { en: 'Liability attribution', ua: 'Атрибуція відповідальності' },
                desc: { en: 'Platform contract with each operator defines who bears the cost of lost chargebacks. Typical model: operator absorbs losses for disputes on their players; platform absorbs only if the root cause was a platform infrastructure failure.', ua: 'Контракт платформи з кожним оператором визначає хто несе витрати програних chargebacks. Типова модель: оператор поглинає збитки за диспути своїх гравців; платформа поглинає тільки якщо причиною була відмова інфраструктури платформи.' },
              },
              {
                icon: TrendingDown,
                title: { en: 'Operator suspension trigger', ua: 'Тригер призупинення оператора' },
                desc: { en: "If an operator's rolling 30-day chargeback rate exceeds 0.8%, the platform can automatically pause deposit processing for that operator's brand_id until the rate normalizes. This protects the platform's shared PSP account.", ua: 'Якщо ковзний 30-денний рівень chargebacks оператора перевищує 0.8%, платформа може автоматично призупинити обробку депозитів для brand_id цього оператора до нормалізації рівня. Це захищає спільний PSP акаунт платформи.' },
              },
            ].map((rule, i) => (
              <div key={i} className="border border-border rounded-2xl p-4 flex items-start gap-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground mt-0.5">
                  <rule.icon className="size-3.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">{rule.title[lang]}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{rule.desc[lang]}</p>
                </div>
              </div>
            ))}
          </div>
        </DocSection>
      </div>

    </DocLayout>
  )
}
