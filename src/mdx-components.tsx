import type { MDXComponents } from 'mdx/types'

// Maps markdown elements to styled HTML elements.
// Custom components (KpiRow, Section, etc.) are imported directly in .mdx files.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    p:      ({ children }) => <p className="doc-prose">{children}</p>,
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    code:   ({ children }) => <code className="font-mono text-[0.85em] bg-subtle px-1 py-px rounded">{children}</code>,
    ...components,
  }
}
