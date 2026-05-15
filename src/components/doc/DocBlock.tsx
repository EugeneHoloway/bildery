interface Props {
  title?: string
  subtitle?: string
  children?: React.ReactNode
}

export function DocBlock({ title, subtitle, children }: Props) {
  return (
    <div className="mb-8">
      {title && <h3 className="text-base font-bold mb-1">{title}</h3>}
      {subtitle && (
        <p className="text-sm text-muted-foreground mb-5">{subtitle}</p>
      )}
      {children}
    </div>
  )
}
