/** Saved brand palette (mock) -- shared by the Theme section and the AI generation dialog. */
export const BRAND_COLORS = {
  primary: '#ccff00',
  primaryHover: '#d8ff3d',
  primaryActive: '#abd600',
  primaryForeground: '#18181b',
  background: '#09090b',
}

/** Black or white, whichever reads better on the given color (preview only). */
export function readableOn(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? '#18181b' : '#fafafa'
}
