'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Wallet, 
  Target, 
  CheckCircle2,
  AlertCircle,
  Banknote,
  PiggyBank,
  Calculator
} from 'lucide-react';
import { opportunitiesService } from '@/lib/data/opportunities-service';
import { DataBadge, CitedValue } from '@/components/ui/data-citation';

export function OpportunitiesPanel() {
  const path = opportunitiesService.getPathToTarget();
  const stats = opportunitiesService.getSummaryStats();
  const combinations = opportunitiesService.getOptimalCombinations();
  
  // User selections for exploring opportunities
  const [selections, setSelections] = useState({
    economicStrategyFund: 0, // 0-47.9m
    revenueContingency: 0, // 0-19.7m
    capitalDeliveryRate: 74, // 74-100%
    investmentReturn: 0.6, // 0.6-4.5%
    pillarTwoAcceleration: 'normal', // normal, fast, slow
  });
  
  // Calculate total selected
  const totalSelected = 
    selections.economicStrategyFund * 1000000 +
    selections.revenueContingency * 1000000 +
    ((selections.capitalDeliveryRate - 74) / 100 * 87400000) +
    ((selections.investmentReturn - 0.6) / 100 * 1760000000);
  
  const progressPercentage = Math.min((totalSelected / stats.targetNeeded) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Information Note */}
      <Alert className="border-gray-200 bg-gray-50">
        <AlertCircle className="h-4 w-4 text-gray-600" />
        <AlertTitle className="text-gray-800">
          Explore Potential Options
        </AlertTitle>
        <AlertDescription className="text-gray-700">
          Pink Book data identifies approximately £{(stats.totalAvailable / 1000000).toFixed(1)}m 
          in potential options. Each has different requirements and risks.
          Use the controls below to explore various combinations.
        </AlertDescription>
      </Alert>

      {/* Exploration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Model Different Scenarios
          </CardTitle>
          <CardDescription>
            Explore potential options using Pink Book data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Scenario Calculator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Target for comparison: £60.9m</span>
              <span className="font-medium">
                Your selection: £{(totalSelected / 1000000).toFixed(1)}m
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            {progressPercentage >= 100 && (
              <p className="text-sm text-blue-600">
                This combination would exceed the target by £{((totalSelected - stats.targetNeeded) / 1000000).toFixed(1)}m
              </p>
            )}
          </div>

          <Tabs defaultValue="immediate" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="immediate">Existing Funds</TabsTrigger>
              <TabsTrigger value="revenue">Potential Revenue</TabsTrigger>
              <TabsTrigger value="efficiency">Possible Efficiencies</TabsTrigger>
            </TabsList>

            <TabsContent value="immediate" className="space-y-4">
              <div className="space-y-4">
                {/* Economic Strategy Fund */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="flex items-center gap-2">
                      <PiggyBank className="h-4 w-4" />
                      Use Economic Strategy Fund
                    </Label>
                    <DataBadge 
                      value={47900000}
                      source="Pink Book"
                      page={41}
                    />
                  </div>
                  <Slider
                    value={[selections.economicStrategyFund]}
                    onValueChange={([value]) => 
                      setSelections(prev => ({ ...prev, economicStrategyFund: value }))
                    }
                    max={47.9}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>£{selections.economicStrategyFund}m modeled</span>
                    <span>Currently unallocated - may be earmarked</span>
                  </div>
                </div>

                {/* Revenue Contingency */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      Use Revenue Contingency
                    </Label>
                    <DataBadge 
                      value={19700000}
                      source="Pink Book"
                      page={41}
                    />
                  </div>
                  <Slider
                    value={[selections.revenueContingency]}
                    onValueChange={([value]) => 
                      setSelections(prev => ({ ...prev, revenueContingency: value }))
                    }
                    max={19.7}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>£{selections.revenueContingency}m modeled</span>
                    <span>May be required for actual contingencies</span>
                  </div>
                </div>

                <Alert className="border-amber-200 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-700">
                    <strong>Important:</strong> Contingency funds may be needed for unforeseen events.
                    The Economic Strategy Fund may have intended uses not yet formalized.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-4">
              <div className="space-y-4">
                {/* Investment Returns */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Investment Return Target
                    </Label>
                    <DataBadge 
                      value={`${selections.investmentReturn}%`}
                      source="User Input"
                    />
                  </div>
                  <Slider
                    value={[selections.investmentReturn * 10]}
                    onValueChange={([value]) => 
                      setSelections(prev => ({ ...prev, investmentReturn: value / 10 }))
                    }
                    min={6}
                    max={45}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Current: 0.6% (£10.6m)</span>
                    <span>Target: 4.5% (£40.2m)</span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-xs">
                    Potential additional income: £{((selections.investmentReturn - 0.6) / 100 * 1760).toFixed(1)}m
                    <span className="text-gray-600 ml-2">(Subject to market conditions - Pink Book p.33)</span>
                  </div>
                </div>

                {/* Pillar Two Tax */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    Pillar Two Tax Timeline
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {['slow', 'normal', 'fast'].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => 
                          setSelections(prev => ({ ...prev, pillarTwoAcceleration: speed }))
                        }
                        className={`px-3 py-2 rounded-md text-sm capitalize ${
                          selections.pillarTwoAcceleration === speed
                            ? 'bg-blue-100 border-blue-300 border'
                            : 'bg-gray-50 border-gray-200 border'
                        }`}
                      >
                        {speed}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div>2025-26: £10m (if implemented)</div>
                    <div>2026-27: £25m (projected)</div>
                    <div>2027-28: £35m (projected)</div>
                    <div className="text-gray-500">Requires legislation and implementation - Pink Book p.36-37</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="efficiency" className="space-y-4">
              <div className="space-y-4">
                {/* Capital Delivery */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Improve Capital Delivery Rate
                    </Label>
                    <DataBadge 
                      value={`${selections.capitalDeliveryRate}%`}
                      source="User Input"
                    />
                  </div>
                  <Slider
                    value={[selections.capitalDeliveryRate]}
                    onValueChange={([value]) => 
                      setSelections(prev => ({ ...prev, capitalDeliveryRate: value }))
                    }
                    min={74}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Historical: 74% delivered</span>
                    <span>Unspent: £{((100 - selections.capitalDeliveryRate) / 100 * 87.4).toFixed(1)}m</span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-xs">
                    Each 1% improvement could release £874k
                    <span className="text-gray-600 ml-2">(Historical delivery 74% - Pink Book p.54)</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Example Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle>Example Combinations to Explore</CardTitle>
          <CardDescription>
            Different ways to model potential paths to £60m
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {combinations.map((combo, index) => (
            <div 
              key={index}
              className="p-3 border rounded-lg space-y-2 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{combo.name}</p>
                  <ul className="text-xs text-gray-600 mt-1 space-y-0.5">
                    {combo.opportunities.map((opp, i) => (
                      <li key={i}>• {opp}</li>
                    ))}
                  </ul>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    £{(combo.total / 1000000).toFixed(1)}m
                  </p>
                  {combo.meetsTarget && (
                    <Badge variant="outline" className="text-blue-600 border-blue-300">
                      &gt;£60m
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              £{(stats.totalAvailable / 1000000).toFixed(1)}m
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Total Potential Identified
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Subject to various conditions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              £{(stats.immediatelyAvailable / 1000000).toFixed(1)}m
            </div>
            <p className="text-xs text-gray-600 mt-1">
              In Existing Funds
            </p>
            <p className="text-xs text-gray-500 mt-2">
              If not required for other purposes
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}