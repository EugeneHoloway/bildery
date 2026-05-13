"use client"

import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FieldGroup, PanelContent } from "@/components/shared"

interface GameCard {
  id: string
  name: string
  provider: string
  abbr: string
}

const GAMES: GameCard[] = [
  { id: "sweet-bonanza",      name: "Sweet Bonanza",     provider: "Pragmatic Play", abbr: "PP"  },
  { id: "gates-of-olympus",   name: "Gates of Olympus",  provider: "Pragmatic Play", abbr: "PP"  },
  { id: "big-bass",           name: "Big Bass Bonanza",  provider: "Pragmatic Play", abbr: "PP"  },
  { id: "wolf-gold",          name: "Wolf Gold",         provider: "Pragmatic Play", abbr: "PP"  },
  { id: "lightning-roulette", name: "Lightning Roulette",provider: "Evolution",      abbr: "EVO" },
  { id: "crazy-time",         name: "Crazy Time",        provider: "Evolution",      abbr: "EVO" },
  { id: "monopoly-live",      name: "Monopoly Live",     provider: "Evolution",      abbr: "EVO" },
  { id: "starburst",          name: "Starburst",         provider: "NetEnt",         abbr: "NET" },
  { id: "gonzos-quest",       name: "Gonzo's Quest",     provider: "NetEnt",         abbr: "NET" },
  { id: "book-of-dead",       name: "Book of Dead",      provider: "Play'n GO",      abbr: "PNG" },
  { id: "reactoonz",          name: "Reactoonz",         provider: "Play'n GO",      abbr: "PNG" },
  { id: "jammin-jars",        name: "Jammin' Jars",      provider: "Play'n GO",      abbr: "PNG" },
]

export function EditorialPanel() {
  const [gameSearch, setGameSearch] = useState("")
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())

  const filteredGames = gameSearch
    ? GAMES.filter((g) => g.name.toLowerCase().includes(gameSearch.toLowerCase()))
    : GAMES

  const allChecked  = filteredGames.length > 0 && filteredGames.every((g) => checkedIds.has(g.id))
  const someChecked = !allChecked && filteredGames.some((g) => checkedIds.has(g.id))

  function toggleCheck(id: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    setCheckedIds(allChecked ? new Set() : new Set(filteredGames.map((g) => g.id)))
  }

  return (
    <PanelContent>
      <FieldGroup label="Section title" className="max-w-[400px]">
        <Input defaultValue="Editor's picks" />
      </FieldGroup>

      <div className="flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Featured games</h3>
          <p className="text-xs text-muted-foreground">Select which providers appear on this page and toggle their visibility.</p>
        </div>
        <div className="flex items-center justify-between">
          <Input
            placeholder="Search games…"
            className="max-w-[400px]"
            value={gameSearch}
            onChange={(e) => setGameSearch(e.target.value)}
          />
          <span className="text-sm text-muted-foreground shrink-0">
            {checkedIds.size} / {GAMES.length} selected
          </span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allChecked}
                  data-state={someChecked ? "indeterminate" : allChecked ? "checked" : "unchecked"}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead className="w-14">Image</TableHead>
              <TableHead className="w-[200px]">Game</TableHead>
              <TableHead className="w-[200px]">Provider</TableHead>
              <TableHead />
              <TableHead className="w-px whitespace-nowrap">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGames.map((game) => (
              <TableRow key={game.id}>
                <TableCell>
                  <Checkbox
                    checked={checkedIds.has(game.id)}
                    onCheckedChange={() => toggleCheck(game.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-sm font-bold tracking-wide text-foreground">
                    {game.abbr}
                  </div>
                </TableCell>
                <TableCell className="text-foreground">{game.name}</TableCell>
                <TableCell className="text-muted-foreground">{game.provider}</TableCell>
                <TableCell />
                <TableCell>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/sandbox/seo-editor">View details</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </PanelContent>
  )
}
