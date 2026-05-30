'use client'

import { LayoutGrid } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useTheme } from 'next-themes'

const PROVIDERS: { name: string; logo: string | null; logoDark: string | null }[] = [
  { name: 'Depo44', logo: '/logos/depo44-logo.svg', logoDark: '/logos/depo44-logo-white.svg' },
  { name: 'BetUp', logo: '/logos/betup-logo-black.svg', logoDark: '/logos/betup-logo.svg' },
  ...Array.from({ length: 8 }, (_, i) => ({ name: `Provider #${i + 3}`, logo: null, logoDark: null })),
]

export function ProvidersDialog() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <button
              className="flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Game providers"
            >
              <LayoutGrid className="size-4" />
            </button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom">Game providers</TooltipContent>
      </Tooltip>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Providers</DialogTitle>
          <DialogDescription className="sr-only">Browse the full list of available game providers.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {PROVIDERS.map((provider) => (
            <div
              key={provider.name}
              className="flex h-16 items-center justify-center rounded-xl border border-border bg-muted text-xs text-muted-foreground cursor-pointer hover:bg-accent hover:border-border transition-colors"
            >
              {provider.logo ? (
                <img
                  src={isDark ? (provider.logoDark ?? provider.logo) : provider.logo}
                  alt={provider.name}
                  className="max-h-8 max-w-[80%] object-contain"
                />
              ) : (
                provider.name
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
