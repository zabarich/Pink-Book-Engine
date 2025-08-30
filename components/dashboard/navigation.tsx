'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Calculator, BarChart3, FileText, Settings } from 'lucide-react'

interface NavigationProps {
  className?: string
}

export function Navigation({ className }: NavigationProps) {
  const pathname = usePathname()
  
  const navItems = [
    { href: '/', label: 'Dashboard', icon: BarChart3 },
    { href: '/workshop', label: 'Workshop', icon: Calculator },
    { href: '/about', label: 'About', icon: FileText },
  ]

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "shadow-sm animate-in slide-in-from-top duration-500",
      className
    )}>
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-iom-blue flex items-center justify-center">
              <span className="text-white font-bold text-sm">IoM</span>
            </div>
            <span className="font-bold text-lg">Budget Explorer</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  asChild
                  className={cn(
                    "gap-2",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                >
                  <Link href={item.href} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="hidden sm:inline-flex">
            Pink Book 2025-26
          </Badge>
          <Badge variant="outline" className="text-success border-success/50">
            Live Data
          </Badge>
        </div>
      </div>
    </header>
  )
}