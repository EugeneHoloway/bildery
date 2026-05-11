"use client"

import * as React from "react"
import { useState } from "react"
import { SortableRow } from "./shared"

interface ToggleItem { id: string; label: string; enabled: boolean }

interface ToggleListPanelProps {
  initial: ToggleItem[]
  description: string
}

export function ToggleListPanel({ initial, description }: ToggleListPanelProps) {
  const [items, setItems] = useState<ToggleItem[]>(initial)

  function toggle(id: string) {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, enabled: !x.enabled } : x)))
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-col gap-2 p-6">
        <p className="text-xs font-medium text-muted-foreground">{description}</p>
        <div className="mt-1 flex flex-col gap-2">
          {items.map((item) => (
            <SortableRow key={item.id} label={item.label} enabled={item.enabled} onToggle={() => toggle(item.id)} />
          ))}
        </div>
      </div>
    </div>
  )
}
