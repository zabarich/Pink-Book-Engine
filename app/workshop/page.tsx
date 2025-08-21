'use client'

import { useState, useEffect, useMemo } from 'react'
import { DEPARTMENTS, REVENUE_STREAMS, INITIAL_STATE } from '@/lib/budget-data'
import { BudgetDataService } from '@/lib/services/budget-data-service'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import capitalProgramme from '@/data/source/capital-programme.json'
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
  Briefcase,
  Coins,
  Landmark,
  Settings,
  Ship,
  Receipt,
  HardHat,
  AlertCircle,
  ChevronRight,
  FileDown,
  BookOpen
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'

// Policy status types
type PolicyStatus = 'existing' | 'proposed' | 'consultation' | 'scenario'

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

// Info tooltip component
function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false)
  
  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="text-gray-400 hover:text-gray-600"
      >
        <Info className="h-3 w-3" />
      </button>
      {show && (
        <div className="absolute z-10 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg bottom-full left-0 mb-1">
          {text}
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -bottom-1 left-3" />
        </div>
      )}
    </div>
  )
}

// NHS Levy Calculation Model
const calculateNHSLevy = (rate: number, levyFreeAmount: number, individualCap: number) => {
  // Use resident income tax base only (not companies or non-residents)
  const residentIncomeTaxBase = BudgetDataService.getTaxBases.residentIncomeTax() // From Pink Book
  const averageIncome = 45000
  const taxpayerCount = 35000
  
  const effectiveBase = residentIncomeTaxBase * (1 - levyFreeAmount / averageIncome)
  const uncappedRevenue = effectiveBase * (rate / 100)
  
  const cappedTaxpayers = taxpayerCount * 0.05
  const cappedReduction = cappedTaxpayers * (uncappedRevenue / taxpayerCount - individualCap)
  
  const finalRevenue = Math.max(0, uncappedRevenue - Math.max(0, cappedReduction))
  const affectedTaxpayers = Math.round(taxpayerCount * (1 - levyFreeAmount / averageIncome))
  
  return {
    revenue: finalRevenue,
    affectedTaxpayers
  }
}

export default function IntegratedWorkshopPage() {
  // Main tab state
  const [mainTab, setMainTab] = useState('workshop')
  
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
  const [retailerThreshold, setRetailerThreshold] = useState(BudgetDataService.getThresholdsAndCaps.largeRetailerThreshold()) // Threshold for large retailer rate
  const [pillarTwoEnabled, setPillarTwoEnabled] = useState(true) // OECD Pillar Two (included by default)
  
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
  
  // NHS Levy Controls
  const [nhsLevyRate, setNhsLevyRate] = useState(0)
  const [nhsLevyFreeAmount, setNhsLevyFreeAmount] = useState(14500)
  const [nhsLevyIndividualCap, setNhsLevyIndividualCap] = useState(5000)
  
  // New Revenue Sources
  const [touristAccommodationLevy, setTouristAccommodationLevy] = useState(0)
  const [airportPassengerDuty, setAirportPassengerDuty] = useState(0)
  const [onlineGamingDuty, setOnlineGamingDuty] = useState(0)
  
  // Department Adjustments - ALL Departments
  const [deptAdjustments, setDeptAdjustments] = useState<Record<string, number>>({
    'Health & Social Care': 0,
    'Manx Care': 0,
    'Education, Sport & Culture': 0,
    'Infrastructure': 0,
    'Home Affairs': 0,
    'Treasury': 0,
    'Cabinet Office': 0,
    'Enterprise': 0,
    'Environment, Food & Agriculture': 0,
    'Executive Government': 0,
    'Statutory Boards': 0,
    'Legislature': 0
  })
  
  // Efficiency Measures
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
  
  // Advanced Policy Options (from advanced-options page)
  const [advancedPolicies, setAdvancedPolicies] = useState({
    // Infrastructure Revenue
    airportCharge: 0,
    portDuesIncrease: 0,
    internalRentCharging: false,
    freeTransport: false,
    heritageRailDays: 7,
    vehicleDutyAdjustment: 0, // -50% to +50% adjustment
    
    // Transfer Reforms
    winterBonusMeans: 'universal',
    childBenefitTaper: 0,
    housingBenefitCap: 0,
    
    // Department Operations
    cabinetEfficiency: 0,
    enterpriseGrants: 0,
    
    // Fees & Charges
    generalFeesUplift: 0,
    targetedRecovery: [] as string[],
    
    // Capital Management
    capitalGating: false,
    deferLowBCR: 0,
  })
  
  // Calculate advanced policies impact
  const advancedPoliciesImpact = useMemo(() => {
    let total = 0;
    
    // Infrastructure
    total += advancedPolicies.airportCharge * BudgetDataService.getPolicyParameters.airportPassengers();
    total += BudgetDataService.getPolicyParameters.portDuesBase() * (advancedPolicies.portDuesIncrease / 100);
    total += advancedPolicies.internalRentCharging ? 3000000 : 0;
    // Free transport cost - additional subsidy needed
    total -= advancedPolicies.freeTransport ? 3500000 : 0; // Policy estimate
    
    // Heritage Railway savings from reduced days
    const heritageRailBudget = capitalProgramme.projects_2025_26?.discrete_schemes?.by_department?.DOI?.projects?.find(
      (p: any) => p.name === 'Heritage Rail Budget'
    )?.amount || 2250000;
    total += advancedPolicies.heritageRailDays === 5 ? Math.round(heritageRailBudget * 2 / 7) : 0;
    
    // Transfers
    total += advancedPolicies.winterBonusMeans === 'benefits' ? 3600000 : 
             advancedPolicies.winterBonusMeans === 'age75' ? (BudgetDataService.getTransferPayments.winterBonus() * 0.28) : 0;
    total += advancedPolicies.childBenefitTaper;
    total += advancedPolicies.housingBenefitCap;
    
    // Departments
    total += advancedPolicies.cabinetEfficiency;
    total += advancedPolicies.enterpriseGrants;
    
    // Fees
    total += BudgetDataService.getPolicyParameters.feesAndChargesBase() * (advancedPolicies.generalFeesUplift / 100);
    total += advancedPolicies.targetedRecovery.reduce((sum, item) => {
      // These are estimated fee increases based on policy choices
      const values: { [key: string]: number } = {
        'vehicle': 500000, // Estimated increase from vehicle testing fees
        'planning': 800000, // Estimated increase from planning application fees
        'court': 400000,
        'environmental': 300000
      };
      return sum + (values[item] || 0);
    }, 0);
    
    // Capital
    total += advancedPolicies.capitalGating ? 22700000 : 0;
    total += advancedPolicies.deferLowBCR;
    
    return total;
  }, [advancedPolicies]);
  
  // Calculations
  const [results, setResults] = useState({
    revenue: INITIAL_STATE.revenue.total,
    expenditure: INITIAL_STATE.expenditure.total,
    balance: INITIAL_STATE.balance.surplus,
    warnings: [] as string[]
  })
  
  // Calculate revenue and expenditure impacts
  useEffect(() => {
    // Import debug calculation functions for full traceability
    const { calculateBaselineBudget, calculatePillar2Impact, calculateWinterBonusSavings, 
            calculateNIRevenueChange, calculateVehicleDutyChange, calculatePensionAgeSavings,
            exportDebugLog } = require('@/lib/calculations/debug-calculations')
    
    // Get baseline with Pillar 2 included by default
    const baseline = calculateBaselineBudget(true)
    
    // Export debug log to console for transparency
    if (typeof window !== 'undefined' && window.location.search.includes('debug=true')) {
      exportDebugLog(baseline)
    }
    
    let newRevenue = baseline.baselineRevenue.total
    let newExpenditure = baseline.baselineExpenditure.total
    let warnings: string[] = []
    
    // ACCURATE Income tax calculations - NO ARBITRARY MULTIPLIERS
    const standardRateChange = standardTaxRate - 10 // Change from 10% base
    const higherRateChange = incomeTaxRate - 21 // Change from 21% base
    
    // Import accurate calculation functions
    const { calculateIncomeTaxChange, calculateNIChange, calculateCorporateTaxChange, calculateVATChange } = 
      require('@/lib/calculations/tax-calculations')
    
    // Apply accurate income tax calculation
    const incomeTaxImpact = calculateIncomeTaxChange(standardRateChange, higherRateChange)
    newRevenue += incomeTaxImpact
    
    // Apply behavioral response for high rates
    if (incomeTaxRate > 30) {
      warnings.push('High income tax rates may cause behavioral changes')
    }
    
    // ACCURATE Corporate tax calculation
    const corporateTaxImpact = calculateCorporateTaxChange(bankingTaxRate, retailerTaxRate)
    newRevenue += corporateTaxImpact
    
    if (bankingTaxRate > 15) warnings.push('High banking tax may affect financial sector')
    if (retailerTaxRate > 25) warnings.push('High retail tax may affect large retailers')
    
    // ACCURATE VAT calculation with proper FERSA adjustment
    const vatImpact = calculateVATChange(vatRate)
    newRevenue += vatImpact
    
    // ACCURATE NI calculation with proper employer/employee split
    const niEmployeeChange = niEmployeeRate - 11
    const niEmployerChange = niEmployerRate - 12.8
    const niImpact = calculateNIChange(niEmployeeChange, niEmployerChange)
    newRevenue += niImpact
    
    // NHS Levy
    const nhsLevyResult = calculateNHSLevy(nhsLevyRate, nhsLevyFreeAmount, nhsLevyIndividualCap)
    newRevenue += nhsLevyResult.revenue
    
    // Tourist Accommodation Levy
    // IoM Tourism: ~800k visitors × 2.5 average nights = 2M visitor nights
    const visitorNights = BudgetDataService.getPolicyParameters.touristNights()
    newRevenue += touristAccommodationLevy * visitorNights
    
    // Airport Passenger Duty
    const passengers = BudgetDataService.getPolicyParameters.airportPassengers()
    newRevenue += airportPassengerDuty * passengers
    
    // Gaming Duty - based on current £4.5m gambling duty revenue
    // Estimated taxable gaming base £225m (at current 2% effective rate)
    const gamingTaxableBase = BudgetDataService.getPolicyParameters.gamingTaxableBase()
    newRevenue += gamingTaxableBase * (onlineGamingDuty / 100)
    
    // Add advanced policies impact
    // For revenue increases (positive impact)
    if (advancedPoliciesImpact > 0) {
      newRevenue += advancedPoliciesImpact
    }
    // For cost savings (also positive impact, but reduces expenditure)
    // This includes winter bonus savings, heritage railway savings, etc.
    if (advancedPolicies.winterBonusMeans !== 'universal') {
      const winterSavings = calculateWinterBonusSavings(advancedPolicies.winterBonusMeans)
      newExpenditure -= winterSavings.calculatedValue
    }
    
    // Expenditure adjustments (already initialized from baseline above)
    
    // Department adjustments
    DEPARTMENTS.forEach(dept => {
      const adjustment = deptAdjustments[dept.name] || 0
      newExpenditure += dept.budget * (adjustment / 100)
      if (adjustment < -15) {
        warnings.push(`${dept.name} cut may affect service quality`)
      }
    })
    
    // Public sector pay
    // Pink Book 2025-26: Total employee costs £507m (page 89)
    const payBill = BudgetDataService.getExpenditure.employeeCosts()
    const payIncrease = publicSectorPay === 'freeze' ? 0 : 
                       publicSectorPay === '1%' ? 0.01 :
                       publicSectorPay === '2%' ? 0.02 : 0.03
    newExpenditure += payBill * payIncrease
    
    // Efficiency savings
    newExpenditure -= sharedServices * 1000000
    newExpenditure -= digitalTransformation * 1000000
    newExpenditure -= procurementCentralization * 1000000
    
    // Capital budget adjustment
    newExpenditure += (totalCapitalBudget - 87.4) * 1000000
    
    // ACCURATE Pension policy impacts - NO ROUGH ESTIMATES
    const { calculatePensionChanges, calculateBenefitChanges, calculatePayBillChange } = 
      require('@/lib/calculations/benefits-calculations')
    
    // Calculate pension changes accurately
    const pensionOptions = {
      modifyTripleLock: !tripleLockEnabled,
      newTripleLockRate: tripleLockEnabled ? 4.1 : 2.5, // Reduce to 2.5% if disabled
      retirementAgeIncrease: statePensionAge > 66 ? statePensionAge - 66 : 0
    }
    const pensionImpact = calculatePensionChanges(pensionOptions)
    newExpenditure += pensionImpact // Note: negative values reduce expenditure
    
    // Handle Pillar 2 Tax toggle (if explicitly disabled)
    if (!pillarTwoEnabled) {
      const pillar2Impact = calculatePillar2Impact(false)
      newRevenue -= 10000000 // Remove Pillar 2 from baseline
    }
    
    // Add Vehicle Duty adjustment if changed
    if (advancedPolicies.vehicleDutyAdjustment && advancedPolicies.vehicleDutyAdjustment !== 0) {
      const vehicleDutyChange = calculateVehicleDutyChange(advancedPolicies.vehicleDutyAdjustment)
      newRevenue += vehicleDutyChange.calculatedValue
    }
    
    // State Pension Age savings
    if (statePensionAge > 66) {
      const pensionSavings = calculatePensionAgeSavings(statePensionAge)
      newExpenditure -= pensionSavings.calculatedValue
    }
    
    setResults({
      revenue: newRevenue,
      expenditure: newExpenditure,
      balance: newRevenue - newExpenditure,
      warnings
    })
  }, [
    incomeTaxRate, standardTaxRate, corporateTaxRate, vatRate,
    niEmployeeRate, niEmployerRate, nhsLevyRate, nhsLevyFreeAmount,
    nhsLevyIndividualCap, touristAccommodationLevy, airportPassengerDuty,
    onlineGamingDuty, deptAdjustments, publicSectorPay,
    sharedServices, digitalTransformation, procurementCentralization,
    personalAllowance, higherRateThreshold, personalTaxCap,
    bankingTaxRate, retailerTaxRate, fersaRate, totalCapitalBudget,
    tripleLockEnabled, statePensionAge, advancedPoliciesImpact
  ])
  
  // Save scenario handler
  const handleSaveScenario = () => {
    const { saveScenario } = require('@/lib/calculations/scenario-management')
    
    const scenarioName = prompt('Enter scenario name:')
    if (!scenarioName) return
    
    const scenarioData = {
      name: scenarioName,
      created_by: 'Minister', // In production, get from user context
      revenue_changes: {
        income_tax: {
          standard_rate_change: standardTaxRate - 10,
          higher_rate_change: incomeTaxRate - 21
        },
        national_insurance: {
          employee_rate_change: niEmployeeRate - 11,
          employer_rate_change: niEmployerRate - 12.8
        },
        corporate_tax: {
          banking_rate: bankingTaxRate,
          retail_rate: retailerTaxRate
        },
        vat: {
          rate_change: vatRate - 20
        },
        customs_excise: {
          alcohol_duty_change: 0,
          tobacco_duty_change: 0,
          fuel_duty_change: 0
        },
        new_revenues: {
          tourist_levy: touristAccommodationLevy,
          airport_duty: airportPassengerDuty,
          gaming_duty: onlineGamingDuty
        }
      },
      expenditure_changes: {
        department_adjustments: deptAdjustments,
        benefit_changes: {
          winter_bonus_means_test: advancedPolicies.winterBonusMeans,
          child_benefit_taper: advancedPolicies.childBenefitTaper,
          housing_benefit_cap: advancedPolicies.housingBenefitCap
        },
        efficiency_measures: {
          shared_services: sharedServices,
          digital_transformation: digitalTransformation,
          procurement_centralization: procurementCentralization
        },
        pay_policy: publicSectorPay,
        capital_budget: totalCapitalBudget
      },
      calculated_impact: {
        total_revenue_change: results.revenue - INITIAL_STATE.revenue.total,
        total_expenditure_change: results.expenditure - INITIAL_STATE.expenditure.total,
        net_budget_impact: results.balance - INITIAL_STATE.balance.surplus,
        reserve_impact: results.balance < 0 ? Math.abs(results.balance) : 0,
        sustainability_years: results.balance < 0 ? 
          Math.floor(INITIAL_STATE.balance.reserves / Math.abs(results.balance)) : 999
      },
      policy_options: []
    }
    
    try {
      const scenarioId = saveScenario(scenarioData)
      alert(`Scenario saved successfully! ID: ${scenarioId}`)
    } catch (error) {
      alert('Failed to save scenario')
    }
  }
  
  // Export scenario handler
  const handleExportScenario = () => {
    const { generatePDFReportContent } = require('@/lib/calculations/scenario-management')
    
    // Create current scenario data for export
    const currentScenario = {
      id: 'current',
      name: 'Current Scenario',
      created_by: 'Minister',
      created_at: new Date().toISOString(),
      revenue_changes: {
        income_tax: {
          standard_rate_change: standardTaxRate - 10,
          higher_rate_change: incomeTaxRate - 21
        },
        national_insurance: {
          employee_rate_change: niEmployeeRate - 11,
          employer_rate_change: niEmployerRate - 12.8
        },
        corporate_tax: {
          banking_rate: bankingTaxRate,
          retail_rate: retailerTaxRate
        },
        vat: {
          rate_change: vatRate - 20
        },
        customs_excise: {
          alcohol_duty_change: 0,
          tobacco_duty_change: 0,
          fuel_duty_change: 0
        },
        new_revenues: {
          tourist_levy: touristAccommodationLevy,
          airport_duty: airportPassengerDuty,
          gaming_duty: onlineGamingDuty
        }
      },
      expenditure_changes: {
        department_adjustments: deptAdjustments,
        benefit_changes: {},
        efficiency_measures: {
          shared_services: sharedServices,
          digital_transformation: digitalTransformation,
          procurement_centralization: procurementCentralization
        },
        pay_policy: publicSectorPay,
        capital_budget: totalCapitalBudget
      },
      calculated_impact: {
        total_revenue_change: results.revenue - INITIAL_STATE.revenue.total,
        total_expenditure_change: results.expenditure - INITIAL_STATE.expenditure.total,
        net_budget_impact: results.balance - INITIAL_STATE.balance.surplus,
        reserve_impact: results.balance < 0 ? Math.abs(results.balance) : 0,
        sustainability_years: results.balance < 0 ? 
          Math.floor(INITIAL_STATE.balance.reserves / Math.abs(results.balance)) : 999
      },
      policy_options: []
    }
    
    const reportContent = generatePDFReportContent(currentScenario)
    
    // Create download link
    const blob = new Blob([reportContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `budget-scenario-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  const resetAll = () => {
    setIncomeTaxRate(21)
    setStandardTaxRate(10)
    setCorporateTaxRate(0)
    setVatRate(20)
    setNiEmployeeRate(11)
    setNiEmployerRate(12.8)
    setNhsLevyRate(0)
    setTouristAccommodationLevy(0)
    setAirportPassengerDuty(0)
    setOnlineGamingDuty(0)
    setDeptAdjustments({
      'Health & Social Care': 0,
      'Manx Care': 0,
      'Education, Sport & Culture': 0,
      'Infrastructure': 0,
      'Home Affairs': 0,
      'Treasury': 0,
      'Cabinet Office': 0,
      'Enterprise': 0,
      'Environment, Food & Agriculture': 0,
      'Executive Government': 0,
      'Statutory Boards': 0,
      'Legislature': 0
    })
    setPublicSectorPay('2%')
    setSharedServices(0)
    setDigitalTransformation(0)
    setProcurementCentralization(0)
    setPersonalAllowance(14500)
    setHigherRateThreshold(21000)
    setPersonalTaxCap(220000)
    setJointTaxCap(440000)
    setBankingTaxRate(10)
    setRetailerTaxRate(20)
    setTargetReserveLevel(2000)
    setAnnualDrawdownLimit(100)
    setStatePensionAge(66)
    setTripleLockEnabled(true)
    setTotalCapitalBudget(87.4)
    setAdvancedPolicies({
      airportCharge: 0,
      portDuesIncrease: 0,
      internalRentCharging: false,
      freeTransport: false,
      heritageRailDays: 7,
      vehicleDutyAdjustment: 0,
      winterBonusMeans: 'universal',
      childBenefitTaper: 0,
      housingBenefitCap: 0,
      cabinetEfficiency: 0,
      enterpriseGrants: 0,
      generalFeesUplift: 0,
      targetedRecovery: [],
      capitalGating: false,
      deferLowBCR: 0,
    })
  }
  
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-gray-500 hover:text-gray-700 mr-4">
                ← Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Policy Workshop Mode
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={resetAll}
                className="flex items-center px-3 py-1.5 text-sm bg-gray-100 rounded hover:bg-gray-200"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset All
              </button>
              <button 
                onClick={handleSaveScenario}
                className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                <Save className="h-4 w-4 mr-1" />
                Save Scenario
              </button>
              <button 
                onClick={handleExportScenario}
                className="flex items-center px-3 py-1.5 text-sm bg-gray-100 rounded hover:bg-gray-200">
                <FileDown className="h-4 w-4 mr-1" />
                Export
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Fixed Impact Summary Bar - Always Visible */}
      <div className="bg-white border-b sticky top-16 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div>
                <span className="text-sm text-gray-500">Revenue</span>
                <p className="font-semibold text-lg">{formatCurrency(results.revenue)}</p>
                <p className={`text-xs ${results.revenue > INITIAL_STATE.revenue.total ? 'text-green-600' : 'text-red-600'}`}>
                  {results.revenue > INITIAL_STATE.revenue.total ? '+' : ''}
                  {formatCurrency(results.revenue - INITIAL_STATE.revenue.total)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Expenditure</span>
                <p className="font-semibold text-lg">{formatCurrency(results.expenditure)}</p>
                <p className={`text-xs ${results.expenditure < INITIAL_STATE.expenditure.total ? 'text-green-600' : 'text-red-600'}`}>
                  {results.expenditure > INITIAL_STATE.expenditure.total ? '+' : ''}
                  {formatCurrency(results.expenditure - INITIAL_STATE.expenditure.total)}
                </p>
              </div>
              <div className="px-6 py-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-500">Budget Balance</span>
                <p className={`font-bold text-xl ${results.balance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(results.balance)}
                </p>
                <p className="text-xs text-gray-500">
                  {results.balance > INITIAL_STATE.balance.surplus ? 'Improved' : 'Worsened'} from baseline
                </p>
              </div>
            </div>
            
            {results.warnings.length > 0 && (
              <div className="flex items-center text-yellow-600">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">{results.warnings.length} warnings</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Information Banner */}
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-blue-800">
            This comprehensive interface provides control over all budget parameters. 
            Items marked 'existing' can be adjusted from current levels, while 'proposed' or 'consultation' items can be explored as future possibilities.
            All changes update the budget balance in real-time.
          </AlertDescription>
        </Alert>
        
        {/* Main Tab Navigation - Prominent */}
        <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-2 mb-6">
            <TabsList className="grid w-full grid-cols-2 max-w-2xl mx-auto h-14 bg-gray-100">
              <TabsTrigger value="workshop" className="flex items-center gap-2 text-base font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Sliders className="h-5 w-5" />
                Basic Controls
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2 text-base font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Settings className="h-5 w-5" />
                Advanced Options
              </TabsTrigger>
            </TabsList>
            <div className="text-center mt-2">
              <p className="text-sm text-gray-600">
                {mainTab === 'workshop' 
                  ? 'Essential budget controls for quick adjustments' 
                  : 'Detailed policy options for comprehensive planning'}
              </p>
            </div>
          </div>
          
          {/* Basic Controls Tab Content */}
          <TabsContent value="workshop" className="space-y-6">
            {/* Mode Indicator */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
              <div className="bg-blue-500 text-white rounded-full p-2">
                <Sliders className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-blue-900">Basic Control Mode</h2>
                <p className="text-sm text-blue-700">Core revenue and expenditure adjustments with immediate impact</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Revenue Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Tax Rates */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700">Tax Rates</h4>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Label>Income Tax - Higher Rate</Label>
                          <StatusBadge status="existing" />
                        </div>
                        <span className="text-sm font-medium">{incomeTaxRate}%</span>
                      </div>
                      <Slider
                        value={[incomeTaxRate]}
                        onValueChange={([value]) => setIncomeTaxRate(value)}
                        min={15}
                        max={35}
                        step={1}
                      />
                      <p className="text-xs text-gray-500 mt-1">Current: 21%</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Label>Income Tax - Standard Rate</Label>
                          <StatusBadge status="existing" />
                        </div>
                        <span className="text-sm font-medium">{standardTaxRate}%</span>
                      </div>
                      <Slider
                        value={[standardTaxRate]}
                        onValueChange={([value]) => setStandardTaxRate(value)}
                        min={5}
                        max={20}
                        step={1}
                      />
                      <p className="text-xs text-gray-500 mt-1">Current: 10%</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Label>VAT Rate</Label>
                          <StatusBadge status="existing" />
                        </div>
                        <span className="text-sm font-medium">{vatRate}%</span>
                      </div>
                      <Slider
                        value={[vatRate]}
                        onValueChange={([value]) => setVatRate(value)}
                        min={15}
                        max={25}
                        step={0.5}
                      />
                      <p className="text-xs text-gray-500 mt-1">Current: 20% (UK aligned)</p>
                    </div>
                  </div>
                  
                  {/* New Revenue Sources */}
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700">New Revenue Sources</h4>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Label>NHS Levy</Label>
                          <StatusBadge status="consultation" />
                          <InfoTooltip text="Currently under public consultation. Would require new legislation." />
                        </div>
                        <span className="text-sm font-medium">{nhsLevyRate}%</span>
                      </div>
                      <Slider
                        value={[nhsLevyRate]}
                        onValueChange={([value]) => setNhsLevyRate(value)}
                        min={0}
                        max={5}
                        step={0.5}
                      />
                      {nhsLevyRate > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          Revenue: {formatCurrency(calculateNHSLevy(nhsLevyRate, nhsLevyFreeAmount, nhsLevyIndividualCap).revenue)}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Label>Tourist Accommodation Levy</Label>
                          <StatusBadge status="proposed" />
                        </div>
                        <span className="text-sm font-medium">£{touristAccommodationLevy}/night</span>
                      </div>
                      <Slider
                        value={[touristAccommodationLevy]}
                        onValueChange={([value]) => setTouristAccommodationLevy(value)}
                        min={0}
                        max={10}
                        step={1}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Revenue: {formatCurrency(touristAccommodationLevy * BudgetDataService.getPolicyParameters.touristNights())}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Label>Airport Passenger Duty Increase</Label>
                          <StatusBadge status="existing" />
                        </div>
                        <span className="text-sm font-medium">+£{airportPassengerDuty}</span>
                      </div>
                      <Slider
                        value={[airportPassengerDuty]}
                        onValueChange={([value]) => setAirportPassengerDuty(value)}
                        min={0}
                        max={20}
                        step={2}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Current: £4.6m | Additional: {formatCurrency(airportPassengerDuty * BudgetDataService.getPolicyParameters.airportPassengers())}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Expenditure Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Expenditure Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Department Budgets */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700">Department Adjustments</h4>
                    
                    <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
                      {DEPARTMENTS.map(dept => (
                        <div key={dept.name}>
                          <div className="flex justify-between items-center mb-2">
                            <Label className="text-sm">{dept.name}</Label>
                            <span className="text-sm font-medium">
                              {deptAdjustments[dept.name] > 0 ? '+' : ''}{deptAdjustments[dept.name]}%
                            </span>
                          </div>
                          <Slider
                            value={[deptAdjustments[dept.name] || 0]}
                            onValueChange={([value]) => 
                              setDeptAdjustments(prev => ({ ...prev, [dept.name]: value }))
                            }
                            min={-20}
                            max={20}
                            step={1}
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>
                              Budget: {formatCurrency(dept.budget)}
                            </span>
                            <span>Impact: {formatCurrency(dept.budget * (deptAdjustments[dept.name] / 100))}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Efficiency Measures */}
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700">Efficiency Measures</h4>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Label>Expand Shared Services</Label>
                          <StatusBadge status="existing" />
                          <InfoTooltip text="GTS established 2010. This represents expansion." />
                        </div>
                        <span className="text-sm font-medium">£{sharedServices}m</span>
                      </div>
                      <Slider
                        value={[sharedServices]}
                        onValueChange={([value]) => setSharedServices(value)}
                        min={0}
                        max={15}
                        step={1}
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label>Digital Transformation</Label>
                        <span className="text-sm font-medium">£{digitalTransformation}m</span>
                      </div>
                      <Slider
                        value={[digitalTransformation]}
                        onValueChange={([value]) => setDigitalTransformation(value)}
                        min={0}
                        max={20}
                        step={2}
                      />
                    </div>
                    
                    <div>
                      <Label className="mb-3 block">Public Sector Pay</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {['freeze', '1%', '2%', '3%'].map(option => (
                          <button
                            key={option}
                            onClick={() => setPublicSectorPay(option as any)}
                            className={`px-3 py-2 text-sm border rounded ${
                              publicSectorPay === option 
                                ? 'bg-blue-50 border-blue-500 text-blue-700' 
                                : 'bg-white hover:bg-gray-50'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Impact: {publicSectorPay === 'freeze' ? 'Save £10m' : 
                                publicSectorPay === '1%' ? 'Save £5m' :
                                publicSectorPay === '2%' ? 'Baseline' : 'Cost £5m'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Advanced Options Tab Content */}
          <TabsContent value="advanced" className="space-y-6">
            {/* Mode Indicator */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center gap-3">
              <div className="bg-purple-500 text-white rounded-full p-2">
                <Settings className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-purple-900">Advanced Options Mode</h2>
                <p className="text-sm text-purple-700">Detailed policy controls for comprehensive budget planning</p>
              </div>
            </div>
            
            <Tabs defaultValue="infrastructure" className="space-y-4">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
                <TabsTrigger value="transfers">Transfers</TabsTrigger>
                <TabsTrigger value="departments">Departments</TabsTrigger>
                <TabsTrigger value="fees">Fees</TabsTrigger>
                <TabsTrigger value="capital">Capital</TabsTrigger>
                <TabsTrigger value="tax-detail">Tax Detail</TabsTrigger>
                <TabsTrigger value="strategic">Strategic</TabsTrigger>
              </TabsList>
              
              {/* Infrastructure Sub-tab */}
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <Label>Airport Passenger Charge</Label>
                            <Badge variant="outline">£{advancedPolicies.airportCharge}/passenger</Badge>
                          </div>
                          <Slider
                            value={[advancedPolicies.airportCharge]}
                            onValueChange={([value]) => 
                              setAdvancedPolicies(prev => ({ ...prev, airportCharge: value }))
                            }
                            min={0}
                            max={10}
                            step={1}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Revenue: {formatCurrency(advancedPolicies.airportCharge * 800000)}
                          </p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <Label>Port Dues Increase</Label>
                            <Badge variant="outline">{advancedPolicies.portDuesIncrease}%</Badge>
                          </div>
                          <Slider
                            value={[advancedPolicies.portDuesIncrease]}
                            onValueChange={([value]) => 
                              setAdvancedPolicies(prev => ({ ...prev, portDuesIncrease: value }))
                            }
                            min={0}
                            max={30}
                            step={5}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Revenue: {formatCurrency(BudgetDataService.getPolicyParameters.portDuesBase() * (advancedPolicies.portDuesIncrease / 100))}
                          </p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <Label>Vehicle Duty Adjustment</Label>
                            <Badge variant="outline">{advancedPolicies.vehicleDutyAdjustment > 0 ? '+' : ''}{advancedPolicies.vehicleDutyAdjustment}%</Badge>
                          </div>
                          <Slider
                            value={[advancedPolicies.vehicleDutyAdjustment]}
                            onValueChange={([value]) => 
                              setAdvancedPolicies(prev => ({ ...prev, vehicleDutyAdjustment: value }))
                            }
                            min={-50}
                            max={50}
                            step={5}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Base: £16.04m | Change: {formatCurrency(16039000 * (advancedPolicies.vehicleDutyAdjustment / 100))}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <Label>Internal Rent Charging</Label>
                            <p className="text-xs text-gray-600 mt-1">
                              Charge departments market rent for government buildings
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">
                              {advancedPolicies.internalRentCharging ? '+£3m' : '£0'}
                            </span>
                            <Switch
                              checked={advancedPolicies.internalRentCharging}
                              onCheckedChange={(checked) => 
                                setAdvancedPolicies(prev => ({ ...prev, internalRentCharging: checked }))
                              }
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <Label>Free Public Transport</Label>
                            <p className="text-xs text-gray-600 mt-1">
                              Make all bus services free (additional cost)
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">
                              {advancedPolicies.freeTransport ? '-£3.5m' : '£0'}
                            </span>
                            <Switch
                              checked={advancedPolicies.freeTransport}
                              onCheckedChange={(checked) => 
                                setAdvancedPolicies(prev => ({ ...prev, freeTransport: checked }))
                              }
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label className="mb-2 block">Heritage Railway Operating Days</Label>
                          <Select
                            value={advancedPolicies.heritageRailDays.toString()}
                            onValueChange={(value) => 
                              setAdvancedPolicies(prev => ({ ...prev, heritageRailDays: parseInt(value) as 5 | 7 }))
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
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Transfers Sub-tab */}
              <TabsContent value="transfers" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Transfer Payment Reforms
                    </CardTitle>
                    <CardDescription>
                      £4.6-8.1m potential from benefit targeting (Currently £441m total)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="mb-2 block">Winter Bonus Means Testing</Label>
                          <Select
                            value={advancedPolicies.winterBonusMeans}
                            onValueChange={(value) => 
                              setAdvancedPolicies(prev => ({ ...prev, winterBonusMeans: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="universal">Universal (current) - £0 saving</SelectItem>
                              <SelectItem value="benefits">Benefits recipients only - £3.6m saving</SelectItem>
                              <SelectItem value="age75">Age 75+ only - £2.0m saving</SelectItem>
                            </SelectContent>
                          </Select>
                          <Alert className="border-amber-200 bg-amber-50 mt-2">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-amber-700 text-sm">
                              Political sensitivity: High - affects vulnerable populations
                            </AlertDescription>
                          </Alert>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <Label>Child Benefit Income Taper</Label>
                            <Badge variant="outline">
                              £{(advancedPolicies.childBenefitTaper / 1000000).toFixed(1)}m
                            </Badge>
                          </div>
                          <Slider
                            value={[advancedPolicies.childBenefitTaper]}
                            onValueChange={([value]) => 
                              setAdvancedPolicies(prev => ({ ...prev, childBenefitTaper: value }))
                            }
                            max={3000000}
                            step={100000}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Taper for households &gt;£50k | ~2,000 families affected
                          </p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <Label>Housing Benefit Cap Tightening</Label>
                            <Badge variant="outline">
                              £{(advancedPolicies.housingBenefitCap / 1000000).toFixed(1)}m
                            </Badge>
                          </div>
                          <Slider
                            value={[advancedPolicies.housingBenefitCap]}
                            onValueChange={([value]) => 
                              setAdvancedPolicies(prev => ({ ...prev, housingBenefitCap: value }))
                            }
                            max={1500000}
                            step={100000}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Local reference rent caps on outliers
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Departments Sub-tab */}
              <TabsContent value="departments" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      All Government Departments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {DEPARTMENTS.map(dept => (
                        <div key={dept.name} className="space-y-3">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <div>
                                <Label>{dept.name}</Label>
                                <p className="text-xs text-gray-500">
                                  Budget: {formatCurrency(dept.budget)}
                                </p>
                              </div>
                              <span className="text-sm font-medium">
                                {deptAdjustments[dept.name] > 0 ? '+' : ''}{deptAdjustments[dept.name]}%
                              </span>
                            </div>
                            <Slider
                              value={[deptAdjustments[dept.name] || 0]}
                              onValueChange={([value]) => 
                                setDeptAdjustments(prev => ({ ...prev, [dept.name]: value }))
                              }
                              min={-20}
                              max={20}
                              step={1}
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>Min viable: {formatCurrency(dept.minViable)}</span>
                              <span>
                                Impact: {formatCurrency(dept.budget * (deptAdjustments[dept.name] || 0) / 100)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Fees Sub-tab */}
              <TabsContent value="fees" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="h-5 w-5" />
                      Fees & Charges
                    </CardTitle>
                    <CardDescription>
                      £9.5-11.5m potential from fee adjustments
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label>General Fees & Charges Uplift</Label>
                        <Badge variant="outline">
                          £{(BudgetDataService.getPolicyParameters.feesAndChargesBase() * advancedPolicies.generalFeesUplift / 100 / 1000000).toFixed(1)}m
                        </Badge>
                      </div>
                      <Slider
                        value={[advancedPolicies.generalFeesUplift]}
                        onValueChange={([value]) => 
                          setAdvancedPolicies(prev => ({ ...prev, generalFeesUplift: value }))
                        }
                        max={10}
                        step={0.5}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{advancedPolicies.generalFeesUplift}% increase</span>
                        <span>Base: £150m current income</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="mb-3 block">Targeted Cost Recovery</Label>
                      <div className="space-y-2">
                        {[
                          { id: 'vehicle', name: 'Vehicle testing', value: 500000 }, // Fee increase estimate
                          { id: 'planning', name: 'Planning applications', value: 800000 }, // Fee increase estimate
                          { id: 'court', name: 'Court fees', value: 400000 },
                          { id: 'environmental', name: 'Environmental licenses', value: 300000 }
                        ].map(option => (
                          <div key={option.id} className="flex items-center space-x-2 p-2 border rounded">
                            <Checkbox
                              id={option.id}
                              checked={advancedPolicies.targetedRecovery.includes(option.id)}
                              onCheckedChange={(checked) => {
                                setAdvancedPolicies(prev => ({
                                  ...prev,
                                  targetedRecovery: checked
                                    ? [...prev.targetedRecovery, option.id]
                                    : prev.targetedRecovery.filter(id => id !== option.id)
                                }));
                              }}
                            />
                            <Label
                              htmlFor={option.id}
                              className="flex-1 cursor-pointer flex justify-between"
                            >
                              <span>{option.name}</span>
                              <span className="text-sm text-gray-600">
                                £{(option.value / 1000000).toFixed(1)}m
                              </span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Capital Sub-tab */}
              <TabsContent value="capital" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HardHat className="h-5 w-5" />
                      Capital Programme Management
                    </CardTitle>
                    <CardDescription>
                      £25.7-37.6m potential from delivery optimization
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <Label className="flex items-center gap-2">
                          Capital Delivery Gating
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          Apply historical 74% delivery rate (26% typically unspent)
                        </p>
                        <p className="text-xs text-blue-600 mt-2">
                          Cash-gate to confirmed delivery capacity
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-lg">
                          {advancedPolicies.capitalGating ? '£22.7m' : '£0m'}
                        </Badge>
                        <Switch
                          checked={advancedPolicies.capitalGating}
                          onCheckedChange={(checked) => 
                            setAdvancedPolicies(prev => ({ ...prev, capitalGating: checked }))
                          }
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label>Defer Low BCR Projects</Label>
                        <Badge variant="outline">
                          £{(advancedPolicies.deferLowBCR / 1000000).toFixed(1)}m
                        </Badge>
                      </div>
                      <Slider
                        value={[advancedPolicies.deferLowBCR]}
                        onValueChange={([value]) => 
                          setAdvancedPolicies(prev => ({ ...prev, deferLowBCR: value }))
                        }
                        max={5000000}
                        step={250000}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Postpone projects with benefit-cost ratio &lt;1.5
                      </p>
                    </div>
                    
                    <Alert className="border-blue-200 bg-blue-50">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-700 text-sm">
                        Historical delivery: Only 74% of capital budget typically spent (Pink Book p.54)
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Tax Detail Sub-tab */}
              <TabsContent value="tax-detail" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Tax Thresholds & Caps
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label>Personal Allowance</Label>
                          <span className="text-sm font-medium">£{personalAllowance.toLocaleString()}</span>
                        </div>
                        <Slider
                          value={[personalAllowance]}
                          onValueChange={([value]) => setPersonalAllowance(value)}
                          min={10000}
                          max={20000}
                          step={500}
                        />
                        <p className="text-xs text-gray-500 mt-1">Current: £14,500</p>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label>Higher Rate Threshold</Label>
                          <span className="text-sm font-medium">£{higherRateThreshold.toLocaleString()}</span>
                        </div>
                        <Slider
                          value={[higherRateThreshold]}
                          onValueChange={([value]) => setHigherRateThreshold(value)}
                          min={15000}
                          max={30000}
                          step={1000}
                        />
                        <p className="text-xs text-gray-500 mt-1">Current: £21,000</p>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label>Personal Tax Cap</Label>
                          <span className="text-sm font-medium">£{personalTaxCap.toLocaleString()}</span>
                        </div>
                        <Slider
                          value={[personalTaxCap]}
                          onValueChange={([value]) => setPersonalTaxCap(value)}
                          min={150000}
                          max={300000}
                          step={10000}
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label>Joint Tax Cap</Label>
                          <span className="text-sm font-medium">£{jointTaxCap.toLocaleString()}</span>
                        </div>
                        <Slider
                          value={[jointTaxCap]}
                          onValueChange={([value]) => setJointTaxCap(value)}
                          min={300000}
                          max={600000}
                          step={20000}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Corporate Tax Options
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label>Standard Rate</Label>
                          <span className="text-sm font-medium">{corporateTaxRate}%</span>
                        </div>
                        <Slider
                          value={[corporateTaxRate]}
                          onValueChange={([value]) => setCorporateTaxRate(value)}
                          min={0}
                          max={20}
                          step={1}
                        />
                        <p className="text-xs text-gray-500 mt-1">Current: 0%</p>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label>Banking/Property Rate</Label>
                          <span className="text-sm font-medium">{bankingTaxRate}%</span>
                        </div>
                        <Slider
                          value={[bankingTaxRate]}
                          onValueChange={([value]) => setBankingTaxRate(value)}
                          min={0}
                          max={25}
                          step={1}
                        />
                        <p className="text-xs text-gray-500 mt-1">Current: 10%</p>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label>Large Retailer Rate</Label>
                          <span className="text-sm font-medium">{retailerTaxRate}%</span>
                        </div>
                        <Slider
                          value={[retailerTaxRate]}
                          onValueChange={([value]) => setRetailerTaxRate(value)}
                          min={0}
                          max={30}
                          step={1}
                        />
                        <p className="text-xs text-gray-500 mt-1">Current: 20% (&gt;£500k profit)</p>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <Label>OECD Pillar Two (15% minimum)</Label>
                          <p className="text-xs text-gray-600 mt-1">
                            Implement global minimum tax
                          </p>
                        </div>
                        <Switch
                          checked={pillarTwoEnabled}
                          onCheckedChange={setPillarTwoEnabled}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Coins className="h-5 w-5" />
                        National Insurance Rates
                      </CardTitle>
                      <CardDescription>
                        Adjust employee and employer contribution rates
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label>Employee NI Rate</Label>
                          <Badge variant="outline">{niEmployeeRate}%</Badge>
                        </div>
                        <Slider
                          value={[niEmployeeRate]}
                          onValueChange={([value]) => setNiEmployeeRate(value)}
                          min={9}
                          max={15}
                          step={0.5}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Current: 11% | Revenue impact: {formatCurrency((niEmployeeRate - 11) * 14988273)}
                        </p>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label>Employer NI Rate</Label>
                          <Badge variant="outline">{niEmployerRate}%</Badge>
                        </div>
                        <Slider
                          value={[niEmployerRate]}
                          onValueChange={([value]) => setNiEmployerRate(value)}
                          min={10}
                          max={16}
                          step={0.2}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Current: 12.8% | Revenue impact: {formatCurrency((niEmployerRate - 12.8) * 10304453)}
                        </p>
                      </div>
                      
                      <Alert className="border-blue-200 bg-blue-50">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-700 text-sm">
                          NI Fund balance: £850m (projected £1bn by 2030)
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Strategic Sub-tab */}
              <TabsContent value="strategic" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Landmark className="h-5 w-5" />
                        Reserve Policy
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label>Target Reserve Level</Label>
                          <span className="text-sm font-medium">£{targetReserveLevel}m</span>
                        </div>
                        <Slider
                          value={[targetReserveLevel]}
                          onValueChange={([value]) => setTargetReserveLevel(value)}
                          min={1500}
                          max={3000}
                          step={100}
                        />
                        <p className="text-xs text-gray-500 mt-1">Current: £1.76bn | Target by 2030</p>
                      </div>
                      
                      <div>
                        <Label className="mb-3 block">Investment Strategy</Label>
                        <Select value={investmentStrategy} onValueChange={(value: any) => setInvestmentStrategy(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="conservative">Conservative</SelectItem>
                            <SelectItem value="balanced">Balanced</SelectItem>
                            <SelectItem value="growth">Growth</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Pension Policy
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label>State Pension Age</Label>
                          <span className="text-sm font-medium">{statePensionAge}</span>
                        </div>
                        <Slider
                          value={[statePensionAge]}
                          onValueChange={([value]) => setStatePensionAge(value)}
                          min={65}
                          max={70}
                          step={1}
                        />
                        <p className="text-xs text-gray-500 mt-1">Current: 66</p>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <Label>Triple Lock</Label>
                          <p className="text-xs text-gray-600 mt-1">
                            2.5% minimum annual increase
                          </p>
                        </div>
                        <Switch
                          checked={tripleLockEnabled}
                          onCheckedChange={setTripleLockEnabled}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
        
        {/* Warnings Panel - Always visible at bottom */}
        {results.warnings.length > 0 && (
          <Alert className="mt-6 border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <h4 className="font-medium mb-2">Policy Warnings</h4>
              <ul className="space-y-1">
                {results.warnings.map((warning, i) => (
                  <li key={i} className="text-sm">• {warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </main>
    </div>
  )
}