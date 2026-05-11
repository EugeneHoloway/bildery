import * as React from "react"
import { Globe } from "lucide-react"
import { StatusBadge } from "@/components/shared"
import { InfoBox } from "@/components/shared"
import { type SitePage, type PageStatus } from "./types"

interface SimpleViewProps {
  page: SitePage
  status: PageStatus
  children: React.ReactNode
}

export function SimpleView({ page, status, children }: SimpleViewProps) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5">
        <div>
          <p className="text-sm font-medium leading-tight">{page.label}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Globe className="size-3" />{page.url}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          {children}
        </div>
      </div>
      <div className="p-5">
        <InfoBox>{page.info}</InfoBox>
      </div>
    </>
  )
}
