'use client'

import { useState, useEffect } from 'react'
import { DEPARTMENTS, REVENUE_STREAMS, INITIAL_STATE } from '@/lib/budget-data'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import { 
  Calculator,
  Save,
  RotateCcw,
  Download,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Sliders,
  DollarSign,
  ArrowRight,
  Info,
  ChevronDown,
  ChevronUp,
  Activity,
  Target,
  Shield,
  Zap,
  Users,
  Building,
  Plane,
  Gamepad2,
  Hotel,
  CheckCircle2,
  Clock,
  FileText,
  Lightbulb
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Policy status types
type PolicyStatus = 'existing' | 'proposed' | 'consultation' | 'scenario'

interface PolicyInfo {
  status: PolicyStatus
  baseline?: number
  description: string
}

// Status badge component
function StatusBadge({ status }: { status: PolicyStatus }) {
  const styles = {
    existing: 'bg-green-50 text-green-700 border-green-200',
    consultation: 'bg-amber-50 text-amber-700 border-amber-200',
    proposed: 'bg-blue-50 text-blue-700 border-blue-200',
    scenario: 'bg-gray-50 text-gray-700 border-gray-200'
  }
  
  const labels = {
    existing: 'Existing',
    consultation: 'Consultation',
    proposed: 'Proposed',
    scenario: 'Scenario'
  }
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full border ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

// NHS Levy Calculation Model
const calculateNHSLevy = (rate: number, levyFreeAmount: number, individualCap: number) => {
  // Based on income tax base of £384m and income distribution
  const totalIncomeTaxBase = 384000000
  const averageIncome = 45000 // Estimated average income
  const taxpayerCount = 35000 // Estimated number of taxpayers
  
  // Calculate levy with free amount and caps
  const effectiveBase = totalIncomeTaxBase * (1 - levyFreeAmount / averageIncome)
  const uncappedRevenue = effectiveBase * (rate / 100)
  
  // Apply caps (estimate 5% of taxpayers hit the cap)
  const cappedTaxpayers = taxpayerCount * 0.05
  const cappedReduction = cappedTaxpayers * (uncappedRevenue / taxpayerCount - individualCap)
  
  const finalRevenue = Math.max(0, uncappedRevenue - Math.max(0, cappedReduction))
  const affectedTaxpayers = Math.round(taxpayerCount * (1 - levyFreeAmount / averageIncome))
  
  return {
    revenue: finalRevenue,
    affectedTaxpayers
  }
}

export default function WorkshopPage() {
  // Income Tax Controls
  const [incomeTaxRate, setIncomeTaxRate] = useState(21) // Higher rate
  const [standardTaxRate, setStandardTaxRate] = useState(10)
  const [personalAllowance, setPersonalAllowance] = useState(14500)
  const [higherRateThreshold, setHigherRateThreshold] = useState(21000)
  
  // Tax Caps
  const [personalTaxCap, setPersonalTaxCap] = useState(220000)
  const [jointTaxCap, setJointTaxCap] = useState(440000)
  
  // Corporate Tax Controls
  const [corporateTaxRate, setCorporateTaxRate] = useState(0) // Standard rate
  const [bankingTaxRate, setBankingTaxRate] = useState(10) // Banking/Property rate
  const [retailerTaxRate, setRetailerTaxRate] = useState(20) // Large retailer rate
  const [retailerThreshold, setRetailerThreshold] = useState(500000) // Threshold for large retailer rate
  const [pillarTwoEnabled, setPillarTwoEnabled] = useState(false) // OECD Pillar Two
  
  // VAT & Customs
  const [vatRate, setVatRate] = useState(20)
  const [fersaRate, setFersaRate] = useState(4.35) // VAT sharing rate
  const [customsDutyRate, setCustomsDutyRate] = useState(0) // Import duty adjustment
  
  // National Insurance - Granular Controls
  const [niEmployeeRate, setNiEmployeeRate] = useState(11)
  const [niEmployerRate, setNiEmployerRate] = useState(12.8)
  const [niUpperLimit, setNiUpperLimit] = useState(50270)
  const [niLowerLimit, setNiLowerLimit] = useState(120)
  const [niSelfEmployedClass2, setNiSelfEmployedClass2] = useState(3.45)
  const [niSelfEmployedClass4, setNiSelfEmployedClass4] = useState(9)
  
  // NHS Levy Controls (Proper Implementation)
  const [nhsLevyRate, setNhsLevyRate] = useState(0)
  const [nhsLevyFreeAmount, setNhsLevyFreeAmount] = useState(14500)
  const [nhsLevyIndividualCap, setNhsLevyIndividualCap] = useState(5000)
  
  // New Realistic Revenue Sources
  const [touristAccommodationLevy, setTouristAccommodationLevy] = useState(0) // £ per night
  const [airportPassengerDuty, setAirportPassengerDuty] = useState(0) // £ per departure
  const [onlineGamingDuty, setOnlineGamingDuty] = useState(0) // % on gross gaming revenue
  
  // Department Adjustments - ALL Departments
  const [deptAdjustments, setDeptAdjustments] = useState<Record<string, number>>({
    health: 0,
    manxCare: 0,
    publicHealth: 0,
    mentalHealth: 0,
    education: 0,
    infrastructure: 0,
    homeAffairs: 0,
    treasury: 0,
    cabinetOffice: 0,
    enterprise: 0,
    environment: 0,
    otherBodies: 0 // Other agencies and bodies
  })
  
  // Show/Hide Department Breakdowns
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set())
  
  // Policy Toggles
  const [publicSectorPay, setPublicSectorPay] = useState<'freeze' | '1%' | '2%' | '3%'>('2%')
  const [sharedServices, setSharedServices] = useState(0) // 0-15m savings
  const [digitalTransformation, setDigitalTransformation] = useState(0) // 0-20m savings
  const [procurementCentralization, setProcurementCentralization] = useState(0) // 0-10m savings
  
  // Strategic Policy Options
  const [targetReserveLevel, setTargetReserveLevel] = useState(2000) // Target in millions
  const [annualDrawdownLimit, setAnnualDrawdownLimit] = useState(100) // Max annual withdrawal in millions
  const [investmentStrategy, setInvestmentStrategy] = useState<'conservative' | 'balanced' | 'growth'>('balanced')
  
  // Pension Policy
  const [statePensionAge, setStatePensionAge] = useState(66)
  const [tripleLockEnabled, setTripleLockEnabled] = useState(true)
  const [publicPensionContribution, setPublicPensionContribution] = useState(13.7) // Employee contribution rate
  
  // Capital Programme
  const [totalCapitalBudget, setTotalCapitalBudget] = useState(87.4) // millions
  const [borrowingEnabled, setBorrowingEnabled] = useState(false)
  const [borrowingLimit, setBorrowingLimit] = useState(0) // millions
  
  // UI State
  const [activeTab, setActiveTab] = useState('tax-policy')
  const [showAdvancedNI, setShowAdvancedNI] = useState(false)
  const [showAdvancedCorp, setShowAdvancedCorp] = useState(false)
  
  // Calculations
  const [results, setResults] = useState({
    revenue: INITIAL_STATE.revenue.total,
    expenditure: INITIAL_STATE.expenditure.total,
    balance: INITIAL_STATE.balance.surplus,
    warnings: [] as string[],
    impacts: {
      economicGrowth: 0,
      serviceQuality: 0,
      competitiveness: 0,
      reserveSustainability: 5
    }
  })
  
  // Calculate revenue and expenditure impacts
  useEffect(() => {
    let newRevenue = INITIAL_STATE.revenue.total
    let warnings: string[] = []
    
    // Income tax changes with Laffer curve
    const incomeTaxBase = INITIAL_STATE.revenue.incomeTax
    const higherRateDiff = (incomeTaxRate - 21) / 100
    const standardRateDiff = (standardTaxRate - 10) / 100
    
    const lafferMultiplier = incomeTaxRate > 30 ? Math.max(0.7, 1 - (incomeTaxRate - 30) * 0.02) : 1
    if (incomeTaxRate > 30) warnings.push('High income tax rates may cause behavioral changes')
    
    newRevenue += incomeTaxBase * higherRateDiff * 0.5 * lafferMultiplier
    newRevenue += incomeTaxBase * standardRateDiff * 0.5
    
    // VAT changes
    const vatDiff = (vatRate - 20) / 100
    newRevenue += INITIAL_STATE.revenue.vat * vatDiff * 0.9
    
    // NI changes
    const niDiff = ((niEmployeeRate - 11) + (niEmployerRate - 12.8)) / 100
    newRevenue += INITIAL_STATE.revenue.nationalInsurance * niDiff * 0.5
    
    // Corporate tax
    if (corporateTaxRate > 0) {
      newRevenue += 500000000 * (corporateTaxRate / 100) * 0.8
      if (corporateTaxRate > 10) warnings.push('Corporate tax may affect business competitiveness')
    }
    
    // NHS Levy (Proper Calculation)
    const nhsLevyResult = calculateNHSLevy(nhsLevyRate, nhsLevyFreeAmount, nhsLevyIndividualCap)
    newRevenue += nhsLevyResult.revenue
    
    // Tourist Accommodation Levy (based on ~500k visitor nights)
    const visitorNights = 500000
    const accommodationLevyRevenue = touristAccommodationLevy * visitorNights
    newRevenue += accommodationLevyRevenue
    
    // Airport Passenger Duty (based on 850k passengers)
    const passengers = 850000
    const airportDutyRevenue = airportPassengerDuty * passengers
    newRevenue += airportDutyRevenue
    
    // Online Gaming Duty (estimate £2bn gross gaming revenue)
    const gamingRevenue = 2000000000
    const gamingDutyRevenue = gamingRevenue * (onlineGamingDuty / 100)
    newRevenue += gamingDutyRevenue
    
    // Calculate expenditure
    let newExpenditure = INITIAL_STATE.expenditure.total
    
    // Department adjustments
    Object.entries(deptAdjustments).forEach(([dept, adjustment]) => {
      if (dept === 'manxCare' || dept === 'publicHealth' || dept === 'mentalHealth') {
        // Sub-department of health
        newExpenditure += (adjustment / 100) * 50000000 // Rough allocation
      } else {
        const deptData = DEPARTMENTS.find(d => 
          d.name.toLowerCase().includes(dept.toLowerCase()) ||
          dept === 'health' && d.name.includes('Health')
        )
        if (deptData) {
          newExpenditure += (adjustment / 100) * deptData.budget
        }
      }
    })
    
    // Public sector pay impact (7000 employees, avg £45k)
    const payBill = 315000000
    const payIncrease = publicSectorPay === 'freeze' ? 0 : 
                       publicSectorPay === '1%' ? 0.01 :
                       publicSectorPay === '2%' ? 0.02 : 0.03
    newExpenditure += payBill * payIncrease
    
    // Efficiency savings
    newExpenditure -= sharedServices * 1000000
    newExpenditure -= digitalTransformation * 1000000
    newExpenditure -= procurementCentralization * 1000000
    
    // Calculate impacts
    const balance = newRevenue - newExpenditure
    
    // Economic growth impact
    let economicGrowth = 0
    if (balance > 0 && newExpenditure > INITIAL_STATE.expenditure.total) economicGrowth = 2
    if (corporateTaxRate === 0 && incomeTaxRate <= 21) economicGrowth += 1
    if (digitalTransformation > 10) economicGrowth += 0.5
    
    // Service quality impact
    let serviceQuality = 0
    const healthChange = deptAdjustments.health || 0
    const educationChange = deptAdjustments.education || 0
    serviceQuality = (healthChange + educationChange) / 2
    
    // Competitiveness impact
    let competitiveness = 0
    if (corporateTaxRate === 0) competitiveness += 2
    if (incomeTaxRate <= 20) competitiveness += 1
    if (incomeTaxRate > 25) competitiveness -= 2
    if (nhsLevyRate > 3) competitiveness -= 1
    
    // Reserve sustainability (years)
    const reserves = 1760000000
    const annualDeficit = balance < 0 ? Math.abs(balance) : 0
    const reserveSustainability = annualDeficit > 0 ? reserves / annualDeficit : 999
    
    setResults({
      revenue: newRevenue,
      expenditure: newExpenditure,
      balance,
      warnings,
      impacts: {
        economicGrowth,
        serviceQuality,
        competitiveness,
        reserveSustainability: Math.min(999, reserveSustainability)
      }
    })
  }, [
    incomeTaxRate, standardTaxRate, corporateTaxRate, vatRate,
    niEmployeeRate, niEmployerRate, nhsLevyRate, nhsLevyFreeAmount,
    nhsLevyIndividualCap, touristAccommodationLevy, airportPassengerDuty,
    onlineGamingDuty, deptAdjustments, publicSectorPay,
    sharedServices, digitalTransformation, procurementCentralization
  ])
  
  // Preset Scenarios
  const applyScenario = (scenario: string) => {
    resetAll()
    switch (scenario) {
      case 'balanced2030':
        setIncomeTaxRate(22)
        setNhsLevyRate(2)
        setEfficiencyTarget(15)
        break
      case 'lowTax':
        setIncomeTaxRate(18)
        setStandardTaxRate(8)
        setVatRate(15)
        setDeptAdjustments(prev => ({ ...prev, health: -10, education: -5 }))
        break
      case 'highService':
        setIncomeTaxRate(25)
        setNhsLevyRate(3)
        setDeptAdjustments(prev => ({ ...prev, health: 15, education: 10 }))
        break
      case 'nhsLevy':
        setNhsLevyRate(2)
        setNhsLevyFreeAmount(14500)
        setNhsLevyIndividualCap(5000)
        setDeptAdjustments(prev => ({ ...prev, health: 10 }))
        break
      case 'growth':
        setCorporateTaxRate(0)
        setDigitalTransformation(20)
        setDeptAdjustments(prev => ({ ...prev, enterprise: 20, infrastructure: 15 }))
        break
      case 'climate':
        setDeptAdjustments(prev => ({ ...prev, environment: 30, infrastructure: 20 }))
        setAirportPassengerDuty(10)
        break
      case 'crisis':
        setIncomeTaxRate(23)
        setNhsLevyRate(1)
        setSharedServices(15)
        setDeptAdjustments(prev => ({ ...prev, health: -5, education: -5 }))
        break
    }
  }
  
  const setEfficiencyTarget = (target: number) => {
    setSharedServices(Math.min(15, target * 0.5))
    setDigitalTransformation(Math.min(20, target * 0.3))
    setProcurementCentralization(Math.min(10, target * 0.2))
  }
  
  const resetAll = () => {
    setIncomeTaxRate(21)
    setStandardTaxRate(10)
    setCorporateTaxRate(0)
    setVatRate(20)
    setNiEmployeeRate(11)
    setNiEmployerRate(12.8)
    setNhsLevyRate(0)
    setNhsLevyFreeAmount(14500)
    setNhsLevyIndividualCap(5000)
    setTouristAccommodationLevy(0)
    setAirportPassengerDuty(0)
    setOnlineGamingDuty(0)
    setDeptAdjustments({
      health: 0,
      manxCare: 0,
      publicHealth: 0,
      mentalHealth: 0,
      education: 0,
      infrastructure: 0,
      homeAffairs: 0,
      treasury: 0,
      cabinetOffice: 0,
      enterprise: 0,
      environment: 0
    })
    setPublicSectorPay('2%')
    setSharedServices(0)
    setDigitalTransformation(0)
    setProcurementCentralization(0)
  }
  
  const toggleDeptExpansion = (dept: string) => {
    const newExpanded = new Set(expandedDepts)
    if (newExpanded.has(dept)) {
      newExpanded.delete(dept)
    } else {
      newExpanded.add(dept)
    }
    setExpandedDepts(newExpanded)
  }
  
  // Get balance status for styling
  const getBalanceStatus = () => {
    if (results.balance > 0) return 'surplus'
    if (results.balance > -50000000) return 'balanced'
    return 'deficit'
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <style jsx global>{`
        /* Modern Workshop Styling */
        .workshop-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 0 0 24px 24px;
          margin-bottom: 30px;
        }
        
        .balance-indicator {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }
        
        .balance-indicator[data-status="deficit"] .amount {
          color: #ef4444;
        }
        
        .balance-indicator[data-status="balanced"] .amount {
          color: #f59e0b;
        }
        
        .balance-indicator[data-status="surplus"] .amount {
          color: #10b981;
        }
        
        .balance-meter {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          margin: 12px 0;
        }
        
        .balance-meter-fill {
          height: 100%;
          transition: all 0.5s ease;
          border-radius: 4px;
        }
        
        input[type="range"] {
          -webkit-appearance: none;
          height: 6px;
          border-radius: 3px;
          background: #e5e7eb;
          outline: none;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #667eea;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 0 8px rgba(102, 126, 234, 0.1);
        }
        
        .impact-bar {
          height: 24px;
          background: #e5e7eb;
          border-radius: 4px;
          position: relative;
          overflow: hidden;
        }
        
        .impact-bar-fill {
          height: 100%;
          transition: all 0.5s ease;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }
        
        .impact-bar-fill.positive {
          background: linear-gradient(90deg, #10b981, #34d399);
        }
        
        .impact-bar-fill.negative {
          background: linear-gradient(90deg, #ef4444, #f87171);
        }
        
        .impact-bar-fill.neutral {
          background: linear-gradient(90deg, #f59e0b, #fbbf24);
        }
        
        .scenario-card {
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .scenario-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
        
        .control-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .sub-controls {
          margin-left: 40px;
          padding-left: 20px;
          border-left: 3px solid #e5e7eb;
          margin-top: 15px;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-in {
          animation: slideIn 0.3s ease;
        }
      `}</style>
      
      {/* New Workshop Header */}
      <div className="workshop-header">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                🧪 Policy Workshop Mode
              </h1>
              <p className="text-white/90 mt-2">
                Test scenarios • Explore impacts • Find balance
              </p>
            </div>
            <Link href="/">
              <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                ← Back to Dashboard
              </Button>
            </Link>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 flex items-start gap-3">
            <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <p className="text-white/90 text-sm">
              This is your policy laboratory. Test bold ideas, explore trade-offs, and see real-time impacts. 
              All changes are hypothetical - designed to help understand the relationships between revenue, 
              spending, and outcomes.
            </p>
          </div>
        </div>
      </div>
      
      {/* Enhanced Balance Display */}
      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-10">
        <div className="balance-indicator animate-slide-in" data-status={getBalanceStatus()}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-500 uppercase tracking-wide">Budget Balance</span>
              <div className="flex items-center gap-3 mt-1">
                <span className="amount text-3xl font-bold">
                  {formatCurrency(results.balance)}
                </span>
                {results.balance > INITIAL_STATE.balance.surplus ? (
                  <span className="flex items-center text-green-600 text-sm">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Improved
                  </span>
                ) : (
                  <span className="flex items-center text-red-600 text-sm">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    Worsened
                  </span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-gray-500">Revenue</p>
                <p className="font-semibold">{formatCurrency(results.revenue)}</p>
                <p className={`text-xs ${results.revenue > INITIAL_STATE.revenue.total ? 'text-green-600' : 'text-red-600'}`}>
                  {results.revenue > INITIAL_STATE.revenue.total ? '+' : ''}
                  {formatCurrency(results.revenue - INITIAL_STATE.revenue.total)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Expenditure</p>
                <p className="font-semibold">{formatCurrency(results.expenditure)}</p>
                <p className={`text-xs ${results.expenditure < INITIAL_STATE.expenditure.total ? 'text-green-600' : 'text-red-600'}`}>
                  {results.expenditure > INITIAL_STATE.expenditure.total ? '+' : ''}
                  {formatCurrency(results.expenditure - INITIAL_STATE.expenditure.total)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Warnings</p>
                <p className="font-semibold">{results.warnings.length}</p>
                {results.warnings.length > 0 && (
                  <p className="text-xs text-yellow-600">View below</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="balance-meter">
            <div 
              className="balance-meter-fill"
              style={{
                width: `${Math.min(100, Math.max(0, (results.balance + 100000000) / 200000000 * 100))}%`,
                background: getBalanceStatus() === 'surplus' ? '#10b981' : 
                           getBalanceStatus() === 'balanced' ? '#f59e0b' : '#ef4444'
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Quick Actions Bar */}
      <div className="max-w-7xl mx-auto px-4 mt-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button onClick={resetAll} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset All
            </Button>
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save Scenario
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          
          <Link href="/advanced-options">
            <Button 
              variant="outline"
              size="sm"
            >
              View Additional Policy Options
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Workshop Mode Disclaimer */}
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-blue-800">
                This tool allows you to test any combination of policies. Items marked 'existing' can be adjusted from current levels, 
                while 'proposed' or 'consultation' items can be explored as future possibilities. All options remain fully selectable for experimentation.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Preset Scenarios */}
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <h3 className="text-lg font-semibold mb-3">Quick Scenarios</h3>
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { id: 'balanced2030', name: 'Balanced 2030', icon: '⚖️' },
            { id: 'lowTax', name: 'Low Tax Island', icon: '💰' },
            { id: 'highService', name: 'High Service', icon: '🏥' },
            { id: 'find50m', name: 'Find £50m', icon: '🎯' },
            { id: 'nhsLevy', name: 'NHS Levy Impact', icon: '🏥' },
            { id: 'growth', name: 'Growth Strategy', icon: '📈' },
            { id: 'climate', name: 'Climate Priority', icon: '🌱' },
            { id: 'crisis', name: 'Crisis Response', icon: '🚨' }
          ].map(scenario => (
            <Card 
              key={scenario.id}
              className="scenario-card p-3 text-center cursor-pointer hover:bg-gray-50"
              onClick={() => applyScenario(scenario.id)}
            >
              <div className="text-2xl mb-1">{scenario.icon}</div>
              <p className="text-xs font-medium">{scenario.name}</p>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Main Controls with Tabs */}
      <div className="max-w-7xl mx-auto px-4">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 border-b">
          {[
            { id: 'tax-policy', label: 'Tax Policy', icon: <DollarSign className="h-4 w-4" /> },
            { id: 'departments', label: 'Departments', icon: <Building className="h-4 w-4" /> },
            { id: 'revenue-measures', label: 'Revenue Measures', icon: <TrendingUp className="h-4 w-4" /> },
            { id: 'efficiency', label: 'Efficiency', icon: <Target className="h-4 w-4" /> },
            { id: 'strategic', label: 'Strategic Policy', icon: <Shield className="h-4 w-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeTab === 'tax-policy' && (
            <>
              {/* Income Tax & NI Section */}
              <div className="control-section">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Income Tax & National Insurance
                </h3>
          
          {/* NHS Levy - Proper Implementation */}
          <div className="control-section">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <label className="font-semibold">Health Levy (Proposed)</label>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  Hypothecated for Health
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <label>Levy Rate</label>
                  <span className="font-medium">{nhsLevyRate}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="5" 
                  step="0.5" 
                  value={nhsLevyRate}
                  onChange={(e) => setNhsLevyRate(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <label>Levy-Free Amount</label>
                  <span className="font-medium">£{nhsLevyFreeAmount.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="25000" 
                  step="500" 
                  value={nhsLevyFreeAmount}
                  onChange={(e) => setNhsLevyFreeAmount(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <label>Individual Cap</label>
                  <span className="font-medium">£{nhsLevyIndividualCap.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="10000" 
                  step="500" 
                  value={nhsLevyIndividualCap}
                  onChange={(e) => setNhsLevyIndividualCap(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              {nhsLevyRate > 0 && (
                <div className="bg-blue-50 rounded-lg p-3 mt-3">
                  <p className="text-sm">
                    <span className="font-medium">Projected Revenue:</span> {' '}
                    {formatCurrency(calculateNHSLevy(nhsLevyRate, nhsLevyFreeAmount, nhsLevyIndividualCap).revenue)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Affecting ~{calculateNHSLevy(nhsLevyRate, nhsLevyFreeAmount, nhsLevyIndividualCap).affectedTaxpayers.toLocaleString()} taxpayers
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Income Tax */}
          <div className="control-section">
            <div className="flex items-center gap-2 mb-3">
              <label className="font-semibold">Income Tax Rates</label>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <label>Higher Rate (21% current)</label>
                  <span className="font-medium">{incomeTaxRate}%</span>
                </div>
                <input 
                  type="range" 
                  min="15" 
                  max="35" 
                  value={incomeTaxRate}
                  onChange={(e) => setIncomeTaxRate(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <label>Standard Rate (10% current)</label>
                  <span className="font-medium">{standardTaxRate}%</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="20" 
                  value={standardTaxRate}
                  onChange={(e) => setStandardTaxRate(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          
          {/* New Revenue Sources */}
          <div className="control-section">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-5 w-5 text-yellow-600" />
              <label className="font-semibold">New Revenue Sources</label>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1">
                      <Hotel className="h-4 w-4" />
                      Tourist Accommodation Levy
                    </label>
                    <StatusBadge status="proposed" />
                    <div className="group relative inline-block">
                      <Info className="h-3 w-3 text-gray-400 cursor-help" />
                      <div className="invisible group-hover:visible absolute z-10 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg bottom-full left-0 mb-1">
                        Proposed tourist levy on accommodation. Similar to schemes in other jurisdictions.
                      </div>
                    </div>
                  </div>
                  <span className="font-medium">£{touristAccommodationLevy} per night</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="5" 
                  step="1" 
                  value={touristAccommodationLevy}
                  onChange={(e) => setTouristAccommodationLevy(parseInt(e.target.value))}
                  className="w-full"
                />
                {touristAccommodationLevy > 0 && (
                  <p className="text-xs text-gray-600 mt-1">
                    Revenue: {formatCurrency(touristAccommodationLevy * 500000)} | ~500k visitor nights
                  </p>
                )}
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1">
                      <Plane className="h-4 w-4" />
                      Increase Airport Passenger Duty
                    </label>
                    <StatusBadge status="existing" />
                    <div className="group relative inline-block">
                      <Info className="h-3 w-3 text-gray-400 cursor-help" />
                      <div className="invisible group-hover:visible absolute z-10 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg bottom-full left-0 mb-1">
                        Airport currently generates £4.6m annually. This represents additional charges.
                      </div>
                    </div>
                  </div>
                  <span className="font-medium">+£{airportPassengerDuty} per departure</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="20" 
                  step="2" 
                  value={airportPassengerDuty}
                  onChange={(e) => setAirportPassengerDuty(parseInt(e.target.value))}
                  className="w-full"
                />
                {airportPassengerDuty > 0 && (
                  <p className="text-xs text-gray-600 mt-1">
                    Revenue: {formatCurrency(airportPassengerDuty * 850000)} | 850k passengers
                  </p>
                )}
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1">
                      <Gamepad2 className="h-4 w-4" />
                      Adjust Gaming Duty
                    </label>
                    <StatusBadge status="existing" />
                    <div className="group relative inline-block">
                      <Info className="h-3 w-3 text-gray-400 cursor-help" />
                      <div className="invisible group-hover:visible absolute z-10 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg bottom-full left-0 mb-1">
                        Adjusts existing gambling duties (currently £4.5m). Applied to gross gaming revenue.
                      </div>
                    </div>
                  </div>
                  <span className="font-medium">{onlineGamingDuty}% GGR</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="5" 
                  step="0.5" 
                  value={onlineGamingDuty}
                  onChange={(e) => setOnlineGamingDuty(parseFloat(e.target.value))}
                  className="w-full"
                />
                {onlineGamingDuty > 0 && (
                  <p className="text-xs text-gray-600 mt-1">
                    Revenue: {formatCurrency(2000000000 * onlineGamingDuty / 100)} | 
                    Competitiveness: {onlineGamingDuty > 3 ? 'Risk' : 'OK'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Expenditure Controls */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Building className="h-5 w-5" />
            Expenditure Controls
          </h2>
          
          {/* Health & Social Care with Sub-controls */}
          <div className="control-section">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-semibold">Health & Social Care</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleDeptExpansion('health')}
                >
                  {expandedDepts.has('health') ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  Details
                </Button>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span>Adjustment</span>
                <span className="font-medium">{deptAdjustments.health}% | Base: £357.2m</span>
              </div>
              <input 
                type="range" 
                min="-20" 
                max="20" 
                step="1" 
                value={deptAdjustments.health}
                onChange={(e) => setDeptAdjustments(prev => ({ ...prev, health: parseInt(e.target.value) }))}
                className="w-full"
              />
              
              {expandedDepts.has('health') && (
                <div className="sub-controls animate-slide-in">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <label>Manx Care</label>
                        <span>{deptAdjustments.manxCare}% | £250m</span>
                      </div>
                      <input 
                        type="range" 
                        min="-10" 
                        max="10" 
                        step="1" 
                        value={deptAdjustments.manxCare}
                        onChange={(e) => setDeptAdjustments(prev => ({ ...prev, manxCare: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <label>Public Health</label>
                        <span>{deptAdjustments.publicHealth}% | £35m</span>
                      </div>
                      <input 
                        type="range" 
                        min="-10" 
                        max="10" 
                        step="1" 
                        value={deptAdjustments.publicHealth}
                        onChange={(e) => setDeptAdjustments(prev => ({ ...prev, publicHealth: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <label>Mental Health</label>
                        <span>{deptAdjustments.mentalHealth}% | £20m</span>
                      </div>
                      <input 
                        type="range" 
                        min="-10" 
                        max="10" 
                        step="1" 
                        value={deptAdjustments.mentalHealth}
                        onChange={(e) => setDeptAdjustments(prev => ({ ...prev, mentalHealth: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Other Departments */}
          <div className="control-section">
            <label className="font-semibold block mb-3">Other Departments</label>
            
            <div className="space-y-3">
              {['education', 'infrastructure', 'homeAffairs', 'treasury'].map(dept => {
                const deptName = dept === 'homeAffairs' ? 'Home Affairs' : 
                                dept.charAt(0).toUpperCase() + dept.slice(1)
                const deptBudget = DEPARTMENTS.find(d => 
                  d.name.toLowerCase().includes(dept.toLowerCase())
                )?.budget || 100000000
                
                return (
                  <div key={dept}>
                    <div className="flex justify-between text-sm mb-1">
                      <label>{deptName}</label>
                      <span>{deptAdjustments[dept]}% | {formatCurrency(deptBudget)}</span>
                    </div>
                    <input 
                      type="range" 
                      min="-20" 
                      max="20" 
                      step="1" 
                      value={deptAdjustments[dept]}
                      onChange={(e) => setDeptAdjustments(prev => ({ ...prev, [dept]: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Efficiency Measures */}
          <div className="control-section">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-5 w-5 text-green-600" />
              <label className="font-semibold">Efficiency Measures</label>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <label>Expand Shared Services</label>
                    <StatusBadge status="existing" />
                    <div className="group relative inline-block">
                      <Info className="h-3 w-3 text-gray-400 cursor-help" />
                      <div className="invisible group-hover:visible absolute z-10 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg bottom-full left-0 mb-1">
                        Government Technology Services (GTS) established 2010. This represents expansion of existing programmes.
                      </div>
                    </div>
                  </div>
                  <span>Saves: £{sharedServices}m</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="15" 
                  step="1" 
                  value={sharedServices}
                  onChange={(e) => setSharedServices(parseInt(e.target.value))}
                  className="w-full"
                />
                {sharedServices > 0 && (
                  <p className="text-xs text-gray-600">Timeline: 2 years</p>
                )}
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <label>Digital Transformation</label>
                  <span>Saves: £{digitalTransformation}m</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="20" 
                  step="2" 
                  value={digitalTransformation}
                  onChange={(e) => setDigitalTransformation(parseInt(e.target.value))}
                  className="w-full"
                />
                {digitalTransformation > 0 && (
                  <p className="text-xs text-gray-600">Investment needed: £5m</p>
                )}
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <label>Procurement Centralization</label>
                  <span>Saves: £{procurementCentralization}m</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  step="1" 
                  value={procurementCentralization}
                  onChange={(e) => setProcurementCentralization(parseInt(e.target.value))}
                  className="w-full"
                />
                {procurementCentralization > 0 && (
                  <p className="text-xs text-gray-600">Quick win opportunity</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Impact Dashboard */}
      <div className="max-w-7xl mx-auto px-4 mt-8 mb-8">
        <div className="control-section">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Policy Impact Analysis
          </h3>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Economic Growth</span>
                <span className={`text-sm font-bold ${results.impacts.economicGrowth > 0 ? 'text-green-600' : results.impacts.economicGrowth < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {results.impacts.economicGrowth > 0 ? '+' : ''}{results.impacts.economicGrowth}%
                </span>
              </div>
              <div className="impact-bar">
                <div 
                  className={`impact-bar-fill ${results.impacts.economicGrowth > 0 ? 'positive' : results.impacts.economicGrowth < 0 ? 'negative' : 'neutral'}`}
                  style={{ 
                    width: `${Math.abs(results.impacts.economicGrowth) * 10}%`,
                    marginLeft: results.impacts.economicGrowth < 0 ? `${50 - Math.abs(results.impacts.economicGrowth) * 10}%` : '50%'
                  }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">Stimulus effect of changes</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Service Quality</span>
                <span className={`text-sm font-bold ${results.impacts.serviceQuality > 0 ? 'text-green-600' : results.impacts.serviceQuality < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {results.impacts.serviceQuality > 0 ? '+' : ''}{results.impacts.serviceQuality}%
                </span>
              </div>
              <div className="impact-bar">
                <div 
                  className={`impact-bar-fill ${results.impacts.serviceQuality > 0 ? 'positive' : results.impacts.serviceQuality < 0 ? 'negative' : 'neutral'}`}
                  style={{ 
                    width: `${Math.abs(results.impacts.serviceQuality) * 5}%`,
                    marginLeft: results.impacts.serviceQuality < 0 ? `${50 - Math.abs(results.impacts.serviceQuality) * 5}%` : '50%'
                  }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">Based on spending levels</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Competitiveness</span>
                <span className={`text-sm font-bold ${results.impacts.competitiveness > 0 ? 'text-green-600' : results.impacts.competitiveness < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {results.impacts.competitiveness > 0 ? '+' : ''}{results.impacts.competitiveness}
                </span>
              </div>
              <div className="impact-bar">
                <div 
                  className={`impact-bar-fill ${results.impacts.competitiveness > 0 ? 'positive' : results.impacts.competitiveness < 0 ? 'negative' : 'neutral'}`}
                  style={{ 
                    width: `${Math.abs(results.impacts.competitiveness) * 15}%`,
                    marginLeft: results.impacts.competitiveness < 0 ? `${50 - Math.abs(results.impacts.competitiveness) * 15}%` : '50%'
                  }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">Tax burden vs competitors</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Reserve Sustainability</span>
                <span className={`text-sm font-bold ${results.impacts.reserveSustainability > 10 ? 'text-green-600' : results.impacts.reserveSustainability > 3 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {results.impacts.reserveSustainability > 100 ? '∞' : `${Math.round(results.impacts.reserveSustainability)} years`}
                </span>
              </div>
              <div className="impact-bar">
                <div 
                  className="impact-bar-fill positive"
                  style={{ 
                    width: `${Math.min(100, results.impacts.reserveSustainability * 10)}%`
                  }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">Years until depletion</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Warnings Section */}
      {results.warnings.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900 mb-2">Policy Warnings</h4>
                <ul className="space-y-1">
                  {results.warnings.map((warning, idx) => (
                    <li key={idx} className="text-sm text-yellow-800">• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Additional Options moved to dedicated page at /advanced-options */}
    </div>
  )
}