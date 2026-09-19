import { useEffect, useRef } from 'react'

/** Object URLs created for local previews; revoked when replaced and on unmount. */
export function useBlobUrls() {
  const blobUrls = useRef(new Set<string>())
  function blobUrl(file: File) {
    const url = URL.createObjectURL(file)
    blobUrls.current.add(url)
    return url
  }
  function release(url: string | null | undefined) {
    if (url && blobUrls.current.delete(url)) URL.revokeObjectURL(url)
  }
  useEffect(() => {
    const urls = blobUrls.current
    return () => { urls.forEach(u => URL.revokeObjectURL(u)) }
  }, [])
  return { blobUrl, release }
}
