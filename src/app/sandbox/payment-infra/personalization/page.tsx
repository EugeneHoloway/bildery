'use client'

import { useState } from 'react'
import {
  User, Info, AlertTriangle, CheckCircle2,
  CreditCard, Zap, ArrowUpDown, Globe, BarChart2,
  Shield, RefreshCw, Layers, Brain, SlidersHorizontal,
  Clock, Target, TrendingUp, ListFilter, Database, Lock,
  ArrowRight, Shuffle,
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

// ─── Data ─────────────────────────────────────────────────────────────────────

const PURPOSE_POINTS: I18n[] = [
  {
    en: 'Personalization makes the checkout smarter for returning players. Instead of showing all available methods in a fixed order, the system surfaces the most relevant method first -- the one the player is most likely to complete a transaction with.',
    ua: 'Персоналізація робить чекаут розумнішим для повторних гравців. Замість відображення всіх доступних методів у фіксованому порядку, система показує першим найбільш релевантний метод -- той, яким гравець, найімовірніше, завершить транзакцію.',
  },
  {
    en: 'Two primary signals drive personalization: BIN lookup (the first 6-8 digits of the card number identify the issuing bank, card type, and country) and last successful method per player. These are cheap, deterministic, and available before the player makes any interaction.',
    ua: 'Два основні сигнали керують персоналізацією: BIN lookup (перші 6-8 цифр номера картки визначають банк-емітент, тип картки та країну) та останній успішний метод гравця. Вони дешеві, детерміновані та доступні до будь-якої взаємодії гравця.',
  },
  {
    en: 'The goal is measurable: reduce checkout abandonment and increase first-attempt success rate. Personalization is always additive -- it reorders the method list, never removes options the player is entitled to use.',
    ua: 'Мета вимірювана: знизити відмови від чекауту та підвищити коефіцієнт успіху першої спроби. Персоналізація завжди адитивна -- вона змінює порядок списку методів, ніколи не видаляє опції, на які гравець має право.',
  },
]

interface SignalCard {
  id: string
  icon: React.ElementType
  accent: string
  title: I18n
  description: I18n
  inputs: I18n[]
  outputs: I18n[]
  backendNote: I18n
}

const SIGNALS: SignalCard[] = [
  {
    id: 'bin',
    icon: CreditCard,
    accent: 'bg-sky-500/10 text-sky-500',
    title: { en: 'BIN Lookup', ua: 'BIN Lookup' },
    description: {
      en: 'Bank Identification Number -- the first 6 to 8 digits of any card number. Identifies issuer, card network, card type (debit/credit/prepaid), and issuing country before the player does anything.',
      ua: 'Bank Identification Number -- перші 6-8 цифр будь-якого номера картки. Визначає емітента, платіжну мережу, тип картки (дебет/кредит/передоплата) та країну випуску до будь-якої дії гравця.',
    },
    inputs: [
      { en: 'First 6-8 digits typed by the player in the card number field', ua: 'Перші 6-8 цифр, введені гравцем у поле номера картки' },
      { en: 'BIN database (updated weekly from card network feeds)', ua: 'База даних BIN (оновлюється щотижня з фідів платіжних мереж)' },
    ],
    outputs: [
      { en: 'Card network: Visa / Mastercard / Maestro / Amex / etc.', ua: 'Платіжна мережа: Visa / Mastercard / Maestro / Amex / тощо' },
      { en: 'Card type: debit / credit / prepaid / corporate', ua: 'Тип картки: дебет / кредит / передоплата / корпоративна' },
      { en: 'Issuing country (ISO 3166-1 alpha-2)', ua: 'Країна випуску (ISO 3166-1 alpha-2)' },
      { en: 'Issuing bank name', ua: 'Назва банку-емітента' },
    ],
    backendNote: {
      en: 'BIN lookup must complete in < 10 ms. Use an in-process BIN database (e.g. Redis hash or embedded SQLite) -- do not call an external API per keystroke. Expose as GET /api/bin/:prefix returning the enriched card info object.',
      ua: 'BIN lookup має завершитися за < 10 мс. Використовувати вбудовану базу даних BIN (наприклад, Redis hash або вбудований SQLite) -- не викликати зовнішній API на кожне натискання клавіші. Відкрити як GET /api/bin/:prefix, що повертає збагачений об\'єкт з інформацією про картку.',
    },
  },
  {
    id: 'last-success',
    icon: Clock,
    accent: 'bg-emerald-500/10 text-emerald-500',
    title: { en: 'Last Successful Method', ua: 'Останній успішний метод' },
    description: {
      en: 'The simplest and most powerful personalization signal. If a player successfully deposited via Visa last time, offer Visa first next time. No ML required.',
      ua: 'Найпростіший і найпотужніший сигнал персоналізації. Якщо гравець успішно вніс депозит через Visa минулого разу -- запропонувати Visa першою наступного разу. ML не потрібен.',
    },
    inputs: [
      { en: 'player_id + brand_id + direction (deposit/withdrawal)', ua: 'player_id + brand_id + direction (deposit/withdrawal)' },
      { en: 'Transaction history: status = COMPLETED', ua: 'Історія транзакцій: status = COMPLETED' },
    ],
    outputs: [
      { en: 'Preferred method slug (e.g. "visa", "crypto_usdt")', ua: 'Slug кращого методу (наприклад, "visa", "crypto_usdt")' },
      { en: 'Timestamp of last success (used for staleness check)', ua: 'Час останнього успіху (використовується для перевірки актуальності)' },
      { en: 'Success count (used for confidence scoring)', ua: 'Кількість успіхів (використовується для оцінки впевненості)' },
    ],
    backendNote: {
      en: 'Store as a materialized view or denormalized record on the player profile -- do not query transaction history on every checkout load. Update the record asynchronously when a COMPLETED event fires. TTL: treat a preferred method as stale if no successful use in 90 days.',
      ua: 'Зберігати як матеріалізований вигляд або денормалізований запис у профілі гравця -- не запитувати історію транзакцій при кожному завантаженні чекауту. Оновлювати запис асинхронно при появі події COMPLETED. TTL: вважати кращий метод застарілим, якщо не було успішного використання протягом 90 днів.',
    },
  },
  {
    id: 'geo',
    icon: Globe,
    accent: 'bg-amber-500/10 text-amber-500',
    title: { en: 'GEO + Device Context', ua: 'GEO + контекст пристрою' },
    description: {
      en: 'IP geolocation and device type enrich the signal set without requiring any player action. Used to infer local payment preferences and to apply device-specific method ordering configured in the Admin Panel.',
      ua: 'IP-геолокація та тип пристрою збагачують набір сигналів без будь-яких дій гравця. Використовуються для визначення локальних платіжних уподобань та застосування специфічного для пристрою порядку методів, налаштованого в адмін панелі.',
    },
    inputs: [
      { en: 'IP address → country code (MaxMind GeoIP or equivalent, in-process)', ua: 'IP-адреса → код країни (MaxMind GeoIP або аналог, вбудований)' },
      { en: 'User-Agent → device type: mobile / desktop / tablet', ua: 'User-Agent → тип пристрою: mobile / desktop / tablet' },
    ],
    outputs: [
      { en: 'Country code for method filtering and GEO-based ordering', ua: 'Код країни для фільтрації методів та GEO-сортування' },
      { en: 'Device type for selecting the correct display order list from Admin Panel', ua: 'Тип пристрою для вибору правильного списку порядку відображення з адмін панелі' },
    ],
    backendNote: {
      en: 'GEO resolution must be in-process (< 1 ms). Never call an external geolocation API in the checkout critical path. The resolved country is also used by the Orchestrator for routing -- share the resolved value via the request context object, do not resolve twice.',
      ua: 'GEO-резолюція має бути вбудованою (< 1 мс). Ніколи не викликати зовнішній API геолокації в критичному шляху чекауту. Визначена країна також використовується Оркестратором для роутингу -- передавати визначене значення через об\'єкт контексту запиту, не визначати двічі.',
    },
  },
  {
    id: 'psp-success-rate',
    icon: BarChart2,
    accent: 'bg-violet-500/10 text-violet-500',
    title: { en: 'PSP Success Rate per Method', ua: 'Success rate PSP за методом' },
    description: {
      en: 'When multiple PSPs support the same method, route to the one with the best recent success rate for that method + GEO combination. This is routing optimization, not player-level personalization -- but it directly improves the player\'s experience.',
      ua: 'Коли кілька PSP підтримують один метод, направляти до того, у якого найкращий нещодавній success rate для комбінації цього методу + GEO. Це оптимізація роутингу, а не персоналізація на рівні гравця -- але вона безпосередньо покращує досвід гравця.',
    },
    inputs: [
      { en: 'Transaction history (last 24h): psp_id + method_id + country + status', ua: 'Історія транзакцій (останні 24 год): psp_id + method_id + country + status' },
      { en: 'PSP health scores from the Admin Panel monitoring background job', ua: 'Health scores PSP від фонового завдання моніторингу адмін панелі' },
    ],
    outputs: [
      { en: 'Per-(psp, method, country) success rate: float 0.0 -- 1.0', ua: 'Success rate для (psp, method, country): float 0.0 -- 1.0' },
      { en: 'Ranked PSP list for a given (method + country) pair', ua: 'Ранжований список PSP для заданої пари (метод + країна)' },
    ],
    backendNote: {
      en: 'Computed as a rolling window aggregate (last 500 transactions or last 24 h, whichever is smaller). Store pre-computed in Redis and refresh every 5 minutes via a background job. The Orchestrator reads this ranking when building the PSP cascade chain.',
      ua: 'Обчислюється як агрегат ковзного вікна (останні 500 транзакцій або останні 24 год, залежно від того, що менше). Зберігати попередньо обчисленим в Redis і оновлювати кожні 5 хвилин через фонове завдання. Оркестратор читає це ранжування при побудові каскадного ланцюга PSP.',
    },
  },
]

interface PersonalizationStep {
  step: number
  title: I18n
  detail: I18n
  who: 'FE' | 'BE' | 'Both'
}

const CHECKOUT_FLOW: PersonalizationStep[] = [
  {
    step: 1,
    who: 'BE',
    title: { en: 'Checkout session init', ua: 'Ініціалізація сесії чекауту' },
    detail: {
      en: 'Player opens checkout. Backend resolves: player profile (last preferred method), GEO from IP, device type from User-Agent, available methods for brand + country. Returns enriched method list with a "recommended" flag on the top candidate.',
      ua: 'Гравець відкриває чекаут. Бекенд визначає: профіль гравця (останній кращий метод), GEO з IP, тип пристрою з User-Agent, доступні методи для бренду + країни. Повертає збагачений список методів з прапором "recommended" на топ-кандидаті.',
    },
  },
  {
    step: 2,
    who: 'FE',
    title: { en: 'Method list render', ua: 'Рендер списку методів' },
    detail: {
      en: 'Frontend renders the method list in the order provided by the backend. The recommended method is visually highlighted (e.g. "Recommended" badge). No reordering logic in the frontend -- the backend owns the sort.',
      ua: 'Фронтенд рендерить список методів у порядку, наданому бекендом. Рекомендований метод візуально виділяється (наприклад, бейдж "Recommended"). Ніякої логіки переупорядкування на фронтенді -- бекенд керує сортуванням.',
    },
  },
  {
    step: 3,
    who: 'FE',
    title: { en: 'Card number BIN trigger', ua: 'BIN тригер при введенні номера картки' },
    detail: {
      en: 'When the player selects "card" and types 6+ digits, frontend calls GET /api/bin/:prefix. Response enriches the UI: shows card network logo, card type label. If BIN indicates a card from a country different from GEO, backend may suggest a different PSP silently.',
      ua: 'Коли гравець вибирає "картку" і вводить 6+ цифр, фронтенд викликає GET /api/bin/:prefix. Відповідь збагачує UI: показує логотип платіжної мережі, мітку типу картки. Якщо BIN вказує на картку з іншої країни, ніж GEO, бекенд може непомітно запропонувати інший PSP.',
    },
  },
  {
    step: 4,
    who: 'BE',
    title: { en: 'PSP selection with personalization', ua: 'Вибір PSP з персоналізацією' },
    detail: {
      en: 'On transaction submit, Orchestrator enriches routing context with: BIN country (if card), player\'s preferred method, PSP success rates. Routing rules are evaluated against this enriched context. The winning PSP is the intersection of routing rules + best success rate + active cascade priority.',
      ua: 'При відправці транзакції Оркестратор збагачує контекст роутингу: країна BIN (для карток), кращий метод гравця, success rates PSP. Правила роутингу оцінюються в цьому збагаченому контексті. Переможний PSP -- це перетин правил роутингу + найкращий success rate + активний каскадний пріоритет.',
    },
  },
  {
    step: 5,
    who: 'BE',
    title: { en: 'Profile update on completion', ua: 'Оновлення профілю після завершення' },
    detail: {
      en: 'When a transaction reaches COMPLETED status, an async event updates the player\'s preferred method record. If this was a card transaction, also store the masked BIN (first 6 digits) as a recognized card hint for next session.',
      ua: 'Коли транзакція досягає статусу COMPLETED, асинхронна подія оновлює запис кращого методу гравця. Якщо це була карткова транзакція, також зберігати замаскований BIN (перші 6 цифр) як підказку для розпізнавання картки в наступній сесії.',
    },
  },
]

const RANKING_LOGIC: { condition: I18n; result: I18n; priority: number }[] = [
  {
    priority: 1,
    condition: { en: 'Player has a preferred method AND it is available AND last used < 90 days ago', ua: 'У гравця є кращий метод І він доступний І остання використання < 90 днів тому' },
    result:    { en: 'Preferred method goes first with "Recommended" badge', ua: 'Кращий метод іде першим з бейджем "Recommended"' },
  },
  {
    priority: 2,
    condition: { en: 'BIN lookup returns a specific card network (e.g. Mastercard) and that network is available', ua: 'BIN lookup повертає конкретну платіжну мережу (наприклад, Mastercard) і ця мережа доступна' },
    result:    { en: 'Matching card network method promoted to top of card group', ua: 'Метод відповідної платіжної мережі просувається на верх групи карток' },
  },
  {
    priority: 3,
    condition: { en: 'GEO country has a dominant local payment method (e.g. BLIK in Poland)', ua: 'Країна GEO має домінуючий локальний метод оплати (наприклад, BLIK у Польщі)' },
    result:    { en: 'Local method ranked second (after preferred if present)', ua: 'Локальний метод на другому місці (після кращого, якщо є)' },
  },
  {
    priority: 4,
    condition: { en: 'No personalization signals available (new player, no BIN typed)', ua: 'Немає сигналів персоналізації (новий гравець, BIN не введений)' },
    result:    { en: 'Admin Panel device-specific display order is used as-is', ua: 'Використовується порядок відображення для конкретного пристрою з адмін панелі' },
  },
]

const PRIVACY_RULES: I18n[] = [
  { en: 'Never store full card numbers -- only the first 6-8 digits (BIN prefix) and last 4 digits, as per PCI DSS', ua: 'Ніколи не зберігати повні номери карток -- тільки перші 6-8 цифр (BIN-префікс) і останні 4 цифри, згідно з PCI DSS' },
  { en: 'Player\'s preferred method record contains only the method slug -- not card details, not PSP transaction IDs', ua: 'Запис кращого методу гравця містить лише slug методу -- без даних картки, без ID транзакцій PSP' },
  { en: 'BIN lookup is done client-side and server-side; the full card number never leaves the player\'s browser in the BIN request', ua: 'BIN lookup виконується на стороні клієнта і сервера; повний номер картки ніколи не покидає браузер гравця у BIN-запиті' },
  { en: 'Personalization data is scoped per brand: player preferences from Brand A are not used on Brand B', ua: 'Дані персоналізації обмежені брендом: уподобання гравця з Бренду A не використовуються на Бренді B' },
  { en: 'Player can clear their payment history and preferred method via account settings (GDPR right to erasure)', ua: 'Гравець може очистити свою платіжну історію та кращий метод через налаштування акаунта (право на видалення за GDPR)' },
]

const METRICS: { metric: I18n; baseline: string; target: string; how: I18n }[] = [
  {
    metric:   { en: 'First-attempt success rate', ua: 'Success rate першої спроби' },
    baseline: '~65%',
    target:   '> 80%',
    how: { en: 'Track (transaction_started, method_shown_first) → COMPLETED without retry', ua: 'Відстежувати (transaction_started, method_shown_first) → COMPLETED без повтору' },
  },
  {
    metric:   { en: 'Checkout abandonment rate', ua: 'Рівень відмов від чекауту' },
    baseline: '~30%',
    target:   '< 15%',
    how: { en: 'Track checkout_opened events where no transaction was initiated within 3 minutes', ua: 'Відстежувати події checkout_opened, де транзакція не була ініційована протягом 3 хвилин' },
  },
  {
    metric:   { en: 'Personalization hit rate', ua: 'Hit rate персоналізації' },
    baseline: '—',
    target:   '> 60% of sessions',
    how: { en: 'Sessions where at least one personalization signal was applied / total sessions', ua: 'Сесії, де було застосовано хоча б один сигнал персоналізації / всього сесій' },
  },
  {
    metric:   { en: '"Recommended" method acceptance rate', ua: 'Рівень прийняття "Recommended" методу' },
    baseline: '—',
    target:   '> 70%',
    how: { en: 'Players who used the recommended method / players who saw the recommended badge', ua: 'Гравці, які використали рекомендований метод / гравці, які бачили бейдж' },
  },
]

const BACKEND_CONTRACT: { field: string; type: string; note: I18n }[] = [
  { field: 'player_id',         type: 'string',   note: { en: 'Used to fetch preferred method from player profile', ua: 'Використовується для отримання кращого методу з профілю гравця' } },
  { field: 'brand_id',          type: 'string',   note: { en: 'Scopes available methods and personalization data', ua: 'Обмежує доступні методи та дані персоналізації' } },
  { field: 'direction',         type: 'enum',     note: { en: 'DEPOSIT | WITHDRAWAL -- affects method availability', ua: 'DEPOSIT | WITHDRAWAL -- впливає на доступність методів' } },
  { field: 'ip_address',        type: 'string',   note: { en: 'Resolved to country code server-side via GeoIP', ua: 'Визначається до коду країни на стороні сервера через GeoIP' } },
  { field: 'user_agent',        type: 'string',   note: { en: 'Resolved to device type: mobile / desktop / tablet', ua: 'Визначається до типу пристрою: mobile / desktop / tablet' } },
  { field: 'bin_prefix',        type: 'string?',  note: { en: 'Optional. Provided by FE after player types 6+ card digits', ua: 'Опціонально. Надається фронтендом після введення 6+ цифр картки' } },
]

const RESPONSE_FIELDS: { field: string; type: string; note: I18n }[] = [
  { field: 'methods',                    type: 'Method[]', note: { en: 'Ordered list of available methods. Order is the final personalized order.', ua: 'Впорядкований список доступних методів. Порядок -- фінальний персоналізований порядок.' } },
  { field: 'methods[].slug',             type: 'string',   note: { en: 'e.g. "visa", "mastercard", "crypto_usdt", "bank_transfer"', ua: 'Наприклад, "visa", "mastercard", "crypto_usdt", "bank_transfer"' } },
  { field: 'methods[].is_recommended',   type: 'boolean',  note: { en: 'True for at most one method in the list -- the top personalization pick', ua: 'True максимум для одного методу в списку -- топ-вибір персоналізації' } },
  { field: 'methods[].integration_type', type: 'enum',     note: { en: 'H2H | INVOICE_LINK -- determines checkout flow in FE', ua: 'H2H | INVOICE_LINK -- визначає флоу чекауту на фронтенді' } },
  { field: 'methods[].bin_hint',         type: 'object?',  note: { en: 'If bin_prefix was provided: { network, card_type, issuer_country }', ua: 'Якщо bin_prefix було надано: { network, card_type, issuer_country }' } },
]

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Page() {
  const [lang, setLang] = useState<Lang>('en')
  const t = (i: I18n) => i[lang]

  return (
    <DocLayout
      title={lang === 'ua' ? 'Персоналізація' : 'Personalization'}
      parentCrumb={{ label: 'Sandbox', href: '/sandbox' }}
      breadcrumbLabel="Payment Infrastructure"
      breadcrumbHref="/sandbox/payment-infra"
      description={lang === 'ua' ? 'BIN Lookup | Preferred Method | GEO Context | PSP Success Rate' : 'BIN Lookup | Preferred Method | GEO Context | PSP Success Rate'}
      tags={[
        { label: 'Phase 5',           type: 'tag'    },
        { label: 'Orchestration',     type: 'status' },
      ]}
      titleExtra={<LangSwitcher lang={lang} onChange={setLang} />}
      footnote="DEPO44 | PAYMENT MODULE v1 | PHASE 5 -- PERSONALIZATION"
    >

      {/* ── Section 1: Purpose ────────────────────────────────────────────── */}
      <DocSection num="1" title={lang === 'ua' ? 'Призначення' : 'Purpose'}>
        <InfoCard>
          {lang === 'ua'
            ? 'Персоналізація -- це шар між правилами адмін панелі та кінцевим гравцем. Вона не змінює, що дозволено -- вона змінює, що показується першим. Мета: перший запропонований метод має бути тим, яким гравець реально скористається.'
            : 'Personalization is the layer between Admin Panel rules and the end player. It does not change what is allowed -- it changes what is shown first. Goal: the first suggested method should be the one the player will actually use.'}
        </InfoCard>
        <div className="flex flex-col gap-3">
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

      {/* ── Section 2: Personalization Signals ───────────────────────────── */}
      <div className="mt-6">
      <DocSection num="2" title={lang === 'ua' ? 'Сигнали персоналізації' : 'Personalization Signals'}>
        <InfoCard>
          {lang === 'ua'
            ? 'Кожен сигнал -- незалежне джерело даних. Вони поєднуються в логіці ранжування (секція 3). Ніхто з них не є обов\'язковим -- система деградує до базового порядку адмін панелі, якщо сигнали відсутні.'
            : 'Each signal is an independent data source. They are combined in ranking logic (section 3). None are mandatory -- the system degrades gracefully to the Admin Panel base order if signals are absent.'}
        </InfoCard>
        <div className="flex flex-col gap-5">
          {SIGNALS.map((sig) => (
            <div key={sig.id} className="border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30">
                <div className={cn('flex size-7 shrink-0 items-center justify-center rounded-xl', sig.accent)}>
                  <sig.icon className="size-3.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t(sig.title)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{t(sig.description)}</p>
                </div>
              </div>
              <div className="p-5 grid grid-cols-1 gap-5 tablet:grid-cols-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                    {lang === 'ua' ? 'ВХІДНІ ДАНІ' : 'INPUTS'}
                  </p>
                  <ul className="flex flex-col gap-2">
                    {sig.inputs.map((inp, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <ArrowRight className="size-3 shrink-0 mt-0.5 text-muted-foreground/40" />
                        <span>{t(inp)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                    {lang === 'ua' ? 'ВИХІДНІ ДАНІ' : 'OUTPUTS'}
                  </p>
                  <ul className="flex flex-col gap-2">
                    {sig.outputs.map((out, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="size-3 shrink-0 mt-0.5 text-success" />
                        <span>{t(out)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                    {lang === 'ua' ? 'БЕКЕНД' : 'BACKEND'}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t(sig.backendNote)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DocSection>
      </div>

      {/* ── Section 3: Ranking Logic ──────────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="3" title={lang === 'ua' ? 'Логіка ранжування методів' : 'Method Ranking Logic'}>
        <InfoCard>
          {lang === 'ua'
            ? 'Правила застосовуються послідовно за пріоритетом. Перше правило, що спрацює, визначає топ-позицію. Решта методів залишаються в порядку адмін панелі.'
            : 'Rules are applied sequentially by priority. The first rule that fires determines the top position. Remaining methods stay in Admin Panel order.'}
        </InfoCard>
        <div className="flex flex-col gap-2">
          {RANKING_LOGIC.map((row) => (
            <div key={row.priority} className="border border-border rounded-2xl p-4 flex items-start gap-4">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground tabular-nums">
                {row.priority}
              </div>
              <div className="flex-1 min-w-0 grid grid-cols-1 gap-1 tablet:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-foreground mb-0.5">
                    {lang === 'ua' ? 'Умова' : 'Condition'}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t(row.condition)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground mb-0.5">
                    {lang === 'ua' ? 'Результат' : 'Result'}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t(row.result)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DocSection>
      </div>

      {/* ── Section 4: Checkout Flow ──────────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="4" title={lang === 'ua' ? 'Флоу чекауту з персоналізацією' : 'Personalized Checkout Flow'}>
        <div className="flex flex-col gap-3">
          {CHECKOUT_FLOW.map((step) => (
            <div key={step.step} className="border border-border rounded-2xl p-4 flex items-start gap-4">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground tabular-nums">
                {step.step}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-foreground">{t(step.title)}</p>
                  <span className={cn(
                    'text-xs font-mono px-1.5 py-0.5 rounded border',
                    step.who === 'FE' && 'bg-violet-500/10 text-violet-400 border-violet-500/20',
                    step.who === 'BE' && 'bg-sky-500/10 text-sky-400 border-sky-500/20',
                    step.who === 'Both' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                  )}>
                    {step.who}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{t(step.detail)}</p>
              </div>
            </div>
          ))}
        </div>
      </DocSection>
      </div>

      {/* ── Section 5: API Contract ───────────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="5" title={lang === 'ua' ? 'API контракт' : 'API Contract'}>
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">

          {/* Request */}
          <div className="border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
              <span className="text-xs font-mono text-sky-400">POST</span>
              <span className="text-xs font-mono text-foreground">/api/checkout/init</span>
              <Badge variant="secondary" className="ml-auto text-xs">Request</Badge>
            </div>
            <div className="divide-y divide-border">
              {BACKEND_CONTRACT.map((row) => (
                <div key={row.field} className="px-4 py-2.5">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-foreground">{row.field}</span>
                    <span className="text-xs text-muted-foreground/60 font-mono">{row.type}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t(row.note)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Response */}
          <div className="border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
              <span className="text-xs font-mono text-emerald-400">200</span>
              <span className="text-xs font-mono text-foreground">CheckoutSession</span>
              <Badge variant="secondary" className="ml-auto text-xs">Response</Badge>
            </div>
            <div className="divide-y divide-border">
              {RESPONSE_FIELDS.map((row) => (
                <div key={row.field} className="px-4 py-2.5">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-foreground">{row.field}</span>
                    <span className="text-xs text-muted-foreground/60 font-mono">{row.type}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t(row.note)}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </DocSection>
      </div>

      {/* ── Section 6: Privacy & Compliance ──────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="6" title={lang === 'ua' ? 'Конфіденційність та compliance' : 'Privacy & Compliance'}>
        <WarnCard>
          {lang === 'ua'
            ? 'Персоналізація обробляє платіжні дані гравця. Дотримання PCI DSS та GDPR -- не опціонально. Ці правила є жорсткими обмеженнями реалізації.'
            : 'Personalization processes player payment data. PCI DSS and GDPR compliance is not optional. These rules are hard implementation constraints.'}
        </WarnCard>
        <div className="border border-border rounded-2xl p-4">
          <FeatureList items={PRIVACY_RULES} lang={lang} />
        </div>
      </DocSection>
      </div>

      {/* ── Section 7: Success Metrics ────────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="7" title={lang === 'ua' ? 'Метрики успіху' : 'Success Metrics'}>
        <InfoCard>
          {lang === 'ua'
            ? 'Персоналізація без вимірювання -- це функція без визначення успіху. Усі чотири метрики мають відстежуватися з дня запуску.'
            : 'Personalization without measurement is a feature without a definition of success. All four metrics must be tracked from launch day.'}
        </InfoCard>
        <div className="border border-border rounded-2xl overflow-hidden">
          <div className="grid grid-cols-4 gap-0 border-b border-border bg-muted/30 px-4 py-2.5">
            {[
              lang === 'ua' ? 'МЕТРИКА' : 'METRIC',
              lang === 'ua' ? 'BASELINE' : 'BASELINE',
              lang === 'ua' ? 'ЦІЛЬ' : 'TARGET',
              lang === 'ua' ? 'ЯК ВИМІРЯТИ' : 'HOW TO MEASURE',
            ].map((h) => (
              <span key={h} className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{h}</span>
            ))}
          </div>
          <div className="divide-y divide-border">
            {METRICS.map((m, i) => (
              <div key={i} className="grid grid-cols-4 gap-0 px-4 py-3 items-start">
                <span className="text-xs font-semibold text-foreground leading-snug pr-3">{t(m.metric)}</span>
                <span className="text-xs text-muted-foreground tabular-nums pr-3">{m.baseline}</span>
                <span className="text-xs text-success font-semibold pr-3">{m.target}</span>
                <span className="text-xs text-muted-foreground leading-snug">{t(m.how)}</span>
              </div>
            ))}
          </div>
        </div>
      </DocSection>
      </div>

    </DocLayout>
  )
}
