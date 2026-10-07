'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ChevronRight, Columns3, ExternalLink, GripVertical, Image as ImageIcon, ImagePlus, Link2, ListPlus, PanelBottom, Plus, Trash2 } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { IconFields, TranslationKeyField } from '../../_components/fields'
import { ConfirmRemoveDialog, insertAt, pluralize, toastRemoved } from '../../_components/list-actions'
import { TRANSLATIONS } from '../../_lib/deposit-methods'
import {
  commitFooterAbout,
  commitFooterColumns,
  commitFooterLegal,
  commitFooterPaymentLogos,
  FOOTER,
  FOOTER_BLOCKS,
  FOOTER_HREF,
  newFooterColumn,
  newFooterLink,
  newFooterPaymentLogo,
  validateFooterHref,
  type FooterAbout,
  type FooterBlock,
  type FooterColumn,
  type FooterLegal,
  type FooterLink,
  type FooterPaymentLogo,
} from '../../_lib/footer'
import { SectionActions, useGuardedSave, useSaveable } from '../../_lib/section'

function BlockHeader({ block }: { block: FooterBlock }) {
  return (
    <>
      <h1 className="text-2xl font-semibold">{block.label}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{block.description}.</p>
    </>
  )
}

function LegalForm({ block, initial }: { block: FooterBlock; initial: FooterLegal }) {
  const [legal, setLegal] = useState(initial)
  const { dirty, saving, save, reset } = useSaveable(legal, setLegal, commitFooterLegal)

  function set<K extends keyof FooterLegal>(key: K, value: FooterLegal[K]) {
    setLegal(l => ({ ...l, [key]: value }))
  }

  return (
    <>
      <BlockHeader block={block} />
      <FieldGroup className="mt-8">
        <TranslationKeyField
          id="legal-text"
          label="Legal text"
          value={legal.legalText}
          onChange={v => set('legalText', v)}
          suggested="footer.legal.text"
        />
        <TranslationKeyField
          id="legal-copyright"
          label="Copyright"
          value={legal.copyright}
          onChange={v => set('copyright', v)}
          suggested="footer.copyright"
        />
        <IconFields
          id="legal-license-image"
          label="License image"
          formats="image"
          value={legal.licenseImage}
          onChange={v => set('licenseImage', v)}
        />
      </FieldGroup>
      <SectionActions dirty={dirty} saving={saving} onSave={save} onReset={reset} />
    </>
  )
}

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

function linkName(link: FooterLink, index: number) {
  return (link.label && TRANSLATIONS[link.label]) || `Link ${index + 1}`
}

// Compact sortable row, like the deposit method options; the link's fields live in LinkSheet
function LinkRow({ link, index, incomplete, onEdit, onRemove }: {
  link: FooterLink
  index: number
  /** Only true after a save attempt, like the other required-field errors */
  incomplete: boolean
  onEdit: () => void
  onRemove: () => void
}) {
  const name = linkName(link, index)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id })

  return (
    <li
      ref={setNodeRef}
      // Позиция элемента во время перетаскивания -- единственный оправданный inline-style
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('relative flex items-center gap-1 bg-background px-2 py-1.5 transition-colors has-[[data-row-link]:hover]:bg-muted', isDragging && 'z-10 opacity-80 shadow-md')}
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
      {/* Like shadcn Item: the button stretches over the whole row (after:), delete sits above it */}
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${name}`}
        aria-invalid={incomplete || undefined}
        data-row-link
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1.5 py-1 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 after:absolute after:inset-0 after:content-['']"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{name}</span>
          <span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
            <span className="truncate">{link.href.trim() || 'No link'}</span>
            {link.external && <ExternalLink className="size-3 shrink-0" aria-label="Opens in a new tab" />}
          </span>
        </span>
        {incomplete && <Badge variant="destructive">Incomplete</Badge>}
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </button>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="relative" aria-label={`Remove ${name}`} onClick={onRemove}>
            <Trash2 className="text-muted-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Remove link</TooltipContent>
      </Tooltip>
    </li>
  )
}

// Side drawer with one link's fields, like the deposit option sheet; edits go straight into the page draft
function LinkSheet({ link, index, open, showErrors, onOpenChange, onChange }: {
  /** Kept while the drawer animates out, so its content doesn't blank mid-transition */
  link: FooterLink | null
  index: number
  open: boolean
  showErrors: boolean
  onOpenChange: (open: boolean) => void
  onChange: (next: FooterLink) => void
}) {
  const id = link ? `link-${link.id}` : 'link'
  const labelError = showErrors && link && !link.label ? 'Label is required' : undefined
  const hrefError = showErrors && link ? validateFooterHref(link.href, link.external) : undefined

  return (
    <Sheet open={open && !!link} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 data-[side=right]:sm:max-w-md">
        {link && (
          <>
            <SheetHeader className="border-b border-border">
              <SheetTitle>{linkName(link, index)}</SheetTitle>
              <SheetDescription>Changes apply to the page draft. Save the page to publish them.</SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-4">
              <FieldGroup>
                <TranslationKeyField
                  id={`${id}-label`}
                  label="Label"
                  value={link.label}
                  onChange={label => onChange({ ...link, label })}
                  error={labelError}
                />
                <Field data-invalid={!!hrefError || undefined}>
                  <FieldLabel htmlFor={`${id}-href`}>Link</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <Link2 />
                    </InputGroupAddon>
                    <InputGroupInput
                      id={`${id}-href`}
                      value={link.href}
                      onChange={e => onChange({ ...link, href: e.target.value })}
                      placeholder={link.external ? 'https://example.com' : '/about-us'}
                      autoComplete="off"
                      spellCheck={false}
                      aria-invalid={!!hrefError || undefined}
                    />
                  </InputGroup>
                  <FieldDescription>A site page (/about-us), an anchor (#top) or a full URL.</FieldDescription>
                  <FieldError>{hrefError}</FieldError>
                </Field>
                <Field orientation="horizontal">
                  <Checkbox
                    id={`${id}-external`}
                    checked={link.external}
                    onCheckedChange={v => onChange({ ...link, external: v === true })}
                  />
                  <FieldContent>
                    <FieldLabel htmlFor={`${id}-external`}>External</FieldLabel>
                    <FieldDescription>Opens in a new tab. Needs a full https:// URL.</FieldDescription>
                  </FieldContent>
                </Field>
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

function linkIncomplete(link: FooterLink) {
  return !link.label || !!validateFooterHref(link.href, link.external)
}

/**
 * Sortable link rows with their edit drawer, shared by About Us and every navigation column.
 * The header gets the Add link button, so each place can put it where its layout wants it.
 */
function LinksEditor({ links, onChange, showErrors, emptyText, header }: {
  links: FooterLink[]
  onChange: (update: (links: FooterLink[]) => FooterLink[]) => void
  showErrors: boolean
  emptyText: string
  header: (addButton: React.ReactNode) => React.ReactNode
}) {
  // Link whose drawer is open; the id stays set while the drawer animates out
  const [editing, setEditing] = useState<{ id: string; open: boolean } | null>(null)
  const editingIndex = editing ? links.findIndex(l => l.id === editing.id) : -1
  const editingLink = editingIndex === -1 ? null : links[editingIndex]

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    onChange(list => arrayMove(list, list.findIndex(l => l.id === active.id), list.findIndex(l => l.id === over.id)))
  }

  const addButton = (
    <Button
      variant="outline"
      size="sm"
      className="w-fit"
      onClick={() => {
        const link = newFooterLink()
        onChange(list => [...list, link])
        setEditing({ id: link.id, open: true })
      }}
    >
      <Plus data-icon="inline-start" />
      Add link
    </Button>
  )

  return (
    <>
      {header(links.length > 0 && addButton)}
      {links.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-8 text-center">
          <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
            <ListPlus className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{emptyText}</p>
          {addButton}
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={links.map(l => l.id)} strategy={verticalListSortingStrategy}>
            <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
              {links.map((link, index) => (
                <LinkRow
                  key={link.id}
                  link={link}
                  index={index}
                  incomplete={showErrors && linkIncomplete(link)}
                  onEdit={() => setEditing({ id: link.id, open: true })}
                  onRemove={() => {
                    onChange(list => list.filter(l => l.id !== link.id))
                    toastRemoved(`${linkName(link, index)} removed`, () => onChange(list => insertAt(list, index, link)))
                  }}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      <LinkSheet
        link={editingLink}
        index={editingIndex}
        open={!!editing?.open}
        showErrors={showErrors}
        onOpenChange={open => setEditing(e => (e ? { ...e, open } : e))}
        onChange={next => onChange(list => list.map(l => (l.id === next.id ? next : l)))}
      />
    </>
  )
}

function AboutForm({ block, initial }: { block: FooterBlock; initial: FooterAbout }) {
  const [about, setAbout] = useState(initial)
  const { dirty, saving, save, reset } = useSaveable(about, setAbout, commitFooterAbout)
  const { showErrors, formRef, trySave } = useGuardedSave(!!about.title && !about.links.some(linkIncomplete), save)
  const titleError = showErrors && !about.title ? 'Column title is required' : undefined

  return (
    <>
      <BlockHeader block={block} />
      <div ref={formRef} className="mt-8 flex flex-col gap-10">
        <FieldGroup>
          <TranslationKeyField
            id="about-title"
            label="Column title"
            value={about.title}
            onChange={title => setAbout(a => ({ ...a, title }))}
            error={titleError}
            suggested="footer.about.title"
          />
        </FieldGroup>

        <section className="flex flex-col gap-5">
          <LinksEditor
            links={about.links}
            onChange={update => setAbout(a => ({ ...a, links: update(a.links) }))}
            showErrors={showErrors}
            emptyText="No links yet. The column shows only its title."
            header={add => (
              <SectionTitle title="Links" description="Shown under the column title in this order. Drag to reorder." aside={add} />
            )}
          />
        </section>
      </div>

      <SectionActions dirty={dirty} saving={saving} onSave={trySave} onReset={reset} />
    </>
  )
}

function columnName(column: FooterColumn, index: number) {
  return (column.title && TRANSLATIONS[column.title]) || `Column ${index + 1}`
}

// One navigation column: a sortable card with its title and its own link list
function ColumnCard({ column, index, showErrors, onChange, onRemove }: {
  column: FooterColumn
  index: number
  showErrors: boolean
  onChange: (next: FooterColumn) => void
  onRemove: () => void
}) {
  const name = columnName(column, index)
  const titleError = showErrors && !column.title ? 'Column title is required' : undefined
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: column.id })

  return (
    <li
      ref={setNodeRef}
      // Позиция элемента во время перетаскивания -- единственный оправданный inline-style
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('flex flex-col gap-5 rounded-2xl border border-border bg-background p-4', isDragging && 'relative z-10 opacity-80 shadow-md')}
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
        <h3 className="min-w-0 flex-1 truncate text-base font-medium">{name}</h3>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={`Remove ${name}`} onClick={onRemove}>
              <Trash2 className="text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remove column</TooltipContent>
        </Tooltip>
      </div>
      <FieldGroup>
        <TranslationKeyField
          id={`${column.id}-title`}
          label="Column title"
          value={column.title}
          onChange={title => onChange({ ...column, title })}
          error={titleError}
        />
      </FieldGroup>
      <div className="flex flex-col gap-3">
        <LinksEditor
          links={column.links}
          onChange={update => onChange({ ...column, links: update(column.links) })}
          showErrors={showErrors}
          emptyText="No links yet. The column shows only its title."
          header={add => (
            <div className="flex min-h-8 items-center justify-between gap-3">
              <span className="text-sm font-medium">Links</span>
              {add}
            </div>
          )}
        />
      </div>
    </li>
  )
}

function NavigationForm({ block, initial }: { block: FooterBlock; initial: FooterColumn[] }) {
  const [columns, setColumns] = useState(initial)
  const { dirty, saving, save, reset } = useSaveable(columns, setColumns, commitFooterColumns)
  // Column waiting for confirmation: removing one with links takes the links along
  const [confirming, setConfirming] = useState<{ id: string; open: boolean } | null>(null)
  const confirmingIndex = confirming ? columns.findIndex(c => c.id === confirming.id) : -1

  function removeColumn(id: string) {
    const at = columns.findIndex(c => c.id === id)
    const column = columns[at]
    if (!column) return
    setColumns(list => list.filter(c => c.id !== id))
    toastRemoved(`${columnName(column, at)} removed`, () => setColumns(list => insertAt(list, at, column)))
  }
  const valid = columns.every(c => c.title && !c.links.some(linkIncomplete))
  const { showErrors, formRef, trySave } = useGuardedSave(valid, save)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    setColumns(list => arrayMove(list, list.findIndex(c => c.id === active.id), list.findIndex(c => c.id === over.id)))
  }

  function addColumn() {
    const column = newFooterColumn()
    setColumns(list => [...list, column])
    // Straight into the new column's title
    requestAnimationFrame(() => {
      const trigger = document.getElementById(`${column.id}-title`)
      trigger?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      trigger?.focus({ preventScroll: true })
    })
  }

  const addButton = (
    <Button variant="outline" size="sm" className="w-fit" onClick={addColumn}>
      <Plus data-icon="inline-start" />
      Add column
    </Button>
  )

  return (
    <>
      <BlockHeader block={block} />
      <div ref={formRef} className="mt-8">
        <section className="flex flex-col gap-5">
          <SectionTitle
            title="Columns"
            description="Shown left to right in this order. Drag a column by its handle to reorder."
          />
          {columns.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-8 text-center">
              <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                <Columns3 className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No columns yet. The footer shows no navigation.</p>
              {addButton}
            </div>
          ) : (
            <>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={columns.map(c => c.id)} strategy={verticalListSortingStrategy}>
                  <ul className="flex flex-col gap-4">
                    {columns.map((column, index) => (
                      <ColumnCard
                        key={column.id}
                        column={column}
                        index={index}
                        showErrors={showErrors}
                        onChange={next => setColumns(list => list.map(c => (c.id === next.id ? next : c)))}
                        onRemove={() => (column.links.length > 0 ? setConfirming({ id: column.id, open: true }) : removeColumn(column.id))}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
              {addButton}
            </>
          )}
        </section>
      </div>

      <ConfirmRemoveDialog
        open={!!confirming?.open}
        onOpenChange={open => setConfirming(c => (c ? { ...c, open } : c))}
        title={`Remove ${confirmingIndex === -1 ? 'column' : columnName(columns[confirmingIndex], confirmingIndex)}?`}
        description={`This also removes its ${pluralize(columns[confirmingIndex]?.links.length ?? 0, 'link')}.`}
        onConfirm={() => confirming && removeColumn(confirming.id)}
      />

      <SectionActions dirty={dirty} saving={saving} onSave={trySave} onReset={reset} />
    </>
  )
}

function logoName(logo: FooterPaymentLogo, index: number) {
  return logo.image.alt.trim() || `Logo ${index + 1}`
}

// Compact sortable row, like the About links and deposit options; the logo's fields live in LogoSheet
function LogoRow({ logo, index, incomplete, onEdit, onRemove }: {
  logo: FooterPaymentLogo
  index: number
  /** Only true after a save attempt, like the other required-field errors */
  incomplete: boolean
  onEdit: () => void
  onRemove: () => void
}) {
  const name = logoName(logo, index)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: logo.id })

  return (
    <li
      ref={setNodeRef}
      // Позиция элемента во время перетаскивания -- единственный оправданный inline-style
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('relative flex items-center gap-1 bg-background px-2 py-1.5 transition-colors has-[[data-row-link]:hover]:bg-muted', isDragging && 'z-10 opacity-80 shadow-md')}
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
      {/* Like shadcn Item: the button stretches over the whole row (after:), delete sits above it */}
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${name}`}
        aria-invalid={incomplete || undefined}
        data-row-link
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1.5 py-1 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 after:absolute after:inset-0 after:content-['']"
      >
        {/* Same thumbnail frame as the banner image rows */}
        <span className="flex h-10 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
          {logo.image.src ? (
            <img src={logo.image.src} alt="" className="size-full object-contain p-1.5" />
          ) : (
            <ImageIcon className="size-4 text-muted-foreground" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{name}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {logo.laptopOnly ? 'Laptop only' : 'All devices'}
          </span>
        </span>
        {incomplete && <Badge variant="destructive">Incomplete</Badge>}
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </button>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="relative" aria-label={`Remove ${name}`} onClick={onRemove}>
            <Trash2 className="text-muted-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Remove logo</TooltipContent>
      </Tooltip>
    </li>
  )
}

// Side drawer with one logo's fields, like the link sheet; edits go straight into the page draft
function LogoSheet({ logo, index, open, showErrors, onOpenChange, onChange }: {
  /** Kept while the drawer animates out, so its content doesn't blank mid-transition */
  logo: FooterPaymentLogo | null
  index: number
  open: boolean
  showErrors: boolean
  onOpenChange: (open: boolean) => void
  onChange: (next: FooterPaymentLogo) => void
}) {
  const id = logo ? `payment-${logo.id}` : 'payment-logo'
  const imageError = showErrors && logo && !logo.image.src ? 'Image is required' : undefined

  return (
    <Sheet open={open && !!logo} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 data-[side=right]:sm:max-w-md">
        {logo && (
          <>
            <SheetHeader className="border-b border-border">
              <SheetTitle>{logoName(logo, index)}</SheetTitle>
              <SheetDescription>Changes apply to the page draft. Save the page to publish them.</SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-4">
              <FieldGroup>
                <IconFields
                  id={id}
                  label="Image"
                  formats="image"
                  value={logo.image}
                  onChange={image => onChange({ ...logo, image })}
                  error={imageError}
                />
                <Field orientation="horizontal">
                  <Checkbox
                    id={`${id}-laptop-only`}
                    checked={logo.laptopOnly}
                    onCheckedChange={v => onChange({ ...logo, laptopOnly: v === true })}
                  />
                  <FieldContent>
                    <FieldLabel htmlFor={`${id}-laptop-only`}>Laptop only</FieldLabel>
                    <FieldDescription>Hidden on phones and tablets, where the footer row is narrower.</FieldDescription>
                  </FieldContent>
                </Field>
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

function PaymentLogosForm({ block, initial }: { block: FooterBlock; initial: FooterPaymentLogo[] }) {
  const [logos, setLogos] = useState(initial)
  // Required-field errors stay hidden until the first save attempt, so a new logo isn't born red
  const [showErrors, setShowErrors] = useState(false)
  // Logo whose drawer is open; the id stays set while the drawer animates out
  const [editing, setEditing] = useState<{ id: string; open: boolean } | null>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const { dirty, saving, save, reset } = useSaveable(logos, setLogos, commitFooterPaymentLogos)

  const valid = logos.every(l => l.image.src)
  const editingIndex = editing ? logos.findIndex(l => l.id === editing.id) : -1
  const editingLogo = editingIndex === -1 ? null : logos[editingIndex]

  function trySave() {
    if (valid) {
      save()
      return
    }
    setShowErrors(true)
    toast.error('Upload an image for every logo to save')
    // After the errors render, bring the first one into view
    requestAnimationFrame(() => {
      formRef.current?.querySelector('[aria-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    setLogos(list => arrayMove(list, list.findIndex(l => l.id === active.id), list.findIndex(l => l.id === over.id)))
  }

  const addButton = (
    <Button
      variant="outline"
      size="sm"
      className="w-fit"
      onClick={() => {
        const logo = newFooterPaymentLogo()
        setLogos(list => [...list, logo])
        setEditing({ id: logo.id, open: true })
      }}
    >
      <Plus data-icon="inline-start" />
      Add logo
    </Button>
  )

  return (
    <>
      <BlockHeader block={block} />
      <div ref={formRef} className="mt-8">
        <section className="flex flex-col gap-5">
          <SectionTitle
            title="Logos"
            description="Shown left to right in this order. Drag to reorder."
            aside={logos.length > 0 && addButton}
          />
          {logos.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-8 text-center">
              <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                <ImagePlus className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No logos yet. The footer shows no payment row.</p>
              {addButton}
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={logos.map(l => l.id)} strategy={verticalListSortingStrategy}>
                <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
                  {logos.map((logo, index) => (
                    <LogoRow
                      key={logo.id}
                      logo={logo}
                      index={index}
                      incomplete={showErrors && !logo.image.src}
                      onEdit={() => setEditing({ id: logo.id, open: true })}
                      onRemove={() => {
                        setLogos(list => list.filter(l => l.id !== logo.id))
                        toastRemoved(`${logoName(logo, index)} removed`, () => setLogos(list => insertAt(list, index, logo)))
                      }}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
        </section>
      </div>

      <LogoSheet
        logo={editingLogo}
        index={editingIndex}
        open={!!editing?.open}
        showErrors={showErrors}
        onOpenChange={open => setEditing(e => (e ? { ...e, open } : e))}
        onChange={next => setLogos(list => list.map(l => (l.id === next.id ? next : l)))}
      />

      <SectionActions dirty={dirty} saving={saving} onSave={trySave} onReset={reset} />
    </>
  )
}

/** Single footer block page. Every footer block has its form; an unknown id falls back to Coming soon. */
export default function FooterBlockPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const block = FOOTER_BLOCKS.find(b => b.id === id) ?? null
  const title = block?.label ?? 'Block not found'

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
          { label: 'Brand settings', href: '/brand-settings' },
          { label: 'Footer', href: FOOTER_HREF },
          { label: title },
        ]}
      />
      <div className="flex flex-1 flex-col px-6 pt-4 pb-8">
        <Button variant="ghost" size="sm" className="-ml-2 mb-4 w-fit text-muted-foreground" asChild>
          <Link href={FOOTER_HREF}>
            <ArrowLeft data-icon="inline-start" />
            Footer
          </Link>
        </Button>

        <div className="max-w-3xl">
          {loading ? (
            <div aria-busy="true" aria-label="Loading block">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="mt-2 h-4 w-72" />
              <div className="mt-8 flex flex-col gap-5">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </div>
            </div>
          ) : !block ? (
            <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-8 text-center">
              <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                <PanelBottom className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">This footer block does not exist.</p>
              <Button variant="outline" size="sm" asChild>
                <Link href={FOOTER_HREF}>Back to footer</Link>
              </Button>
            </div>
          ) : block.id === 'legal' ? (
            <LegalForm block={block} initial={FOOTER.legal} />
          ) : block.id === 'about' ? (
            <AboutForm block={block} initial={FOOTER.about} />
          ) : block.id === 'navigation' ? (
            <NavigationForm block={block} initial={FOOTER.columns} />
          ) : block.id === 'payment-logos' ? (
            <PaymentLogosForm block={block} initial={FOOTER.paymentLogos} />
          ) : (
            <>
              <BlockHeader block={block} />
              <p className="mt-8 text-sm text-muted-foreground">Coming soon.</p>
            </>
          )}
        </div>
      </div>
    </>
  )
}
