'use client'

import { useState } from 'react'
import { ProvidersDialog } from './providers-dialog'

const TOPICS = [
  'Trending',
  'Popular',
  'New',
  'Slots',
  'Live Casino',
  'Our Picks',
  'Crash Games',
  'Roulette',
  'Poker',
  'Jackpots',
  'Table Games',
]

export function TopicsNav() {
  const [active, setActive] = useState('Trending')

  return (
    <div className="border-b border-border mb-6">
      <div className="flex items-center overflow-x-auto scrollbar-none">
        <div className="shrink-0 pr-1">
          <ProvidersDialog />
        </div>
        {TOPICS.map((topic) => (
          <button
            key={topic}
            onClick={() => setActive(topic)}
            className={[
              'relative whitespace-nowrap px-3 py-3 text-sm transition-colors cursor-pointer',
              active === topic
                ? 'text-foreground font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground after:rounded-full'
                : 'text-muted-foreground font-medium hover:text-foreground',
            ].join(' ')}
          >
            {topic}
          </button>
        ))}
      </div>
    </div>
  )
}
