'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthDialog } from '@/components/auth/AuthDialog'

/**
 * Shown in place of protected content when the visitor is not signed in.
 * Signing in refreshes the route so the server can render the real content.
 */
export function LockedNotice({
  title = 'Доступ по логину',
  description = 'Этот документ виден только авторизованным пользователям. Войдите, чтобы открыть его.',
}: {
  title?: string
  description?: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-xl bg-muted">
        <Lock className="size-7 text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      <Button className="mt-2" onClick={() => setOpen(true)}>
        Войти
      </Button>

      <AuthDialog
        open={open}
        mode="login"
        onOpenChange={setOpen}
        onAuthenticated={() => router.refresh()}
      />
    </div>
  )
}
