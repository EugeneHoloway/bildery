import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

/**
 * Supabase client for Server Components — reads the session from cookies
 * written by the browser client (@/lib/supabase-browser).
 *
 * Server Components cannot write cookies, so setAll is a no-op: token refresh
 * stays the browser client's job.
 */
export async function createServerSupabase() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    },
  )
}

/** Returns the signed-in user, or null. Validates the token with Supabase. */
export async function getServerUser() {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase.auth.getUser()
  if (error) return null
  return data.user
}
