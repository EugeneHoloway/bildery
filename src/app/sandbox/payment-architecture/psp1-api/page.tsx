'use client'

import { useState } from 'react'
import {
  Globe, Wallet, ArrowRight, User, Monitor, CheckCircle2,
  Info, AlertTriangle, ExternalLink, Layers, Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DocLayout  } from '@/components/doc/DocLayout'
import { DocSection } from '@/components/doc/DocSection'
import { DocTable, DocTableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/doc/DocTable'
import { Badge } from '@/components/ui/badge'

// ─── Lang ─────────────────────────────────────────────────────────────────────

type Lang = 'en' | 'ua'

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

// ─── Types ────────────────────────────────────────────────────────────────────

interface I18n { en: string; ua: string }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-border bg-card shadow-card rounded-2xl px-4 py-3 flex items-start gap-3 mb-6">
      <Info className="size-4 shrink-0 mt-0.5 text-muted-foreground" />
      <div className="text-sm text-foreground leading-relaxed">{children}</div>
    </div>
  )
}

function NoteCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-warning/30 bg-warning-bg rounded-2xl px-4 py-3 flex items-start gap-3">
      <AlertTriangle className="size-4 shrink-0 mt-0.5 text-warning" />
      <div className="text-sm text-foreground leading-relaxed">{children}</div>
    </div>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────

// Section 2 -- Currencies
const CURRENCIES: {
  symbol: string
  name: string
  network: I18n
  minDep: string
  minWithdraw: string
  webhookCount: I18n
  noteKey?: 'tag' | 'utxo' | 'evm'
}[] = [
  { symbol: 'BTC',       name: 'Bitcoin',         network: { en: 'Bitcoin',        ua: 'Bitcoin'        }, minDep: '0.0001',  minWithdraw: '0.001',   webhookCount: { en: '2 (at 1 and 2 confirmations)', ua: '2 (при 1 та 2 підтвердженнях)' }, noteKey: 'utxo' },
  { symbol: 'ETH',       name: 'Ethereum',         network: { en: 'EVM (Ethereum)', ua: 'EVM (Ethereum)' }, minDep: '0.005',   minWithdraw: '0.01',    webhookCount: { en: '1 (instant)',      ua: '1 (миттєво)'    } },
  { symbol: 'USDT',      name: 'Tether',           network: { en: 'TRC20 (Tron)',   ua: 'TRC20 (Tron)'   }, minDep: '1',       minWithdraw: '5',       webhookCount: { en: '1 (instant)',      ua: '1 (миттєво)'    } },
  { symbol: 'USDT',      name: 'Tether',           network: { en: 'ERC20 (Ethereum)', ua: 'ERC20 (Ethereum)' }, minDep: '10', minWithdraw: '20',      webhookCount: { en: '1 (instant)',      ua: '1 (миттєво)'    } },
  { symbol: 'USDC',      name: 'USD Coin',         network: { en: 'ERC20 / TRC20',  ua: 'ERC20 / TRC20'  }, minDep: '10',      minWithdraw: '20',      webhookCount: { en: '1 (instant)',      ua: '1 (миттєво)'    } },
  { symbol: 'LTC',       name: 'Litecoin',         network: { en: 'Litecoin',       ua: 'Litecoin'       }, minDep: '0.01',    minWithdraw: '0.05',    webhookCount: { en: '2 (at 1 and 2 confirmations)', ua: '2 (при 1 та 2 підтвердженнях)' }, noteKey: 'utxo' },
  { symbol: 'DOGE',      name: 'Dogecoin',         network: { en: 'Dogecoin',       ua: 'Dogecoin'       }, minDep: '10',      minWithdraw: '20',      webhookCount: { en: '2 (at 1 and 2 confirmations)', ua: '2 (при 1 та 2 підтвердженнях)' }, noteKey: 'utxo' },
  { symbol: 'DASH',      name: 'Dash',             network: { en: 'Dash',           ua: 'Dash'           }, minDep: '0.01',    minWithdraw: '0.05',    webhookCount: { en: '2 (at 1 and 2 confirmations)', ua: '2 (при 1 та 2 підтвердженнях)' }, noteKey: 'utxo' },
  { symbol: 'BCH',       name: 'Bitcoin Cash',     network: { en: 'Bitcoin Cash',   ua: 'Bitcoin Cash'   }, minDep: '0.001',   minWithdraw: '0.005',   webhookCount: { en: '2 (at 1 and 2 confirmations)', ua: '2 (при 1 та 2 підтвердженнях)' }, noteKey: 'utxo' },
  { symbol: 'XRP',       name: 'Ripple',           network: { en: 'Ripple',         ua: 'Ripple'         }, minDep: '1',       minWithdraw: '5',       webhookCount: { en: '1 (instant)',      ua: '1 (миттєво)'    }, noteKey: 'tag' },
  { symbol: 'TON',       name: 'Toncoin',          network: { en: 'TON',            ua: 'TON'            }, minDep: '1',       minWithdraw: '2',       webhookCount: { en: '1 (instant)',      ua: '1 (миттєво)'    }, noteKey: 'tag' },
  { symbol: 'TRX',       name: 'Tron',             network: { en: 'TRC20 (Tron)',   ua: 'TRC20 (Tron)'   }, minDep: '10',      minWithdraw: '20',      webhookCount: { en: '1 (instant)',      ua: '1 (миттєво)'    } },
  { symbol: 'BNB',       name: 'BNB',              network: { en: 'BSC (BEP-20)',   ua: 'BSC (BEP-20)'   }, minDep: '0.01',    minWithdraw: '0.02',    webhookCount: { en: '1 (instant)',      ua: '1 (миттєво)'    } },
]

// Section 3 -- Modes user flows
interface FlowStep {
  actor: 'user' | 'system' | 'psp'
  text: I18n
}

const H2H_FLOW: FlowStep[] = [
  { actor: 'user',   text: { en: 'Player opens the deposit page and selects a crypto method (e.g. USDT TRC20)', ua: 'Гравець відкриває сторінку депозиту та обирає крипто-метод (наприклад, USDT TRC20)' } },
  { actor: 'system', text: { en: 'Backend calls PassimPay /v2/address and gets a unique deposit address (+ destinationTag if XRP/TON)', ua: 'Бекенд викликає PassimPay /v2/address та отримує унікальну адресу депозиту (+ destinationTag якщо XRP/TON)' } },
  { actor: 'user',   text: { en: 'Player sees the address (and QR code) directly on YOUR site -- no redirect to PassimPay', ua: 'Гравець бачить адресу (та QR-код) безпосередньо на ВАШОМУ сайті -- без редиректу на PassimPay' } },
  { actor: 'user',   text: { en: 'Player copies the address and sends crypto from their personal wallet (any amount)', ua: 'Гравець копіює адресу та надсилає крипту зі свого особистого гаманця (будь-яку суму)' } },
  { actor: 'psp',    text: { en: 'PassimPay detects the transaction on-chain and sends a webhook to your server', ua: 'PassimPay виявляє транзакцію в блокчейні та надсилає webhook на ваш сервер' } },
  { actor: 'system', text: { en: 'Backend updates transaction status -- player sees "Processing" in real time (via polling or WebSocket)', ua: 'Бекенд оновлює статус транзакції -- гравець бачить "В обробці" в реальному часі (через polling або WebSocket)' } },
  { actor: 'system', text: { en: 'On final confirmation, balance is credited and player sees "Deposit confirmed"', ua: 'При фінальному підтвердженні баланс зараховується і гравець бачить "Депозит підтверджено"' } },
]

const INVOICE_FLOW: FlowStep[] = [
  { actor: 'user',   text: { en: 'Player opens the deposit page, selects a crypto method and enters the amount', ua: 'Гравець відкриває сторінку депозиту, обирає крипто-метод та вводить суму' } },
  { actor: 'system', text: { en: 'Backend calls PassimPay /v2/createorder with the fixed amount and receives a payment URL', ua: 'Бекенд викликає PassimPay /v2/createorder з фіксованою сумою та отримує URL для оплати' } },
  { actor: 'system', text: { en: 'Player is automatically redirected to the PassimPay-hosted payment page', ua: 'Гравець автоматично перенаправляється на платіжну сторінку PassimPay' } },
  { actor: 'user',   text: { en: 'On the PassimPay page: player sees which currencies are accepted, selects one (or splits across multiple), and sees a countdown timer', ua: 'На сторінці PassimPay: гравець бачить які валюти приймаються, обирає одну (або розбиває на декілька), бачить таймер зворотного відліку' } },
  { actor: 'user',   text: { en: 'Player sends the exact amount from their wallet', ua: 'Гравець надсилає точну суму зі свого гаманця' } },
  { actor: 'psp',    text: { en: 'PassimPay processes the payment and sends a webhook to your server', ua: 'PassimPay обробляє платіж та надсилає webhook на ваш сервер' } },
  { actor: 'system', text: { en: 'If returnUrl was set: player is redirected back to your site automatically', ua: 'Якщо returnUrl було встановлено: гравець автоматично повертається на ваш сайт' } },
  { actor: 'system', text: { en: 'Backend credits the balance and player sees "Deposit confirmed"', ua: 'Бекенд зараховує баланс і гравець бачить "Депозит підтверджено"' } },
]

// Section 4 -- Onboarding steps
const ONBOARDING: { step: number; title: I18n; desc: I18n }[] = [
  {
    step: 1,
    title: { en: 'Create account', ua: 'Створити акаунт' },
    desc: { en: 'Register at account.passimpay.io. Confirm email.', ua: 'Зареєструватись на account.passimpay.io. Підтвердити email.' },
  },
  {
    step: 2,
    title: { en: 'Create a platform', ua: 'Створити платформу' },
    desc: { en: 'In the dashboard: create a new platform. Save the Platform ID (integer) and API Secret Key -- they are shown only once.', ua: 'У дашборді: створити нову платформу. Зберегти Platform ID (ціле число) та API Secret Key -- вони показуються лише один раз.' },
  },
  {
    step: 3,
    title: { en: 'Whitelist server IP', ua: 'Додати IP сервера до whitelist' },
    desc: { en: 'In platform settings: add the outbound IP of your backend server. Required for /v2/withdraw to work. Without this, all withdrawal requests are blocked.', ua: 'У налаштуваннях платформи: додати вихідний IP вашого бекенд-сервера. Необхідно для роботи /v2/withdraw. Без цього всі запити на виведення блокуються.' },
  },
  {
    step: 4,
    title: { en: 'Set webhook URL', ua: 'Встановити webhook URL' },
    desc: { en: 'In platform settings: enter the URL where PassimPay will send deposit and withdrawal events (e.g. https://yourapi.com/webhooks/passimpay). Must be publicly accessible.', ua: 'У налаштуваннях платформи: ввести URL куди PassimPay надсилатиме події депозиту та виведення (наприклад, https://yourapi.com/webhooks/passimpay). Має бути публічно доступним.' },
  },
  {
    step: 5,
    title: { en: 'Enable withdraw webhook', ua: 'Увімкнути withdrawal webhook' },
    desc: { en: 'In platform settings: toggle "Enable withdraw webhook" ON. Without this, you will not receive callbacks for withdrawal status changes.', ua: 'У налаштуваннях платформи: увімкнути "Enable withdraw webhook". Без цього ви не отримуватимете callbacks при зміні статусу виведення.' },
  },
  {
    step: 6,
    title: { en: 'Configure currencies', ua: 'Налаштувати валюти' },
    desc: { en: 'In platform settings: enable the cryptocurrencies you want to accept. Disabled currencies will not appear in /v2/currencies responses for your platformId.', ua: 'У налаштуваннях платформи: увімкнути криптовалюти які ви хочете приймати. Вимкнені валюти не з\'являться у відповідях /v2/currencies для вашого platformId.' },
  },
]

// Section 5 -- Limitations
const LIMITATIONS: { title: I18n; desc: I18n; phase?: I18n }[] = [
  {
    title: { en: 'No card payments in Phase 1', ua: 'Немає карткових платежів у фазі 1' },
    desc:  { en: 'PassimPay supports fiat / card payments only through the Invoice method with on-ramp enabled. This requires separate activation by PassimPay support. Not in scope for Phase 1.', ua: 'PassimPay підтримує фіат / карткові платежі лише через Invoice метод з увімкненим on-ramp. Це вимагає окремої активації підтримкою PassimPay. Не входить до обсягу фази 1.' },
    phase: { en: 'Planned: Phase 2--3', ua: 'Заплановано: Фаза 2--3' },
  },
  {
    title: { en: 'Payment splitting (Invoice only)', ua: 'Розбивка оплати (тільки Invoice)' },
    desc:  { en: 'Paying a single invoice with multiple cryptocurrencies (e.g. 50% BTC + 50% USDT) is supported only in the Invoice method. Not available in H2H.', ua: 'Оплата одного інвойсу кількома криптовалютами (наприклад, 50% BTC + 50% USDT) підтримується лише в Invoice методі. Недоступно в H2H.' },
    phase: { en: 'Available from Phase 1 (Invoice only)', ua: 'Доступно з фази 1 (тільки Invoice)' },
  },
  {
    title: { en: 'On-ramp (fiat deposits) -- not in Phase 1', ua: 'On-ramp (фіатні депозити) -- не у фазі 1' },
    desc:  { en: 'Accepting deposits via bank card (Visa/Mastercard) or bank transfer requires the Invoice method with on-ramp feature enabled. Requires contacting PassimPay support to activate. Implementation deferred.', ua: 'Прийом депозитів через банківську карту (Visa/Mastercard) або банківський переказ вимагає Invoice методу з увімкненою функцією on-ramp. Потребує звернення до підтримки PassimPay для активації. Реалізація відкладена.' },
    phase: { en: 'Planned: Phase 2--3', ua: 'Заплановано: Фаза 2--3' },
  },
  {
    title: { en: 'INR bank transfers (India only)', ua: 'Банківські перекази INR (тільки Індія)' },
    desc:  { en: 'PassimPay supports Indian Rupee bank withdrawals via /v2/inrout (IMPS/NEFT). Geo-specific feature, not relevant until India GEO is in scope.', ua: 'PassimPay підтримує банківські виведення у індійських рупіях через /v2/inrout (IMPS/NEFT). Гео-специфічна функція, не актуальна до тих пір поки гео Індія не в обсязі.' },
    phase: { en: 'Planned: Phase 3+ (India GEO)', ua: 'Заплановано: Фаза 3+ (гео Індія)' },
  },
  {
    title: { en: 'Direct deposits (USDT TRC20 static address)', ua: 'Прямі депозити (статична адреса USDT TRC20)' },
    desc:  { en: 'PassimPay supports a "direct deposit" mode where all players share one static USDT TRC20 address and are identified by unique amounts. Complex to implement correctly (AML, amount matching). Not in scope for Phase 1.', ua: 'PassimPay підтримує режим "прямих депозитів" де всі гравці використовують одну статичну адресу USDT TRC20 та ідентифікуються за унікальними сумами. Складно реалізувати коректно (AML, зіставлення сум). Не входить до обсягу фази 1.' },
    phase: { en: 'Not planned', ua: 'Не заплановано' },
  },
]

// ─── Components ───────────────────────────────────────────────────────────────

const actorStyle = {
  user:   { label: { en: 'Player', ua: 'Гравець' }, color: 'bg-violet-500/10 text-violet-500 border-violet-500/30', Icon: User    },
  system: { label: { en: 'System', ua: 'Система' }, color: 'bg-sky-500/10 text-sky-500 border-sky-500/30',         Icon: Monitor },
  psp:    { label: { en: 'PassimPay', ua: 'PassimPay' }, color: 'bg-amber-500/10 text-amber-500 border-amber-500/30', Icon: Globe },
}

function FlowStep({ step, index, lang }: { step: FlowStep; index: number; lang: Lang }) {
  const s = actorStyle[step.actor]
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center shrink-0">
        <div className="flex size-6 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground tabular-nums">
          {index + 1}
        </div>
        <div className="w-px flex-1 bg-border mt-1" />
      </div>
      <div className="pb-4 min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className={cn('pointer-events-none text-xs shrink-0', s.color)}>
            {s.label[lang]}
          </Badge>
        </div>
        <p className="text-sm text-foreground leading-relaxed">{step.text[lang]}</p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const [lang, setLang] = useState<Lang>('en')
  const ua = lang === 'ua'

  return (
    <DocLayout
      title="PSP #1 API -- PassimPay"
      breadcrumbLabel="Payment module"
      breadcrumbHref="/sandbox/payment-architecture"
      parentCrumb={{ label: 'Sandbox', href: '/sandbox' }}
      description={ua
        ? 'Огляд PassimPay як зовнішнього сервісу. Що це, що підтримує, як підключитись.'
        : 'Overview of PassimPay as an external service. What it is, what it supports, how to connect.'}
      tags={[
        { label: 'Phase 1',   type: 'tag'    },
        { label: 'External',  type: 'status' },
        { label: 'PassimPay', type: 'tag'    },
      ]}
      titleExtra={<LangSwitcher lang={lang} onChange={setLang} />}
      footnote="DEPO44 | PSP #1 -- PASSIMPAY | SERVICE OVERVIEW"
    >

      {/* ── Intro ─────────────────────────────────────────────────────────── */}
      <InfoCard>
        {ua
          ? <>PassimPay -- крипто-платіжний процесор. Надає API для прийому депозитів та відправки виведень у криптовалюті. Це зовнішній сервіс -- ваш код взаємодіє з ним через <strong>PSP #1 Adapter</strong>. Документація: <a href="https://passimpay.gitbook.io/passimpay-api" target="_blank" rel="noopener noreferrer" className="underline text-brand inline-flex items-center gap-1">passimpay.gitbook.io <ExternalLink className="size-3" /></a> · Акаунт: <a href="https://account.passimpay.io" target="_blank" rel="noopener noreferrer" className="underline text-brand inline-flex items-center gap-1">account.passimpay.io <ExternalLink className="size-3" /></a></>
          : <>PassimPay is a crypto payment processor. It provides an API for accepting crypto deposits and sending withdrawals. It is an external service -- your code interacts with it through the <strong>PSP #1 Adapter</strong>. Docs: <a href="https://passimpay.gitbook.io/passimpay-api" target="_blank" rel="noopener noreferrer" className="underline text-brand inline-flex items-center gap-1">passimpay.gitbook.io <ExternalLink className="size-3" /></a> · Account: <a href="https://account.passimpay.io" target="_blank" rel="noopener noreferrer" className="underline text-brand inline-flex items-center gap-1">account.passimpay.io <ExternalLink className="size-3" /></a></>
        }
      </InfoCard>

      {/* ── Section 1: Onboarding ─────────────────────────────────────────── */}
      <DocSection num="1" title={ua ? 'Підключення -- що зробити перед розробкою' : 'Setup -- what to do before development'}>
        <div className="flex flex-col gap-0">
          {ONBOARDING.map((item, i) => (
            <div key={item.step} className="flex items-start gap-3">
              <div className="flex flex-col items-center shrink-0">
                <div className="flex size-7 items-center justify-center rounded-xl bg-muted text-xs font-bold text-muted-foreground tabular-nums">
                  {item.step}
                </div>
                {i < ONBOARDING.length - 1 && <div className="w-px bg-border flex-1 mt-1" />}
              </div>
              <div className={cn('flex-1 min-w-0', i < ONBOARDING.length - 1 && 'pb-5')}>
                <p className="text-sm font-semibold text-foreground leading-snug mb-0.5">{item.title[lang]}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc[lang]}</p>
              </div>
            </div>
          ))}
        </div>
      </DocSection>

      {/* ── Section 2: Supported currencies ──────────────────────────────── */}
      <div className="mt-8">
        <DocSection num="2" title={ua ? 'Підтримувані мережі та валюти (Phase 1)' : 'Supported Networks & Currencies (Phase 1)'}>
          <InfoCard>
            {ua
              ? <>Точні мінімуми та ID валют отримувати через <code className="text-xs bg-muted rounded px-1.5 py-0.5">POST /v2/currencies</code> з вашим platformId -- вони можуть відрізнятись для різних платформ. Список нижче наведений для загального розуміння. Повна таблиця валют: <a href="https://docs.google.com/spreadsheets/d/11hk_hrQF7kEJNkboY_9b1q23eqFKND2pBpBu2SqAPqo" target="_blank" rel="noopener noreferrer" className="underline text-brand inline-flex items-center gap-1">Google Sheets <ExternalLink className="size-3" /></a></>
              : <>Get exact minimums and currency IDs from <code className="text-xs bg-muted rounded px-1.5 py-0.5">POST /v2/currencies</code> with your platformId -- they may differ per platform. The list below is for general understanding. Full currency table: <a href="https://docs.google.com/spreadsheets/d/11hk_hrQF7kEJNkboY_9b1q23eqFKND2pBpBu2SqAPqo" target="_blank" rel="noopener noreferrer" className="underline text-brand inline-flex items-center gap-1">Google Sheets <ExternalLink className="size-3" /></a></>
            }
          </InfoCard>
          <DocTable>
            <DocTableHeader>
              <TableRow>
                <TableHead>{ua ? 'Символ' : 'Symbol'}</TableHead>
                <TableHead>{ua ? 'Назва' : 'Name'}</TableHead>
                <TableHead>{ua ? 'Мережа' : 'Network'}</TableHead>
                <TableHead>{ua ? 'Мін. депозит' : 'Min deposit'}</TableHead>
                <TableHead>{ua ? 'Мін. виведення' : 'Min withdraw'}</TableHead>
                <TableHead>{ua ? 'Webhooks' : 'Webhooks'}</TableHead>
                <TableHead>{ua ? 'Примітки' : 'Notes'}</TableHead>
              </TableRow>
            </DocTableHeader>
            <TableBody>
              {CURRENCIES.map((c, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <code className="text-xs font-mono font-bold text-foreground bg-muted rounded px-1.5 py-0.5">{c.symbol}</code>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.network[lang]}</TableCell>
                  <TableCell className="text-sm text-foreground tabular-nums">{c.minDep}</TableCell>
                  <TableCell className="text-sm text-foreground tabular-nums">{c.minWithdraw}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.webhookCount[lang]}</TableCell>
                  <TableCell>
                    {c.noteKey === 'tag'  && <Badge variant="outline" className="text-xs bg-destructive-bg text-destructive border-destructive/30 pointer-events-none">{ua ? 'Потрібен тег' : 'Tag required'}</Badge>}
                    {c.noteKey === 'utxo' && <Badge variant="outline" className="text-xs bg-warning-bg text-warning border-warning/30 pointer-events-none">UTXO</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DocTable>
        </DocSection>
      </div>

      {/* ── Section 3: Integration modes ──────────────────────────────────── */}
      <div className="mt-8">
        <DocSection num="3" title={ua ? 'Два режими інтеграції' : 'Two Integration Modes'}>

          <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2 mb-6">

            {/* H2H */}
            <div className="border border-border rounded-2xl overflow-hidden">
              <div className="px-4 py-3 bg-muted border-b border-border flex items-center gap-2">
                <Wallet className="size-4 text-muted-foreground" />
                <p className="text-sm font-bold text-foreground">H2H (Host-to-Host)</p>
                <Badge variant="outline" className="ml-auto text-xs bg-success-bg text-success border-success/30 pointer-events-none">
                  {ua ? 'Фаза 1' : 'Phase 1'}
                </Badge>
              </div>
              <div className="px-4 py-3 bg-card">
                <p className="text-sm text-muted-foreground leading-relaxed mb-1">
                  {ua
                    ? 'Гравець залишається на вашому сайті. Ви показуєте крипто-адресу у власному UI.'
                    : 'Player stays on your site. You show the crypto address in your own UI.'}
                </p>
                <ul className="flex flex-col gap-1 text-xs text-muted-foreground list-none">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="size-3 shrink-0 text-success" />{ua ? 'Повний контроль над UI/UX' : 'Full control over UI/UX'}</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="size-3 shrink-0 text-success" />{ua ? 'Гравець платить будь-яку суму' : 'Player pays any amount'}</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="size-3 shrink-0 text-success" />{ua ? 'Без редиректу' : 'No redirect'}</li>
                </ul>
              </div>
            </div>

            {/* Invoice */}
            <div className="border border-border rounded-2xl overflow-hidden">
              <div className="px-4 py-3 bg-muted border-b border-border flex items-center gap-2">
                <Globe className="size-4 text-muted-foreground" />
                <p className="text-sm font-bold text-foreground">Invoice (Redirect)</p>
                <Badge variant="outline" className="ml-auto text-xs bg-success-bg text-success border-success/30 pointer-events-none">
                  {ua ? 'Фаза 1' : 'Phase 1'}
                </Badge>
              </div>
              <div className="px-4 py-3 bg-card">
                <p className="text-sm text-muted-foreground leading-relaxed mb-1">
                  {ua
                    ? 'Гравець перенаправляється на сторінку PassimPay. Фіксована сума.'
                    : 'Player is redirected to the PassimPay-hosted page. Fixed amount.'}
                </p>
                <ul className="flex flex-col gap-1 text-xs text-muted-foreground list-none">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="size-3 shrink-0 text-success" />{ua ? 'Менше коду на вашому боці' : 'Less code on your side'}</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="size-3 shrink-0 text-success" />{ua ? 'Підтримує split-оплату' : 'Supports payment splitting'}</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="size-3 shrink-0 text-success" />{ua ? 'On-ramp (фіат) -- майбутня фаза' : 'On-ramp (fiat) -- future phase'}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* H2H user flow */}
          <div className="border border-border rounded-2xl overflow-hidden mb-4">
            <div className="px-4 py-3 border-b border-border bg-muted flex items-center gap-2">
              <Layers className="size-4 text-muted-foreground" />
              <p className="text-sm font-bold text-foreground">{ua ? 'H2H -- флоу гравця' : 'H2H -- Player flow'}</p>
            </div>
            <div className="px-4 pt-4 pb-1 bg-card">
              {H2H_FLOW.map((step, i) => (
                <FlowStep key={i} step={step} index={i} lang={lang} />
              ))}
            </div>
          </div>

          {/* Invoice user flow */}
          <div className="border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted flex items-center gap-2">
              <Layers className="size-4 text-muted-foreground" />
              <p className="text-sm font-bold text-foreground">{ua ? 'Invoice -- флоу гравця' : 'Invoice -- Player flow'}</p>
            </div>
            <div className="px-4 pt-4 pb-1 bg-card">
              {INVOICE_FLOW.map((step, i) => (
                <FlowStep key={i} step={step} index={i} lang={lang} />
              ))}
            </div>
          </div>

        </DocSection>
      </div>

      {/* ── Section 4: Limitations & future phases ────────────────────────── */}
      <div className="mt-8">
        <DocSection num="4" title={ua ? 'Обмеження та майбутні фази' : 'Limitations & Future Phases'}>
          <InfoCard>
            {ua
              ? 'Нижче перелічені можливості PassimPay, які НЕ входять до обсягу фази 1. Вони залишені тут для розуміння повного потенціалу сервісу та послідовності реалізації.'
              : 'Listed below are PassimPay capabilities that are NOT in scope for Phase 1. They are included here to understand the full potential of the service and the order of implementation.'}
          </InfoCard>
          <div className="flex flex-col gap-3">
            {LIMITATIONS.map((l, i) => (
              <div key={i} className="border border-border bg-card rounded-2xl p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                      <Clock className="size-3.5" />
                    </div>
                    <p className="text-sm font-semibold text-foreground leading-snug">{l.title[lang]}</p>
                  </div>
                  {l.phase && (
                    <Badge variant="outline" className="text-xs bg-muted text-muted-foreground border-border pointer-events-none shrink-0">
                      {l.phase[lang]}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pl-10">{l.desc[lang]}</p>
              </div>
            ))}
          </div>
        </DocSection>
      </div>

    </DocLayout>
  )
}
