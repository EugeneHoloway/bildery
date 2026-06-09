import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BottomNav } from '@/components/layout/BottomNav'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-header-mobile desktop:pt-header-desktop pb-bottom-nav desktop:pb-0">
        {children}
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}
