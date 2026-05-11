"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PageShell, PanelLayout, PanelSidebar, PanelSidebarSection, PanelSidebarItem, StatusBadge, StatusDot } from "@/components/shared"
import { cn } from "@/lib/utils"

import { type SitePage, type PageStatus, SYSTEM_PAGES, CUSTOM_PAGES } from "./_components/types"
import { NewPageDialog, DeletePageDialog } from "./_components/Dialogs"
import { SimpleView }    from "./_components/SimpleView"
import { ProvidersView } from "./_components/ProvidersView"

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MockupPagesPage() {
  const [activeId,     setActiveId]     = useState<string>("providers")
  const [customPages,  setCustomPages]  = useState<SitePage[]>(CUSTOM_PAGES)
  const [pageStatuses, setPageStatuses] = useState<Record<string, PageStatus>>({
    providers: "draft", about: "live", blog: "hidden",
  })

  const allPages   = [...SYSTEM_PAGES, ...customPages]
  const activePage = allPages.find((p) => p.id === activeId) ?? allPages[0]

  const getStatus  = (id: string): PageStatus => pageStatuses[id] ?? activePage.status
  const setStatus  = (id: string, s: PageStatus) => setPageStatuses((prev) => ({ ...prev, [id]: s }))

  function handleDeletePage(id: string) {
    setCustomPages((prev) => prev.filter((p) => p.id !== id))
    if (activeId === id) setActiveId("providers")
  }

  function renderView() {
    const status = getStatus(activeId)
    switch (activeId) {
      case "homepage":
        return <SimpleView page={activePage} status="live"><Button size="sm">Edit sections</Button></SimpleView>
      case "promotions":
        return <SimpleView page={activePage} status="live"><Button size="sm">Manage promos</Button></SimpleView>
      case "vip":
        return (
          <SimpleView page={activePage} status="hidden">
            <Button variant="outline" size="sm">Show page</Button>
            <Button size="sm">Edit content</Button>
          </SimpleView>
        )
      case "providers":
        return (
          <ProvidersView
            page={activePage}
            status={status}
            onPublish={() => setStatus("providers", "live")}
            onDelete={() => {}}
          />
        )
      case "about":
        return (
          <SimpleView page={activePage} status={status}>
            <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
              onClick={() => setStatus("about", "hidden")}>
              Hide page
            </Button>
            <Button size="sm">Edit content</Button>
          </SimpleView>
        )
      case "blog":
        return (
          <SimpleView page={activePage} status={status}>
            <Button variant="outline" size="sm" onClick={() => setStatus("blog", "live")}>Show page</Button>
            <DeletePageDialog pageName={activePage.label} onConfirm={() => handleDeletePage("blog")} />
          </SimpleView>
        )
      default: {
        const cp = customPages.find((p) => p.id === activeId)
        if (!cp) return null
        return (
          <SimpleView page={cp} status={status}>
            <DeletePageDialog pageName={cp.label} onConfirm={() => handleDeletePage(cp.id)} />
            <Button size="sm" onClick={() => setStatus(cp.id, "live")}>Publish</Button>
          </SimpleView>
        )
      }
    }
  }

  function NavItem({ page }: { page: SitePage }) {
    const isActive  = page.id === activeId
    const navStatus = getStatus(page.id)
    return (
      <PanelSidebarItem isActive={isActive} onClick={() => setActiveId(page.id)}>
        <StatusDot status={navStatus} />
        <span className={cn("flex-1 truncate", navStatus === "hidden" && !isActive && "opacity-50")}>
          {page.label}
        </span>
        {page.isSystem && (
          <span className="rounded px-1 py-px text-3xs font-medium uppercase tracking-wide text-muted-foreground bg-muted">
            sys
          </span>
        )}
      </PanelSidebarItem>
    )
  }

  const sidebar = (
    <PanelSidebar>
      <div className="border-b border-border px-4 py-3">
        <p className="mb-2.5 text-2xs font-semibold uppercase tracking-label text-muted-foreground">
          Site pages
        </p>
        <NewPageDialog
          onCreated={(page) => {
            setCustomPages((prev) => [...prev, page])
            setActiveId(page.id)
          }}
        />
      </div>
      <PanelSidebarSection label="System pages">
        {SYSTEM_PAGES.map((page) => <NavItem key={page.id} page={page} />)}
      </PanelSidebarSection>
      <div className="mx-4 h-px bg-border" />
      <PanelSidebarSection label="Custom pages">
        {customPages.map((page) => <NavItem key={page.id} page={page} />)}
      </PanelSidebarSection>
    </PanelSidebar>
  )

  return (
    <PageShell
      breadcrumbs={[
        { label: "Sandbox", href: "/sandbox" },
        { label: "Page manager" },
      ]}
      title="Page manager"
      description="Create, configure and publish pages. Manage URL slugs, visibility, SEO and content."
    >
      <PanelLayout sidebar={sidebar}>
        {renderView()}
      </PanelLayout>
    </PageShell>
  )
}
