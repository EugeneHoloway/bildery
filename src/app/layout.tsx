import type { Metadata } from 'next'
import { Inter, Geist } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BottomNav } from '@/components/layout/BottomNav'
import { ThemeProvider } from '@/components/ThemeProvider'
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Bildery',
    template: '%s | Bildery',
  },
  description: 'Bildery — design & development playground',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          {/* App shell: flex column, min-h-screen (mirrors .app-shell) */}
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pt-header-mobile desktop:pt-header-desktop pb-bottom-nav desktop:pb-0">
              {children}
            </main>
            <Footer />
            <BottomNav />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
