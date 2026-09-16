'use client'
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
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface SortableChipsProps {
  /** Ordered, unique values. */
  items: string[]
  onChange: (items: string[]) => void
}

function Chip({ item, onRemove }: { item: string; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item })

  return (
    <Badge
      ref={setNodeRef}
      variant="secondary"
      className={cn(isDragging && 'z-10 opacity-80')}
      // Позиция элемента во время перетаскивания -- единственный оправданный inline-style
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <button
        type="button"
        aria-label={`Reorder ${item}`}
        className="cursor-grab touch-none rounded-full p-0.5 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-3" />
      </button>
      {item}
      <button
        type="button"
        aria-label={`Remove ${item}`}
        onClick={onRemove}
        className="rounded-full p-0.5 text-muted-foreground transition-colors outline-none hover:bg-foreground/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="size-3" />
      </button>
    </Badge>
  )
}

/** Removable chips that can be reordered by dragging the grip (or with the keyboard: space, arrows, space). */
export function SortableChips({ items, onChange }: SortableChipsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    onChange(arrayMove(items, items.indexOf(String(active.id)), items.indexOf(String(over.id))))
  }

  if (items.length === 0) return null

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items} strategy={horizontalListSortingStrategy}>
        <div className="flex flex-wrap items-center gap-2">
          {items.map(item => (
            <Chip key={item} item={item} onRemove={() => onChange(items.filter(i => i !== item))} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
