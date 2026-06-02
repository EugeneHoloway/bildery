'use client'

import { useState } from 'react'
import {
  RefreshCw, Wifi, WifiOff, Clock, Zap, ArrowRight, Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DocLayout }  from '@/components/doc/DocLayout'
import { DocSection } from '@/components/doc/DocSection'

// ─── Lang ─────────────────────────────────────────────────────────────────────

type Lang = 'en' | 'ua'

function LangSwitcher({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted p-0.5">
      {(['en', 'ua'] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={[
            'px-2.5 py-1 rounded-md text-xs font-semibold transition-colors',
            lang === l
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          ].join(' ')}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────

interface I18n { en: string; ua: string }

interface Method {
  id: string
  title: I18n
  desc: I18n
  pros: I18n[]
  cons: I18n[]
  recommended: boolean
}

const METHODS: Method[] = [
  {
    id: 'polling',
    title: { en: 'Polling', ua: 'Polling (опитування)' },
    desc: {
      en: 'Frontend sends GET /transaction/:id/status every N seconds and updates the UI when the status changes.',
      ua: 'Фронтенд кожні N секунд робить запит GET /transaction/:id/status і оновлює UI коли статус змінився.',
    },
    pros: [
      { en: 'Simple to implement', ua: 'Просто реалізувати' },
      { en: 'Works over plain HTTP', ua: 'Працює по звичайному HTTP' },
      { en: 'Reliable fallback for any environment', ua: 'Надійний fallback для будь-якого середовища' },
    ],
    cons: [
      { en: 'Extra load on backend (N req/sec × active sessions)', ua: 'Додаткове навантаження на бекенд (N req/сек × активні сесії)' },
      { en: 'Delay up to one poll interval', ua: 'Затримка до одного poll-інтервалу' },
    ],
    recommended: false,
  },
  {
    id: 'websocket',
    title: { en: 'WebSocket / SSE', ua: 'WebSocket / SSE' },
    desc: {
      en: 'Backend pushes an event to the frontend as soon as a webhook from PassimPay arrives. The UI updates instantly.',
      ua: 'Бекенд сам пушить подію на фронтенд щойно надходить webhook від PassimPay. UI оновлюється миттєво.',
    },
    pros: [
      { en: 'Instant update — no delay', ua: 'Миттєве оновлення — без затримки' },
      { en: 'No unnecessary requests', ua: 'Немає зайвих запитів' },
      { en: 'Better UX for the player', ua: 'Кращий UX для гравця' },
    ],
    cons: [
      { en: 'More complex to implement and maintain', ua: 'Складніше реалізувати і підтримувати' },
      { en: 'Requires persistent connection (WS) or streaming (SSE)', ua: 'Потребує постійного з\'єднання (WS) або стрімінгу (SSE)' },
    ],
    recommended: false,
  },
  {
    id: 'combo',
    title: { en: 'Combo (recommended)', ua: 'Комбо (рекомендовано)' },
    desc: {
      en: 'WebSocket or SSE as the primary channel for instant updates, plus polling every 5–10 seconds as a fallback in case the push event was lost.',
      ua: 'WebSocket або SSE як основний канал для миттєвого оновлення + polling кожні 5–10 секунд як fallback на випадок якщо push-подія загубилась.',
    },
    pros: [
      { en: 'Instant when push works', ua: 'Миттєво коли push працює' },
      { en: 'Reliable even if connection drops', ua: 'Надійно навіть при розриві з\'єднання' },
      { en: 'Industry standard for payment UX', ua: 'Галузевий стандарт для платіжного UX' },
    ],
    cons: [
      { en: 'Most effort to implement', ua: 'Найбільше зусиль для реалізації' },
    ],
    recommended: true,
  },
]

const FLOW_STEPS: { label: I18n; sub?: I18n; accent?: boolean }[] = [
  {
    label: { en: 'Player submits crypto address', ua: 'Гравець відправляє крипту' },
  },
  {
    label: { en: 'Frontend shows "Awaiting payment…"', ua: 'Фронтенд показує "Очікуємо оплату…"' },
    sub: { en: 'Start polling OR open WebSocket', ua: 'Запускаємо polling АБО відкриваємо WebSocket' },
  },
  {
    label: { en: 'PassimPay sends webhook to backend', ua: 'PassimPay надсилає webhook на бекенд' },
    sub: { en: 'confirmations=1 → PROCESSING; confirmations=2 → COMPLETED', ua: 'confirmations=1 → PROCESSING; confirmations=2 → COMPLETED' },
  },
  {
    label: { en: 'Backend updates transaction status in DB', ua: 'Бекенд оновлює статус транзакції в БД' },
  },
  {
    label: { en: 'Frontend detects status change', ua: 'Фронтенд дізнається про зміну статусу' },
    sub: { en: 'via poll response OR pushed event', ua: 'через відповідь poll АБО push-подію' },
  },
  {
    label: { en: 'UI updates: "Deposit confirmed"', ua: 'UI оновлюється: "Депозит підтверджено"' },
    accent: true,
  },
]

const NOTES: { Icon: typeof RefreshCw; text: I18n }[] = [
  {
    Icon: Clock,
    text: {
      en: 'Recommended poll interval: 5–10 seconds. Do not poll faster than 3s — it adds unnecessary load.',
      ua: 'Рекомендований інтервал polling: 5–10 секунд. Не поллити частіше ніж 3 с — це додає зайве навантаження.',
    },
  },
  {
    Icon: WifiOff,
    text: {
      en: 'Stop polling after terminal statuses: COMPLETED, FAILED, TIMED_OUT, CANCELLED.',
      ua: 'Зупиняти polling після термінальних статусів: COMPLETED, FAILED, TIMED_OUT, CANCELLED.',
    },
  },
  {
    Icon: RefreshCw,
    text: {
      en: 'Also stop polling if the player leaves the page — avoid orphaned requests.',
      ua: 'Також зупиняти polling якщо гравець покинув сторінку — уникати orphaned-запитів.',
    },
  },
  {
    Icon: Zap,
    text: {
      en: 'WebSocket: backend emits event on webhook receipt. Frontend subscribes by transaction ID.',
      ua: 'WebSocket: бекенд емітить подію при отриманні webhook. Фронтенд підписується по transaction ID.',
    },
  },
]

// ─── Components ───────────────────────────────────────────────────────────────

function MethodCard({ method, lang }: { method: Method; lang: Lang }) {
  return (
    <div className={cn(
      'border rounded-2xl p-4 flex flex-col gap-3',
      method.recommended
        ? 'border-brand bg-brand-bg'
        : 'border-border bg-card shadow-card',
    )}>
      <div className="flex items-center justify-between gap-2">
        <p className={cn(
          'text-sm font-bold leading-snug',
          method.recommended ? 'text-brand' : 'text-foreground',
        )}>
          {method.title[lang]}
        </p>
        {method.id === 'polling'   && <RefreshCw className="size-4 text-muted-foreground shrink-0" />}
        {method.id === 'websocket' && <Wifi       className="size-4 text-muted-foreground shrink-0" />}
        {method.id === 'combo'     && <Zap        className="size-4 text-brand shrink-0" />}
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">{method.desc[lang]}</p>

      <div className="flex flex-col gap-1.5">
        {method.pros.map((pro, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-success text-xs mt-0.5 shrink-0">+</span>
            <span className="text-xs text-muted-foreground leading-snug">{pro[lang]}</span>
          </div>
        ))}
        {method.cons.map((con, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-destructive text-xs mt-0.5 shrink-0">−</span>
            <span className="text-xs text-muted-foreground leading-snug">{con[lang]}</span>
          </div>
        ))}
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
      title="Status Polling"
      breadcrumbLabel="Payment Infrastructure"
      breadcrumbHref="/sandbox/payment-infra"
      parentCrumb={{ label: 'Sandbox', href: '/sandbox' }}
      description={ua
        ? 'Як фронтенд дізнається про зміну статусу транзакції'
        : 'How the frontend learns about transaction status changes'}
      tags={[
        { label: 'Phase 2',        type: 'tag'    },
        { label: 'Frontend',       type: 'status' },
      ]}
      titleExtra={<LangSwitcher lang={lang} onChange={setLang} />}
      footnote="DEPO44 | PAYMENT MODULE | PHASE 2 | FRONTEND"
    >

      {/* ── Section 1: What is it ─────────────────────────────────────────── */}
      <DocSection num="1" title={ua ? 'Суть проблеми' : 'The Problem'}>
        <div className="border border-border bg-card shadow-card rounded-2xl px-4 py-3 mb-6">
          <p className="text-sm text-foreground leading-relaxed">
            {ua ? (
              <>
                Після того як гравець відправив крипту, фронтенд <strong>не знає</strong> коли прийде підтвердження.
                Блокчейн-транзакції займають від секунд до хвилин. Фронтенд має якось дізнатись
                коли бекенд отримав webhook від PassimPay і статус транзакції змінився.
              </>
            ) : (
              <>
                After the player sends crypto, the frontend <strong>does not know</strong> when confirmation will arrive.
                Blockchain transactions take anywhere from seconds to minutes. The frontend needs some way to learn
                when the backend received a webhook from PassimPay and the transaction status changed.
              </>
            )}
          </p>
        </div>
      </DocSection>

      {/* ── Section 2: Methods ────────────────────────────────────────────── */}
      <DocSection num="2" title={ua ? 'Способи отримання статусу' : 'Ways to Receive Status'}>
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-3 mb-6">
          {METHODS.map(m => (
            <MethodCard key={m.id} method={m} lang={lang} />
          ))}
        </div>
      </DocSection>

      {/* ── Section 3: Flow ───────────────────────────────────────────────── */}
      <DocSection num="3" title={ua ? 'Загальний флоу' : 'General Flow'}>
        <div className="flex flex-col gap-0 mb-6">
          {FLOW_STEPS.map((step, i) => (
            <div key={i}>
              <div className={cn(
                'border rounded-2xl px-4 py-3',
                step.accent
                  ? 'border-success/30 bg-success-bg'
                  : 'border-border bg-card shadow-card',
              )}>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold tabular-nums text-muted-foreground shrink-0 w-5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <p className={cn(
                      'text-sm font-semibold leading-snug',
                      step.accent ? 'text-success' : 'text-foreground',
                    )}>
                      {step.label[lang]}
                    </p>
                    {step.sub && (
                      <p className="text-xs text-muted-foreground mt-0.5">{step.sub[lang]}</p>
                    )}
                  </div>
                </div>
              </div>
              {i < FLOW_STEPS.length - 1 && (
                <div className="flex items-center pl-7 py-1">
                  <ArrowRight className="size-3 text-muted-foreground/40 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
      </DocSection>

      {/* ── Section 4: Notes ──────────────────────────────────────────────── */}
      <DocSection num="4" title={ua ? 'Важливі деталі' : 'Implementation Notes'}>
        <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
          {NOTES.map(({ Icon, text }, i) => (
            <div key={i} className="flex items-start gap-3 border border-border bg-card shadow-card rounded-2xl px-4 py-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Icon className="size-3.5" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{text[lang]}</p>
            </div>
          ))}
        </div>
      </DocSection>

    </DocLayout>
  )
}
