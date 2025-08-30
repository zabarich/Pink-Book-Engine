import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string | number
  context?: string
  change?: {
    value: string | number
    direction: 'up' | 'down' | 'neutral'
    label?: string
  }
  className?: string
  onClick?: () => void
  style?: React.CSSProperties
}

export function MetricCard({
  label,
  value,
  context,
  change,
  className,
  onClick,
  style
}: MetricCardProps) {
  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4" />
      case 'down':
        return <TrendingDown className="h-4 w-4" />
      case 'neutral':
        return <ArrowRight className="h-4 w-4" />
    }
  }

  const getTrendColor = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return 'text-success'
      case 'down':
        return 'text-destructive'
      case 'neutral':
        return 'text-muted-foreground'
    }
  }

  return (
    <Card 
      className={cn(
        "relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        "before:absolute before:top-0 before:left-0 before:h-full before:w-1 before:bg-iom-blue before:transition-all before:duration-300",
        "hover:before:w-full hover:before:opacity-5",
        className
      )}
      onClick={onClick}
      style={style}
    >
      <CardContent className="p-6">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-foreground">
            {value}
          </p>
          {context && (
            <p className="text-sm text-muted-foreground">
              {context}
            </p>
          )}
          {change && (
            <div className={cn(
              "flex items-center gap-1 text-xs",
              getTrendColor(change.direction)
            )}>
              {getTrendIcon(change.direction)}
              <span>{change.value}</span>
              {change.label && (
                <span className="text-muted-foreground ml-1">
                  {change.label}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}