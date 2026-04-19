'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { SandboxCard, type SandboxCardData } from '@/components/SandboxCard'
import { cn } from '@/lib/utils'

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

// Lock / Unlock icons
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
  </svg>
)
const UnlockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
)

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

  const inputCls = 'px-3 py-2 border border-border rounded-lg text-sm outline-none transition-colors duration-150 focus:border-[#6366f1] bg-background'
  const btnCls   = 'px-4 py-2 bg-foreground text-background rounded-lg text-sm font-semibold cursor-pointer transition-opacity hover:opacity-85'

  return (
    <div className="py-12 pb-20">
      <div className="mx-auto max-w-[1240px] px-4 tablet:px-4">

        {/* Page header */}
        <div className="mb-10 flex items-start justify-between gap-4">
          <div>
            <h1 className="mb-2 text-[2rem] font-bold tracking-[-0.03em]">Documents</h1>
            <p className="text-base leading-relaxed text-muted-foreground">
              Notes, drafts, and written work.
            </p>
          </div>

          {/* Lock / Unlock */}
          <button
            className="mt-1 p-1 rounded-md transition-colors hover:bg-border cursor-pointer shrink-0"
            onClick={() => isUnlocked ? setIsUnlocked(false) : setShowPassword((v) => !v)}
            aria-label={isUnlocked ? 'Lock' : 'Unlock'}
          >
            {isUnlocked ? <UnlockIcon /> : <LockIcon />}
          </button>
        </div>

        {/* Password input */}
        {showPassword && !isUnlocked && (
          <div className="flex gap-2 mb-6">
            <input
              className={cn(inputCls, 'flex-1', passwordError && 'border-[#dc2626]')}
              type="password"
              placeholder="Enter password to create documents"
              value={passwordInput}
              onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false) }}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              autoFocus
            />
            <button className={btnCls} onClick={handleUnlock}>Unlock</button>
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
                'p-5 rounded-2xl min-h-[120px]',
                'border-[1.5px] border-dashed border-border bg-transparent',
                'cursor-pointer transition-colors duration-200',
                'hover:border-[#6366f1] hover:bg-[#f5f5ff]',
              )}
              onClick={handleNewDocClick}
              aria-label="Create new document"
            >
              <span className="text-2xl text-muted-foreground leading-none">+</span>
              <span className="text-[0.8rem] font-semibold text-muted-foreground tracking-[0.04em]">
                New document
              </span>
            </button>

            {/* Existing docs */}
            {docs.map((doc) => (
              <Link
                key={doc.id}
                href={`/docs/${doc.slug}`}
                className={cn(
                  'relative flex flex-col justify-between gap-6 p-5 rounded-2xl',
                  'bg-card border border-border',
                  'shadow-[0_1px_2px_rgba(16,24,40,0.04)]',
                  'transition-[border-color,box-shadow] duration-200',
                  'hover:border-[#c0c7d0] hover:shadow-[0_4px_16px_rgba(16,24,40,0.08)]',
                )}
              >
                <div className="flex flex-col gap-[10px]">
                  <span className="inline-flex self-start px-[10px] py-[3px] rounded-full border border-border bg-[rgba(99,102,241,0.06)] text-[#6366f1] text-[0.7rem] font-bold tracking-[0.08em] uppercase">
                    Document
                  </span>
                  <h2 className="text-base font-bold leading-[1.3] tracking-[-0.02em]">
                    {doc.title}
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[0.8rem] text-muted-foreground">
                    {formatDate(doc.created_at)}
                  </span>
                  {isUnlocked && (
                    <button
                      className="ml-auto w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-[#fee2e2] hover:text-[#dc2626] transition-colors cursor-pointer"
                      onClick={(e) => handleDeleteDoc(e, doc.id)}
                      aria-label="Delete document"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── New doc modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-6"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-card rounded-2xl p-7 w-full max-w-[440px] shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[1.1rem] font-bold mb-4 tracking-[-0.02em]">
              New document
            </h3>

            <input
              className={cn(
                'w-full px-3 py-[10px] border border-border rounded-lg text-[0.9rem]',
                'outline-none transition-colors mb-2 bg-background',
                'focus:border-[#6366f1]',
                titleError && 'border-[#dc2626]',
              )}
              type="text"
              placeholder="Document title"
              value={newTitle}
              onChange={(e) => { setNewTitle(e.target.value.slice(0, 50)); setTitleError('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateDoc()}
              autoFocus
              maxLength={50}
            />

            {titleError && (
              <p className="text-[0.8rem] text-[#dc2626] mb-2">{titleError}</p>
            )}

            <p className="text-xs text-muted-foreground mb-5">
              {newTitle.length}/50 · URL: /docs/{slugify(newTitle) || '...'}
            </p>

            <div className="flex gap-2 justify-end">
              <button
                className="px-4 py-2 border border-border rounded-lg text-sm cursor-pointer hover:bg-background transition-colors"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className={cn(btnCls, 'disabled:opacity-40 disabled:cursor-not-allowed')}
                onClick={handleCreateDoc}
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
