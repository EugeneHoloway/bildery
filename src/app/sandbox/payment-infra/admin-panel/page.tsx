'use client'

import { useState } from 'react'
import {
  Settings, Info, AlertTriangle, CheckCircle2,
  Globe, CreditCard, Wallet, Shield, Users, Building2,
  SlidersHorizontal, ToggleLeft, Layers, Smartphone, Monitor,
  Link2, Zap, Tag, Lock, FileText, ArrowUpDown, RefreshCw,
  LayoutGrid, ListFilter, Key, Scale, Eye, Pencil,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DocLayout  } from '@/components/doc/DocLayout'
import { DocSection } from '@/components/doc/DocSection'
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

function SectionCard({
  icon: Icon,
  title,
  accent,
  children,
}: {
  icon: React.ElementType
  title: string
  accent?: string
  children: React.ReactNode
}) {
  return (
    <div className="border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-xl',
          accent ?? 'bg-muted text-muted-foreground',
        )}>
          <Icon className="size-3.5" />
        </div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>
      {children}
    </div>
  )
}

function FeatureList({ items, lang }: { items: I18n[]; lang: Lang }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="size-3.5 shrink-0 mt-0.5 text-success" />
          <span>{item[lang]}</span>
        </li>
      ))}
    </ul>
  )
}

function DataRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className={cn('text-xs text-foreground text-right', mono && 'font-mono')}>{value}</span>
    </div>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PURPOSE_POINTS: I18n[] = [
  {
    en: 'The Admin Panel is the single control plane for all payment infrastructure configuration. It eliminates the need for direct database edits or code deploys when changing payment behavior.',
    ua: 'Адмін панель -- єдина точка керування всією конфігурацією платіжної інфраструктури. Вона виключає необхідність прямого редагування бази даних або деплою коду при зміні поведінки платежів.',
  },
  {
    en: 'Every setting is scoped: global defaults → partner (white-label brand) overrides → country overrides → payment method overrides. The most specific scope always wins.',
    ua: 'Кожне налаштування має область застосування: глобальні значення за замовчуванням → overrides партнера (white-label бренду) → overrides країни → overrides методу оплати. Найбільш специфічний scope завжди перемагає.',
  },
  {
    en: 'Target users: payment operations team and compliance officers. Engineers should only be needed to add new capabilities -- not to change configuration.',
    ua: 'Цільові користувачі: команда платіжних операцій та compliance-офіцери. Інженери потрібні лише для додавання нових можливостей -- не для зміни конфігурації.',
  },
]

const PSP_FEATURES: I18n[] = [
  { en: 'Add, edit, or soft-disable a PSP without code changes', ua: 'Додати, редагувати або м\'яко вимкнути PSP без змін коду' },
  { en: 'Store API credentials (key/secret) encrypted at rest; never exposed in UI after save', ua: 'Зберігати API-credentials (key/secret) зашифрованими; не показувати в UI після збереження' },
  { en: 'Configure base URL, webhook signing secret, timeout, and retry policy per PSP', ua: 'Налаштувати base URL, webhook signing secret, timeout та retry policy для кожного PSP' },
  { en: 'Set health check endpoint and define what a "healthy" response looks like', ua: 'Вказати endpoint health-check та визначити критерії "здорової" відповіді' },
  { en: 'Toggle maintenance mode: PSP is excluded from routing while in maintenance', ua: 'Режим технічного обслуговування: PSP виключається з роутингу поки активний' },
  { en: 'View live health score and last-N transaction success rate per PSP', ua: 'Переглядати поточний health score і success rate останніх N транзакцій для кожного PSP' },
]

const METHOD_FEATURES: I18n[] = [
  { en: 'Global method registry: Visa, Mastercard, Maestro, Crypto (BTC/ETH/USDT), Bank Transfer, e-Wallet, local methods (BLIK, PIX, UPI…)', ua: 'Глобальний реєстр методів: Visa, Mastercard, Maestro, Crypto (BTC/ETH/USDT), Bank Transfer, e-Wallet, локальні методи (BLIK, PIX, UPI…)' },
  { en: 'Enable or disable each method globally, per partner, or per country', ua: 'Вмикати або вимикати кожен метод глобально, для партнера або для країни' },
  { en: 'Map each (method + PSP) pair to either H2H (direct API) or Invoice Link (redirect) integration type', ua: 'Прив\'язати кожну пару (метод + PSP) до типу інтеграції: H2H (прямий API) або Invoice Link (редирект)' },
  { en: 'Set display name, icon, and sort order for end-user checkout UI', ua: 'Задати назву, іконку та порядок відображення для UI чекауту кінцевого користувача' },
  { en: 'Configure separate display lists for mobile and desktop: same methods, different priority', ua: 'Налаштувати окремі списки відображення для мобільних та десктопних пристроїв: однакові методи, різний пріоритет' },
  { en: 'Mark a method as "deposit-only", "withdrawal-only", or "both"', ua: 'Позначити метод як "тільки депозит", "тільки виведення" або "обидва напрямки"' },
]

const GEO_FEATURES: I18n[] = [
  { en: 'Enable or block a country for deposit, withdrawal, or both', ua: 'Увімкнути або заблокувати країну для депозиту, виведення або обох напрямків' },
  { en: 'Override available payment methods per country (subset of global list)', ua: 'Перевизначити доступні методи оплати для країни (підмножина глобального списку)' },
  { en: 'Set country-level currency: which currencies are accepted, which is default', ua: 'Налаштувати валюти для країни: які приймаються, яка є стандартною' },
  { en: 'Configure KYC tier required to transact in this country (e.g., Tier 1 = ID only, Tier 2 = proof of address)', ua: 'Налаштувати мінімальний KYC-рівень для транзакцій у цій країні (наприклад, Tier 1 = тільки ID, Tier 2 = підтвердження адреси)' },
  { en: 'Set country-level AML risk rating: standard / elevated / high. Affects manual review queue routing', ua: 'Встановити AML-рейтинг ризику країни: стандартний / підвищений / високий. Впливає на маршрутизацію черги ручного огляду' },
]

const PARTNER_FEATURES: I18n[] = [
  { en: 'Each white-label partner (brand) has its own configuration scope that overrides global defaults', ua: 'Кожен white-label партнер (бренд) має власну область конфігурації, яка перевизначає глобальні налаштування' },
  { en: 'Assign which PSPs are available to this partner and in what priority order', ua: 'Призначити, які PSP доступні для цього партнера та в якому пріоритетному порядку' },
  { en: 'Enable or disable specific payment methods per partner regardless of global availability', ua: 'Вмикати або вимикати конкретні методи оплати для партнера незалежно від глобальних налаштувань' },
  { en: 'Set partner-specific deposit/withdrawal limits that are stricter than global limits', ua: 'Задати специфічні для партнера ліміти депозиту/виведення, суворіші за глобальні' },
  { en: 'Configure partner-level fee split and settlement currency', ua: 'Налаштувати розподіл комісій та валюту розрахунків для партнера' },
  { en: 'Assign a compliance profile (license) to this partner -- determines which countries and methods are permitted', ua: 'Призначити compliance-профіль (ліцензію) для партнера -- визначає, які країни та методи дозволені' },
]

const LIMITS_FEATURES: I18n[] = [
  { en: 'Global min/max per transaction: deposit and withdrawal separately', ua: 'Глобальний min/max на транзакцію: депозит і виведення окремо' },
  { en: 'Rolling velocity caps: per player per day/week/month (count and volume)', ua: 'Ковзні ліміти velocity: для гравця за день/тиждень/місяць (кількість і сума)' },
  { en: 'Method-level limits: crypto may have higher minimum than cards', ua: 'Ліміти на рівні методу: у крипти може бути вищий мінімум, ніж у карток' },
  { en: 'Partner-level overrides: a VIP partner may have higher caps than default', ua: 'Overrides на рівні партнера: VIP-партнер може мати вищі ліміти, ніж стандартні' },
  { en: 'Responsible Gaming (RG) self-imposed limits: player-set caps are enforced here, not overrideable by ops', ua: 'Ліміти відповідальної гри (RG): встановлені гравцем обмеження виконуються тут і не можуть бути скасовані ops' },
  { en: 'Hard limits for large withdrawals: automatically trigger manual review queue above threshold', ua: 'Жорсткі ліміти для великих виведень: автоматично ставлять у чергу ручного огляду при перевищенні порогу' },
]

const LICENSE_FEATURES: I18n[] = [
  { en: 'Create named license profiles: MGA, UKGC, Curaçao, unlicensed, etc.', ua: 'Створювати іменовані ліцензійні профілі: MGA, UKGC, Curaçao, без ліцензії тощо' },
  { en: 'Each license profile defines: permitted countries, forbidden payment methods, required KYC tier, RG requirements', ua: 'Кожен ліцензійний профіль визначає: дозволені країни, заборонені методи оплати, мінімальний KYC-рівень, вимоги RG' },
  { en: 'Assign one or more license profiles to a partner; constraints are the union of all assigned profiles', ua: 'Призначити один або кілька ліцензійних профілів партнеру; обмеження -- об\'єднання всіх призначених профілів' },
  { en: 'Compliance audit log: every change to a license profile is versioned and attributed to an admin user', ua: 'Журнал аудиту compliance: кожна зміна ліцензійного профілю версіонується та прив\'язується до адмін-користувача' },
]

const ROUTING_FEATURES: I18n[] = [
  { en: 'Visual routing rule builder: IF (brand + country + method + amount range) THEN use PSP with priority list', ua: 'Візуальний конструктор правил роутингу: ЯКЩО (бренд + країна + метод + діапазон суми) ТО використовувати PSP зі списком пріоритетів' },
  { en: 'Rule priority ordering: drag to reorder; first matching rule wins', ua: 'Пріоритизація правил: перетягнути для зміни порядку; перше правило, що збіглося, перемагає' },
  { en: 'Cascade order per rule: define fallback chain PSP1 → PSP2 → PSP3 with retry conditions', ua: 'Каскадний порядок для кожного правила: задати ланцюжок резерву PSP1 → PSP2 → PSP3 з умовами повтору' },
  { en: 'A/B split routing: send X% of traffic to PSP-A and (100-X)% to PSP-B for a given rule', ua: 'A/B-розподіл роутингу: направити X% трафіку до PSP-A і (100-X)% до PSP-B для заданого правила' },
  { en: 'Dry-run mode: simulate which PSP a given transaction would be routed to without actually processing it', ua: 'Dry-run режим: симулювати, до якого PSP буде направлена транзакція, без її фактичного виконання' },
  { en: 'Emergency override: one-click force all traffic of a brand/country/method to a specific PSP', ua: 'Аварійне перевизначення: одним кліком направити весь трафік бренду/країни/методу на конкретний PSP' },
]

const AUDITLOG_FEATURES: I18n[] = [
  { en: 'Every configuration change is logged: who, what field, old value → new value, timestamp', ua: 'Кожна зміна конфігурації логується: хто, яке поле, старе значення → нове значення, час' },
  { en: 'Immutable log -- entries cannot be edited or deleted, only appended', ua: 'Незмінний журнал -- записи не можна редагувати або видаляти, тільки додавати' },
  { en: 'Searchable and filterable by admin user, resource type, partner, date range', ua: 'Пошук і фільтрація за адмін-користувачем, типом ресурсу, партнером, діапазоном дат' },
  { en: 'Exportable to CSV for compliance reporting', ua: 'Експорт у CSV для compliance-звітності' },
]

interface ModuleCard {
  id: string
  icon: React.ElementType
  accent: string
  title: I18n
  description: I18n
  features: I18n[]
  backendNotes?: I18n[]
  frontendNotes?: I18n[]
  tag?: I18n
}

const modules: ModuleCard[] = [
  {
    id: 'psp',
    icon: Zap,
    accent: 'bg-amber-500/10 text-amber-500',
    title: { en: 'PSP Management', ua: 'Керування PSP' },
    description: {
      en: 'Configure payment service providers: credentials, connection parameters, health monitoring, and operational status.',
      ua: 'Налаштування провайдерів платіжних послуг: credentials, параметри підключення, моніторинг здоров\'я та операційний статус.',
    },
    features: PSP_FEATURES,
    backendNotes: [
      { en: 'Credentials stored encrypted (AES-256). Never returned in GET responses -- only a masked indicator (e.g., "key set ✓").', ua: 'Credentials зберігаються зашифрованими (AES-256). Ніколи не повертаються в GET-відповідях -- тільки маскований індикатор.' },
      { en: 'PSP record has a `status` enum: ACTIVE | MAINTENANCE | DISABLED. Orchestrator skips non-ACTIVE PSPs.', ua: 'Запис PSP має enum `status`: ACTIVE | MAINTENANCE | DISABLED. Оркестратор пропускає не-ACTIVE PSP.' },
      { en: 'Health score is computed async by a background job and stored on the PSP record; not computed on request.', ua: 'Health score обчислюється асинхронно фоновим завданням і зберігається на запису PSP; не обчислюється по запиту.' },
    ],
    frontendNotes: [
      { en: 'API key/secret fields: write-only inputs. On load, show "••••••••" placeholder, not actual value.', ua: 'Поля API key/secret: write-only інпути. При завантаженні показувати "••••••••", не реальне значення.' },
      { en: 'Health indicator: colored dot (green/amber/red) derived from health score range.', ua: 'Індикатор здоров\'я: кольорова точка (зелена/жовта/червона) на основі діапазону health score.' },
    ],
  },
  {
    id: 'methods',
    icon: CreditCard,
    accent: 'bg-violet-500/10 text-violet-500',
    title: { en: 'Payment Methods', ua: 'Методи оплати' },
    description: {
      en: 'Define available payment methods globally and per-scope. Control display order separately for mobile and desktop. Set integration type per (method + PSP) pair.',
      ua: 'Визначати доступні методи оплати глобально та в межах scope. Керувати порядком відображення окремо для мобільних та десктопних пристроїв. Задавати тип інтеграції для кожної пари (метод + PSP).',
    },
    features: METHOD_FEATURES,
    backendNotes: [
      { en: '`payment_methods` table: id, slug, display_name, icon_url, direction (DEPOSIT|WITHDRAWAL|BOTH), is_active.', ua: 'Таблиця `payment_methods`: id, slug, display_name, icon_url, direction (DEPOSIT|WITHDRAWAL|BOTH), is_active.' },
      { en: '`psp_method_configs` table: psp_id, method_id, integration_type (H2H|INVOICE_LINK), is_active, extra_params (JSONB).', ua: 'Таблиця `psp_method_configs`: psp_id, method_id, integration_type (H2H|INVOICE_LINK), is_active, extra_params (JSONB).' },
      { en: '`method_display_orders` table: scope (GLOBAL|PARTNER|COUNTRY), scope_id, method_id, device (MOBILE|DESKTOP), position.', ua: 'Таблиця `method_display_orders`: scope (GLOBAL|PARTNER|COUNTRY), scope_id, method_id, device (MOBILE|DESKTOP), position.' },
    ],
    frontendNotes: [
      { en: 'Display order editor: two drag-and-drop lists side by side -- Mobile | Desktop. Each card shows method icon, name, toggle.', ua: 'Редактор порядку відображення: два drag-and-drop списки поруч -- Mobile | Desktop. Кожна картка показує іконку методу, назву, тоггл.' },
      { en: 'H2H vs Invoice Link badge clearly visible on each (method + PSP) row in the config table.', ua: 'Бейдж H2H або Invoice Link чітко видно на кожному рядку (метод + PSP) в таблиці конфігурації.' },
    ],
  },
  {
    id: 'geo',
    icon: Globe,
    accent: 'bg-sky-500/10 text-sky-500',
    title: { en: 'Countries & Currencies', ua: 'Країни та валюти' },
    description: {
      en: 'Control payment availability per country, assign accepted currencies, set KYC requirements, and define AML risk ratings.',
      ua: 'Керувати доступністю платежів по країнах, призначати прийняті валюти, задавати вимоги KYC та визначати AML-рейтинги ризику.',
    },
    features: GEO_FEATURES,
    backendNotes: [
      { en: '`country_configs` table: country_code (ISO 3166-1 alpha-2), deposit_enabled, withdrawal_enabled, default_currency, kyc_tier_required, aml_risk (STANDARD|ELEVATED|HIGH).', ua: 'Таблиця `country_configs`: country_code (ISO 3166-1 alpha-2), deposit_enabled, withdrawal_enabled, default_currency, kyc_tier_required, aml_risk (STANDARD|ELEVATED|HIGH).' },
      { en: 'Accepted currencies stored as array on country_config. Currency list drives checkout dropdown.', ua: 'Прийняті валюти зберігаються як масив в country_config. Список валют використовується у дропдауні чекауту.' },
      { en: 'Country block is evaluated at the API Gateway level before any orchestration. Hard block = 403.', ua: 'Блокування країни оцінюється на рівні API Gateway до будь-якої оркестрації. Жорсткий блок = 403.' },
    ],
    frontendNotes: [
      { en: 'Country list with search, flag icon, status badges (Deposit / Withdrawal / Blocked), and inline toggle.', ua: 'Список країн з пошуком, іконкою прапора, статус-бейджами (Deposit / Withdrawal / Blocked) та вбудованим тогглом.' },
      { en: 'AML risk badge color-coded: green (standard), amber (elevated), red (high).', ua: 'Бейдж AML-ризику з кольоровим кодуванням: зелений (стандарт), жовтий (підвищений), червоний (високий).' },
    ],
  },
  {
    id: 'partners',
    icon: Building2,
    accent: 'bg-emerald-500/10 text-emerald-500',
    title: { en: 'Partners (White-label Brands)', ua: 'Партнери (white-label бренди)' },
    description: {
      en: 'Each white-label partner gets an isolated configuration scope. Partner settings override global defaults and can only be more restrictive -- never more permissive than the global baseline or assigned license.',
      ua: 'Кожен white-label партнер отримує ізольовану область конфігурації. Налаштування партнера перевизначають глобальні значення і можуть бути тільки більш обмежувальними -- ніколи більш дозвільними, ніж глобальний baseline або призначена ліцензія.',
    },
    features: PARTNER_FEATURES,
    backendNotes: [
      { en: '`partners` table: id, brand_id (FK brands), license_profile_ids (array FK), psp_priority (ordered array of psp_ids), fee_config (JSONB).', ua: 'Таблиця `partners`: id, brand_id (FK brands), license_profile_ids (масив FK), psp_priority (впорядкований масив psp_ids), fee_config (JSONB).' },
      { en: 'Scope resolution order: method override → country override → partner override → global. First defined wins.', ua: 'Порядок розв\'язання scope: override методу → override країни → override партнера → глобальний. Перший визначений перемагає.' },
      { en: 'If partner has no override for a setting, the system falls back to global default -- no null checks needed in business logic.', ua: 'Якщо у партнера немає override для налаштування, система повертається до глобального значення -- перевірки null в бізнес-логіці не потрібні.' },
    ],
    frontendNotes: [
      { en: 'Partner detail page: tabs for General, PSPs, Methods, Limits, License. Each tab is a self-contained form.', ua: 'Сторінка деталей партнера: вкладки General, PSPs, Methods, Limits, License. Кожна вкладка -- окрема самостійна форма.' },
      { en: 'Inherited-from-global fields shown with a subtle "Global default" label and a "Override" button to activate the field.', ua: 'Поля, успадковані від глобального, показуються з мміткою "Global default" та кнопкою "Override" для активації поля.' },
    ],
  },
  {
    id: 'limits',
    icon: SlidersHorizontal,
    accent: 'bg-rose-500/10 text-rose-500',
    title: { en: 'Limits & Velocity Rules', ua: 'Ліміти та правила velocity' },
    description: {
      en: 'Define transaction size limits, rolling velocity caps, and auto-review triggers. All limits cascade through the same scope hierarchy as other settings.',
      ua: 'Задавати ліміти розміру транзакцій, ковзні ліміти velocity та тригери автоматичного огляду. Всі ліміти каскадуються через ту ж ієрархію scope, що й інші налаштування.',
    },
    features: LIMITS_FEATURES,
    backendNotes: [
      { en: '`limit_rules` table: scope, scope_id, method_id (nullable), direction, min_amount, max_amount, daily_cap_count, daily_cap_volume, monthly_cap_volume, review_threshold.', ua: 'Таблиця `limit_rules`: scope, scope_id, method_id (nullable), direction, min_amount, max_amount, daily_cap_count, daily_cap_volume, monthly_cap_volume, review_threshold.' },
      { en: 'Velocity counters stored in Redis with TTL = window duration. Checked synchronously before PSP call.', ua: 'Лічильники velocity зберігаються в Redis з TTL = тривалість вікна. Перевіряються синхронно перед викликом PSP.' },
      { en: 'RG self-imposed limits are stored separately and are not visible in the admin panel; they take precedence silently.', ua: 'Ліміти RG, встановлені гравцем, зберігаються окремо і не видимі в адмін панелі; вони мають пріоритет без попередження.' },
    ],
    frontendNotes: [
      { en: 'Limit editor: currency-aware amount inputs. Show equivalent in EUR for non-EUR partners.', ua: 'Редактор лімітів: інпути сум з урахуванням валюти. Показувати еквівалент у EUR для партнерів не в EUR.' },
      { en: 'Visual hierarchy: global → partner → method shown as nested cards to make override structure clear.', ua: 'Візуальна ієрархія: global → partner → method показана як вкладені картки для наочності структури override.' },
    ],
  },
  {
    id: 'routing',
    icon: ArrowUpDown,
    accent: 'bg-orange-500/10 text-orange-500',
    title: { en: 'Routing Rules', ua: 'Правила роутингу' },
    description: {
      en: 'Build and manage routing rules that map transaction conditions to PSPs. Define cascade chains, A/B splits, and emergency overrides.',
      ua: 'Створювати та керувати правилами роутингу, які зіставляють умови транзакції з PSP. Визначати каскадні ланцюги, A/B-розподіл та аварійні перевизначення.',
    },
    features: ROUTING_FEATURES,
    backendNotes: [
      { en: '`routing_rules` table: id, brand_id, country_code, method_id, amount_min, amount_max, psp_chain (ordered JSON array with weight %), priority, is_active.', ua: 'Таблиця `routing_rules`: id, brand_id, country_code, method_id, amount_min, amount_max, psp_chain (впорядкований JSON масив з вагами %), priority, is_active.' },
      { en: 'Rules evaluated in ascending priority order. First match short-circuits. Global catch-all rule should always be last (highest priority number).', ua: 'Правила оцінюються у порядку зростання пріоритету. Перший збіг зупиняє перевірку. Глобальне catch-all правило завжди має бути останнім (найбільший номер пріоритету).' },
      { en: 'Emergency override flag bypasses normal rule evaluation entirely. Stored as a separate "override" record with expiry timestamp.', ua: 'Флаг аварійного перевизначення повністю обходить звичайне оцінювання правил. Зберігається як окремий запис "override" з часом закінчення.' },
    ],
    frontendNotes: [
      { en: 'Rule list view: sortable table with drag handles for priority reorder. Inline enable/disable toggle per rule.', ua: 'Список правил: таблиця з можливістю сортування, drag-handle для зміни пріоритету. Вбудований тоггл вмкн./вимкн. для кожного правила.' },
      { en: 'Dry-run panel: form with brand, country, method, amount, direction. Shows which rule matched and which PSP would be selected.', ua: 'Панель dry-run: форма з brand, country, method, amount, direction. Показує, яке правило збіглося та який PSP був би обраний.' },
      { en: 'Emergency override: prominent red banner when active, with timer showing expiry and one-click cancel.', ua: 'Аварійне перевизначення: помітний червоний банер при активному стані, з таймером завершення та кнопкою скасування.' },
    ],
  },
  {
    id: 'license',
    icon: Scale,
    accent: 'bg-indigo-500/10 text-indigo-500',
    title: { en: 'License & Compliance Profiles', ua: 'Ліцензійні та compliance-профілі' },
    description: {
      en: 'Define license profiles that encode jurisdiction-specific payment rules. Assign profiles to partners. Used as hard constraints -- they cannot be overridden at any lower scope.',
      ua: 'Визначати ліцензійні профілі, що кодують специфічні для юрисдикції платіжні правила. Призначати профілі партнерам. Використовуються як жорсткі обмеження -- не можуть бути перевизначені на нижчому рівні scope.',
    },
    features: LICENSE_FEATURES,
    backendNotes: [
      { en: '`license_profiles` table: id, name (e.g. "MGA"), permitted_country_codes (array), forbidden_method_ids (array), min_kyc_tier, rg_requirements (JSONB).', ua: 'Таблиця `license_profiles`: id, name (напр. "MGA"), permitted_country_codes (масив), forbidden_method_ids (масив), min_kyc_tier, rg_requirements (JSONB).' },
      { en: 'At transaction time: license constraints are evaluated before partner overrides. A forbidden method returns 403 regardless of routing rules.', ua: 'Під час транзакції: ліцензійні обмеження оцінюються до partner overrides. Заборонений метод повертає 403 незалежно від правил роутингу.' },
    ],
    frontendNotes: [
      { en: 'License profile page: two-column layout -- permitted countries map on the left, forbidden methods list on the right.', ua: 'Сторінка ліцензійного профілю: дволонова верстка -- карта дозволених країн зліва, список заборонених методів справа.' },
    ],
  },
  {
    id: 'audit',
    icon: Eye,
    accent: 'bg-slate-500/10 text-slate-400',
    title: { en: 'Audit Log', ua: 'Журнал аудиту' },
    description: {
      en: 'Immutable record of every configuration change. Required for compliance and incident post-mortems.',
      ua: 'Незмінний запис кожної зміни конфігурації. Необхідний для compliance та post-mortem після інцидентів.',
    },
    features: AUDITLOG_FEATURES,
    backendNotes: [
      { en: '`audit_logs` table: id, admin_user_id, action, resource_type, resource_id, old_value (JSONB), new_value (JSONB), created_at. No UPDATE or DELETE on this table -- ever.', ua: 'Таблиця `audit_logs`: id, admin_user_id, action, resource_type, resource_id, old_value (JSONB), new_value (JSONB), created_at. Ніколи не робити UPDATE або DELETE в цій таблиці.' },
      { en: 'Write to audit_log inside the same DB transaction as the config change. If the log write fails, the change rolls back.', ua: 'Писати в audit_log у межах тієї ж DB транзакції, що й зміна конфігурації. Якщо запис в журнал не вдається, зміна відкочується.' },
    ],
    frontendNotes: [
      { en: 'Diff view: old value on left (red), new value on right (green) -- same visual pattern as git diff.', ua: 'Вигляд diff: старе значення зліва (червоне), нове значення справа (зелене) -- той самий візуальний патерн, що й git diff.' },
    ],
  },
]

const SCOPE_HIERARCHY: { scope: I18n; example: I18n; wins: I18n }[] = [
  {
    scope:   { en: 'License Profile (hard constraint)', ua: 'Ліцензійний профіль (жорстке обмеження)' },
    example: { en: 'MGA forbids crypto methods in Finland', ua: 'MGA забороняє крипто-методи у Фінляндії' },
    wins:    { en: 'Always. Cannot be overridden.', ua: 'Завжди. Не може бути перевизначено.' },
  },
  {
    scope:   { en: 'Global Default', ua: 'Глобальне значення за замовчуванням' },
    example: { en: 'Min deposit = $10', ua: 'Мін депозит = $10' },
    wins:    { en: 'When no lower scope has an override', ua: 'Коли жоден нижчий scope не має override' },
  },
  {
    scope:   { en: 'Partner Override', ua: 'Override партнера' },
    example: { en: 'Partner A: min deposit = $20', ua: 'Партнер A: мін депозит = $20' },
    wins:    { en: 'Over global default for that partner\'s traffic', ua: 'Над глобальним значенням для трафіку цього партнера' },
  },
  {
    scope:   { en: 'Country Override', ua: 'Override країни' },
    example: { en: 'DE + Partner A: min deposit = $25', ua: 'DE + Партнер A: мін депозит = $25' },
    wins:    { en: 'Over partner default for traffic from that country', ua: 'Над значенням партнера для трафіку з цієї країни' },
  },
  {
    scope:   { en: 'Method Override', ua: 'Override методу' },
    example: { en: 'Crypto + DE + Partner A: min deposit = $50', ua: 'Крипто + DE + Партнер A: мін депозит = $50' },
    wins:    { en: 'Most specific. Wins over all other scopes.', ua: 'Найбільш специфічний. Перемагає над усіма іншими scope.' },
  },
]

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Page() {
  const [lang, setLang] = useState<Lang>('en')

  const t = (i: I18n) => i[lang]

  return (
    <DocLayout
      title={lang === 'ua' ? 'Адмін Панель' : 'Admin Panel'}
      parentCrumb={{ label: 'Sandbox', href: '/sandbox' }}
      breadcrumbLabel="Payment Infrastructure"
      breadcrumbHref="/sandbox/payment-infra"
      description={lang === 'ua' ? 'PSP Management | Routing | Methods | Partners | Compliance' : 'PSP Management | Routing | Methods | Partners | Compliance'}
      tags={[
        { label: 'Phase 4',   type: 'tag'    },
        { label: 'Frontend',  type: 'status' },
      ]}
      titleExtra={<LangSwitcher lang={lang} onChange={setLang} />}
      footnote="DEPO44 | PAYMENT MODULE v1 | PHASE 4 -- ADMIN PANEL"
    >

      {/* ── Section 1: Purpose ────────────────────────────────────────────── */}
      <DocSection num="1" title={lang === 'ua' ? 'Призначення' : 'Purpose'}>
        <InfoCard>
          {lang === 'ua'
            ? 'Адмін панель -- це єдина точка правди для всіх налаштувань платіжної системи. Вона дає команді ops повний контроль без необхідності залучати інженерів або вносити зміни до коду.'
            : 'The Admin Panel is the single source of truth for all payment system configuration. It gives the ops team full control without needing to involve engineers or change code.'}
        </InfoCard>
        <div className="flex flex-col gap-3 mb-2">
          {PURPOSE_POINTS.map((p, i) => (
            <div key={i} className="border border-border rounded-2xl p-4 flex items-start gap-3">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground tabular-nums">
                {i + 1}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(p)}</p>
            </div>
          ))}
        </div>
      </DocSection>

      {/* ── Section 2: Scope Hierarchy ───────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="2" title={lang === 'ua' ? 'Ієрархія scope' : 'Scope Hierarchy'}>
        <InfoCard>
          {lang === 'ua'
            ? 'Кожне налаштування має scope. Scope вищого рівня стає резервним значенням; scope нижчого рівня перевизначає його. Ліцензійний профіль -- єдиний виняток: це жорстке обмеження, яке перевищує всі рівні.'
            : 'Every setting has a scope. A higher-level scope acts as the fallback; a lower-level scope overrides it. License profile is the only exception: it is a hard constraint that supersedes all levels.'}
        </InfoCard>
        <div className="flex flex-col gap-2">
          {SCOPE_HIERARCHY.map((row, i) => (
            <div key={i} className={cn(
              'border rounded-2xl p-4 flex items-start gap-4',
              i === 0 ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-border',
            )}>
              <div className={cn(
                'flex size-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold tabular-nums',
                i === 0 ? 'bg-indigo-500/20 text-indigo-400' : 'bg-muted text-muted-foreground',
              )}>
                {i === 0 ? <Lock className="size-3" /> : i}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn('text-sm font-semibold', i === 0 ? 'text-indigo-400' : 'text-foreground')}>
                    {t(row.scope)}
                  </span>
                  {i === 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {lang === 'ua' ? 'Жорстке обмеження' : 'Hard constraint'}
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-1 tablet:grid-cols-2">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{lang === 'ua' ? 'Приклад: ' : 'Example: '}</span>
                    {t(row.example)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{lang === 'ua' ? 'Перемагає: ' : 'Wins: '}</span>
                    {t(row.wins)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DocSection>
      </div>

      {/* ── Section 3: Modules ───────────────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="3" title={lang === 'ua' ? 'Модулі адмін панелі' : 'Admin Panel Modules'}>
        <div className="flex flex-col gap-6">
          {modules.map((mod) => (
            <div key={mod.id} className="border border-border rounded-2xl overflow-hidden">
              {/* Module header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30">
                <div className={cn('flex size-7 shrink-0 items-center justify-center rounded-xl', mod.accent)}>
                  <mod.icon className="size-3.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t(mod.title)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{t(mod.description)}</p>
                </div>
              </div>

              <div className="p-5 grid grid-cols-1 gap-5 tablet:grid-cols-3">
                {/* Features */}
                <div className="tablet:col-span-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                    {lang === 'ua' ? 'ФУНКЦІОНАЛЬНІСТЬ' : 'FUNCTIONALITY'}
                  </p>
                  <FeatureList items={mod.features} lang={lang} />
                </div>

                {/* Backend notes */}
                {mod.backendNotes && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                      {lang === 'ua' ? 'БЕКЕНД -- НОТАТКИ' : 'BACKEND -- NOTES'}
                    </p>
                    <ul className="flex flex-col gap-2">
                      {mod.backendNotes.map((note, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="shrink-0 text-xs font-mono px-1.5 py-0.5 rounded border bg-sky-500/10 text-sky-400 border-sky-500/20">BE</span>
                          <span>{t(note)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Frontend notes */}
                {mod.frontendNotes && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                      {lang === 'ua' ? 'ФРОНТЕНД -- НОТАТКИ' : 'FRONTEND -- NOTES'}
                    </p>
                    <ul className="flex flex-col gap-2">
                      {mod.frontendNotes.map((note, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="shrink-0 text-xs font-mono px-1.5 py-0.5 rounded border bg-violet-500/10 text-violet-400 border-violet-500/20">FE</span>
                          <span>{t(note)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </DocSection>
      </div>

      {/* ── Section 4: Access Control ────────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="4" title={lang === 'ua' ? 'Контроль доступу' : 'Access Control'}>
        <WarnCard>
          {lang === 'ua'
            ? 'Адмін панель -- це high-privilege система. Неправильне налаштування може миттєво вплинути на платежі всіх партнерів. Необхідний роль-орієнтований контроль доступу (RBAC) з детальним журналом аудиту.'
            : 'The Admin Panel is a high-privilege system. A misconfiguration can instantly affect payments across all partners. Role-based access control (RBAC) with detailed audit logging is required.'}
        </WarnCard>
        <div className="grid grid-cols-1 gap-3 tablet:grid-cols-3">
          {([
            {
              role:   { en: 'Super Admin',     ua: 'Super Admin'   },
              access: { en: 'Full read/write across all modules, all partners. Can manage admin users.', ua: 'Повний read/write по всіх модулях, всіх партнерах. Може керувати адмін-користувачами.' },
              color: 'border-rose-500/30 bg-rose-500/5',
              textColor: 'text-rose-400',
            },
            {
              role:   { en: 'Operations',      ua: 'Operations'    },
              access: { en: 'Read/write: PSP status, routing rules, method toggles, limits. Read-only: credentials, license profiles.', ua: 'Read/write: статус PSP, правила роутингу, тогли методів, ліміти. Read-only: credentials, ліцензійні профілі.' },
              color: 'border-amber-500/30 bg-amber-500/5',
              textColor: 'text-amber-400',
            },
            {
              role:   { en: 'Compliance',      ua: 'Compliance'    },
              access: { en: 'Read/write: license profiles, country AML ratings, KYC tiers. Read-only: everything else.', ua: 'Read/write: ліцензійні профілі, AML-рейтинги країн, KYC-рівні. Read-only: все інше.' },
              color: 'border-indigo-500/30 bg-indigo-500/5',
              textColor: 'text-indigo-400',
            },
          ] as { role: I18n; access: I18n; color: string; textColor: string }[]).map((r, i) => (
            <div key={i} className={cn('border rounded-2xl p-4', r.color)}>
              <div className="flex items-center gap-2 mb-2">
                <Users className="size-3.5 shrink-0 text-muted-foreground" />
                <span className={cn('text-sm font-semibold', r.textColor)}>{t(r.role)}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{t(r.access)}</p>
            </div>
          ))}
        </div>
      </DocSection>
      </div>

      {/* ── Section 5: Key Implementation Notes ────────────────────────── */}
      <div className="mt-6">
      <DocSection num="5" title={lang === 'ua' ? 'Ключові зауваги щодо реалізації' : 'Key Implementation Notes'}>
        <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
          {([
            {
              icon: RefreshCw,
              title: { en: 'Config Cache Invalidation', ua: 'Інвалідація кешу конфігурації' },
              body: {
                en: 'The Orchestrator caches routing config in memory. When a rule changes in the Admin Panel, the backend must broadcast a cache invalidation event (e.g., via Redis pub/sub) to all Orchestrator instances. Max stale window: 10 seconds.',
                ua: 'Оркестратор кешує конфігурацію роутингу в пам\'яті. При зміні правила в адмін панелі бекенд має розіслати подію інвалідації кешу (наприклад, через Redis pub/sub) всім інстансам Оркестратора. Максимальне вікно застарілості: 10 секунд.',
              },
            },
            {
              icon: ListFilter,
              title: { en: 'No Cascading Deletes', ua: 'Без каскадного видалення' },
              body: {
                en: 'PSPs and methods are never hard-deleted -- only soft-disabled. Historical transactions reference PSP/method IDs; deleting them would break reconciliation and reporting.',
                ua: 'PSP та методи ніколи не видаляються жорстко -- тільки м\'яко вимикаються. Історичні транзакції посилаються на ID PSP/методів; їх видалення зламало б reconciliation та звітність.',
              },
            },
            {
              icon: Key,
              title: { en: 'Credential Rotation', ua: 'Ротація credentials' },
              body: {
                en: 'PSP credentials can be updated without downtime. The system must complete in-flight transactions with the old key and use the new key for new ones. Implement with a short dual-key window (~30s).',
                ua: 'PSP credentials можна оновлювати без простою. Система має завершити поточні транзакції зі старим ключем і використовувати новий для нових. Реалізувати з коротким вікном подвійного ключа (~30с).',
              },
            },
            {
              icon: LayoutGrid,
              title: { en: 'Admin Panel is NOT the source of truth for transactions', ua: 'Адмін панель НЕ є джерелом правди для транзакцій' },
              body: {
                en: 'The Admin Panel configures behavior -- it does not store transaction data. All transaction history lives in the core `transactions` table and is accessed via separate reporting/analytics interfaces.',
                ua: 'Адмін панель налаштовує поведінку -- вона не зберігає дані транзакцій. Вся історія транзакцій живе в основній таблиці `transactions` і доступна через окремі інтерфейси звітності/аналітики.',
              },
            },
          ] as { icon: React.ElementType; title: I18n; body: I18n }[]).map((note, i) => (
            <div key={i} className="border border-border rounded-2xl p-4 flex items-start gap-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <note.icon className="size-3.5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">{t(note.title)}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{t(note.body)}</p>
              </div>
            </div>
          ))}
        </div>
      </DocSection>
      </div>

    </DocLayout>
  )
}
