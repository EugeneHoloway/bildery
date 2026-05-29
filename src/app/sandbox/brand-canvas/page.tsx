'use client'

import { useEffect, useRef, useState } from 'react'
import type { ElementType } from 'react'
import {
  ArrowRightLeft,
  Bitcoin,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  Crown,
  DollarSign,
  Eye,
  EyeOff,
  Gift,
  LayoutGrid,
  Lock,
  RefreshCw,
  RotateCcw,
  Shield,
  Wallet,
  Zap,
} from 'lucide-react'
import { DocLayout } from '@/components/doc/DocLayout'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

// ─── Auth modals ──────────────────────────────────────────────────────────────

function AuthPill({ label }: { label: string }) {
  return (
    <div className="flex justify-center">
      <span className="rounded-full border border-border px-4 py-1 text-xs font-bold uppercase tracking-widest text-foreground">
        {label}
      </span>
    </div>
  )
}

function AuthModals() {
  const [expiredOpen,  setExpiredOpen]  = useState(true)
  const [loginOpen,    setLoginOpen]    = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')

  const loginEnabled = email.length > 0 && password.length > 0
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  function handleExpiredOk() {
    setExpiredOpen(false)
    setLoginOpen(true)
  }

  function handleCreateAccount() {
    setLoginOpen(false)
    setRegisterOpen(true)
  }

  function handleAlreadyHaveAccount() {
    setRegisterOpen(false)
    setLoginOpen(true)
  }

  const socialBtn = "flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-xl bg-foreground px-4 text-sm font-semibold text-background transition-opacity hover:opacity-85"

  return (
    <>
      {/* ── Expired session ─────────────────────────────────────────────────── */}
      <Dialog open={expiredOpen} onOpenChange={setExpiredOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogTitle className="sr-only">Expired Session</DialogTitle>
          <DialogDescription className="sr-only">Your session has expired.</DialogDescription>

          <div className="flex flex-col gap-5">
            <AuthPill label="Session Expired" />

            <p className="text-sm text-muted-foreground leading-relaxed">
              Your session has expired. Please try logging in again. If it persists,
              please clear your browser cache or{' '}
              <span className="cursor-pointer font-medium text-brand underline underline-offset-2 hover:opacity-80 transition-opacity">
                contact support
              </span>
              .
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You will be redirected to the login page, where you can login again to continue.
            </p>
            <Button
              size="lg"
              className="w-full bg-success text-white hover:bg-success/90"
              onClick={handleExpiredOk}
            >
              Ok
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Login ───────────────────────────────────────────────────────────── */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogTitle className="sr-only">Log in</DialogTitle>
          <DialogDescription className="sr-only">Log in to your account.</DialogDescription>

          <div className="flex flex-col gap-4">
            <AuthPill label="Log in" />

            <div>
              <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Log in to your account to continue playing.
              </p>
            </div>

            {/* Social buttons */}
            <button type="button" className={socialBtn}>
              <img src="/logos/google-logo.svg" alt="Google" className="size-5 shrink-0" />
              Continue with Google
            </button>
            <button type="button" className={socialBtn}>
              <img src="/logos/Apple_logo_black.svg" alt="Apple" className={`h-5 w-auto shrink-0${isDark ? '' : ' invert'}`} />
              Continue with Apple
            </button>

            {/* Divider */}
            <div className="relative my-1 flex items-center">
              <div className="flex-1 border-t border-border" />
              <span className="mx-3 text-xs text-muted-foreground">or</span>
              <div className="flex-1 border-t border-border" />
            </div>

            {/* Email + password */}
            <div className="flex flex-col gap-2">
              <Input
                type="email"
                placeholder="Email"
                className="h-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="h-11 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Legal */}
            <p className="text-xs text-muted-foreground leading-relaxed">
              By continuing, you acknowledge and agree to our legal terms,{' '}
              <span className="font-semibold text-foreground">which we recommend reviewing</span>
            </p>

            {/* Log in CTA */}
            <Button
              size="lg"
              disabled={!loginEnabled}
              className={cn(
                'h-11 w-full',
                loginEnabled
                  ? 'bg-success text-white hover:bg-success/90'
                  : 'bg-success/20 text-success/50 disabled:opacity-100',
              )}
            >
              Log in
            </Button>

            {/* Forgot password */}
            <button
              type="button"
              className="flex h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-border text-sm font-normal text-foreground transition-colors hover:bg-muted"
            >
              Forgot password?
            </button>

            {/* Create account link */}
            <button
              type="button"
              onClick={handleCreateAccount}
              className="text-sm font-semibold text-brand hover:opacity-80 transition-opacity cursor-pointer"
            >
              No account? Create one
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Register ────────────────────────────────────────────────────────── */}
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogTitle className="sr-only">Create your account</DialogTitle>
          <DialogDescription className="sr-only">Create a new account.</DialogDescription>

          <div className="flex flex-col gap-4">
            <AuthPill label="Sign up" />

            <div>
              <h2 className="text-2xl font-bold text-foreground">Create your account</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Join thousands playing games. Sign up in seconds.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {/* Social buttons */}
              <button type="button" className={socialBtn}>
                <img src="/logos/google-logo.svg" alt="Google" className="size-5 shrink-0" />
                Continue with Google
              </button>
              <button type="button" className={socialBtn}>
                <img src="/logos/Apple_logo_black.svg" alt="Apple" className={`h-5 w-auto shrink-0${isDark ? '' : ' invert'}`} />
                Continue with Apple
              </button>

              {/* Sign up with email */}
              <button
                type="button"
                className="flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Sign up with Email
              </button>

              {/* Already have account */}
              <button
                type="button"
                onClick={handleAlreadyHaveAccount}
                className="text-sm font-semibold text-brand hover:opacity-80 transition-opacity cursor-pointer"
              >
                Already have an account? Log in
              </button>

              {/* Legal */}
              <p className="text-xs text-muted-foreground leading-relaxed">
                By continuing, you acknowledge and agree to our legal terms,{' '}
                <span className="font-semibold text-foreground">which we recommend reviewing</span>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ─── Topics nav ───────────────────────────────────────────────────────────────

const TOPICS = [
  'Trending',
  'Popular',
  'New',
  'Slots',
  'Live Casino',
  'Our Picks',
  'Crash Games',
  'Roulette',
  'Poker',
  'Jackpots',
  'Table Games',
]

const PROVIDERS: { name: string; logo: string | null; logoDark: string | null }[] = [
  { name: 'Depo44', logo: '/logos/depo44-logo.svg', logoDark: '/logos/depo44-logo-white.svg' },
  { name: 'BetUp', logo: '/logos/betup-logo-black.svg', logoDark: '/logos/betup-logo.svg' },
  ...Array.from({ length: 8 }, (_, i) => ({ name: `Provider #${i + 3}`, logo: null, logoDark: null })),
]

function ProvidersDialog() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <button
              className="flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Game providers"
            >
              <LayoutGrid className="size-4" />
            </button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">Game providers</TooltipContent>
      </Tooltip>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Providers</DialogTitle>
          <DialogDescription className="sr-only">Browse the full list of available game providers.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {PROVIDERS.map((provider) => (
            <div
              key={provider.name}
              className="flex h-16 items-center justify-center rounded-xl border border-border bg-muted text-xs text-muted-foreground cursor-pointer hover:bg-accent hover:border-border transition-colors"
            >
              {provider.logo ? (
                <img
                  src={isDark ? (provider.logoDark ?? provider.logo) : provider.logo}
                  alt={provider.name}
                  className="max-h-8 max-w-[80%] object-contain"
                />
              ) : (
                provider.name
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function TopicsNav() {
  const [active, setActive] = useState('Trending')

  return (
    <div className="border-b border-border mb-6">
      <div className="flex items-center overflow-x-auto scrollbar-none">
        <div className="shrink-0 pr-1">
          <ProvidersDialog />
        </div>
        {TOPICS.map((topic) => (
          <button
            key={topic}
            onClick={() => setActive(topic)}
            className={[
              'relative whitespace-nowrap px-3 py-3 text-sm transition-colors cursor-pointer',
              active === topic
                ? 'text-foreground font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground after:rounded-full'
                : 'text-muted-foreground font-medium hover:text-foreground',
            ].join(' ')}
          >
            {topic}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Category card ────────────────────────────────────────────────────────────

function CategoryCard({
  icon: Icon,
  label,
  iconClassName = '',
}: {
  icon: ElementType
  label: string
  iconClassName?: string
}) {
  return (
    <div className="group flex h-16 cursor-pointer items-center gap-3 rounded-2xl border border-border px-5 shadow-card transition-all duration-200 hover:border-subtle-border hover:shadow-card-hover">
      <Icon className={`size-5 shrink-0 ${iconClassName}`} />
      <span className="flex-1 font-display text-xl font-medium text-foreground">{label}</span>
      <ChevronRight className={`size-5 shrink-0 transition-transform duration-200 group-hover:animate-chevron-nudge ${iconClassName}`} />
    </div>
  )
}

// ─── Layout placeholders ──────────────────────────────────────────────────────

function Placeholder({ className = '', label }: { className?: string; label?: string }) {
  return (
    <div className={`rounded-2xl border border-border shadow-card transition-all duration-200 hover:border-subtle-border hover:shadow-card-hover flex items-center justify-center ${className}`}>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  )
}

// ─── Trending list ────────────────────────────────────────────────────────────

const TRENDING_ITEMS = [
  {
    id: 1,
    title: 'Texas Republican Senate Runoff: Margin of Victory',
    subtitle: 'Ken Paxton, 20%+',
    pct: '99%',
    trend: { value: 90, up: true },
  },
  {
    id: 2,
    title: 'Fed decision in June?',
    subtitle: 'Fed maintains rate',
    pct: '96%',
    trend: null,
  },
  {
    id: 3,
    title: 'Los Angeles Mayor winner?',
    subtitle: 'Karen Bass',
    pct: '70%',
    trend: null,
  },
]

function TrendingList() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="group mb-5 mt-4 flex cursor-pointer items-center gap-1">
        <span className="font-display text-2xl font-medium text-foreground">Trending</span>
        <ChevronRight className="size-5 text-success transition-transform duration-200 group-hover:animate-chevron-nudge" />
      </div>

      <div className="flex flex-col gap-5">
        {TRENDING_ITEMS.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <span className="mt-0.5 w-4 shrink-0 text-sm text-muted-foreground">{item.id}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-snug text-foreground">{item.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.subtitle}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold text-foreground">{item.pct}</p>
              {item.trend ? (
                <p className="text-xs font-semibold text-success">▲ {item.trend.value}</p>
              ) : (
                <p className="text-xs text-muted-foreground">––</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

const CURRENT_STEP = 3
const TOTAL_STEPS = 4

const ONBOARDING_STEPS = [
  { label: 'Create an account',     description: null as string | null, done: true,  current: false },
  { label: 'Verify your identity',  description: null as string | null, done: true,  current: false },
  { label: 'Deposit funds',         description: 'Venmo, Apple Pay, Crypto, and more', done: false, current: true  },
  { label: 'Start to play',         description: null as string | null, done: false, current: false },
]

const PAY_MAIN: { id: string; label: string; badge: string | null; Icon: ElementType; logoSrc?: string; invertOnDark?: boolean }[] = [
  { id: 'applepay', label: 'Apple Pay', badge: null,           Icon: Wallet,     logoSrc: '/logos/Apple_logo_black.svg', invertOnDark: true },
  { id: 'gpay',     label: 'Google Pay', badge: 'Most popular', Icon: Wallet,   logoSrc: '/logos/gpay-light.svg'                            },
  { id: 'card',     label: 'Card',       badge: null,           Icon: CreditCard                                                            },
  { id: 'crypto',   label: 'Crypto',     badge: null,           Icon: Bitcoin                                                               },
]

const PAY_MORE: { id: string; label: string; badge: string | null; Icon: ElementType }[] = [
  { id: 'wire', label: 'Wire transfer', badge: null, Icon: ArrowRightLeft },
]

function StepIndicator({ done, current }: { done: boolean; current: boolean }) {
  if (done) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-success">
        <Check className="size-3.5 text-white" strokeWidth={3} />
      </div>
    )
  }
  if (current) {
    return (
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-success">
        <div className="size-2 rounded-full bg-success" />
      </div>
    )
  }
  return (
    <div className="flex size-7 shrink-0 items-center justify-center">
      <div className="size-2.5 rounded-full bg-border" />
    </div>
  )
}

function PaymentRow({
  label,
  badge,
  Icon,
  logoSrc,
  logoClass,
  onClick,
}: {
  label: string
  badge: string | null
  Icon: ElementType
  logoSrc?: string
  logoClass?: string
  onClick?: () => void
}) {
  return (
    <button
      className="group flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-border px-4 py-4 text-left transition-colors hover:bg-muted"
      onClick={onClick}
    >
      {logoSrc
        ? <img src={logoSrc} alt={label} className={`h-5 w-auto shrink-0${logoClass ? ` ${logoClass}` : ''}`} />
        : <Icon className="size-5 shrink-0 text-foreground" />
      }
      <span className="flex-1 text-base font-semibold text-foreground">{label}</span>
      {badge && (
        <span className="rounded-full bg-success-bg px-2.5 py-0.5 text-xs font-medium text-success">
          {badge}
        </span>
      )}
      <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:animate-chevron-nudge" />
    </button>
  )
}

// ─── Deposit pill (shared between two dialogs) ────────────────────────────────

function DepositPill() {
  return (
    <div className="flex justify-center">
      <span className="rounded-full border border-border px-4 py-1 text-xs font-bold uppercase tracking-widest text-foreground">
        Deposit
      </span>
    </div>
  )
}

// ─── Onboarding section ───────────────────────────────────────────────────────

function OnboardingSection() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const [stepsOpen,       setStepsOpen]       = useState(false)
  const [depositOpen,     setDepositOpen]     = useState(false)
  const [showMore,        setShowMore]        = useState(false)
  const [amountOpen,      setAmountOpen]      = useState(false)
  const [activeMethod,    setActiveMethod]    = useState<'applepay' | 'gpay' | 'card' | null>(null)
  const [gpayConfirmOpen, setGpayConfirmOpen] = useState(false)
  const [cardFormOpen,    setCardFormOpen]    = useState(false)
  const [wireOpen,        setWireOpen]        = useState(false)
  const [copiedField,     setCopiedField]     = useState<string | null>(null)
  const [amountStr,       setAmountStr]       = useState('')
  const [saveCard,        setSaveCard]        = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const amount       = parseInt(amountStr || '0', 10)
  const isValid      = amount >= 10 && amount <= 1000
  const showMinError = amountStr.length > 0 && amount > 0 && amount < 10
  const showMaxError = amount > 1000

  // Auto-focus hidden input when amount modal opens
  useEffect(() => {
    if (!amountOpen) return
    const t = setTimeout(() => inputRef.current?.focus(), 150)
    return () => clearTimeout(t)
  }, [amountOpen])

  function openDeposit() {
    setStepsOpen(false)
    setDepositOpen(true)
  }

  function openWire() {
    setDepositOpen(false)
    setShowMore(false)
    setWireOpen(true)
  }

  function copyField(id: string, value: string) {
    navigator.clipboard.writeText(value).catch(() => {})
    setCopiedField(id)
    setTimeout(() => setCopiedField(null), 2000)
  }

  function openApplePay() {
    setDepositOpen(false)
    setActiveMethod('applepay')
    setAmountOpen(true)
  }

  function openGpay() {
    setDepositOpen(false)
    setActiveMethod('gpay')
    setAmountOpen(true)
  }

  function openCard() {
    setDepositOpen(false)
    setActiveMethod('card')
    setAmountOpen(true)
  }

  function backFromAmount() {
    setAmountOpen(false)
    setAmountStr('')
    setDepositOpen(true)
  }

  function continueFromAmount() {
    setAmountOpen(false)
    if (activeMethod === 'applepay' || activeMethod === 'gpay') setGpayConfirmOpen(true)
    else if (activeMethod === 'card') setCardFormOpen(true)
  }

  function backToAmount() {
    setGpayConfirmOpen(false)
    setCardFormOpen(false)
    setAmountOpen(true)
  }

  function addAmount(add: number) {
    const next = parseInt(amountStr || '0', 10) + add
    setAmountStr(String(next))
  }

  function closeAll() {
    setGpayConfirmOpen(false)
    setCardFormOpen(false)
    setWireOpen(false)
    setAmountOpen(false)
    setAmountStr('')
    setSaveCard(false)
  }

  const progress = (CURRENT_STEP / TOTAL_STEPS) * 100

  return (
    <>
      {/* ── Banner ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border border-border bg-card px-5 py-3.5">
        <div className="shrink-0">
          <p className="text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
            Get ready to play
          </p>
          <p className="font-display text-2xl font-medium text-foreground">Deposit funds</p>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            {/* width is computed dynamically — inline style intentional */}
            <div
              className="h-full rounded-full bg-success transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="shrink-0 text-sm text-muted-foreground">
            Step {CURRENT_STEP} of {TOTAL_STEPS}
          </span>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto sm:shrink-0">
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setStepsOpen(true)}>
            View all steps
          </Button>
          <Button
            className="flex-1 bg-success text-white hover:bg-success/90 sm:flex-none"
            onClick={() => setDepositOpen(true)}
          >
            Deposit funds
          </Button>
        </div>
      </div>

      {/* ── Steps dialog ────────────────────────────────────────────────────── */}
      <Dialog open={stepsOpen} onOpenChange={setStepsOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-sm font-semibold">
              Get ready to play
            </DialogTitle>
            <DialogDescription className="sr-only">Complete the required steps to finish setting up your account and start playing.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                You&apos;re almost there
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Just a few steps left before you can start playing
              </p>
            </div>

            <div className="flex flex-col">
              {ONBOARDING_STEPS.map((step, i) => (
                <div key={step.label}>
                  <div className="flex items-start gap-3">
                    <StepIndicator done={step.done} current={step.current} />
                    <div className="pb-1 pt-0.5">
                      <p className={cn(
                        'text-sm leading-snug',
                        step.done ? 'text-muted-foreground' : 'font-semibold text-foreground',
                      )}>
                        {step.label}
                      </p>
                      {step.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>
                      )}
                    </div>
                  </div>
                  {i < ONBOARDING_STEPS.length - 1 && (
                    <div className={cn(
                      'my-1 ml-3.5 h-5 w-0.5 rounded-full',
                      step.done ? 'bg-success' : 'bg-muted',
                    )} />
                  )}
                </div>
              ))}
            </div>

            <Button
              size="lg"
              className="w-full bg-success text-white hover:bg-success/90"
              onClick={openDeposit}
            >
              Deposit funds
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Deposit dialog ──────────────────────────────────────────────────── */}
      <Dialog open={depositOpen} onOpenChange={(open) => { setDepositOpen(open); if (!open) setShowMore(false) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogTitle className="sr-only">Deposit funds</DialogTitle>
          <DialogDescription className="sr-only">Choose a payment method to fund your account.</DialogDescription>

          <div className="flex flex-col gap-5">
            <DepositPill />

            <div className="flex items-center gap-1.5 text-sm">
              <Zap className="size-4 shrink-0 fill-success text-success" />
              <p className="text-muted-foreground">
                Instant transfer ·{' '}
                <span className="font-semibold text-foreground">No fees</span> on first deposit
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {PAY_MAIN.map((m) => (
                <PaymentRow
                  key={m.id}
                  label={m.label}
                  badge={m.badge}
                  Icon={m.Icon}
                  logoSrc={m.logoSrc}
                  logoClass={m.invertOnDark && isDark ? 'invert' : undefined}
                  onClick={
                    m.id === 'applepay' ? openApplePay :
                    m.id === 'gpay'     ? openGpay :
                    m.id === 'card'     ? openCard :
                    undefined
                  }
                />
              ))}

              {!showMore ? (
                <button
                  onClick={() => setShowMore(true)}
                  className="flex w-full cursor-pointer items-center justify-center rounded-2xl border border-border px-4 py-4 transition-colors hover:bg-muted"
                >
                  <span className="text-base font-medium text-muted-foreground">View more options</span>
                </button>
              ) : (
                <>
                  <p className="px-1 pt-1 text-xs text-muted-foreground">Up to 1 business day</p>
                  {PAY_MORE.map((m) => (
                    <PaymentRow
                      key={m.id}
                      label={m.label}
                      badge={m.badge}
                      Icon={m.Icon}
                      onClick={m.id === 'wire' ? openWire : undefined}
                    />
                  ))}
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Amount entry dialog (shared: Google Pay & Card) ──────────────────── */}
      <Dialog open={amountOpen} onOpenChange={(open) => { setAmountOpen(open); if (!open) setAmountStr('') }}>
        <DialogContent className="sm:max-w-sm">
          <DialogTitle className="sr-only">
            {activeMethod === 'gpay' ? 'Deposit with Google Pay' : 'Deposit with Card'}
          </DialogTitle>
          <DialogDescription className="sr-only">Enter the amount you'd like to deposit.</DialogDescription>

          {/* Back button */}
          <button
            onClick={backFromAmount}
            className="absolute left-4 top-4 flex size-7 cursor-pointer items-center justify-center rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
            aria-label="Go back"
          >
            <ChevronLeft className="size-4" />
          </button>

          <div className="flex flex-col gap-6">
            <DepositPill />

            {/* Amount display */}
            <div
              className="relative flex cursor-text items-center justify-center py-6"
              onClick={() => inputRef.current?.focus()}
            >
              <span className={cn(
                'font-bold tabular-nums tracking-tight text-6xl',
                amount === 0 ? 'text-muted-foreground/40' : 'text-foreground',
              )}>
                ${amount === 0 ? '' : amountStr}
              </span>
              <span className="animate-blink inline-block w-[2px] h-12 bg-foreground/60 align-middle" />
              {amount === 0 && (
                <span className="font-bold tabular-nums tracking-tight text-6xl text-muted-foreground/40">0</span>
              )}

              {/* Invisible input captures keyboard events */}
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                className="absolute h-0 w-0 opacity-0"
                value={amountStr}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4)
                  setAmountStr(val)
                }}
              />
            </div>

            {/* Quick-add buttons */}
            <div className="flex justify-center gap-3">
              {[10, 25, 50].map((val) => (
                <button
                  key={val}
                  onClick={() => addAmount(val)}
                  className="cursor-pointer rounded-full border border-border px-5 py-2 text-sm font-semibold text-success transition-colors hover:bg-muted"
                >
                  +${val}
                </button>
              ))}
            </div>

            {/* Info + validation */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Zap className="size-4 shrink-0 fill-muted-foreground text-muted-foreground" />
                <span>Instant transfer · No fees</span>
              </div>

              {showMinError && (
                <div className="flex items-center gap-1.5 text-sm text-crimson">
                  <div className="size-2 shrink-0 rounded-sm bg-crimson" />
                  <span>$10 minimum deposit</span>
                </div>
              )}
              {showMaxError && (
                <div className="flex items-center gap-1.5 text-sm text-crimson">
                  <div className="size-2 shrink-0 rounded-sm bg-crimson" />
                  <span>You can deposit up to $1,000 with debit card</span>
                </div>
              )}
            </div>

            {/* CTA */}
            <Button
              size="lg"
              disabled={!isValid}
              onClick={continueFromAmount}
              className={cn(
                'w-full',
                isValid
                  ? 'bg-success text-white hover:bg-success/90'
                  : 'bg-success/15 text-success/50 disabled:opacity-100',
              )}
            >
              {activeMethod === 'applepay' ? 'Continue with Apple Pay' : activeMethod === 'gpay' ? 'Continue with Google Pay' : 'Continue with Card'}
            </Button>

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground">
              By submitting, you acknowledge your consent to debit your card and your agreement
              to our rules and terms.{' '}
              <span className="font-semibold text-foreground">
                This payment cannot be cancelled
              </span>
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Google Pay confirmation dialog ───────────────────────────────────── */}
      <Dialog
        open={gpayConfirmOpen}
        onOpenChange={(open) => { setGpayConfirmOpen(open); if (!open) setAmountStr('') }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogTitle className="sr-only">Confirm {activeMethod === 'applepay' ? 'Apple Pay' : 'Google Pay'} deposit</DialogTitle>
          <DialogDescription className="sr-only">Review and confirm your deposit amount before completing the {activeMethod === 'applepay' ? 'Apple Pay' : 'Google Pay'} transaction.</DialogDescription>

          {/* Back button */}
          <button
            onClick={backToAmount}
            className="absolute left-4 top-4 flex size-7 cursor-pointer items-center justify-center rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
            aria-label="Go back"
          >
            <ChevronLeft className="size-4" />
          </button>

          <div className="flex flex-col gap-6">
            <DepositPill />

            {/* Selected method row */}
            <div className="flex items-center gap-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-success">
                <div className="size-2 rounded-full bg-success" />
              </div>
              <div className="flex items-center rounded-full border border-border px-3 py-1.5">
                {activeMethod === 'applepay'
                  ? <img src="/logos/Apple_logo_black.svg" alt="Apple Pay" className={`h-4 w-auto${isDark ? ' invert' : ''}`} />
                  : <img src="/logos/gpay-light.svg" alt="Google Pay" className="h-4 w-auto" />
                }
              </div>
              <span className="text-base font-semibold text-success">
                {activeMethod === 'applepay' ? 'Apple Pay' : 'Google Pay'}
              </span>
            </div>

            {/* Pay button mock — black per brand guidelines */}
            <button className="flex h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-lg bg-[#000] px-4 transition-opacity hover:opacity-90">
              {activeMethod === 'applepay'
                ? <img src="/logos/Apple_logo_black.svg" alt="Apple Pay" className="h-6 w-auto shrink-0 invert" />
                : <img src="/logos/gpay-dark.svg" alt="Google Pay" className="h-6 w-auto shrink-0" />
              }
              <div className="h-5 w-px bg-white/20" />
              <span className="rounded bg-blue-600 px-1.5 py-0.5 text-xs font-bold text-white">
                VISA
              </span>
              <span className="text-sm text-white">···· 8908</span>
            </button>

            {/* Edit amount */}
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={backToAmount}
            >
              Edit amount
            </Button>

            {/* Not now */}
            <button
              onClick={closeAll}
              className="cursor-pointer text-sm font-medium text-success transition-opacity hover:opacity-70"
            >
              Not now
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Card details dialog ──────────────────────────────────────────────── */}
      <Dialog
        open={cardFormOpen}
        onOpenChange={(open) => { setCardFormOpen(open); if (!open) { setAmountStr(''); setSaveCard(false) } }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogTitle className="sr-only">Card details</DialogTitle>
          <DialogDescription className="sr-only">Enter your card details to complete the deposit.</DialogDescription>

          {/* Back button */}
          <button
            onClick={backToAmount}
            className="absolute left-4 top-4 flex size-7 cursor-pointer items-center justify-center rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
            aria-label="Go back"
          >
            <ChevronLeft className="size-4" />
          </button>

          <div className="flex flex-col gap-5">
            <DepositPill />

            {/* Selected method row */}
            <div className="flex items-center gap-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-success">
                <div className="size-2 rounded-full bg-success" />
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5">
                <CreditCard className="size-3.5 text-foreground" />
              </div>
              <span className="text-base font-semibold text-success">Card</span>
            </div>

            {/* Form fields */}
            <div className="flex flex-col gap-4">
              {/* Cardholder name */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="card-name" className="text-sm text-muted-foreground">
                  Cardholder name
                </Label>
                <Input
                  id="card-name"
                  type="text"
                  autoComplete="cc-name"
                  placeholder="Jane Smith"
                  className="h-11"
                />
              </div>

              {/* Card number */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="card-number" className="text-sm text-muted-foreground">
                  Card number
                </Label>
                <div className="relative">
                  <Input
                    id="card-number"
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="0000 0000 0000 0000"
                    className="h-11 pr-24"
                  />
                  <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
                    <span className="rounded px-1.5 py-0.5 text-xs font-bold text-white bg-blue-600">
                      VISA
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">MC</span>
                  </div>
                </div>
              </div>

              {/* Expiry + CVV */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="card-expiry" className="text-sm text-muted-foreground">
                    Expiry date
                  </Label>
                  <Input
                    id="card-expiry"
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM / YY"
                    className="h-11"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="card-cvv" className="text-sm text-muted-foreground">
                    Security code
                  </Label>
                  <Input
                    id="card-cvv"
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder="CVV"
                    className="h-11"
                  />
                </div>
              </div>

              {/* Save card */}
              <div className="flex items-center gap-2.5">
                <Checkbox
                  id="save-card"
                  checked={saveCard}
                  onCheckedChange={(v) => setSaveCard(!!v)}
                />
                <Label
                  htmlFor="save-card"
                  className="cursor-pointer text-sm font-medium text-foreground"
                >
                  Save card for future deposits
                </Label>
              </div>
            </div>

            {/* Checkout.com secured note */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Shield className="size-3.5 shrink-0" />
              <span>Secured by</span>
              <span className="font-semibold text-foreground">Checkout.com</span>
            </div>

            {/* Deposit CTA */}
            <Button
              size="lg"
              className="w-full bg-success text-white hover:bg-success/90"
            >
              <Lock className="size-4" />
              Deposit {amount > 0 ? `$${amountStr}` : ''}
            </Button>

            {/* Edit amount */}
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={backToAmount}
            >
              Edit amount
            </Button>

            {/* Not now */}
            <button
              onClick={closeAll}
              className="cursor-pointer text-sm font-medium text-success transition-opacity hover:opacity-70"
            >
              Not now
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Wire transfer dialog ─────────────────────────────────────────────── */}
      <Dialog open={wireOpen} onOpenChange={setWireOpen}>
        <DialogContent className="flex max-h-[88svh] flex-col overflow-hidden sm:max-w-sm">
          <DialogTitle className="sr-only">Wire transfer instructions</DialogTitle>
          <DialogDescription className="sr-only">Bank wire transfer details.</DialogDescription>

          {/* Back button */}
          <button
            onClick={() => { setWireOpen(false); setDepositOpen(true); setShowMore(true) }}
            className="absolute left-4 top-4 flex size-7 cursor-pointer items-center justify-center rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
            aria-label="Go back"
          >
            <ChevronLeft className="size-4" />
          </button>

          {/* Scrollable body */}
          <div className="overflow-y-auto pr-1">
            <div className="flex flex-col gap-5 pb-4 pt-2">
              <DepositPill />

              {/* Title */}
              <div>
                <h2 className="text-xl font-bold text-foreground">Send a wire from your bank</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Submit this information to your bank to initiate a transfer.
                </p>
              </div>

              {/* Info bullets */}
              <div className="flex flex-col gap-3">
                {[
                  { Icon: DollarSign,   text: 'Wires must be sent in USD' },
                  { Icon: RefreshCw,    text: 'Minimum $1,000. No maximum.' },
                  { Icon: Clock,        text: 'Wires must be received by Kalshi Klear LLC before 4pm ET for attribution within one business day. They will be processed in the order received.' },
                ].map(({ Icon, text }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-success/10">
                      <Icon className="size-4 text-success" />
                    </div>
                    <p className="pt-1 text-sm text-muted-foreground">{text}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border" />

              {/* Numbered fields */}
              <div className="flex flex-col divide-y divide-border">

                {/* 1. Account name */}
                <div className="py-4">
                  <p className="text-sm font-semibold text-foreground">
                    1. Your bank account name{' '}
                    <span className="text-brand">must match</span>
                    {' '}your name on Kalshi:
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-brand">Yevhenii Holovei</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Wires must come from an account matching your Kalshi account name. If your Kalshi account is in your name, send the wire from your personal account, not a third party's. If your Kalshi account is under your entity's name, send the wire from an account owned by and named after your entity.
                  </p>
                </div>

                {/* 2–8: simple copy fields */}
                {([
                  { n: 2,  label: 'Recipient name',     value: 'Kalshi Klear LLC'                                      },
                  { n: 3,  label: 'Recipient address',  value: '416 W 13th Street, Room 207, New York, NY 10014'       },
                  { n: 4,  label: 'Final credit account', value: '3304242626'                                           },
                  { n: 5,  label: 'Routing and transit', value: '121140399'                                             },
                  { n: 6,  label: 'SWIFT code',         value: 'SVBKUS6S'                                              },
                  { n: 7,  label: 'Bank name',          value: 'First Citizens Bank and Trust Co.'                     },
                  { n: 8,  label: 'Bank address',       value: '239 Fayetteville St, Raleigh, NC 27601 United States'  },
                ] as { n: number; label: string; value: string }[]).map(({ n, label, value }) => (
                  <div key={n} className="flex items-center justify-between gap-3 py-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{n}. {label}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{value}</p>
                    </div>
                    <button
                      onClick={() => copyField(String(n), value)}
                      className="shrink-0 cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {copiedField === String(n)
                        ? <Check className="size-4 text-success" />
                        : <Copy className="size-4" />
                      }
                    </button>
                  </div>
                ))}

                {/* 9. Wire amount */}
                <div className="flex items-center justify-between gap-3 py-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">9. Wire amount</p>
                    <p className="mt-0.5 text-sm">
                      <span className="text-brand">Minimum $1,000.</span>
                      <span className="text-muted-foreground"> No maximum.</span>
                    </p>
                  </div>
                  <button
                    onClick={() => copyField('9', 'Minimum $1,000. No maximum.')}
                    className="shrink-0 cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {copiedField === '9'
                      ? <Check className="size-4 text-success" />
                      : <Copy className="size-4" />
                    }
                  </button>
                </div>

                {/* 10. Memo */}
                <div className="flex items-start justify-between gap-3 py-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      10. Message to recipient / Memo{' '}
                      <span className="text-brand">(Required)</span>
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-brand">kalidq7so</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Wires must be sent in USD. Can't find "Message to recipient / Memo"? Depending on your bank, it may be labeled as: Note, Description, Special Instructions, or Further Credit To.
                    </p>
                  </div>
                  <button
                    onClick={() => copyField('10', 'kalidq7so')}
                    className="shrink-0 cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {copiedField === '10'
                      ? <Check className="size-4 text-success" />
                      : <Copy className="size-4" />
                    }
                  </button>
                </div>

              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ─── Main content ─────────────────────────────────────────────────────────────

function MainContent() {
  return (
    <div className="flex flex-col gap-4">
      <Placeholder className="min-h-[340px]" label="Featured market card" />
      <OnboardingSection />
    </div>
  )
}

function Sidebar() {
  return (
    <div className="flex flex-col gap-3">
      <CategoryCard icon={Gift}      label="Promotions" iconClassName="text-warning" />
      <CategoryCard icon={RotateCcw} label="Cashback"   iconClassName="text-success" />
      <CategoryCard icon={Crown}     label="VIP Club"   iconClassName="text-brand"   />
      <TrendingList />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <>
    <AuthModals />
    <DocLayout
      title="Brand Canvas"
      breadcrumbLabel="Sandbox"
      breadcrumbHref="/sandbox"
      tags={[
        { label: 'Prototype', type: 'tag' },
        { label: 'iGaming',   type: 'tag' },
      ]}
      description="Main page prototype"
    >
      <TopicsNav />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <MainContent />
        <Sidebar />
      </div>
    </DocLayout>
    </>
  )
}
