import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `£${(value / 1_000_000_000).toFixed(2)}bn`
  }
  if (value >= 1_000_000) {
    return `£${(value / 1_000_000).toFixed(1)}m`
  }
  if (value >= 1_000) {
    return `£${(value / 1_000).toFixed(0)}k`
  }
  return `£${value.toFixed(0)}`
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}