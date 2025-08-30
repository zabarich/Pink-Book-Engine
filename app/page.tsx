import { Layout } from '@/components/shared/layout'
import { HeroSection } from '@/components/dashboard/hero-section'
import { DashboardGrid } from '@/components/dashboard/dashboard-grid'
import { MetricCard } from '@/components/dashboard/metric-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const keyMetrics = [
  {
    label: 'Total Budget',
    value: '£1.39bn',
    context: '£16,450 per capita',
    change: { value: '3.5%', direction: 'up' as const, label: 'from 2024-25' }
  },
  {
    label: 'Revenue',
    value: '£1.39bn', 
    context: 'Balanced budget',
    change: { value: 'On target', direction: 'neutral' as const }
  },
  {
    label: 'Reserves',
    value: '£1.76bn',
    context: 'General Reserve',
    change: { value: 'Declining gradually', direction: 'down' as const }
  },
  {
    label: 'NI Fund',
    value: '£850m',
    context: 'Sustainable to 2050+',
    change: { value: 'Growing', direction: 'up' as const }
  }
]

const quickInsights = [
  { icon: '👥', metric: 'Population', value: '84,500', detail: '2021 Census' },
  { icon: '💰', metric: 'GDP per capita', value: '£91,990', detail: 'Above UK average' },
  { icon: '💼', metric: 'Employment', value: '82%', detail: 'Near full employment' },
  { icon: '📈', metric: 'Inflation', value: '4.1%', detail: 'Triple lock applied' }
]

const facts = [
  '📊 The Island maintains reserves of £1.76bn, providing financial resilience',
  '🏢 98% of companies pay 0% corporation tax by design to encourage business',
  '👥 Public services employ approximately 7,000 people across the Island',
  '💷 VAT sharing agreement with UK provides £388m annually',
  '📈 GDP per capita of £91,990 - among highest globally',
  '🏥 Health & Social Care represents 26% of total government spending',
  '🎓 Education investment: £1,668 per resident annually',
  '✈️ Airport handles 850,000 passengers annually'
]

const revenueBreakdown = [
  { label: 'VAT Revenue Sharing', amount: '£388m' },
  { label: 'Income Tax', amount: '£384m' },
  { label: 'National Insurance', amount: '£330m' },
  { label: 'Customs & Excise', amount: '£183m' },
  { label: 'Other Income', amount: '£104m' }
]

const expenditureBreakdown = [
  { label: 'Health & Social Care', amount: '£357m' },
  { label: 'Social Security', amount: '£460m' },
  { label: 'Education', amount: '£141m' },
  { label: 'Infrastructure', amount: '£116m' }
]

export default function HomePage() {
  return (
    <Layout>
      <HeroSection
        title="Isle of Man Budget Explorer"
        subtitle="Exploring the Pink Book 2025-26 Data"
        description="An interactive tool to understand the Isle of Man Government's finances, exploring £1.39 billion in revenue and expenditure across all departments and services."
      />

      <section className="mb-12">
        <DashboardGrid>
          {keyMetrics.map((metric, index) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              context={metric.context}
              change={metric.change}
              className="animate-in fade-in-up duration-1000"
              style={{ animationDelay: `${index * 100}ms` }}
            />
          ))}
        </DashboardGrid>
      </section>

      <section className="mb-12">
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 animate-in fade-in-up duration-1000 delay-300">
          <div className="flex flex-wrap gap-4 justify-center">
            {facts.map((fact, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="px-4 py-2 text-sm whitespace-nowrap"
              >
                {fact}
              </Badge>
            ))}
          </div>
        </Card>
      </section>

      <section className="mb-12">
        <h3 className="text-2xl font-semibold text-center mb-8">Key Context</h3>
        <DashboardGrid columns={4}>
          {quickInsights.map((insight, index) => (
            <Card key={insight.metric} className="text-center animate-in fade-in-up duration-1000">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">{insight.icon}</div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  {insight.metric}
                </p>
                <p className="text-2xl font-bold text-primary mb-1">
                  {insight.value}
                </p>
                <p className="text-sm text-muted-foreground">
                  {insight.detail}
                </p>
              </CardContent>
            </Card>
          ))}
        </DashboardGrid>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">Understanding Our Finances</h2>
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="animate-in fade-in-up duration-1000 delay-400">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">£</span>
                Understanding Our Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                The Island's revenue comes from diverse sources, providing stability and resilience.
              </p>
              <div className="space-y-4">
                {revenueBreakdown.map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <span className="text-sm font-medium">{item.label}</span>
                    <Badge variant="outline" className="font-mono">{item.amount}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-up duration-1000 delay-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Investment in Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Public spending supports essential services for Island residents.
              </p>
              <div className="space-y-4">
                {expenditureBreakdown.map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <span className="text-sm font-medium">{item.label}</span>
                    <Badge variant="outline" className="font-mono">{item.amount}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  )
}