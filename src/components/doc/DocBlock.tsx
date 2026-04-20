interface Props {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function DocBlock({ title, subtitle, children }: Props) {
  return (
    <div className="doc-block">
      <h3 className="doc-block__title">{title}</h3>
      {subtitle && <p className="doc-block__subtitle">{subtitle}</p>}
      {children}
    </div>
  )
}
