'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTheme } from 'next-themes'

function AuthPill({ label }: { label: string }) {
  return (
    <div className="flex justify-center">
      <span className="rounded-full border border-border px-4 py-1 text-xs font-bold uppercase tracking-widest text-foreground">
        {label}
      </span>
    </div>
  )
}

export function AuthModals() {
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

  const socialBtnClass = "w-full bg-foreground text-background hover:bg-foreground/85"

  return (
    <>
      {/* ── Expired session ─────────────────────────────────────────────────── */}
      <Dialog open={expiredOpen} onOpenChange={setExpiredOpen}>
        <DialogContent className="sm:max-w-sm" onOpenAutoFocus={(e) => e.preventDefault()}>
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
              size="xl"
              className="w-full bg-success text-success-foreground hover:bg-success/90"
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
            <Button size="xl" className={socialBtnClass}>
              <img src="/logos/google-logo.svg" alt="Google" className="size-5 shrink-0" />
              Continue with Google
            </Button>
            <Button size="xl" className={socialBtnClass}>
              <img src="/logos/Apple_logo_black.svg" alt="Apple" className={`size-5 shrink-0${isDark ? '' : ' invert'}`} />
              Continue with Apple
            </Button>

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
                size="xl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  size="xl"
                  className="pr-10"
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
              size="xl"
              disabled={!loginEnabled}
              className="w-full bg-success text-success-foreground hover:bg-success/90"
            >
              Log in
            </Button>

            {/* Forgot password */}
            <Button
              type="button"
              size="xl"
              variant="outline"
              className="w-full font-normal"
            >
              Forgot password?
            </Button>

            {/* Create account link */}
            <Button
              type="button"
              variant="link"
              onClick={handleCreateAccount}
              className="text-brand"
            >
              No account? Create one
            </Button>
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
              <Button size="xl" className={socialBtnClass}>
                <img src="/logos/google-logo.svg" alt="Google" className="size-5 shrink-0" />
                Continue with Google
              </Button>
              <Button size="xl" className={socialBtnClass}>
                <img src="/logos/Apple_logo_black.svg" alt="Apple" className={`size-5 shrink-0${isDark ? '' : ' invert'}`} />
                Continue with Apple
              </Button>

              {/* Sign up with email */}
              <Button
                type="button"
                size="xl"
                variant="outline"
                className="w-full"
              >
                Sign up with Email
              </Button>

              {/* Already have account */}
              <Button
                type="button"
                variant="link"
                onClick={handleAlreadyHaveAccount}
                className="text-brand"
              >
                Already have an account? Log in
              </Button>

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
