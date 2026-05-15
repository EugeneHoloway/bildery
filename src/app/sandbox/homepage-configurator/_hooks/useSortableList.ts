"use client"

import { useState } from "react"
import {
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"

/** Заглушка accessibility-анонсов для DndContext -- убирает лишние ARIA-live регионы */
const DND_ACCESSIBILITY = {
  announcements: {
    onDragStart: () => "",
    onDragOver:  () => "",
    onDragEnd:   () => "",
    onDragCancel: () => "",
  },
}

interface SortableItem {
  id: string
}

/**
 * Хук для управления сортируемым списком через DnD.
 * Возвращает items, sensors, collisionDetection, accessiblity и handleDragEnd -- готово к передаче в DndContext.
 */
export function useSortableList<T extends SortableItem>(initialItems: T[]) {
  const [items, setItems] = useState<T[]>(initialItems)

  const sensors = useSensors(useSensor(PointerSensor))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setItems((prev) => {
      const oldIndex = prev.findIndex((x) => x.id === active.id)
      const newIndex = prev.findIndex((x) => x.id === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  return {
    items,
    setItems,
    sensors,
    collisionDetection: closestCenter,
    accessibility: DND_ACCESSIBILITY,
    handleDragEnd,
  }
}
