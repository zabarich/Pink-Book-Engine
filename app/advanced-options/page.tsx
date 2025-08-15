'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Plane, 
  Ship, 
  Building, 
  Users, 
  Briefcase, 
  Receipt, 
  HardHat,
  AlertCircle,
  Calculator,
  ChevronRight,
  ArrowLeft,
  TrendingUp
} from 'lucide-react';

export default function AdvancedOptionsPage() {
  // State for all policy options
  const [policies, setPolicies] = useState({
    // Infrastructure Revenue
    airportCharge: 0,
    portDuesIncrease: 0,
    internalRentCharging: false,
    freeTransport: false,
    heritageRailDays: 7,
    
    // Transfer Reforms
    winterBonusMeans: 'universal',
    childBenefitTaper: 0,
    housingBenefitCap: 0,
    
    // Department Operations
    cabinetEfficiency: 0,
    enterpriseGrants: 0,
    publicSectorPay: '2%',
    
    // Fees & Charges
    generalFeesUplift: 0,
    targetedRecovery: [] as string[],
    
    // Capital Management
    capitalGating: false,
    deferLowBCR: 0,
  });

  // Calculate total impact
  const totalImpact = useMemo(() => {
    let total = 0;
    
    // Infrastructure
    total += policies.airportCharge * 800000; // £ per passenger × 800k passengers
    total += 4900000 * (policies.portDuesIncrease / 100); // % of £4.9m base
    total += policies.internalRentCharging ? 3000000 : 0;
    total -= policies.freeTransport ? 3500000 : 0; // Cost of free transport
    total += policies.heritageRailDays === 5 ? 600000 : 0; // Savings from reduced days
    
    // Transfers
    total += policies.winterBonusMeans === 'benefits' ? 3600000 : 
             policies.winterBonusMeans === 'age75' ? 2000000 : 0;
    total += policies.childBenefitTaper;
    total += policies.housingBenefitCap;
    
    // Departments
    total += policies.cabinetEfficiency;
    total += policies.enterpriseGrants;
    // Public sector pay impact (negative values are costs)
    const payImpact: { [key: string]: number } = {
      'freeze': 10144800,  // Saves 2% increase
      '1%': 5072400,       // Saves 1% vs 2% baseline
      '2%': 0,             // Baseline
      '3%': -5072400       // Costs extra 1%
    };
    total += payImpact[policies.publicSectorPay] || 0;
    
    // Fees
    total += 150000000 * (policies.generalFeesUplift / 100);
    total += policies.targetedRecovery.reduce((sum, item) => {
      const values: { [key: string]: number } = {
        'vehicle': 500000,
        'planning': 800000,
        'court': 400000,
        'environmental': 300000
      };
      return sum + (values[item] || 0);
    }, 0);
    
    // Capital
    total += policies.capitalGating ? 22700000 : 0;
    total += policies.deferLowBCR;
    
    return total;
  }, [policies]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `£${(value / 1000000).toFixed(1)}m`;
    }
    return `£${(value / 1000).toFixed(0)}k`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/workshop" className="text-gray-500 hover:text-gray-700 mr-4 flex items-center">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Workshop
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Additional Policy Options
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Impact</p>
                <p className="text-xl font-bold text-green-600">
                  +{formatCurrency(totalImpact)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Introduction */}
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            These additional policy options provide specific levers for revenue generation and cost savings.
            They can be combined with the main workshop controls for comprehensive budget modeling.
          </AlertDescription>
        </Alert>

        {/* Policy Tabs */}
        <Tabs defaultValue="infrastructure" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
            <TabsTrigger value="transfers">Transfers</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="fees">Fees & Charges</TabsTrigger>
            <TabsTrigger value="capital">Capital</TabsTrigger>
          </TabsList>

          {/* Infrastructure Tab */}
          <TabsContent value="infrastructure" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Infrastructure Revenue Options
                </CardTitle>
                <CardDescription>
                  Generate revenue from infrastructure assets and services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Airport Passenger Charge */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Airport Passenger Charge</Label>
                    <Badge variant="outline">High confidence</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm w-12">£{policies.airportCharge}</span>
                    <Slider
                      value={[policies.airportCharge]}
                      onValueChange={([value]) => 
                        setPolicies(prev => ({ ...prev, airportCharge: value }))
                      }
                      min={0}
                      max={10}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500 w-20">
                      +{formatCurrency(policies.airportCharge * 800000)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    New charge per passenger (800k passengers/year). UK airports charge £13-35.
                  </p>
                </div>

                {/* Port Dues Increase */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Port Dues Increase</Label>
                    <Badge variant="outline">Medium confidence</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm w-12">{policies.portDuesIncrease}%</span>
                    <Slider
                      value={[policies.portDuesIncrease]}
                      onValueChange={([value]) => 
                        setPolicies(prev => ({ ...prev, portDuesIncrease: value }))
                      }
                      min={0}
                      max={30}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500 w-20">
                      +{formatCurrency(4900000 * (policies.portDuesIncrease / 100))}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Increase from current £4.9m base. Still below UK port rates.
                  </p>
                </div>

                {/* Internal Rent Charging */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label>Internal Rent Charging</Label>
                    <p className="text-xs text-gray-600 mt-1">
                      Charge departments market rent for government buildings
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      {policies.internalRentCharging ? '+£3m' : '£0'}
                    </span>
                    <Switch
                      checked={policies.internalRentCharging}
                      onCheckedChange={(checked) => 
                        setPolicies(prev => ({ ...prev, internalRentCharging: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-medium mb-3">Transport Policies</h4>
                  
                  {/* Free Public Transport */}
                  <div className="flex items-center justify-between p-3 border rounded-lg mb-3">
                    <div>
                      <Label>Free Public Transport</Label>
                      <p className="text-xs text-gray-600 mt-1">
                        Make all bus services free (additional cost)
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">
                        {policies.freeTransport ? '-£3.5m' : '£0'}
                      </span>
                      <Switch
                        checked={policies.freeTransport}
                        onCheckedChange={(checked) => 
                          setPolicies(prev => ({ ...prev, freeTransport: checked }))
                        }
                      />
                    </div>
                  </div>

                  {/* Heritage Railway Days */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Heritage Railway Operating Days</Label>
                      <Badge variant="outline">High confidence</Badge>
                    </div>
                    <Select
                      value={policies.heritageRailDays.toString()}
                      onValueChange={(value) => 
                        setPolicies(prev => ({ ...prev, heritageRailDays: parseInt(value) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 days/week (current)</SelectItem>
                        <SelectItem value="5">5 days/week (+£600k savings)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-600">
                      Reduce Heritage Railway to weekdays only. Annual budget: £2.25m
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transfers Tab */}
          <TabsContent value="transfers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Transfer Payment Reforms
                </CardTitle>
                <CardDescription>
                  Optimize transfer payments while protecting vulnerable groups
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Winter Bonus Means Testing */}
                <div className="space-y-3">
                  <Label>Winter Bonus Means Testing</Label>
                  <Select
                    value={policies.winterBonusMeans}
                    onValueChange={(value) => 
                      setPolicies(prev => ({ ...prev, winterBonusMeans: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="universal">Universal (current)</SelectItem>
                      <SelectItem value="benefits">Benefits recipients only (+£3.6m)</SelectItem>
                      <SelectItem value="age75">Age 75+ only (+£2m)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-600">
                    Currently £4.5m universal payment. UK has moved to means testing.
                  </p>
                </div>

                {/* Child Benefit Taper */}
                <div className="space-y-3">
                  <Label>Child Benefit High Earner Taper</Label>
                  <Select
                    value={policies.childBenefitTaper.toString()}
                    onValueChange={(value) => 
                      setPolicies(prev => ({ ...prev, childBenefitTaper: parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No taper</SelectItem>
                      <SelectItem value="2000000">£50k threshold (+£2m)</SelectItem>
                      <SelectItem value="3500000">£40k threshold (+£3.5m)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-600">
                    Reduce child benefit for high earners, similar to UK model
                  </p>
                </div>

                {/* Housing Benefit Cap */}
                <div className="space-y-3">
                  <Label>Housing Benefit Cap</Label>
                  <Select
                    value={policies.housingBenefitCap.toString()}
                    onValueChange={(value) => 
                      setPolicies(prev => ({ ...prev, housingBenefitCap: parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No cap</SelectItem>
                      <SelectItem value="1500000">£400/week cap (+£1.5m)</SelectItem>
                      <SelectItem value="2500000">£350/week cap (+£2.5m)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-600">
                    Limit maximum housing benefit payments
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Department Operations
                </CardTitle>
                <CardDescription>
                  Targeted efficiency savings and grant reductions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Cabinet Office Efficiency */}
                <div className="space-y-3">
                  <Label>Cabinet Office Efficiency Target</Label>
                  <Select
                    value={policies.cabinetEfficiency.toString()}
                    onValueChange={(value) => 
                      setPolicies(prev => ({ ...prev, cabinetEfficiency: parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No additional savings</SelectItem>
                      <SelectItem value="5000000">10% reduction (+£5m)</SelectItem>
                      <SelectItem value="7500000">15% reduction (+£7.5m)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-600">
                    Streamline central administration functions
                  </p>
                </div>

                {/* Enterprise Grants */}
                <div className="space-y-3">
                  <Label>Enterprise Grant Reduction</Label>
                  <Select
                    value={policies.enterpriseGrants.toString()}
                    onValueChange={(value) => 
                      setPolicies(prev => ({ ...prev, enterpriseGrants: parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Maintain current</SelectItem>
                      <SelectItem value="3000000">Reduce discretionary grants (+£3m)</SelectItem>
                      <SelectItem value="5000000">Focus on core only (+£5m)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-600">
                    Review non-essential business support grants
                  </p>
                </div>

                {/* Public Sector Pay */}
                <div className="space-y-3 border-t pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <Label>Public Sector Pay Increase</Label>
                    <Badge variant="outline">High impact</Badge>
                  </div>
                  <Select
                    value={policies.publicSectorPay}
                    onValueChange={(value) => 
                      setPolicies(prev => ({ ...prev, publicSectorPay: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="freeze">Pay freeze (+£10.1m savings)</SelectItem>
                      <SelectItem value="1%">1% increase (+£5.1m savings vs 2%)</SelectItem>
                      <SelectItem value="2%">2% increase (baseline)</SelectItem>
                      <SelectItem value="3%">3% increase (-£5.1m additional cost)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-600">
                    Affects all public sector employees across government. 2% is the current assumption.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fees & Charges Tab */}
          <TabsContent value="fees" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Fees & Charges
                </CardTitle>
                <CardDescription>
                  Update government fees to reflect costs and inflation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* General Fees Uplift */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>General Fees Uplift</Label>
                    <Badge variant="outline">High confidence</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm w-12">{policies.generalFeesUplift}%</span>
                    <Slider
                      value={[policies.generalFeesUplift]}
                      onValueChange={([value]) => 
                        setPolicies(prev => ({ ...prev, generalFeesUplift: value }))
                      }
                      min={0}
                      max={10}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500 w-20">
                      +{formatCurrency(150000000 * (policies.generalFeesUplift / 100))}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Inflation adjustment across all government fees (£150m base)
                  </p>
                </div>

                {/* Targeted Recovery */}
                <div className="space-y-3">
                  <Label>Targeted Cost Recovery</Label>
                  <div className="space-y-2">
                    {[
                      { id: 'vehicle', label: 'Vehicle registration (+£500k)' },
                      { id: 'planning', label: 'Planning applications (+£800k)' },
                      { id: 'court', label: 'Court fees (+£400k)' },
                      { id: 'environmental', label: 'Environmental permits (+£300k)' }
                    ].map(item => (
                      <div key={item.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={item.id}
                          checked={policies.targetedRecovery.includes(item.id)}
                          onCheckedChange={(checked) => {
                            setPolicies(prev => ({
                              ...prev,
                              targetedRecovery: checked
                                ? [...prev.targetedRecovery, item.id]
                                : prev.targetedRecovery.filter(x => x !== item.id)
                            }));
                          }}
                        />
                        <label
                          htmlFor={item.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {item.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Capital Tab */}
          <TabsContent value="capital" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardHat className="h-5 w-5" />
                  Capital Programme Management
                </CardTitle>
                <CardDescription>
                  Optimize capital spending based on delivery capability
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Capital Gating */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label>Realistic Capital Gating</Label>
                    <p className="text-xs text-gray-600 mt-1">
                      Reduce budget to match 74% historical delivery rate
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      {policies.capitalGating ? '+£22.7m' : '£0'}
                    </span>
                    <Switch
                      checked={policies.capitalGating}
                      onCheckedChange={(checked) => 
                        setPolicies(prev => ({ ...prev, capitalGating: checked }))
                      }
                    />
                  </div>
                </div>

                {/* Defer Low BCR Projects */}
                <div className="space-y-3">
                  <Label>Defer Low BCR Projects</Label>
                  <Select
                    value={policies.deferLowBCR.toString()}
                    onValueChange={(value) => 
                      setPolicies(prev => ({ ...prev, deferLowBCR: parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Proceed with all</SelectItem>
                      <SelectItem value="10000000">Defer BCR &lt; 1.5 (+£10m)</SelectItem>
                      <SelectItem value="15000000">Defer BCR &lt; 2.0 (+£15m)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-600">
                    Postpone projects with low benefit-cost ratios
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Summary Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Policy Impact Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-semibold">Total Additional Impact</span>
                <span className="text-xl font-bold text-green-600">
                  +{formatCurrency(totalImpact)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Infrastructure</span>
                  <span className="font-medium">
                    {formatCurrency(
                      policies.airportCharge * 800000 +
                      4900000 * (policies.portDuesIncrease / 100) +
                      (policies.internalRentCharging ? 3000000 : 0) -
                      (policies.freeTransport ? 3500000 : 0) +
                      (policies.heritageRailDays === 5 ? 600000 : 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transfers</span>
                  <span className="font-medium">
                    +{formatCurrency(
                      (policies.winterBonusMeans === 'benefits' ? 3600000 : 
                       policies.winterBonusMeans === 'age75' ? 2000000 : 0) +
                      policies.childBenefitTaper +
                      policies.housingBenefitCap
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Departments</span>
                  <span className="font-medium">
                    {formatCurrency(
                      policies.cabinetEfficiency + 
                      policies.enterpriseGrants +
                      (policies.publicSectorPay === 'freeze' ? 10144800 :
                       policies.publicSectorPay === '1%' ? 5072400 :
                       policies.publicSectorPay === '3%' ? -5072400 : 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fees & Charges</span>
                  <span className="font-medium">
                    +{formatCurrency(
                      150000000 * (policies.generalFeesUplift / 100) +
                      policies.targetedRecovery.reduce((sum, item) => {
                        const values: { [key: string]: number } = {
                          'vehicle': 500000,
                          'planning': 800000,
                          'court': 400000,
                          'environmental': 300000
                        };
                        return sum + (values[item] || 0);
                      }, 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}