interface Props {
  variant: 'primary' | 'warning'
  children: React.ReactNode
}

export function Callout({ variant, children }: Props) {
  return (
    <div className={`doc-callout doc-callout--${variant}`}>
      {children}
    </div>
  )
}
