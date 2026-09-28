import { Columns3, CreditCard, Info, Scale, type LucideIcon } from 'lucide-react'
import type { DepositIcon, TranslationKey } from './deposit-methods'
import { validateHref } from './validation'

export type FooterBlockId = 'legal' | 'navigation' | 'about' | 'payment-logos'

export interface FooterBlock {
  id: FooterBlockId
  label: string
  description: string
  icon: LucideIcon
}

// Fixed set of footer blocks, in the order they appear on the storefront (top to bottom)
export const FOOTER_BLOCKS: FooterBlock[] = [
  { id: 'navigation',    label: 'Navigation Columns', description: 'Footer link columns (e.g. Casino, Sports, Help). Each column has a title and its own list of links', icon: Columns3 },
  { id: 'payment-logos', label: 'Payment Logos',      description: 'Payment-method logos displayed in the footer. Display-only -- not clickable', icon: CreditCard },
  { id: 'about',         label: 'About Us',           description: 'The About column: its title and the list of informational links shown beneath it', icon: Info },
  { id: 'legal',         label: 'Legal & Licensing',  description: 'Legal disclaimer, the copyright line, and the licensing badge shown at the bottom of the footer', icon: Scale },
]

export interface FooterLegal {
  legalText: TranslationKey
  copyright: TranslationKey
  licenseImage: DepositIcon
}

export interface FooterLink {
  id: string
  label: TranslationKey
  href: string
  /** Opens in a new tab */
  external: boolean
}

export interface FooterColumn {
  id: string
  title: TranslationKey
  links: FooterLink[]
}

export interface FooterAbout {
  title: TranslationKey
  links: FooterLink[]
}

export interface FooterPaymentLogo {
  id: string
  image: DepositIcon
  /** Shown only from the laptop breakpoint up, hidden on phones and tablets */
  laptopOnly: boolean
}

export interface FooterSettings {
  legal: FooterLegal
  columns: FooterColumn[]
  about: FooterAbout
  paymentLogos: FooterPaymentLogo[]
}

// Mock of the brand's saved footer
export const FOOTER: FooterSettings = {
  legal: {
    legalText: null,
    copyright: null,
    licenseImage: { src: null, alt: '' },
  },
  // As in the design: 4 columns, titles and labels not picked yet, every href a # placeholder
  columns: [
    {
      id: 'column-1',
      title: null,
      links: [
        { id: 'column-1-link-1', label: null, href: '#', external: false },
        { id: 'column-1-link-2', label: null, href: '#', external: false },
        { id: 'column-1-link-3', label: null, href: '#', external: false },
      ],
    },
    {
      id: 'column-2',
      title: null,
      links: [
        { id: 'column-2-link-1', label: null, href: '#', external: false },
        { id: 'column-2-link-2', label: null, href: '#', external: false },
        { id: 'column-2-link-3', label: null, href: '#', external: false },
      ],
    },
    {
      id: 'column-3',
      title: null,
      links: [
        { id: 'column-3-link-1', label: null, href: '#', external: false },
        { id: 'column-3-link-2', label: null, href: '#', external: false },
        { id: 'column-3-link-3', label: null, href: '#', external: false },
        { id: 'column-3-link-4', label: null, href: '#', external: false },
        { id: 'column-3-link-5', label: null, href: '#', external: false },
      ],
    },
    {
      id: 'column-4',
      title: null,
      links: [
        { id: 'column-4-link-1', label: null, href: '#', external: false },
        { id: 'column-4-link-2', label: null, href: '#', external: false },
        { id: 'column-4-link-3', label: null, href: '#', external: false },
        { id: 'column-4-link-4', label: null, href: '#', external: false },
      ],
    },
  ],
  about: {
    title: null,
    links: [
      { id: 'about-link-1', label: null, href: '/about-us', external: false },
      { id: 'about-link-2', label: null, href: '#',         external: false },
      { id: 'about-link-3', label: null, href: '#',         external: true },
    ],
  },
  paymentLogos: [
    { id: 'visa',       image: { src: '/payment-logos/visa.svg',       alt: 'VISA' },               laptopOnly: false },
    { id: 'mastercard', image: { src: '/payment-logos/mastercard.svg', alt: 'Mastercard' },         laptopOnly: false },
    { id: 'skrill',     image: { src: '/payment-logos/skrill.svg',     alt: 'Skrill' },             laptopOnly: false },
    { id: 'neteller',   image: { src: '/payment-logos/neteller.svg',   alt: 'Neteller' },           laptopOnly: false },
    { id: 'bitcoin',    image: { src: '/payment-logos/bitcoin.svg',    alt: 'Bitcoin' },            laptopOnly: true },
    { id: 'fiat',       image: { src: '/payment-logos/fiat.svg',       alt: 'Fiat' },               laptopOnly: false },
    { id: 'crypto',     image: { src: '/payment-logos/crypto.svg',     alt: 'Crypto Currencies' },  laptopOnly: false },
  ],
}

export interface FooterSummary {
  text: string
  /** empty: nothing configured yet; warning: required but missing */
  tone: 'default' | 'empty' | 'warning'
}

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? '' : 's'}`
}

/** One-line state of a block for the Footer list, like the deposit methods rows */
export function footerSummary(id: FooterBlockId, footer: FooterSettings): FooterSummary {
  switch (id) {
    case 'legal': {
      const { legalText, copyright, licenseImage } = footer.legal
      // A gambling brand can't go live without a license badge in the footer
      if (!licenseImage.src) return { text: 'License image not set', tone: 'warning' }
      const set = [legalText && 'Legal text', copyright && 'Copyright', 'License image'].filter(Boolean)
      return { text: set.join(' · '), tone: 'default' }
    }
    case 'navigation': {
      const { columns } = footer
      if (columns.length === 0) return { text: 'Not set', tone: 'empty' }
      const links = columns.reduce((n, c) => n + c.links.length, 0)
      const untitled = columns.filter(c => !c.title).length
      const text = `${plural(columns.length, 'column')} · ${plural(links, 'link')}`
      if (untitled) return { text: `${text} · ${untitled} without title`, tone: 'warning' }
      return { text, tone: 'default' }
    }
    case 'about': {
      const { title, links } = footer.about
      if (!title && links.length === 0) return { text: 'Not set', tone: 'empty' }
      if (!title) return { text: `Title not set · ${plural(links.length, 'link')}`, tone: 'warning' }
      return { text: plural(links.length, 'link'), tone: 'default' }
    }
    case 'payment-logos': {
      const logos = footer.paymentLogos
      if (logos.length === 0) return { text: 'Not set', tone: 'empty' }
      const missing = logos.filter(l => !l.image.src).length
      if (missing) return { text: `${plural(logos.length, 'logo')} · ${missing} without image`, tone: 'warning' }
      const laptopOnly = logos.filter(l => l.laptopOnly).length
      return { text: plural(logos.length, 'logo') + (laptopOnly ? ` · ${laptopOnly} laptop only` : ''), tone: 'default' }
    }
  }
}

export function commitFooterLegal(legal: FooterLegal) {
  FOOTER.legal = legal
}

export function commitFooterAbout(about: FooterAbout) {
  FOOTER.about = about
}

export function commitFooterPaymentLogos(logos: FooterPaymentLogo[]) {
  FOOTER.paymentLogos = logos
}

export function newFooterPaymentLogo(): FooterPaymentLogo {
  return { id: `logo-${Date.now()}`, image: { src: null, alt: '' }, laptopOnly: false }
}

export function commitFooterColumns(columns: FooterColumn[]) {
  FOOTER.columns = columns
}

export function newFooterColumn(): FooterColumn {
  return { id: `column-${Date.now()}`, title: null, links: [] }
}

export function newFooterLink(): FooterLink {
  return { id: `link-${Date.now()}`, label: null, href: '', external: false }
}

/** Site path (/about-us), in-page anchor (#top) or a full http(s) URL */
export function validateFooterHref(href: string, external: boolean): string | undefined {
  return validateHref(href, external)
}

export const FOOTER_HREF = '/brand-settings?section=footer'

export function footerBlockHref(id: FooterBlockId) {
  return `/brand-settings/footer/${id}`
}
