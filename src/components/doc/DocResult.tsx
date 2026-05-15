/**
 * DocResult — highlighted result block with label, large value, formula, and note.
 * Uses success semantic tokens; no custom CSS required.
 */
export function DocResult({
  label,
  value,
  formula,
  note,
}: {
  label: string
  value: string
  formula?: string
  note?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1 p-5 border border-success-border rounded-lg bg-success-bg mb-5">
      <span className="text-xs font-semibold uppercase tracking-wider text-success">{label}</span>
      <span className="text-4xl font-bold tracking-tight text-foreground">{value}</span>
      {formula && (
        <code className="font-mono text-xs text-muted-foreground">{formula}</code>
      )}
      {note && (
        <div className="text-sm text-foreground leading-relaxed mt-2">{note}</div>
      )}
    </div>
  )
}
