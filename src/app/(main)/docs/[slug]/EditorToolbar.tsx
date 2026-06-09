'use client'

import type { Editor } from '@tiptap/core'
import { Table2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ToolBtn({
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

export function EditorToolbar({ editor }: { editor: Editor }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-1 rounded-[10px] border border-border bg-card p-2">
      <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
        <strong>B</strong>
      </ToolBtn>
      <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
        <em>I</em>
      </ToolBtn>
      <ToolBtn active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1">
        H1
      </ToolBtn>
      <ToolBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">
        H2
      </ToolBtn>
      <ToolBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">
        • List
      </ToolBtn>
      <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered list">
        1. List
      </ToolBtn>
      <ToolBtn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote">
        &ldquo; Quote
      </ToolBtn>

      <div className="mx-1 h-5 w-px bg-border" />

      <ToolBtn
        onClick={() => (editor.chain().focus() as any).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        title="Insert table"
      >
        <Table2 className="size-4" />
      </ToolBtn>

      <div className="mx-1 h-5 w-px bg-border" />

      <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Undo">↩</ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Redo">↪</ToolBtn>
    </div>
  )
}
