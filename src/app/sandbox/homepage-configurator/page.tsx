"use client"

import { useState } from "react"
import { GripVertical, ImagePlay, LayoutGrid, TrendingUp, Star, Building2, Gift, Activity, FileText, Plus } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { PageShell, PanelLayout, PanelSidebar, PanelSidebarSection, PanelSidebarItem } from "@/components/shared"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

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

// ─── AddSectionDialog ─────────────────────────────────────────────────────────

function AddSectionDialog({ onAdd }: { onAdd: (label: string) => void }) {
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState("")

  function handleAdd() {
    if (!label.trim()) return
    onAdd(label.trim())
    setLabel("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full">
          <Plus className="size-3.5" />
          Add section
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add page section</DialogTitle>
          <DialogDescription>Enter a name for the new section. It will be added to the bottom of the list.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5 py-1">
          <Label className="text-xs font-medium text-muted-foreground">Section name</Label>
          <Input
            autoFocus
            placeholder="e.g. Featured tournaments"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline" size="sm">Cancel</Button></DialogClose>
          <Button size="sm" disabled={!label.trim()} onClick={handleAdd}>Add section</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── SortableSectionItem ──────────────────────────────────────────────────────

function SortableSectionItem({
  section,
  isActive,
  onActivate,
  onToggle,
}: {
  section: Section
  isActive: boolean
  onActivate: () => void
  onToggle: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <PanelSidebarItem as="div" isActive={isActive} onClick={onActivate}>
        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0 cursor-grab active:cursor-grabbing touch-none text-muted-foreground/40 hover:text-muted-foreground"
          onClick={(e) => e.stopPropagation()}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-3.5" />
        </Button>
        <span className="flex-1 truncate">{section.label}</span>
        {section.badge && <SectionBadge type={section.badge} />}
        <Switch
          checked={section.enabled}
          onCheckedChange={() => {}}
          onClick={(e) => { e.stopPropagation(); onToggle() }}
          className="shrink-0"
        />
      </PanelSidebarItem>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MockupHomepagePage() {
  const [activeId, setActiveId] = useState<SectionId>("banner")
  const [sections, setSections] = useState<Section[]>(INITIAL_SECTIONS)

  const sensors = useSensors(useSensor(PointerSensor))

  function addSection(label: string) {
    const id = ("custom-" + Date.now()) as SectionId
    setSections((prev) => [...prev, { id, label, description: "", icon: <FileText className="size-4" />, enabled: true }])
  }

  function toggleSection(id: SectionId) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setSections((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id)
      const newIndex = prev.findIndex((s) => s.id === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
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
      <PanelSidebarSection label="Page sections" headerAction={<AddSectionDialog onAdd={addSection} />}>
        <DndContext id="sidebar-sections-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} accessibility={{ announcements: { onDragStart: () => '', onDragOver: () => '', onDragEnd: () => '', onDragCancel: () => '' } }}>
          <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {sections.map((section) => (
              <SortableSectionItem
                key={section.id}
                section={section}
                isActive={section.id === activeId}
                onActivate={() => setActiveId(section.id)}
                onToggle={() => toggleSection(section.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
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
      <Separator className="mb-6" />
      <PanelLayout flat sidebar={sidebar}>
        {renderPanel()}
      </PanelLayout>
    </PageShell>
  )
}
