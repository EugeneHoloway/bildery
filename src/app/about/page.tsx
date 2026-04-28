import type { Metadata } from 'next'
import { ForceGraph } from '@/components/ForceGraph'

export const metadata: Metadata = {
  title: 'About',
  description: 'A public product lab. Head of Product based in Berlin.',
}

export default function AboutPage() {
  return (
    <div className="py-12 pb-20">
      <div className="mx-auto max-w-[1240px] px-4 tablet:px-4">

        {/* Two-column layout: text left, graph right */}
        <div className="flex flex-col items-start gap-10 desktop:flex-row desktop:gap-12">

          {/* Text block */}
          <div className="flex-1 min-w-0">
            <div className="mb-10">
              <h1 className="mb-2 text-[2rem] font-bold tracking-[-0.03em]">
                About
              </h1>
              <p className="text-base leading-relaxed text-muted-foreground">
                A public product lab.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <p className="max-w-[60ch] text-sm leading-[1.7] text-muted-foreground">
                Hi there. My name is Eugene Holoway, I&apos;m a Head of Product, and this is
                my corner of the web. Bildery is my personal operating system: a place to
                manage work, run experiments, and document thinking in progress.
              </p>
              <p className="max-w-[60ch] text-sm leading-[1.7] text-muted-foreground">
                In my private time I like reading, traveling and discovering financial market.
                I live in Berlin, Germany.
              </p>
              <p className="max-w-[60ch] text-sm leading-[1.7] text-muted-foreground">
                Find me on{' '}
                <a
                  href="https://www.instagram.com/eugeneholoway"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 transition-colors hover:text-foreground"
                >
                  Instagram
                </a>
                ,{' '}
                <a
                  href="https://www.linkedin.com/in/eugeneholoway"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 transition-colors hover:text-foreground"
                >
                  LinkedIn
                </a>
                {' '}or{' '}
                <a
                  href="https://github.com/EugeneHoloway"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 transition-colors hover:text-foreground"
                >
                  GitHub
                </a>
                .
              </p>
            </div>
          </div>

          {/* Force graph */}
          <div className="w-full flex justify-center opacity-90 desktop:w-[450px] desktop:shrink-0 desktop:justify-end">
            <ForceGraph maxSize={450} />
          </div>

        </div>
      </div>
    </div>
  )
}
