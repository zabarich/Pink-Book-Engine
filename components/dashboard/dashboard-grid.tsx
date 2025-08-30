import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface DashboardGridProps {
  children: ReactNode
  className?: string
  columns?: 'auto' | 1 | 2 | 3 | 4
}

export function DashboardGrid({
  children,
  className,
  columns = 'auto'
}: DashboardGridProps) {
  const getGridColumns = (cols: typeof columns) => {
    switch (cols) {
      case 1:
        return 'grid-cols-1'
      case 2:
        return 'grid-cols-1 md:grid-cols-2'
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      case 'auto':
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    }
  }

  return (
    <div 
      className={cn(
        "grid gap-6 animate-in fade-in-up duration-1000 delay-200",
        getGridColumns(columns),
        "[&>*]:min-w-0", // Prevent grid item overflow
        className
      )}
    >
      {children}
    </div>
  )
}