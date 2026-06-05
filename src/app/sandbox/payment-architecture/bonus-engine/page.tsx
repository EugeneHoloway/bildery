'use client'

import { useState } from 'react'
import {
  Gift, Info, AlertTriangle, CheckCircle2, XCircle,
  ArrowRight, Lock, Wallet, TrendingUp, BookOpen,
  Scale, Clock, Ban, Repeat2, Percent,
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

const BONUS_LIFECYCLE: { label: I18n; note: I18n; colorCls: string; bgCls: string; borderCls: string }[] = [
  { label: { en: 'PENDING',    ua: 'PENDING'    }, note: { en: 'Bonus created, deposit confirmed, awaiting activation', ua: 'Бонус створено, депозит підтверджено, очікує активації' }, colorCls: 'text-slate-500',   bgCls: 'bg-slate-500/10',   borderCls: 'border-slate-500/20'   },
  { label: { en: 'ACTIVE',     ua: 'ACTIVE'     }, note: { en: 'Wagering in progress -- player is playing', ua: 'Вейджер в процесі -- гравець грає' },                              colorCls: 'text-sky-500',     bgCls: 'bg-sky-500/10',     borderCls: 'border-sky-500/20'     },
  { label: { en: 'COMPLETED',  ua: 'COMPLETED'  }, note: { en: 'Wager requirement met -- bonus funds converted to real money', ua: 'Вейджер виконано -- бонусні кошти конвертовано в реальні' },  colorCls: 'text-success',     bgCls: 'bg-success-bg',     borderCls: 'border-success/20'     },
  { label: { en: 'CANCELLED',  ua: 'CANCELLED'  }, note: { en: 'Player withdrew before completing wager, or ops cancelled', ua: 'Гравець вивів до виконання вейджеру або ops скасував' },         colorCls: 'text-destructive', bgCls: 'bg-destructive-bg', borderCls: 'border-destructive/20' },
  { label: { en: 'EXPIRED',    ua: 'EXPIRED'    }, note: { en: 'Expiry date passed before wager was completed', ua: 'Термін дії минув до виконання вейджеру' },                    colorCls: 'text-orange-500',  bgCls: 'bg-orange-500/10',  borderCls: 'border-orange-500/20'  },
  { label: { en: 'FORFEITED',  ua: 'FORFEITED'  }, note: { en: 'Player explicitly opted out and forfeited bonus + winnings', ua: 'Гравець явно відмовився від бонусу та виграшів' },             colorCls: 'text-muted-foreground', bgCls: 'bg-muted', borderCls: 'border-border'        },
]

const CONTRIBUTION_RATES: { category: I18n; rate: I18n; note?: I18n }[] = [
  { category: { en: 'Slots',                  ua: 'Слоти'                }, rate: { en: '100%',  ua: '100%'  } },
  { category: { en: 'Live casino',            ua: 'Live казино'          }, rate: { en: '10%',   ua: '10%'   }, note: { en: 'High RTP games contribute less', ua: 'Ігри з високим RTP внескують менше' } },
  { category: { en: 'Table games (RNG)',      ua: 'Настільні ігри (RNG)' }, rate: { en: '20%',   ua: '20%'   } },
  { category: { en: 'Sports betting',         ua: 'Ставки на спорт'      }, rate: { en: '10%',   ua: '10%'   }, note: { en: 'Only bets with odds ≥ 1.5 count', ua: 'Тільки ставки з коефіцієнтом ≥ 1.5' } },
  { category: { en: 'Video poker',            ua: 'Відеопокер'           }, rate: { en: '10%',   ua: '10%'   } },
  { category: { en: 'Scratch cards / Keno',   ua: 'Скретч / Кено'        }, rate: { en: '50%',   ua: '50%'   } },
  { category: { en: 'Jackpot slots',          ua: 'Джекпот слоти'        }, rate: { en: '0%',    ua: '0%'    }, note: { en: 'Excluded from wagering by default', ua: 'За замовчуванням виключені з вейджеру' } },
]

const LAUNCH_RULES: { rule: I18n; detail: I18n; required: boolean }[] = [
  { rule: { en: 'Deposit match bonus',                 ua: 'Бонус на депозит (% match)'         }, detail: { en: 'Trigger: deposit ≥ min_deposit + player opted in. Credit: deposit × match_pct, capped at max_bonus.', ua: 'Тригер: депозит ≥ min_deposit + гравець дав згоду. Нарахування: депозит × match_pct, не більше max_bonus.' }, required: true },
  { rule: { en: 'Wager requirement tracking',          ua: 'Відстеження вейджеру'                }, detail: { en: 'Every qualifying bet increments wager_progress by bet_amount × contribution_rate. When progress ≥ requirement, auto-complete.', ua: 'Кожна кваліфікована ставка збільшує wager_progress на bet_amount × contribution_rate. При виконанні -- авто-завершення.' }, required: true },
  { rule: { en: 'Bonus balance lock',                  ua: 'Лок бонусного балансу'               }, detail: { en: 'Bonus funds are held in a separate locked balance in Wallet Engine. Cannot be withdrawn until COMPLETED.', ua: 'Бонусні кошти зберігаються на окремому заблокованому балансі в Wallet Engine. Виведення заблоковано до COMPLETED.' }, required: true },
  { rule: { en: 'Withdrawal block integration',        ua: 'Інтеграція блоку виведення'          }, detail: { en: 'Limits & Rules engine calls Bonus Engine before approving withdrawal. If active bonus with incomplete wager → WAGER_NOT_COMPLETE.', ua: 'Limits & Rules engine викликає Bonus Engine перед схваленням виведення. Якщо активний бонус з незавершеним вейджером → WAGER_NOT_COMPLETE.' }, required: true },
  { rule: { en: 'Bonus auto-expiry',                   ua: 'Авто-закінчення бонусу'              }, detail: { en: 'Scheduled job runs daily: mark expired bonuses as EXPIRED, deduct locked balance from Wallet Engine.', ua: 'Щоденна задача: позначити прострочені бонуси як EXPIRED, списати заблокований баланс з Wallet Engine.' }, required: true },
  { rule: { en: 'One active bonus per player',         ua: 'Один активний бонус на гравця'       }, detail: { en: 'Phase 3: no bonus stacking. New bonus offer is blocked if player already has an ACTIVE or PENDING bonus.', ua: 'Phase 3: без стекінгу бонусів. Нова пропозиція блокується якщо є ACTIVE або PENDING бонус.' }, required: true },
  { rule: { en: 'Bonus cancellation by ops',           ua: 'Скасування ops'                      }, detail: { en: 'Operations team can cancel any bonus. On cancel: set CANCELLED, deduct bonus balance, log reason.', ua: 'Ops команда може скасувати будь-який бонус. При скасуванні: CANCELLED, списання балансу, лог причини.' }, required: true },
  { rule: { en: 'Configurable contribution rates',     ua: 'Налаштовувані внески за категорію'   }, detail: { en: 'Rates per game category stored in bonus_templates.game_contributions. Not hardcoded.', ua: 'Ставки per категорія зберігаються в bonus_templates.game_contributions. Не хардкодяться.' }, required: true },
  { rule: { en: 'Wagering on real money first',        ua: 'Спочатку вейджер на реальні гроші'   }, detail: { en: 'Real money balance is wagered before bonus balance. Prevents bonus abuse where players spin only with bonus funds.', ua: 'Реальний баланс витрачається до бонусного. Запобігає зловживанню де гравці грають тільки на бонуси.' }, required: false },
  { rule: { en: 'Max win cap per bonus',               ua: 'Максимальний виграш на бонус'         }, detail: { en: 'Total winnings from bonus funds capped at max_win_multiplier × bonus_amount. Excess deducted on completion.', ua: 'Загальний виграш з бонусних коштів обмежений max_win_multiplier × bonus_amount. Надлишок списується при завершенні.' }, required: false },
]

const DATA_INPUTS: { label: I18n; source: I18n; Icon: React.ElementType }[] = [
  { label: { en: 'user_id, brand_id, deposit amount, payment method', ua: 'user_id, brand_id, сума депозиту, метод оплати' }, source: { en: 'from Wallet Engine on deposit confirmed', ua: 'від Wallet Engine після підтвердження депозиту' }, Icon: Wallet },
  { label: { en: 'Active bonuses for user: status, wager progress, expiry', ua: 'Активні бонуси гравця: статус, прогрес вейджеру, termін' }, source: { en: 'player_bonuses table (Redis cache)', ua: 'таблиця player_bonuses (Redis кеш)' }, Icon: Gift },
  { label: { en: 'Bonus templates: match %, min deposit, max bonus, wager multiplier, expiry', ua: 'Шаблони бонусів: match %, min депозит, max бонус, множник вейджеру, термін' }, source: { en: 'bonus_templates table (per brand)', ua: 'таблиця bonus_templates (per бренд)' }, Icon: Percent },
  { label: { en: 'Bet amount, game category, game_id (for wagering contribution)', ua: 'Сума ставки, категорія гри, game_id (для внеску в вейджер)' }, source: { en: 'Game provider webhook / Wallet Engine on each bet', ua: 'Webhook від game provider / Wallet Engine при кожній ставці' }, Icon: TrendingUp },
  { label: { en: 'Withdrawal request amount (for wager lock check)', ua: 'Сума запиту на виведення (для перевірки wager lock)' }, source: { en: 'from Limits & Rules engine (withdrawal flow)', ua: 'від Limits & Rules engine (флоу виведення)' }, Icon: Lock },
]

const REQUEST_FLOWS: { title: I18n; steps: { text: I18n; type: 'normal' | 'block' | 'pass' | 'side' }[] }[] = [
  {
    title: { en: 'On deposit confirmed', ua: 'При підтвердженні депозиту' },
    steps: [
      { text: { en: 'Wallet Engine notifies Bonus Engine: deposit confirmed (user_id, brand_id, amount, method)', ua: 'Wallet Engine повідомляє Bonus Engine: депозит підтверджено (user_id, brand_id, amount, method)' }, type: 'normal' },
      { text: { en: 'Check: does user have an ACTIVE or PENDING bonus? → if yes, skip (no stacking)', ua: 'Перевірка: є ACTIVE або PENDING бонус? → якщо так, пропустити (без стекінгу)' }, type: 'normal' },
      { text: { en: 'Check: does deposit match any active bonus_template? (amount ≥ min_deposit, player opted in)', ua: 'Перевірка: депозит відповідає шаблону бонусу? (amount ≥ min_deposit, гравець дав згоду)' }, type: 'normal' },
      { text: { en: 'If match → create player_bonus record (PENDING), calculate bonus_amount = min(deposit × pct, max_bonus)', ua: 'Якщо відповідає → створити player_bonus (PENDING), bonus_amount = min(депозит × pct, max_bonus)' }, type: 'side' },
      { text: { en: 'Credit bonus_amount to locked balance in Wallet Engine → set bonus to ACTIVE', ua: 'Нарахувати bonus_amount на заблокований баланс в Wallet Engine → статус ACTIVE' }, type: 'pass' },
    ],
  },
  {
    title: { en: 'On each qualifying bet', ua: 'При кожній кваліфікованій ставці' },
    steps: [
      { text: { en: 'Receive bet event: user_id, bet_amount, game_category', ua: 'Отримати подію ставки: user_id, bet_amount, game_category' }, type: 'normal' },
      { text: { en: 'Look up contribution_rate for game_category from active bonus template', ua: 'Знайти contribution_rate для game_category з шаблону активного бонусу' }, type: 'normal' },
      { text: { en: 'Increment wager_progress += bet_amount × contribution_rate', ua: 'Збільшити wager_progress += bet_amount × contribution_rate' }, type: 'normal' },
      { text: { en: 'If wager_progress ≥ wager_requirement → auto-complete: convert locked balance to real balance in Wallet Engine, set COMPLETED', ua: 'Якщо wager_progress ≥ wager_requirement → авто-завершення: конвертувати заблокований баланс в реальний, встановити COMPLETED' }, type: 'pass' },
    ],
  },
  {
    title: { en: 'On withdrawal request (called by Limits & Rules)', ua: 'При запиті виведення (виклик від Limits & Rules)' },
    steps: [
      { text: { en: 'Check: does user have an ACTIVE bonus with wager_progress < wager_requirement?', ua: 'Перевірка: є ACTIVE бонус з wager_progress < wager_requirement?' }, type: 'normal' },
      { text: { en: 'If YES → return WAGER_NOT_COMPLETE (with progress % and remaining amount)', ua: 'Якщо ТАК → повернути WAGER_NOT_COMPLETE (з прогресом % та залишком)' }, type: 'block' },
      { text: { en: 'If NO → return PASS (no active wager lock)', ua: 'Якщо НІ → повернути PASS (немає вейджер-локу)' }, type: 'pass' },
    ],
  },
]

const ERROR_CODES: { code: string; http: string; desc: I18n; playerMsg: I18n }[] = [
  { code: 'WAGER_NOT_COMPLETE',     http: '422', desc: { en: 'Active bonus has an unfulfilled wagering requirement', ua: 'Активний бонус має невиконаний вейджер' }, playerMsg: { en: '"Complete your wagering requirement to withdraw. Progress: X%"', ua: '"Виконайте вейджер для виведення. Прогрес: X%"' } },
  { code: 'BONUS_ALREADY_ACTIVE',   http: '422', desc: { en: 'Player already has an active or pending bonus — cannot issue another', ua: 'Гравець вже має активний або очікуючий бонус' }, playerMsg: { en: '"You already have an active bonus"', ua: '"У вас вже є активний бонус"' } },
  { code: 'BONUS_EXPIRED',          http: '422', desc: { en: 'Bonus expired before player completed wagering', ua: 'Бонус закінчився до виконання вейджеру' }, playerMsg: { en: '"Your bonus has expired"', ua: '"Термін дії бонусу закінчився"' } },
  { code: 'BONUS_CANCELLED',        http: '422', desc: { en: 'Bonus was cancelled by ops team', ua: 'Бонус скасовано ops командою' }, playerMsg: { en: '"Your bonus has been removed. Contact support for details."', ua: '"Ваш бонус видалено. Зверніться до підтримки."' } },
  { code: 'DEPOSIT_TOO_LOW',        http: '422', desc: { en: 'Deposit amount below min_deposit threshold for bonus eligibility', ua: 'Сума депозиту нижче min_deposit для отримання бонусу' }, playerMsg: { en: '"Minimum deposit for this bonus is $X"', ua: '"Мінімальний депозит для цього бонусу: $X"' } },
]

const BEST_PRACTICES: { icon: React.ElementType; title: I18n; items: I18n[] }[] = [
  {
    icon: Scale,
    title: { en: 'Separation of concerns', ua: 'Розділення відповідальностей' },
    items: [
      { en: 'Wallet Engine tracks balances (real, locked, bonus). Bonus Engine tracks eligibility, progress, and lifecycle. Never mix these concerns.', ua: 'Wallet Engine відстежує баланси (реальний, заблокований, бонусний). Bonus Engine відстежує право, прогрес і статус. Не змішуйте.' },
      { en: 'Wagering progress is tracked per-bonus (not per-player) to support multiple bonuses in future phases without refactoring.', ua: 'Прогрес вейджеру відстежується per-bonus (не per-player) -- щоб у майбутньому підтримати кілька бонусів без рефакторингу.' },
      { en: 'Bonus Engine never modifies Wallet balances directly -- it sends commands to Wallet Engine (credit_locked, unlock, debit_locked).', ua: 'Bonus Engine ніколи не змінює баланси Wallet безпосередньо -- він відправляє команди до Wallet Engine (credit_locked, unlock, debit_locked).' },
    ],
  },
  {
    icon: BookOpen,
    title: { en: 'Phase 3 scope -- what to build now', ua: 'Scope Phase 3 -- що будувати зараз' },
    items: [
      { en: 'One bonus type for Phase 3: deposit match bonus. Free spins, cashback, referral bonuses -- Phase 5+.', ua: 'Один тип бонусу для Phase 3: депозит-матч. Free spins, cashback, реферальні бонуси -- Phase 5+.' },
      { en: 'No bonus stacking for Phase 3. One active bonus per player per brand is sufficient for launch.', ua: 'Без стекінгу для Phase 3. Один активний бонус на гравця на бренд достатньо для старту.' },
      { en: 'Wagering tracking can be event-driven (bet webhook) or batch (nightly reconciliation of bets). Event-driven is preferred.', ua: 'Відстеження вейджеру може бути event-driven (webhook ставки) або batch (нічна звірка). Event-driven кращий варіант.' },
    ],
  },
  {
    icon: TrendingUp,
    title: { en: 'Performance & reliability', ua: 'Продуктивність та надійність' },
    items: [
      { en: 'Cache active bonus per user in Redis (TTL 60s) -- checked on every withdrawal request.', ua: 'Кешувати активний бонус гравця в Redis (TTL 60s) -- перевіряється при кожному запиті на виведення.' },
      { en: 'Wagering updates are high-frequency (every bet). Use optimistic locking or atomic increment to avoid race conditions on wager_progress.', ua: 'Оновлення вейджеру відбуваються часто (кожна ставка). Використовуйте optimistic locking або atomic increment щоб уникнути race conditions.' },
      { en: 'Expiry job must be idempotent -- safe to run multiple times without double-deducting balances.', ua: 'Задача закінчення терміну повинна бути idempotent -- безпечна при повторному запуску без подвійного списання.' },
    ],
  },
  {
    icon: Lock,
    title: { en: 'Compliance & audit', ua: 'Комплаєнс та аудит' },
    items: [
      { en: 'Log every state transition with reason: PENDING→ACTIVE, ACTIVE→COMPLETED, ACTIVE→CANCELLED(reason), ACTIVE→EXPIRED.', ua: 'Логувати кожну зміну статусу з причиною: PENDING→ACTIVE, ACTIVE→COMPLETED, ACTIVE→CANCELLED(причина), ACTIVE→EXPIRED.' },
      { en: 'Bonus terms (wager multiplier, expiry, max win) must be shown to player at opt-in -- regulatory requirement in most jurisdictions.', ua: 'Умови бонусу (множник вейджеру, термін, max виграш) мають бути показані гравцю при згоді -- вимога регулятора в більшості юрисдикцій.' },
      { en: 'On withdrawal with active bonus: present player with a clear choice -- forfeit bonus and withdraw, or keep bonus and continue wagering.', ua: 'При виведенні з активним бонусом: показати гравцю чіткий вибір -- відмовитись від бонусу та вивести, або зберегти бонус та продовжити вейджер.' },
    ],
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const [lang, setLang] = useState<Lang>('en')
  const ua = lang === 'ua'

  return (
    <DocLayout
      title="Bonus Engine"
      breadcrumbLabel="Payment module"
      breadcrumbHref="/sandbox/payment-architecture"
      parentCrumb={{ label: 'Sandbox', href: '/sandbox' }}
      description={ua
        ? 'Нарахування бонусів, відстеження вейджеру, блокування балансу та авто-закінчення'
        : 'Bonus issuance, wagering requirement tracking, balance locking and auto-expiry'}
      tags={[
        { label: 'Phase 3', type: 'tag'    },
        { label: 'Spec',    type: 'status' },
      ]}
      titleExtra={<LangSwitcher lang={lang} onChange={setLang} />}
      footnote="DEPO44 | BONUS ENGINE SPEC v1 | PHASE 3"
    >

      {/* ── Intro ─────────────────────────────────────────────────────────── */}
      <InfoCard>
        {ua
          ? <>Bonus Engine -- це окремий сервіс в Support Services Layer, який керує повним життєвим циклом бонусів: <strong>нарахування</strong> (при депозиті), <strong>відстеження вейджеру</strong> (при кожній ставці), <strong>блокування балансу</strong> (через Wallet Engine) та <strong>завершення або скасування</strong>. Він не зберігає баланси -- це відповідальність Wallet Engine. Bonus Engine лише визначає, коли і скільки коштів заблокувати або розблокувати.</>
          : <>Bonus Engine is a dedicated service in the Support Services Layer that manages the full bonus lifecycle: <strong>issuance</strong> (on deposit), <strong>wagering tracking</strong> (on each bet), <strong>balance locking</strong> (via Wallet Engine), and <strong>completion or cancellation</strong>. It does not store balances -- that is Wallet Engine&apos;s responsibility. Bonus Engine only decides when and how much to lock or unlock.</>
        }
      </InfoCard>

      <WarnCard>
        {ua
          ? <>Бонусний баланс і реальний баланс -- <strong>два окремих регістри</strong> в Wallet Engine. Гравець бачить обидва, але вивести можна тільки реальний. При ставці спочатку витрачається реальний баланс, потім бонусний. Ніколи не змішуйте логіку балансів в Bonus Engine -- вся робота з балансами тільки через Wallet Engine.</>
          : <>Bonus balance and real money balance are <strong>two separate ledgers</strong> in Wallet Engine. The player sees both, but only real money can be withdrawn. On each bet, real balance is consumed first, then bonus balance. Never mix balance logic into Bonus Engine -- all balance operations go through Wallet Engine only.</>
        }
      </WarnCard>

      {/* ── Section 1: Purpose ────────────────────────────────────────────── */}
      <DocSection num="1" title={ua ? 'Призначення' : 'Purpose'}>
        <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2 mb-6">
          {[
            { Icon: Gift,      title: { en: 'Bonus issuance',           ua: 'Нарахування бонусів'       }, desc: { en: 'Grant deposit match bonuses when a qualifying deposit is made and the player has opted in. Creates a bonus record and credits locked balance.', ua: 'Нарахувати бонус при кваліфікуючому депозиті якщо гравець дав згоду. Створює запис бонусу та нараховує заблокований баланс.' } },
            { Icon: TrendingUp,title: { en: 'Wagering requirement tracking', ua: 'Відстеження вейджеру' }, desc: { en: 'Track how much the player has wagered towards the requirement. Each qualifying bet increments progress based on game category contribution rate.', ua: 'Відстежувати скільки гравець поставив по відношенню до вимоги. Кожна ставка збільшує прогрес згідно внеску категорії гри.' } },
            { Icon: Lock,      title: { en: 'Balance locking',           ua: 'Блокування балансу'       }, desc: { en: 'Bonus funds are held in a locked balance that cannot be withdrawn. Only unlocked (converted to real money) when wagering is complete.', ua: 'Бонусні кошти зберігаються в заблокованому балансі. Розблоковуються (конвертуються в реальні гроші) тільки після виконання вейджеру.' } },
            { Icon: Ban,       title: { en: 'Withdrawal block',          ua: 'Блок виведення'           }, desc: { en: 'Integrates with Limits & Rules engine to block withdrawal while an active bonus has an unfulfilled wager requirement.', ua: 'Інтеграція з Limits & Rules engine для блокування виведення поки активний бонус має невиконаний вейджер.' } },
            { Icon: Clock,     title: { en: 'Auto-expiry',               ua: 'Авто-закінчення'          }, desc: { en: 'Bonuses expire if wagering is not completed within the configured period. Expired bonuses are cancelled and locked balance is deducted.', ua: 'Бонуси закінчуються якщо вейджер не виконано у встановлений термін. Прострочені бонуси скасовуються та заблокований баланс списується.' } },
            { Icon: Repeat2,   title: { en: 'Lifecycle audit',           ua: 'Аудит lifecycle'          }, desc: { en: 'Every status transition is logged with timestamp, reason, and actor. Required for compliance and dispute resolution.', ua: 'Кожна зміна статусу логується з часом, причиною та ініціатором. Необхідно для комплаєнсу та вирішення спорів.' } },
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
              { label: { en: 'Wallet Engine', ua: 'Wallet Engine' }, note: { en: 'notifies Bonus Engine on deposit confirmed; executes balance lock/unlock commands', ua: 'повідомляє Bonus Engine при підтвердженні депозиту; виконує команди lock/unlock балансу' }, active: false },
              { label: { en: 'Bonus Engine ← YOU ARE HERE', ua: 'Bonus Engine ← ВИ ТУТ' }, note: { en: 'issues bonuses, tracks wagering, responds to wager lock checks', ua: 'нараховує бонуси, відстежує вейджер, відповідає на перевірки wager lock' }, active: true },
              { label: { en: 'Limits & Rules engine (calls Bonus Engine)', ua: 'Limits & Rules engine (викликає Bonus Engine)' }, note: { en: 'asks "is there a wager lock?" before approving withdrawal', ua: 'запитує "є wager lock?" перед схваленням виведення' }, active: false },
              { label: { en: 'Game provider webhooks', ua: 'Webhook від game provider' }, note: { en: 'sends bet events to increment wager progress', ua: 'відправляє події ставок для збільшення прогресу вейджеру' }, active: false },
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

        {/* Three flows */}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {ua ? 'Три основних флоу' : 'Three main flows'}
        </p>
        <div className="flex flex-col gap-4 mb-6">
          {REQUEST_FLOWS.map((flow) => (
            <div key={flow.title.en} className="border border-border rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">{flow.title[lang]}</p>
              <div className="flex flex-col gap-2">
                {flow.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded-md text-xs font-bold tabular-nums mt-0.5',
                      step.type === 'side' ? 'bg-amber-500/10 text-amber-500' : 'bg-muted text-muted-foreground',
                    )}>{i + 1}</div>
                    <span className={cn(
                      'text-sm leading-snug',
                      step.type === 'block' ? 'text-destructive' :
                      step.type === 'pass'  ? 'text-success' :
                      step.type === 'side'  ? 'text-amber-500' :
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
          ))}
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

        {/* Bonus lifecycle */}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {ua ? 'Lifecycle бонусу' : 'Bonus lifecycle'}
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {BONUS_LIFECYCLE.map((s, i) => (
            <div key={s.label.en} className="flex items-center gap-2">
              <code className={cn('text-xs font-mono px-2.5 py-1 rounded-lg border shrink-0', s.colorCls, s.bgCls, s.borderCls)}>
                {s.label[lang]}
              </code>
              <span className="text-xs text-muted-foreground hidden tablet:block">{s.note[lang]}</span>
              {i < BONUS_LIFECYCLE.length - 1 && <ArrowRight className="size-3 text-muted-foreground/30 shrink-0" />}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1.5 mb-6">
          {BONUS_LIFECYCLE.map((s) => (
            <div key={s.label.en} className="flex items-start gap-2 tablet:hidden">
              <code className={cn('text-xs font-mono px-2.5 py-1 rounded-lg border shrink-0', s.colorCls, s.bgCls, s.borderCls)}>
                {s.label[lang]}
              </code>
              <span className="text-xs text-muted-foreground">{s.note[lang]}</span>
            </div>
          ))}
        </div>

        {/* Launch rules */}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {ua ? 'Правила обовʼязкові для запуску' : 'Rules required for launch'}
        </p>
        <DocTable className="mb-6">
          <DocTableHeader>
            <TableRow>
              <TableHead>{ua ? 'Правило' : 'Rule'}</TableHead>
              <TableHead>{ua ? 'Деталі' : 'Details'}</TableHead>
              <TableHead>{ua ? 'Обовʼязково?' : 'Required?'}</TableHead>
            </TableRow>
          </DocTableHeader>
          <TableBody>
            {LAUNCH_RULES.map((r, i) => (
              <TableRow key={i}>
                <TableCell className="text-sm font-medium text-foreground whitespace-nowrap">{r.rule[lang]}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.detail[lang]}</TableCell>
                <TableCell>
                  {r.required
                    ? <Badge variant="outline" className="text-xs bg-success-bg text-success border-success/30">{ua ? 'Так' : 'Yes'}</Badge>
                    : <Badge variant="outline" className="text-xs bg-muted text-muted-foreground">{ua ? 'Рекомендовано' : 'Recommended'}</Badge>
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DocTable>

        {/* Wagering contributions */}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {ua ? 'Внески вейджеру за категорію гри (типові значення)' : 'Wagering contribution by game category (typical defaults)'}
        </p>
        <DocTable className="mb-6">
          <DocTableHeader>
            <TableRow>
              <TableHead>{ua ? 'Категорія' : 'Category'}</TableHead>
              <TableHead>{ua ? 'Внесок' : 'Contribution'}</TableHead>
              <TableHead>{ua ? 'Примітка' : 'Note'}</TableHead>
            </TableRow>
          </DocTableHeader>
          <TableBody>
            {CONTRIBUTION_RATES.map((r) => (
              <TableRow key={r.category.en}>
                <TableCell className="text-sm font-medium text-foreground">{r.category[lang]}</TableCell>
                <TableCell>
                  <span className={cn(
                    'text-sm font-semibold',
                    r.rate.en === '100%' ? 'text-success' :
                    r.rate.en === '0%'   ? 'text-destructive' : 'text-amber-500',
                  )}>{r.rate[lang]}</span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{r.note?.[lang] ?? '--'}</TableCell>
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
                <TableCell><span className="text-xs font-semibold text-amber-500">{r.http}</span></TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.desc[lang]}</TableCell>
                <TableCell className="text-xs text-muted-foreground italic">{r.playerMsg[lang]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DocTable>

        {/* DB schema */}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {ua ? 'Мінімальна схема БД для Phase 3' : 'Minimum DB schema for Phase 3'}
        </p>
        <div className="border border-border rounded-2xl overflow-hidden">
          <pre className="text-xs font-mono text-muted-foreground p-4 leading-relaxed overflow-x-auto bg-card">{`-- Bonus offer templates (configured per brand by ops)
bonus_templates (
  id, brand_id, name, type,        -- 'deposit_match'
  match_pct, min_deposit, max_bonus,
  wager_multiplier,                -- e.g. 30 means 30× bonus amount
  expiry_days,
  max_win_multiplier,              -- null = no cap
  game_contributions               -- JSON: { slots: 1.0, live: 0.1, ... }
  is_active
)

-- Active bonuses per player
player_bonuses (
  id, user_id, brand_id, bonus_template_id,
  status,             -- PENDING | ACTIVE | COMPLETED | CANCELLED | EXPIRED | FORFEITED
  bonus_amount,       -- credited to locked balance
  wager_requirement,  -- bonus_amount × wager_multiplier
  wager_progress,     -- incremented on each qualifying bet
  deposited_amount,   -- the deposit that triggered this bonus
  expires_at,
  completed_at, cancelled_at, cancel_reason,
  created_at
)

-- Append-only wager event log
wager_transactions (
  id, player_bonus_id, transaction_id,
  game_category, bet_amount,
  contribution_rate, contribution_amount,
  wager_progress_after,
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
