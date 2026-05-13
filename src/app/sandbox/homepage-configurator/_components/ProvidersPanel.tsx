"use client"

import { useState } from "react"
import Link from "next/link"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AbbrAvatar, PanelContent } from "@/components/shared"
import { AddProviderDialog } from "@/app/sandbox/page-manager/_components/Dialogs"
import { type Provider, INITIAL_PROVIDERS } from "@/app/sandbox/page-manager/_components/types"

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
                  <AbbrAvatar abbr={prov.abbr} />
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
                    <Badge
                      variant="ghost"
                      className={prov.live ? "bg-success-bg text-success" : ""}
                    >
                      {prov.live ? "Shown" : "Hidden"}
                    </Badge>
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
