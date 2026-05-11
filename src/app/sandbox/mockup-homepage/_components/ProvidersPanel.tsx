"use client"

import * as React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { FieldGroup } from "@/components/shared"
import { cn } from "@/lib/utils"

interface ToggleItem { id: string; label: string; enabled: boolean }

const INITIAL_CHIPS: ToggleItem[] = [
  { id: "ezugi",   label: "Ezugi",          enabled: true  },
  { id: "pp",      label: "Pragmatic Play",  enabled: true  },
  { id: "evo",     label: "Evolution",       enabled: true  },
  { id: "png",     label: "Play'n GO",       enabled: true  },
  { id: "netent",  label: "NetEnt",          enabled: true  },
  { id: "amatic",  label: "Amatic",          enabled: true  },
  { id: "ygg",     label: "Yggdrasil",       enabled: false },
  { id: "hacksaw", label: "Hacksaw",         enabled: false },
  { id: "push",    label: "Push Gaming",     enabled: false },
  { id: "relax",   label: "Relax Gaming",    enabled: false },
]

export function ProvidersPanel() {
  const [chips, setChips] = useState<ToggleItem[]>(INITIAL_CHIPS)

  function toggleChip(id: string) {
    setChips((prev) => prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)))
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-col gap-5 p-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">Visible providers — click to toggle</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <button key={chip.id} onClick={() => toggleChip(chip.id)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  chip.enabled
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                )}>
                {chip.label}
              </button>
            ))}
          </div>
        </div>
        <FieldGroup label="Display limit" className="max-w-[200px]">
          <Input type="number" defaultValue="8" min={4} max={20} />
        </FieldGroup>
      </div>
    </div>
  )
}
