'use client'

import { useState } from 'react'
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

  function handleSuccess() {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden">
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
