'use client'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FieldDescription, FieldLegend, FieldSet } from '@/components/ui/field'
import { Kbd } from '@/components/ui/kbd'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

// Sections report their dirty state up to the page so navigation can be guarded,
// and navigate (between sections or to other routes) through the same guard.
// Pages without a guard (e.g. a single banner) fall back to the no-op defaults.
export const SectionContext = createContext<{
  reportDirty: (dirty: boolean) => void
  go: (id: string) => void
  navigate: (href: string) => void
}>({
  reportDirty: () => {},
  go: () => {},
  navigate: () => {},
})

/**
 * Draft/baseline bookkeeping shared by every section: `dirty` compares the
 * current values against the last saved ones, `save` commits them (mock, optionally via `commit`),
 * `reset` restores them, and the page is told about unsaved changes.
 */
export function useSaveable<T extends object>(values: T, apply: (v: T) => void, commit?: (v: T) => void) {
  const [baseline, setBaseline] = useState(values)
  const [saving, setSaving] = useState(false)
  const dirty = JSON.stringify(values) !== JSON.stringify(baseline)
  const { reportDirty } = useContext(SectionContext)

  useEffect(() => {
    reportDirty(dirty)
    return () => reportDirty(false)
  }, [dirty, reportDirty])

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  function reset() {
    apply(baseline)
    toast('Changes discarded')
  }

  function save() {
    setSaving(true)
    setTimeout(() => {
      setBaseline(values)
      commit?.(values)
      setSaving(false)
      toast.success('Changes saved')
    }, 400)
  }

  return { dirty, saving, save, reset, baseline }
}

/**
 * Save with a required-field check, the rule every brand-settings form follows: errors stay hidden
 * until the first failed attempt, then the first invalid field is scrolled into view.
 */
export function useGuardedSave(valid: boolean, save: () => void) {
  const [showErrors, setShowErrors] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  function trySave() {
    if (valid) {
      save()
      return
    }
    setShowErrors(true)
    toast.error('Fill in the required fields to save')
    // After the errors render, bring the first one into view
    requestAnimationFrame(() => {
      formRef.current?.querySelector('[aria-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  return { showErrors, formRef, trySave }
}

export function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      {/* Focus target after section navigation (see BrandSettingsPage) */}
      <h2 tabIndex={-1} className="text-xl font-semibold outline-none">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

/**
 * One titled group inside a section: legend, optional description, then the controls 20px below.
 * Every group of every section goes through here, so they all share one shape.
 */
export function SettingsGroup({ title, description, className, children }: {
  title: React.ReactNode
  description?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    // min-w-0: a fieldset defaults to min-width: min-content, which lets long hosts overflow on phones
    <FieldSet className={cn('min-w-0 gap-5', className)}>
      {/* The rendered legend sits outside the fieldset's flex flow, so gap-5 starts below the description.
          Without one, the legend reads as a label for what follows: 8px, like a field label */}
      <FieldLegend className={description ? 'mb-0.5' : 'mb-2'}>{title}</FieldLegend>
      {description && (
        <FieldDescription className="max-w-2xl [[data-variant=legend]+&]:mt-0">{description}</FieldDescription>
      )}
      {children}
    </FieldSet>
  )
}

export function SectionActions({ dirty, saving, onSave, onReset, canSave = true }: {
  dirty: boolean
  saving: boolean
  onSave: () => void
  onReset: () => void
  canSave?: boolean
}) {
  const [isMac, setIsMac] = useState(false)
  useEffect(() => { setIsMac(/Mac|iPhone|iPad/.test(navigator.platform)) }, [])

  // ⌘S / Ctrl+S saves while there is something to save
  const onSaveRef = useRef(onSave)
  onSaveRef.current = onSave
  const active = dirty && !saving && canSave
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        onSaveRef.current()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])

  if (!dirty) return null
  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky bottom-[calc(--spacing(4)+env(safe-area-inset-bottom))] mt-8 flex items-center justify-between gap-3 rounded-2xl border border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 animate-in fade-in slide-in-from-bottom-2 duration-200 motion-reduce:animate-none"
    >
      <p className="hidden text-sm text-muted-foreground sm:block">You have unsaved changes.</p>
      <div className="flex flex-1 items-center gap-2 sm:flex-none">
        <Button variant="outline" onClick={onReset} disabled={saving} className="flex-1 sm:flex-none">
          Discard
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onSave} disabled={saving || !canSave} className="flex-1 sm:flex-none">
              {saving && <Loader2 className="animate-spin" />}
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </TooltipTrigger>
          <TooltipContent className="flex items-center gap-1.5">
            Save <Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd><Kbd>S</Kbd>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
