import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface HeroSectionProps {
  title: string
  subtitle?: string
  description?: string
  className?: string
}

export function HeroSection({
  title,
  subtitle,
  description,
  className
}: HeroSectionProps) {
  return (
    <section className={cn("text-center py-16 animate-in fade-in duration-1000", className)}>
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-5xl font-bold text-foreground mb-4 animate-in slide-in-from-bottom-4 duration-1000 delay-100">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl text-muted-foreground mb-4 animate-in slide-in-from-bottom-4 duration-1000 delay-200">
            {subtitle}
          </p>
        )}
        {description && (
          <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-1000 delay-300">
            <p className="text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}