"use client"

import * as React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { FieldGroup, PanelContent } from "@/components/shared"
import { ToggleChip } from "./shared"

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
    <PanelContent>
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">Visible providers — click to toggle</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <ToggleChip
                key={chip.id}
                label={chip.label}
                enabled={chip.enabled}
                onToggle={() => toggleChip(chip.id)}
              />
            ))}
          </div>
        </div>
        <FieldGroup label="Display limit" className="max-w-[200px]">
          <Input type="number" defaultValue="8" min={4} max={20} />
        </FieldGroup>
    </PanelContent>
  )
}
