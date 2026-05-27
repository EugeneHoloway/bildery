'use client'

import type { Editor } from '@tiptap/core'
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Plus, Trash2, Table2 } from 'lucide-react'
import { ToolBtn } from './EditorToolbar'
import { moveRow, moveColumn } from './tableHelpers'

function Sep() {
  return <div className="mx-1 h-5 w-px bg-border" />
}

export function TableToolbar({ editor }: { editor: Editor }) {
  const c = () => (editor.chain().focus() as any)

  return (
    <div className="mb-3 flex flex-wrap items-center gap-0.5 rounded-[10px] border border-border bg-card p-1.5">

      <span className="select-none px-1.5 text-xs font-semibold text-muted-foreground">Rows</span>

      <ToolBtn onClick={() => moveRow(editor, 'up')} title="Move row up">
        <ArrowUp className="size-3.5" />
      </ToolBtn>
      <ToolBtn onClick={() => moveRow(editor, 'down')} title="Move row down">
        <ArrowDown className="size-3.5" />
      </ToolBtn>

      <div className="mx-0.5 h-4 w-px bg-border" />

      <ToolBtn onClick={() => c().addRowBefore().run()} title="Insert row above">
        <span className="flex items-center gap-0.5"><Plus className="size-3" /><ArrowUp className="size-3" /></span>
      </ToolBtn>
      <ToolBtn onClick={() => c().addRowAfter().run()} title="Insert row below">
        <span className="flex items-center gap-0.5"><Plus className="size-3" /><ArrowDown className="size-3" /></span>
      </ToolBtn>

      <div className="mx-0.5 h-4 w-px bg-border" />

      <ToolBtn onClick={() => c().deleteRow().run()} title="Delete row">
        <Trash2 className="size-3.5 text-destructive" />
      </ToolBtn>

      <Sep />

      <span className="select-none px-1.5 text-xs font-semibold text-muted-foreground">Cols</span>

      <ToolBtn onClick={() => moveColumn(editor, 'left')} title="Move column left">
        <ArrowLeft className="size-3.5" />
      </ToolBtn>
      <ToolBtn onClick={() => moveColumn(editor, 'right')} title="Move column right">
        <ArrowRight className="size-3.5" />
      </ToolBtn>

      <div className="mx-0.5 h-4 w-px bg-border" />

      <ToolBtn onClick={() => c().addColumnBefore().run()} title="Insert column before">
        <span className="flex items-center gap-0.5"><Plus className="size-3" /><ArrowLeft className="size-3" /></span>
      </ToolBtn>
      <ToolBtn onClick={() => c().addColumnAfter().run()} title="Insert column after">
        <span className="flex items-center gap-0.5"><Plus className="size-3" /><ArrowRight className="size-3" /></span>
      </ToolBtn>

      <div className="mx-0.5 h-4 w-px bg-border" />

      <ToolBtn onClick={() => c().deleteColumn().run()} title="Delete column">
        <Trash2 className="size-3.5 text-destructive" />
      </ToolBtn>

      <Sep />

      <ToolBtn onClick={() => c().toggleHeaderRow().run()} title="Toggle header row">
        <span className="text-xs font-semibold leading-none">H—</span>
      </ToolBtn>
      <ToolBtn onClick={() => c().toggleHeaderColumn().run()} title="Toggle header column">
        <span className="text-xs font-semibold leading-none">H|</span>
      </ToolBtn>

      <Sep />

      <ToolBtn onClick={() => c().deleteTable().run()} title="Delete table">
        <Table2 className="size-3.5 text-destructive" />
      </ToolBtn>

    </div>
  )
}
