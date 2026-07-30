import type { MDXComponents } from 'mdx/types'

// Maps markdown elements to styled HTML elements.
// Custom components (KpiRow, Section, etc.) are imported directly in .mdx files.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1:     ({ children }) => (
      <h1 className="mt-4 mb-6 text-xl font-bold tracking-tight text-foreground">{children}</h1>
    ),
    h2:     ({ children }) => (
      <h2 className="mt-10 mb-5 text-lg font-bold tracking-tight text-foreground">{children}</h2>
    ),
    h3:     ({ children }) => (
      <h3 className="mt-8 mb-3 text-base font-semibold text-foreground">{children}</h3>
    ),
    h4:     ({ children }) => (
      <h4 className="mt-6 mb-2 text-sm font-semibold text-foreground">{children}</h4>
    ),
    p:      ({ children }) => (
      <p className="text-sm text-foreground leading-relaxed mb-3">{children}</p>
    ),
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    code:   ({ children }) => (
      <code className="font-mono text-[0.85em] bg-subtle px-1 py-px rounded">{children}</code>
    ),
    ul:     ({ children }) => (
      <ul className="mb-4 list-disc pl-5 space-y-1.5 text-sm leading-relaxed text-foreground marker:text-muted-foreground">
        {children}
      </ul>
    ),
    ol:     ({ children }) => (
      <ol className="mb-4 list-decimal pl-5 space-y-1.5 text-sm leading-relaxed text-foreground marker:text-muted-foreground">
        {children}
      </ol>
    ),
    li:     ({ children }) => (
      <li className="[&>p]:mb-0 [&>p]:inline">{children}</li>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mb-5 border-l-2 border-border pl-4 [&>p]:text-muted-foreground [&>p:last-child]:mb-0">
        {children}
      </blockquote>
    ),
    hr:     () => <hr className="my-10 border-t border-border" />,
    pre:    ({ children }) => (
      <pre className="mb-5 overflow-x-auto rounded-xl bg-muted px-4 py-3 font-mono text-xs leading-relaxed text-muted-foreground [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit">
        {children}
      </pre>
    ),
    table:  ({ children }) => (
      <div className="mb-5 overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full caption-bottom text-sm">{children}</table>
      </div>
    ),
    thead:  ({ children }) => (
      <thead className="bg-muted/50 [&_tr]:border-b [&_tr]:border-border">{children}</thead>
    ),
    tbody:  ({ children }) => (
      <tbody className="[&_tr:last-child]:border-0">{children}</tbody>
    ),
    tr:     ({ children }) => (
      <tr className="border-b border-border transition-colors hover:bg-muted/50">{children}</tr>
    ),
    th:     ({ children }) => (
      <th className="h-10 px-3 text-left align-middle font-medium text-foreground">{children}</th>
    ),
    td:     ({ children }) => (
      // A cell that is nothing but a bold label (an ID, a category) keeps one line.
      <td className="p-2 px-3 align-top [&>strong:only-child]:whitespace-nowrap">{children}</td>
    ),
    a:      ({ href, children }) => (
      <a href={href} className="underline underline-offset-4 hover:text-muted-foreground">
        {children}
      </a>
    ),
    ...components,
  }
}
