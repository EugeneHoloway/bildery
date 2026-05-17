import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface Tag {
  label: string
  type: 'tag' | 'status'
}

interface Crumb {
  label: string
  href: string
}

interface Props {
  title: string
  breadcrumbLabel: string
  breadcrumbHref: string
  /** Optional extra ancestor crumb inserted before breadcrumbLabel */
  parentCrumb?: Crumb
  /** Extra element rendered to the right of h1 (e.g. language switcher) */
  titleExtra?: React.ReactNode
  tags?: Tag[]
  description?: string
  footnote?: string
  children: React.ReactNode
}

export function DocLayout({
  title,
  breadcrumbLabel,
  breadcrumbHref,
  parentCrumb,
  titleExtra,
  tags,
  description,
  footnote,
  children,
}: Props) {
  return (
    <div className="py-10 pb-20">
      <div className="container px-4">

        <nav className="flex items-center gap-2 mb-8 text-sm text-muted-foreground" aria-label="Breadcrumb">
          {parentCrumb && (
            <>
              <Link href={parentCrumb.href} className="hover:text-foreground transition-colors">
                {parentCrumb.label}
              </Link>
              <span className="text-border">/</span>
            </>
          )}
          <Link href={breadcrumbHref} className="hover:text-foreground transition-colors">
            {breadcrumbLabel}
          </Link>
          <span className="text-border">/</span>
          <span className="text-foreground">{title}</span>
        </nav>

        <div className="mb-10">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-xl font-bold tracking-tight">{title}</h1>
            {titleExtra && <div className="flex-shrink-0">{titleExtra}</div>}
          </div>
          {description && (
            <p className="text-base leading-relaxed text-muted-foreground mb-4 max-w-2xl">{description}</p>
          )}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <Badge
                  key={t.label}
                  variant="default"
                  className="pointer-events-none"
                >
                  {t.label}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {children}

        {footnote && (
          <div className="mt-12 pt-4 border-t border-border text-xs text-muted-foreground leading-relaxed">
            {footnote}
          </div>
        )}

      </div>
    </div>
  )
}
