import { Bitcoin, Landmark, type LucideIcon } from 'lucide-react'

export type DepositKind = 'crypto' | 'fiat'

/** Translation key, or null while none is picked. */
export type TranslationKey = string | null

export interface DepositIcon {
  /** SVG url (media library or a local blob preview); null = no icon */
  src: string | null
  alt: string
}

/** One way to deposit inside a block, e.g. "Manual deposit (address / QR)". */
export interface DepositOption {
  id: string
  enabled: boolean
  flow: string | null
  title: TranslationKey
  subtitle: TranslationKey
  icon: DepositIcon
}

export interface DepositLimits {
  depositMin: string
  depositMax: string
  withdrawalMin: string
  withdrawalMax: string
}

// One block in the deposit modal; opens the deposit with its Main provider
export interface DepositMethod {
  id: string
  kind: DepositKind
  enabled: boolean
  mainProvider: string | null
  title: TranslationKey
  subtitle: TranslationKey
  icon: DepositIcon
  limits: DepositLimits
  options: DepositOption[]
  amountStep: { enabled: boolean; title: TranslationKey; subtitle: TranslationKey }
}

export const DEPOSIT_KINDS: DepositKind[] = ['crypto', 'fiat']

export const DEPOSIT_KIND_LABEL: Record<DepositKind, string> = {
  crypto: 'Crypto',
  fiat: 'Fiat',
}

export const DEPOSIT_KIND_ICON: Record<DepositKind, LucideIcon> = {
  crypto: Bitcoin,
  fiat: Landmark,
}

export const MAX_DEPOSIT_OPTIONS = 5

export const DEPOSIT_METHODS_HREF = '/brand-settings?section=deposit-methods'

export function depositMethodHref(id: string) {
  return `/brand-settings/deposit-methods/${id}`
}

// --- Mock catalogs; real values come later ---

// Payment providers configured for each kind
export const DEPOSIT_PROVIDERS: Record<DepositKind, { id: string; label: string }[]> = {
  crypto: [
    { id: 'passimpay', label: 'passimpay' },
    { id: 'coinspaid', label: 'coinspaid' },
  ],
  // None configured for the brand yet
  fiat: [],
}

export interface DepositFlow {
  id: string
  label: string
  /** false: the website doesn't support it yet and shows players a "not available yet" notice */
  implemented?: boolean
}

// Deposit flows an option can run
export const DEPOSIT_FLOWS: Record<DepositKind, DepositFlow[]> = {
  crypto: [
    { id: 'manual', label: 'Manual deposit (address / QR)' },
    { id: 'buy', label: 'Buy crypto with card' },
  ],
  fiat: [
    { id: 'redirect', label: 'Provider redirect / hosted page', implemented: false },
  ],
}

// Translation keys with their EN value, for the key pickers
export const TRANSLATIONS: Record<string, string> = {
  'auth.country.label': 'Country',
  'auth.country.placeholder': 'US',
  'auth.currency.label': 'Default Currency',
  'auth.currency.placeholder': 'USD',
  'auth.email.label': 'Email',
  'deposit.methods.crypto.title': 'Crypto',
  'deposit.methods.crypto.subtitle': 'No limit · ready in 30 mins · fees vary',
  'deposit.cryptoOptions.manual.title': 'Manual deposit',
  'deposit.cryptoOptions.manual.subtitle': 'Copy an address or scan a QR code.',
  'deposit.cryptoOptions.buy.title': 'Buy crypto',
  'deposit.cryptoOptions.buy.subtitle': 'Pay by card, receive crypto to your balance.',
}

export const TRANSLATION_KEYS = Object.keys(TRANSLATIONS).sort()

/** Conventional key for a field, offered first in the picker when it exists in the catalog. */
export function suggestedKey(key: string) {
  return key in TRANSLATIONS ? key : undefined
}

// Fiat has no keys of its own yet, so its fields suggest the Crypto ones
export function methodSuggestions(_kind: DepositKind) {
  return {
    title: suggestedKey('deposit.methods.crypto.title'),
    subtitle: suggestedKey('deposit.methods.crypto.subtitle'),
  }
}

export function optionSuggestions(kind: DepositKind, flow: string | null) {
  if (kind === 'fiat') return { title: suggestedKey('deposit.cryptoOptions.manual.title'), subtitle: undefined }
  return {
    title: flow ? suggestedKey(`deposit.cryptoOptions.${flow}.title`) : undefined,
    subtitle: flow ? suggestedKey(`deposit.cryptoOptions.${flow}.subtitle`) : undefined,
  }
}

export function depositMethodName(method: DepositMethod) {
  return (method.title && TRANSLATIONS[method.title]) || DEPOSIT_KIND_LABEL[method.kind]
}

export function providerLabel(method: DepositMethod) {
  return DEPOSIT_PROVIDERS[method.kind].find(p => p.id === method.mainProvider)?.label ?? null
}

// --- Factories and validation ---

export function newDepositOption(): DepositOption {
  return {
    id: `option-${Date.now()}`,
    enabled: true,
    flow: null,
    title: null,
    subtitle: null,
    icon: { src: null, alt: '' },
  }
}

export function newDepositMethod(kind: DepositKind): DepositMethod {
  return {
    id: `${kind}-${Date.now()}`,
    kind,
    enabled: true,
    mainProvider: DEPOSIT_PROVIDERS[kind][0]?.id ?? null,
    title: null,
    subtitle: null,
    icon: { src: null, alt: '' },
    limits: { depositMin: '', depositMax: '', withdrawalMin: '', withdrawalMax: '' },
    options: [],
    amountStep: { enabled: false, title: null, subtitle: null },
  }
}

function parseAmount(v: string) {
  return v.trim() === '' ? null : Number(v)
}

/** Keeps a money input to digits with up to 2 decimals; a comma is read as the decimal point. */
export function sanitizeAmount(v: string) {
  const s = v.replace(',', '.')
  return /^\d*(\.\d{0,2})?$/.test(s) ? s : null
}

/** Per-field errors for the limits grid; empty fields mean "no limit". */
export function validateLimits(l: DepositLimits): Partial<Record<keyof DepositLimits, string>> {
  const errors: Partial<Record<keyof DepositLimits, string>> = {}
  for (const k of Object.keys(l) as (keyof DepositLimits)[]) {
    const n = parseAmount(l[k])
    if (n !== null && (!Number.isFinite(n) || n < 0)) errors[k] = 'Enter a positive number'
  }
  const pairs: [keyof DepositLimits, keyof DepositLimits][] = [['depositMin', 'depositMax'], ['withdrawalMin', 'withdrawalMax']]
  for (const [min, max] of pairs) {
    const a = parseAmount(l[min])
    const b = parseAmount(l[max])
    if (!errors[max] && a !== null && b !== null && a > b) errors[max] = 'Max must be at least min'
  }
  return errors
}

// --- Mock data ---

export const DEPOSIT_METHODS_DEFAULTS: DepositMethod[] = [
  {
    id: 'crypto',
    kind: 'crypto',
    enabled: true,
    mainProvider: 'passimpay',
    title: 'deposit.methods.crypto.title',
    subtitle: 'deposit.methods.crypto.subtitle',
    icon: { src: null, alt: 'crypto' },
    limits: { depositMin: '10', depositMax: '2000', withdrawalMin: '20', withdrawalMax: '2000' },
    options: [
      {
        id: 'manual',
        enabled: true,
        flow: 'manual',
        title: 'deposit.cryptoOptions.manual.title',
        subtitle: 'deposit.cryptoOptions.manual.subtitle',
        icon: { src: null, alt: 'qr-code' },
      },
    ],
    amountStep: { enabled: true, title: null, subtitle: null },
  },
  {
    id: 'fiat',
    kind: 'fiat',
    enabled: true,
    mainProvider: null,
    title: null,
    subtitle: null,
    icon: { src: null, alt: '' },
    limits: { depositMin: '', depositMax: '', withdrawalMin: '', withdrawalMax: '' },
    options: [
      {
        id: 'fiat-option-1',
        enabled: true,
        flow: 'redirect',
        title: null,
        subtitle: null,
        icon: { src: null, alt: '' },
      },
      {
        id: 'fiat-option-2',
        enabled: true,
        flow: null,
        title: null,
        subtitle: null,
        icon: { src: null, alt: '' },
      },
    ],
    amountStep: { enabled: false, title: null, subtitle: null },
  },
]

export const DEPOSIT_METHODS: DepositMethod[] = structuredClone(DEPOSIT_METHODS_DEFAULTS)

/** Mock persistence: saving the list replaces the shared array in place. */
export function commitDepositMethods(list: DepositMethod[]) {
  DEPOSIT_METHODS.splice(0, DEPOSIT_METHODS.length, ...list)
}

export function commitDepositMethod(method: DepositMethod) {
  const i = DEPOSIT_METHODS.findIndex(m => m.id === method.id)
  if (i !== -1) DEPOSIT_METHODS[i] = method
}
