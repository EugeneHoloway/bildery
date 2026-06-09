'use client'

import { useState } from 'react'
import {
  Wrench, Info, AlertTriangle, CheckCircle2,
  Code2, Database, Settings, TestTube2, FileText,
  Zap, Shield, RefreshCw, ArrowRight, GitBranch,
  Plug, BookOpen, ClipboardList,
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

// ─── Data ─────────────────────────────────────────────────────────────────────

interface ChecklistGroup {
  id: string
  icon: React.ElementType
  accent: string
  title: I18n
  who: 'BE' | 'FE' | 'Both' | 'PM'
  items: I18n[]
  note?: I18n
}

const CHECKLIST: ChecklistGroup[] = [
  {
    id: 'research',
    icon: BookOpen,
    accent: 'bg-slate-500/10 text-slate-400',
    who: 'PM',
    title: { en: 'Step 1 -- Research & Decision', ua: 'Крок 1 -- Дослідження та рішення' },
    items: [
      { en: 'Obtain PSP API documentation (sandbox + production)', ua: 'Отримати API-документацію PSP (sandbox + production)' },
      { en: 'Identify supported payment methods, countries, and currencies', ua: 'Визначити підтримувані методи оплати, країни та валюти' },
      { en: 'Clarify integration type for each method: H2H (direct API) or Invoice Link (redirect)', ua: 'Уточнити тип інтеграції для кожного методу: H2H (прямий API) або Invoice Link (редирект)' },
      { en: 'Confirm webhook delivery: what events are sent, payload format, signing algorithm', ua: 'Підтвердити доставку вебхуків: які події надсилаються, формат payload, алгоритм підпису' },
      { en: 'Clarify settlement currency and payout schedule', ua: 'Уточнити валюту розрахунків та графік виплат' },
      { en: 'Confirm sandbox credentials are available for development', ua: 'Підтвердити наявність sandbox credentials для розробки' },
      { en: 'Map PSP-specific transaction statuses to UnifiedStatus enum (see State Machine spec)', ua: 'Зіставити специфічні статуси транзакцій PSP з enum UnifiedStatus (див. специфікацію State Machine)' },
    ],
    note: {
      en: 'The status mapping must be complete and agreed before any code is written. Gaps here cause reconciliation bugs later.',
      ua: 'Зіставлення статусів має бути повним та узгодженим до написання будь-якого коду. Прогалини тут призводять до помилок reconciliation пізніше.',
    },
  },
  {
    id: 'admin',
    icon: Settings,
    accent: 'bg-violet-500/10 text-violet-500',
    who: 'PM',
    title: { en: 'Step 2 -- Admin Panel Configuration', ua: 'Крок 2 -- Налаштування в адмін панелі' },
    items: [
      { en: 'Create a new PSP record in Admin Panel: name, slug, base URL, timeout, retry policy', ua: 'Створити новий запис PSP в адмін панелі: назва, slug, base URL, timeout, retry policy' },
      { en: 'Enter API credentials (key/secret) -- stored encrypted, never visible after save', ua: 'Ввести API credentials (key/secret) -- зберігаються зашифрованими, недоступні після збереження' },
      { en: 'Enter webhook signing secret', ua: 'Ввести webhook signing secret' },
      { en: 'Register each supported payment method under this PSP with correct integration type (H2H / Invoice Link)', ua: 'Зареєструвати кожен підтримуваний метод оплати під цим PSP з правильним типом інтеграції (H2H / Invoice Link)' },
      { en: 'Set PSP status to MAINTENANCE -- it will be excluded from routing until explicitly activated', ua: 'Встановити статус PSP в MAINTENANCE -- він буде виключений з роутингу до явної активації' },
      { en: 'Add routing rules for the new PSP (brand + country + method combinations)', ua: 'Додати правила роутингу для нового PSP (комбінації бренд + країна + метод)' },
    ],
  },
  {
    id: 'adapter',
    icon: Plug,
    accent: 'bg-sky-500/10 text-sky-500',
    who: 'BE',
    title: { en: 'Step 3 -- Adapter Implementation', ua: 'Крок 3 -- Реалізація адаптера' },
    items: [
      { en: 'Create a new class implementing IPaymentProvider interface -- do not modify the interface itself', ua: 'Створити новий клас, що реалізує інтерфейс IPaymentProvider -- не модифікувати сам інтерфейс' },
      { en: 'Implement initiateDeposit() -- maps UnifiedDepositRequest → PSP-specific request, returns UnifiedResponse', ua: 'Реалізувати initiateDeposit() -- перетворює UnifiedDepositRequest → специфічний запит PSP, повертає UnifiedResponse' },
      { en: 'Implement initiateWithdrawal() -- same pattern', ua: 'Реалізувати initiateWithdrawal() -- той самий паттерн' },
      { en: 'Implement getTransactionStatus() -- maps PSP status response → UnifiedStatus', ua: 'Реалізувати getTransactionStatus() -- перетворює відповідь PSP зі статусом → UnifiedStatus' },
      { en: 'Implement handleWebhook() -- validate signature, parse payload, emit UnifiedEvent', ua: 'Реалізувати handleWebhook() -- перевірити підпис, розібрати payload, відправити UnifiedEvent' },
      { en: 'Implement getSupportedMethods() -- returns Method[] filtered by geo + currency', ua: 'Реалізувати getSupportedMethods() -- повертає Method[] відфільтровані за geo + currency' },
      { en: 'Register the new adapter in the adapter factory/registry (the only place that knows concrete PSP classes)', ua: 'Зареєструвати новий адаптер у factory/registry адаптерів (єдине місце, де відомі конкретні класи PSP)' },
    ],
    note: {
      en: 'Zero changes to Orchestrator, Cascade Manager, or any other service. If you need to change something outside the adapter + registry, the interface contract is likely broken -- revisit before proceeding.',
      ua: 'Нуль змін в Оркестраторі, Cascade Manager або будь-якому іншому сервісі. Якщо потрібно змінити щось поза адаптером + registry -- контракт інтерфейсу, швидше за все, порушено. Переглянь перед продовженням.',
    },
  },
  {
    id: 'database',
    icon: Database,
    accent: 'bg-amber-500/10 text-amber-500',
    who: 'BE',
    title: { en: 'Step 4 -- Data & Configuration', ua: 'Крок 4 -- Дані та конфігурація' },
    items: [
      { en: 'Add a migration that inserts the new PSP into psp_configs (if seeded from code, not Admin Panel)', ua: 'Додати міграцію, що вставляє новий PSP в psp_configs (якщо seeds з коду, а не через адмін панель)' },
      { en: 'Add new PSP-specific status codes to the status_mapping table (psp_slug + raw_status → UnifiedStatus)', ua: 'Додати нові специфічні коди статусів PSP до таблиці status_mapping (psp_slug + raw_status → UnifiedStatus)' },
      { en: 'Ensure reconciliation job handles this PSP\'s transaction format (date format, amount unit, currency field name)', ua: 'Переконатися, що reconciliation job обробляє формат транзакцій цього PSP (формат дати, одиниця суми, назва поля валюти)' },
      { en: 'Add PSP to the health-check scheduler configuration', ua: 'Додати PSP до конфігурації планувальника health-check' },
    ],
  },
  {
    id: 'testing',
    icon: TestTube2,
    accent: 'bg-emerald-500/10 text-emerald-500',
    who: 'BE',
    title: { en: 'Step 5 -- Testing (Sandbox)', ua: 'Крок 5 -- Тестування (Sandbox)' },
    items: [
      { en: 'Unit tests for status mapping: every PSP status code maps to a UnifiedStatus without gaps', ua: 'Юніт-тести для зіставлення статусів: кожен код статусу PSP відображається у UnifiedStatus без прогалин' },
      { en: 'Unit tests for webhook signature validation: valid signature passes, tampered payload fails', ua: 'Юніт-тести для перевірки підпису вебхука: дійсний підпис проходить, змінений payload -- ні' },
      { en: 'Integration test: deposit flow end-to-end against PSP sandbox', ua: 'Інтеграційний тест: повний флоу депозиту через sandbox PSP' },
      { en: 'Integration test: withdrawal flow end-to-end against PSP sandbox', ua: 'Інтеграційний тест: повний флоу виведення через sandbox PSP' },
      { en: 'Test cascade fallback: PSP #1 fails, traffic routes to new PSP successfully', ua: 'Тест каскадного fallback: PSP #1 падає, трафік успішно маршрутизується до нового PSP' },
      { en: 'Test MAINTENANCE mode: new PSP in MAINTENANCE is never selected by Orchestrator', ua: 'Тест режиму MAINTENANCE: новий PSP в MAINTENANCE ніколи не обирається Оркестратором' },
      { en: 'Test reconciliation: a sample PSP settlement file is parsed correctly and matched to transactions', ua: 'Тест reconciliation: зразок файлу розрахунків PSP правильно парситься та зіставляється з транзакціями' },
    ],
  },
  {
    id: 'frontend',
    icon: Code2,
    accent: 'bg-violet-500/10 text-violet-500',
    who: 'FE',
    title: { en: 'Step 6 -- Frontend (if new methods added)', ua: 'Крок 6 -- Фронтенд (якщо додаються нові методи)' },
    items: [
      { en: 'Add method icon/logo asset to the checkout UI asset registry', ua: 'Додати іконку/логотип методу до реєстру ресурсів UI чекауту' },
      { en: 'If integration type is Invoice Link: ensure redirect + return URL flow is handled (the checkout already supports this generically)', ua: 'Якщо тип інтеграції Invoice Link: переконатися, що флоу redirect + return URL обробляється (чекаут вже підтримує це узагальнено)' },
      { en: 'If integration type is H2H with a custom form (e.g. crypto address input): add the method-specific input component', ua: 'Якщо тип інтеграції H2H з кастомною формою (наприклад, введення crypto адреси): додати специфічний для методу компонент інпуту' },
      { en: 'No changes to checkout routing, state machine, or method list ordering logic -- these are driven by backend response', ua: 'Жодних змін у роутингу чекауту, state machine або логіці порядку списку методів -- вони визначаються відповіддю бекенду' },
    ],
    note: {
      en: 'In most cases (card PSPs, standard redirects) zero frontend changes are needed. The checkout UI is data-driven from the backend method list.',
      ua: 'У більшості випадків (карткові PSP, стандартні редиректи) фронтенд-зміни не потрібні. UI чекауту керується даними зі списку методів бекенду.',
    },
  },
  {
    id: 'launch',
    icon: Zap,
    accent: 'bg-rose-500/10 text-rose-500',
    who: 'Both',
    title: { en: 'Step 7 -- Production Launch', ua: 'Крок 7 -- Запуск у production' },
    items: [
      { en: 'Enter production API credentials in Admin Panel (sandbox credentials must not reach production)', ua: 'Ввести production API credentials в адмін панелі (sandbox credentials не повинні потрапити у production)' },
      { en: 'Set routing rules to send a small % of traffic (1-5%) to the new PSP -- A/B split in Admin Panel', ua: 'Налаштувати правила роутингу на відправку малого % трафіку (1-5%) до нового PSP -- A/B split в адмін панелі' },
      { en: 'Monitor success rate and error rate for the new PSP in real time for 30 minutes', ua: 'Моніторити success rate та error rate нового PSP в реальному часі протягом 30 хвилин' },
      { en: 'If success rate is comparable to existing PSPs -- increase traffic split gradually', ua: 'Якщо success rate порівнянний з існуючими PSP -- поступово збільшувати розподіл трафіку' },
      { en: 'If success rate drops below threshold -- switch PSP back to MAINTENANCE in Admin Panel (no code deploy needed)', ua: 'Якщо success rate падає нижче порогу -- переключити PSP назад у MAINTENANCE в адмін панелі (деплой коду не потрібен)' },
      { en: 'Update the routing rules to full traffic once stability is confirmed over 24h', ua: 'Оновити правила роутингу до повного трафіку після підтвердження стабільності протягом 24 год' },
    ],
    note: {
      en: 'Never go straight to 100% traffic for a new PSP. The A/B split + MAINTENANCE toggle combination means rollback takes seconds, not a deploy.',
      ua: 'Ніколи не переходити одразу до 100% трафіку для нового PSP. Комбінація A/B split + тоггл MAINTENANCE означає, що відкат займає секунди, а не деплой.',
    },
  },
]

const INTERFACE_METHODS: { name: string; signature: string; note: I18n }[] = [
  {
    name: 'initiateDeposit',
    signature: '(req: UnifiedDepositRequest) → Promise<UnifiedResponse>',
    note: { en: 'Maps your unified request to PSP-specific API call. Returns unified response regardless of PSP format.', ua: 'Перетворює уніфікований запит на PSP-специфічний API виклик. Повертає уніфіковану відповідь незалежно від формату PSP.' },
  },
  {
    name: 'initiateWithdrawal',
    signature: '(req: UnifiedWithdrawalRequest) → Promise<UnifiedResponse>',
    note: { en: 'Same pattern as deposit.', ua: 'Той самий паттерн, що й депозит.' },
  },
  {
    name: 'getTransactionStatus',
    signature: '(id: string) → Promise<UnifiedStatus>',
    note: { en: 'Polling fallback. Maps PSP-specific status string to UnifiedStatus enum.', ua: 'Резервний polling. Перетворює PSP-специфічний рядок статусу на enum UnifiedStatus.' },
  },
  {
    name: 'handleWebhook',
    signature: '(payload: unknown, headers: Headers) → Promise<UnifiedEvent>',
    note: { en: 'Validates signature, parses payload, emits a unified event for the State Machine.', ua: 'Перевіряє підпис, парсить payload, відправляє уніфіковану подію для State Machine.' },
  },
  {
    name: 'getSupportedMethods',
    signature: '(geo: string, currency: string) → Method[]',
    note: { en: 'Returns methods this PSP supports for the given geo+currency. Used by Orchestrator to filter candidates.', ua: 'Повертає методи, які підтримує цей PSP для заданого geo+currency. Використовується Оркестратором для фільтрації кандидатів.' },
  },
]

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Page() {
  const [lang, setLang] = useState<Lang>('en')
  const t = (i: I18n) => i[lang]

  return (
    <DocLayout
      title={lang === 'ua' ? 'Як додати новий PSP' : 'How to Add a New PSP'}
      parentCrumb={{ label: 'Sandbox', href: '/sandbox' }}
      breadcrumbLabel="Payment module"
      breadcrumbHref="/sandbox/payment-architecture"
      description={lang === 'ua' ? 'Покроковий чеклист для інтеграції будь-якого нового платіжного провайдера' : 'Step-by-step checklist for integrating any new payment provider'}
      tags={[
        { label: 'Next',         type: 'tag'    },
        { label: 'Reference',    type: 'status' },
      ]}
      titleExtra={<LangSwitcher lang={lang} onChange={setLang} />}
      footnote="DEPO44 | PAYMENT MODULE v1 | OUT OF SCOPE -- ADD NEW PSP"
    >

      {/* ── Section 1: Overview ───────────────────────────────────────────── */}
      <DocSection num="1" title={lang === 'ua' ? 'Огляд' : 'Overview'}>
        <InfoCard>
          {lang === 'ua'
            ? 'Завдяки Adapter Pattern додавання нового PSP -- це ізольована задача. Жодних змін в Оркестраторі, Cascade Manager, чекауті або State Machine. Весь новий код живе в одному адаптері + реєстрації в factory.'
            : 'Thanks to the Adapter Pattern, adding a new PSP is an isolated task. No changes to the Orchestrator, Cascade Manager, checkout, or State Machine. All new code lives in one adapter + registration in the factory.'}
        </InfoCard>
        <WarnCard>
          {lang === 'ua'
            ? 'Якщо при додаванні нового PSP виникає необхідність змінити код поза адаптером -- це сигнал, що контракт IPaymentProvider порушений. Зупинись і виправ контракт перед продовженням.'
            : 'If adding a new PSP requires changing code outside the adapter -- that is a signal the IPaymentProvider contract is broken. Stop and fix the contract before proceeding.'}
        </WarnCard>

        {/* Interface quick-ref */}
        <div className="border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
            <Plug className="size-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">IPaymentProvider</span>
            <Badge variant="secondary" className="ml-auto text-xs">
              {lang === 'ua' ? 'Контракт інтерфейсу' : 'Interface contract'}
            </Badge>
          </div>
          <div className="divide-y divide-border">
            {INTERFACE_METHODS.map((m) => (
              <div key={m.name} className="px-4 py-3">
                <div className="flex items-start gap-2 mb-0.5">
                  <span className="text-xs font-mono text-emerald-400 shrink-0">{m.name}</span>
                  <span className="text-xs font-mono text-muted-foreground/60">{m.signature}</span>
                </div>
                <p className="text-xs text-muted-foreground">{t(m.note)}</p>
              </div>
            ))}
          </div>
        </div>
      </DocSection>

      {/* ── Section 2: Checklist ──────────────────────────────────────────── */}
      <div className="mt-6">
      <DocSection num="2" title={lang === 'ua' ? 'Чеклист інтеграції' : 'Integration Checklist'}>
        <div className="flex flex-col gap-5">
          {CHECKLIST.map((group) => (
            <div key={group.id} className="border border-border rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30">
                <div className={cn('flex size-7 shrink-0 items-center justify-center rounded-xl', group.accent)}>
                  <group.icon className="size-3.5" />
                </div>
                <p className="text-sm font-semibold text-foreground flex-1">{t(group.title)}</p>
                <span className={cn(
                  'text-xs font-mono px-1.5 py-0.5 rounded border',
                  group.who === 'BE'   && 'bg-sky-500/10 text-sky-400 border-sky-500/20',
                  group.who === 'FE'   && 'bg-violet-500/10 text-violet-400 border-violet-500/20',
                  group.who === 'Both' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                  group.who === 'PM'   && 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                )}>
                  {group.who}
                </span>
              </div>

              <div className="p-5">
                <ul className="flex flex-col gap-2.5">
                  {group.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle2 className="size-3.5 shrink-0 mt-0.5 text-success" />
                      <span>{t(item)}</span>
                    </li>
                  ))}
                </ul>

                {group.note && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl bg-muted px-3 py-2.5">
                    <Info className="size-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground leading-relaxed">{t(group.note)}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </DocSection>
      </div>

    </DocLayout>
  )
}
