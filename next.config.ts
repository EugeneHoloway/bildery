import type { NextConfig } from 'next'
import createMDX from '@next/mdx'

// remark-gfm adds GitHub-flavoured markdown: tables, strikethrough, autolinks.
// Turbopack requires loader options to be serializable, so the plugin is
// referenced by name rather than imported.
const withMDX = createMDX({
  options: {
    remarkPlugins: [['remark-gfm', {}]],
  },
})

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  images: {
    remotePatterns: [],
  },
}

export default withMDX(nextConfig)
