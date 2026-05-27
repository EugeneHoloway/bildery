'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { EditorContent } from '@tiptap/react'
import { DragHandle } from '@tiptap/extension-drag-handle-react'
import { Lock, Unlock, GripVertical } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDocEditor } from './useDocEditor'
import { EditorToolbar } from './EditorToolbar'
import { TableToolbar } from './TableToolbar'

const PASSWORD = process.env.NEXT_PUBLIC_TODO_PASSWORD

interface Doc {
  id: number
  title: string
  slug: string
  content: string
  created_at: string
}

function debounce<T extends (...args: Parameters<T>) => void>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

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
  const [inTable, setInTable]             = useState(false)

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

  const editor = useDocEditor({ isUnlocked, onUpdate: autoSave })

  useEffect(() => {
    if (!editor) return
    const update = () => setInTable(editor.isActive('table'))
    editor.on('transaction', update)
    return () => { editor.off('transaction', update) }
  }, [editor])

  useEffect(() => { fetchDoc() }, [slug])

  useEffect(() => {
    if (editor && doc) editor.commands.setContent(doc.content || '')
  }, [doc, editor])

  async function fetchDoc() {
    setLoading(true)
    const { data, error } = await supabase
      .from('documents').select('*').eq('slug', slug).single()
    if (error || !data) setNotFound(true)
    else setDoc(data)
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

  if (loading) return (
    <div className="py-10 pb-20">
      <div className="mx-auto max-w-screen-xl px-4">
        <p className="py-4 text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )

  if (notFound) return (
    <div className="py-10 pb-20">
      <div className="mx-auto max-w-screen-xl px-4">
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
      <div className="mx-auto max-w-screen-xl px-4">

        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/docs" className="transition-colors hover:text-foreground">
            Documents
          </Link>
          <span className="text-border">/</span>
          <span className="text-foreground">{doc!.title}</span>
        </nav>

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

        {isUnlocked && editor && <EditorToolbar editor={editor} />}
        {isUnlocked && editor && inTable && <TableToolbar editor={editor} />}

        <div className={cn(
          'relative min-h-[400px] rounded-xl border border-border bg-card p-6',
          isUnlocked && 'border-brand',
        )}>
          {isUnlocked && editor && (
            <DragHandle editor={editor}>
              <div className="flex h-6 w-5 cursor-grab items-center justify-center rounded hover:bg-muted active:cursor-grabbing">
                <GripVertical className="size-4 text-muted-foreground" />
              </div>
            </DragHandle>
          )}
          <EditorContent editor={editor} />
          {!isUnlocked && !doc!.content && (
            <p className="text-sm text-muted-foreground">This document is empty.</p>
          )}
        </div>

      </div>
    </div>
  )
}
