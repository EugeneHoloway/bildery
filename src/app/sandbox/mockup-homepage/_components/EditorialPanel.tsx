"use client"

import * as React from "react"
import { useState } from "react"
import { Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { FieldGroup } from "@/components/shared"
import { cn } from "@/lib/utils"

interface GameSlot { id: string; name: string; selected: boolean }

const INITIAL_GAMES: GameSlot[] = [
  { id: "g1", name: "Olympus",    selected: true  },
  { id: "g2", name: "Book Dead",  selected: true  },
  { id: "g3", name: "Dog House",  selected: true  },
  { id: "g4", name: "Sweet Bon.", selected: true  },
  { id: "g5", name: "Pharaoh",    selected: true  },
  { id: "g6", name: "Big Bass",   selected: true  },
  { id: "g7", name: "Starburst",  selected: true  },
  { id: "g8", name: "",           selected: false },
]

export function EditorialPanel() {
  const [games, setGames] = useState<GameSlot[]>(INITIAL_GAMES)
  const selectedCount = games.filter((g) => g.selected).length

  function toggleGame(id: string) {
    setGames((prev) => prev.map((g) => (g.id === id ? { ...g, selected: !g.selected } : g)))
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-col gap-5 p-6">
        <FieldGroup label="Section title" className="max-w-[400px]">
          <Input defaultValue="Editor's picks" />
        </FieldGroup>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">
            Selected games — {selectedCount} of {games.length} slots
          </p>
          <div className="mt-1 grid grid-cols-7 gap-2">
            {games.map((game) => (
              <button key={game.id} onClick={() => toggleGame(game.id)}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-xl border text-3xs font-semibold transition-all",
                  game.selected
                    ? "border-foreground bg-background text-foreground"
                    : "border-border bg-muted/40 text-muted-foreground hover:border-foreground/30 hover:bg-muted",
                )}>
                {game.selected && game.name
                  ? <span className="px-1 leading-tight">{game.name}</span>
                  : <Plus className="size-3 m-auto text-muted-foreground/50" />}
                {game.selected && (
                  <span className="absolute right-1 top-0.5 text-3xs font-bold text-foreground/50">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <FieldGroup label="Search game catalog" className="max-w-[400px]">
          <Input placeholder="Type game name or provider…" />
        </FieldGroup>
      </div>
    </div>
  )
}
