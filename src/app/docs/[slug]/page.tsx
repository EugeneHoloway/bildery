'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const PASSWORD = process.env.NEXT_PUBLIC_TODO_PASSWORD

// ── Types ─────────────────────────────────────────────────────────────────────

interface Doc {
  id: number
  title: string
  slug: string
  content: string
  created_at: string
}

// ── Debounce ──────────────────────────────────────────────────────────────────

function debounce<T extends (...args: Parameters<T>) => void>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// ── Icons ─────────────────────────────────────────────────────────────────────

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

// ── Toolbar button ────────────────────────────────────────────────────────────

function ToolBtn({
  active, onClick, title, children,
}: {
  active?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      className={cn(
        'px-[10px] py-1 rounded-md text-[0.8rem] font-semibold cursor-pointer transition-colors duration-150',
        active
          ? 'bg-foreground text-background'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DocEditorPage() {
  const { slug } = useParams<{ slug: string }>()

  const [doc, setDoc]                     = useState<Doc | null>(null)
  const [loading, setLoading]             = useState(true)
  const [notFound, setNotFound]           = useState(false)
  const [isUnlocked, setIsUnlocked]       = useState(false)
  const [showPassword, setShowPassword]   = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [saving, setSaving]               = useState(false)
  const [savedAt, setSavedAt]             = useState<Date | null>(null)

  // Keep a ref so the TipTap onUpdate callback never gets a stale closure
  const isUnlockedRef = useRef(false)
  useEffect(() => { isUnlockedRef.current = isUnlocked }, [isUnlocked])

  // ── Editor ────────────────────────────────────────────────────────────────

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editable: false,
    immediatelyRender: false, // required in Next.js to avoid SSR hydration mismatch
    onUpdate: ({ editor }) => {
      if (isUnlockedRef.current) autoSave(editor.getHTML())
    },
  })

  // ── Data fetching ─────────────────────────────────────────────────────────

  useEffect(() => { fetchDoc() }, [slug])

  useEffect(() => {
    if (editor && doc) editor.commands.setContent(doc.content || '')
  }, [doc, editor])

  useEffect(() => {
    if (editor) editor.setEditable(isUnlocked)
  }, [isUnlocked, editor])

  async function fetchDoc() {
    setLoading(true)
    const { data, error } = await supabase
      .from('documents').select('*').eq('slug', slug).single()
    if (error || !data) setNotFound(true)
    else setDoc(data)
    setLoading(false)
  }

  // ── Auto-save (debounced 1 s) ─────────────────────────────────────────────

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const autoSave = useCallback(
    debounce(async (html: string) => {
      if (!doc) return
      setSaving(true)
      const { error } = await supabase
        .from('documents').update({ content: html }).eq('id', doc.id)
      if (!error) setSavedAt(new Date())
      setSaving(false)
    }, 1000),
    [doc],
  )

  // ── Password ──────────────────────────────────────────────────────────────

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

  // ── Render states ─────────────────────────────────────────────────────────

  const inputCls = 'px-3 py-2 border border-border rounded-lg text-sm outline-none transition-colors duration-150 focus:border-[#6366f1] bg-background'
  const btnCls   = 'px-4 py-2 bg-foreground text-background rounded-lg text-sm font-semibold cursor-pointer transition-opacity hover:opacity-85'

  if (loading) return (
    <div className="py-10 pb-20">
      <div className="mx-auto max-w-[1240px] px-4 tablet:px-4">
        <p className="text-sm text-muted-foreground py-4">Loading...</p>
      </div>
    </div>
  )

  if (notFound) return (
    <div className="py-10 pb-20">
      <div className="mx-auto max-w-[1240px] px-4 tablet:px-4">
        <p className="text-sm text-muted-foreground py-4">
          Document not found.{' '}
          <Link href="/docs" className="text-[#6366f1] underline">
            Back to documents
          </Link>
        </p>
      </div>
    </div>
  )

  return (
    <div className="py-10 pb-20">
      <div className="mx-auto max-w-[1240px] px-4 tablet:px-4">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
            Documents
          </Link>
          <span className="text-border">/</span>
          <span className="text-foreground">{doc!.title}</span>
        </nav>

        {/* Header: title + lock */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <h1 className="text-[2rem] font-bold tracking-[-0.03em] leading-[1.1]">
            {doc!.title}
          </h1>

          <div className="flex items-center gap-2 shrink-0 pt-1">
            {isUnlocked && (
              <span className="text-xs text-muted-foreground">
                {saving ? 'Saving...' : savedAt ? `Saved ${savedAt.toLocaleTimeString()}` : null}
              </span>
            )}
            <button
              className="p-1 rounded-md transition-colors hover:bg-border cursor-pointer"
              onClick={() => isUnlocked ? setIsUnlocked(false) : setShowPassword((v) => !v)}
              aria-label={isUnlocked ? 'Lock' : 'Unlock to edit'}
            >
              {isUnlocked ? <UnlockIcon /> : <LockIcon />}
            </button>
          </div>
        </div>

        {/* Password input */}
        {showPassword && !isUnlocked && (
          <div className="flex gap-2 mb-6">
            <input
              className={cn(inputCls, 'flex-1', passwordError && 'border-[#dc2626]')}
              type="password"
              placeholder="Enter password to edit"
              value={passwordInput}
              onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false) }}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              autoFocus
            />
            <button className={btnCls} onClick={handleUnlock}>Unlock</button>
          </div>
        )}

        {/* Toolbar — only when unlocked */}
        {isUnlocked && editor && (
          <div className="flex flex-wrap items-center gap-1 p-2 border border-border rounded-[10px] bg-card mb-4">
            <ToolBtn active={editor.isActive('bold')}      onClick={() => editor.chain().focus().toggleBold().run()}              title="Bold">
              <strong>B</strong>
            </ToolBtn>
            <ToolBtn active={editor.isActive('italic')}    onClick={() => editor.chain().focus().toggleItalic().run()}            title="Italic">
              <em>I</em>
            </ToolBtn>
            <ToolBtn active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1">
              H1
            </ToolBtn>
            <ToolBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">
              H2
            </ToolBtn>
            <ToolBtn active={editor.isActive('bulletList')}  onClick={() => editor.chain().focus().toggleBulletList().run()}  title="Bullet list">
              • List
            </ToolBtn>
            <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered list">
              1. List
            </ToolBtn>
            <ToolBtn active={editor.isActive('blockquote')}  onClick={() => editor.chain().focus().toggleBlockquote().run()}  title="Blockquote">
              &ldquo; Quote
            </ToolBtn>

            {/* Separator */}
            <div className="w-px h-5 bg-border mx-1" />

            <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Undo">↩</ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Redo">↪</ToolBtn>
          </div>
        )}

        {/* Editor content area */}
        <div
          className={cn(
            'border border-border rounded-xl p-6 min-h-[400px] bg-card',
            isUnlocked && 'border-[#6366f1]',
          )}
        >
          <EditorContent editor={editor} />
          {!isUnlocked && !doc!.content && (
            <p className="text-muted-foreground text-[0.9rem]">This document is empty.</p>
          )}
        </div>

      </div>
    </div>
  )
}
