"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-sm bg-gray-300 shadow-inner">
      <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-blue-500 to-blue-600" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-7 w-6 rounded-sm border-2 border-gray-400 bg-gradient-to-b from-gray-100 to-gray-200 shadow-lg cursor-grab active:cursor-grabbing hover:border-blue-500 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative before:absolute before:content-[''] before:w-4 before:h-0.5 before:bg-gray-400 before:top-2 before:left-1/2 before:-translate-x-1/2 before:shadow-sm after:absolute after:content-[''] after:w-4 after:h-0.5 after:bg-gray-400 after:bottom-2 after:left-1/2 after:-translate-x-1/2 after:shadow-sm" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
