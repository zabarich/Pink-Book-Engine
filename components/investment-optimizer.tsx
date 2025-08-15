'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  AlertCircle,
  DollarSign,
  BarChart3,
  Target
} from 'lucide-react';
import { DataBadge, TransparencyPanel } from '@/components/ui/data-citation';
import { opportunitiesService } from '@/lib/data/opportunities-service';

export function InvestmentOptimizer() {
  const [targetReturn, setTargetReturn] = useState(0.6); // Current 0.6%
  const scenarios = opportunitiesService.calculateInvestmentScenarios(targetReturn);
  
  const RESERVES_AMOUNT = 1760000000; // £1.76bn
  const CURRENT_RETURN = 0.006; // 0.6%
  const TARGET_RETURN = 0.045; // 4.5%
  const CURRENT_INCOME = 10578000; // £10.6m
  const TARGET_INCOME = 40200000; // £40.2m
  
  const selectedScenario = scenarios.find(s => Math.abs(s.rate - targetReturn / 100) < 0.001);
  const additionalIncome = RESERVES_AMOUNT * (targetReturn / 100 - CURRENT_RETURN);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Investment Return Optimizer
          </CardTitle>
          <CardDescription>
            Explore potential returns on £1.76bn reserves
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current vs Target */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-sm text-red-600 font-medium">Current Performance</p>
                <div className="mt-2 space-y-1">
                  <p className="text-2xl font-bold">0.6%</p>
                  <p className="text-sm text-gray-600">£10.6m annual income</p>
                </div>
                <DataBadge
                  value={CURRENT_INCOME}
                  source="Pink Book"
                  page={33}
                  className="mt-3"
                />
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <p className="text-sm text-blue-600 font-medium">Potential Target</p>
                <div className="mt-2 space-y-1">
                  <p className="text-2xl font-bold">4.5%</p>
                  <p className="text-sm text-gray-600">£40.2m annual income (if achievable)</p>
                </div>
                <DataBadge
                  value={TARGET_INCOME}
                  source="Pink Book"
                  page={33}
                  className="mt-3"
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Opportunity Size */}
          <Alert className="border-gray-200 bg-gray-50">
            <AlertCircle className="h-4 w-4 text-gray-600" />
            <AlertDescription className="text-gray-700">
              <strong>Potential Scenario:</strong> If a 4.5% return could be achieved, it might generate 
              an additional £29.6m annually. This depends on market conditions, risk tolerance, and implementation feasibility.
            </AlertDescription>
          </Alert>
          
          {/* Return Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-base">Target Investment Return</Label>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {targetReturn.toFixed(1)}%
              </Badge>
            </div>
            <Slider
              value={[targetReturn * 10]}
              onValueChange={([value]) => setTargetReturn(value / 10)}
              min={6}
              max={60}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>Current (0.6%)</span>
              <span>Conservative (3%)</span>
              <span>Target (4.5%)</span>
              <span>Aggressive (6%)</span>
            </div>
          </div>
          
          {/* Impact Display */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">Annual Income</p>
              <p className="text-xl font-bold mt-1">
                £{((RESERVES_AMOUNT * targetReturn / 100) / 1000000).toFixed(1)}m
              </p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600">Additional Income</p>
              <p className="text-xl font-bold mt-1 text-blue-600">
                +£{(additionalIncome / 1000000).toFixed(1)}m
              </p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-600">% of £60m Target</p>
              <p className="text-xl font-bold mt-1 text-green-600">
                {((additionalIncome / 60900000) * 100).toFixed(0)}%
              </p>
            </div>
          </div>
          
          {/* Risk-Return Scenarios */}
          <div className="space-y-3">
            <Label className="text-base">Investment Strategy Options</Label>
            <div className="space-y-2">
              {scenarios.map((scenario) => {
                const isSelected = Math.abs(scenario.rate - targetReturn / 100) < 0.001;
                const isCurrent = scenario.rate === 0.01;
                const isTarget = scenario.rate === 0.045;
                
                return (
                  <div
                    key={scenario.label}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'border-blue-300 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setTargetReturn(scenario.rate * 100)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {scenario.label}
                            {isTarget && (
                              <Badge className="text-xs" variant="default">
                                Pink Book Target
                              </Badge>
                            )}
                          </p>
                          <p className="text-sm text-gray-600">
                            Risk: {scenario.risk}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          £{(scenario.income / 1000000).toFixed(1)}m
                        </p>
                        <p className="text-xs text-green-600">
                          +£{(scenario.additionalIncome / 1000000).toFixed(1)}m
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Calculation Transparency */}
          <TransparencyPanel
            title="Investment Income Calculation"
            calculation="Reserves × Return Rate = Annual Income"
            inputs={[
              {
                label: "Reserve Balance",
                value: RESERVES_AMOUNT,
                source: "Pink Book"
              },
              {
                label: "Target Return",
                value: targetReturn,
                source: "User Input"
              }
            ]}
            result={RESERVES_AMOUNT * targetReturn / 100}
            confidence="Medium"
            assumptions={[
              "Market conditions remain favorable",
              "Professional fund management available",
              "Diversified portfolio can be achieved",
              "Risk tolerance allows higher returns"
            ]}
            limitations={[
              "Market volatility could impact returns",
              "Returns are not guaranteed",
              "Transition may take 12-24 months",
              "Higher returns mean higher risk",
              "Past performance doesn't predict future"
            ]}
          />
        </CardContent>
      </Card>
      
      {/* Implementation Path */}
      <Card>
        <CardHeader>
          <CardTitle>Possible Implementation Approach</CardTitle>
          <CardDescription>
            Steps that could be explored to improve returns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div className="flex-1">
                <p className="font-medium">Review Current Portfolio</p>
                <p className="text-sm text-gray-600">
                  Understand current 0.6% returns and explore improvement options
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div className="flex-1">
                <p className="font-medium">Consider Professional Management</p>
                <p className="text-sm text-gray-600">
                  Pink Book p.33 mentions external fund managers as an option
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div className="flex-1">
                <p className="font-medium">Gradual Portfolio Transition (if approved)</p>
                <p className="text-sm text-gray-600">
                  Could potentially move to more balanced allocation over 12-24 months
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-medium">
                <Target className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-blue-700">Potential Additional Income: £29.6m</p>
                <p className="text-sm text-gray-600">
                  Could contribute toward the £60m target (subject to all conditions being met)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}