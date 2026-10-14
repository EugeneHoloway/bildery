"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeft, Settings, ShieldCheck } from "lucide-react"

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export const SETTINGS_ROOT = "/settings"

const items = [
  { title: "Operators & Brands", url: "/settings/operators-brands" },
  { title: "Games Providers", url: "/settings/game-providers" },
]

// Replaces the team switcher while inside /settings: a fixed console title, nothing to switch
export function ConsoleHeader() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild>
          <Link href={items[0].url}>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <ShieldCheck />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Console</span>
              <span className="truncate text-xs">Superadmin settings</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function NavSettings({ backHref }: { backHref: string }) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Back to app">
            <Link href={backHref}>
              <ArrowLeft />
              <span>Back to app</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Platform settings">
            <Link href={items[0].url}>
              <Settings />
              <span>Platform settings</span>
            </Link>
          </SidebarMenuButton>
          <SidebarMenuSub>
            {items.map((item) => (
              <SidebarMenuSubItem key={item.url}>
                <SidebarMenuSubButton asChild isActive={pathname === item.url}>
                  <Link href={item.url}>
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
