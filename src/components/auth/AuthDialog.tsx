'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { LoginForm } from './LoginForm'
import { SignupForm } from './SignupForm'

type Mode = 'login' | 'signup'

type Props = {
  open: boolean
  mode?: Mode
  onOpenChange: (open: boolean) => void
}

export function AuthDialog({ open, mode: initialMode = 'login', onOpenChange }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode)

  useEffect(() => {
    if (open) setMode(initialMode)
  }, [open, initialMode])
  const router = useRouter()

  function handleSuccess() {
    onOpenChange(false)
    router.push('/dashboard')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden max-sm:top-[80px] max-sm:translate-y-0 max-sm:left-4 max-sm:right-4 max-sm:w-auto max-sm:-translate-x-0 max-sm:mx-0">
        <DialogTitle className="sr-only">
          {mode === 'login' ? 'Login' : 'Create account'}
        </DialogTitle>
        {mode === 'login' ? (
          <LoginForm
            onSuccess={handleSuccess}
            onSwitchToSignup={() => setMode('signup')}
          />
        ) : (
          <SignupForm
            onSuccess={handleSuccess}
            onSwitchToLogin={() => setMode('login')}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
