'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ChevronRight, CreditCard, GripVertical, ListPlus, Plus, Trash2, TriangleAlert, Workflow } from 'lucide-react'
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'sonner'
import { useAuth } from '@/components/AuthProvider'
import { DashboardHeader } from '@/components/DashboardHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import {
  commitDepositMethod,
  DEPOSIT_FLOWS,
  DEPOSIT_KIND_LABEL,
  DEPOSIT_METHODS,
  DEPOSIT_METHODS_HREF,
  DEPOSIT_PROVIDERS,
  depositMethodName,
  MAX_DEPOSIT_OPTIONS,
  newDepositOption,
  sanitizeAmount,
  methodSuggestions,
  optionSuggestions,
  validateLimits,
  type DepositKind,
  type DepositLimits,
  type DepositMethod,
  type DepositOption,
} from '../../_lib/deposit-methods'
import { SectionActions, useSaveable } from '../../_lib/section'
import { IconFields, TranslationKeyField } from './_components/fields'

function SectionTitle({ title, description, aside }: { title: string; description: string; aside?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-base font-medium">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {aside && <div className="flex shrink-0 items-center gap-3">{aside}</div>}
    </div>
  )
}

// The same switch + label pair in the page header, option cards and Amount step
function EnabledSwitch({ id, checked, onCheckedChange }: { id: string; checked: boolean; onCheckedChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <Label htmlFor={id} className="font-normal text-muted-foreground">Enabled</Label>
    </div>
  )
}

const LIMIT_FIELDS: { key: keyof DepositLimits; label: string }[] = [
  { key: 'depositMin', label: 'Deposit min' },
  { key: 'depositMax', label: 'Deposit max' },
  { key: 'withdrawalMin', label: 'Withdrawal min' },
  { key: 'withdrawalMax', label: 'Withdrawal max' },
]

function optionLabel(index: number) {
  return `Option ${index + 1}`
}

// Compact sortable row; the option's fields live in OptionDrawer
function OptionRow({ kind, option, index, incomplete, onToggle, onEdit, onRemove }: {
  kind: DepositKind
  option: DepositOption
  index: number
  /** Only true after a save attempt, like the other required-field errors */
  incomplete: boolean
  onToggle: (enabled: boolean) => void
  onEdit: () => void
  onRemove: () => void
}) {
  const label = optionLabel(index)
  const flow = DEPOSIT_FLOWS[kind].find(f => f.id === option.flow)?.label
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: option.id })

  return (
    <li
      ref={setNodeRef}
      // Позиция элемента во время перетаскивания -- единственный оправданный inline-style
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('relative flex items-center gap-1 bg-background px-2 py-1.5 transition-colors has-[[data-row-link]:hover]:bg-foreground/5', isDragging && 'z-10 opacity-80 shadow-md')}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        className="relative z-10 shrink-0 cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
        aria-label={`Reorder ${label}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical />
      </Button>
      {/* Like shadcn Item: the button stretches over the whole row (after:), the toggle and delete sit above it */}
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${label}`}
        aria-invalid={incomplete || undefined}
        data-row-link
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1.5 py-1 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 after:absolute after:inset-0 after:content-['']"
      >
        <span className="min-w-0 flex-1">
          <span className={cn('block text-sm font-medium', !option.enabled && 'text-muted-foreground')}>{label}</span>
          <span className="block truncate text-xs text-muted-foreground">Flow: {flow ?? 'not set'}</span>
        </span>
        {incomplete && <Badge variant="destructive">Incomplete</Badge>}
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </button>
      <Switch
        checked={option.enabled}
        onCheckedChange={onToggle}
        aria-label={`${option.enabled ? 'Disable' : 'Enable'} ${label}`}
        className="relative mx-2"
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="relative" aria-label={`Remove ${label}`} onClick={onRemove}>
            <Trash2 className="text-muted-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Remove option</TooltipContent>
      </Tooltip>
    </li>
  )
}

// Side drawer (shadcn Sheet: same Radix as the selects inside it, unlike vaul's Drawer) with one option's fields; edits go straight into the page draft
function OptionSheet({ kind, option, index, open, showErrors, onOpenChange, onChange }: {
  kind: DepositKind
  /** Kept while the drawer animates out, so its content doesn't blank mid-transition */
  option: DepositOption | null
  index: number
  open: boolean
  showErrors: boolean
  onOpenChange: (open: boolean) => void
  onChange: (next: DepositOption) => void
}) {
  const id = option ? `option-${option.id}` : 'option'
  const flow = option ? DEPOSIT_FLOWS[kind].find(f => f.id === option.flow) : undefined
  const flowError = showErrors && option && !option.flow ? 'Flow is required' : undefined
  const titleError = showErrors && option && !option.title ? 'Title is required' : undefined

  return (
    <Sheet open={open && !!option} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 data-[side=right]:sm:max-w-md">
        {option && (
          <>
            <SheetHeader className="border-b border-border">
              <SheetTitle>{optionLabel(index)}</SheetTitle>
              <SheetDescription>Changes apply to the page draft. Save the page to publish them.</SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-4">
              <FieldGroup>
                <Field data-invalid={!!flowError || undefined}>
                  <FieldLabel htmlFor={`${id}-flow`}>Flow</FieldLabel>
                  <Select value={option.flow ?? ''} onValueChange={flow => onChange({ ...option, flow })}>
                    <SelectTrigger id={`${id}-flow`} className="w-full" aria-invalid={!!flowError || undefined}>
                      <span className="flex min-w-0 items-center gap-1.5">
                        <Workflow className="text-muted-foreground" />
                        <SelectValue placeholder="Select flow…" />
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {DEPOSIT_FLOWS[kind].map(f => (
                        <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {flow?.implemented === false && (
                    <p className="flex gap-1.5 text-sm text-destructive">
                      <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                      This flow is not implemented on the website yet -- players who tap the row see a &quot;not available yet&quot; notice.
                    </p>
                  )}
                  <FieldError>{flowError}</FieldError>
                </Field>
                <TranslationKeyField
                  id={`${id}-title`}
                  label="Title"
                  value={option.title}
                  onChange={title => onChange({ ...option, title })}
                  error={titleError}
                  suggested={optionSuggestions(kind, option.flow).title}
                />
                <TranslationKeyField
                  id={`${id}-subtitle`}
                  label="Subtitle"
                  value={option.subtitle}
                  onChange={subtitle => onChange({ ...option, subtitle })}
                  suggested={optionSuggestions(kind, option.flow).subtitle}
                />
                <IconFields id={id} value={option.icon} onChange={icon => onChange({ ...option, icon })} />
              </FieldGroup>
            </div>
            <SheetFooter className="border-t border-border">
              <SheetClose asChild>
                <Button>Done</Button>
              </SheetClose>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function DepositMethodForm({ initial }: { initial: DepositMethod }) {
  const [method, setMethod] = useState(initial)
  // Required-field errors stay hidden until the first save attempt, so a new option isn't born red
  const [showErrors, setShowErrors] = useState(false)
  // Option whose drawer is open; the id stays set while the drawer animates out
  const [editing, setEditing] = useState<{ id: string; open: boolean } | null>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const { dirty, saving, save, reset, baseline } = useSaveable(method, setMethod, commitDepositMethod)

  const kindLabel = DEPOSIT_KIND_LABEL[method.kind]
  const providers = DEPOSIT_PROVIDERS[method.kind]
  // With no providers configured there is nothing to pick, so it can't block saving the rest
  const providerRequired = providers.length > 0
  const providerError = showErrors && providerRequired && !method.mainProvider ? 'Main provider is required' : undefined
  const titleError = showErrors && !method.title ? 'Title is required' : undefined
  const amountStepTitleMissing = method.amountStep.enabled && !method.amountStep.title
  const amountStepTitleError = showErrors && amountStepTitleMissing ? 'Title is required while the step is on' : undefined
  const limitErrors = validateLimits(method.limits)
  const valid =
    (!providerRequired || !!method.mainProvider) &&
    !!method.title &&
    !amountStepTitleMissing &&
    Object.keys(limitErrors).length === 0 &&
    method.options.every(o => o.flow && o.title)
  const canAddOption = method.options.length < MAX_DEPOSIT_OPTIONS
  const editingIndex = editing ? method.options.findIndex(o => o.id === editing.id) : -1
  const editingOption = editingIndex === -1 ? null : method.options[editingIndex]

  function set<K extends keyof DepositMethod>(key: K, value: DepositMethod[K]) {
    setMethod(m => ({ ...m, [key]: value }))
  }

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

  function setOption(id: string, next: DepositOption) {
    setMethod(m => ({ ...m, options: m.options.map(o => (o.id === id ? next : o)) }))
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    setMethod(m => ({
      ...m,
      options: arrayMove(m.options, m.options.findIndex(o => o.id === active.id), m.options.findIndex(o => o.id === over.id)),
    }))
  }

  const addOptionButton = (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* span keeps the tooltip working while the button is disabled */}
        <span className="w-fit">
          <Button
            variant="outline"
            size="sm"
            disabled={!canAddOption}
            onClick={() => {
              const option = newDepositOption()
              set('options', [...method.options, option])
              setEditing({ id: option.id, open: true })
            }}
          >
            <Plus data-icon="inline-start" />
            Add option
          </Button>
        </span>
      </TooltipTrigger>
      {!canAddOption && <TooltipContent>Up to {MAX_DEPOSIT_OPTIONS} options per block</TooltipContent>}
    </Tooltip>
  )

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Saved title, not the draft: the heading stays put while the Title key is being changed */}
        <h1 className="text-2xl font-semibold">{depositMethodName(baseline)}</h1>
        <EnabledSwitch id="method-enabled" checked={method.enabled} onCheckedChange={enabled => set('enabled', enabled)} />
      </div>

      <div ref={formRef} className="mt-8 flex flex-col gap-10">
        <section className="flex flex-col gap-5">
          <SectionTitle title="Block" description="How the block looks in the deposit modal and which provider it opens." />
          <FieldGroup>
            <Field data-invalid={!!providerError || undefined}>
              <FieldLabel htmlFor="main-provider">Main provider</FieldLabel>
              <Select value={method.mainProvider ?? ''} onValueChange={v => set('mainProvider', v)} disabled={!providerRequired}>
                <SelectTrigger id="main-provider" className="w-full" aria-invalid={!!providerError || undefined}>
                  <SelectValue placeholder={providerRequired ? 'Select provider…' : `No ${kindLabel} providers configured`} />
                </SelectTrigger>
                <SelectContent>
                  {providers.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {providerRequired ? (
                <FieldDescription>
                  The block opens the deposit with this provider. Only {kindLabel} providers are listed.
                </FieldDescription>
              ) : (
                <p className="flex gap-1.5 text-sm text-destructive">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                  No {kindLabel} providers are configured for this brand. Add one on the Payments · Providers page, then pick it here.
                </p>
              )}
              <FieldError>{providerError}</FieldError>
            </Field>
            <TranslationKeyField
              id="method-title"
              label="Title"
              value={method.title}
              onChange={v => set('title', v)}
              error={titleError}
              suggested={methodSuggestions(method.kind).title}
            />
            <TranslationKeyField
              id="method-subtitle"
              label="Subtitle"
              value={method.subtitle}
              onChange={v => set('subtitle', v)}
              suggested={methodSuggestions(method.kind).subtitle}
            />
            <IconFields id="method-icon" value={method.icon} onChange={v => set('icon', v)} />
          </FieldGroup>
        </section>

        <section className="flex flex-col gap-5">
          <SectionTitle
            title="Limits"
            description="Deposit limits apply to the amount step, withdrawal limits to the withdrawal form. Empty means no limit."
          />
          <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
            {LIMIT_FIELDS.map(f => {
              const error = limitErrors[f.key]
              return (
                <Field key={f.key} data-invalid={!!error || undefined}>
                  <FieldLabel htmlFor={`limit-${f.key}`}>{f.label}</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>€</InputGroupAddon>
                    <InputGroupInput
                      id={`limit-${f.key}`}
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder="no limit"
                      value={method.limits[f.key]}
                      onChange={e => {
                        const next = sanitizeAmount(e.target.value)
                        if (next !== null) set('limits', { ...method.limits, [f.key]: next })
                      }}
                      aria-invalid={!!error || undefined}
                      className="tabular-nums"
                    />
                  </InputGroup>
                  <FieldError>{error}</FieldError>
                </Field>
              )
            })}
          </div>
        </section>

        <section className="flex flex-col gap-5">
          <SectionTitle
            title="Options"
            description="Ways to deposit inside this block, shown to players in this order. Drag to reorder."
            aside={
              <>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {method.options.length}/{MAX_DEPOSIT_OPTIONS}
                </span>
                {method.options.length > 0 && addOptionButton}
              </>
            }
          />
          {method.options.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-8 text-center">
              <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                <ListPlus className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No options yet. The block opens the Main provider directly.</p>
              {addOptionButton}
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={method.options.map(o => o.id)} strategy={verticalListSortingStrategy}>
                <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
                  {method.options.map((option, index) => (
                    <OptionRow
                      key={option.id}
                      kind={method.kind}
                      option={option}
                      index={index}
                      incomplete={showErrors && (!option.flow || !option.title)}
                      onToggle={enabled => setOption(option.id, { ...option, enabled })}
                      onEdit={() => setEditing({ id: option.id, open: true })}
                      onRemove={() => set('options', method.options.filter(o => o.id !== option.id))}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
        </section>

        <section className="flex flex-col gap-5">
          <SectionTitle
            title="Amount step"
            description="An amount input before the deposit is created, checked against the deposit limits."
            aside={
              <EnabledSwitch
                id="amount-step-enabled"
                checked={method.amountStep.enabled}
                onCheckedChange={enabled => set('amountStep', { ...method.amountStep, enabled })}
              />
            }
          />
          <FieldGroup>
            <TranslationKeyField
              id="amount-step-title"
              label="Title"
              value={method.amountStep.title}
              onChange={title => set('amountStep', { ...method.amountStep, title })}
              error={amountStepTitleError}
            />
            <TranslationKeyField
              id="amount-step-subtitle"
              label="Subtitle"
              value={method.amountStep.subtitle}
              onChange={subtitle => set('amountStep', { ...method.amountStep, subtitle })}
            />
          </FieldGroup>
        </section>
      </div>

      <OptionSheet
        kind={method.kind}
        option={editingOption}
        index={editingIndex}
        open={!!editing?.open}
        showErrors={showErrors}
        onOpenChange={open => setEditing(e => (e ? { ...e, open } : e))}
        onChange={next => setOption(next.id, next)}
      />

      <SectionActions dirty={dirty} saving={saving} onSave={trySave} onReset={reset} />
    </>
  )
}

/** Single deposit method page. Mock: reads DEPOSIT_METHODS by id, saves locally. */
export default function DepositMethodPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const method = DEPOSIT_METHODS.find(m => m.id === id) ?? null
  const title = method ? depositMethodName(method) : 'Method not found'

  useEffect(() => {
    if (!loading && !user) router.replace('/')
  }, [user, loading, router])

  if (!loading && !user) return null

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: 'Bildery', href: '/dashboard' },
          { label: 'CMS', href: '/brand-settings' },
          { label: 'Brand Settings', href: '/brand-settings' },
          { label: 'Deposit methods', href: DEPOSIT_METHODS_HREF },
          { label: title },
        ]}
      />
      <div className="flex flex-1 flex-col px-6 pt-4 pb-8">
        <Button variant="ghost" size="sm" className="-ml-2 mb-4 w-fit text-muted-foreground" asChild>
          <Link href={DEPOSIT_METHODS_HREF}>
            <ArrowLeft data-icon="inline-start" />
            Deposit methods
          </Link>
        </Button>

        <div className="max-w-3xl">
          {loading ? (
            <div aria-busy="true" aria-label="Loading method">
              <Skeleton className="h-8 w-56" />
              <div className="mt-8 flex flex-col gap-5">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </div>
            </div>
          ) : !method ? (
            <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-8 text-center">
              <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                <CreditCard className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">This method does not exist or has not been saved yet.</p>
              <Button variant="outline" size="sm" asChild>
                <Link href={DEPOSIT_METHODS_HREF}>Back to deposit methods</Link>
              </Button>
            </div>
          ) : (
            <DepositMethodForm key={method.id} initial={method} />
          )}
        </div>
      </div>
    </>
  )
}
