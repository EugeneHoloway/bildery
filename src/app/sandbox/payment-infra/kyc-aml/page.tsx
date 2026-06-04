'use client'

import { useState } from 'react'
import {
  UserCheck, Info, AlertTriangle, CheckCircle2, XCircle,
  ArrowRight, Shield, FileText, Eye, Ban, AlertOctagon,
  Lock, Scale, BookOpen, TrendingUp, Search, Flag,
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
    <div className="border border-amber-500/30 bg-amber-500/5 rounded-2xl px-4 py-3 flex items-start gap-3 mb-4">
      <AlertTriangle className="size-4 shrink-0 mt-0.5 text-amber-500" />
      <div className="text-sm text-foreground leading-relaxed">{children}</div>
    </div>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────

interface KycLevel {
  level: number
  name: I18n
  requirements: I18n[]
  allows: I18n
  blocks: I18n
  colorCls: string
  bgCls: string
  borderCls: string
}

const KYC_LEVELS: KycLevel[] = [
  {
    level: 0,
    name:  { en: 'Anonymous', ua: 'Анонімний' },
    requirements: [
      { en: 'None — player just registered', ua: 'Нічого -- гравець щойно зареєструвався' },
    ],
    allows: { en: 'Deposits up to cumulative threshold $X', ua: 'Депозити до накопиченого порогу $X' },
    blocks: { en: 'Withdrawals; deposits above threshold', ua: 'Виведення; депозити вище порогу' },
    colorCls: 'text-slate-500', bgCls: 'bg-slate-500/10', borderCls: 'border-slate-500/20',
  },
  {
    level: 1,
    name:  { en: 'Basic verified', ua: 'Базова верифікація' },
    requirements: [
      { en: 'Email confirmed', ua: 'Email підтверджено' },
      { en: 'Phone number confirmed', ua: 'Номер телефону підтверджено' },
      { en: 'Date of birth provided + age 18+ confirmed', ua: 'Дата народження + підтверджено 18+' },
      { en: 'Country of residence declared', ua: 'Країна проживання зазначена' },
    ],
    allows: { en: 'Deposits up to higher threshold $Y; withdrawals up to $Z', ua: 'Депозити до вищого порогу $Y; виведення до $Z' },
    blocks: { en: 'Withdrawals above $Z; deposits above threshold $Y', ua: 'Виведення вище $Z; депозити вище порогу $Y' },
    colorCls: 'text-sky-500', bgCls: 'bg-sky-500/10', borderCls: 'border-sky-500/20',
  },
  {
    level: 2,
    name:  { en: 'Identity verified', ua: 'Ідентифікація підтверджена' },
    requirements: [
      { en: 'Government-issued ID (passport / national ID / driver\'s licence)', ua: 'Паспорт / ID-картка / водійське посвідчення' },
      { en: 'Proof of address (utility bill or bank statement, max 3 months old)', ua: 'Підтвердження адреси (рахунок за комуналку або виписка з банку, не старше 3 місяців)' },
      { en: 'Selfie / liveness check (optional for Phase 3, recommended)', ua: 'Selfie / liveness check (опційно для Phase 3, рекомендовано)' },
    ],
    allows: { en: 'All deposits and withdrawals within brand limits', ua: 'Всі депозити та виведення в межах лімітів бренду' },
    blocks: { en: 'Transactions above EDD threshold (requires Level 3)', ua: 'Транзакції вище EDD порогу (потрібен рівень 3)' },
    colorCls: 'text-emerald-500', bgCls: 'bg-emerald-500/10', borderCls: 'border-emerald-500/20',
  },
  {
    level: 3,
    name:  { en: 'Enhanced Due Diligence (EDD)', ua: 'Розширена перевірка (EDD)' },
    requirements: [
      { en: 'All Level 2 documents', ua: 'Всі документи рівня 2' },
      { en: 'Source of funds declaration', ua: 'Декларація джерела коштів' },
      { en: 'Source of wealth evidence (bank statement, payslips, tax return)', ua: 'Підтвердження джерела статків (виписка з банку, зарплатні квитки, декларація)' },
      { en: 'Manual review by compliance officer', ua: 'Ручна перевірка офіцером комплаєнсу' },
    ],
    allows: { en: 'High-value transactions above EDD threshold', ua: 'Транзакції з великою сумою вище EDD порогу' },
    blocks: { en: 'Nothing — this is the maximum level', ua: 'Нічого -- це максимальний рівень' },
    colorCls: 'text-violet-500', bgCls: 'bg-violet-500/10', borderCls: 'border-violet-500/20',
  },
]

interface AmlRule {
  trigger: I18n
  action: I18n
  blocks: boolean
  note?: I18n
}

const AML_RULES: AmlRule[] = [
  {
    trigger: { en: 'Single transaction ≥ CTR threshold (e.g. $10 000)', ua: 'Одна транзакція ≥ поріг CTR (напр. $10 000)' },
    action:  { en: 'File Currency Transaction Report (CTR) — mandatory', ua: 'Подати Currency Transaction Report (CTR) -- обовʼязково' },
    blocks:  false,
    note:    { en: 'Value set by regulator, not configurable. Transaction proceeds normally.', ua: 'Значення задає регулятор, не налаштовується. Транзакція виконується.' },
  },
  {
    trigger: { en: 'Rapid deposit--withdrawal cycle (deposit then withdraw > 80% within 24h)', ua: 'Швидкий цикл депозит--виведення (депозит і виведення > 80% за 24год)' },
    action:  { en: 'Flag for AML queue + notify compliance officer', ua: 'Мітка в AML чергу + повідомлення офіцеру комплаєнсу' },
    blocks:  false,
    note:    { en: 'Classic layering pattern — funds enter and exit quickly without gameplay', ua: 'Класичний layering патерн -- кошти заходять і виходять без гри' },
  },
  {
    trigger: { en: 'Structuring: multiple deposits just below CTR threshold in short window', ua: 'Structuring: кілька депозитів трохи нижче CTR порогу за короткий час' },
    action:  { en: 'Flag for AML queue + escalate to compliance', ua: 'Мітка в AML чергу + ескалація' },
    blocks:  false,
    note:    { en: 'Intentional breaking of large amounts into smaller ones to avoid reporting', ua: 'Навмисне розбиття великих сум щоб уникнути звітності' },
  },
  {
    trigger: { en: 'Sanctions hit: player name / DOB matches OFAC, EU, UN list', ua: 'Санкції: імʼя / дата народження збігається зі списком OFAC, ЄС, ООН' },
    action:  { en: 'INSTANT BLOCK — freeze account, notify compliance immediately', ua: 'МИТТЄВЕ БЛОКУВАННЯ -- заморожування акаунту, негайне повідомлення' },
    blocks:  true,
    note:    { en: 'This is the only AML check that synchronously blocks a transaction', ua: 'Єдина AML перевірка, яка синхронно блокує транзакцію' },
  },
  {
    trigger: { en: 'PEP (Politically Exposed Person) detected', ua: 'Виявлено PEP (Politically Exposed Person)' },
    action:  { en: 'Flag for enhanced review — do not auto-block', ua: 'Мітка для посиленої перевірки -- не блокувати автоматично' },
    blocks:  false,
    note:    { en: 'PEP status alone is not a reason to block; requires enhanced due diligence', ua: 'PEP статус сам по собі не є підставою для блокування; потрібна EDD' },
  },
  {
    trigger: { en: 'Deposits from 3+ different payment methods in 7 days', ua: 'Депозити з 3+ різних методів оплати за 7 днів' },
    action:  { en: 'Flag for review — potential money mule or account sharing', ua: 'Мітка для перевірки -- можливий money mule або спільне використання акаунту' },
    blocks:  false,
  },
]

const DATA_INPUTS: { label: I18n; source: I18n; Icon: React.ElementType }[] = [
  { label: { en: 'user_id, amount, direction, cumulative deposit total', ua: 'user_id, amount, direction, накопичена сума депозитів' }, source: { en: 'from Limits & Rules engine', ua: 'від Limits & Rules engine' }, Icon: ArrowRight },
  { label: { en: 'Current KYC level, document status, verification date', ua: 'Поточний KYC рівень, статус документів, дата верифікації' }, source: { en: 'user_kyc_profiles table (Redis cache TTL 60s)', ua: 'таблиця user_kyc_profiles (Redis кеш TTL 60s)' }, Icon: UserCheck },
  { label: { en: 'Brand KYC thresholds: anonymous cap, L1 cap, EDD threshold', ua: 'KYC пороги бренду: анонімний кеп, L1 кеп, EDD поріг' }, source: { en: 'brand_limits table (cached)', ua: 'таблиця brand_limits (кешується)' }, Icon: Shield },
  { label: { en: 'Transaction history: deposit totals, methods used, cycle patterns', ua: 'Історія транзакцій: суми депозитів, методи, цикли' }, source: { en: 'transactions table (aggregate, Redis)', ua: 'таблиця transactions (агрегат, Redis)' }, Icon: TrendingUp },
  { label: { en: 'Sanctions + PEP screening result', ua: 'Результат перевірки санкцій + PEP' }, source: { en: 'External provider (ComplyAdvantage / WorldCheck) — cached per user', ua: 'Зовнішній провайдер (ComplyAdvantage / WorldCheck) -- кешується на користувача' }, Icon: Search },
]

const REQUEST_FLOW: { text: I18n; type: 'normal' | 'block' | 'pass' | 'async' }[] = [
  { text: { en: 'Limits & Rules engine calls KYC check: (user_id, brand_id, amount, direction)', ua: 'Limits & Rules engine викликає KYC check: (user_id, brand_id, amount, direction)' }, type: 'normal' },
  { text: { en: 'Load user KYC level from cache (Redis) or DB', ua: 'Завантажити KYC рівень з кешу (Redis) або БД' }, type: 'normal' },
  { text: { en: 'Check: does this operation require a higher KYC level than user currently has?', ua: 'Перевірка: чи потребує ця операція вищого KYC рівня?' }, type: 'normal' },
  { text: { en: 'If YES → return KYC_REQUIRED with required_level + redirect_url', ua: 'Якщо ТАК → повернути KYC_REQUIRED з required_level + redirect_url' }, type: 'block' },
  { text: { en: 'If NO → return PASS to Limits & Rules engine', ua: 'Якщо НІ → повернути PASS до Limits & Rules engine' }, type: 'pass' },
  { text: { en: 'Async: run AML pattern checks against transaction history (non-blocking)', ua: 'Async: запустити AML перевірки по історії транзакцій (не блокує)' }, type: 'async' },
  { text: { en: 'Async: if AML flag triggered → write to aml_flags table + notify compliance queue', ua: 'Async: якщо AML спрацював → записати в aml_flags + повідомити чергу комплаєнсу' }, type: 'async' },
]

const ERROR_CODES: { code: string; http: string; desc: I18n; playerMsg: I18n }[] = [
  { code: 'KYC_REQUIRED',          http: '422', desc: { en: 'Operation requires higher KYC level than user has', ua: 'Операція потребує вищого KYC рівня' }, playerMsg: { en: '"Verify your identity to continue"', ua: '"Підтвердіть особу для продовження"' } },
  { code: 'KYC_DOCUMENTS_PENDING', http: '422', desc: { en: 'User submitted documents but review is in progress', ua: 'Документи подано, перевірка триває' }, playerMsg: { en: '"Your documents are under review (up to 24h)"', ua: '"Ваші документи перевіряються (до 24год)"' } },
  { code: 'KYC_DOCUMENTS_REJECTED',http: '422', desc: { en: 'Submitted documents were rejected — resubmission needed', ua: 'Документи відхилено -- потрібно надіслати знову' }, playerMsg: { en: '"Documents rejected — please re-submit"', ua: '"Документи відхилено -- надішліть знову"' } },
  { code: 'SANCTIONS_HIT',         http: '403', desc: { en: 'Player matches a sanctions list — account frozen', ua: 'Гравець у списку санкцій -- акаунт заморожено' }, playerMsg: { en: '"Your account has been restricted. Contact support."', ua: '"Ваш акаунт обмежено. Зверніться до підтримки."' } },
  { code: 'EDD_REQUIRED',          http: '422', desc: { en: 'Transaction triggers Enhanced Due Diligence threshold', ua: 'Транзакція перевищує поріг EDD' }, playerMsg: { en: '"Please provide source of funds documentation"', ua: '"Надайте документи про джерело коштів"' } },
]

const BEST_PRACTICES: { icon: React.ElementType; title: I18n; items: I18n[] }[] = [
  {
    icon: Scale,
    title: { en: 'KYC vs AML -- keep them separate', ua: 'KYC і AML -- тримати окремо' },
    items: [
      { en: 'KYC = synchronous gate: "is this user verified enough for this operation?" Always blocks if not.', ua: 'KYC = синхронний гейт: "чи верифікований гравець для цієї операції?" Завжди блокує якщо ні.' },
      { en: 'AML = async monitoring: "does this transaction look suspicious?" Almost never blocks synchronously, except sanctions.', ua: 'AML = async моніторинг: "чи підозріла ця транзакція?" Майже ніколи не блокує синхронно, окрім санкцій.' },
      { en: 'Do not conflate the two -- mixing them leads to over-blocking legitimate transactions or under-flagging suspicious ones.', ua: 'Не змішуйте ці два поняття -- змішування призводить до блокування легітимних транзакцій або пропуску підозрілих.' },
    ],
  },
  {
    icon: BookOpen,
    title: { en: 'Phase 3 scope -- what to build now', ua: 'Scope Phase 3 -- що будувати зараз' },
    items: [
      { en: 'Manual document review is acceptable for launch -- no need for automated provider (Onfido, Sumsub) in Phase 3.', ua: 'Ручна перевірка документів прийнятна на старті -- автоматизований провайдер (Onfido, Sumsub) не потрібен в Phase 3.' },
      { en: 'Build the KYC level model and gates now; swap in automated provider later without changing the gate logic.', ua: 'Побудуйте модель KYC рівнів і гейти зараз; автоматизований провайдер можна підключити пізніше без зміни логіки.' },
      { en: 'AML for Phase 3: sanctions screening (blocking) + basic transaction pattern flags (non-blocking). Full monitoring rules in Phase 6.', ua: 'AML для Phase 3: перевірка санкцій (блокує) + базові флаги патернів (не блокують). Повні правила моніторингу в Phase 6.' },
    ],
  },
  {
    icon: Lock,
    title: { en: 'Data, privacy, compliance', ua: 'Дані, приватність, комплаєнс' },
    items: [
      { en: 'KYC documents: encrypted at rest, access-logged, retention policy per jurisdiction (typically 5--7 years after account closure).', ua: 'KYC документи: шифрування at rest, лог доступу, retention policy за юрисдикцією (зазвичай 5--7 років після закриття акаунту).' },
      { en: 'AML flags must never be visible to the player -- they go to an internal compliance queue only.', ua: 'AML-мітки не мають бути видимі гравцю -- тільки внутрішня черга комплаєнсу.' },
      { en: 'GDPR: player can request data deletion, but AML/KYC records are exempt from erasure (legal obligation overrides right to erasure).', ua: 'GDPR: гравець може запросити видалення даних, але AML/KYC записи звільнені від видалення (юридичне зобовʼязання переважає право на видалення).' },
      { en: 'Sanctions re-screening: run at registration AND on a scheduled basis (e.g. weekly batch) -- lists change over time.', ua: 'Повторна перевірка санкцій: при реєстрації І за розкладом (напр. щотижневий batch) -- списки змінюються.' },
    ],
  },
  {
    icon: TrendingUp,
    title: { en: 'Performance', ua: 'Продуктивність' },
    items: [
      { en: 'Cache KYC level per user in Redis (TTL 60s) -- it is read on every payment request.', ua: 'Кешувати KYC рівень в Redis (TTL 60s) -- читається при кожному платіжному запиті.' },
      { en: 'Cache sanctions screening result per user (TTL 24h) -- external API calls are slow and expensive.', ua: 'Кешувати результат перевірки санкцій (TTL 24h) -- зовнішні API виклики повільні та дорогі.' },
      { en: 'AML pattern checks run asynchronously via a job queue after the transaction is committed -- never on the hot path.', ua: 'AML патерн-перевірки виконуються асинхронно через job queue після коміту транзакції -- ніколи на гарячому шляху.' },
      { en: 'KYC status webhook from provider should update DB and invalidate Redis cache immediately.', ua: 'Webhook від KYC провайдера має одразу оновити БД та інвалідувати кеш Redis.' },
    ],
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const [lang, setLang] = useState<Lang>('en')
  const ua = lang === 'ua'

  return (
    <DocLayout
      title="KYC | AML"
      breadcrumbLabel="Payment Infrastructure"
      breadcrumbHref="/sandbox/payment-infra"
      parentCrumb={{ label: 'Sandbox', href: '/sandbox' }}
      description={ua
        ? 'Верифікація особи гравця та моніторинг підозрілих фінансових операцій'
        : 'Player identity verification and suspicious financial activity monitoring'}
      tags={[
        { label: 'Phase 3', type: 'tag'    },
        { label: 'Spec',    type: 'status' },
      ]}
      titleExtra={<LangSwitcher lang={lang} onChange={setLang} />}
      footnote="DEPO44 | KYC | AML SPEC v1 | PHASE 3"
    >

      {/* ── Intro ─────────────────────────────────────────────────────────── */}
      <InfoCard>
        {ua
          ? <><strong>KYC (Know Your Customer)</strong> та <strong>AML (Anti-Money Laundering)</strong> -- два різних, але пов'язаних механізми. KYC -- це синхронний гейт: перевіряє, чи достатньо верифікований гравець для конкретної операції, і блокує її якщо ні. AML -- асинхронний моніторинг: аналізує патерни транзакцій і флагує підозрілі для ручного огляду compliance-командою. Обидва обов'язкові для більшості гемблінг-ліцензій. Єдина точка перетину -- санкційний скринінг, який блокує синхронно.</>
          : <><strong>KYC (Know Your Customer)</strong> and <strong>AML (Anti-Money Laundering)</strong> are two distinct but related mechanisms. KYC is a synchronous gate: it checks whether the player is sufficiently verified for a specific operation and blocks it if not. AML is async monitoring: it analyses transaction patterns and flags suspicious ones for manual review by the compliance team. Both are required for most gambling licences. The only synchronous overlap is sanctions screening, which blocks immediately.</>
        }
      </InfoCard>

      <WarnCard>
        {ua
          ? <>AML прапори <strong>ніколи не показуються гравцю</strong> і в переважній більшості випадків <strong>не блокують транзакцію</strong>. Виняток -- санкційний hit: він одразу заморожує акаунт. Змішування KYC і AML в одному потоці -- поширена помилка, яка призводить до надмірного блокування.</>
          : <>AML flags are <strong>never shown to the player</strong> and in the vast majority of cases <strong>do not block the transaction</strong>. The exception is a sanctions hit: it immediately freezes the account. Conflating KYC and AML into one flow is a common mistake that leads to over-blocking. <span className="text-amber-500 font-semibold">[TO BE DISCUSSED]</span></>
        }
      </WarnCard>

      {/* ── Section 1: Purpose ────────────────────────────────────────────── */}
      <DocSection num="1" title={ua ? 'Призначення' : 'Purpose'}>
        <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2 mb-6">
          {[
            { Icon: UserCheck,     title: { en: 'Identity verification (KYC)',  ua: 'Верифікація особи (KYC)' },    desc: { en: 'Confirm the player is who they say they are before allowing financial activity above thresholds. Required by gambling regulation in every licensed market.', ua: 'Підтвердити особу гравця перед допуском до фінансових операцій вище порогу. Обовʼязкова вимога гемблінг-регулятора в кожному ліцензованому ринку.' } },
            { Icon: Shield,        title: { en: 'Age verification',              ua: 'Перевірка віку' },             desc: { en: 'Confirm player is 18+ (or legal gambling age in their jurisdiction) before first deposit. Non-negotiable.', ua: 'Підтвердити 18+ (або легальний вік для гемблінгу в юрисдикції) перед першим депозитом. Не підлягає обговоренню.' } },
            { Icon: Search,        title: { en: 'Sanctions screening',           ua: 'Перевірка санкцій' },          desc: { en: 'Screen player name and date of birth against OFAC, EU, and UN sanctions lists at registration and periodically. Synchronous block on hit.', ua: 'Перевірка імені та дати народження за списками санкцій OFAC, ЄС, ООН при реєстрації та регулярно. Синхронне блокування при збігу.' } },
            { Icon: Flag,          title: { en: 'AML transaction monitoring',    ua: 'AML моніторинг транзакцій' }, desc: { en: 'Detect suspicious patterns: rapid deposit--withdrawal cycles, structuring, large transactions. Flag for compliance review -- almost never auto-block.', ua: 'Виявляти підозрілі патерни: швидкі цикли депозит--виведення, structuring, великі транзакції. Флаги для комплаєнсу -- майже ніколи автоматичне блокування.' } },
            { Icon: FileText,      title: { en: 'Regulatory reporting',          ua: 'Регуляторна звітність' },      desc: { en: 'File mandatory Currency Transaction Reports (CTR) for large transactions and Suspicious Activity Reports (SAR) when warranted. Jurisdiction-specific.', ua: 'Подавати обовʼязкові звіти CTR для великих транзакцій та SAR при підозрілій активності. Залежить від юрисдикції.' } },
            { Icon: Eye,           title: { en: 'PEP screening',                 ua: 'Перевірка PEP' },              desc: { en: 'Identify Politically Exposed Persons for enhanced due diligence. PEP status alone does not block -- triggers Level 3 KYC requirement.', ua: 'Виявляти Politically Exposed Persons для посиленої перевірки. PEP статус сам по собі не блокує -- ініціює вимогу KYC рівня 3.' } },
          ].map((card) => (
            <div key={card.title.en} className="border border-border rounded-2xl p-4 flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <card.Icon className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-0.5">{card.title[lang]}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{card.desc[lang]}</p>
              </div>
            </div>
          ))}
        </div>
      </DocSection>

      {/* ── Section 2: How information flows ──────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="2" title={ua ? 'Де знаходиться і як передається інформація' : 'Where it sits and how information flows'}>

        {/* Position in stack */}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {ua ? 'Позиція в стеку' : 'Position in the stack'}
        </p>
        <div className="border border-border rounded-2xl p-4 mb-6">
          <div className="flex flex-col gap-4">
            {[
              { label: { en: 'Limits & Rules engine', ua: 'Limits & Rules engine' }, note: { en: 'calls KYC check as one of its rules', ua: 'викликає KYC check як одне зі своїх правил' }, active: false },
              { label: { en: 'KYC | AML Service ← YOU ARE HERE', ua: 'KYC | AML Service ← ВИ ТУТ' }, note: { en: 'returns PASS or KYC_REQUIRED; fires AML checks async', ua: 'повертає PASS або KYC_REQUIRED; запускає AML async' }, active: true },
              { label: { en: 'Orchestrator (only reached on PASS)', ua: 'Orchestrator (тільки при PASS)' }, note: { en: 'selects PSP, applies cascade logic', ua: 'обирає PSP, каскадна логіка' }, active: false },
              { label: { en: 'Compliance queue (async, AML only)', ua: 'Черга комплаєнсу (async, тільки AML)' }, note: { en: 'compliance officer reviews flagged transactions', ua: 'офіцер комплаєнсу переглядає позначені транзакції' }, active: false },
            ].map((step, i, arr) => (
              <div key={i} className="relative flex items-center gap-3">
                {i < arr.length - 1 && (
                  <div className="absolute left-[9px] w-px bg-border"
                    style={{ top: '24px', height: 'calc(100% - 8px)' }} />
                )}
                <div className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-md text-xs font-bold z-10',
                  step.active ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground',
                )}>{i + 1}</div>
                <div>
                  <span className={cn('text-sm font-semibold', step.active ? 'text-emerald-500' : 'text-foreground')}>
                    {step.label[lang]}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">{step.note[lang]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Request flow */}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {ua ? 'Флоу виклику' : 'Invocation flow'}
        </p>
        <div className="border border-border rounded-2xl p-4 mb-6">
          <div className="flex flex-col gap-2">
            {REQUEST_FLOW.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-md text-xs font-bold tabular-nums mt-0.5',
                  step.type === 'async' ? 'bg-amber-500/10 text-amber-500' : 'bg-muted text-muted-foreground',
                )}>{i + 1}</div>
                <span className={cn(
                  'text-sm leading-snug',
                  step.type === 'block' ? 'text-destructive' :
                  step.type === 'pass'  ? 'text-success' :
                  step.type === 'async' ? 'text-amber-500' :
                  'text-foreground',
                )}>
                  {step.text[lang]}
                  {step.type === 'block' && <XCircle className="inline size-3.5 ml-1.5 mb-0.5" />}
                  {step.type === 'pass'  && <CheckCircle2 className="inline size-3.5 ml-1.5 mb-0.5" />}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Data inputs */}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {ua ? 'Вхідні дані та їх джерела' : 'Input data and sources'}
        </p>
        <div className="flex flex-col divide-y divide-border border border-border rounded-2xl overflow-hidden">
          {DATA_INPUTS.map((row) => (
            <div key={row.label.en} className="flex items-center gap-3 px-4 py-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <row.Icon className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground font-medium leading-snug">{row.label[lang]}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{row.source[lang]}</p>
              </div>
            </div>
          ))}
        </div>

      </DocSection>
      </div>

      {/* ── Section 3: Required at launch ─────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="3" title={ua ? 'Обовʼязкове на старті' : 'Required at launch'}>

        {/* KYC Levels */}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {ua ? 'Рівні KYC' : 'KYC levels'}
        </p>
        <div className="flex flex-col gap-3 mb-6">
          {KYC_LEVELS.map((lvl) => (
            <div key={lvl.level} className={cn('border rounded-2xl p-4', lvl.borderCls, lvl.bgCls + '/30')}>
              <div className="flex items-center gap-2 mb-3">
                <span className={cn('text-xs font-bold px-2 py-0.5 rounded border', lvl.colorCls, lvl.bgCls, lvl.borderCls)}>
                  Level {lvl.level}
                </span>
                <span className="text-sm font-semibold text-foreground">{lvl.name[lang]}</span>
              </div>
              <div className="grid grid-cols-1 gap-3 tablet:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">{ua ? 'Вимоги' : 'Requirements'}</p>
                  <ul className="flex flex-col gap-1">
                    {lvl.requirements.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <div className="size-1 rounded-full bg-muted-foreground/40 shrink-0 mt-1.5" />
                        {r[lang]}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">{ua ? 'Дозволяє' : 'Allows'}</p>
                  <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle2 className="size-3 shrink-0 mt-0.5 text-success" />
                    {lvl.allows[lang]}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">{ua ? 'Блокує' : 'Blocks'}</p>
                  <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <XCircle className="size-3 shrink-0 mt-0.5 text-destructive" />
                    {lvl.blocks[lang]}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AML rules */}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {ua ? 'AML правила' : 'AML rules'}
        </p>
        <DocTable className="mb-6">
          <DocTableHeader>
            <TableRow>
              <TableHead>{ua ? 'Тригер' : 'Trigger'}</TableHead>
              <TableHead>{ua ? 'Дія' : 'Action'}</TableHead>
              <TableHead>{ua ? 'Блокує?' : 'Blocks?'}</TableHead>
            </TableRow>
          </DocTableHeader>
          <TableBody>
            {AML_RULES.map((r, i) => (
              <TableRow key={i}>
                <TableCell>
                  <p className="text-sm font-medium text-foreground">{r.trigger[lang]}</p>
                  {r.note && <p className="text-xs text-muted-foreground mt-0.5">{r.note[lang]}</p>}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.action[lang]}</TableCell>
                <TableCell>
                  {r.blocks
                    ? <Badge variant="outline" className="text-xs bg-destructive-bg text-destructive border-destructive/30 whitespace-nowrap">{ua ? 'Так (миттєво)' : 'Yes (instant)'}</Badge>
                    : <Badge variant="outline" className="text-xs bg-muted text-muted-foreground whitespace-nowrap">{ua ? 'Ні (моніторинг)' : 'No (monitor)'}</Badge>
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DocTable>

        {/* Error codes */}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {ua ? 'Коди помилок' : 'Error codes'}
        </p>
        <DocTable className="mb-4">
          <DocTableHeader>
            <TableRow>
              <TableHead>{ua ? 'Код' : 'Code'}</TableHead>
              <TableHead>HTTP</TableHead>
              <TableHead>{ua ? 'Опис' : 'Description'}</TableHead>
              <TableHead>{ua ? 'Що бачить гравець' : 'Player message'}</TableHead>
            </TableRow>
          </DocTableHeader>
          <TableBody>
            {ERROR_CODES.map((r) => (
              <TableRow key={r.code}>
                <TableCell><code className="text-xs font-mono text-foreground">{r.code}</code></TableCell>
                <TableCell>
                  <span className={cn('text-xs font-semibold', r.http === '403' ? 'text-destructive' : 'text-amber-500')}>{r.http}</span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.desc[lang]}</TableCell>
                <TableCell className="text-xs text-muted-foreground italic">{r.playerMsg[lang]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DocTable>

        {/* Response example */}
        <div className="border border-border rounded-2xl overflow-hidden mb-4">
          <div className="flex items-center justify-between px-3 py-2 bg-muted border-b border-border">
            <span className="text-xs font-mono text-muted-foreground">HTTP 422 -- KYC_REQUIRED response</span>
            <Badge variant="outline" className="text-xs bg-destructive-bg text-destructive border-destructive/30 pointer-events-none">Blocked</Badge>
          </div>
          <pre className="text-xs font-mono text-foreground p-4 leading-relaxed overflow-x-auto bg-card">{`{
  "error": "KYC_REQUIRED",
  "message": "Identity verification is required to continue.",
  "required_level": 2,
  "current_level": 1,
  "kyc_redirect_url": "/kyc/verify?return_to=/deposit"
}`}</pre>
        </div>

        {/* DB schema */}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {ua ? 'Мінімальна схема БД для Phase 3' : 'Minimum DB schema for Phase 3'}
        </p>
        <div className="border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-muted border-b border-border">
            <AlertOctagon className="size-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{ua ? 'KYC документи -- encrypted at rest, retention per jurisdiction' : 'KYC documents -- encrypted at rest, retention per jurisdiction'}</span>
          </div>
          <pre className="text-xs font-mono text-muted-foreground p-4 leading-relaxed overflow-x-auto bg-card">{`-- Current KYC status per user per brand
user_kyc_profiles (
  user_id, brand_id,
  kyc_level,           -- 0 | 1 | 2 | 3
  verified_at,
  provider,            -- 'manual' | 'onfido' | 'sumsub'
  sanctions_status,    -- 'clear' | 'hit' | 'pending'
  sanctions_checked_at,
  pep_status           -- 'clear' | 'hit' | 'pending'
)

-- Uploaded verification documents
kyc_documents (
  id, user_id, brand_id,
  type,        -- 'passport' | 'id_card' | 'driving_licence'
               -- 'proof_of_address' | 'source_of_funds' | 'selfie'
  status,      -- 'pending' | 'approved' | 'rejected'
  provider_ref,
  rejection_reason,
  created_at, reviewed_at
)

-- Append-only AML flags
aml_flags (
  id, user_id, brand_id, transaction_id,
  flag_type,   -- 'ctr' | 'rapid_cycle' | 'structuring'
               -- 'sanctions_hit' | 'pep' | 'multi_method'
  status,      -- 'open' | 'reviewed' | 'escalated' | 'closed'
  reviewed_by, reviewed_at,
  created_at
)`}</pre>
        </div>

      </DocSection>
      </div>

      {/* ── Section 4: Best practices ─────────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="4" title={ua ? 'Кращі практики' : 'Best practices'}>
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
          {BEST_PRACTICES.map((bp) => (
            <div key={bp.title.en} className="border border-border rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">{bp.title[lang]}</p>
              <ul className="flex flex-col gap-2">
                {bp.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="size-3.5 shrink-0 mt-0.5 text-success" />
                    <span>{item[lang]}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DocSection>
      </div>

    </DocLayout>
  )
}
