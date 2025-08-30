import { ReactNode } from 'react'
import { Navigation } from '@/components/dashboard/navigation'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: ReactNode
  className?: string
  showNavigation?: boolean
}

export function Layout({ 
  children, 
  className,
  showNavigation = true 
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {showNavigation && <Navigation />}
      <main className={cn(
        "container mx-auto px-4 py-8 max-w-screen-2xl",
        className
      )}>
        {children}
      </main>
    </div>
  )
}