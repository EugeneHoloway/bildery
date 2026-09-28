'use client'
import { useRef, useState } from 'react'
import { ChevronRight, CircleAlert, Eye, GripVertical, Link2, Lock, Menu, Plus, Search, Star, Tag } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldTitle } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { SectionActions, SectionHeader, useGuardedSave, useSaveable } from '../_lib/section'
import { BRAND_COLORS } from '../_lib/theme'
import { validateHref } from '../_lib/validation'
import {
  BAR_ITEM_KIND_LABEL,
  BOTTOM_BAR,
  commitBottomBar,
  ctaIndex,
  findRow,
  groupLabel,
  MAX_PINNED_ITEMS,
  newPinnedItem,
  resolveLabel,
  rowView,
  SIDEBAR,
  type BarItem,
  type BottomBarSettings,
  type FixedBarItem,
  type NavGroup,
} from '../_lib/sidebar'
import { IconFields, TranslationKeyField } from './fields'
import { BlockTitle, HrefFields, RemoveButton, SectionLink, SubTitle } from './nav-shared'
import { DisabledReason, insertAt, LimitCount, toastRemoved } from './list-actions'
import { LIST_ICON, LIST_ICON_FILE, PreviewIcon } from './storefront-preview'

type Update = (update: (s: BottomBarSettings) => BottomBarSettings) => void
type AuthState = 'in' | 'out'

const STRONG = 'font-medium text-foreground'
const FIXED_ICON = { menu: Menu, search: Search } as const

/** A bar item as the website shows it. Pinned rows are resolved against the saved sidebar. */
function itemView(item: BarItem, groups: NavGroup[]) {
  if (item.kind !== 'sidebar') {
    const label = resolveLabel(item.label, BAR_ITEM_KIND_LABEL[item.kind])
    return { label: label.text, missingKey: label.missingKey, iconSrc: item.icon.src, fallbackIcon: FIXED_ICON[item.kind], href: null, group: null, removed: false }
  }
  const found = findRow(groups, item.rowId)
  if (!found) {
    return { label: 'Removed row', missingKey: false, iconSrc: null, fallbackIcon: CircleAlert, href: null, group: null, removed: true }
  }
  const view = rowView(found.row)
  return {
    label: view.label,
    missingKey: view.missingKey,
    iconSrc: view.iconSrc,
    fallbackIcon: found.row.kind === 'category' ? Tag : Link2,
    href: view.href,
    group: groupLabel(found.groupIndex),
    removed: false,
  }
}

function SlotLabel({ text, missingKey, className }: { text: string; missingKey?: boolean; className?: string }) {
  return (
    <span className={cn('max-w-full truncate text-2xs font-semibold text-foreground', missingKey && 'font-mono font-normal text-destructive', className)}>
      {text}
    </span>
  )
}

// The bar as the website renders it, at phone proportions (20px icons, 44px circle, 10px labels);
// Menu, Search and the center button open their settings
function BarPreview({ settings, state, onEditFixed, onEditCta }: {
  settings: BottomBarSettings
  state: AuthState
  onEditFixed: (id: string) => void
  onEditCta: () => void
}) {
  const { items, mainItemId, cta } = settings
  const groups = SIDEBAR.groups
  const main = items.find(i => i.id === mainItemId)
  // The main item takes the center slot, so it leaves the regular ones
  const regular = items.filter(i => i.id !== mainItemId)
  const at = ctaIndex(regular.length)

  const center =
    state === 'in' && main
      ? itemView(main, groups)
      : state === 'in'
        ? { ...resolveLabelView(cta.loggedIn.label, 'Deposit'), iconSrc: cta.loggedIn.icon.src, fallbackIcon: Link2 }
        : { ...resolveLabelView(cta.loggedOut.label, 'Join Now'), iconSrc: cta.loggedOut.icon.src, fallbackIcon: Link2 }

  // The brand's saved palette from Theme is runtime data, so it reaches CSS as variables
  const palette = {
    '--brand-page': BRAND_COLORS.background,
    '--brand-primary': BRAND_COLORS.primary,
    '--brand-primary-foreground': BRAND_COLORS.primaryForeground,
  } as React.CSSProperties

  const slot = (item: BarItem) => {
    const view = itemView(item, groups)
    const content = (
      <>
        <PreviewIcon src={view.iconSrc} fallback={view.fallbackIcon} className={cn('size-5', view.removed && 'text-destructive')} />
        <SlotLabel text={view.label} missingKey={view.missingKey || view.removed} />
      </>
    )
    return item.kind === 'sidebar' ? (
      <div key={item.id} className="flex min-w-0 flex-1 flex-col items-center gap-1 py-1">{content}</div>
    ) : (
      <button
        key={item.id}
        type="button"
        onClick={() => onEditFixed(item.id)}
        aria-label={`Edit ${view.label}`}
        className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg py-1 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {content}
      </button>
    )
  }

  return (
    // Page background above the bar: only the center button shows there, rising over the bar's top border
    <div
      role="group"
      aria-label="Bottom bar preview"
      // Brand palette variables -- the only values here that aren't project tokens
      style={palette}
      className="dark overflow-hidden rounded-2xl bg-(--brand-page) pt-8 text-foreground dark:ring-1 dark:ring-border dark:ring-inset"
    >
      <div className="flex items-end border-t border-border bg-storefront-surface px-2 pt-3 pb-3">
        {regular.slice(0, at).map(slot)}
        <button
          type="button"
          onClick={onEditCta}
          aria-label={`Edit center button: ${center.label}`}
          className="group flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg pb-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="-mt-5 flex size-11 -translate-y-2 items-center justify-center rounded-full bg-(--brand-primary) ring-4 ring-border transition-transform group-hover:scale-105">
            <PreviewIcon src={center.iconSrc} fallback={center.fallbackIcon} className="size-5 text-(--brand-primary-foreground)" />
          </span>
          <SlotLabel text={center.label} missingKey={center.missingKey} className={cn(!center.missingKey && 'text-(--brand-primary)')} />
        </button>
        {regular.slice(at).map(slot)}
      </div>
    </div>
  )
}

// Auth toggle above the bar; the same panel sits in the side column and in the narrow-screen sheet
function PreviewPanel({ settings, state, onStateChange, onEditFixed, onEditCta }: {
  settings: BottomBarSettings
  state: AuthState
  onStateChange: (state: AuthState) => void
  onEditFixed: (id: string) => void
  onEditCta: () => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        spacing={0}
        value={state}
        onValueChange={v => v && onStateChange(v as AuthState)}
        aria-label="Preview as"
        className="w-full"
      >
        <ToggleGroupItem value="in" className="flex-1">Logged in</ToggleGroupItem>
        <ToggleGroupItem value="out" className="flex-1">Logged out</ToggleGroupItem>
      </ToggleGroup>
      <BarPreview settings={settings} state={state} onEditFixed={onEditFixed} onEditCta={onEditCta} />
      <p className="text-xs text-muted-foreground">Updates as you edit. Click Menu, Search or the center button to edit them.</p>
    </div>
  )
}

function resolveLabelView(key: FixedBarItem['label'], fallback: string) {
  const { text, missingKey } = resolveLabel(key, fallback)
  return { label: text, missingKey }
}

function BarItemRow({ item, main, onEdit, onRemove }: {
  item: BarItem
  main: boolean
  onEdit: () => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const view = itemView(item, SIDEBAR.groups)
  const fixed = item.kind !== 'sidebar'

  const media = (
    // Same muted tile and icon tone in every row; the real look is in the bar preview
    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
      <PreviewIcon src={view.iconSrc} fallback={view.fallbackIcon} className={cn(LIST_ICON, view.removed && 'text-destructive')} imgClassName={LIST_ICON_FILE} />
    </span>
  )

  const text = (
    <span className="min-w-0 flex-1">
      <span className="flex min-w-0 items-center gap-2">
        <span className={cn('truncate text-sm font-medium', view.missingKey && 'font-mono text-xs')}>{view.label}</span>
        {fixed && (
          <Badge variant="secondary">
            <Lock data-icon="inline-start" />
            Required
          </Badge>
        )}
        {main && (
          <Badge variant="outline">
            <Star data-icon="inline-start" className="fill-current" />
            Center button
          </Badge>
        )}
      </span>
      <span className="block truncate text-xs text-muted-foreground">
        {fixed
          ? 'Label and icon'
          : view.removed
            ? 'This row no longer exists in the sidebar'
            : `${view.group} · ${view.href || 'No link'}`}
      </span>
    </span>
  )

  return (
    <li
      ref={setNodeRef}
      // Позиция элемента во время перетаскивания -- единственный оправданный inline-style
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'relative flex items-center gap-1 bg-background px-2 py-2 transition-colors has-[[data-row-link]:hover]:bg-muted',
        isDragging && 'z-10 opacity-80 shadow-md'
      )}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        className="relative z-10 shrink-0 cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
        aria-label={`Reorder ${view.label}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical />
      </Button>
      {fixed ? (
        // Like shadcn Item: the button stretches over the whole row (after:), the grip sits above it
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${view.label}`}
          data-row-link
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1.5 py-0.5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 after:absolute after:inset-0 after:content-['']"
        >
          {media}
          {text}
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </button>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3 px-1.5 py-0.5">
          {media}
          {text}
          {view.removed && <Badge variant="destructive">Row removed</Badge>}
        </div>
      )}
      {!fixed && <RemoveButton label={`Unpin ${view.label}`} onClick={onRemove} />}
    </li>
  )
}

// Rows from the saved sidebar that aren't pinned yet, grouped like the drawer
function PinRowButton({ pinnedRowIds, disabledReason, onPin }: {
  pinnedRowIds: Set<string>
  disabledReason?: string
  onPin: (rowId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const groups = SIDEBAR.groups
    .map((g, index) => ({ ...g, label: groupLabel(index), rows: g.rows.filter(r => !pinnedRowIds.has(r.id)) }))
    .filter(g => g.rows.length > 0)
  const reason = disabledReason ?? (groups.length === 0 ? 'Every sidebar row is already pinned' : undefined)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <DisabledReason reason={reason}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" disabled={!!reason}>
            <Plus data-icon="inline-start" />
            Pin sidebar row
          </Button>
        </PopoverTrigger>
      </DisabledReason>
      <PopoverContent align="start" sideOffset={6} className="w-72 p-0">
        <Command>
          <CommandInput placeholder="Search rows…" />
          <CommandList>
            <CommandEmpty>No rows found.</CommandEmpty>
            {groups.map(group => (
              <CommandGroup key={group.id} heading={group.label}>
                {group.rows.map(row => {
                  const view = rowView(row)
                  return (
                    <CommandItem
                      key={row.id}
                      value={`${row.id} ${view.label} ${view.href}`}
                      onSelect={() => { onPin(row.id); setOpen(false) }}
                    >
                      {row.kind === 'category' ? <Tag /> : <Link2 />}
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className={cn('truncate', view.missingKey && 'font-mono text-xs')}>{view.label}</span>
                        <span className="truncate text-xs text-muted-foreground">{view.href || 'No link'}</span>
                      </span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Menu or Search: only the label and icon are editable here, the position is set by dragging
function FixedItemSheet({ item, open, onOpenChange, onChange }: {
  /** Kept while the drawer animates out, so its content doesn't blank mid-transition */
  item: FixedBarItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onChange: (next: FixedBarItem) => void
}) {
  return (
    <Sheet open={open && !!item} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 data-[side=right]:sm:max-w-md">
        {item && (
          <>
            <SheetHeader className="border-b border-border">
              <SheetTitle>{BAR_ITEM_KIND_LABEL[item.kind]}</SheetTitle>
              <SheetDescription>Required in the bar. Drag the row to change its position.</SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-4">
              <FieldGroup>
                <IconFields id={`bar-${item.id}-icon`} variant="compact" surface="dark" value={item.icon} onChange={icon => onChange({ ...item, icon })} />
                <TranslationKeyField id={`bar-${item.id}-label`} label="Label" value={item.label} onChange={label => onChange({ ...item, label })} />
                <FieldDescription>Leave the icon or label empty to use the website&apos;s default {BAR_ITEM_KIND_LABEL[item.kind]}.</FieldDescription>
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

function BarItemsBlock({ settings, onChange, onEditFixed }: { settings: BottomBarSettings; onChange: Update; onEditFixed: (id: string) => void }) {
  const { items, mainItemId } = settings
  const setItems = (update: (items: BarItem[]) => BarItem[]) => onChange(s => ({ ...s, items: update(s.items) }))

  const pinned = items.filter(i => i.kind === 'sidebar')
  const maxPinned = MAX_PINNED_ITEMS + (mainItemId ? 1 : 0)
  const pinnedRowIds = new Set(pinned.map(i => (i.kind === 'sidebar' ? i.rowId : '')))

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    setItems(list => arrayMove(list, list.findIndex(i => i.id === active.id), list.findIndex(i => i.id === over.id)))
  }

  function unpin(item: BarItem) {
    const at = items.indexOf(item)
    const wasMain = mainItemId === item.id
    onChange(s => ({
      ...s,
      items: s.items.filter(i => i.id !== item.id),
      mainItemId: s.mainItemId === item.id ? null : s.mainItemId,
    }))
    // Undo also gives the center slot back if the row held it
    toastRemoved(`${itemView(item, SIDEBAR.groups).label} unpinned`, () =>
      onChange(s => ({ ...s, items: insertAt(s.items, at, item), mainItemId: wasMain ? item.id : s.mainItemId }))
    )
  }

  function pin(rowId: string) {
    // New pins go before Search, which usually closes the bar
    setItems(list => {
      const searchAt = list.findIndex(i => i.kind === 'search')
      const at = searchAt === -1 ? list.length : searchAt
      return [...list.slice(0, at), newPinnedItem(rowId), ...list.slice(at)]
    })
  }

  return (
    <section className="flex flex-col gap-4">
      <BlockTitle
        title="Bar Items"
        description={
          <p>
            Drag to reorder. <span className={STRONG}>Menu</span> and <span className={STRONG}>Search</span> are always in
            the bar. Pin up to {MAX_PINNED_ITEMS} rows from the <SectionLink section="sidebar">Sidebar</SectionLink> groups
            -- {MAX_PINNED_ITEMS + 1} when one of them is the center button.
          </p>
        }
      />

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
            {items.map(item => (
              <BarItemRow
                key={item.id}
                item={item}
                main={item.id === mainItemId}
                onEdit={() => onEditFixed(item.id)}
                onRemove={() => unpin(item)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <div className="flex flex-wrap items-center gap-3">
        <PinRowButton
          pinnedRowIds={pinnedRowIds}
          disabledReason={pinned.length >= maxPinned ? `Up to ${maxPinned} pinned rows. Unpin one to pin another.` : undefined}
          onPin={pin}
        />
        <LimitCount count={pinned.length} max={maxPinned} noun="pinned" />
      </div>

    </section>
  )
}

function CenterCtaBlock({ settings, onChange, sectionRef, showErrors }: { settings: BottomBarSettings; onChange: Update; sectionRef: React.Ref<HTMLElement>; showErrors: boolean }) {
  const { items, mainItemId, cta } = settings
  const { loggedIn, loggedOut } = cta
  const setIn = (patch: Partial<typeof loggedIn>) => onChange(s => ({ ...s, cta: { ...s.cta, loggedIn: { ...s.cta.loggedIn, ...patch } } }))
  const setOut = (patch: Partial<typeof loggedOut>) => onChange(s => ({ ...s, cta: { ...s.cta, loggedOut: { ...s.cta.loggedOut, ...patch } } }))

  const pinned = items.filter(i => i.kind === 'sidebar')
  const options = [
    { value: 'deposit', title: 'Deposit (Default)', description: 'Opens the deposit modal.' },
    ...pinned.map(item => {
      const view = itemView(item, SIDEBAR.groups)
      return { value: item.id, title: view.label, description: view.removed ? 'This row no longer exists in the sidebar.' : `Uses the row's icon and label, opens ${view.href || 'no link'}.` }
    }),
  ]

  return (
    <section ref={sectionRef} className="flex scroll-mt-24 flex-col gap-6">
      <BlockTitle
        title="Center CTA (Main Button)"
        description={
          <p>
            The raised circle in the middle of the bar, set separately for players and guests.
          </p>
        }
      />

      <div className="flex flex-col gap-4">
        <SubTitle
          title="When Logged In"
          description="Deposit opens the deposit modal. Pick a pinned row to send players there instead."
        />
        <RadioGroup
          value={mainItemId ?? 'deposit'}
          onValueChange={v => onChange(s => ({ ...s, mainItemId: v === 'deposit' ? null : v }))}
          className="grid grid-cols-1 gap-3 tablet:grid-cols-2"
          aria-label="Logged-in center button"
        >
          {options.map(option => (
            <FieldLabel key={option.value} htmlFor={`cta-main-${option.value}`}>
              <Field orientation="horizontal">
                <RadioGroupItem value={option.value} id={`cta-main-${option.value}`} />
                <FieldContent>
                  <FieldTitle>{option.title}</FieldTitle>
                  <FieldDescription>{option.description}</FieldDescription>
                </FieldContent>
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>
        {mainItemId === null && (
          <FieldGroup>
            <IconFields id="cta-in-icon" variant="compact" surface="dark" value={loggedIn.icon} onChange={icon => setIn({ icon })} />
            <TranslationKeyField id="cta-in-label" label="Label" value={loggedIn.label} onChange={label => setIn({ label })} />
          </FieldGroup>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <SubTitle
          title="When Logged Out"
          hint="Join Now (Default)"
          description="Shown to guests, e.g. Join Now, Sign Up or Get Bonus."
        />
        <FieldGroup>
          <IconFields id="cta-out-icon" variant="compact" surface="dark" value={loggedOut.icon} onChange={icon => setOut({ icon })} />
          <TranslationKeyField id="cta-out-label" label="Label" value={loggedOut.label} onChange={label => setOut({ label })} />
          <HrefFields id="cta-out" href={loggedOut.href} onChange={setOut} error={showErrors ? ctaLinkError(settings) : undefined} />
        </FieldGroup>
      </div>
    </section>
  )
}

// The guest button always navigates, so it needs a working link; errors show after the first failed save
function ctaLinkError({ cta }: BottomBarSettings) {
  return validateHref(cta.loggedOut.href, false)
}

export function BottomBarSection() {
  const [settings, setSettings] = useState<BottomBarSettings>(BOTTOM_BAR)
  const { dirty, saving, save, reset } = useSaveable(settings, setSettings, commitBottomBar)
  const { showErrors, formRef, trySave } = useGuardedSave(!ctaLinkError(settings), save)
  const ctaRef = useRef<HTMLElement>(null)
  const [state, setState] = useState<AuthState>('in')
  const [previewOpen, setPreviewOpen] = useState(false)

  // Menu or Search whose drawer is open; the id stays set while the drawer animates out
  const [editing, setEditing] = useState<{ id: string; open: boolean } | null>(null)
  const editingItem = settings.items.find((i): i is FixedBarItem => i.id === editing?.id && i.kind !== 'sidebar') ?? null

  function editFixed(id: string) {
    setPreviewOpen(false)
    setEditing({ id, open: true })
  }

  function editCta() {
    setPreviewOpen(false)
    const el = ctaRef.current
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    // Hand focus to the first control without jumping ahead of the smooth scroll
    el?.querySelector<HTMLElement>('button[role="radio"]')?.focus({ preventScroll: true })
  }

  const panel = <PreviewPanel settings={settings} state={state} onStateChange={setState} onEditFixed={editFixed} onEditCta={editCta} />

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <SectionHeader
          title="Mobile Bottom Bar"
          description="The fixed bar at the bottom of the screen on mobile: up to 5 slots -- Menu, Search, up to 2 pinned sidebar rows and the center button."
        />
        {/* Below the wide breakpoint the preview column doesn't fit, so it opens in a sheet */}
        <Button variant="outline" size="sm" className="shrink-0 wide:hidden" onClick={() => setPreviewOpen(true)}>
          <Eye data-icon="inline-start" />
          Preview
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 wide:grid-cols-[minmax(0,1fr)_22rem]">
        <div ref={formRef} className="flex min-w-0 flex-col gap-12">
          <BarItemsBlock settings={settings} onChange={setSettings} onEditFixed={editFixed} />
          <CenterCtaBlock settings={settings} onChange={setSettings} sectionRef={ctaRef} showErrors={showErrors} />
        </div>
        {/* About a phone's width, so labels truncate where they would on the website */}
        <aside className="hidden wide:block">
          <div className="sticky top-20 flex flex-col gap-3">
            <h3 className="text-sm font-medium">Bottom Bar Preview</h3>
            {panel}
          </div>
        </aside>
      </div>

      <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
        <SheetContent className="w-full gap-0 data-[side=right]:sm:max-w-sm">
          <SheetHeader className="border-b border-border">
            <SheetTitle>Bottom Bar Preview</SheetTitle>
            <SheetDescription>How the bar looks on a phone.</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4">{panel}</div>
        </SheetContent>
      </Sheet>

      <FixedItemSheet
        item={editingItem}
        open={!!editing?.open}
        onOpenChange={open => setEditing(e => (e ? { ...e, open } : e))}
        onChange={next => setSettings(s => ({ ...s, items: s.items.map(i => (i.id === next.id ? next : i)) }))}
      />

      <SectionActions dirty={dirty} saving={saving} onSave={trySave} onReset={reset} />
    </>
  )
}
