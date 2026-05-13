'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Lock, Unlock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
    <Button
      variant={active ? 'secondary' : 'ghost'}
      size="sm"
      onClick={onClick}
      title={title}
    >
      {children}
    </Button>
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
    immediatelyRender: false,
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

  if (loading) return (
    <div className="py-10 pb-20">
      <div className="mx-auto max-w-[1240px] px-4">
        <p className="py-4 text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )

  if (notFound) return (
    <div className="py-10 pb-20">
      <div className="mx-auto max-w-[1240px] px-4">
        <p className="py-4 text-sm text-muted-foreground">
          Document not found.{' '}
          <Link href="/docs" className="text-brand underline">
            Back to documents
          </Link>
        </p>
      </div>
    </div>
  )

  return (
    <div className="py-10 pb-20">
      <div className="mx-auto max-w-[1240px] px-4">

        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/docs" className="transition-colors hover:text-foreground">
            Documents
          </Link>
          <span className="text-border">/</span>
          <span className="text-foreground">{doc!.title}</span>
        </nav>

        {/* Header: title + lock */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <h1 className="text-xl font-bold leading-[1.1] tracking-heading">
            {doc!.title}
          </h1>

          <div className="flex shrink-0 items-center gap-2 pt-1">
            {isUnlocked && (
              <span className="text-xs text-muted-foreground">
                {saving ? 'Saving…' : savedAt ? `Saved ${savedAt.toLocaleTimeString()}` : null}
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => isUnlocked ? setIsUnlocked(false) : setShowPassword((v) => !v)}
              aria-label={isUnlocked ? 'Lock' : 'Unlock to edit'}
            >
              {isUnlocked ? <Unlock className="size-4" /> : <Lock className="size-4" />}
            </Button>
          </div>
        </div>

        {/* Password input */}
        {showPassword && !isUnlocked && (
          <div className="mb-6 flex gap-2">
            <Input
              className={cn('flex-1', passwordError && 'aria-invalid:border-destructive')}
              aria-invalid={passwordError || undefined}
              type="password"
              placeholder="Enter password to edit"
              value={passwordInput}
              onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false) }}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              autoFocus
            />
            <Button onClick={handleUnlock}>Unlock</Button>
          </div>
        )}

        {/* Toolbar — only when unlocked */}
        {isUnlocked && editor && (
          <div className="mb-4 flex flex-wrap items-center gap-1 rounded-[10px] border border-border bg-card p-2">
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

            <div className="mx-1 h-5 w-px bg-border" />

            <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Undo">↩</ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Redo">↪</ToolBtn>
          </div>
        )}

        {/* Editor content area */}
        <div
          className={cn(
            'min-h-[400px] rounded-xl border border-border bg-card p-6',
            isUnlocked && 'border-brand',
          )}
        >
          <EditorContent editor={editor} />
          {!isUnlocked && !doc!.content && (
            <p className="text-sm text-muted-foreground">This document is empty.</p>
          )}
        </div>

      </div>
    </div>
  )
}
