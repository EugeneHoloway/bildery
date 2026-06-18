'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Sun, Moon, Ban } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { createClient } from '@/lib/supabase-browser'
import { DashboardHeader } from '@/components/DashboardHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { SettingsNav } from '@/components/settings/SettingsNav'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="size-8" />
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      {resolvedTheme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}

export default function AccountPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  const [passwordOpen, setPasswordOpen] = useState(false)
  const [pwFields, setPwFields] = useState({ current: '', next: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState('')

  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace('/')
  }, [user, loading, router])

  useEffect(() => {
    if (user?.user_metadata) {
      setFullName(user.user_metadata.full_name ?? '')
      setPhone(user.user_metadata.phone ?? '')
      setAddress(user.user_metadata.address ?? '')
    }
  }, [user])

  async function handleSave() {
    setSaving(true)
    setSaveError('')
    setSaveSuccess(false)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName, phone, address },
      })
      if (error) throw error
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  async function savePassword() {
    setPwError('')
    if (pwFields.next !== pwFields.confirm) { setPwError('New passwords do not match'); return }
    if (pwFields.next.length < 6) { setPwError('Password must be at least 6 characters'); return }
    setPwSaving(true)
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user!.email!,
        password: pwFields.current,
      })
      if (signInError) { setPwError('Current password is incorrect'); return }
      const { error } = await supabase.auth.updateUser({ password: pwFields.next })
      if (error) throw error
      setPasswordOpen(false)
      setPwFields({ current: '', next: '', confirm: '' })
    } catch (e: unknown) {
      setPwError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setPwSaving(false)
    }
  }

  async function handleDeactivate() {
    setDeleting(true)
    await supabase.auth.signOut()
    router.replace('/')
  }

  if (loading || !user) return null

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: 'Bildery', href: '/dashboard' },
          { label: 'Account' },
        ]}
      />

        {/* Content */}
        <div className="flex flex-1 flex-col px-6 pt-4 pb-8">
          <div className="max-w-3xl">
            <h1 className="text-2xl font-semibold">Settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your account settings and set preferences.
            </p>
          </div>

          <Separator className="mt-6" />

          <div className="mt-6 flex flex-col sm:flex-row sm:gap-10">
            <SettingsNav />

            <div className="flex-1 mt-4 sm:mt-0 max-w-lg">
              <h2 className="text-xl font-semibold">Account</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Update your personal information and manage account security.
              </p>

              <div className="mt-8 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Full name</label>
                  <Input
                    size="xl"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input
                    size="xl"
                    value={user.email ?? ''}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPwError('')
                        setPwFields({ current: '', next: '', confirm: '' })
                        setPasswordOpen(true)
                      }}
                    >
                      Change password
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Phone number</label>
                  <Input
                    size="xl"
                    placeholder="+1 234 567 8900"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Address</label>
                  <Input
                    size="xl"
                    placeholder="Street, City, ZIP"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                  />
                </div>
              </div>

              {saveError && (
                <p className="mt-4 text-sm text-destructive">{saveError}</p>
              )}
              {saveSuccess && (
                <p className="mt-4 text-sm text-success">Changes saved successfully.</p>
              )}

              <div className="mt-6 flex items-center gap-3">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving…' : 'Save changes'}
                </Button>
              </div>

              <Separator className="my-8" />

              <div className="space-y-1.5">
                <p className="text-sm font-medium text-foreground">Danger zone</p>
                <p className="text-sm text-muted-foreground">
                  Permanently deactivate your account and delete all associated data.
                </p>
                <div className="pt-1">
                  <Button
                    variant="outline"
                    className="text-destructive border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
                    onClick={() => setDeactivateOpen(true)}
                  >
                    <Ban className="size-4" />
                    Deactivate account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change password dialog */}
        <Dialog open={passwordOpen} onOpenChange={open => !open && setPasswordOpen(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change password</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Current password</label>
                <Input type="password" value={pwFields.current} onChange={e => setPwFields(p => ({ ...p, current: e.target.value }))} size="xl" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">New password</label>
                <Input type="password" value={pwFields.next} onChange={e => setPwFields(p => ({ ...p, next: e.target.value }))} size="xl" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Confirm new password</label>
                <Input type="password" value={pwFields.confirm} onChange={e => setPwFields(p => ({ ...p, confirm: e.target.value }))} size="xl" />
              </div>
            </div>
            {pwError && <p className="text-sm text-destructive">{pwError}</p>}
            <DialogFooter>
              <Button variant="outline" onClick={() => setPasswordOpen(false)} disabled={pwSaving}>Cancel</Button>
              <Button onClick={savePassword} disabled={pwSaving}>{pwSaving ? 'Saving…' : 'Update password'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Deactivate dialog */}
        <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deactivate your account?</DialogTitle>
              <DialogDescription>
                All your data will be lost and this action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeactivateOpen(false)} disabled={deleting}>Not now</Button>
              <Button variant="destructive" onClick={handleDeactivate} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </>
  )
}
