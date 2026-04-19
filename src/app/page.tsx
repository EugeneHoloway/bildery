import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bildery',
  description: 'A product lab. Day-to-day workspace.',
}

export default function HomePage() {
  return (
    <div className="py-12 pb-20">
      <div className="mx-auto max-w-[1240px] px-4 tablet:px-4">
        <div className="mb-10">
          <h1 className="mb-2 text-[2rem] font-bold tracking-[-0.03em]">
            A product lab.
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Day-to-day workspace.
          </p>
          <p className="mt-3 max-w-[60ch] text-sm leading-[1.7] text-muted-foreground">
            Bildery is a place to think out loud - tasks, documentation, prototypes, and analytical work.
            Iteration happens here. Nothing is final. Poke around.
          </p>
        </div>
      </div>
    </div>
  )
}
