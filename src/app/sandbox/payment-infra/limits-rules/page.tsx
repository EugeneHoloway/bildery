'use client'

import { useState } from 'react'
import {
  SlidersHorizontal, Info, AlertTriangle, CheckCircle2, XCircle,
  ArrowRight, ShieldCheck, CreditCard, Wallet, UserCheck, Ban,
  TrendingUp, Lock, Scale, BookOpen, ArrowUpDown,
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

function BestPracticeCard({ title, items, lang }: { title: I18n; items: I18n[]; lang: Lang }) {
  return (
    <div className="border border-border rounded-2xl p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">{title[lang]}</p>
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="size-3.5 shrink-0 mt-0.5 text-success" />
            <span>{item[lang]}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────

interface LimitRow {
  rule: I18n
  scope: I18n
  value: I18n
  configurable: boolean
  note?: I18n
}

const TRANSACTION_LIMITS: LimitRow[] = [
  {
    rule:  { en: 'Min deposit per transaction',  ua: 'Мінімальний депозит за транзакцію'  },
    scope: { en: 'brand + method + currency + country', ua: 'бренд + метод + валюта + країна' },
    value: { en: 'e.g. $10 (configurable)',      ua: 'напр. $10 (налаштовується)'         },
    configurable: true,
    note:  { en: 'PSP may impose its own floor — effective min = max(brand_min, psp_min)', ua: 'PSP може мати власний мінімум -- ефективний min = max(brand_min, psp_min)' },
  },
  {
    rule:  { en: 'Max deposit per transaction',  ua: 'Максимальний депозит за транзакцію' },
    scope: { en: 'brand + method + currency + country', ua: 'бренд + метод + валюта + країна' },
    value: { en: 'e.g. $5 000 (configurable)',   ua: 'напр. $5 000 (налаштовується)'      },
    configurable: true,
    note:  { en: 'PSP may impose its own ceiling — effective max = min(brand_max, psp_max)', ua: 'PSP може мати власний максимум -- ефективний max = min(brand_max, psp_max)' },
  },
  {
    rule:  { en: 'Min withdrawal per transaction', ua: 'Мінімальне виведення за транзакцію' },
    scope: { en: 'brand + method + currency + country', ua: 'бренд + метод + валюта + країна' },
    value: { en: 'e.g. $20 (configurable)',        ua: 'напр. $20 (налаштовується)'           },
    configurable: true,
  },
  {
    rule:  { en: 'Max withdrawal per transaction', ua: 'Максимальне виведення за транзакцію' },
    scope: { en: 'brand + method + currency + country', ua: 'бренд + метод + валюта + країна' },
    value: { en: 'e.g. $10 000 (configurable)',    ua: 'напр. $10 000 (налаштовується)'      },
    configurable: true,
  },
  {
    rule:  { en: 'Manual approval threshold (withdrawal)', ua: 'Поріг ручного підтвердження (виведення)' },
    scope: { en: 'brand + method',                         ua: 'бренд + метод'                           },
    value: { en: 'e.g. > $2 000 (configurable)',           ua: 'напр. > $2 000 (налаштовується)'         },
    configurable: true,
    note:  { en: 'Withdrawal is created with status PENDING_MANUAL_REVIEW, not sent to PSP until ops approves', ua: 'Виведення створюється зі статусом PENDING_MANUAL_REVIEW -- не відправляється в PSP до підтвердження ops' },
  },
]

const ACCUMULATION_LIMITS: LimitRow[] = [
  {
    rule:  { en: 'Daily deposit cap',     ua: 'Добовий ліміт депозитів'        },
    scope: { en: 'user + brand',          ua: 'користувач + бренд'             },
    value: { en: 'Brand default; overrideable by player (RG)', ua: 'Бранд за замовчуванням; гравець може знизити (RG)' },
    configurable: true,
    note:  { en: 'Required for gambling licenses in most jurisdictions', ua: 'Обовʼязково для більшості гемблінг-ліцензій' },
  },
  {
    rule:  { en: 'Weekly deposit cap',    ua: 'Тижневий ліміт депозитів'       },
    scope: { en: 'user + brand',          ua: 'користувач + бренд'             },
    value: { en: 'Brand default; overrideable by player (RG)', ua: 'Бранд за замовчуванням; гравець може знизити (RG)' },
    configurable: true,
  },
  {
    rule:  { en: 'Monthly deposit cap',   ua: 'Місячний ліміт депозитів'       },
    scope: { en: 'user + brand',          ua: 'користувач + бренд'             },
    value: { en: 'Brand default; overrideable by player (RG)', ua: 'Бранд за замовчуванням; гравець може знизити (RG)' },
    configurable: true,
  },
  {
    rule:  { en: 'Max pending withdrawals', ua: 'Максимум очікуючих виведень'  },
    scope: { en: 'user',                    ua: 'користувач'                   },
    value: { en: '1–3 (configurable)',      ua: '1–3 (налаштовується)'         },
    configurable: true,
    note:  { en: 'Prevents abuse: player creates many pending requests, then reverses', ua: 'Запобігає зловживанням: гравець не може відкрити безліч запитів на виведення' },
  },
  {
    rule:  { en: 'AML reporting threshold',  ua: 'Поріг звітності AML'         },
    scope: { en: 'transaction',              ua: 'транзакція'                   },
    value: { en: '$10 000 (jurisdiction)',   ua: '$10 000 (юрисдикція)'         },
    configurable: false,
    note:  { en: 'Triggers manual review or CTR flag; values set by regulator', ua: 'Запускає ручну перевірку або CTR; значення задає регулятор' },
  },
]

interface KycRow {
  gate: I18n
  threshold: I18n
  action: I18n
  direction: 'deposit' | 'withdrawal' | 'both'
}

const KYC_GATES: KycRow[] = [
  {
    gate:      { en: 'No KYC (anonymous)',              ua: 'Без KYC (анонімний)'                },
    threshold: { en: 'Cumulative deposits < $X',        ua: 'Сума депозитів < $X'                },
    action:    { en: 'Allow deposit',                   ua: 'Дозволити депозит'                  },
    direction: 'deposit',
  },
  {
    gate:      { en: 'KYC Level 1 required',            ua: 'Потрібен KYC рівень 1'              },
    threshold: { en: 'Cumulative deposits ≥ $X',        ua: 'Сума депозитів ≥ $X'               },
    action:    { en: 'Block deposit → redirect to KYC flow', ua: 'Блокувати депозит → KYC флоу' },
    direction: 'deposit',
  },
  {
    gate:      { en: 'KYC required for all withdrawals', ua: 'KYC для будь-якого виведення'       },
    threshold: { en: 'Any amount',                       ua: 'Будь-яка сума'                      },
    action:    { en: 'Block withdrawal until KYC approved', ua: 'Блокувати до підтвердження KYC' },
    direction: 'withdrawal',
  },
  {
    gate:      { en: 'Enhanced Due Diligence (EDD)',     ua: 'Розширена перевірка (EDD)'          },
    threshold: { en: 'Single transaction > $X or monthly > $Y', ua: 'Транзакція > $X або місяць > $Y' },
    action:    { en: 'Flag for manual review + request source of funds', ua: 'Мітка для ручного огляду + джерело коштів' },
    direction: 'both',
  },
]

const REQUEST_FLOW: I18n[] = [
  { en: 'Request arrives from Request Router (user_id, brand_id, amount, currency, direction, method)', ua: 'Запит надходить від Request Router (user_id, brand_id, amount, currency, direction, method)' },
  { en: 'Load user context: KYC level, self-exclusion status, active limits, accumulated totals', ua: 'Завантажити контекст гравця: рівень KYC, self-exclusion, активні ліміти, накопичені суми' },
  { en: 'Load brand config: min/max per method, daily/weekly/monthly caps, KYC thresholds', ua: 'Завантажити конфіг бренду: min/max per method, денні/тижневі/місячні ліміти, пороги KYC' },
  { en: 'Evaluate rules in order (short-circuit on first BLOCK)', ua: 'Виконати правила по порядку (зупинитись на першому BLOCK)' },
  { en: 'If ALLOW → pass to Orchestrator with enriched context', ua: 'Якщо ALLOW → передати до Orchestrator з розширеним контекстом' },
  { en: 'If BLOCK → return structured error to Request Router → 422 to frontend', ua: 'Якщо BLOCK → повернути структуровану помилку до Request Router → 422 на фронтенд' },
  { en: 'Write audit log entry regardless of result', ua: 'Записати аудит-лог незалежно від результату' },
]

const RULE_ORDER: { label: I18n; reason: I18n; colorCls: string; bgCls: string; borderCls: string }[] = [
  {
    label:  { en: '1. Self-exclusion / cooling-off check', ua: '1. Self-exclusion / cooling-off перевірка' },
    reason: { en: 'Regulatory. Must block first -- no exceptions.',  ua: 'Регуляторна вимога. Блокує все, без винятків.' },
    colorCls: 'text-destructive', bgCls: 'bg-destructive-bg', borderCls: 'border-destructive/30',
  },
  {
    label:  { en: '2. Account status check (suspended / locked)', ua: '2. Статус акаунту (заблоковано / призупинено)' },
    reason: { en: 'Operational. Account must be active.',           ua: 'Операційна. Акаунт має бути активним.' },
    colorCls: 'text-destructive', bgCls: 'bg-destructive-bg', borderCls: 'border-destructive/30',
  },
  {
    label:  { en: '3. KYC gate check',                             ua: '3. Перевірка KYC gate'                         },
    reason: { en: 'Compliance. Required before financial activity.', ua: 'Комплаєнс. Обовʼязкова до фінансових операцій.' },
    colorCls: 'text-amber-500', bgCls: 'bg-amber-500/10', borderCls: 'border-amber-500/30',
  },
  {
    label:  { en: '4. Transaction min/max check',                  ua: '4. Перевірка min/max транзакції'               },
    reason: { en: 'Business rule. Reject invalid amounts early.',    ua: 'Бізнес-правило. Відхилити невалідну суму одразу.' },
    colorCls: 'text-sky-500', bgCls: 'bg-sky-500/10', borderCls: 'border-sky-500/20',
  },
  {
    label:  { en: '5. Daily / weekly / monthly cap check',         ua: '5. Перевірка денного/тижневого/місячного ліміту' },
    reason: { en: 'Responsible gambling + compliance.',             ua: 'Відповідальна гра + комплаєнс.' },
    colorCls: 'text-sky-500', bgCls: 'bg-sky-500/10', borderCls: 'border-sky-500/20',
  },
  {
    label:  { en: '6. Withdrawal: balance check',                  ua: '6. Виведення: перевірка балансу'               },
    reason: { en: 'Cannot withdraw more than available balance.',   ua: 'Не можна вивести більше доступного балансу.' },
    colorCls: 'text-sky-500', bgCls: 'bg-sky-500/10', borderCls: 'border-sky-500/20',
  },
  {
    label:  { en: '7. Withdrawal: wagering / bonus lock check',    ua: '7. Виведення: перевірка вейджеру / бонус-локу'  },
    reason: { en: 'Active bonus wager must be completed first.',    ua: 'Активний вейджер має бути виконаний.' },
    colorCls: 'text-sky-500', bgCls: 'bg-sky-500/10', borderCls: 'border-sky-500/20',
  },
  {
    label:  { en: '8. AML large transaction flag',                 ua: '8. AML прапор великої транзакції'              },
    reason: { en: 'Does not block; flags for monitoring queue.',    ua: 'Не блокує; ставить мітку в чергу моніторингу.' },
    colorCls: 'text-muted-foreground', bgCls: 'bg-muted', borderCls: 'border-border',
  },
]

interface ErrorCodeRow {
  code: string
  http: string
  desc: I18n
  whoSees: I18n
}

const ERROR_CODES: ErrorCodeRow[] = [
  { code: 'SELF_EXCLUDED',          http: '403', desc: { en: 'User is self-excluded or on cooling-off period', ua: 'Користувач на self-exclusion або cooling-off' }, whoSees: { en: 'Player sees: "Your account is temporarily restricted"', ua: 'Гравець бачить: "Ваш обліковий запис тимчасово обмежено"' } },
  { code: 'ACCOUNT_LOCKED',         http: '403', desc: { en: 'Account is suspended or locked by ops', ua: 'Акаунт заблоковано операційною командою' }, whoSees: { en: 'Player sees: "Please contact support"', ua: 'Гравець бачить: "Зверніться до підтримки"' } },
  { code: 'KYC_REQUIRED',           http: '422', desc: { en: 'KYC verification required before this transaction', ua: 'Потрібна KYC верифікація перед цією транзакцією' }, whoSees: { en: 'Player sees: "Verify your identity to continue"', ua: 'Гравець бачить: "Підтвердіть особу для продовження"' } },
  { code: 'AMOUNT_BELOW_MINIMUM',   http: '422', desc: { en: 'Amount is below the configured minimum',  ua: 'Сума нижче налаштованого мінімуму' }, whoSees: { en: 'Player sees min amount in the UI', ua: 'Гравець бачить мінімальну суму в UI' } },
  { code: 'AMOUNT_ABOVE_MAXIMUM',   http: '422', desc: { en: 'Amount exceeds the configured maximum',   ua: 'Сума перевищує налаштований максимум' }, whoSees: { en: 'Player sees max amount in the UI', ua: 'Гравець бачить максимальну суму в UI' } },
  { code: 'DAILY_LIMIT_REACHED',    http: '422', desc: { en: 'Player has hit their daily deposit cap',  ua: 'Гравець досяг денного ліміту депозитів' }, whoSees: { en: 'Player sees remaining cap + reset time', ua: 'Гравець бачить залишок ліміту та час скидання' } },
  { code: 'WEEKLY_LIMIT_REACHED',   http: '422', desc: { en: 'Player has hit their weekly deposit cap', ua: 'Гравець досяг тижневого ліміту' }, whoSees: { en: 'Player sees remaining cap + reset time', ua: 'Гравець бачить залишок ліміту та час скидання' } },
  { code: 'MONTHLY_LIMIT_REACHED',  http: '422', desc: { en: 'Player has hit their monthly deposit cap', ua: 'Гравець досяг місячного ліміту' }, whoSees: { en: 'Player sees remaining cap + reset time', ua: 'Гравець бачить залишок ліміту та час скидання' } },
  { code: 'INSUFFICIENT_BALANCE',   http: '422', desc: { en: 'Withdrawal amount exceeds available balance', ua: 'Сума виведення перевищує доступний баланс' }, whoSees: { en: 'Player sees current balance', ua: 'Гравець бачить поточний баланс' } },
  { code: 'WAGER_NOT_COMPLETE',     http: '422', desc: { en: 'Active bonus has an unfulfilled wagering requirement', ua: 'Активний бонус має невиконаний вейджер' }, whoSees: { en: 'Player sees wager progress', ua: 'Гравець бачить прогрес вейджеру' } },
  { code: 'MAX_PENDING_WITHDRAWALS',http: '422', desc: { en: 'Player already has max pending withdrawal requests', ua: 'У гравця вже максимум запитів на виведення' }, whoSees: { en: 'Player sees pending count', ua: 'Гравець бачить кількість очікуючих' } },
]

const BEST_PRACTICES: { icon: React.ElementType; title: I18n; items: I18n[] }[] = [
  {
    icon: BookOpen,
    title: { en: 'Configuration', ua: 'Конфігурація' },
    items: [
      { en: 'All limits stored in DB (brand_limits table), not hardcoded -- ops team must be able to change them without a deploy', ua: 'Всі ліміти зберігаються в БД (таблиця brand_limits), не в коді -- ops команда повинна мінити їх без деплою' },
      { en: 'Player self-set limits (responsible gambling) stored separately and can only be decreased, never increased without a cooling-off period', ua: 'Ліміти, встановлені гравцем (RG), зберігаються окремо і можуть тільки знижуватись; підвищення -- лише після cooling-off' },
      { en: 'Default brand limits applied on brand creation -- never null in production', ua: 'Дефолтні ліміти бренду застосовуються при створенні бренду -- в production ніколи не null' },
    ],
  },
  {
    icon: TrendingUp,
    title: { en: 'Performance', ua: 'Продуктивність' },
    items: [
      { en: 'Cache user KYC level and self-exclusion status in Redis (TTL ~60s) -- these are hot-path reads', ua: 'Кешувати KYC рівень та self-exclusion в Redis (TTL ~60s) -- це гарячий шлях читання' },
      { en: 'Pre-compute and cache accumulated totals (daily/weekly/monthly sums) -- recompute on each transaction, not on each check', ua: 'Кешувати накопичені суми (день/тиждень/місяць) -- перераховувати при кожній транзакції, не при кожній перевірці' },
      { en: 'Short-circuit on first BLOCK -- do not run all 8 checks if rule 1 already blocks', ua: 'Зупинятись на першому BLOCK -- не виконувати всі 8 перевірок, якщо правило 1 вже блокує' },
      { en: 'Total overhead target: < 5ms (rules evaluation only, excluding network)', ua: 'Цільовий overhead: < 5ms (тільки обчислення правил, без мережі)' },
    ],
  },
  {
    icon: Scale,
    title: { en: 'Compliance & Audit', ua: 'Комплаєнс та Аудит' },
    items: [
      { en: 'Write an audit log entry for every rule evaluation -- include: user_id, brand_id, direction, amount, rule triggered, result, timestamp', ua: 'Записувати аудит-лог для кожного виклику -- включати: user_id, brand_id, direction, amount, правило, результат, timestamp' },
      { en: 'Audit logs must be immutable -- append-only, no updates. Required for regulatory audits', ua: 'Аудит-логи мають бути незмінними -- тільки append. Потрібно для регуляторних перевірок' },
      { en: 'Self-exclusion changes: 24h propagation delay by law in some jurisdictions -- design accordingly', ua: 'Self-exclusion: в деяких юрисдикціях закон вимагає 24h затримку набрання чинності -- врахуйте в дизайні' },
      { en: 'AML flags must not surface to the player -- send to internal monitoring queue silently', ua: 'AML-мітки не мають бути видимі гравцю -- відправляти у внутрішню чергу моніторингу тихо' },
    ],
  },
  {
    icon: Lock,
    title: { en: 'Frontend contract', ua: 'Контракт з фронтендом' },
    items: [
      { en: 'Always return remaining_cap in the error payload for limit-related blocks -- frontend shows "You have $X left today"', ua: 'Завжди повертати remaining_cap у payload помилки -- фронтенд показує "У вас залишилось $X сьогодні"' },
      { en: 'Return reset_at timestamp for cap limits -- frontend shows countdown to reset', ua: 'Повертати reset_at timestamp для cap-лімітів -- фронтенд показує відлік до скидання' },
      { en: 'KYC_REQUIRED must include kyc_redirect_url so frontend can route without hardcoding paths', ua: 'KYC_REQUIRED має включати kyc_redirect_url -- фронтенд не хардкодить шляхи' },
      { en: 'Pre-validate amounts client-side too (fetch limits on checkout load) -- but always enforce server-side; client is UX only', ua: 'Валідувати суми на клієнті теж (завантажити ліміти при відкритті чекауту) -- але сервер завжди обовʼязковий; клієнт -- тільки UX' },
    ],
  },
]

const DATA_INPUTS: { label: I18n; source: I18n; Icon: React.ElementType }[] = [
  { label: { en: 'user_id, brand_id, amount, currency, direction', ua: 'user_id, brand_id, amount, currency, direction' }, source: { en: 'from Request Router (JWT context)', ua: 'від Request Router (JWT контекст)' }, Icon: ArrowUpDown },
  { label: { en: 'KYC level, self-exclusion status, account status', ua: 'Рівень KYC, self-exclusion, статус акаунту' }, source: { en: 'users table (cached in Redis)', ua: 'таблиця users (кешується в Redis)' }, Icon: UserCheck },
  { label: { en: 'Min/max per method, KYC thresholds, brand caps', ua: 'Min/max per method, KYC пороги, ліміти бренду' }, source: { en: 'brand_limits table (cached)', ua: 'таблиця brand_limits (кешується)' }, Icon: SlidersHorizontal },
  { label: { en: 'Accumulated deposit/withdrawal sums (day/week/month)', ua: 'Накопичені суми депозитів/виведень (день/тиждень/місяць)' }, source: { en: 'transactions table aggregate (Redis cache)', ua: 'агрегат таблиці transactions (Redis кеш)' }, Icon: TrendingUp },
  { label: { en: 'Player self-set responsible gambling limits', ua: 'Ліміти відповідальної гри, встановлені гравцем' }, source: { en: 'player_limits table', ua: 'таблиця player_limits' }, Icon: ShieldCheck },
  { label: { en: 'Active bonus wager requirements, locked balance', ua: 'Активні вейджери бонусів, заблокований баланс' }, source: { en: 'Bonus Engine (async query)', ua: 'Bonus Engine (async запит)' }, Icon: Lock },
  { label: { en: 'Available balance (real money only, excl. bonus)', ua: 'Доступний баланс (реальні гроші без бонусів)' }, source: { en: 'Wallet Engine (real-time)', ua: 'Wallet Engine (реальний час)' }, Icon: Wallet },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const [lang, setLang] = useState<Lang>('en')
  const ua = lang === 'ua'

  return (
    <DocLayout
      title="Limits & Rules"
      breadcrumbLabel="Payment Infrastructure"
      breadcrumbHref="/sandbox/payment-infra"
      parentCrumb={{ label: 'Sandbox', href: '/sandbox' }}
      description={ua
        ? 'Централізований движок правил для депозитів та виведень -- ліміти, KYC-гейти, відповідальна гра, AML'
        : 'Centralised rules engine for deposits and withdrawals -- limits, KYC gates, responsible gambling, AML'}
      tags={[
        { label: 'Phase 3', type: 'tag'    },
        { label: 'Spec',    type: 'status' },
      ]}
      titleExtra={<LangSwitcher lang={lang} onChange={setLang} />}
      footnote="DEPO44 | LIMITS & RULES SPEC v1 | PHASE 3"
    >

      {/* ── Intro ─────────────────────────────────────────────────────────── */}
      <InfoCard>
        {ua
          ? <>
              <strong>Limits & Rules</strong> -- це окремий шар в Orchestration Layer, який виконується <em>після</em> Request Router і <em>до</em> того, як Orchestrator обирає PSP. Він перевіряє кожну платіжну операцію по набору упорядкованих правил і повертає <strong>ALLOW</strong> або <strong>BLOCK</strong> з кодом причини. Жодна транзакція не досягає PSP без проходження цього шару. Це єдина точка відповідальності за бізнес-правила, комплаєнс та відповідальну гру.
            </>
          : <>
              <strong>Limits & Rules</strong> is a dedicated layer inside the Orchestration Layer that runs <em>after</em> the Request Router and <em>before</em> the Orchestrator selects a PSP. It evaluates every payment operation against an ordered set of rules and returns <strong>ALLOW</strong> or <strong>BLOCK</strong> with a reason code. No transaction reaches a PSP without passing through this layer. It is the single source of truth for business rules, compliance, and responsible gambling enforcement.
            </>
        }
      </InfoCard>

      <WarnCard>
        {ua
          ? <>Ніколи не перевіряйте ліміти тільки на фронтенді. Клієнтська валідація -- лише UX (щоб не дати ввести неправильну суму). <strong>Авторитетна перевірка завжди на сервері.</strong> Фронтенд завантажує конфіг лімітів при відкритті чекауту, щоб показати правильні значення -- але сервер перевіряє при кожному запиті.</>
          : <>Never enforce limits only on the frontend. Client-side validation is UX only (prevents entering an invalid amount). <strong>Authoritative enforcement is always server-side.</strong> Frontend loads limit config on checkout open to display correct values -- but the server validates on every request.</>
        }
      </WarnCard>

      {/* ── Section 1: Purpose ────────────────────────────────────────────── */}
      <DocSection num="1" title={ua ? 'Призначення' : 'Purpose'}>
        <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2 mb-6">
          {[
            {
              Icon: SlidersHorizontal,
              title: { en: 'Business limits',        ua: 'Бізнес-ліміти'            },
              desc:  { en: 'Min/max per transaction, daily/weekly/monthly deposit caps -- all configurable per brand and per payment method.',
                       ua: 'Min/max на транзакцію, денні/тижневі/місячні ліміти депозитів -- налаштовуються на бренд та метод оплати.' },
            },
            {
              Icon: UserCheck,
              title: { en: 'KYC & compliance gates', ua: 'KYC та комплаєнс-гейти'   },
              desc:  { en: 'Block or redirect users who have not completed required identity verification before a deposit or withdrawal threshold.',
                       ua: 'Блокувати або перенаправляти користувачів, які не пройшли потрібну верифікацію перед досягненням порогу.' },
            },
            {
              Icon: ShieldCheck,
              title: { en: 'Responsible gambling',   ua: 'Відповідальна гра'         },
              desc:  { en: 'Self-exclusion checks, cooling-off enforcement, player self-set deposit limits. Regulatory requirement in most licensed jurisdictions.',
                       ua: 'Self-exclusion, cooling-off, ліміти встановлені гравцем. Регуляторна вимога для більшості ліцензованих юрисдикцій.' },
            },
            {
              Icon: Scale,
              title: { en: 'AML monitoring',         ua: 'AML моніторинг'            },
              desc:  { en: 'Flag large or suspicious transactions for manual review without blocking the payment. Does not expose flags to the player.',
                       ua: 'Позначати великі або підозрілі транзакції для ручного огляду без блокування платежу. Мітки не видимі гравцю.' },
            },
            {
              Icon: Ban,
              title: { en: 'Withdrawal protections',  ua: 'Захист при виведенні'     },
              desc:  { en: 'Balance sufficiency, wagering locks from active bonuses, max pending withdrawals cap.',
                       ua: 'Перевірка балансу, вейджер-лок від активних бонусів, ліміт кількості очікуючих виведень.' },
            },
            {
              Icon: CreditCard,
              title: { en: 'Audit trail',             ua: 'Аудит-трейл'              },
              desc:  { en: 'Every evaluation is logged (allow and block) for compliance reporting and dispute resolution.',
                       ua: 'Кожна перевірка логується (і allow, і block) для комплаєнс-звітності та вирішення спорів.' },
            },
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

      {/* ── Section 2: Data flow ──────────────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="2" title={ua ? 'Де знаходиться і як передається інформація' : 'Where it sits and how information flows'}>

        {/* Position in stack */}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {ua ? 'Позиція в стеку' : 'Position in the stack'}
        </p>
        <div className="border border-border rounded-2xl p-4 mb-6">
          <div className="flex flex-col gap-4">
            {[
              { label: { en: 'Request Router', ua: 'Request Router' }, note: { en: 'validates schema, extracts JWT context', ua: 'валідує схему, витягує JWT контекст' }, active: false },
              { label: { en: 'Limits & Rules Engine ← YOU ARE HERE', ua: 'Limits & Rules Engine ← ВИ ТУТ' }, note: { en: 'evaluates all rules → ALLOW or BLOCK', ua: 'виконує всі правила → ALLOW або BLOCK' }, active: true },
              { label: { en: 'Orchestrator', ua: 'Orchestrator' }, note: { en: 'selects PSP, applies cascade logic', ua: 'обирає PSP, застосовує каскадну логіку' }, active: false },
              { label: { en: 'Cascade Manager → Adapter → PSP', ua: 'Cascade Manager → Adapter → PSP' }, note: { en: 'executes the actual payment', ua: 'виконує реальний платіж' }, active: false },
            ].map((step, i, arr) => (
              <div key={i} className="relative flex items-center gap-3">
                {/* line from bottom of this badge through the gap-4 to next row */}
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
                <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground tabular-nums mt-0.5">
                  {i + 1}
                </div>
                <span className={cn(
                  'text-sm leading-snug',
                  i === 4 ? 'text-success' : i === 5 ? 'text-destructive' : 'text-foreground',
                )}>
                  {step[lang]}
                  {i === 4 && <CheckCircle2 className="inline size-3.5 ml-1.5 mb-0.5" />}
                  {i === 5 && <XCircle className="inline size-3.5 ml-1.5 mb-0.5" />}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Data inputs */}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {ua ? 'Вхідні дані та їх джерела' : 'Input data and sources'}
        </p>
        <div className="flex flex-col divide-y divide-border border border-border rounded-2xl overflow-hidden mb-2">
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
        <div className="flex items-start gap-2 rounded-xl bg-muted px-3 py-2.5 mt-3">
          <Info className="size-3.5 shrink-0 mt-0.5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground leading-snug">
            {ua
              ? 'Wallet Engine та Bonus Engine викликаються тільки для відповідного типу операції: Wallet -- для withdrawal balance check, Bonus Engine -- для wager lock check. Не навантажуйте ці сервіси при deposit без потреби.'
              : 'Wallet Engine and Bonus Engine are called only when relevant: Wallet for withdrawal balance checks, Bonus Engine for wager lock checks. Do not call these services on deposit requests unnecessarily.'}
          </p>
        </div>

      </DocSection>
      </div>

      {/* ── Section 3: Rules for launch ───────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="3" title={ua ? 'Правила та ліміти обовʼязкові на старті' : 'Rules and limits required at launch'}>

        {/* Rule evaluation order */}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {ua ? 'Порядок виконання правил' : 'Rule evaluation order'}
        </p>
        <div className="flex flex-col gap-2 mb-6">
          {RULE_ORDER.map((rule, i) => (
            <div key={i} className={cn(
              'flex items-start gap-3 border rounded-xl px-3 py-2.5',
              rule.borderCls, rule.bgCls,
            )}>
              <span className={cn('text-sm font-semibold shrink-0', rule.colorCls)}>{rule.label[lang]}</span>
              <ArrowRight className="size-3.5 shrink-0 mt-0.5 text-muted-foreground/40" />
              <span className="text-xs text-muted-foreground leading-snug">{rule.reason[lang]}</span>
            </div>
          ))}
        </div>

        {/* Transaction limits table */}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {ua ? 'Ліміти на транзакцію (min / max)' : 'Per-transaction limits (min / max)'}
        </p>
        <DocTable className="mb-6">
          <DocTableHeader>
            <TableRow>
              <TableHead>{ua ? 'Правило' : 'Rule'}</TableHead>
              <TableHead>{ua ? 'Область' : 'Scope'}</TableHead>
              <TableHead>{ua ? 'Приклад значення' : 'Example value'}</TableHead>
              <TableHead>{ua ? 'Налаштовується?' : 'Configurable?'}</TableHead>
            </TableRow>
          </DocTableHeader>
          <TableBody>
            {TRANSACTION_LIMITS.map((r, i) => (
              <TableRow key={i}>
                <TableCell className="text-sm font-medium text-foreground">{r.rule[lang]}</TableCell>
                <TableCell><code className="text-xs font-mono text-sky-500">{r.scope[lang]}</code></TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.value[lang]}</TableCell>
                <TableCell>
                  {r.configurable
                    ? <Badge variant="outline" className="text-xs bg-success-bg text-success border-success/30">{ua ? 'Так' : 'Yes'}</Badge>
                    : <Badge variant="outline" className="text-xs bg-muted text-muted-foreground">{ua ? 'Ні' : 'No'}</Badge>
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DocTable>

        {/* Accumulation limits */}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {ua ? 'Накопичувальні ліміти (cap)' : 'Accumulation limits (caps)'}
        </p>
        <DocTable className="mb-6">
          <DocTableHeader>
            <TableRow>
              <TableHead>{ua ? 'Правило' : 'Rule'}</TableHead>
              <TableHead>{ua ? 'Область' : 'Scope'}</TableHead>
              <TableHead>{ua ? 'Значення / примітка' : 'Value / note'}</TableHead>
              <TableHead>{ua ? 'Налаштовується?' : 'Configurable?'}</TableHead>
            </TableRow>
          </DocTableHeader>
          <TableBody>
            {ACCUMULATION_LIMITS.map((r, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.rule[lang]}</p>
                    {r.note && <p className="text-xs text-muted-foreground mt-0.5">{r.note[lang]}</p>}
                  </div>
                </TableCell>
                <TableCell><code className="text-xs font-mono text-sky-500">{r.scope[lang]}</code></TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.value[lang]}</TableCell>
                <TableCell>
                  {r.configurable
                    ? <Badge variant="outline" className="text-xs bg-success-bg text-success border-success/30">{ua ? 'Так' : 'Yes'}</Badge>
                    : <Badge variant="outline" className="text-xs bg-destructive-bg text-destructive border-destructive/30">{ua ? 'Ні (регулятор)' : 'No (regulator)'}</Badge>
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DocTable>

        {/* KYC gates */}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {ua ? 'KYC гейти' : 'KYC gates'}
        </p>
        <DocTable className="mb-2">
          <DocTableHeader>
            <TableRow>
              <TableHead>{ua ? 'Гейт' : 'Gate'}</TableHead>
              <TableHead>{ua ? 'Поріг' : 'Threshold'}</TableHead>
              <TableHead>{ua ? 'Дія' : 'Action'}</TableHead>
              <TableHead>{ua ? 'Напрямок' : 'Direction'}</TableHead>
            </TableRow>
          </DocTableHeader>
          <TableBody>
            {KYC_GATES.map((r, i) => (
              <TableRow key={i}>
                <TableCell className="text-sm font-medium text-foreground">{r.gate[lang]}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.threshold[lang]}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.action[lang]}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {r.direction === 'both' ? (ua ? 'Обидва' : 'Both') : r.direction.charAt(0).toUpperCase() + r.direction.slice(1)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DocTable>
        <div className="flex items-start gap-2 rounded-xl bg-muted px-3 py-2.5 mt-3 mb-6">
          <Info className="size-3.5 shrink-0 mt-0.5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground leading-snug">
            {ua
              ? 'Порогові значення KYC ($X, $Y) налаштовуються в brand_limits та залежать від юрисдикції бренду. При запуску бренду вони мають бути явно задані -- не успадковуються автоматично.'
              : 'KYC threshold values ($X, $Y) are configured in brand_limits and depend on the brand\'s jurisdiction. They must be explicitly set at brand launch -- they are not inherited automatically.'}
          </p>
        </div>

        {/* Error codes */}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {ua ? 'Коди помилок та відповіді' : 'Error codes and responses'}
        </p>
        <DocTable>
          <DocTableHeader>
            <TableRow>
              <TableHead>{ua ? 'Код' : 'Code'}</TableHead>
              <TableHead>HTTP</TableHead>
              <TableHead>{ua ? 'Опис (сервер)' : 'Description (server)'}</TableHead>
              <TableHead>{ua ? 'Що бачить гравець' : 'Player-facing message'}</TableHead>
            </TableRow>
          </DocTableHeader>
          <TableBody>
            {ERROR_CODES.map((r) => (
              <TableRow key={r.code}>
                <TableCell><code className="text-xs font-mono text-foreground">{r.code}</code></TableCell>
                <TableCell>
                  <span className={cn(
                    'text-xs font-semibold',
                    r.http === '403' ? 'text-destructive' : 'text-amber-500',
                  )}>{r.http}</span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.desc[lang]}</TableCell>
                <TableCell className="text-xs text-muted-foreground italic">{r.whoSees[lang]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DocTable>

        {/* Response payload example */}
        <div className="mt-4 border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-muted border-b border-border">
            <span className="text-xs font-mono text-muted-foreground">HTTP 422 -- BLOCK response</span>
            <Badge variant="outline" className="text-xs bg-destructive-bg text-destructive border-destructive/30 pointer-events-none">Blocked</Badge>
          </div>
          <pre className="text-xs font-mono text-foreground p-4 leading-relaxed overflow-x-auto bg-card">{`{
  "error": "DAILY_LIMIT_REACHED",
  "message": "You have reached your daily deposit limit.",
  "remaining_cap": 0,
  "reset_at": "2026-06-05T00:00:00Z",
  "limit_type": "daily_deposit",
  "brand_id": "brand_abc"
}`}</pre>
        </div>

      </DocSection>
      </div>

      {/* ── Section 4: Best practices ─────────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="4" title={ua ? 'Кращі практики' : 'Best practices'}>
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
          {BEST_PRACTICES.map((bp) => (
            <BestPracticeCard key={bp.title.en} title={bp.title} items={bp.items} lang={lang} />
          ))}
        </div>

        {/* DB schema hint */}
        <div className="mt-4 border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-muted border-b border-border">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {ua ? 'Мінімальна схема БД для Phase 3' : 'Minimum DB schema for Phase 3'}
            </span>
          </div>
          <pre className="text-xs font-mono text-muted-foreground p-4 leading-relaxed overflow-x-auto bg-card">{`-- Per-brand configurable limits
brand_limits (
  brand_id, method,
  min_deposit, max_deposit,
  min_withdrawal, max_withdrawal,
  daily_deposit_cap, weekly_deposit_cap, monthly_deposit_cap,
  kyc_threshold_deposit, kyc_threshold_withdrawal,
  max_pending_withdrawals
)

-- Player self-set responsible gambling limits (only decreaseable)
player_limits (
  user_id, brand_id,
  daily_deposit_cap, weekly_deposit_cap, monthly_deposit_cap,
  set_at, effective_at  -- effective_at = set_at + cooling_off_period
)

-- Append-only audit log
limits_audit_log (
  id, user_id, brand_id, direction, amount, currency,
  rule_triggered, result,  -- 'ALLOW' | 'BLOCK'
  error_code,              -- null if ALLOW
  created_at
)`}</pre>
        </div>

      </DocSection>
      </div>

    </DocLayout>
  )
}
