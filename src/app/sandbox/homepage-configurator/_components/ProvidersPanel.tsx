"use client"

import { useState } from "react"
import Link from "next/link"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PanelContent } from "@/components/shared"
import { AddProviderDialog } from "@/app/sandbox/page-manager/_components/Dialogs"
import { type Provider, INITIAL_PROVIDERS } from "@/app/sandbox/page-manager/_components/types"
import { cn } from "@/lib/utils"

export function ProvidersPanel() {
  const [providers, setProviders] = useState<Provider[]>(INITIAL_PROVIDERS)

  function toggleLive(id: string) {
    setProviders((prev) => prev.map((p) => (p.id === id ? { ...p, live: !p.live } : p)))
  }

  return (
    <PanelContent>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Providers to display</h3>
            <p className="text-xs text-muted-foreground">Configure which providers are live on your site.</p>
          </div>
          <AddProviderDialog onAdd={(name) => {
            const abbr = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 3)
            setProviders((prev) => [...prev, { id: "new-" + Date.now(), abbr, name, games: 0, enabledGames: 0, selected: true, live: false }])
          }} />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">Image</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead className="w-px whitespace-nowrap">Status</TableHead>
              <TableHead className="w-px whitespace-nowrap">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providers.map((prov) => (
              <TableRow key={prov.id}>
                <TableCell>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-sm font-bold tracking-wide text-foreground">
                    {prov.abbr}
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm font-semibold text-foreground">{prov.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {prov.enabledGames} / {prov.games} games · {prov.games > 0
                      ? `${Math.round(prov.enabledGames / prov.games * 100)}% active`
                      : "0% active"}
                  </p>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                      prov.live ? "bg-success-bg text-success" : "bg-muted text-muted-foreground"
                    )}>
                      Shown
                    </span>
                    <Switch checked={prov.live} onCheckedChange={() => toggleLive(prov.id)} />
                  </div>
                </TableCell>
                <TableCell className="text-right">
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
