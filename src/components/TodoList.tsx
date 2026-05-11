'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { GripVertical, Pencil, Trash2, Check, X, Lock, LockOpen } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'

const PASSWORD = process.env.NEXT_PUBLIC_TODO_PASSWORD

// ── Types ─────────────────────────────────────────────────────────────────────

interface Todo {
  id: number
  text: string
  project: string | null
  is_done: boolean
  order: number | null
  created_at: string
}

// ── SortableTodoItem ──────────────────────────────────────────────────────────

interface ItemProps {
  todo: Todo
  isUnlocked: boolean
  onToggle: (todo: Todo) => void
  onEdit: (todo: Todo) => void
  onDelete: (id: number) => void
  editingId: number | null
  editText: string
  setEditText: (v: string) => void
  editProject: string
  setEditProject: (v: string) => void
  onSaveEdit: (id: number) => void
  onCancelEdit: () => void
}

function SortableTodoItem({
  todo, isUnlocked, onToggle, onEdit, onDelete,
  editingId, editText, setEditText, editProject, setEditProject,
  onSaveEdit, onCancelEdit,
}: ItemProps) {
  const isEditing = editingId === todo.id

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: todo.id, disabled: !isUnlocked })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 py-[10px] border-b border-border last:border-b-0',
        todo.is_done && 'opacity-50',
      )}
    >
      {/* Drag handle */}
      {isUnlocked && (
        <button
          className="shrink-0 w-6 h-6 flex items-center justify-center text-border hover:text-muted-foreground transition-colors cursor-grab active:cursor-grabbing touch-none"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-3.5" />
        </button>
      )}

      {/* Checkbox */}
      <Checkbox
        checked={todo.is_done}
        onCheckedChange={() => onToggle(todo)}
        aria-label={todo.is_done ? 'Mark as undone' : 'Mark as done'}
        className="shrink-0"
      />

      {/* Body: text / edit inputs */}
      <div className="flex-1 flex items-center gap-2 flex-wrap">
        {isEditing ? (
          <>
            <input
              className="flex-1 px-[6px] py-[2px] border border-brand rounded bg-brand-bg text-sm outline-none"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSaveEdit(todo.id)
                if (e.key === 'Escape') onCancelEdit()
              }}
              autoFocus
            />
            <input
              className="flex-1 min-w-[80px] px-[6px] py-[2px] border border-brand rounded bg-brand-bg text-sm outline-none"
              value={editProject}
              onChange={(e) => setEditProject(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSaveEdit(todo.id)
                if (e.key === 'Escape') onCancelEdit()
              }}
              placeholder="Project"
            />
          </>
        ) : (
          <>
            <span
              className={cn(
                'text-sm text-foreground',
                todo.is_done && 'line-through',
              )}
            >
              {todo.text}
            </span>
            {todo.project && (
              <Badge variant="secondary" className="px-2">
                {todo.project}
              </Badge>
            )}
          </>
        )}
      </div>

      {/* Action buttons — normal mode */}
      {isUnlocked && !isEditing && (
        <div className="flex gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(todo)}
            aria-label="Edit"
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="hover:bg-destructive-bg hover:text-destructive"
            onClick={() => onDelete(todo.id)}
            aria-label="Delete"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      )}

      {/* Action buttons — edit mode */}
      {isUnlocked && isEditing && (
        <div className="flex gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon-sm"
            className="hover:bg-success-bg hover:text-success"
            onClick={() => onSaveEdit(todo.id)}
            aria-label="Save"
          >
            <Check className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onCancelEdit}
            aria-label="Cancel"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  )
}

// ── TodoList ──────────────────────────────────────────────────────────────────

export function TodoList() {
  const [todos, setTodos]                 = useState<Todo[]>([])
  const [loading, setLoading]             = useState(true)
  const [isUnlocked, setIsUnlocked]       = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [showPassword, setShowPassword]   = useState(false)
  const [newText, setNewText]             = useState('')
  const [newProject, setNewProject]       = useState('')
  const [adding, setAdding]               = useState(false)
  const [editingId, setEditingId]         = useState<number | null>(null)
  const [editText, setEditText]           = useState('')
  const [editProject, setEditProject]     = useState('')

  const sensors = useSensors(useSensor(PointerSensor))

  useEffect(() => { fetchTodos() }, [])

  async function fetchTodos() {
    setLoading(true)
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('order', { ascending: true })
      .order('created_at', { ascending: false })
    if (!error) setTodos(data || [])
    setLoading(false)
  }

  async function toggleDone(todo: Todo) {
    if (!isUnlocked) return
    const { error } = await supabase
      .from('todos')
      .update({ is_done: !todo.is_done })
      .eq('id', todo.id)
    if (!error) fetchTodos()
  }

  async function addTodo() {
    if (!newText.trim()) return
    setAdding(true)
    const maxOrder = todos.length > 0 ? Math.max(...todos.map((t) => t.order ?? 0)) : 0
    const { error } = await supabase
      .from('todos')
      .insert({ text: newText.trim(), project: newProject.trim() || 'Bildery', order: maxOrder + 1 })
    if (!error) { setNewText(''); setNewProject(''); fetchTodos() }
    setAdding(false)
  }

  async function deleteTodo(id: number) {
    const { error } = await supabase.from('todos').delete().eq('id', id)
    if (!error) fetchTodos()
  }

  function startEdit(todo: Todo) {
    setEditingId(todo.id)
    setEditText(todo.text)
    setEditProject(todo.project || '')
  }

  async function saveEdit(id: number) {
    if (!editText.trim()) { cancelEdit(); return }
    const { error } = await supabase
      .from('todos')
      .update({ text: editText.trim(), project: editProject.trim() || 'Bildery' })
      .eq('id', id)
    if (!error) { setEditingId(null); fetchTodos() }
  }

  function cancelEdit() { setEditingId(null); setEditText(''); setEditProject('') }

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

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = todos.findIndex((t) => t.id === active.id)
    const newIndex = todos.findIndex((t) => t.id === over.id)
    const newTodos = arrayMove(todos, oldIndex, newIndex)
    setTodos(newTodos)

    const updates = newTodos.map((todo, index) => ({ id: todo.id, order: index }))
    for (const update of updates) {
      await supabase.from('todos').update({ order: update.order }).eq('id', update.id)
    }
  }

  const open = todos.filter((t) => !t.is_done)
  const done = todos.filter((t) => t.is_done)

  const commonProps = {
    isUnlocked, onToggle: toggleDone, onEdit: startEdit, onDelete: deleteTodo,
    editingId, editText, setEditText, editProject, setEditProject,
    onSaveEdit: saveEdit, onCancelEdit: cancelEdit,
  }

  const inputCls = 'px-3 py-2 border border-border rounded-lg text-base tablet:text-sm outline-none transition-colors duration-150 focus:border-brand bg-background'
  const btnCls   = 'px-4 py-2 bg-foreground text-background rounded-lg text-sm font-semibold cursor-pointer transition-opacity hover:opacity-85'

  return (
    <>
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold tracking-heading">To-Dos</h2>
          <div className="flex gap-[6px]">
            <Badge variant="secondary" className="px-2">
              {open.length} open
            </Badge>
            {done.length > 0 && (
              <Badge variant="outline" className="px-2 text-muted-foreground border-border bg-transparent">
                {done.length} done
              </Badge>
            )}
          </div>
        </div>

        {/* Lock / Unlock */}
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => {
            if (isUnlocked) { setIsUnlocked(false); cancelEdit() }
            else setShowPassword((v) => !v)
          }}
          aria-label={isUnlocked ? 'Lock' : 'Unlock'}
        >
          {isUnlocked ? <LockOpen className="size-4" /> : <Lock className="size-4" />}
        </Button>
      </div>

      {/* Password input */}
      {showPassword && !isUnlocked && (
        <div className="flex gap-2 mb-4">
          <input
            className={cn(inputCls, 'flex-1 min-w-0', passwordError && 'border-destructive')}
            type="password"
            placeholder="Enter password"
            value={passwordInput}
            onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false) }}
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            autoFocus
          />
          <button className={cn(btnCls, 'shrink-0')} onClick={handleUnlock}>Unlock</button>
        </div>
      )}

      {/* Add todo form */}
      {isUnlocked && (
        <div className="flex gap-2 mb-5 flex-wrap">
          <input
            className={cn(inputCls, 'flex-[2] min-w-[180px]')}
            type="text"
            placeholder="New task..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          />
          <input
            className={cn(inputCls, 'flex-1 min-w-[120px]')}
            type="text"
            placeholder="Project (optional)"
            value={newProject}
            onChange={(e) => setNewProject(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          />
          <button
            className={cn(btnCls, 'disabled:opacity-40 disabled:cursor-not-allowed')}
            onClick={addTodo}
            disabled={adding || !newText.trim()}
          >
            Add
          </button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <p className="text-sm text-muted-foreground py-4">Loading...</p>
      ) : todos.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No tasks yet.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="flex flex-col">
            <SortableContext items={open.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              {open.map((todo) => (
                <SortableTodoItem key={todo.id} todo={todo} {...commonProps} />
              ))}
            </SortableContext>

            {open.length > 0 && done.length > 0 && (
              <div className="flex items-center gap-3 py-3 text-xs font-semibold text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                <span>{done.length} Completed</span>
                <div className="h-px flex-1 bg-border" />
              </div>
            )}

            <SortableContext items={done.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              {done.map((todo) => (
                <SortableTodoItem key={todo.id} todo={todo} {...commonProps} />
              ))}
            </SortableContext>
          </div>
        </DndContext>
      )}
    </>
  )
}
