'use client'
import { useState } from 'react'
import { GripVertical, LayoutTemplate, Plus } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { SectionActions, SectionHeader, useSaveable } from '../_lib/section'
import { commitHome, HOME, HOME_SECTION_TYPE_IDS, HOME_SECTION_TYPES, newHomeSection, type HomeSection as HomeBlock, type HomeSectionType } from '../_lib/home'
import { BlockTitle, RemoveButton, SectionLink } from './nav-shared'
import { insertAt, toastRemoved } from './list-actions'

// Sortable row like the sidebar rows: grip, position, muted icon tile, name + hint, enabled switch, remove
function HomeSectionRow({ section, index, onToggle, onRemove }: {
  section: HomeBlock
  index: number
  onToggle: (enabled: boolean) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })
  const meta = HOME_SECTION_TYPES[section.type]
  const Icon = meta.icon
  // The same type can repeat (several Game Lists), so labels carry the position
  const name = `${meta.label} (${index + 1})`

  return (
    <li
      ref={setNodeRef}
      // Позиция элемента во время перетаскивания -- единственный оправданный inline-style
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('relative flex items-center gap-1 bg-background px-2 py-2', isDragging && 'z-10 opacity-80 shadow-md')}
    >
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
      <span className="w-5 shrink-0 text-center text-xs tabular-nums text-muted-foreground">{index + 1}</span>
      <span className="flex min-w-0 flex-1 items-center gap-3 px-1.5 py-0.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn('block truncate text-sm font-medium', !section.enabled && 'text-muted-foreground')}>{meta.label}</span>
          <span className="block text-xs text-muted-foreground">
            {section.type === 'banner' ? (
              <>Banner items are managed in <SectionLink section="banners">Banners</SectionLink>.</>
            ) : (
              meta.hint
            )}
          </span>
        </span>
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* Wrapper takes the trigger's data-state/data-slot, which would otherwise override the Switch's own */}
          <span className="mx-2 flex shrink-0">
            <Switch checked={section.enabled} onCheckedChange={onToggle} aria-label={`${section.enabled ? 'Disable' : 'Enable'} ${name}`} />
          </span>
        </TooltipTrigger>
        <TooltipContent>{section.enabled ? 'Shown on the home page' : 'Hidden from the home page'}</TooltipContent>
      </Tooltip>
      <RemoveButton label={`Remove ${name}`} onClick={onRemove} />
    </li>
  )
}

function AddSectionMenu({ onAdd }: { onAdd: (type: HomeSectionType) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus data-icon="inline-start" />
          Add section
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        {HOME_SECTION_TYPE_IDS.map(type => {
          const { label, icon: Icon } = HOME_SECTION_TYPES[type]
          return (
            <DropdownMenuItem key={type} onSelect={() => onAdd(type)}>
              <Icon />
              {label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function HomeSection() {
  const [sections, setSections] = useState<HomeBlock[]>(HOME.sections)
  const { dirty, saving, save, reset } = useSaveable({ sections }, v => setSections(v.sections), commitHome)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )
  const enabledCount = sections.filter(s => s.enabled).length

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    setSections(list => arrayMove(list, list.findIndex(s => s.id === active.id), list.findIndex(s => s.id === over.id)))
  }

  // New sections go to the end of the page; drag them into place afterwards
  function add(type: HomeSectionType) {
    setSections(list => [...list, newHomeSection(type)])
  }

  function remove(section: HomeBlock, at: number) {
    setSections(list => list.filter(s => s.id !== section.id))
    toastRemoved(`${HOME_SECTION_TYPES[section.type].label} removed`, () => setSections(list => insertAt(list, at, section)))
  }

  return (
    <>
      <SectionHeader title="Home" description="Configure dynamic content blocks shown on the home page." />

      <section className="mt-8 flex flex-col gap-4">
        <BlockTitle
          title="Page Sections"
          description={
            <p>
              Shown top to bottom in this order -- drag to reorder. Disabled sections keep their settings but
              aren&apos;t rendered.
            </p>
          }
          aside={
            sections.length > 0 && (
              <span className="text-sm text-muted-foreground tabular-nums">
                {enabledCount}/{sections.length} enabled
              </span>
            )
          }
        />

        {sections.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-4 py-8 text-center">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
              <LayoutTemplate className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No sections yet. The home page is empty.</p>
            <AddSectionMenu onAdd={add} />
          </div>
        ) : (
          <>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
                  {sections.map((section, index) => (
                    <HomeSectionRow
                      key={section.id}
                      section={section}
                      index={index}
                      onToggle={enabled => setSections(list => list.map(s => (s.id === section.id ? { ...s, enabled } : s)))}
                      onRemove={() => remove(section, index)}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
            <div>
              <AddSectionMenu onAdd={add} />
            </div>
          </>
        )}
      </section>

      <SectionActions dirty={dirty} saving={saving} onSave={save} onReset={reset} />
    </>
  )
}
