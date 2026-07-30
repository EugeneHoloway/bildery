'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Activity, Check, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuth } from '@/components/AuthProvider'
import { AuthDialog } from '@/components/auth/AuthDialog'

export type CardStatus = 'Initiated' | 'In progress' | 'Done'

export interface SandboxCardData {
  id: string
  tag: string
  title: string
  description: string
  cardStatus: CardStatus
  sections: number
  href: string
  highlight?: {
    label: string
    bullets: string[]
  }
  languages?: string[]
  /** Card opens only for a signed-in user; otherwise the login dialog is shown. */
  locked?: boolean
}

// Shows a tooltip with full text only when the content is actually truncated.
// Click does whatever the rest of the card does — navigate, or ask for login.
function TruncatedBullet({ text, onActivate }: { text: string; onActivate: () => void }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [truncated, setTruncated] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const check = () => setTruncated(el.scrollWidth > el.clientWidth)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          ref={ref}
          onClick={onActivate}
          className="truncate text-sm leading-snug text-muted-foreground pointer-events-auto cursor-pointer"
        >
          {text}
        </span>
      </TooltipTrigger>
      {truncated && <TooltipContent side="top">{text}</TooltipContent>}
    </Tooltip>
  )
}

export function SandboxCard({ card }: { card: SandboxCardData }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [authOpen, setAuthOpen] = useState(false)

  // While the session is still loading we keep the plain link — the page itself
  // gates the content anyway, so a stale click can never leak anything.
  const gated = Boolean(card.locked) && !loading && !user

  const activate = () => {
    if (gated) setAuthOpen(true)
    else router.push(card.href)
  }

  return (
    <div
      className={cn(
        // Layout
        'relative flex flex-col justify-between gap-4',
        'min-h-72 p-4 rounded-2xl',
        // Visual
        'bg-card border border-border',
        'shadow-card',
        // Interaction
        'transition-all duration-200',
        'hover:border-subtle-border hover:shadow-card-hover',
      )}
    >
      {/* Stretched hit area — makes the whole card clickable */}
      {gated ? (
        <button
          type="button"
          onClick={() => setAuthOpen(true)}
          className="absolute inset-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={`Login to view ${card.title}`}
        />
      ) : (
        <Link
          href={card.href}
          className="absolute inset-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={`View ${card.title}`}
        />
      )}

      {/* Top */}
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-bold leading-snug tracking-heading text-foreground">
              {card.title}
            </h2>
            <span className="text-xs text-muted-foreground">
              {card.sections} sections
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {gated && (
              <Lock className="size-3.5 text-muted-foreground" aria-label="Requires login" />
            )}
            <Badge
              variant="secondary"
              className="relative z-10 shrink-0"
            >
              {card.tag}
            </Badge>
          </div>
        </div>

        {card.highlight ? (
          <div className="relative z-10 flex flex-col gap-2.5 pointer-events-none">
            <span className="text-sm text-foreground">
              {card.highlight.label}
            </span>
            <ul className="flex flex-col gap-1.5">
              {card.highlight.bullets.map((bullet, i) => (
                <li key={i} className="flex min-w-0 items-start gap-2">
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                    <Check className="size-2.5" strokeWidth={3} />
                  </span>
                  <TruncatedBullet text={bullet} onActivate={activate} />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {card.description}
          </p>
        )}

        {card.languages && (
          <div className="pointer-events-none mt-auto flex items-center gap-1.5 pt-0.5">
            <span className="text-sm text-foreground">Language:</span>
            <div className="flex gap-1">
              {card.languages.map(lang => (
                <Badge key={lang} variant="secondary">{lang}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="-mx-4 -mb-4 flex items-center justify-between gap-3 rounded-b-2xl border-t border-border bg-subtle px-4 py-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Activity className="size-3.5 shrink-0" />
          <span className="font-medium">{card.cardStatus}</span>
        </div>
        {gated ? (
          <Button className="relative z-10" onClick={() => setAuthOpen(true)}>
            View details
          </Button>
        ) : (
          <Button asChild className="relative z-10">
            <Link href={card.href}>View details</Link>
          </Button>
        )}
      </div>

      {card.locked && (
        <AuthDialog
          open={authOpen}
          mode="login"
          onOpenChange={setAuthOpen}
          onAuthenticated={() => router.push(card.href)}
        />
      )}
    </div>
  )
}
