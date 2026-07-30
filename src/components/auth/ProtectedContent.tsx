import { getServerUser } from '@/lib/supabase-server'
import { LockedNotice } from '@/components/auth/LockedNotice'

/**
 * Server-side gate: children are rendered only for a signed-in user, so the
 * protected content never reaches an anonymous visitor's browser.
 */
export async function ProtectedContent({ children }: { children: React.ReactNode }) {
  const user = await getServerUser()

  if (!user) return <LockedNotice />

  return <>{children}</>
}
