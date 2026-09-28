import { ArchiveRestore, Banknote, Gift, Headset, Smartphone, UserPlus, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// Prototype mocks point icons at Lucide (`lucide:<name>`) instead of uploaded files; real uploads stay image urls
const MOCK_ICONS: Record<string, LucideIcon> = {
  'archive-restore': ArchiveRestore,
  banknote: Banknote,
  gift: Gift,
  headset: Headset,
  smartphone: Smartphone,
  'user-plus': UserPlus,
}

export function mockIcon(src: string) {
  return src.startsWith('lucide:') ? MOCK_ICONS[src.slice('lucide:'.length)] : undefined
}

/** An icon slot's image: the Lucide icon for mocks, the uploaded file otherwise (`imgClassName` applies to files only). */
export function IconImage({ src, className, imgClassName }: { src: string; className?: string; imgClassName?: string }) {
  const Icon = mockIcon(src)
  return Icon ? (
    <Icon className={cn('shrink-0', className)} />
  ) : (
    <img src={src} alt="" className={cn('shrink-0 object-contain', className, imgClassName)} />
  )
}
