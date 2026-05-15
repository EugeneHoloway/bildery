/**
 * DocFormula — labelled code block for displaying formulas in doc pages.
 * Uses muted background + border; no custom CSS required.
 */
export function DocFormula({
  label,
  code,
}: {
  label: string
  code: string
}) {
  return (
    <div className="flex flex-col gap-2 px-5 py-4 border border-border rounded-lg bg-muted mb-5">
      <span className="text-xs font-bold tracking-wider uppercase text-muted-foreground">{label}</span>
      <code className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-foreground">{code}</code>
    </div>
  )
}
