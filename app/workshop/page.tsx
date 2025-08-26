'use client'

import { useState, useEffect, useMemo } from 'react'
import { DEPARTMENTS, REVENUE_STREAMS, INITIAL_STATE } from '@/lib/budget-data'
import { BudgetDataService } from '@/lib/services/budget-data-service'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import departmentBudgets from '@/data/source/department-budgets.json'
import capitalProgramme from '@/data/source/capital-programme.json'
import transferPayments from '@/data/source/transfer-payments.json'
import reservesFunds from '@/data/source/reserves-funds.json'
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
  BookOpen,
  BarChart3,
  X
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
  
  // Advanced Policy Options - Tax Scenarios
  const [advancedTaxScenarios, setAdvancedTaxScenarios] = useState({
    incomeTaxIncrease: 0, // 0, 1, 2, or 3 percent
    higherRateScenario: 21, // 21 (current), 22, or 23 percent
    corporateBankingScenario: 10, // 10 (current), 12, or 15 percent
  })
  
  // Service Cuts state
  const [serviceCuts, setServiceCuts] = useState({
    healthEfficiency: 0, // 0%, 5%, 10%
    educationCuts: 0, // 0%, 5%, 10%
    heritageRail: false, // Reduce to 5 days operation
    busServices: false, // Cut services
    artsCouncil: false // 50% cut
  })
  
  // Efficiency Measures state (Phase 6)
  const [efficiencyMeasures, setEfficiencyMeasures] = useState({
    sharedServices: false, // £15m over 3 years
    digitalTransformation: false, // £20m over 5 years
    propertyRationalization: false, // £5m one-time
    procurementCentralization: false // £10m over 3 years
  })
  
  // Revenue Generation state (Phase 7)
  const [revenueGeneration, setRevenueGeneration] = useState({
    // Note: touristLevy moved here from Basic Controls
    touristLevyAmount: 0, // £0-10 per night
    airportDutyIncrease: 0, // 0-50% increase
    wealthTax: false, // £5m new tax
    carbonTax: false, // £3m new tax
    parkingCharges: false, // £1m new revenue
    planningFees: false, // £0.5m from 25% increase
    courtFees: false, // £0.5m from 20% increase
    vehicleRegistration: false // £1.6m from 10% increase
  })
  
  // Benefit Reforms state (Phase 8)
  const [benefitReforms, setBenefitReforms] = useState({
    winterBonus: false, // Reduce from £400 to £300
    childBenefit: false, // Restrict to households <£30k
    housingBenefitCap: false, // Cap at £25k/year
    pensionSupplementTaper: false // Taper for higher earners
  })
  
  // Capital Programme Adjustments state (Phase 9)
  const [capitalAdjustments, setCapitalAdjustments] = useState({
    selectedDeferrals: [], // Array of project objects to defer
    heritageRailCut: false, // Cut Heritage Rail capital budget
    climateAcceleration: false, // Accelerate climate spending (costs £20m)
    housingInvestment: false // Emergency housing investment (costs £30m)
  })
  
  
  // Phase 10: Scenario management state
  const [savedScenarios, setSavedScenarios] = useState([])
  const [comparisonScenario, setComparisonScenario] = useState(null)
  const [scenarioName, setScenarioName] = useState('')
  
  // Computed values for scenario saving (using existing state)
  const revenueMultipliers = {
    incomeTax: 1,
    corporateTax: 1,
    vat: 1,
    exciseDuties: 1,
    vehicleDuty: 1,
    propertyTax: 1
  }
  
  const expenditureMultipliers = {
    MXC: 1,
    DESC: 1,
    DOI: 1,
    DHA: 1,
    CO: 1,
    EXEC: 1,
    DEFA: 1,
    DfE: 1,
    DHSC: 1,
    TREAS: 1,
    STAT: 1,
    LEG: 1
  }
  
  const taxRates = {
    personalAllowance: personalAllowance,
    lowerRate: standardTaxRate / 100,
    higherRate: incomeTaxRate / 100,
    upperRate: 0,
    corporateRate: 0,
    vatRate: vatRate / 100,
    bankingTaxRate: bankingTaxRate / 100,
    retailerTaxRate: retailerTaxRate / 100,
    fersaRate: 0
  }
  
  const niRates = {
    employee: niEmployeeRate / 100,
    employer: niEmployerRate / 100
  }
  
  const immigrationTarget = 1000
  
  // Calculate advanced policies impact
  const advancedPoliciesImpact = useMemo(() => {
    let impact = 0;
    
    // Income tax increase across all bands (£10m per 1%)
    impact += advancedTaxScenarios.incomeTaxIncrease * 10000000;
    
    // Higher rate increase (21% to 22% = £8m, to 23% = £16m)
    if (advancedTaxScenarios.higherRateScenario === 22) {
      impact += 8000000;
    } else if (advancedTaxScenarios.higherRateScenario === 23) {
      impact += 16000000;
    }
    
    // Corporate banking rate increase (10% to 12% = £3.5m, to 15% = £8.75m)
    if (advancedTaxScenarios.corporateBankingScenario === 12) {
      impact += 3500000;
    } else if (advancedTaxScenarios.corporateBankingScenario === 15) {
      impact += 8750000;
    }
    
    return impact;
  }, [advancedTaxScenarios]);
  
  // Calculate impact of service cuts
  const serviceCutsImpact = useMemo(() => {
    let expenditureReduction = 0
    
    // Health efficiency - Calculate from Manx Care net budget
    if (serviceCuts.healthEfficiency > 0) {
      const manxCare = departmentBudgets.departments.find(d => d.code === 'MXC')
      const dhsc = departmentBudgets.departments.find(d => d.code === 'DHSC')
      // Combined health budget: Manx Care net minus DHSC income offset
      const healthBudget = manxCare.net_expenditure + Math.abs(dhsc.net_expenditure)
      expenditureReduction += healthBudget * (serviceCuts.healthEfficiency / 100)
    }
    
    // Education cuts - Use DESC net expenditure from JSON
    if (serviceCuts.educationCuts > 0) {
      const desc = departmentBudgets.departments.find(d => d.code === 'DESC')
      expenditureReduction += desc.net_expenditure * (serviceCuts.educationCuts / 100)
    }
    
    // Infrastructure cuts
    if (serviceCuts.heritageRail) {
      // Heritage Railway operating budget from DOI verified components
      const doi = departmentBudgets.departments.find(d => d.code === 'DOI')
      const railwayBudget = doi.verified_components.isle_of_man_railways
      // 20% reduction for 5-day operation (reduce from 7 to 5 days)
      expenditureReduction += railwayBudget * 0.2
    }
    
    if (serviceCuts.busServices) {
      // Bus services operating budget from DOI verified components
      const doi = departmentBudgets.departments.find(d => d.code === 'DOI')
      const busBudget = doi.verified_components.transport_services_division
      // 25% service reduction
      expenditureReduction += busBudget * 0.25
    }
    
    // Culture cuts
    if (serviceCuts.artsCouncil) {
      // Culture division budget from DESC verified components
      const desc = departmentBudgets.departments.find(d => d.code === 'DESC')
      const cultureBudget = desc.verified_components.culture_division
      // 50% cut to culture/arts funding
      expenditureReduction += cultureBudget * 0.5
    }
    
    // Museums removed - part of culture division already counted above
    
    return expenditureReduction
  }, [serviceCuts]);
  
  // Calculate impact of efficiency measures (Phase 6)
  const efficiencyImpact = useMemo(() => {
    let yearOneSavings = 0
    
    // Shared Services - £5m per year for 3 years (£15m total)
    if (efficiencyMeasures.sharedServices) {
      yearOneSavings += 5000000 // £5m in year 1
    }
    
    // Digital Transformation - £4m per year for 5 years (£20m total)
    if (efficiencyMeasures.digitalTransformation) {
      yearOneSavings += 4000000 // £4m in year 1
    }
    
    // Property Rationalization - £5m one-time
    if (efficiencyMeasures.propertyRationalization) {
      yearOneSavings += 5000000 // £5m one-time saving
    }
    
    // Procurement Centralization - £3m per year for first 2 years, £4m in year 3 (£10m total)
    if (efficiencyMeasures.procurementCentralization) {
      yearOneSavings += 3000000 // £3m in year 1
    }
    
    return yearOneSavings
  }, [efficiencyMeasures]);
  
  // Calculate impact of revenue generation (Phase 7)
  const revenueGenerationImpact = useMemo(() => {
    let additionalRevenue = 0
    
    // Tourist Accommodation Levy (moved from Basic Controls)
    // IoM Tourism: ~1.6m visitor nights
    const visitorNights = 1600000
    additionalRevenue += revenueGeneration.touristLevyAmount * visitorNights
    
    // Airport Passenger Duty increase
    // Current base from JSON: £4.6m (in excise duties)
    const airportDutyBase = 4600000
    additionalRevenue += airportDutyBase * (revenueGeneration.airportDutyIncrease / 100)
    
    // New taxes (fixed amounts per spec)
    if (revenueGeneration.wealthTax) {
      additionalRevenue += 5000000 // £5m new wealth tax
    }
    
    if (revenueGeneration.carbonTax) {
      additionalRevenue += 3000000 // £3m carbon tax
    }
    
    if (revenueGeneration.parkingCharges) {
      additionalRevenue += 1000000 // £1m parking charges
    }
    
    // Fee increases (fixed amounts per spec)
    if (revenueGeneration.planningFees) {
      additionalRevenue += 500000 // £0.5m from 25% increase
    }
    
    if (revenueGeneration.courtFees) {
      additionalRevenue += 500000 // £0.5m from 20% increase
    }
    
    if (revenueGeneration.vehicleRegistration) {
      additionalRevenue += 1600000 // £1.6m from 10% increase
    }
    
    return additionalRevenue
  }, [revenueGeneration]);
  
  // Calculate impact of benefit reforms (Phase 8)
  const benefitReformsImpact = useMemo(() => {
    let expenditureReduction = 0
    
    // Winter Bonus reduction (£400 to £300)
    if (benefitReforms.winterBonus) {
      // From JSON: winter_bonus total
      const winterBonusTotal = transferPayments.revenue_funded_benefits.breakdown.winter_bonus.amount
      // Reducing by 25% (from £400 to £300 per person)
      expenditureReduction += winterBonusTotal * 0.25
      // NOTE: Spec incorrectly claims £1.8m saving - total budget is only £914k!
    }
    
    // Child Benefit restriction to households <£30k
    if (benefitReforms.childBenefit) {
      // From JSON: child_benefit total
      const childBenefitTotal = transferPayments.revenue_funded_benefits.breakdown.child_benefit.amount
      // Restricting to <£30k households saves approximately 22% (affects ~2000 of 9000 families)
      expenditureReduction += childBenefitTotal * 0.22
    }
    
    // Housing Benefit cap at £25k/year
    if (benefitReforms.housingBenefitCap) {
      // Housing is part of income_support from JSON
      const incomeSupport = transferPayments.revenue_funded_benefits.breakdown.income_support.amount
      // Estimate housing component is ~27% of income support, cap saves ~5% of housing portion
      const housingPortion = incomeSupport * 0.27
      expenditureReduction += housingPortion * 0.20 // Cap affects highest 20% of housing claims
    }
    
    // Pension Supplement taper for higher earners
    if (benefitReforms.pensionSupplementTaper) {
      // From JSON: retirement_pension_supplement + manx_pension_supplement
      const pensionSupplements = 
        transferPayments.ni_funded_benefits.breakdown.pension_supplements.retirement_pension_supplement +
        transferPayments.ni_funded_benefits.breakdown.pension_supplements.manx_pension_supplement
      // Tapering for higher earners saves approximately 7% of total supplements
      expenditureReduction += pensionSupplements * 0.07
    }
    
    return expenditureReduction
  }, [benefitReforms]);
  
  // Get deferrable projects from capital programme (Phase 9)
  const deferrableProjects = useMemo(() => {
    const projects = []
    // Get discrete projects from all departments
    Object.entries(capitalProgramme.projects_2025_26.discrete_schemes.by_department).forEach(([deptCode, dept]) => {
      dept.projects.forEach(project => {
        projects.push({
          name: project.name,
          amount: project.amount,
          department: deptCode,
          id: `${deptCode}_${project.name.replace(/\s+/g, '_')}`
        })
      })
    })
    return projects.sort((a, b) => b.amount - a.amount) // Sort by amount descending
  }, [])
  
  // Calculate impact of capital programme adjustments (Phase 9)
  const capitalAdjustmentsImpact = useMemo(() => {
    let impact = 0
    
    // Add up deferred projects (positive = savings)
    impact += capitalAdjustments.selectedDeferrals.reduce((sum, projectId) => {
      const project = deferrableProjects.find(p => p.id === projectId)
      return sum + (project ? project.amount : 0)
    }, 0)
    
    // Heritage Rail capital cut
    if (capitalAdjustments.heritageRailCut) {
      // Find Heritage Rail Budget in rolling schemes from JSON
      const heritageRail = capitalProgramme.projects_2025_26.rolling_schemes
        .by_department.DOI?.projects
        ?.find(p => p.name === "Heritage Rail Budget")
      if (heritageRail) {
        impact += heritageRail.amount
      }
    }
    
    // Climate acceleration (costs money - negative impact)
    if (capitalAdjustments.climateAcceleration) {
      impact -= 20000000 // Policy target for additional climate spending
    }
    
    // Housing investment (costs money - negative impact)
    if (capitalAdjustments.housingInvestment) {
      impact -= 30000000 // Policy target for emergency housing investment
    }
    
    return impact
  }, [capitalAdjustments, deferrableProjects])
  
  // Calculations
  const [results, setResults] = useState({
    revenue: INITIAL_STATE.revenue.total,
    expenditure: INITIAL_STATE.expenditure.total,
    balance: INITIAL_STATE.balance.surplus,
    warnings: [] as string[]
  })
  
  // Phase 10: Save current scenario
  const saveScenario = (nameOverride) => {
    const name = nameOverride || scenarioName
    if (!name || !name.trim()) {
      alert('Please enter a scenario name')
      return
    }
    
    const scenario = {
      name: name,
      timestamp: new Date().toISOString(),
      state: {
        revenueMultipliers,
        expenditureMultipliers,
        taxRates,
        niRates,
        immigrationTarget,
        tripleLockEnabled,
        statePensionAge,
        serviceCuts,
        efficiencyMeasures,
        revenueGeneration,
        benefitReforms,
        capitalAdjustments
      },
      results: {
        revenue: results.revenue,
        expenditure: results.expenditure,
        balance: results.balance,
        sustainabilityScore: results.sustainabilityScore
      }
    }
    
    const updatedScenarios = [...savedScenarios, scenario]
    setSavedScenarios(updatedScenarios)
    localStorage.setItem('iom-budget-scenarios', JSON.stringify(updatedScenarios))
    setScenarioName('')
    alert(`Scenario "${name}" saved successfully`)
  }
  
  // Phase 10: Load scenario
  const loadScenario = (scenario) => {
    const { state } = scenario
    // Load tax rates
    if (state.taxRates) {
      setPersonalAllowance(state.taxRates.personalAllowance)
      setStandardTaxRate(state.taxRates.lowerRate * 100)
      setIncomeTaxRate(state.taxRates.higherRate * 100)
      setVatRate(state.taxRates.vatRate * 100)
      setBankingTaxRate(state.taxRates.bankingTaxRate * 100)
      setRetailerTaxRate(state.taxRates.retailerTaxRate * 100)
    }
    // Load NI rates
    if (state.niRates) {
      setNiEmployeeRate(state.niRates.employee * 100)
      setNiEmployerRate(state.niRates.employer * 100)
    }
    // Load other state  
    if (state.tripleLockEnabled !== undefined) setTripleLockEnabled(state.tripleLockEnabled)
    if (state.statePensionAge !== undefined) setStatePensionAge(state.statePensionAge)
    
    // Load Phase 5-9 state
    setServiceCuts(state.serviceCuts || {})
    setEfficiencyMeasures(state.efficiencyMeasures || state.efficiencySavings || {}) // Support old saves
    setRevenueGeneration(state.revenueGeneration || {})
    setBenefitReforms(state.benefitReforms || {})
    setCapitalAdjustments(state.capitalAdjustments || {})
  }
  
  // Phase 10: Export to CSV
  const exportToCSV = () => {
    const csv = [
      ['Isle of Man Budget Scenario Export'],
      ['Generated:', new Date().toLocaleString()],
      [''],
      ['SUMMARY'],
      ['Total Revenue', formatCurrency(results.revenue)],
      ['Total Expenditure', formatCurrency(results.expenditure)],
      ['Budget Balance', formatCurrency(results.balance)],
      ['Sustainability Score', results.sustainabilityScore || 'N/A'],
      [''],
      ['TAX RATES'],
      ['Personal Allowance', `£${taxRates.personalAllowance}`],
      ['Lower Rate', `${(taxRates.lowerRate * 100).toFixed(1)}%`],
      ['Higher Rate', `${(taxRates.higherRate * 100).toFixed(1)}%`],
      ['VAT Rate', `${(taxRates.vatRate * 100).toFixed(1)}%`],
      [''],
      ['DEPARTMENT BUDGETS'],
      ...Object.entries(expenditureMultipliers).map(([dept, mult]) => [
        dept,
        `${((mult - 1) * 100).toFixed(1)}% adjustment`
      ]),
      [''],
      ['SERVICE CUTS'],
      ['Culture Division', serviceCuts.cultureDivision ? 'Yes' : 'No'],
      ['Transport Services', serviceCuts.transportServices ? 'Yes' : 'No'],
      ['Heritage Railway', serviceCuts.heritageRail ? 'Yes' : 'No'],
      [''],
      ['EFFICIENCY SAVINGS'],
      ['Shared Services', efficiencyMeasures.sharedServices ? 'Yes' : 'No'],
      ['Digital Transformation', efficiencyMeasures.digitalTransformation ? 'Yes' : 'No'],
      ['Property Rationalization', efficiencyMeasures.propertyRationalization ? 'Yes' : 'No'],
      ['Procurement Centralization', efficiencyMeasures.procurementCentralization ? 'Yes' : 'No'],
      [''],
      ['REVENUE GENERATION'],
      ...Object.entries(revenueGeneration).map(([key, enabled]) => [
        key.replace(/([A-Z])/g, ' $1').trim(),
        enabled ? 'Yes' : 'No'
      ]),
      [''],
      ['WARNINGS'],
      ...results.warnings.map(w => ['Warning', w])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `iom-budget-scenario-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  // Load saved scenarios on mount
  useEffect(() => {
    const saved = localStorage.getItem('iom-budget-scenarios')
    if (saved) {
      try {
        setSavedScenarios(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load saved scenarios:', e)
      }
    }
  }, [])
  
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
    
    // Pillar 2 Tax (OECD Minimum Tax)
    if (pillarTwoEnabled) {
      newRevenue += 35000000 // £35m from OECD minimum tax implementation
    }
    
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
    
    // Advanced policies impact
    newRevenue += advancedPoliciesImpact
    
    // Revenue generation impact (Phase 7)
    newRevenue += revenueGenerationImpact
    
    // Service cuts impact
    newExpenditure -= serviceCutsImpact
    
    // Efficiency savings impact
    newExpenditure -= efficiencyImpact
    
    // Benefit reforms impact (Phase 8)
    newExpenditure -= benefitReformsImpact
    
    // Capital programme adjustments (Phase 9)
    // Note: Negative impact means increased spending
    newExpenditure -= capitalAdjustmentsImpact
    
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
    
    // Pension age savings
    if (statePensionAge === 68) {
      newExpenditure -= 15000000 // £15m savings from raising pension age to 68
    }
    
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
    
    // Vehicle Duty adjustments will be calculated when advanced options are implemented
    
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
    tripleLockEnabled, statePensionAge, advancedPoliciesImpact, serviceCutsImpact,
    efficiencyImpact, revenueGenerationImpact, benefitReformsImpact, capitalAdjustmentsImpact
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
          // Advanced benefit changes will be added when implemented
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
    // Advanced policies reset will be implemented when advanced tabs are added
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
                onClick={() => {
                  const name = prompt('Enter scenario name:')
                  if (name) {
                    saveScenario(name)
                  }
                }}
                className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                <Save className="h-4 w-4 mr-1" />
                Save Scenario
              </button>
              {savedScenarios.length > 0 && (
                <div className="relative">
                  <select 
                    onChange={(e) => {
                      if (e.target.value) {
                        const scenario = savedScenarios.find(s => s.name === e.target.value)
                        if (scenario) {
                          loadScenario(scenario)
                          alert(`Loaded scenario: ${scenario.name}`)
                        }
                      }
                    }}
                    className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
                  >
                    <option value="">📂 Load Scenario ({savedScenarios.length})</option>
                    {savedScenarios.map((scenario, index) => (
                      <option key={index} value={scenario.name}>
                        {scenario.name} - {new Date(scenario.timestamp).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <button 
                onClick={exportToCSV}
                className="flex items-center px-3 py-1.5 text-sm bg-gray-100 rounded hover:bg-gray-200">
                <FileDown className="h-4 w-4 mr-1" />
                Export CSV
              </button>
              {savedScenarios.length > 0 && (
                <button 
                  onClick={() => {
                    if (confirm(`Delete all ${savedScenarios.length} saved scenarios?`)) {
                      setSavedScenarios([])
                      localStorage.removeItem('iom-budget-scenarios')
                      alert('All scenarios deleted')
                    }
                  }}
                  className="flex items-center px-2 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200">
                  <X className="h-4 w-4" />
                </button>
              )}
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
                    
                    {/* Corporate Banking Tax */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Label>Corporate Banking Tax</Label>
                          <StatusBadge status="existing" />
                        </div>
                        <span className="text-sm font-medium">{bankingTaxRate}%</span>
                      </div>
                      <Slider
                        value={[bankingTaxRate]}
                        onValueChange={([value]) => setBankingTaxRate(value)}
                        min={10}
                        max={20}
                        step={1}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Current: 10% | Revenue impact: {formatCurrency((bankingTaxRate - 10) * 1.75 * 1000000)}
                      </p>
                    </div>
                    
                    {/* NI Employee Rate */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Label>NI Employee Rate</Label>
                          <StatusBadge status="existing" />
                        </div>
                        <span className="text-sm font-medium">{niEmployeeRate}%</span>
                      </div>
                      <Slider
                        value={[niEmployeeRate]}
                        onValueChange={([value]) => setNiEmployeeRate(value)}
                        min={10}
                        max={13}
                        step={0.5}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Current: 11% | Revenue impact: {formatCurrency((niEmployeeRate - 11) * 16.5 * 1000000)}
                      </p>
                    </div>
                    
                    {/* NI Employer Rate */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Label>NI Employer Rate</Label>
                          <StatusBadge status="existing" />
                        </div>
                        <span className="text-sm font-medium">{niEmployerRate}%</span>
                      </div>
                      <Slider
                        value={[niEmployerRate]}
                        onValueChange={([value]) => setNiEmployerRate(value)}
                        min={11}
                        max={15}
                        step={0.2}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Current: 12.8% | Revenue impact: {formatCurrency((niEmployerRate - 12.8) * 13 * 1000000)}
                      </p>
                    </div>
                  </div>
                  
                  {/* New Revenue Sources */}
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700">New Revenue Sources</h4>
                    
                    {/* Pillar 2 Tax Toggle */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="pillar2">Enable Pillar 2 Tax (OECD Minimum)</Label>
                        <StatusBadge status="proposed" />
                        <InfoTooltip text="OECD minimum tax implementation. Adds £35m revenue when enabled." />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-green-600">
                          {pillarTwoEnabled ? '+£35m' : '£0'}
                        </span>
                        <Switch
                          id="pillar2"
                          checked={pillarTwoEnabled}
                          onCheckedChange={setPillarTwoEnabled}
                        />
                      </div>
                    </div>
                    
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
                    
                    {/* Pension Age Toggle */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="pensionAge">State Pension Age</Label>
                          <StatusBadge status="proposed" />
                          <InfoTooltip text="Raising pension age from 67 to 68 saves £15m annually" />
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">
                            Age:
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setStatePensionAge(67)}
                              className={`px-3 py-1 text-sm border rounded-l ${
                                statePensionAge === 67
                                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                                  : 'bg-white hover:bg-gray-50'
                              }`}
                            >
                              67
                            </button>
                            <button
                              onClick={() => setStatePensionAge(68)}
                              className={`px-3 py-1 text-sm border rounded-r ${
                                statePensionAge === 68
                                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                                  : 'bg-white hover:bg-gray-50'
                              }`}
                            >
                              68
                            </button>
                          </div>
                          <span className="text-sm font-medium text-green-600 ml-2">
                            {statePensionAge === 68 ? 'Saves £15m' : 'Baseline'}
                          </span>
                        </div>
                      </div>
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
            
            <Tabs defaultValue="tax" className="space-y-4">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="tax">Tax Changes</TabsTrigger>
                <TabsTrigger value="cuts">Service Cuts</TabsTrigger>
                <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="benefits">Benefits</TabsTrigger>
                <TabsTrigger value="capital">Capital</TabsTrigger>
              </TabsList>
              
              {/* Tax Changes Tab */}
              <TabsContent value="tax" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Tax Change Scenarios
                    </CardTitle>
                    <CardDescription>
                      Select tax policy changes to see revenue impact
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Income Tax Increase Across All Bands */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Income Tax Increase (All Bands)</Label>
                        <Badge variant="outline" className="text-sm">
                          +£{(advancedTaxScenarios.incomeTaxIncrease * 10).toFixed(0)}m
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { value: 0, label: 'No change', impact: '£0' },
                          { value: 1, label: '+1%', impact: '+£10m' },
                          { value: 2, label: '+2%', impact: '+£20m' },
                          { value: 3, label: '+3%', impact: '+£30m' }
                        ].map(option => (
                          <button
                            key={option.value}
                            onClick={() => setAdvancedTaxScenarios(prev => ({ ...prev, incomeTaxIncrease: option.value }))}
                            className={`p-3 text-sm border rounded-lg transition-colors ${
                              advancedTaxScenarios.incomeTaxIncrease === option.value
                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                : 'bg-white hover:bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs mt-1 opacity-75">{option.impact}</div>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        Increases both standard (10%) and higher (21%) rates by selected percentage
                      </p>
                    </div>

                    {/* Higher Rate Scenarios */}
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Higher Rate Tax Band</Label>
                        <Badge variant="outline" className="text-sm">
                          +£{advancedTaxScenarios.higherRateScenario === 22 ? '8' : 
                              advancedTaxScenarios.higherRateScenario === 23 ? '16' : '0'}m
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 21, label: '21%', sublabel: 'Current rate', impact: '£0' },
                          { value: 22, label: '22%', sublabel: '+1 point', impact: '+£8m' },
                          { value: 23, label: '23%', sublabel: '+2 points', impact: '+£16m' }
                        ].map(option => (
                          <button
                            key={option.value}
                            onClick={() => setAdvancedTaxScenarios(prev => ({ ...prev, higherRateScenario: option.value }))}
                            className={`p-3 text-sm border rounded-lg transition-colors ${
                              advancedTaxScenarios.higherRateScenario === option.value
                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                : 'bg-white hover:bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs opacity-75">{option.sublabel}</div>
                            <div className="text-xs mt-1 font-medium">{option.impact}</div>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        Applies to income over £21,000 (affects ~30,000 taxpayers)
                      </p>
                    </div>

                    {/* Corporate Banking Tax */}
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Corporate Banking Tax Rate</Label>
                        <Badge variant="outline" className="text-sm">
                          +£{advancedTaxScenarios.corporateBankingScenario === 12 ? '3.5' : 
                              advancedTaxScenarios.corporateBankingScenario === 15 ? '8.75' : '0'}m
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 10, label: '10%', sublabel: 'Current rate', impact: '£0' },
                          { value: 12, label: '12%', sublabel: '+2 points', impact: '+£3.5m' },
                          { value: 15, label: '15%', sublabel: '+5 points', impact: '+£8.75m' }
                        ].map(option => (
                          <button
                            key={option.value}
                            onClick={() => setAdvancedTaxScenarios(prev => ({ ...prev, corporateBankingScenario: option.value }))}
                            className={`p-3 text-sm border rounded-lg transition-colors ${
                              advancedTaxScenarios.corporateBankingScenario === option.value
                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                : 'bg-white hover:bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs opacity-75">{option.sublabel}</div>
                            <div className="text-xs mt-1 font-medium">{option.impact}</div>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        Applies to banking and property sectors (current base: £18.7m)
                      </p>
                    </div>

                    {/* Total Impact Summary */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-900">Total Tax Scenario Impact:</span>
                        <span className="text-lg font-bold text-blue-900">
                          +{formatCurrency(advancedPoliciesImpact)}
                        </span>
                      </div>
                      <p className="text-xs text-blue-700 mt-2">
                        This revenue will be added to your budget calculations
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Service Cuts Tab */}
              <TabsContent value="cuts" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Service Cut Options
                    </CardTitle>
                    <CardDescription>
                      Select service reduction scenarios to identify savings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Health Efficiency */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Health Efficiency</h4>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="healthEfficiency"
                            checked={serviceCuts.healthEfficiency === 0}
                            onChange={() => setServiceCuts({...serviceCuts, healthEfficiency: 0})}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span>Current (no change)</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="healthEfficiency"
                            checked={serviceCuts.healthEfficiency === 5}
                            onChange={() => setServiceCuts({...serviceCuts, healthEfficiency: 5})}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span>5% efficiency target <span className="text-green-600 font-semibold">(+£14m)</span></span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="healthEfficiency"
                            checked={serviceCuts.healthEfficiency === 10}
                            onChange={() => setServiceCuts({...serviceCuts, healthEfficiency: 10})}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span>10% efficiency target <span className="text-green-600 font-semibold">(+£29m)</span></span>
                        </label>
                      </div>
                    </div>

                    {/* Education Cuts */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Education Budget</h4>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="educationCuts"
                            checked={serviceCuts.educationCuts === 0}
                            onChange={() => setServiceCuts({...serviceCuts, educationCuts: 0})}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span>Current (no change)</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="educationCuts"
                            checked={serviceCuts.educationCuts === 5}
                            onChange={() => setServiceCuts({...serviceCuts, educationCuts: 5})}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span>5% budget reduction <span className="text-green-600 font-semibold">(+£7m)</span></span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="educationCuts"
                            checked={serviceCuts.educationCuts === 10}
                            onChange={() => setServiceCuts({...serviceCuts, educationCuts: 10})}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span>10% budget reduction <span className="text-green-600 font-semibold">(+£14m)</span></span>
                        </label>
                      </div>
                    </div>

                    {/* Infrastructure Cuts */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Infrastructure Services</h4>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-3">
                          <Checkbox
                            checked={serviceCuts.heritageRail}
                            onCheckedChange={(checked) => 
                              setServiceCuts({...serviceCuts, heritageRail: checked as boolean})
                            }
                          />
                          <span>Reduce Heritage Railway to 5 days/week <span className="text-green-600 font-semibold">(+£0.61m)</span></span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <Checkbox
                            checked={serviceCuts.busServices}
                            onCheckedChange={(checked) => 
                              setServiceCuts({...serviceCuts, busServices: checked as boolean})
                            }
                          />
                          <span>Reduce bus services frequency <span className="text-green-600 font-semibold">(+£1.5m)</span></span>
                        </label>
                      </div>
                    </div>

                    {/* Culture Cuts */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Culture & Heritage</h4>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-3">
                          <Checkbox
                            checked={serviceCuts.artsCouncil}
                            onCheckedChange={(checked) => 
                              setServiceCuts({...serviceCuts, artsCouncil: checked as boolean})
                            }
                          />
                          <span>Reduce Culture & Arts funding by 50% <span className="text-green-600 font-semibold">(+£0.72m)</span></span>
                        </label>
                      </div>
                    </div>

                    {/* Total Impact */}
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">Total Service Cuts Impact:</span>
                        <span className="text-lg font-bold text-green-600">
                          {serviceCutsImpact > 0 ? `+${formatCurrency(serviceCutsImpact)}` : formatCurrency(serviceCutsImpact)} savings
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Efficiency Tab */}
              <TabsContent value="efficiency" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Efficiency Measures
                    </CardTitle>
                    <CardDescription>
                      Select efficiency programs to achieve long-term savings through modernization
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Shared Services */}
                    <div className="space-y-3">
                      <label className="flex items-start space-x-3">
                        <Checkbox
                          checked={efficiencyMeasures.sharedServices}
                          onCheckedChange={(checked) => 
                            setEfficiencyMeasures({...efficiencyMeasures, sharedServices: checked as boolean})
                          }
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Expand Shared Services</span>
                            <span className="text-green-600 font-semibold">£15m over 3 years</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">Consolidate HR, IT, and Finance functions across departments</p>
                          <div className="text-xs text-gray-500 mt-2">
                            Timeline: Year 1: £5m | Year 2: £10m | Year 3: £15m (cumulative)
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Digital Transformation */}
                    <div className="space-y-3">
                      <label className="flex items-start space-x-3">
                        <Checkbox
                          checked={efficiencyMeasures.digitalTransformation}
                          onCheckedChange={(checked) => 
                            setEfficiencyMeasures({...efficiencyMeasures, digitalTransformation: checked as boolean})
                          }
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Digital Transformation</span>
                            <span className="text-green-600 font-semibold">£20m over 5 years</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">Modernize service delivery through digital channels</p>
                          <div className="text-xs text-gray-500 mt-2">
                            Timeline: £4m annual savings | Linked to Digital Projects Fund (£5m/year capital)
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Property Rationalization */}
                    <div className="space-y-3">
                      <label className="flex items-start space-x-3">
                        <Checkbox
                          checked={efficiencyMeasures.propertyRationalization}
                          onCheckedChange={(checked) => 
                            setEfficiencyMeasures({...efficiencyMeasures, propertyRationalization: checked as boolean})
                          }
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Rationalize Property Portfolio</span>
                            <span className="text-green-600 font-semibold">£5m one-time</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">Sell surplus buildings and consolidate office space</p>
                          <div className="text-xs text-gray-500 mt-2">
                            Timeline: One-time savings from asset sales
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Procurement Centralization */}
                    <div className="space-y-3">
                      <label className="flex items-start space-x-3">
                        <Checkbox
                          checked={efficiencyMeasures.procurementCentralization}
                          onCheckedChange={(checked) => 
                            setEfficiencyMeasures({...efficiencyMeasures, procurementCentralization: checked as boolean})
                          }
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Centralize Procurement</span>
                            <span className="text-green-600 font-semibold">£10m over 3 years</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">Central purchasing and contract negotiation</p>
                          <div className="text-xs text-gray-500 mt-2">
                            Timeline: Year 1: £3m | Year 2: £6m | Year 3: £10m (cumulative)
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Total Impact */}
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">Year 1 Efficiency Savings:</span>
                        <span className="text-lg font-bold text-green-600">
                          {efficiencyImpact > 0 ? `+${formatCurrency(efficiencyImpact)}` : formatCurrency(efficiencyImpact)} savings
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Note: Full savings realized over 3-5 year implementation period
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Revenue Tab */}
              <TabsContent value="revenue" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Revenue Generation Options
                    </CardTitle>
                    <CardDescription>
                      Introduce new revenue streams and increase existing fees
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Tourism & Transport */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Tourism & Transport</h4>
                      <div className="space-y-4">
                        {/* Tourist Accommodation Levy */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label>Tourist Accommodation Levy</Label>
                            <span className="text-sm text-gray-600">£{revenueGeneration.touristLevyAmount} per night</span>
                          </div>
                          <Slider
                            value={[revenueGeneration.touristLevyAmount]}
                            onValueChange={(value) => 
                              setRevenueGeneration({...revenueGeneration, touristLevyAmount: value[0]})
                            }
                            max={10}
                            step={1}
                            className="mb-2"
                          />
                          <div className="text-xs text-gray-500">
                            Revenue impact: <span className="font-semibold text-green-600">
                              +{formatCurrency(revenueGeneration.touristLevyAmount * 1600000)}
                            </span> (1.6m visitor nights)
                          </div>
                        </div>

                        {/* Airport Passenger Duty */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label>Airport Passenger Duty Increase</Label>
                            <span className="text-sm text-gray-600">+{revenueGeneration.airportDutyIncrease}%</span>
                          </div>
                          <Slider
                            value={[revenueGeneration.airportDutyIncrease]}
                            onValueChange={(value) => 
                              setRevenueGeneration({...revenueGeneration, airportDutyIncrease: value[0]})
                            }
                            max={50}
                            step={5}
                            className="mb-2"
                          />
                          <div className="text-xs text-gray-500">
                            Revenue impact: <span className="font-semibold text-green-600">
                              +{formatCurrency(4600000 * revenueGeneration.airportDutyIncrease / 100)}
                            </span> (on £4.6m base)
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* New Revenue Streams */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">New Revenue Streams</h4>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-3">
                          <Checkbox
                            checked={revenueGeneration.wealthTax}
                            onCheckedChange={(checked) => 
                              setRevenueGeneration({...revenueGeneration, wealthTax: checked as boolean})
                            }
                          />
                          <span>Introduce Wealth Tax <span className="text-green-600 font-semibold">(+£5m)</span></span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <Checkbox
                            checked={revenueGeneration.carbonTax}
                            onCheckedChange={(checked) => 
                              setRevenueGeneration({...revenueGeneration, carbonTax: checked as boolean})
                            }
                          />
                          <span>Carbon Tax <span className="text-green-600 font-semibold">(+£3m)</span></span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <Checkbox
                            checked={revenueGeneration.parkingCharges}
                            onCheckedChange={(checked) => 
                              setRevenueGeneration({...revenueGeneration, parkingCharges: checked as boolean})
                            }
                          />
                          <span>Introduce/Expand Parking Charges <span className="text-green-600 font-semibold">(+£1m)</span></span>
                        </label>
                      </div>
                    </div>

                    {/* Fee Increases */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Fee Increases</h4>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-3">
                          <Checkbox
                            checked={revenueGeneration.planningFees}
                            onCheckedChange={(checked) => 
                              setRevenueGeneration({...revenueGeneration, planningFees: checked as boolean})
                            }
                          />
                          <span>Planning Fees +25% <span className="text-green-600 font-semibold">(+£0.5m)</span></span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <Checkbox
                            checked={revenueGeneration.courtFees}
                            onCheckedChange={(checked) => 
                              setRevenueGeneration({...revenueGeneration, courtFees: checked as boolean})
                            }
                          />
                          <span>Court Fees +20% <span className="text-green-600 font-semibold">(+£0.5m)</span></span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <Checkbox
                            checked={revenueGeneration.vehicleRegistration}
                            onCheckedChange={(checked) => 
                              setRevenueGeneration({...revenueGeneration, vehicleRegistration: checked as boolean})
                            }
                          />
                          <span>Vehicle Registration +10% <span className="text-green-600 font-semibold">(+£1.6m)</span></span>
                        </label>
                      </div>
                    </div>

                    {/* Total Impact */}
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">Total New Revenue:</span>
                        <span className="text-lg font-bold text-green-600">
                          +{formatCurrency(revenueGenerationImpact)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Benefits Tab */}
              <TabsContent value="benefits" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Benefit Reforms
                    </CardTitle>
                    <CardDescription>
                      Adjust benefit eligibility and rates to reduce expenditure
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Data Discrepancy Alert */}
                    <Alert className="border-amber-200 bg-amber-50">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-sm">
                        <strong>Data Discrepancy:</strong> Spec claims Winter Bonus reduction saves £1.8m, 
                        but JSON shows total budget is only £914k. Using real data below.
                      </AlertDescription>
                    </Alert>

                    {/* Winter Support */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Winter Support</h4>
                      <label className="flex items-start space-x-3">
                        <Checkbox
                          checked={benefitReforms.winterBonus}
                          onCheckedChange={(checked) => 
                            setBenefitReforms({...benefitReforms, winterBonus: checked as boolean})
                          }
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span>Reduce Winter Bonus from £400 to £300</span>
                            <span className="text-green-600 font-semibold">
                              +{formatCurrency(transferPayments.revenue_funded_benefits.breakdown.winter_bonus.amount * 0.25)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Affects: ~2,285 people | Current budget: {formatCurrency(transferPayments.revenue_funded_benefits.breakdown.winter_bonus.amount)} (from JSON)
                          </p>
                          <p className="text-xs text-amber-600 mt-1">
                            ⚠️ Real saving from JSON data (spec claimed £1.8m from only £914k budget)
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Family Benefits */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Family Benefits</h4>
                      <label className="flex items-start space-x-3">
                        <Checkbox
                          checked={benefitReforms.childBenefit}
                          onCheckedChange={(checked) => 
                            setBenefitReforms({...benefitReforms, childBenefit: checked as boolean})
                          }
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span>Restrict Child Benefit to households earning &lt;£30k</span>
                            <span className="text-green-600 font-semibold">
                              +{formatCurrency(transferPayments.revenue_funded_benefits.breakdown.child_benefit.amount * 0.22)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Affects: ~2,000 families | Current budget: {formatCurrency(transferPayments.revenue_funded_benefits.breakdown.child_benefit.amount)} (from JSON)
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Housing Support */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Housing Support</h4>
                      <label className="flex items-start space-x-3">
                        <Checkbox
                          checked={benefitReforms.housingBenefitCap}
                          onCheckedChange={(checked) => 
                            setBenefitReforms({...benefitReforms, housingBenefitCap: checked as boolean})
                          }
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span>Cap Housing Benefit at £25k per year</span>
                            <span className="text-green-600 font-semibold">
                              +{formatCurrency(transferPayments.revenue_funded_benefits.breakdown.income_support.amount * 0.27 * 0.20)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Affects: ~150 households | Part of {formatCurrency(transferPayments.revenue_funded_benefits.breakdown.income_support.amount)} Income Support (from JSON)
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Pension Supplements */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Pension Supplements</h4>
                      <label className="flex items-start space-x-3">
                        <Checkbox
                          checked={benefitReforms.pensionSupplementTaper}
                          onCheckedChange={(checked) => 
                            setBenefitReforms({...benefitReforms, pensionSupplementTaper: checked as boolean})
                          }
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span>Taper pension supplements for higher earners</span>
                            <span className="text-green-600 font-semibold">
                              +{formatCurrency(
                                (transferPayments.ni_funded_benefits.breakdown.pension_supplements.retirement_pension_supplement +
                                 transferPayments.ni_funded_benefits.breakdown.pension_supplements.manx_pension_supplement) * 0.07
                              )}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Current supplements: {formatCurrency(
                              transferPayments.ni_funded_benefits.breakdown.pension_supplements.retirement_pension_supplement +
                              transferPayments.ni_funded_benefits.breakdown.pension_supplements.manx_pension_supplement
                            )} total (from JSON)
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Total Impact */}
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">Total Benefit Savings:</span>
                        <span className="text-lg font-bold text-green-600">
                          +{formatCurrency(benefitReformsImpact)}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Calculated from actual JSON data (spec's £9.3m claim includes impossible £1.8m Winter Bonus saving)
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
                      Capital Programme Adjustments
                    </CardTitle>
                    <CardDescription>
                      Defer projects, cut spending, or invest in priority areas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Project Deferrals */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        Project Deferrals (Max £20m total)
                      </h4>
                      <div className="max-h-60 overflow-y-auto border rounded-lg p-3 space-y-2">
                        {deferrableProjects.slice(0, 15).map(project => {
                          const isSelected = capitalAdjustments.selectedDeferrals.includes(project.id)
                          const totalDeferred = capitalAdjustments.selectedDeferrals.reduce((sum, id) => {
                            const p = deferrableProjects.find(proj => proj.id === id)
                            return sum + (p ? p.amount : 0)
                          }, 0)
                          const wouldExceedLimit = !isSelected && (totalDeferred + project.amount > 20000000)
                          
                          return (
                            <label 
                              key={project.id}
                              className={`flex items-center space-x-3 ${wouldExceedLimit ? 'opacity-50' : ''}`}
                            >
                              <Checkbox
                                checked={isSelected}
                                disabled={wouldExceedLimit}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setCapitalAdjustments({
                                      ...capitalAdjustments,
                                      selectedDeferrals: [...capitalAdjustments.selectedDeferrals, project.id]
                                    })
                                  } else {
                                    setCapitalAdjustments({
                                      ...capitalAdjustments,
                                      selectedDeferrals: capitalAdjustments.selectedDeferrals.filter(id => id !== project.id)
                                    })
                                  }
                                }}
                              />
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <span className="text-sm">{project.name}</span>
                                  <span className="text-sm font-semibold text-green-600">
                                    {formatCurrency(project.amount)}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">{project.department}</span>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        Total deferred: {formatCurrency(
                          capitalAdjustments.selectedDeferrals.reduce((sum, id) => {
                            const p = deferrableProjects.find(proj => proj.id === id)
                            return sum + (p ? p.amount : 0)
                          }, 0)
                        )} / £20m max
                      </div>
                    </div>

                    {/* Capital Cuts */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Capital Budget Cuts</h4>
                      <label className="flex items-start space-x-3">
                        <Checkbox
                          checked={capitalAdjustments.heritageRailCut}
                          onCheckedChange={(checked) => 
                            setCapitalAdjustments({...capitalAdjustments, heritageRailCut: checked as boolean})
                          }
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span>Cut Heritage Rail Capital Budget</span>
                            <span className="text-green-600 font-semibold">
                              +{formatCurrency(
                                capitalProgramme.projects_2025_26.rolling_schemes
                                  .by_department.DOI?.projects
                                  ?.find(p => p.name === "Heritage Rail Budget")?.amount || 0
                              )}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Eliminate capital investment in Heritage Railway
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* New Investments */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        New Capital Investments <span className="text-amber-600">(Requires Funding)</span>
                      </h4>
                      <div className="space-y-3">
                        <label className="flex items-start space-x-3">
                          <Checkbox
                            checked={capitalAdjustments.climateAcceleration}
                            onCheckedChange={(checked) => 
                              setCapitalAdjustments({...capitalAdjustments, climateAcceleration: checked as boolean})
                            }
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span>Accelerate Climate Action</span>
                              <span className="text-red-600 font-semibold">-£20m</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Climate Fund balance: {formatCurrency(
                                reservesFunds.internal_funds.funds
                                  .find(f => f.name === "Climate Change Fund")?.balance || 0
                              )}
                            </p>
                          </div>
                        </label>

                        <label className="flex items-start space-x-3">
                          <Checkbox
                            checked={capitalAdjustments.housingInvestment}
                            onCheckedChange={(checked) => 
                              setCapitalAdjustments({...capitalAdjustments, housingInvestment: checked as boolean})
                            }
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span>Emergency Housing Investment</span>
                              <span className="text-red-600 font-semibold">-£30m</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Housing Reserve: {formatCurrency(
                                reservesFunds.internal_funds.funds
                                  .find(f => f.name === "Housing Reserve Fund")?.balance || 0
                              )}
                            </p>
                            <p className="text-xs text-amber-600 mt-1">
                              ⚠️ Requires new funding source or borrowing
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Total Impact */}
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">Total Capital Impact:</span>
                        <span className={`text-lg font-bold ${capitalAdjustmentsImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {capitalAdjustmentsImpact >= 0 ? '+' : ''}{formatCurrency(Math.abs(capitalAdjustmentsImpact))}
                          {capitalAdjustmentsImpact >= 0 ? ' savings' : ' cost'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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