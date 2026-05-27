'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Lock, LockOpen, Trash2, Plus, Check, Pencil } from 'lucide-react'
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
  bullets_label: string | null
  bullet_1: string | null
  bullet_2: string | null
  bullet_3: string | null
  badge_top: string | null
  badge_bottom: string | null
}

interface DocFormState {
  title: string
  bullets_label: string
  bullet_1: string
  bullet_2: string
  bullet_3: string
  badge_top: string
  badge_bottom: string
}

const EMPTY_FORM: DocFormState = {
  title: '',
  bullets_label: '',
  bullet_1: '',
  bullet_2: '',
  bullet_3: '',
  badge_top: '',
  badge_bottom: '',
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

// ─── Doc card ────────────────────────────────────────────────────────────────

function DocCard({
  doc,
  isUnlocked,
  onDelete,
  onEdit,
}: {
  doc: Doc
  isUnlocked: boolean
  onDelete: (e: React.MouseEvent, id: number) => void
  onEdit: (e: React.MouseEvent, doc: Doc) => void
}) {
  const bullets = [doc.bullet_1, doc.bullet_2, doc.bullet_3].filter(Boolean) as string[]
  const hasBullets = bullets.length > 0

  return (
    <Link
      href={`/docs/${doc.slug}`}
      className={cn(
        'flex flex-col justify-between gap-4',
        'min-h-72 p-4 rounded-2xl',
        'bg-card border border-border',
        'shadow-card',
        'transition-[border-color,box-shadow] duration-200',
        'hover:border-subtle-border hover:shadow-card-hover',
      )}
    >
      {/* Top */}
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-bold leading-snug tracking-heading text-foreground">
              {doc.title}
            </h2>
            <span className="text-xs text-muted-foreground">
              {formatDate(doc.created_at)}
            </span>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {doc.badge_top || 'Document'}
          </Badge>
        </div>

        {hasBullets && (
          <div className="flex flex-col gap-2.5">
            {doc.bullets_label && (
              <span className="text-sm text-foreground">{doc.bullets_label}</span>
            )}
            <ul className="flex flex-col gap-1.5">
              {bullets.map((bullet, i) => (
                <li key={i} className="flex min-w-0 items-start gap-2">
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                    <Check className="size-2.5" strokeWidth={3} />
                  </span>
                  <span className="truncate text-sm leading-snug text-muted-foreground">
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="-mx-4 -mb-4 flex items-center justify-between gap-3 rounded-b-2xl border-t border-border bg-subtle px-4 py-4">
        <Badge variant="outline">{doc.badge_bottom || 'Note'}</Badge>
        <div className="flex items-center gap-2">
          {isUnlocked && (
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                className="hover:bg-muted"
                onClick={(e) => onEdit(e, doc)}
                aria-label="Edit document"
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="hover:bg-destructive-bg hover:text-destructive"
                onClick={(e) => onDelete(e, doc.id)}
                aria-label="Delete document"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </>
          )}
          <span className="shrink-0 inline-flex items-center rounded-lg bg-foreground px-3 h-8 text-sm font-medium text-background">
            Open
          </span>
        </div>
      </div>
    </Link>
  )
}

// ─── Doc form modal ───────────────────────────────────────────────────────────

function DocFormModal({
  open,
  onOpenChange,
  mode,
  initialForm,
  editingId,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  mode: 'create' | 'edit'
  initialForm: DocFormState
  editingId?: number
  onSuccess: () => void
}) {
  const router = useRouter()
  const [form, setForm] = useState<DocFormState>(initialForm)
  const [titleError, setTitleError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(initialForm)
      setTitleError('')
    }
  }, [open, initialForm])

  function set(key: keyof DocFormState, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
    if (key === 'title') setTitleError('')
  }

  async function handleSubmit() {
    const trimmedTitle = form.title.trim()
    if (!trimmedTitle)            { setTitleError('Please enter a title'); return }
    if (trimmedTitle.length > 50) { setTitleError('Max 50 characters'); return }

    const slug = slugify(trimmedTitle)
    if (!slug) { setTitleError('Title must contain at least one letter or number'); return }

    const bullets = [form.bullet_1, form.bullet_2, form.bullet_3].map(b => b.trim())
    const hasBullets = bullets.some(Boolean)

    const payload = {
      title:         trimmedTitle,
      bullets_label: hasBullets ? (form.bullets_label.trim() || null) : null,
      bullet_1:      bullets[0] || null,
      bullet_2:      bullets[1] || null,
      bullet_3:      bullets[2] || null,
      badge_top:     form.badge_top.trim() || null,
      badge_bottom:  form.badge_bottom.trim() || null,
    }

    setBusy(true)

    if (mode === 'create') {
      const { data: existing } = await supabase
        .from('documents').select('id').eq('slug', slug).single()
      if (existing) { setTitleError('A document with this name already exists'); setBusy(false); return }

      const { data, error } = await supabase
        .from('documents')
        .insert({ ...payload, slug, content: '' })
        .select().single()
      if (!error && data) {
        onOpenChange(false)
        router.push(`/docs/${data.slug}`)
      }
    } else {
      const { error } = await supabase
        .from('documents')
        .update(payload)
        .eq('id', editingId!)
      if (!error) {
        onOpenChange(false)
        onSuccess()
      }
    }

    setBusy(false)
  }

  const isCreate = mode === 'create'
  const hasBulletInput = form.bullet_1 || form.bullet_2 || form.bullet_3

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isCreate ? 'New document' : 'Edit document'}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Document title</Label>
            <Input
              autoFocus
              placeholder="Document title"
              value={form.title}
              maxLength={50}
              onChange={(e) => set('title', e.target.value.slice(0, 50))}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              aria-invalid={!!titleError || undefined}
            />
            {titleError && (
              <p className="text-xs text-destructive">{titleError}</p>
            )}
            {isCreate && (
              <p className="text-xs text-muted-foreground">
                {form.title.length}/50 · URL: /docs/{slugify(form.title) || '...'}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Description <span className="text-muted-foreground/60">(optional)</span>
            </Label>
            {/* Label row */}
            <Input
              placeholder="Label, e.g. Deliverables:"
              value={form.bullets_label}
              onChange={(e) => set('bullets_label', e.target.value)}
            />
            {/* Bullet rows */}
            {([1, 2, 3] as const).map((n) => {
              const key = `bullet_${n}` as keyof DocFormState
              return (
                <div key={n} className="flex items-center gap-2">
                  <span className={cn(
                    'flex size-4 shrink-0 items-center justify-center rounded-full text-background',
                    hasBulletInput ? 'bg-foreground' : 'bg-muted',
                  )}>
                    <Check className="size-2.5" strokeWidth={3} />
                  </span>
                  <Input
                    placeholder={`Bullet ${n}`}
                    value={form[key]}
                    onChange={(e) => set(key, e.target.value)}
                  />
                </div>
              )
            })}
          </div>

          {/* Badges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Top badge <span className="text-muted-foreground/60">(optional)</span>
              </Label>
              <Input
                placeholder="Document"
                value={form.badge_top}
                onChange={(e) => set('badge_top', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Bottom badge <span className="text-muted-foreground/60">(optional)</span>
              </Label>
              <Input
                placeholder="Note"
                value={form.badge_bottom}
                onChange={(e) => set('badge_bottom', e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm">Cancel</Button>
          </DialogClose>
          <Button size="sm" disabled={busy} onClick={handleSubmit}>
            {busy ? (isCreate ? 'Creating...' : 'Saving...') : (isCreate ? 'Create' : 'Save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DocsPage() {
  const [docs, setDocs]                   = useState<Doc[]>([])
  const [loading, setLoading]             = useState(true)
  const [isUnlocked, setIsUnlocked]       = useState(false)
  const [showPassword, setShowPassword]   = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState(false)

  const [showCreate, setShowCreate] = useState(false)
  const [showEdit,   setShowEdit]   = useState(false)
  const [editingDoc, setEditingDoc] = useState<Doc | null>(null)

  useEffect(() => { fetchDocs() }, [])

  async function fetchDocs() {
    setLoading(true)
    const { data, error } = await supabase
      .from('documents')
      .select('id, title, slug, created_at, bullets_label, bullet_1, bullet_2, bullet_3, badge_top, badge_bottom')
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
    setShowCreate(true)
  }

  async function handleDeleteDoc(e: React.MouseEvent, id: number) {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm('Delete this document?')) return
    const { error } = await supabase.from('documents').delete().eq('id', id)
    if (!error) fetchDocs()
  }

  function handleEditClick(e: React.MouseEvent, doc: Doc) {
    e.preventDefault()
    e.stopPropagation()
    setEditingDoc(doc)
    setShowEdit(true)
  }

  const editInitialForm: DocFormState = editingDoc
    ? {
        title:         editingDoc.title,
        bullets_label: editingDoc.bullets_label || '',
        bullet_1:      editingDoc.bullet_1 || '',
        bullet_2:      editingDoc.bullet_2 || '',
        bullet_3:      editingDoc.bullet_3 || '',
        badge_top:     editingDoc.badge_top || '',
        badge_bottom:  editingDoc.badge_bottom || '',
      }
    : EMPTY_FORM

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
              <DocCard
                key={doc.id}
                doc={doc}
                isUnlocked={isUnlocked}
                onDelete={handleDeleteDoc}
                onEdit={handleEditClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      <DocFormModal
        open={showCreate}
        onOpenChange={setShowCreate}
        mode="create"
        initialForm={EMPTY_FORM}
        onSuccess={fetchDocs}
      />

      {/* Edit modal */}
      <DocFormModal
        open={showEdit}
        onOpenChange={setShowEdit}
        mode="edit"
        initialForm={editInitialForm}
        editingId={editingDoc?.id}
        onSuccess={fetchDocs}
      />
    </div>
  )
}
