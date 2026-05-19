'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Lock, LockOpen, Trash2, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog'

const PASSWORD = process.env.NEXT_PUBLIC_TODO_PASSWORD

interface Doc {
  id: number
  title: string
  slug: string
  created_at: string
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function DocsPage() {
  const router = useRouter()

  const [docs, setDocs]                   = useState<Doc[]>([])
  const [loading, setLoading]             = useState(true)
  const [isUnlocked, setIsUnlocked]       = useState(false)
  const [showPassword, setShowPassword]   = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [showModal, setShowModal]         = useState(false)
  const [newTitle, setNewTitle]           = useState('')
  const [creating, setCreating]           = useState(false)
  const [titleError, setTitleError]       = useState('')

  useEffect(() => { fetchDocs() }, [])

  async function fetchDocs() {
    setLoading(true)
    const { data, error } = await supabase
      .from('documents')
      .select('id, title, slug, created_at')
      .order('created_at', { ascending: false })
    if (!error) setDocs(data || [])
    setLoading(false)
  }

  function handleUnlock() {
    if (passwordInput === PASSWORD) {
      setIsUnlocked(true)
      setShowPassword(false)
      setPasswordError(false)
      setPasswordInput('')
    } else {
      setPasswordError(true)
    }
  }

  function handleNewDocClick() {
    if (!isUnlocked) { setShowPassword((v) => !v); return }
    setShowModal(true)
    setNewTitle('')
    setTitleError('')
  }

  async function handleCreateDoc() {
    const trimmed = newTitle.trim()
    if (!trimmed)            { setTitleError('Please enter a title'); return }
    if (trimmed.length > 50) { setTitleError('Max 50 characters'); return }

    const slug = slugify(trimmed)
    if (!slug) { setTitleError('Title must contain at least one letter or number'); return }

    const { data: existing } = await supabase
      .from('documents').select('id').eq('slug', slug).single()
    if (existing) { setTitleError('A document with this name already exists'); return }

    setCreating(true)
    const { data, error } = await supabase
      .from('documents')
      .insert({ title: trimmed, slug, content: '' })
      .select().single()
    if (!error && data) {
      setShowModal(false)
      router.push(`/docs/${data.slug}`)
    }
    setCreating(false)
  }

  async function handleDeleteDoc(e: React.MouseEvent, id: number) {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm('Delete this document?')) return
    const { error } = await supabase.from('documents').delete().eq('id', id)
    if (!error) fetchDocs()
  }

  return (
    <div className="py-12 pb-20">
      <div className="mx-auto max-w-screen-xl px-4">

        {/* Page header */}
        <div className="mb-10 flex items-start justify-between gap-4">
          <div>
            <h1 className="mb-2 text-xl font-bold tracking-heading">Documents</h1>
            <p className="text-base leading-relaxed text-muted-foreground">
              Notes, drafts, and written work.
            </p>
          </div>
          <Button
            variant="outline"
            size="icon-sm"
            className="mt-1 shrink-0"
            onClick={() => isUnlocked ? setIsUnlocked(false) : setShowPassword((v) => !v)}
            aria-label={isUnlocked ? 'Lock' : 'Unlock'}
          >
            {isUnlocked ? <LockOpen className="size-4" /> : <Lock className="size-4" />}
          </Button>
        </div>

        {/* Password input */}
        {showPassword && !isUnlocked && (
          <div className="flex gap-2 mb-6">
            <Input
              className="flex-1 min-w-0"
              type="password"
              placeholder="Enter password to create documents"
              value={passwordInput}
              onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false) }}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              aria-invalid={passwordError || undefined}
              autoFocus
            />
            <Button className="shrink-0" onClick={handleUnlock}>Unlock</Button>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <p className="text-sm text-muted-foreground py-4">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-4">

            {/* New doc card */}
            <button
              className={cn(
                'flex flex-col items-center justify-center gap-2',
                'min-h-72 p-4 rounded-2xl',
                'border-[1.5px] border-dashed border-border bg-transparent',
                'cursor-pointer transition-colors duration-200',
                'hover:border-foreground/30 hover:bg-muted/40',
              )}
              onClick={handleNewDocClick}
              aria-label="Create new document"
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-muted text-muted-foreground">
                <Plus className="size-4" />
              </span>
              <span className="text-xs font-semibold text-muted-foreground tracking-caps">
                New document
              </span>
            </button>

            {/* Existing docs */}
            {docs.map((doc) => (
              <Link
                key={doc.id}
                href={`/docs/${doc.slug}`}
                className={cn(
                  'flex flex-col justify-between gap-4',
                  'min-h-72 p-4 rounded-2xl',
                  'bg-card border border-border',
                  'shadow-[0_1px_2px_rgba(16,24,40,0.04)]',
                  'transition-[border-color,box-shadow] duration-200',
                  'hover:border-subtle-border hover:shadow-[0_4px_16px_rgba(16,24,40,0.08)]',
                )}
              >
                {/* Top */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-0.5">
                      <h2 className="text-sm font-bold leading-snug tracking-heading text-foreground">
                        {doc.title}
                      </h2>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(doc.created_at)}
                      </span>
                    </div>
                    <Badge variant="secondary" className="shrink-0">Document</Badge>
                  </div>
                </div>

                {/* Footer */}
                <div className="-mx-4 -mb-4 flex items-center justify-between gap-3 rounded-b-2xl border-t border-border bg-subtle px-4 py-4">
                  <Badge variant="outline">Note</Badge>
                  <div className="flex items-center gap-2">
                    {isUnlocked && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="hover:bg-destructive-bg hover:text-destructive"
                        onClick={(e) => handleDeleteDoc(e, doc.id)}
                        aria-label="Delete document"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                    <span className="shrink-0 inline-flex items-center rounded-lg bg-foreground px-3 h-8 text-sm font-medium text-background">
                      Open
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* New doc dialog */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New document</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1.5 py-1">
            <Label className="text-xs font-medium text-muted-foreground">Document title</Label>
            <Input
              autoFocus
              placeholder="Document title"
              value={newTitle}
              maxLength={50}
              onChange={(e) => { setNewTitle(e.target.value.slice(0, 50)); setTitleError('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateDoc()}
              aria-invalid={!!titleError || undefined}
            />
            {titleError && (
              <p className="text-xs text-destructive">{titleError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {newTitle.length}/50 · URL: /docs/{slugify(newTitle) || '...'}
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" size="sm">Cancel</Button>
            </DialogClose>
            <Button size="sm" disabled={creating} onClick={handleCreateDoc}>
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
