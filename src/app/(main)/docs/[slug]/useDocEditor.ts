'use client'

import { useEffect, useRef } from 'react'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'

interface Options {
  isUnlocked: boolean
  onUpdate: (html: string) => void
}

export function useDocEditor({ isUnlocked, onUpdate }: Options) {
  const isUnlockedRef = useRef(isUnlocked)
  const onUpdateRef   = useRef(onUpdate)

  useEffect(() => { isUnlockedRef.current = isUnlocked }, [isUnlocked])
  useEffect(() => { onUpdateRef.current   = onUpdate   }, [onUpdate])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: '',
    // Must initialize as editable=true so the columnResizing plugin is registered.
    // The useEffect below immediately syncs the real editable state.
    editable: true,
    injectCSS: false,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (isUnlockedRef.current) onUpdateRef.current(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor) editor.setEditable(isUnlocked)
  }, [isUnlocked, editor])

  return editor
}
