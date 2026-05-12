"use client"

import { useState } from "react"
import { Home, Tag, Crown, Building2, Info, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { PageShell, PanelLayout, PanelSidebar, PanelSidebarSection, StatusBadge } from "@/components/shared"
import { cn } from "@/lib/utils"

import { type SitePage, type PageStatus, SYSTEM_PAGES, CUSTOM_PAGES } from "./_components/types"
import { DeletePageDialog } from "./_components/Dialogs"
import { SimpleView }    from "./_components/SimpleView"
import { ProvidersView } from "./_components/ProvidersView"

const PAGE_ICONS: Record<string, React.ReactNode> = {
  homepage:   <Home      className="size-4 shrink-0" />,
  promotions: <Tag       className="size-4 shrink-0" />,
  vip:        <Crown     className="size-4 shrink-0" />,
  providers:  <Building2 className="size-4 shrink-0" />,
  about:      <Info      className="size-4 shrink-0" />,
  blog:       <FileText  className="size-4 shrink-0" />,
}

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
    const isActive = page.id === activeId
    return (
      <Button
        variant="ghost"
        onClick={() => setActiveId(page.id)}
        className={cn(
          "w-full justify-start gap-2.5",
          isActive
            ? "bg-zinc-100 text-foreground font-medium hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-800"
            : "bg-transparent text-muted-foreground font-normal hover:bg-zinc-100 hover:text-foreground dark:hover:bg-zinc-800"
        )}
      >
        {PAGE_ICONS[page.id]}
        <span className="truncate">{page.label}</span>
      </Button>
    )
  }

  const sidebar = (
    <PanelSidebar className="bg-background pt-5 pb-3 pr-6">
      <p className="px-2 pb-2 text-xs font-semibold text-muted-foreground">System pages</p>
      {SYSTEM_PAGES.map((page) => <NavItem key={page.id} page={page} />)}
      <Separator className="my-3" />
      <p className="px-2 pb-2 text-xs font-semibold text-muted-foreground">Custom pages</p>
      {customPages.map((page) => <NavItem key={page.id} page={page} />)}
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
      <Separator className="mb-8" />
      <PanelLayout flat sidebar={sidebar}>
        {renderView()}
      </PanelLayout>
    </PageShell>
  )
}
