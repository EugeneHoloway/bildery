"use client"

import { useState } from "react"
import { GripVertical, ImagePlay, LayoutGrid, TrendingUp, Star, Building2, Gift, Activity, FileText } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { PageShell, PanelLayout, PanelSidebar, PanelSidebarSection, PanelSidebarItem } from "@/components/shared"

import { SectionBadge, type BadgeType } from "./_components/shared"
import { BannerPanel }     from "./_components/BannerPanel"
import { ToggleListPanel } from "./_components/ToggleListPanel"
import { TopGamesPanel }   from "./_components/TopGamesPanel"
import { EditorialPanel }  from "./_components/EditorialPanel"
import { ProvidersPanel }  from "./_components/ProvidersPanel"
import { SeoPanel }        from "./_components/SeoPanel"
import { FeedPanel }       from "./_components/FeedPanel"

// ─── Types & data ─────────────────────────────────────────────────────────────

type SectionId = "banner" | "categories" | "top" | "editorial" | "providers" | "promos" | "feed" | "seo"

interface Section {
  id: SectionId
  label: string
  description: string
  icon: React.ReactNode
  badge?: BadgeType
  enabled: boolean
}

const INITIAL_SECTIONS: Section[] = [
  { id: "banner",     label: "Banner slider",   description: "Manage promotional banners",       icon: <ImagePlay  className="size-4" />, enabled: true  },
  { id: "categories", label: "Game categories", description: "Toggle and reorder tabs",          icon: <LayoutGrid className="size-4" />, enabled: true  },
  { id: "top",        label: "Top games",       description: "Auto or manual game selection",    icon: <TrendingUp className="size-4" />, badge: "auto",   enabled: true  },
  { id: "editorial",  label: "Editor's picks",  description: "Hand-pick games for this section", icon: <Star       className="size-4" />, badge: "manual", enabled: true  },
  { id: "providers",  label: "Game providers",  description: "Show/hide provider logos",         icon: <Building2  className="size-4" />, enabled: true  },
  { id: "promos",     label: "Promo cards",     description: "Feature cards for missions, VIP",  icon: <Gift       className="size-4" />, enabled: false },
  { id: "feed",       label: "Live bets feed",  description: "Recent wins table",                icon: <Activity   className="size-4" />, enabled: true  },
  { id: "seo",        label: "SEO text",        description: "Displayed at bottom of homepage",  icon: <FileText   className="size-4" />, enabled: true  },
]

const INITIAL_CATEGORIES = [
  { id: "top",   label: "TOP",         enabled: true  },
  { id: "new",   label: "NEW",         enabled: true  },
  { id: "hot",   label: "HOT",         enabled: true  },
  { id: "slots", label: "Slots",       enabled: true  },
  { id: "live",  label: "Live Casino", enabled: true  },
  { id: "crash", label: "Crash Games", enabled: false },
  { id: "table", label: "Table Games", enabled: true  },
]

const INITIAL_PROMOS = [
  { id: "missions",    label: "Daily missions", enabled: true  },
  { id: "vip",         label: "VIP club",       enabled: true  },
  { id: "tournaments", label: "Tournaments",    enabled: true  },
  { id: "wheel",       label: "Lucky wheel",    enabled: false },
  { id: "shop",        label: "Prize shop",     enabled: true  },
  { id: "cashback",    label: "Cashback",       enabled: true  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MockupHomepagePage() {
  const [activeId, setActiveId] = useState<SectionId>("banner")
  const [sections, setSections] = useState<Section[]>(INITIAL_SECTIONS)

  const activeSection = sections.find((s) => s.id === activeId)!

  function toggleSection(id: SectionId, e: React.MouseEvent) {
    e.stopPropagation()
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)))
  }

  function renderPanel() {
    switch (activeId) {
      case "banner":     return <BannerPanel />
      case "categories": return <ToggleListPanel initial={INITIAL_CATEGORIES} description="Drag to reorder · toggle to show/hide" />
      case "top":        return <TopGamesPanel />
      case "editorial":  return <EditorialPanel />
      case "providers":  return <ProvidersPanel />
      case "promos":     return <ToggleListPanel initial={INITIAL_PROMOS} description="Toggle promo cards to show/hide on homepage" />
      case "feed":       return <FeedPanel />
      case "seo":        return <SeoPanel />
    }
  }

  const sidebar = (
    <PanelSidebar width="w-[240px]">
      <PanelSidebarSection label="Page sections">
        {sections.map((section) => (
          <PanelSidebarItem
            key={section.id}
            isActive={section.id === activeId}
            onClick={() => setActiveId(section.id)}
          >
            <GripVertical className="size-3.5 shrink-0 text-muted-foreground/40" />
            <span className="flex-1 truncate font-medium">{section.label}</span>
            {section.badge && <SectionBadge type={section.badge} />}
            <Switch
              checked={section.enabled}
              onCheckedChange={() => {}}
              onClick={(e) => toggleSection(section.id, e as React.MouseEvent)}
              className="shrink-0"
            />
          </PanelSidebarItem>
        ))}
      </PanelSidebarSection>
    </PanelSidebar>
  )

  return (
    <PageShell
      breadcrumbs={[
        { label: "Sandbox", href: "/sandbox" },
        { label: "Homepage configurator" },
      ]}
      title="Homepage configurator"
      description="Configure sections of the casino homepage. Toggle visibility, reorder blocks, and edit content."
    >
      <PanelLayout sidebar={sidebar}>
        {renderPanel()}
      </PanelLayout>
    </PageShell>
  )
}
