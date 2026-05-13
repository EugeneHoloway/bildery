"use client"

import * as React from "react"
import { useState } from "react"
import { GripVertical } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { PanelContent } from "@/components/shared"
import { cn } from "@/lib/utils"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface ToggleItem { id: string; label: string; enabled: boolean }

interface ToggleListPanelProps {
  initial: ToggleItem[]
  description: string
}

function SortableRow({ item, onToggle }: { item: ToggleItem; onToggle: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5 transition-colors hover:bg-muted/50"
    >
      <button
        type="button"
        className="shrink-0 cursor-grab active:cursor-grabbing touch-none text-muted-foreground/40 hover:text-muted-foreground"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-3.5" />
      </button>
      <span className={cn("flex-1 text-sm font-medium", item.enabled ? "text-foreground" : "text-muted-foreground")}>
        {item.label}
      </span>
      <Switch checked={item.enabled} onCheckedChange={onToggle} />
    </div>
  )
}

export function ToggleListPanel({ initial, description }: ToggleListPanelProps) {
  const [items, setItems] = useState<ToggleItem[]>(initial)

  const sensors = useSensors(useSensor(PointerSensor))

  function toggle(id: string) {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, enabled: !x.enabled } : x)))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setItems((prev) => {
      const oldIndex = prev.findIndex((x) => x.id === active.id)
      const newIndex = prev.findIndex((x) => x.id === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  return (
    <PanelContent className="gap-2">
      <p className="text-xs font-medium text-muted-foreground">{description}</p>
      <DndContext
        id="toggle-list-dnd"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        accessibility={{ announcements: { onDragStart: () => '', onDragOver: () => '', onDragEnd: () => '', onDragCancel: () => '' } }}
      >
        <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
          <div className="mt-1 flex flex-col gap-2">
            {items.map((item) => (
              <SortableRow key={item.id} item={item} onToggle={() => toggle(item.id)} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </PanelContent>
  )
}
