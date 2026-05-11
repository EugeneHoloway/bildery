"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Slider({
  className, defaultValue, value, min = 0, max = 100, ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () => (Array.isArray(value) ? value : value != null ? [value] : Array.isArray(defaultValue) ? defaultValue : defaultValue != null ? [defaultValue] : [min]),
    [value, defaultValue, min]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn("relative flex w-full touch-none select-none items-center data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative grow overflow-hidden rounded-full bg-muted data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5">
        <SliderPrimitive.Range className="absolute bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full" />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className="block size-4 shrink-0 rounded-full border border-border bg-background shadow-sm ring-ring/50 transition-shadow focus-visible:outline-none focus-visible:ring-3 disabled:pointer-events-none"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
