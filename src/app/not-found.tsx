import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="py-12 pb-20">
      <div className="mx-auto max-w-[1240px] px-4 tablet:px-4">
        <div className="mb-10">
          <h1 className="mb-2 text-[2rem] font-bold tracking-[-0.03em]">
            404
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Page not found.
          </p>
          <p className="mt-3 text-sm leading-[1.7] text-muted-foreground">
            <Link href="/" className="text-brand underline underline-offset-2">
              Go home
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
