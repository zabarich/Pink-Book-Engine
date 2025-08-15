'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  AlertCircle,
  ArrowRight,
  Sliders,
  DollarSign,
  PieChart,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { DEPARTMENTS, REVENUE_STREAMS, INITIAL_STATE } from '@/lib/budget-data';

export default function Dashboard() {
  const totalRevenue = INITIAL_STATE.revenue.total;
  const totalExpenditure = INITIAL_STATE.expenditure.total;
  const balance = INITIAL_STATE.balance.surplus;
  const reserves = INITIAL_STATE.balance.reserves;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Isle of Man Budget Explorer</h1>
          <p className="text-lg text-gray-600">
            Pink Book 2025-26 • £{(totalRevenue / 1000000000).toFixed(2)}bn Revenue • £{(totalExpenditure / 1000000000).toFixed(2)}bn Expenditure
          </p>
        </div>
        <Link href="/workshop">
          <Button size="lg" className="gap-2">
            <Sliders className="h-5 w-5" />
            Policy Workshop Mode
          </Button>
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{(totalRevenue / 1000000000).toFixed(3)}bn</div>
            <p className="text-xs text-muted-foreground">2025-26 forecast</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Expenditure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{(totalExpenditure / 1000000000).toFixed(3)}bn</div>
            <p className="text-xs text-muted-foreground">All departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Budget Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">£{(balance / 1000000).toFixed(1)}m</div>
            <p className="text-xs text-muted-foreground">Surplus</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">General Reserves</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{(reserves / 1000000000).toFixed(2)}bn</div>
            <p className="text-xs text-muted-foreground">Available</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Streams
            </CardTitle>
            <CardDescription>
              Major sources of government income
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {REVENUE_STREAMS.map((stream) => (
              <div key={stream.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{stream.name}</span>
                  <span className="font-medium">£{(stream.amount / 1000000).toFixed(1)}m</span>
                </div>
                <Progress 
                  value={(stream.amount / totalRevenue) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Department Spending */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Department Budgets
            </CardTitle>
            <CardDescription>
              Expenditure by government department
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {DEPARTMENTS.map((dept) => (
              <div key={dept.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{dept.name}</span>
                  <span className="font-medium">£{(dept.budget / 1000000).toFixed(1)}m</span>
                </div>
                <Progress 
                  value={(dept.budget / totalExpenditure) * 100} 
                  className="h-2"
                  style={{ 
                    backgroundColor: `${dept.color}20`,
                  }}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <strong>Interactive Policy Workshop</strong>
            <p className="text-sm mt-1">
              Explore budget scenarios with real-time calculations and behavioral modeling.
              Test policy changes and see their impact on the Isle of Man&apos;s finances.
            </p>
          </div>
          <Link href="/workshop">
            <Button variant="outline" size="sm" className="ml-4">
              Open Workshop
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </AlertDescription>
      </Alert>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 pt-6 border-t">
        <p>Data source: Isle of Man Pink Book 2025-26</p>
        <p>All figures are official government forecasts</p>
      </div>
    </div>
  );
}