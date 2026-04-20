import Link from 'next/link'

interface Tag {
  label: string
  type: 'tag' | 'status'
}

interface Props {
  title: string
  breadcrumbLabel: string
  breadcrumbHref: string
  tags?: Tag[]
  description?: string
  footnote?: string
  children: React.ReactNode
}

export function DocLayout({
  title,
  breadcrumbLabel,
  breadcrumbHref,
  tags,
  description,
  footnote,
  children,
}: Props) {
  return (
    <div className="doc-page">
      <div className="container">

        <nav className="doc-breadcrumb" aria-label="Breadcrumb">
          <Link href={breadcrumbHref} className="doc-breadcrumb__link">
            {breadcrumbLabel}
          </Link>
          <span className="doc-breadcrumb__sep">/</span>
          <span className="doc-breadcrumb__current">{title}</span>
        </nav>

        <div className="doc-hero">
          <h1 className="doc-hero__title">{title}</h1>
          {tags && tags.length > 0 && (
            <div className="doc-hero__tags">
              {tags.map((t) => (
                <span key={t.label} className={t.type === 'status' ? 'sandbox-card__status' : 'sandbox-card__tag'}>
                  {t.label}
                </span>
              ))}
            </div>
          )}
          {description && <p className="doc-hero__description">{description}</p>}
        </div>

        {children}

        {footnote && <div className="doc-footnote">{footnote}</div>}

      </div>
    </div>
  )
}
