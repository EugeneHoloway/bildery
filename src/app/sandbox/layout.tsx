import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sandbox',
  description: 'Work-in-progress projects, test tasks, and exploratory documents.',
}

export default function SandboxLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
