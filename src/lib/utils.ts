import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// tailwind-merge не знає про кастомні font-size класи проекту.
// Без цього text-2xs/text-3xs (size-класи) конфліктують з text-* кольоровими класами.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": ["text-2xs", "text-3xs"],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
