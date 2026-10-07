'use client'
import { useState } from 'react'
import { ChevronRight, Eye, ExternalLink, GripVertical, Link2, ListPlus, Lock, Pin, Plus, Rows3, Tag, TriangleAlert } from 'lucide-react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldTitle } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { SectionActions, SectionHeader, useGuardedSave, useSaveable } from '../_lib/section'
import {
  categoryLabelKey,
  categoryUse,
  commitSidebar,
  GAME_CATEGORIES,
  groupLabel,
  MAX_GROUP_ROWS,
  MAX_NAV_GROUPS,
  newCategoryRow,
  newCustomLinkRow,
  newNavGroup,
  pinnedRowIds,
  resolveLabel,
  rowView,
  SIDEBAR,
  validateStoreUrl,
  type CustomLinkRow,
  type NavGroup,
  type SidebarRow,
  type SidebarSettings,
} from '../_lib/sidebar'
import { validateHref } from '../_lib/validation'
import { IconFields, TranslationKeyField } from './fields'
import { IconImage } from './icon-image'
import { BlockTitle, HrefFields, RemoveButton, SectionLink } from './nav-shared'
import { ConfirmRemoveDialog, DisabledReason, insertAt, LimitCount, pluralize, toastRemoved } from './list-actions'
import { DrawerPreview, LIST_ICON, LIST_ICON_FILE } from './storefront-preview'

type Update = (update: (s: SidebarSettings) => SidebarSettings) => void

// --- Validation: errors block saving and show after the first failed attempt; a missing translation is only a warning ---

function customLinkErrors(row: CustomLinkRow) {
  return {
    label: row.title ? undefined : 'Label is required',
    link: validateHref(row.href, row.external),
  }
}

function supportErrors({ support }: SidebarSettings) {
  return {
    label: support.label ? undefined : 'Label is required',
    link: validateHref(support.href, support.external),
  }
}

// Only an enabled card is rendered, so only then does it need its content
function appInstallErrors({ appInstall }: SidebarSettings) {
  if (!appInstall.enabled) return { title: undefined, storeUrl: undefined }
  return {
    title: appInstall.title ? undefined : 'Title is required',
    storeUrl: validateStoreUrl(appInstall.storeUrl),
  }
}

function rowIncomplete(row: SidebarRow) {
  if (row.kind !== 'custom') return false
  const errors = customLinkErrors(row)
  return !!(errors.label || errors.link)
}

function sidebarValid(settings: SidebarSettings) {
  const noErrors = (errors: Record<string, string | undefined>) => Object.values(errors).every(e => !e)
  return (
    settings.groups.every(g => !g.rows.some(rowIncomplete)) &&
    noErrors(supportErrors(settings)) &&
    noErrors(appInstallErrors(settings))
  )
}

function useSortableSensors() {
  return useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )
}

/** DOM id of a row's main control, so the preview can bring it into view. */
function rowAnchor(rowId: string) {
  return `sidebar-row-${rowId}`
}

/** Scrolls a form element into view and focuses it (used by the clickable previews). */
function reveal(id: string) {
  const el = document.getElementById(id)
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  el?.focus({ preventScroll: true })
}

// Compact sortable row like the footer links. The type goes in the second line; badges are for status only
function RowItem({ row, pinned, incomplete, onEdit, onRemove }: {
  row: SidebarRow
  /** Pinned to the saved mobile bottom bar */
  pinned: boolean
  /** Only true after a save attempt, like the other required-field errors */
  incomplete: boolean
  onEdit: () => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id })
  const custom = row.kind === 'custom'
  const view = rowView(row)
  const name = custom && !row.title ? 'Untitled link' : view.label

  // Same muted tile and icon tone in every row; the real look is in the sidebar preview
  const media = (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
      {custom && row.icon.src ? (
        <IconImage src={row.icon.src} className={LIST_ICON} imgClassName={LIST_ICON_FILE} />
      ) : custom ? (
        <Link2 className="size-4 text-muted-foreground" />
      ) : (
        <Tag className="size-4 text-muted-foreground" />
      )}
    </span>
  )

  const text = (
    <span className="min-w-0 flex-1">
      <span className={cn('block truncate text-sm font-medium', view.missingKey && 'font-mono text-xs')}>{name}</span>
      <span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
        <span className="truncate">
          {custom ? 'Custom link' : 'Category'} · {view.href || 'No link'}
        </span>
        {custom && row.external && <ExternalLink className="size-3 shrink-0" aria-label="Opens in a new tab" />}
      </span>
    </span>
  )

  const badges = (
    <>
      {pinned && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary" className="relative">
              <Pin data-icon="inline-start" />
              Pinned
            </Badge>
          </TooltipTrigger>
          <TooltipContent>Also shown in the mobile bottom bar</TooltipContent>
        </Tooltip>
      )}
      {incomplete && <Badge variant="destructive">Incomplete</Badge>}
      {view.missingKey && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="destructive" className="relative">
              <TriangleAlert data-icon="inline-start" />
              Missing key
            </Badge>
          </TooltipTrigger>
          <TooltipContent>Not in translations -- the website shows the raw key</TooltipContent>
        </Tooltip>
      )}
    </>
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
        aria-label={`Reorder ${name}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical />
      </Button>
      {custom ? (
        // Like shadcn Item: the button stretches over the whole row (after:), grip, badges and delete sit above it
        <button
          id={rowAnchor(row.id)}
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${name}`}
          aria-invalid={incomplete || undefined}
          data-row-link
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1.5 py-0.5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 after:absolute after:inset-0 after:content-['']"
        >
          {media}
          {text}
        </button>
      ) : (
        // Category rows have nothing to edit: label and icon come from Games -> Categories
        <Tooltip>
          <TooltipTrigger asChild>
            <div id={rowAnchor(row.id)} tabIndex={0} className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1.5 py-0.5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
              {media}
              {text}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            Label ({categoryLabelKey(row.category)}) and icon are taken from the category -- edit them in Games → Categories.
          </TooltipContent>
        </Tooltip>
      )}
      <span className="flex shrink-0 items-center gap-2">
        {badges}
        {custom && <ChevronRight className="size-4 text-muted-foreground" />}
      </span>
      <RemoveButton label={`Remove ${name}`} onClick={onRemove} />
    </li>
  )
}

// Side drawer with a custom link's fields, like the footer link sheet; edits go straight into the page draft
function RowSheet({ row, open, showErrors, onOpenChange, onChange }: {
  /** Kept while the drawer animates out, so its content doesn't blank mid-transition */
  row: CustomLinkRow | null
  open: boolean
  showErrors: boolean
  onOpenChange: (open: boolean) => void
  onChange: (next: CustomLinkRow) => void
}) {
  const errors = row && showErrors ? customLinkErrors(row) : { label: undefined, link: undefined }

  return (
    <Sheet open={open && !!row} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 data-[side=right]:sm:max-w-md">
        {row && (
          <>
            <SheetHeader className="border-b border-border">
              <SheetTitle>{resolveLabel(row.title, 'Untitled link').text}</SheetTitle>
              <SheetDescription>Changes apply to the page draft. Save the page to publish them.</SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-4">
              <FieldGroup>
                <IconFields id={`${row.id}-icon`} variant="compact" surface="dark" value={row.icon} onChange={icon => onChange({ ...row, icon })} />
                <TranslationKeyField id={`${row.id}-title`} label="Label" value={row.title} onChange={title => onChange({ ...row, title })} error={errors.label} />
                <HrefFields id={row.id} href={row.href} external={row.external} onChange={patch => onChange({ ...row, ...patch })} error={errors.link} />
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

// One add action for both row types, like "Add method" in Deposit methods. Used categories stay listed, disabled
function AddRowMenu({ groups, full, onAddCategory, onAddCustomLink }: {
  groups: NavGroup[]
  full: boolean
  onAddCategory: (category: string) => void
  onAddCustomLink: () => void
}) {
  return (
    <DropdownMenu>
      <DisabledReason reason={full ? `Up to ${MAX_GROUP_ROWS} rows per group` : undefined}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={full}>
            <Plus data-icon="inline-start" />
            Add row
          </Button>
        </DropdownMenuTrigger>
      </DisabledReason>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="items-start">
            <Tag className="mt-0.5" />
            <span className="flex flex-1 flex-col gap-0.5">
              <span>Category</span>
              <span className="text-xs text-muted-foreground">Label, icon and link come from Games → Categories. Each category once.</span>
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-56">
            {GAME_CATEGORIES.map(category => {
              const usedIn = categoryUse(groups, category)
              return (
                <DropdownMenuItem key={category} disabled={!!usedIn} onSelect={() => onAddCategory(category)}>
                  <span className="min-w-0 flex-1 truncate">{resolveLabel(categoryLabelKey(category), category).text}</span>
                  {usedIn && <span className="text-xs text-muted-foreground">In {usedIn}</span>}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem onSelect={onAddCustomLink} className="items-start">
          <Link2 className="mt-0.5" />
          <span className="flex flex-col gap-0.5">
            <span>Custom link</span>
            <span className="text-xs text-muted-foreground">Promotions, Cashback, an external URL. You set the SVG icon, label and link.</span>
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// One group as a card, like a footer navigation column: header with grip, name, count and remove, then its rows
function GroupCard({ group, index, groups, pinned, showErrors, onChange, onEditRow, onRemove }: {
  group: NavGroup
  pinned: Set<string>
  index: number
  groups: NavGroup[]
  showErrors: boolean
  onChange: (update: (rows: SidebarRow[]) => SidebarRow[]) => void
  onEditRow: (rowId: string) => void
  onRemove: () => void
}) {
  const { rows } = group
  const name = groupLabel(index)
  const full = rows.length >= MAX_GROUP_ROWS
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: group.id })
  const sensors = useSortableSensors()

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    onChange(list => arrayMove(list, list.findIndex(r => r.id === active.id), list.findIndex(r => r.id === over.id)))
  }

  function addCustomLink() {
    const row = newCustomLinkRow()
    onChange(r => [...r, row])
    onEditRow(row.id)
  }

  function removeRow(row: SidebarRow, at: number) {
    onChange(r => r.filter(x => x.id !== row.id))
    const name = rowView(row).label
    // A pinned row leaves the bottom bar too once the sidebar is saved
    toastRemoved(pinned.has(row.id) ? `${name} removed -- saving also unpins it from the mobile bottom bar` : `${name} removed`, () =>
      onChange(r => insertAt(r, at, row))
    )
  }

  const addMenu = (
    <AddRowMenu groups={groups} full={full} onAddCategory={c => onChange(r => [...r, newCategoryRow(c)])} onAddCustomLink={addCustomLink} />
  )

  return (
    <li
      ref={setNodeRef}
      // Позиция элемента во время перетаскивания -- единственный оправданный inline-style
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('flex flex-col gap-4 rounded-2xl border border-border bg-background p-4', isDragging && 'relative z-10 opacity-80 shadow-md')}
    >
      <div className="-my-1 -ml-2 flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0 cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
          aria-label={`Reorder ${name}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical />
        </Button>
        <h4 className="min-w-0 flex-1 truncate text-base font-medium">{name}</h4>
        <LimitCount count={rows.length} max={MAX_GROUP_ROWS} noun="rows" />
        {rows.length > 0 && addMenu}
        <RemoveButton label={`Remove ${name}`} onClick={onRemove} />
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-8 text-center">
          <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
            <ListPlus className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No rows yet. Add a category or a custom link.</p>
          {addMenu}
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={rows.map(r => r.id)} strategy={verticalListSortingStrategy}>
            <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
              {rows.map((row, at) => (
                <RowItem
                  key={row.id}
                  row={row}
                  pinned={pinned.has(row.id)}
                  incomplete={showErrors && rowIncomplete(row)}
                  onEdit={() => onEditRow(row.id)}
                  onRemove={() => removeRow(row, at)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </li>
  )
}

function NavGroups({ settings, onChange, showErrors, onEditRow }: {
  settings: SidebarSettings
  onChange: Update
  showErrors: boolean
  onEditRow: (rowId: string) => void
}) {
  const { groups } = settings
  const setGroups = (update: (g: NavGroup[]) => NavGroup[]) => onChange(s => ({ ...s, groups: update(s.groups) }))
  const sensors = useSortableSensors()
  // Group waiting for confirmation: removing one with rows takes the rows along
  const [confirming, setConfirming] = useState<{ id: string; open: boolean } | null>(null)
  const confirmingIndex = confirming ? groups.findIndex(g => g.id === confirming.id) : -1
  const full = groups.length >= MAX_NAV_GROUPS
  const pinned = pinnedRowIds()
  const confirmingRows = groups[confirmingIndex]?.rows ?? []
  const confirmingPinned = confirmingRows.filter(r => pinned.has(r.id)).length

  function removeGroup(id: string) {
    const at = groups.findIndex(g => g.id === id)
    const group = groups[at]
    if (!group) return
    setGroups(g => g.filter(x => x.id !== id))
    toastRemoved(`${groupLabel(at)} removed`, () => setGroups(g => insertAt(g, at, group)))
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    setGroups(list => arrayMove(list, list.findIndex(g => g.id === active.id), list.findIndex(g => g.id === over.id)))
  }

  return (
    <section className="flex flex-col gap-4">
      <BlockTitle
        title="Nav menu groups"
        description={
          <p>
            A group is one rounded block in the drawer, with up to {MAX_GROUP_ROWS} rows. Drag to reorder. Rows can
            be pinned to the <SectionLink section="bottom-bar">mobile bottom bar</SectionLink>.
          </p>
        }
      />
      {groups.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-8 text-center">
          <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
            <Rows3 className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No groups yet. The drawer shows only the support row and the app card.</p>
        </div>
      )}
      {groups.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={groups.map(g => g.id)} strategy={verticalListSortingStrategy}>
            <ul className="flex flex-col gap-3">
              {groups.map((group, index) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  index={index}
                  groups={groups}
                  pinned={pinned}
                  showErrors={showErrors}
                  onChange={update => setGroups(g => g.map(x => (x.id === group.id ? { ...x, rows: update(x.rows) } : x)))}
                  onEditRow={onEditRow}
                  onRemove={() => (group.rows.length > 0 ? setConfirming({ id: group.id, open: true }) : removeGroup(group.id))}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
      <div className="flex items-center gap-3">
        <DisabledReason reason={full ? `Up to ${MAX_NAV_GROUPS} groups` : undefined}>
          <Button variant="outline" size="sm" disabled={full} onClick={() => setGroups(g => [...g, newNavGroup()])}>
            <Plus data-icon="inline-start" />
            Add group
          </Button>
        </DisabledReason>
        <LimitCount count={groups.length} max={MAX_NAV_GROUPS} noun="groups" />
      </div>

      <ConfirmRemoveDialog
        open={!!confirming?.open}
        onOpenChange={open => setConfirming(c => (c ? { ...c, open } : c))}
        title={`Remove ${groupLabel(Math.max(confirmingIndex, 0))}?`}
        description={
          `This also removes its ${pluralize(confirmingRows.length, 'row')}.` +
          (confirmingPinned > 0 ? ` Saving also unpins ${pluralize(confirmingPinned, 'row')} from the mobile bottom bar.` : '')
        }
        onConfirm={() => confirming && removeGroup(confirming.id)}
      />
    </section>
  )
}

function SupportBlock({ settings, onChange, showErrors }: { settings: SidebarSettings; onChange: Update; showErrors: boolean }) {
  const { support } = settings
  const set = (patch: Partial<SidebarSettings['support']>) => onChange(s => ({ ...s, support: { ...s.support, ...patch } }))
  const errors = showErrors ? supportErrors(settings) : { label: undefined, link: undefined }

  return (
    <section id="sidebar-support" className="flex scroll-mt-24 flex-col gap-6">
      <BlockTitle
        title="Support row"
        description={
          <p>
            The Live Support entry next to the locale picker. Only its icon, label and link can be changed; the locale
            picker follows the page&apos;s language.
          </p>
        }
        aside={
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" tabIndex={0}>
                <Lock data-icon="inline-start" />
                Always shown
              </Badge>
            </TooltipTrigger>
            <TooltipContent>Can&apos;t be removed or moved</TooltipContent>
          </Tooltip>
        }
      />
      <FieldGroup>
        <IconFields id="support-icon" variant="compact" surface="dark" label="Support icon" value={support.icon} onChange={icon => set({ icon })} />
        <TranslationKeyField id="support-label" label="Label" value={support.label} onChange={label => set({ label })} error={errors.label} />
        <HrefFields id="support" href={support.href} external={support.external} onChange={set} error={errors.link} />
      </FieldGroup>
    </section>
  )
}

function AppInstallBlock({ settings, onChange, showErrors }: { settings: SidebarSettings; onChange: Update; showErrors: boolean }) {
  const { appInstall } = settings
  const set = (patch: Partial<SidebarSettings['appInstall']>) => onChange(s => ({ ...s, appInstall: { ...s.appInstall, ...patch } }))
  const errors = showErrors ? appInstallErrors(settings) : { title: undefined, storeUrl: undefined }

  return (
    <section id="sidebar-app-install" className="flex scroll-mt-24 flex-col gap-6">
      <BlockTitle
        title="App install card"
        description={<p>Optional promotional card linking to the app store.</p>}
      />
      {/* Switch as a choice card, like the center button options in the mobile bottom bar */}
      <FieldLabel htmlFor="app-install-enabled">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle>Show the card</FieldTitle>
            <FieldDescription>When off, the card isn&apos;t rendered in the drawer. Its settings are kept.</FieldDescription>
          </FieldContent>
          <Switch id="app-install-enabled" checked={appInstall.enabled} onCheckedChange={enabled => set({ enabled })} />
        </Field>
      </FieldLabel>
      {appInstall.enabled && (
        <FieldGroup>
          <IconFields id="app-install-icon" variant="compact" surface="dark" formats="image" value={appInstall.icon} onChange={icon => set({ icon })} />
          <TranslationKeyField id="app-install-title" label="Title" value={appInstall.title} onChange={title => set({ title })} error={errors.title} />
          <TranslationKeyField id="app-install-subtitle" label="Subtitle" value={appInstall.subtitle} onChange={subtitle => set({ subtitle })} />
          <Field data-invalid={!!errors.storeUrl || undefined}>
            <FieldLabel htmlFor="app-install-url">Store URL</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <Link2 />
              </InputGroupAddon>
              <InputGroupInput
                id="app-install-url"
                type="url"
                value={appInstall.storeUrl}
                onChange={e => set({ storeUrl: e.target.value })}
                placeholder="https://apps.apple.com/…"
                autoComplete="off"
                spellCheck={false}
                aria-invalid={!!errors.storeUrl || undefined}
              />
            </InputGroup>
            <FieldDescription>Always opens in a new tab.</FieldDescription>
            <FieldError>{errors.storeUrl}</FieldError>
          </Field>
        </FieldGroup>
      )}
    </section>
  )
}

export function SidebarSection() {
  const [settings, setSettings] = useState<SidebarSettings>(SIDEBAR)
  const { dirty, saving, save, reset } = useSaveable(settings, setSettings, commitSidebar)
  const { showErrors, formRef, trySave } = useGuardedSave(sidebarValid(settings), save)
  const [previewOpen, setPreviewOpen] = useState(false)

  // Custom link whose drawer is open; the id stays set while the drawer animates out
  const [editing, setEditing] = useState<{ id: string; open: boolean } | null>(null)
  const editingRow =
    settings.groups.flatMap(g => g.rows).find((r): r is CustomLinkRow => r.id === editing?.id && r.kind === 'custom') ?? null

  const editRow = (rowId: string) => setEditing({ id: rowId, open: true })

  // Clicks in the preview open the matching settings, like the bottom bar preview
  const previewActions = {
    onRowClick: (row: SidebarRow) => {
      setPreviewOpen(false)
      if (row.kind === 'custom') editRow(row.id)
      else reveal(rowAnchor(row.id))
    },
    onSupportClick: () => { setPreviewOpen(false); reveal('support-icon-upload') },
    onAppInstallClick: () => { setPreviewOpen(false); reveal('app-install-enabled') },
  }

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <SectionHeader
          title="Sidebar"
          description="Configure the mobile/tablet drawer: nav menu groups, the support row, and the optional app-install card."
        />
        {/* Below the wide breakpoint the preview column doesn't fit, so it opens in a sheet */}
        <Button variant="outline" size="sm" className="shrink-0 wide:hidden" onClick={() => setPreviewOpen(true)}>
          <Eye data-icon="inline-start" />
          Preview
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 wide:grid-cols-[minmax(0,1fr)_22rem]">
        <div ref={formRef} className="flex min-w-0 flex-col gap-12">
          <NavGroups settings={settings} onChange={setSettings} showErrors={showErrors} onEditRow={editRow} />
          <SupportBlock settings={settings} onChange={setSettings} showErrors={showErrors} />
          <AppInstallBlock settings={settings} onChange={setSettings} showErrors={showErrors} />
        </div>
        <aside className="hidden wide:block">
          <div className="sticky top-20 flex flex-col gap-3">
            <h3 className="text-sm font-medium">Sidebar preview</h3>
            <DrawerPreview settings={settings} {...previewActions} />
            <p className="text-xs text-muted-foreground">Updates as you edit. Click a row, the support row or the app card to edit it.</p>
          </div>
        </aside>
      </div>

      <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
        <SheetContent className="w-full gap-0 data-[side=right]:sm:max-w-sm">
          <SheetHeader className="border-b border-border">
            <SheetTitle>Sidebar preview</SheetTitle>
            <SheetDescription>Updates as you edit. Click a row, the support row or the app card to edit it.</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4">
            <DrawerPreview settings={settings} {...previewActions} />
          </div>
        </SheetContent>
      </Sheet>

      <RowSheet
        row={editingRow}
        open={!!editing?.open}
        showErrors={showErrors}
        onOpenChange={open => setEditing(e => (e ? { ...e, open } : e))}
        onChange={next =>
          setSettings(s => ({ ...s, groups: s.groups.map(g => ({ ...g, rows: g.rows.map(r => (r.id === next.id ? next : r)) })) }))
        }
      />

      <SectionActions dirty={dirty} saving={saving} onSave={trySave} onReset={reset} />
    </>
  )
}
