/** Link check shared by every href field: a site page (/), an anchor (#) or a full URL; external links need the URL. */
export function validateHref(href: string, external: boolean, label = 'Link'): string | undefined {
  const value = href.trim()
  if (!value) return `${label} is required`
  if (external) return /^https?:\/\/\S+$/.test(value) ? undefined : 'External links need a full URL, e.g. https://example.com'
  return /^(\/|#|https?:\/\/)\S*$/.test(value) ? undefined : 'Start with / for a site page, # for an anchor, or https:// for a URL'
}
