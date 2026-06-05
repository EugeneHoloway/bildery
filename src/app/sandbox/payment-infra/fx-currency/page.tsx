'use client'

import { useState } from 'react'
import {
  ArrowLeftRight, Info, AlertTriangle, AlertCircle,
  Clock, RefreshCw, Database, Globe, ChevronRight,
  TrendingUp, Lock, FileText, Settings, Layers,
  DollarSign, BarChart2, Shield,
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

// Core concepts
const CORE_CONCEPTS: { icon: React.ElementType; title: I18n; desc: I18n }[] = [
  {
    icon: DollarSign,
    title: { en: 'Settlement currency', ua: 'Розрахункова валюта (Settlement)' },
    desc: {
      en: 'The currency in which the platform settles with the PSP and holds internal balances. All financial positions, limits, and reconciliation run in settlement currency. Typically USD or EUR, configured per operator at onboarding.',
      ua: 'Валюта в якій платформа розраховується з PSP та зберігає внутрішні баланси. Всі фінансові позиції, ліміти та reconciliation ведуться у розрахунковій валюті. Зазвичай USD або EUR, налаштовується для кожного оператора при онбордингу.',
    },
  },
  {
    icon: Globe,
    title: { en: 'Display currency', ua: 'Валюта відображення (Display)' },
    desc: {
      en: 'The currency the player sees in the UI -- their local currency (e.g. BRL, INR, NGN). Set per player based on GEO or player preference. Display amounts are always converted from settlement currency at the current rate at render time.',
      ua: 'Валюта яку гравець бачить в UI -- його локальна валюта (напр. BRL, INR, NGN). Встановлюється для кожного гравця на основі GEO або переваги гравця. Суми відображення завжди конвертуються з розрахункової валюти за поточним курсом на момент рендерингу.',
    },
  },
  {
    icon: Lock,
    title: { en: 'Rate lock (rate fixing)', ua: 'Фіксація курсу (rate lock)' },
    desc: {
      en: "The moment a player initiates a payment, the FX rate is locked for that transaction. This guarantees the player pays exactly what was shown on the checkout screen, regardless of how long PSP processing takes. The locked rate is stored on the transaction record.",
      ua: 'У момент коли гравець ініціює платіж, FX курс фіксується для цієї транзакції. Це гарантує що гравець платить рівно стільки скільки було показано на екрані чекауту, незалежно від тривалості обробки PSP. Зафіксований курс зберігається у записі транзакції.',
    },
  },
  {
    icon: RefreshCw,
    title: { en: 'Rate refresh cycle', ua: 'Цикл оновлення курсів' },
    desc: {
      en: 'Exchange rates are fetched from an external provider (e.g. Open Exchange Rates, Fixer.io, or ECB) and cached internally. Rates are refreshed every 15 minutes for display and locked at transaction initiation. Stale rates older than 30 minutes must not be used for new transactions.',
      ua: 'Обмінні курси отримуються від зовнішнього провайдера (напр. Open Exchange Rates, Fixer.io або ECB) та кешуються внутрішньо. Курси оновлюються кожні 15 хвилин для відображення та фіксуються при ініціації транзакції. Застарілі курси старші 30 хвилин не повинні використовуватись для нових транзакцій.',
    },
  },
]

// Rate sources comparison
const RATE_SOURCES: {
  name: string
  tier: I18n
  latency: string
  coverage: string
  cost: I18n
  suitable: I18n
  recommended?: boolean
}[] = [
  {
    name: 'Open Exchange Rates',
    tier: { en: 'Commercial', ua: 'Комерційний' },
    latency: '< 1s (REST)',
    coverage: '170+ currencies',
    cost: { en: '$12–$97/mo depending on plan', ua: '$12–$97/міс залежно від плану' },
    suitable: { en: 'Production -- reliable, wide coverage, SLA', ua: 'Production -- надійний, широке покриття, SLA' },
    recommended: true,
  },
  {
    name: 'Fixer.io',
    tier: { en: 'Commercial', ua: 'Комерційний' },
    latency: '< 1s (REST)',
    coverage: '170+ currencies',
    cost: { en: '$14–$99/mo', ua: '$14–$99/міс' },
    suitable: { en: 'Production -- EUR base, solid European coverage', ua: 'Production -- EUR база, надійне покриття Європи' },
  },
  {
    name: 'ECB (European Central Bank)',
    tier: { en: 'Free / Official', ua: 'Безкоштовний / Офіційний' },
    latency: 'Daily update (16:00 CET)',
    coverage: '32 currencies (EUR base)',
    cost: { en: 'Free', ua: 'Безкоштовно' },
    suitable: { en: 'Fallback / audit reference only -- too slow for live rates', ua: 'Тільки як fallback або аудитна довідка -- занадто повільний для live курсів' },
  },
  {
    name: 'CoinGecko / Binance',
    tier: { en: 'Crypto', ua: 'Крипто' },
    latency: '< 1s',
    coverage: 'BTC, ETH, USDT, etc.',
    cost: { en: 'Free tier available', ua: 'Є безкоштовний tier' },
    suitable: { en: 'Required alongside fiat provider for crypto deposit support', ua: "Потрібен паралельно з fiat провайдером для підтримки крипто-депозитів" },
  },
]

// Rate lock flow
const RATE_LOCK_FLOW: { title: I18n; desc: I18n; type: 'normal' | 'lock' | 'store' | 'use' }[] = [
  {
    title: { en: 'Player opens checkout', ua: 'Гравець відкриває чекаут' },
    desc: { en: 'Frontend calls GET /api/fx/rate?from=USD&to=BRL. Service returns current rate from cache. Player sees amount in display currency (e.g. "500 BRL").', ua: 'Frontend викликає GET /api/fx/rate?from=USD&to=BRL. Сервіс повертає поточний курс з кешу. Гравець бачить суму у валюті відображення (напр. "500 BRL").' },
    type: 'normal',
  },
  {
    title: { en: 'Player submits payment', ua: 'Гравець підтверджує платіж' },
    desc: { en: 'At the moment of submission, FX Service locks the rate for this transaction. The locked rate is valid for the TTL window (e.g. 10 minutes). If PSP processing takes longer, the locked rate still applies.', ua: 'У момент підтвердження FX Service фіксує курс для цієї транзакції. Зафіксований курс дійсний протягом TTL вікна (напр. 10 хвилин). Якщо обробка PSP займає більше -- зафіксований курс все одно застосовується.' },
    type: 'lock',
  },
  {
    title: { en: 'Rate stored on transaction', ua: 'Курс зберігається у транзакції' },
    desc: { en: 'Transaction record gets fx_rate, fx_rate_locked_at, display_currency, display_amount fields populated. These are immutable once set -- no process may change the locked rate after this point.', ua: 'Запис транзакції отримує поля fx_rate, fx_rate_locked_at, display_currency, display_amount. Вони незмінні після встановлення -- жоден процес не може змінити зафіксований курс після цього моменту.' },
    type: 'store',
  },
  {
    title: { en: 'Orchestrator calls PSP', ua: 'Оркестратор викликає PSP' },
    desc: { en: 'Payment is submitted to PSP in settlement currency (USD/EUR). PSP never sees the display currency -- conversion is internal to the platform. The amount in settlement currency was calculated from the locked rate.', ua: 'Платіж надсилається до PSP у розрахунковій валюті (USD/EUR). PSP ніколи не бачить валюту відображення -- конвертація є внутрішньою для платформи. Сума у розрахунковій валюті була розрахована за зафіксованим курсом.' },
    type: 'use',
  },
  {
    title: { en: 'Wallet Engine credits settlement amount', ua: 'Wallet Engine зараховує розрахункову суму' },
    desc: { en: 'On deposit success, Wallet credits the settlement_amount (not display_amount). Player balance is always stored in settlement currency. The frontend converts to display currency for rendering.', ua: 'При успішному депозиті Wallet зараховує settlement_amount (не display_amount). Баланс гравця завжди зберігається у розрахунковій валюті. Frontend конвертує у валюту відображення для рендерингу.' },
    type: 'use',
  },
]

// DB schema for fx_rates
const FX_RATES_COLUMNS: { col: string; type: string; desc: I18n }[] = [
  { col: 'id',             type: 'uuid PK',     desc: { en: 'Record ID',                                                                  ua: 'ID запису'                                                                  } },
  { col: 'base_currency',  type: 'char(3)',      desc: { en: 'ISO 4217 base currency (platform settlement currency, e.g. USD)',            ua: 'Базова валюта ISO 4217 (розрахункова валюта платформи, напр. USD)'           } },
  { col: 'quote_currency', type: 'char(3)',      desc: { en: 'ISO 4217 quote currency (player display currency, e.g. BRL)',                ua: 'Валюта котирування ISO 4217 (валюта відображення гравця, напр. BRL)'         } },
  { col: 'rate',           type: 'numeric(18,8)',desc: { en: 'Exchange rate: 1 base = rate * quote',                                       ua: 'Обмінний курс: 1 базова = rate * котирування'                               } },
  { col: 'source',         type: 'text',        desc: { en: 'Rate provider: "openexchangerates" | "fixer" | "ecb" | "manual"',            ua: 'Провайдер курсів: "openexchangerates" | "fixer" | "ecb" | "manual"'          } },
  { col: 'fetched_at',     type: 'timestamptz', desc: { en: 'Timestamp when rate was fetched from provider',                              ua: 'Час коли курс був отриманий від провайдера'                                  } },
  { col: 'valid_until',    type: 'timestamptz', desc: { en: 'Rate expires at this time. System rejects rates beyond this point.',         ua: 'Курс закінчується в цей час. Система відхиляє курси після цього моменту.'    } },
  { col: 'is_active',      type: 'boolean',     desc: { en: 'Only one active rate per currency pair. Superseded rates kept for history.', ua: 'Тільки один активний курс на валютну пару. Застарілі курси зберігаються в history.' } },
]

const TX_FX_COLUMNS: { col: string; type: string; desc: I18n }[] = [
  { col: 'settlement_currency', type: 'char(3)',       desc: { en: 'Currency used for PSP and Wallet (platform base currency)',        ua: 'Валюта для PSP та Wallet (базова валюта платформи)'                     } },
  { col: 'settlement_amount',   type: 'numeric(18,2)', desc: { en: 'Amount in settlement currency -- what actually moves',            ua: 'Сума у розрахунковій валюті -- те що реально рухається'                 } },
  { col: 'display_currency',    type: 'char(3)',       desc: { en: "Player's display currency at time of transaction",                ua: 'Валюта відображення гравця на момент транзакції'                         } },
  { col: 'display_amount',      type: 'numeric(18,2)', desc: { en: 'Amount shown to player (in display currency)',                    ua: 'Сума показана гравцю (у валюті відображення)'                           } },
  { col: 'fx_rate',             type: 'numeric(18,8)', desc: { en: 'Locked rate at transaction time: 1 settlement = fx_rate * display', ua: 'Зафіксований курс на час транзакції: 1 settlement = fx_rate * display'   } },
  { col: 'fx_rate_locked_at',   type: 'timestamptz',  desc: { en: 'When the rate was locked -- audit trail',                         ua: 'Коли курс був зафіксований -- audit trail'                               } },
  { col: 'fx_rate_source',      type: 'text',         desc: { en: 'Rate provider used for this transaction',                          ua: 'Провайдер курсів використаний для цієї транзакції'                       } },
]

// Modules affected
const AFFECTED_MODULES: { icon: React.ElementType; module: I18n; impact: I18n }[] = [
  {
    icon: Shield,
    module: { en: 'Limits & Rules', ua: 'Limits & Rules' },
    impact: { en: 'All limits (min/max deposit, daily caps, velocity) are defined and evaluated in settlement currency. FX Service converts the player\'s display amount to settlement before the limits engine checks it.', ua: "Всі ліміти (min/max депозит, денні кепи, velocity) визначаються та перевіряються у розрахунковій валюті. FX Service конвертує суму відображення гравця у розрахункову перед тим як движок лімітів перевіряє її." },
  },
  {
    icon: FileText,
    module: { en: 'KYC / AML', ua: 'KYC / AML' },
    impact: { en: 'AML thresholds (e.g. report transactions above €10,000) are defined in a reference currency. FX Service provides conversion to determine whether a transaction crosses reporting thresholds.', ua: 'AML пороги (напр. звітувати про транзакції вище €10,000) визначені у референсній валюті. FX Service забезпечує конвертацію для визначення чи перетинає транзакція пороги звітування.' },
  },
  {
    icon: BarChart2,
    module: { en: 'Reconciliation', ua: 'Reconciliation' },
    impact: { en: 'PSP settles in settlement currency, so reconciliation compares settlement_amount values. The fx_rate stored on each transaction is the source of truth for any historical conversion -- never re-apply current rates to past transactions.', ua: 'PSP розраховується у розрахунковій валюті, тому reconciliation порівнює значення settlement_amount. fx_rate збережений на кожній транзакції є джерелом правди для будь-якої історичної конвертації -- ніколи не застосовувати поточні курси до минулих транзакцій.' },
  },
  {
    icon: Settings,
    module: { en: 'Payment Orchestrator', ua: 'Payment Orchestrator' },
    impact: { en: 'Orchestrator routes in settlement currency. When a PSP only supports specific fiat currencies (not USD), Orchestrator signals FX Service to convert to the PSP\'s required currency before submission.', ua: 'Оркестратор маршрутизує у розрахунковій валюті. Коли PSP підтримує лише певні fiat валюти (не USD), Оркестратор сигналізує FX Service конвертувати у необхідну для PSP валюту перед відправкою.' },
  },
  {
    icon: Layers,
    module: { en: 'Bonus Engine', ua: 'Bonus Engine' },
    impact: { en: "Bonus match amounts and wagering requirements are denominated in settlement currency. A player depositing in BRL gets a bonus calculated on the settlement_amount, not the display_amount.", ua: 'Суми бонус-матчу та вимоги вейджеру деноміновані у розрахунковій валюті. Гравець що вносить депозит у BRL отримує бонус розрахований на settlement_amount, не на display_amount.' },
  },
  {
    icon: TrendingUp,
    module: { en: 'Admin Panel analytics', ua: 'Аналітика Admin Panel' },
    impact: { en: 'All revenue and volume metrics in Admin Panel are shown in settlement currency with operator-configured display currency overlay. Cross-operator aggregates are always in settlement currency.', ua: 'Всі метрики доходу та обсягу в Admin Panel відображаються у розрахунковій валюті з накладкою валюти відображення налаштованої оператором. Міжоператорні агрегати завжди у розрахунковій валюті.' },
  },
]

// Configuration cases
const CONFIG_CASES: {
  title: I18n
  setup: I18n
  example: I18n
  warn?: I18n
}[] = [
  {
    title: { en: 'Single-currency operator (simplest case)', ua: 'Одновалютний оператор (найпростіший кейс)' },
    setup: { en: 'Operator\'s settlement currency = player\'s display currency. FX conversion is a no-op (rate = 1.0). All amounts pass through unchanged. This is the default for EU operators running in EUR.', ua: "Розрахункова валюта оператора = валюта відображення гравця. FX конвертація є no-op (курс = 1.0). Всі суми проходять без змін. Це default для EU операторів що працюють у EUR." },
    example: { en: 'Settlement: EUR. Player GEO: Germany. Display: EUR. Rate: 1.0. No conversion needed.', ua: 'Settlement: EUR. GEO гравця: Німеччина. Display: EUR. Курс: 1.0. Конвертація не потрібна.' },
  },
  {
    title: { en: 'Multi-currency operator (standard case)', ua: 'Багатовалютний оператор (стандартний кейс)' },
    setup: { en: 'Operator settles in USD. Players span multiple GEOs with local currencies (BRL, INR, MXN, etc.). FX Service converts each player deposit amount from display currency to USD at the locked rate. Limits, wallets, and reconciliation work in USD.', ua: 'Оператор розраховується у USD. Гравці охоплюють кілька GEO з локальними валютами (BRL, INR, MXN тощо). FX Service конвертує суму депозиту кожного гравця з валюти відображення у USD за зафіксованим курсом. Ліміти, гаманці та reconciliation працюють у USD.' },
    example: { en: 'Player in Brazil deposits "500 BRL". Locked rate: 1 USD = 5.02 BRL. Settlement amount: 99.60 USD. Wallet is credited 99.60 USD.', ua: 'Гравець з Бразилії вносить "500 BRL". Зафіксований курс: 1 USD = 5.02 BRL. Розрахункова сума: 99.60 USD. Wallet зараховує 99.60 USD.' },
  },
  {
    title: { en: 'PSP-currency mismatch', ua: 'Невідповідність валюти PSP' },
    setup: { en: 'Platform settlement is USD, but the PSP for a given GEO only accepts EUR. Orchestrator detects the mismatch and calls FX Service to convert settlement_amount from USD to EUR before the PSP API call. A second fx_rate (settlement_to_psp) is stored on the transaction.', ua: 'Settlement платформи USD, але PSP для певного GEO приймає лише EUR. Оркестратор виявляє невідповідність і викликає FX Service для конвертації settlement_amount з USD у EUR перед викликом PSP API. Другий fx_rate (settlement_to_psp) зберігається у транзакції.' },
    example: { en: 'Settlement: 99.60 USD. PSP requires EUR. Rate: 1 USD = 0.921 EUR. PSP receives: 91.73 EUR. Both rates stored for full audit trail.', ua: 'Settlement: 99.60 USD. PSP вимагає EUR. Курс: 1 USD = 0.921 EUR. PSP отримує: 91.73 EUR. Обидва курси збережені для повного audit trail.' },
    warn: { en: 'Two conversion steps introduce two rate lock moments -- both must be stored on the transaction for reconciliation and dispute resolution.', ua: 'Два кроки конвертації вносять два моменти фіксації курсу -- обидва мають бути збережені у транзакції для reconciliation та вирішення диспутів.' },
  },
  {
    title: { en: 'Crypto deposit (display in crypto, settle in fiat)', ua: 'Крипто-депозит (display у крипто, settle у fiat)' },
    setup: { en: 'Player deposits USDT or BTC. Display amount is in crypto units. FX Service fetches the crypto/USD rate from a crypto provider (CoinGecko/Binance), locks it, and converts to settlement currency. Crypto rate volatility means the lock TTL should be shorter (2–3 minutes vs 10 for fiat).', ua: 'Гравець вносить USDT або BTC. Сума відображення у крипто-одиницях. FX Service отримує курс crypto/USD від крипто-провайдера (CoinGecko/Binance), фіксує його та конвертує у розрахункову валюту. Волатильність крипто-курсів означає що TTL фіксації повинен бути коротшим (2–3 хвилини vs 10 для fiat).' },
    example: { en: 'Player deposits 100 USDT. Rate: 1 USDT = 0.9996 USD. Settlement: 99.96 USD. Lock TTL: 3 minutes.', ua: 'Гравець вносить 100 USDT. Курс: 1 USDT = 0.9996 USD. Settlement: 99.96 USD. TTL фіксації: 3 хвилини.' },
    warn: { en: 'For volatile assets (BTC, ETH), display the locked rate on the checkout screen with a visible countdown. If TTL expires before submission, refresh the rate and re-display.', ua: 'Для волатильних активів (BTC, ETH), відображати зафіксований курс на екрані чекауту з видимим відліком. Якщо TTL закінчується до підтвердження -- оновити курс та відобразити заново.' },
  },
  {
    title: { en: 'Withdrawal in display currency', ua: 'Виведення у валюті відображення' },
    setup: { en: 'Player requests withdrawal in their local currency. Wallet holds settlement currency -- FX Service converts at the current (not locked) rate to determine the display amount shown to the player. The actual PSP transfer is in settlement or PSP currency. The rate is locked at the moment the withdrawal is approved, not when the player requests it.', ua: 'Гравець запитує виведення у своїй локальній валюті. Wallet зберігає розрахункову валюту -- FX Service конвертує за поточним (не зафіксованим) курсом щоб визначити суму відображення для гравця. Фактичний переказ PSP у розрахунковій або валюті PSP. Курс фіксується в момент схвалення виведення, не коли гравець його запитує.' },
    example: { en: 'Player balance: 200 USD. Requests withdrawal to BRL. Displayed: "~1,006 BRL" (preview, not locked). On approval: rate locked at 1 USD = 5.03 BRL → 1,006 BRL sent.', ua: 'Баланс гравця: 200 USD. Запит виведення у BRL. Відображається: "~1,006 BRL" (попередній перегляд, не зафіксовано). При схваленні: курс фіксується на 1 USD = 5.03 BRL → відправляється 1,006 BRL.' },
  },
]

// Admin config
const ADMIN_CONFIG: { icon: React.ElementType; title: I18n; desc: I18n }[] = [
  {
    icon: Settings,
    title: { en: 'Per-operator settlement currency', ua: 'Розрахункова валюта на оператора' },
    desc: { en: 'Set at operator onboarding and stored in operator_config. Cannot be changed after first transaction -- changing settlement currency requires full financial migration. Add a guard in Admin Panel: field is read-only once transactions exist.', ua: 'Встановлюється при онбордингу оператора і зберігається в operator_config. Не може бути змінена після першої транзакції -- зміна розрахункової валюти вимагає повної фінансової міграції. Додати захист в Admin Panel: поле read-only після появи транзакцій.' },
  },
  {
    icon: Globe,
    title: { en: 'Supported display currencies per operator', ua: 'Підтримувані валюти відображення на оператора' },
    desc: { en: 'Each operator configures which display currencies are available for their players (GEO-based or explicit list). Unsupported currencies fall back to settlement currency display. Config stored as JSON array in operator_config.supported_currencies.', ua: 'Кожен оператор налаштовує які валюти відображення доступні для його гравців (на основі GEO або явний список). Непідтримувані валюти відображаються у розрахунковій валюті як fallback. Конфіг зберігається як JSON масив в operator_config.supported_currencies.' },
  },
  {
    icon: TrendingUp,
    title: { en: 'FX spread / markup', ua: 'FX spread / markup' },
    desc: { en: 'Platform may add a configurable spread (e.g. 1.5%) on top of the mid-market rate. Spread is configured per operator and applied when generating locked rates. The gross rate shown to the player already includes the spread -- it is never shown separately. Revenue from spread is tracked in the reconciliation fee ledger.', ua: 'Платформа може додавати налаштовуваний spread (напр. 1.5%) поверх mid-market курсу. Spread налаштовується для кожного оператора та застосовується при генерації зафіксованих курсів. Валовий курс показаний гравцю вже включає spread -- він ніколи не відображається окремо. Дохід від spread відстежується у реєстрі комісій reconciliation.' },
  },
  {
    icon: RefreshCw,
    title: { en: 'Rate refresh interval', ua: 'Інтервал оновлення курсів' },
    desc: { en: 'Default: 15 minutes for fiat, 2 minutes for crypto. Configurable per operator in Admin Panel. Shorter intervals = more API calls to rate provider = higher cost. Platform default should be conservative (15 min) with option to reduce for high-volume operators.', ua: 'За замовчуванням: 15 хвилин для fiat, 2 хвилини для крипто. Налаштовується для кожного оператора в Admin Panel. Коротші інтервали = більше API викликів до провайдера курсів = вища вартість. Default платформи має бути консервативним (15 хв) з можливістю зменшення для операторів з великим обсягом.' },
  },
  {
    icon: Lock,
    title: { en: 'Rate lock TTL', ua: 'TTL фіксації курсу' },
    desc: { en: 'Default: 10 minutes for fiat, 3 minutes for crypto. If a transaction is not submitted to PSP within TTL, the locked rate expires and the checkout must refresh. Stored in operator_config.fx_lock_ttl_seconds. Never set above 30 minutes for fiat or 5 minutes for crypto.', ua: 'За замовчуванням: 10 хвилин для fiat, 3 хвилини для крипто. Якщо транзакція не подана до PSP протягом TTL, зафіксований курс закінчується і чекаут повинен оновитись. Зберігається в operator_config.fx_lock_ttl_seconds. Ніколи не встановлювати більше 30 хвилин для fiat або 5 хвилин для крипто.' },
  },
  {
    icon: Database,
    title: { en: 'Manual rate override', ua: 'Ручне перевизначення курсу' },
    desc: { en: 'Admin Panel allows entering a manual rate for a currency pair (source = "manual"). Used when the rate provider is down or for testing. Manual rates expire after 1 hour and require a reason field. All manual rate events are audit-logged with admin user ID.', ua: 'Admin Panel дозволяє вводити ручний курс для валютної пари (source = "manual"). Використовується коли провайдер курсів недоступний або для тестування. Ручні курси закінчуються через 1 годину та вимагають поля причини. Всі події ручних курсів записуються в audit log з ID адміністратора.' },
  },
]

// ─── Component ─────────────────────────────────────────────────────────────────

export default function FxCurrencyPage() {
  const [lang, setLang] = useState<Lang>('en')
  const ua = lang === 'ua'

  return (
    <DocLayout
      title="FX / Multi-currency"
      breadcrumbLabel="Payment Infrastructure"
      breadcrumbHref="/sandbox/payment-infra"
      parentCrumb={{ label: 'Sandbox', href: '/sandbox' }}
      description={ua
        ? 'Джерела курсів, фіксація курсу, settlement vs display валюта, historical rates для reconciliation'
        : 'Rate sources, rate locking, settlement vs display currency, historical rates for reconciliation'}
      tags={[
        { label: 'Phase 3', type: 'tag'    },
        { label: 'Spec',    type: 'status' },
      ]}
      titleExtra={<LangSwitcher lang={lang} onChange={setLang} />}
    >

      {/* ── Section 1: Core concepts ──────────────────────────────────────── */}
      <DocSection num="1" title={ua ? 'Ключові концепції' : 'Core Concepts'}>
        <InfoCard>
          {ua
            ? <>FX Service -- це централізований сервіс платформи для роботи з обмінними курсами. Він є джерелом правди для всіх конвертацій. Жоден інший компонент не виконує конвертацію валют самостійно. Всі ліміти, баланси та розрахунки ведуться у <strong>розрахунковій валюті</strong>, тоді як гравці бачать суми у своїй <strong>локальній валюті відображення</strong>.</>
            : <>FX Service is the platform's centralised service for exchange rates. It is the single source of truth for all conversions. No other component performs currency conversion independently. All limits, balances, and settlements operate in <strong>settlement currency</strong>, while players see amounts in their <strong>local display currency</strong>.</>}
        </InfoCard>
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
          {CORE_CONCEPTS.map((c, i) => (
            <div key={i} className="border border-border rounded-2xl p-4">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <c.icon className="size-3.5" />
                </div>
                <p className="text-sm font-semibold text-foreground">{c.title[lang]}</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.desc[lang]}</p>
            </div>
          ))}
        </div>
      </DocSection>

      {/* ── Section 2: Rate sources ───────────────────────────────────────── */}
      <div className="mt-8">
        <DocSection num="2" title={ua ? 'Джерела курсів' : 'Rate Sources'}>
          <WarnCard>
            {ua
              ? <>Платформа повинна мати <strong>мінімум два джерела</strong>: основний комерційний провайдер та fallback (ECB або cached last-known). Якщо основний провайдер недоступний і немає fallback, нові транзакції у валютах відмінних від settlement currency повинні бути <strong>заблоковані</strong>, а не оброблені за застарілим курсом.</>
              : <>The platform must have <strong>at least two sources</strong>: a primary commercial provider and a fallback (ECB or cached last-known). If the primary provider is unavailable and there is no fallback, new transactions in currencies other than settlement currency must be <strong>blocked</strong>, not processed at a stale rate.</>}
          </WarnCard>
          <DocTable>
            <DocTableHeader>
              <TableRow>
                <TableHead>{ua ? 'Провайдер' : 'Provider'}</TableHead>
                <TableHead>{ua ? 'Tier' : 'Tier'}</TableHead>
                <TableHead>{ua ? 'Покриття' : 'Coverage'}</TableHead>
                <TableHead>{ua ? 'Вартість' : 'Cost'}</TableHead>
                <TableHead>{ua ? 'Призначення' : 'Use case'}</TableHead>
              </TableRow>
            </DocTableHeader>
            <TableBody>
              {RATE_SOURCES.map((s, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-foreground">{s.name}</span>
                      {s.recommended && <Badge className="text-xs bg-success-bg text-success">{ua ? 'Рекомендовано' : 'Recommended'}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{s.tier[lang]}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.coverage}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.cost[lang]}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.suitable[lang]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DocTable>
        </DocSection>
      </div>

      {/* ── Section 3: Rate lock flow ─────────────────────────────────────── */}
      <div className="mt-8">
        <DocSection num="3" title={ua ? 'Флоу фіксації курсу' : 'Rate Lock Flow'}>
          <InfoCard>
            {ua
              ? <>Фіксація курсу захищає гравця від коливань курсу під час обробки транзакції та захищає платформу від навмисного використання затримок для отримання вигіднішого курсу. Зафіксований курс -- <strong>незмінний контракт</strong> між гравцем і платформою для цієї транзакції.</>
              : <>Rate locking protects the player from rate fluctuations during transaction processing and protects the platform from deliberate use of delays to capture a more favourable rate. The locked rate is an <strong>immutable contract</strong> between player and platform for that transaction.</>}
          </InfoCard>
          <div className="flex flex-col gap-3">
            {RATE_LOCK_FLOW.map((step, i) => {
              const isLock  = step.type === 'lock'
              const isStore = step.type === 'store'
              const isUse   = step.type === 'use'
              return (
                <div key={i} className={cn(
                  'border rounded-2xl p-4',
                  isLock  ? 'border-brand/25 bg-brand-bg'    :
                  isStore ? 'border-success/25 bg-success-bg' :
                  isUse   ? 'border-border bg-subtle'        :
                  'border-border bg-card',
                )}>
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold mt-0.5',
                      isLock  ? 'bg-brand/20 text-brand'          :
                      isStore ? 'bg-success/20 text-success'       :
                      'bg-muted text-muted-foreground',
                    )}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground mb-1">{step.title[lang]}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.desc[lang]}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </DocSection>
      </div>

      {/* ── Section 4: Data model ─────────────────────────────────────────── */}
      <div className="mt-8">
        <DocSection num="4" title={ua ? 'Модель даних' : 'Data Model'}>

          <p className="text-sm font-semibold text-foreground mb-3">
            {ua ? 'Таблиця fx_rates -- поточні та historical курси' : 'Table fx_rates -- current and historical rates'}
          </p>
          <DocTable>
            <DocTableHeader>
              <TableRow>
                <TableHead>{ua ? 'Колонка' : 'Column'}</TableHead>
                <TableHead>{ua ? 'Тип' : 'Type'}</TableHead>
                <TableHead>{ua ? 'Опис' : 'Description'}</TableHead>
              </TableRow>
            </DocTableHeader>
            <TableBody>
              {FX_RATES_COLUMNS.map((col) => (
                <TableRow key={col.col}>
                  <TableCell><code className="text-xs font-mono text-foreground">{col.col}</code></TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs font-mono">{col.type}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{col.desc[lang]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DocTable>

          <p className="text-sm font-semibold text-foreground mt-6 mb-3">
            {ua ? 'FX-поля у таблиці transactions' : 'FX fields on the transactions table'}
          </p>
          <InfoCard>
            {ua
              ? <>Ці поля додаються до існуючої таблиці <code className="text-xs bg-muted rounded px-1.5 py-0.5">transactions</code> як частина Phase 3. Жодне з них не може бути NULL для транзакцій у валютах відмінних від settlement currency. Для транзакцій у settlement currency -- display_currency = settlement_currency, display_amount = settlement_amount, fx_rate = 1.0.</>
              : <>These fields are added to the existing <code className="text-xs bg-muted rounded px-1.5 py-0.5">transactions</code> table as part of Phase 3. None of them may be NULL for transactions in currencies other than settlement currency. For transactions in settlement currency -- display_currency = settlement_currency, display_amount = settlement_amount, fx_rate = 1.0.</>}
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
              {TX_FX_COLUMNS.map((col) => (
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

      {/* ── Section 5: Configuration cases ───────────────────────────────── */}
      <div className="mt-8">
        <DocSection num="5" title={ua ? 'Кейси налаштування' : 'Configuration Cases'}>
          <div className="flex flex-col gap-4">
            {CONFIG_CASES.map((c, i) => (
              <div key={i} className="border border-border rounded-2xl p-4">
                <p className="text-sm font-semibold text-foreground mb-2">{c.title[lang]}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{c.setup[lang]}</p>
                <div className="flex items-start gap-2 rounded-xl bg-muted px-3 py-2 mb-2">
                  <ChevronRight className="size-3.5 shrink-0 mt-0.5 text-muted-foreground/50" />
                  <p className="text-xs text-muted-foreground font-mono leading-relaxed">{c.example[lang]}</p>
                </div>
                {c.warn && (
                  <div className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning-bg px-3 py-2 mt-2">
                    <AlertTriangle className="size-3.5 shrink-0 mt-0.5 text-warning" />
                    <p className="text-xs text-foreground leading-relaxed">{c.warn[lang]}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </DocSection>
      </div>

      {/* ── Section 6: Affected modules ───────────────────────────────────── */}
      <div className="mt-8">
        <DocSection num="6" title={ua ? 'Залежні модулі' : 'Affected Modules'}>
          <InfoCard>
            {ua
              ? <>FX Service з'являється у Phase 3 але впливає на модулі з різних фаз. При імплементації кожного з них потрібно враховувати що всі суми приходять у <strong>settlement currency</strong> і жоден з цих модулів не повинен самостійно застосовувати FX конвертацію.</>
              : <>FX Service arrives in Phase 3 but affects modules from multiple phases. When implementing each of them, the key invariant is that all amounts arrive in <strong>settlement currency</strong> and none of these modules should independently apply FX conversion.</>}
          </InfoCard>
          <div className="flex flex-col gap-3">
            {AFFECTED_MODULES.map((m, i) => (
              <div key={i} className="border border-border rounded-2xl p-4 flex items-start gap-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground mt-0.5">
                  <m.icon className="size-3.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">{m.module[lang]}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{m.impact[lang]}</p>
                </div>
              </div>
            ))}
          </div>
        </DocSection>
      </div>

      {/* ── Section 7: Admin configuration ───────────────────────────────── */}
      <div className="mt-8">
        <DocSection num="7" title={ua ? 'Налаштування в Admin Panel' : 'Admin Panel Configuration'}>
          <DangerCard>
            {ua
              ? <><strong>Settlement currency незмінна після першої транзакції.</strong> Додати hard guard в Admin Panel та backend -- якщо для оператора існують будь-які транзакції, поле settlement_currency повинно бути read-only. Зміна потребує окремої фінансової міграції з участю фінансового директора.</>
              : <><strong>Settlement currency is immutable after the first transaction.</strong> Add a hard guard in Admin Panel and backend -- if any transactions exist for the operator, the settlement_currency field must be read-only. Changing it requires a separate financial migration involving the CFO.</>}
          </DangerCard>
          <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
            {ADMIN_CONFIG.map((c, i) => (
              <div key={i} className="border border-border rounded-2xl p-4">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <c.icon className="size-3.5" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{c.title[lang]}</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.desc[lang]}</p>
              </div>
            ))}
          </div>
        </DocSection>
      </div>

    </DocLayout>
  )
}
