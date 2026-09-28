'use client'
import { ChevronDown, ChevronRight, Globe, Link2, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { IconImage } from './icon-image'
import { groupLabel, resolveLabel, rowView, type SidebarRow, type SidebarSettings } from '../_lib/sidebar'

/**
 * The storefront's dark surface. The local `dark` class switches the semantic tokens inside
 * to their dark values, so previews look like the website in both admin themes.
 */
export function StorefrontSurface({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    // In the dark admin theme the page is nearly as dark, so the surface gets an outline
    <div className={cn('dark rounded-2xl bg-storefront-surface text-foreground dark:ring-1 dark:ring-border dark:ring-inset', className)} {...props}>
      {children}
    </div>
  )
}

/**
 * Admin lists show every icon the same way: 16px, muted, on the muted tile. Uploaded files are white SVGs
 * for the dark storefront, so they're tinted to the same tone.
 */
export const LIST_ICON = 'size-4 text-muted-foreground'
export const LIST_ICON_FILE = 'brightness-0 opacity-60 dark:invert'

/** 20px icon as the drawer paints it; rows without an uploaded icon get a neutral placeholder. */
export function PreviewIcon({ src, fallback: Fallback = Link2, className, imgClassName }: {
  src: string | null
  fallback?: typeof Link2
  className?: string
  imgClassName?: string
}) {
  // White like every icon on the storefront, placeholders included, so the preview reads as one set
  return src ? (
    <IconImage src={src} className={cn('size-5 text-foreground', className)} imgClassName={imgClassName} />
  ) : (
    <Fallback className={cn('size-5 shrink-0 text-foreground', className)} />
  )
}

// Every clickable piece of the preview looks and behaves the same
const PREVIEW_HIT = 'rounded-lg text-left outline-none transition-colors hover:bg-background focus-visible:ring-3 focus-visible:ring-ring/50'

/** A preview piece: a button that opens its settings when `onClick` is given, plain markup otherwise. */
function Hit({ onClick, label, className, children }: { onClick?: () => void; label: string; className?: string; children: React.ReactNode }) {
  return onClick ? (
    <button type="button" onClick={onClick} aria-label={label} className={cn(PREVIEW_HIT, className)}>
      {children}
    </button>
  ) : (
    <div className={className}>{children}</div>
  )
}

function PreviewRow({ row, onClick }: { row: SidebarRow; onClick?: () => void }) {
  const view = rowView(row)
  return (
    <Hit onClick={onClick} label={`Edit ${view.label}`} className="flex w-full min-w-0 items-center gap-3 px-2.5 py-2">
      <PreviewIcon src={view.iconSrc} fallback={row.kind === 'category' ? Tag : Link2} />
      {/* A missing key renders raw on the website too */}
      <span className={cn('truncate text-sm', view.missingKey && 'font-mono text-xs text-destructive')}>{view.label}</span>
    </Hit>
  )
}

/** The whole mobile/tablet drawer as the website renders it, from the section's current draft. */
export function DrawerPreview({ settings, className, onRowClick, onSupportClick, onAppInstallClick }: {
  settings: SidebarSettings
  className?: string
  /** When set, the preview's pieces open their settings, like the bottom bar preview */
  onRowClick?: (row: SidebarRow) => void
  onSupportClick?: () => void
  onAppInstallClick?: () => void
}) {
  const { groups, support, appInstall } = settings
  const supportLabel = resolveLabel(support.label, 'Live Support')
  const appTitle = resolveLabel(appInstall.title, '')
  const appSubtitle = resolveLabel(appInstall.subtitle, '')

  return (
    <StorefrontSurface role="img" aria-label="Sidebar preview" className={cn('flex flex-col gap-2 p-3', className)}>
      {groups.map((group, index) => (
        <div key={group.id} className="flex flex-col rounded-xl bg-muted p-1">
          {group.rows.length === 0 ? (
            <p className="px-2.5 py-2 text-xs text-muted-foreground">{groupLabel(index)} is empty</p>
          ) : (
            group.rows.map(row => <PreviewRow key={row.id} row={row} onClick={onRowClick && (() => onRowClick(row))} />)
          )}
        </div>
      ))}

      <div className="flex flex-col rounded-xl bg-muted p-1">
        <Hit onClick={onSupportClick} label={`Edit ${supportLabel.text}`} className="flex w-full min-w-0 items-center gap-3 px-2.5 py-2">
          <PreviewIcon src={support.icon.src} />
          <span className={cn('truncate text-sm', supportLabel.missingKey && 'font-mono text-xs text-destructive')}>{supportLabel.text}</span>
        </Hit>
        {/* Static on the website: reflects the active route locale */}
        <div className="flex items-center gap-3 rounded-lg px-2.5 py-2">
          <Globe className="size-5 shrink-0 text-muted-foreground" />
          <span className="flex-1 text-sm">EN</span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </div>
      </div>

      {appInstall.enabled && (
        <Hit onClick={onAppInstallClick} label="Edit the app install card" className="flex w-full items-center gap-3 rounded-xl bg-muted p-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background">
            {appInstall.icon.src && <IconImage src={appInstall.icon.src} className="size-5 text-foreground" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className={cn('block truncate text-sm font-medium', appTitle.missingKey && 'font-mono text-xs text-destructive')}>
              {appTitle.text}
            </span>
            <span className={cn('block truncate text-xs text-muted-foreground', appSubtitle.missingKey && 'font-mono text-destructive')}>
              {appSubtitle.text}
            </span>
          </span>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </Hit>
      )}
    </StorefrontSurface>
  )
}
