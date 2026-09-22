'use client'
import { useLayoutEffect, useRef, useState } from 'react'
import { Images } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { BANNER_BREAKPOINTS, resolveSlot, type BannerBreakpoint, type BannerItem } from '../../../_lib/banners'
import { BRAND_COLORS, readableOn } from '../../../_lib/theme'

// Storefront typography per breakpoint: the slide is rendered at its real size and then scaled to fit
const TYPO: Record<BannerBreakpoint, { pad: string; subtitle: string; title: string; button: string; text: string }> = {
  mobile:      { pad: 'p-4', subtitle: 'text-xs',  title: 'text-xl leading-tight',  button: 'h-8 px-4 text-sm',   text: 'max-w-[58%]' },
  mobileLarge: { pad: 'p-4', subtitle: 'text-xs',  title: 'text-xl leading-tight',  button: 'h-8 px-4 text-sm',   text: 'max-w-[50%]' },
  tablet:      { pad: 'p-6', subtitle: 'text-sm',  title: 'text-2xl leading-tight', button: 'h-9 px-5 text-sm',   text: 'max-w-[46%]' },
  laptop:      { pad: 'p-6', subtitle: 'text-sm',  title: 'text-3xl leading-tight', button: 'h-10 px-6 text-base', text: 'max-w-[42%]' },
  desktop:     { pad: 'p-8', subtitle: 'text-base', title: 'text-4xl leading-tight', button: 'h-11 px-7 text-base', text: 'max-w-[38%]' },
  desktopXl:   { pad: 'p-8', subtitle: 'text-base', title: 'text-4xl leading-tight', button: 'h-11 px-7 text-base', text: 'max-w-[38%]' },
}

const HATCHED = 'bg-[repeating-linear-gradient(135deg,transparent,transparent_6px,var(--border)_6px,var(--border)_7px)]'

function slotNote(label: string, used: { key: BannerBreakpoint } | null, bp: BannerBreakpoint, fallback: string) {
  if (!used) return `${label}: ${fallback}`
  const name = BANNER_BREAKPOINTS.find(b => b.key === used.key)!.label
  return used.key === bp ? `${label}: ${name} slot` : `${label}: ${name} slot (fallback)`
}

/**
 * Live render of one slide the way the storefront composes it: background, artwork on the right, texts on the left.
 * The breakpoint is controlled by the page so the image slots can point the preview at themselves.
 */
export function SlidePreview({ banner, bp, onBpChange, className }: {
  banner: BannerItem
  bp: BannerBreakpoint
  onBpChange: (bp: BannerBreakpoint) => void
  className?: string
}) {
  const frameRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  const spec = BANNER_BREAKPOINTS.find(b => b.key === bp)!
  // Same 2:1 frame as the image slots on the left; the width stays real so the typography scales as on the storefront
  const w = spec.size.w
  const h = Math.round(w / 2)
  const typo = TYPO[bp]

  // Fit the real-size slide into the available width
  useLayoutEffect(() => {
    const el = frameRef.current
    if (!el) return
    const update = () => setScale(Math.min(1, el.clientWidth / w))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [w])

  const background = resolveSlot(banner.background, bp)
  const artwork = banner.composition === 'layered' ? resolveSlot(banner.artwork, bp) : null
  const title = banner.title.fallback.trim()
  const subtitle = banner.subtitle.fallback.trim()
  const cta = banner.cta.label.fallback.trim()
  const empty = !background && !artwork && !title && !subtitle && !cta
  const textColor = readableOn(BRAND_COLORS.background)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
        <CardDescription>How the image looks on the storefront, with your unsaved changes.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Tabs value={bp} onValueChange={v => onBpChange(v as BannerBreakpoint)}>
          {/* Six triggers share the card width evenly -- no horizontal scroll even on a phone */}
          <TabsList aria-label="Preview breakpoint" className="w-full">
            {BANNER_BREAKPOINTS.map(b => (
              <TabsTrigger
                key={b.key}
                value={b.key}
                className="min-w-0 px-1 text-xs tabular-nums"
                aria-label={`${b.label}, ${b.viewport}px`}
              >
                {b.viewport}px
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Outer frame takes the scaled height; the slide inside keeps its real px size */}
        <div ref={frameRef} className="w-full overflow-hidden rounded-xl" style={{ height: h * scale }}>
          <div
            className={cn('relative overflow-hidden rounded-xl', empty && HATCHED)}
            // Real storefront size + brand background: these values come from the data, not the CMS theme
            style={{
              width: w,
              height: h,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              backgroundColor: empty ? undefined : BRAND_COLORS.background,
            }}
          >
            {empty ? (
              <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <Images className="size-6" />
                <span className={cn('text-center', typo.subtitle)}>Add a title or an image to see the preview</span>
              </div>
            ) : (
              <>
                {background && (
                  <img src={background.src} alt="" className="absolute inset-0 size-full object-cover" />
                )}
                {artwork && (
                  <img
                    src={artwork.src}
                    alt=""
                    className="absolute inset-y-0 right-0 h-full w-1/2 object-contain object-right-bottom"
                  />
                )}
                <div className={cn('relative flex h-full flex-col justify-center gap-3', typo.pad)}>
                  <div className={cn('flex flex-col gap-1', typo.text)} style={{ color: textColor }}>
                    {subtitle && <p className={cn('font-medium opacity-80', typo.subtitle)}>{subtitle}</p>}
                    {title && <p className={cn('font-bold', typo.title)}>{title}</p>}
                  </div>
                  {cta && (
                    <span
                      className={cn('inline-flex w-fit items-center rounded-full font-medium', typo.button)}
                      style={{ backgroundColor: BRAND_COLORS.primary, color: BRAND_COLORS.primaryForeground }}
                    >
                      {cta}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {spec.label}, {spec.size.w} × {spec.size.h} px
          {' · '}
          {slotNote(banner.composition === 'layered' ? 'Background' : 'Image', background, bp, 'none, brand colour')}
          {banner.composition === 'layered' && (
            <>
              {' · '}
              {slotNote('Artwork', artwork, bp, 'none')}
            </>
          )}
        </p>
      </CardContent>
    </Card>
  )
}
