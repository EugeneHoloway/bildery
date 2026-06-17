import Link from 'next/link'
import pkg from '../../../package.json'
const version = pkg.version

const navItems = [
  { label: 'Bildery', href: '/' },
  { label: 'Tasks', href: '/tasks' },
  { label: 'Docs', href: '/docs' },
  { label: 'Sandbox', href: '/sandbox' },
  { label: 'About', href: '/about' },
  { label: 'Support', href: '#' },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-screen-xl flex-col gap-4 px-4 py-8 tablet:flex-row tablet:items-center tablet:justify-between">

        <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer navigation">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <p className="text-sm text-muted-foreground">
          2026. All rights reserved. v{version}
        </p>
      </div>
    </footer>
  )
}
