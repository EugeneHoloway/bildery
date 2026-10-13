"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeft, Settings } from "lucide-react"

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
          <SidebarMenuButton asChild tooltip="Organization settings">
            <Link href={items[0].url}>
              <Settings />
              <span>Organization settings</span>
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
