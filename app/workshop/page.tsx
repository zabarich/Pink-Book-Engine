'use client'

import { useState, useEffect, useMemo } from 'react'
import { DEPARTMENTS, REVENUE_STREAMS, INITIAL_STATE } from '@/lib/budget-data'
import { BudgetDataService } from '@/lib/services/budget-data-service'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import departmentBudgets from '@/data/source/department-budgets.json'
import capitalProgramme from '@/data/source/capital-programme.json'
import transferPayments from '@/data/source/transfer-payments.json'
import reservesFunds from '@/data/source/reserves-funds.json'
import policyTargets from '@/data/source/policy-targets.json'
import revenueStreams from '@/data/source/revenue-streams.json'
import { 
  Calculator,
  Save,
  RotateCcw,
  Download,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Sliders,
  PoundSterling,
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
import { SliderWithInput } from '@/components/ui/slider-with-input'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { BENEFITS_DATA, STATE_PENSION_DATA, calculateBenefitChanges, calculatePensionChanges } from '@/lib/calculations/benefits-calculations'

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
  const averageIncome = policyTargets.demographics.average_income
  const taxpayerCount = policyTargets.demographics.taxpayer_count
  
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
  // Scenario management
  const [scenarioName, setScenarioName] = useState('')
  const [userInitials, setUserInitials] = useState('')
  
  // Main tab state
  const [mainTab, setMainTab] = useState('workshop')
  
  // Income Tax Controls
  const [incomeTaxRate, setIncomeTaxRate] = useState(21) // Higher rate
  const [standardTaxRate, setStandardTaxRate] = useState(10)
  const [personalAllowance, setPersonalAllowance] = useState(policyTargets.demographics.personal_allowance) // 14750 from Pink Book 2025-26
  const [higherRateThreshold, setHigherRateThreshold] = useState(policyTargets.tax_calculations.tax_rates_baseline.income_tax_higher_threshold) // 21250 from Pink Book 2025-26
  
  // Tax Caps
  const [personalTaxCap, setPersonalTaxCap] = useState(220000) // NEEDS JSON MIGRATION
  const [jointTaxCap, setJointTaxCap] = useState(440000) // NEEDS JSON MIGRATION
  
  // Corporate Tax Controls
  const [corporateTaxRate, setCorporateTaxRate] = useState(policyTargets.tax_calculations.tax_rates_baseline.corporate_tax)
  const [retailerTaxRate, setRetailerTaxRate] = useState(20) // Large retailer rate - NEEDS JSON MIGRATION
  const [retailerThreshold, setRetailerThreshold] = useState(BudgetDataService.getThresholdsAndCaps.largeRetailerThreshold()) // Threshold for large retailer rate
  // Pillar 2 Tax is fixed by OECD agreement at 15% - no toggle needed
  
  // VAT & Customs
  const [vatRate, setVatRate] = useState(20)
  const [fersaRate, setFersaRate] = useState(4.35) // VAT sharing rate
  const [customsDutyRate, setCustomsDutyRate] = useState(0) // Import duty adjustment
  
  // National Insurance - Granular Controls
  const [niEmployeeRate, setNiEmployeeRate] = useState(11)
  const [niEmployerRate, setNiEmployerRate] = useState(12.8)
  const [niUpperLimit, setNiUpperLimit] = useState(policyTargets.tax_calculations.tax_rates_baseline.ni_upper_limit_annual) // 53664 from Pink Book 2025-26
  const [niLowerLimit, setNiLowerLimit] = useState(policyTargets.tax_calculations.tax_rates_baseline.ni_lower_limit_weekly) // 168 weekly from Pink Book 2025-26
  const [niSelfEmployedClass2, setNiSelfEmployedClass2] = useState(policyTargets.tax_calculations.tax_rates_baseline.ni_self_employed_class2_weekly) // 6.45 weekly from Pink Book 2025-26
  const [niSelfEmployedClass4, setNiSelfEmployedClass4] = useState(policyTargets.tax_calculations.tax_rates_baseline.ni_self_employed_class4) // 8% from Pink Book 2025-26
  
  // NHS Levy Controls
  const [nhsLevyRate, setNhsLevyRate] = useState(0) // NEEDS JSON MIGRATION
  const [nhsLevyFreeAmount, setNhsLevyFreeAmount] = useState(policyTargets.demographics.personal_allowance) // Use same as personal allowance
  const [nhsLevyIndividualCap, setNhsLevyIndividualCap] = useState(5000) // NEEDS JSON MIGRATION
  
  // New Revenue Sources
  const [touristAccommodationLevy, setTouristAccommodationLevy] = useState(0) // NEEDS JSON MIGRATION
  const [airportPassengerDuty, setAirportPassengerDuty] = useState(0) // NEEDS JSON MIGRATION
  const [onlineGamingDuty, setOnlineGamingDuty] = useState(0) // NEEDS JSON MIGRATION
  
  // Phase 2 New Revenue Controls
  const [pensionerNIEnabled, setPensionerNIEnabled] = useState(false)
  const [taxCapLevel, setTaxCapLevel] = useState(225000) // Current £225k cap
  const [generalFeesGrowth, setGeneralFeesGrowth] = useState(0) // Percentage growth from base
  
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
  
  // Phase 3: Macro-Level Controls
  const [publicSectorPayRate, setPublicSectorPayRate] = useState(3) // 3% embedded in baseline
  const [nonPayInflation, setNonPayInflation] = useState(1.5) // 1.5% embedded in baseline
  const [efficiencyTarget, setEfficiencyTarget] = useState(0) // £0 to £50m
  const [populationChange, setPopulationChange] = useState(0) // In hundreds of people
  const [meansTestedBenefits, setMeansTestedBenefits] = useState(false) // New toggle
  
  // REMOVED: Duplicate state variables - now using efficiencyMeasures object only
  
  // Strategic Policy Options
  const [targetReserveLevel, setTargetReserveLevel] = useState(2000) // Target in millions - NEEDS JSON MIGRATION
  const [annualDrawdownLimit, setAnnualDrawdownLimit] = useState(100) // Max annual withdrawal in millions - NEEDS JSON MIGRATION
  const [investmentStrategy, setInvestmentStrategy] = useState<'conservative' | 'balanced' | 'growth'>('balanced')
  
  // Pension Policy
  const [statePensionAge, setStatePensionAge] = useState(67) // Current age is 67 - NEEDS JSON MIGRATION
  const [tripleLockEnabled, setTripleLockEnabled] = useState(true) // Start at baseline enabled (4.1% increase embedded in budget)
  const [publicPensionContribution, setPublicPensionContribution] = useState(13.7) // Employee contribution rate
  
  // Capital Programme
  // Find 2026-27 capital budget from JSON data
  const capital2026_27 = capitalProgramme.five_year_programme.by_year.find(y => y.year === '2026-27')
  const [totalCapitalBudget, setTotalCapitalBudget] = useState(
    capital2026_27 ? capital2026_27.amount / 1000000 : 0
  ) // 2026-27 capital budget in millions
  const [borrowingEnabled, setBorrowingEnabled] = useState(false)
  const [borrowingLimit, setBorrowingLimit] = useState(0) // millions
  
  // Capital Programme Adjustments state (Phase 9)
  const [capitalAdjustments, setCapitalAdjustments] = useState({
    capitalGating: false,
    deferVillaMarina: false,
    deferRadcliffe: false,
    deferSecondaryWaste: false,
    deferAirfieldDrainage: false,
    deferBallacubbon: false,
    reduceDigitalFund: false,
    reduceClimateFund: false,
    heritageRailReduction: 0,
    deferLowBCR: 0,
    selectedDeferrals: [] as string[], // Array of project IDs to defer
    heritageRailCut: false, // Cut Heritage Rail capital budget
    climateAcceleration: false, // Accelerate climate spending (costs £20m)
    housingInvestment: false // Emergency housing investment (costs £30m)
  })

  // Advanced Options state (consolidated from separate page)
  const [advancedOptions, setAdvancedOptions] = useState({
    // Infrastructure Revenue
    airportCharge: 0,
    portDuesIncrease: 0,
    internalRentCharging: false,
    freeTransport: false,
    heritageRailDays: 7,
    
    // Revenue Sources
    airportDepartureTax: 13.50, // Current UK standard
    landRegistryNonResident: false, // 100% increase toggle
    companyRegistryFee: 380, // Current £380 fee
    
    // Transfer Reforms
    winterBonusRate: 400, // Current £400 rate
    winterBonusMeans: 'universal' as 'universal' | 'benefits' | 'age75',
    childBenefitThreshold: 0, // 0 means no means testing
    childBenefitTaper: 0,
    housingBenefitCap: 0,
    pensionAge: 67, // Current pension age 2026-27
    
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
    doiDeliveryRate: 70, // Default 70% delivery rate
    
    // Department Budget Adjustments (% changes)
    deptAdjustments: {
      health_social_care: 0,
      education_sport_culture: 0,
      infrastructure: 0,
      home_affairs: 0,
      treasury: 0,
      cabinet_office: 0,
      enterprise: 0,
      environment: 0,
      executive_government: 0,
      statutory_boards: 0,
      legislature: 0
    }
  })
  
  // Fixed to 2026-27 baseline as per requirements
  
  // Service Cuts state for ALL departments (Phase 5)
  const [serviceCuts, setServiceCuts] = useState({
    // All 12 departments from department-budgets.json - Now -10% to +5% range
    manxCare: 0, // -10% to +5% on £357.5m
    dhsc: 0, // -10% to +5% on £11.7m gross
    education: 0, // -10% to +5% on £149.8m
    treasury: 0, // -10% to +5% on £70m operational
    infrastructure: 0, // -10% to +5% on £118.5m
    homeAffairs: 0, // -10% to +5% on £42.6m
    cabinetOffice: 0, // -10% to +5% on £45m
    executive: 0, // -10% to +5% cuts
    defa: 0, // -10% to +5% cuts
    enterprise: 0, // -10% to +5% grant cuts
    statutory: 0, // -5% to +5% cuts
    legislature: 0, // -5% to +5% cuts
    // Specific service cuts
    heritageRail: false, // Reduce to 5 days operation
    busServices: false, // Cut services by 25%
    artsCouncil: false // 50% cut to arts funding
  })
  
  // Efficiency Measures (Phase 6)
  const [efficiencyMeasures, setEfficiencyMeasures] = useState({
    propertyRationalization: false, // £5m per annum
    procurementCentralization: false // £2m per annum (Centralised Contract Management)
  })
  
  // Revenue Generation state (Phase 7)
  const [revenueGeneration, setRevenueGeneration] = useState({
    touristLevyAmount: 0, // £0-10 per night
    airportDepartureTax: 13.50, // Current £13.50 value (not percentage)
    landRegistryNonResident: false, // 100% increase for non-residents (+£0.5m)
    companyRegistryFee: 380, // Current £380 fee, increase in £10 increments
    parkingCharges: false, // £1m new revenue
    planningFees: false, // £0.5m from 25% increase
    courtFees: false, // £0.5m from 20% increase
    vehicleRegistration: false, // £1.6m from 10% increase
    portDuesExtra: 0 // 0-30% additional increase
  })
  
  // Benefit Reforms state (Phase 8)
  const [benefitReforms, setBenefitReforms] = useState({
    winterBonusReduction: 0, // Reduce from £400 by this amount
    winterBonusMeansTest: 'universal' as 'universal' | 'benefits' | 'age75',
    childBenefitRestrict: false, // Restrict to households <£30k
    housingBenefitCapAmount: 0, // Cap at £X per month
    pensionSupplementTaper: false, // Taper for higher earners
    disabilityReview: false // £2m from tightening criteria
  })
  
  // Phase 5 & 10: Scenario management state
  const [savedScenarios, setSavedScenarios] = useState<any[]>([])
  const [comparisonScenario, setComparisonScenario] = useState<any>(null)
  
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
    bankingTaxRate: 0.15, // Fixed at 15% Pillar 2 rate
    retailerTaxRate: retailerTaxRate / 100,
    fersaRate: 0
  }
  
  const niRates = {
    employee: niEmployeeRate / 100,
    employer: niEmployerRate / 100
  }
  
  const immigrationTarget = 1000
  
  // Advanced policies no longer include tax changes to prevent double-counting
  
  // Calculate impact of service cuts
  const serviceCutsImpact = useMemo(() => {
    let expenditureChange = 0 // Can be positive or negative
    
    // Calculate impact for each department (negative = cuts, positive = increases)
    
    // Manx Care
    const manxCare = departmentBudgets.departments.find(d => d.code === 'MXC')
    if (manxCare) {
      expenditureChange -= manxCare.net_expenditure * (serviceCuts.manxCare / 100)
    }
    
    // DHSC
    const dhsc = departmentBudgets.departments.find(d => d.code === 'DHSC')
    if (dhsc) {
      expenditureChange -= dhsc.net_expenditure * (serviceCuts.dhsc / 100)
    }
    
    // Education
    const desc = departmentBudgets.departments.find(d => d.code === 'DESC')
    if (desc) {
      expenditureChange -= desc.net_expenditure * (serviceCuts.education / 100)
    }
    
    // Treasury operational (£70m)
    expenditureChange -= 70000000 * (serviceCuts.treasury / 100)
    
    // Infrastructure
    const doi = departmentBudgets.departments.find(d => d.code === 'DOI')
    if (doi) {
      expenditureChange -= doi.net_expenditure * (serviceCuts.infrastructure / 100)
    }
    
    // Home Affairs
    const dha = departmentBudgets.departments.find(d => d.code === 'DHA')
    if (dha) {
      expenditureChange -= dha.net_expenditure * (serviceCuts.homeAffairs / 100)
    }
    
    // Cabinet Office
    const co = departmentBudgets.departments.find(d => d.code === 'CO')
    if (co) {
      expenditureChange -= co.net_expenditure * (serviceCuts.cabinetOffice / 100)
    }
    
    // Enterprise
    const dfe = departmentBudgets.departments.find(d => d.code === 'DFE')
    if (dfe) {
      expenditureChange -= dfe.net_expenditure * (serviceCuts.enterprise / 100)
    }
    
    // DEFA
    const defa = departmentBudgets.departments.find(d => d.code === 'DEFA')
    if (defa) {
      expenditureChange -= defa.net_expenditure * (serviceCuts.defa / 100)
    }
    
    // Executive
    const exe = departmentBudgets.departments.find(d => d.code === 'EXE')
    if (exe) {
      expenditureChange -= exe.net_expenditure * (serviceCuts.executive / 100)
    }
    
    // Statutory Boards
    const sb = departmentBudgets.departments.find(d => d.code === 'SB')
    if (sb) {
      expenditureChange -= sb.net_expenditure * (serviceCuts.statutory / 100)
    }
    
    // Legislature
    const leg = departmentBudgets.departments.find(d => d.code === 'LEG')
    if (leg) {
      expenditureChange -= leg.net_expenditure * (serviceCuts.legislature / 100)
    }
    
    // Specific service cuts
    if (serviceCuts.heritageRail) {
      expenditureChange += 600000 // Save £600k
    }
    
    if (serviceCuts.busServices) {
      expenditureChange += 2800000 // Save £2.8m
    }
    
    if (serviceCuts.artsCouncil) {
      expenditureChange += 1500000 // Save £1.5m
    }
    
    return -expenditureChange // Return positive for cuts, negative for increases
  }, [serviceCuts]);

  // Pre-compute department display values to fix JSX parsing
  const departmentDisplayValues = useMemo(() => {
    const getValue = (code: string) => {
      const dept = departmentBudgets.departments.find(d => d.code === code)
      return dept?.net_expenditure || 0
    }
    
    const getServiceCutValue = (cutPercent: number, code: string) => {
      const baseBudget = getValue(code)
      return Math.abs(cutPercent * baseBudget / 100 / 1000000)
    }

    return {
      manxCare: {
        budget: (getValue('MXC') / 1000000).toFixed(1),
        impact: getServiceCutValue(serviceCuts.manxCare, 'MXC').toFixed(1)
      },
      education: {
        budget: (getValue('DESC') / 1000000).toFixed(1),
        impact: getServiceCutValue(serviceCuts.education, 'DESC').toFixed(1)
      },
      infrastructure: {
        budget: (getValue('DOI') / 1000000).toFixed(1),
        impact: getServiceCutValue(serviceCuts.infrastructure, 'DOI').toFixed(1)
      },
      homeAffairs: {
        budget: (getValue('DHA') / 1000000).toFixed(1),
        impact: getServiceCutValue(serviceCuts.homeAffairs, 'DHA').toFixed(1)
      },
      treasury: {
        budget: (getValue('TRY') / 1000000).toFixed(1),
        impact: getServiceCutValue(serviceCuts.treasury, 'TRY').toFixed(1)
      },
      cabinetOffice: {
        budget: (getValue('CO') / 1000000).toFixed(1),
        impact: getServiceCutValue(serviceCuts.cabinetOffice, 'CO').toFixed(1)
      },
      executive: {
        budget: (getValue('EXE') / 1000000).toFixed(1),
        impact: getServiceCutValue(serviceCuts.executive, 'EXE').toFixed(1)
      },
      defa: {
        budget: (getValue('DEFA') / 1000000).toFixed(1),
        impact: getServiceCutValue(serviceCuts.defa, 'DEFA').toFixed(1)
      },
      enterprise: {
        budget: (getValue('DFE') / 1000000).toFixed(1),
        impact: getServiceCutValue(serviceCuts.enterprise, 'DFE').toFixed(1)
      },
      statutory: {
        budget: (getValue('SB') / 1000000).toFixed(1),
        impact: getServiceCutValue(serviceCuts.statutory, 'SB').toFixed(1)
      },
      legislature: {
        budget: (getValue('LEG') / 1000000).toFixed(1),
        impact: getServiceCutValue(serviceCuts.legislature, 'LEG').toFixed(1)
      },
      dhsc: {
        budget: (getValue('DHSC') / 1000000).toFixed(1),
        impact: getServiceCutValue(serviceCuts.dhsc, 'DHSC').toFixed(1)
      }
    }
  }, [serviceCuts]);
  
  // Calculate impact of efficiency measures (Phase 6)
  const efficiencyImpact = useMemo(() => {
    let yearOneSavings = 0
    
    // Property Portfolio - £5m per annum
    if (efficiencyMeasures.propertyRationalization) {
      yearOneSavings += 5000000 // £5m per annum
    }
    
    // Centralised Contract Management - £2m per annum
    if (efficiencyMeasures.procurementCentralization) {
      yearOneSavings += 2000000 // £2m per annum
    }
    
    return yearOneSavings
  }, [efficiencyMeasures]);
  
  // Calculate impact of revenue generation (Phase 7)
  const revenueGenerationImpact = useMemo(() => {
    let additionalRevenue = 0
    
    // Tourist Accommodation Levy (moved from Basic Controls)
    // IoM Tourism: ~1.6m visitor nights
    const visitorNights = policyTargets.revenue_proposals.tourist_levy.visitor_nights
    additionalRevenue += revenueGeneration.touristLevyAmount * visitorNights
    
    // Airport Departure Tax (value-based, not percentage)
    // Calculate revenue from increase above base £13.50
    const airportTaxIncrease = Math.max(0, revenueGeneration.airportDepartureTax - 13.50)
    const annualPassengers = 800000 // Estimated annual passengers
    additionalRevenue += airportTaxIncrease * annualPassengers
    
    // Land Registry non-resident fee increase
    if (revenueGeneration.landRegistryNonResident) {
      additionalRevenue += 500000 // £0.5m from 100% increase for non-residents
    }
    
    // Company Registry fee increases
    const companyFeeIncrease = Math.max(0, revenueGeneration.companyRegistryFee - 380)
    const companiesPerYear = 2500 // Estimated annual registrations
    additionalRevenue += companyFeeIncrease * companiesPerYear
    
    if (revenueGeneration.parkingCharges) {
      additionalRevenue += 1000000 // £1m parking charges
    }
    
    // Fee increases (fixed amounts per spec)
    if (revenueGeneration.planningFees) {
      additionalRevenue += policyTargets.fee_increases.planning_fees.revenue // £0.5m from 25% increase
    }
    
    if (revenueGeneration.courtFees) {
      additionalRevenue += policyTargets.fee_increases.court_fees.revenue // £0.5m from 20% increase
    }
    
    if (revenueGeneration.vehicleRegistration) {
      additionalRevenue += 1600000 // £1.6m from 10% increase
    }
    
    return additionalRevenue
  }, [revenueGeneration]);
  
  // Calculate impact of benefit reforms (Phase 8)
  const benefitReformsImpact = useMemo(() => {
    let expenditureReduction = 0
    
    // Manx Pension Supplement - Currently managed through triple lock and pension age controls
    // Specific reductions can be added later if needed as separate policy controls
    
    // Child Benefit restriction to households <£30k
    if (benefitReforms.childBenefitRestrict) {
      // From JSON: child_benefit total
      const childBenefitTotal = transferPayments.revenue_funded_benefits.breakdown.child_benefit.amount
      // Restricting to <£30k households saves approximately 22% (affects ~2000 of 9000 families)
      expenditureReduction += childBenefitTotal * 0.22
    }
    
    // Housing Benefit cap (use capAmount > 0 to enable)
    if (benefitReforms.housingBenefitCapAmount > 0) {
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
    const projects: Array<{id: string, name: string, amount: number, department: string}> = []
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
    
    // DOI Delivery Rate adjustment - Apply ONLY to DOI Small Works (£30m)
    const doiSmallWorksBudget = 30000000 // £30m DOI small works budget
    const deliveryRate = advancedOptions.doiDeliveryRate / 100
    const deliverySavings = doiSmallWorksBudget * (1 - deliveryRate)
    impact += deliverySavings
    
    // DOI Small Works additional deferrals
    impact += advancedOptions.deferLowBCR
    
    // Add up deferred projects from Basic Controls (positive = savings)
    impact += capitalAdjustments.selectedDeferrals.reduce((sum, projectId) => {
      const project = deferrableProjects.find(p => p.id === projectId)
      return sum + (project ? project.amount : 0)
    }, 0)
    
    // Heritage Rail capital cut
    if (capitalAdjustments.heritageRailCut) {
      impact += 2000000 // £2m saving from heritage rail capital reduction
    }
    
    // Housing investment (costs money - negative impact)
    if (capitalAdjustments.housingInvestment) {
      impact -= 30000000 // Policy target for emergency housing investment
    }
    
    return impact
  }, [capitalAdjustments, deferrableProjects, advancedOptions.doiDeliveryRate, advancedOptions.deferLowBCR])
  
  // Calculations
  const [results, setResults] = useState({
    revenue: INITIAL_STATE.revenue.total,
    expenditure: INITIAL_STATE.expenditure.total,
    balance: INITIAL_STATE.balance.surplus,
    warnings: [] as string[],
    sustainabilityScore: 100
  })
  
  // Phase 10: Save current scenario
  const saveScenario = (nameOverride?: string) => {
    const name = nameOverride || scenarioName
    if (!name || !name.trim()) {
      alert('Please enter a scenario name')
      return
    }
    
    const scenario = {
      name: name,
      created_by: userInitials || 'Unknown', // Phase 5: Track authorship
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
  const loadScenario = (scenario: any) => {
    const { state } = scenario
    // Load tax rates
    if (state.taxRates) {
      setPersonalAllowance(state.taxRates.personalAllowance)
      setStandardTaxRate(state.taxRates.lowerRate * 100)
      setIncomeTaxRate(state.taxRates.higherRate * 100)
      setVatRate(state.taxRates.vatRate * 100)
      // Banking tax fixed at 15% Pillar 2 rate
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
      ['Scenario Name:', scenarioName || 'Unsaved Scenario'],
      ['Created By:', userInitials || 'Unknown'],
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
      ['Arts Council', serviceCuts.artsCouncil ? 'Yes' : 'No'],
      ['Bus Services', serviceCuts.busServices ? 'Yes' : 'No'],
      ['Heritage Railway', serviceCuts.heritageRail ? 'Yes' : 'No'],
      ['Manx Care Cuts', `${serviceCuts.manxCare}%`],
      ['Education Cuts', `${serviceCuts.education}%`],
      [''],
      ['EFFICIENCY SAVINGS'],
      ['Property Rationalization', efficiencyMeasures.propertyRationalization ? 'Yes' : 'No'],
      ['Centralised Contract Management', efficiencyMeasures.procurementCentralization ? 'Yes' : 'No'],
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
    
    // Phase 4: Check for double-counting conflicts
    if (efficiencyTarget > 0 && 
        (efficiencyMeasures.propertyRationalization || efficiencyMeasures.procurementCentralization)) {
      warnings.push('⚠️ Basic Efficiency Target overrides Advanced Efficiency Measures - only Basic applied')
    }
    
    // ACCURATE Income tax calculations - NO ARBITRARY MULTIPLIERS
    const standardRateChange = standardTaxRate - 10 // Change from 10% base
    const higherRateChange = incomeTaxRate - 21 // Change from 21% base
    
    // Import accurate calculation functions
    const { calculateIncomeTaxChange, calculatePersonalAllowanceChange, calculateNIChange, calculateCorporateTaxChange, calculateVATChange } = 
      require('@/lib/calculations/tax-calculations')
    
    // Apply accurate income tax calculation
    const incomeTaxImpact = calculateIncomeTaxChange(standardRateChange, higherRateChange)
    newRevenue += incomeTaxImpact
    
    // Apply personal allowance calculation
    const personalAllowanceImpact = calculatePersonalAllowanceChange(personalAllowance)
    newRevenue += personalAllowanceImpact
    
    // Apply behavioral response for high rates
    if (incomeTaxRate > 30) {
      warnings.push('High income tax rates may cause behavioral changes')
    }
    
    // ACCURATE Corporate tax calculation
    const corporateTaxImpact = calculateCorporateTaxChange(15, retailerTaxRate) // 15% fixed Pillar 2 rate
    newRevenue += corporateTaxImpact
    
    if (retailerTaxRate > 25) warnings.push('High retail tax may affect large retailers')
    
    // ACCURATE VAT calculation with proper FERSA adjustment
    const vatImpact = calculateVATChange(vatRate)
    newRevenue += vatImpact
    
    // ACCURATE NI calculation with proper employer/employee split
    const niEmployeeChange = niEmployeeRate - 11
    const niEmployerChange = niEmployerRate - 12.8
    const niImpact = calculateNIChange(niEmployeeChange, niEmployerChange)
    newRevenue += niImpact
    
    // Pillar 2 Tax (OECD Minimum Tax) - REMOVED: Already included in baseline
    // Pillar 2 is fixed by OECD agreement and included in 2026-27 baseline revenue
    // No additional calculation needed as it's not a policy choice
    
    // NHS Levy
    const nhsLevyResult = calculateNHSLevy(nhsLevyRate, nhsLevyFreeAmount, nhsLevyIndividualCap)
    newRevenue += nhsLevyResult.revenue
    
    // Phase 2 New Revenue Controls
    // Pensioner NI Contributions
    if (pensionerNIEnabled) {
      newRevenue += policyTargets.revenue_proposals.pensioner_ni.revenue
    }
    
    // Tax Cap Level adjustment (new registrations only)
    const taxCapBaseline = policyTargets.revenue_proposals.tax_cap.current_level
    const taxCapIncrement = policyTargets.revenue_proposals.tax_cap.increment
    const taxCapRevenuePerIncrement = policyTargets.revenue_proposals.tax_cap.revenue_per_increment
    const taxCapImpact = Math.max(0, (taxCapLevel - taxCapBaseline) / taxCapIncrement * taxCapRevenuePerIncrement)
    newRevenue += taxCapImpact
    
    // General Fees & Charges growth
    const feesBase = revenueStreams.revenue_2026_27.departmental_fees
    const feesGrowthImpact = feesBase * (generalFeesGrowth / 100)
    newRevenue += feesGrowthImpact
    
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
    
    // Tax changes are now only in Basic Controls to prevent double-counting
    
    // Revenue generation impact (Phase 7)
    newRevenue += revenueGenerationImpact
    
    // Service cuts impact
    newExpenditure -= serviceCutsImpact
    
    // Efficiency savings impact - ONLY apply Advanced efficiency if Basic is zero
    // This prevents double-counting between Basic and Advanced tabs
    if (efficiencyTarget === 0) {
      // Only apply Advanced efficiency measures if Basic efficiency target is not set
      newExpenditure -= efficiencyImpact
    }
    
    // Benefit reforms impact (Phase 8)
    newExpenditure -= benefitReformsImpact
    
    // REMOVED: Capital adjustments should not affect revenue expenditure
    // Capital programme is separate from revenue budget
    
    // Expenditure adjustments (already initialized from baseline above)
    
    // COMMENTED OUT: Old department-by-department adjustments replaced by macro controls
    // DEPARTMENTS.forEach(dept => {
    //   const adjustment = deptAdjustments[dept.name] || 0
    //   newExpenditure += dept.budget * (adjustment / 100)
    //   if (adjustment < -15) {
    //     warnings.push(`${dept.name} cut may affect service quality`)
    //   }
    // })
    
    // COMMENTED OUT: Old public sector pay calculation replaced by macro control
    // const payBill = BudgetDataService.getExpenditure.employeeCosts()
    // const payIncrease = publicSectorPay === 'freeze' ? 0 : 
    //                    publicSectorPay === '1%' ? 0.01 :
    //                    publicSectorPay === '2%' ? 0.02 : 0.03
    // newExpenditure += payBill * payIncrease
    
    // Phase 3 Macro Controls Impact
    // Public Sector Pay (3% is baseline)
    const payImpact = (publicSectorPayRate - 3) * policyTargets.pay_assumptions.cost_per_percent_2026_27
    newExpenditure += payImpact
    
    // Non-Pay Inflation (1.5% is baseline)
    const nonPayBase = baseline.baselineExpenditure.total - policyTargets.pay_assumptions.cost_per_percent_2026_27 * 3
    const nonPayImpact = nonPayBase * ((nonPayInflation - 1.5) / 100)
    newExpenditure += nonPayImpact
    
    // Efficiency Target
    newExpenditure -= efficiencyTarget * 1000000
    
    // Population Assumptions (£1m per 100 people)
    const populationImpact = populationChange * 1000000
    newExpenditure += populationImpact
    
    // Means-Tested Benefits
    if (meansTestedBenefits) {
      newExpenditure -= 10000000 // £10m saving - NEEDS JSON MIGRATION
    }
    
    // REMOVED: Pension age savings handled by calculatePensionChanges to avoid double-counting
    
    // REMOVED: Capital budget should NOT be mixed with revenue expenditure
    // Capital is tracked separately and does not affect revenue expenditure
    
    // ACCURATE Pension policy impacts - NO ROUGH ESTIMATES
    const { calculatePensionChanges, calculateBenefitChanges, calculatePayBillChange } = 
      require('@/lib/calculations/benefits-calculations')
    
    // Calculate pension changes accurately
    const pensionOptions = {
      modifyTripleLock: !tripleLockEnabled,
      newTripleLockRate: tripleLockEnabled ? 4.1 : 2.5, // Reduce to 2.5% if disabled
      retirementAgeIncrease: statePensionAge > 67 ? statePensionAge - 67 : 0
    }
    const pensionImpact = calculatePensionChanges(pensionOptions)
    newExpenditure += pensionImpact // Note: negative values reduce expenditure
    
    // Pillar 2 Tax is fixed by OECD agreement - no toggle needed
    // The £25m is already included in the baseline revenue calculation
    
    // Vehicle Duty adjustments will be calculated when advanced options are implemented
    
    // REMOVED: Pension age savings already handled by calculatePensionChanges above
    
    // Debug logging to diagnose calculation issues
    console.log('=== BUDGET CALCULATION DEBUG ===')
    console.log('Baseline Revenue:', baseline.baselineRevenue.total.toLocaleString())
    console.log('Baseline Expenditure:', baseline.baselineExpenditure.total.toLocaleString())
    console.log('Service Cuts Impact:', serviceCutsImpact.toLocaleString())
    console.log('Efficiency Impact:', efficiencyImpact.toLocaleString())
    console.log('Benefit Reforms Impact:', benefitReformsImpact.toLocaleString())
    console.log('Capital Adjustments Impact:', capitalAdjustmentsImpact.toLocaleString())
    console.log('Final Revenue:', newRevenue.toLocaleString())
    console.log('Final Expenditure:', newExpenditure.toLocaleString())
    console.log('Balance:', (newRevenue - newExpenditure).toLocaleString())
    
    setResults({
      revenue: newRevenue,
      expenditure: newExpenditure,
      balance: newRevenue - newExpenditure,
      warnings,
      sustainabilityScore: Math.max(0, Math.min(100, 
        100 * (1 + (newRevenue - newExpenditure) / Math.max(1, Math.abs(INITIAL_STATE.balance.reserves)))
      ))
    })
  }, [
    incomeTaxRate, standardTaxRate, corporateTaxRate, vatRate,
    niEmployeeRate, niEmployerRate, nhsLevyRate, nhsLevyFreeAmount,
    nhsLevyIndividualCap, touristAccommodationLevy, airportPassengerDuty,
    onlineGamingDuty, deptAdjustments,
    efficiencyMeasures, publicSectorPayRate, nonPayInflation, efficiencyTarget,
    populationChange, meansTestedBenefits, pensionerNIEnabled, taxCapLevel, generalFeesGrowth,
    personalAllowance, higherRateThreshold, personalTaxCap,
    retailerTaxRate, fersaRate, totalCapitalBudget,
    tripleLockEnabled, statePensionAge, serviceCutsImpact,
    efficiencyImpact, revenueGenerationImpact, benefitReformsImpact, capitalAdjustmentsImpact
  ])
  
  // Save scenario handler
  const handleSaveScenario = () => {
    const { saveScenario } = require('@/lib/calculations/scenario-management')
    
    const scenarioName = prompt('Enter scenario name:')
    if (!scenarioName) return
    
    const scenarioData = {
      name: scenarioName,
      created_by: userInitials || 'Unknown', // Phase 5: Include user initials // In production, get from user context
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
          banking_rate: 15, // Fixed Pillar 2 rate
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
          property_rationalization: efficiencyMeasures.propertyRationalization ? 5000000 : 0,
          procurement_centralization: efficiencyMeasures.procurementCentralization ? 2000000 : 0
        },
        pay_policy: publicSectorPayRate,
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
      created_by: userInitials || 'Unknown', // Phase 5: Include user initials
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
          banking_rate: 15, // Fixed Pillar 2 rate
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
          property_rationalization: efficiencyMeasures.propertyRationalization ? 5000000 : 0,
          procurement_centralization: efficiencyMeasures.procurementCentralization ? 2000000 : 0
        },
        pay_policy: publicSectorPayRate,
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
    // Basic Controls - Revenue
    setIncomeTaxRate(21)
    setStandardTaxRate(10)
    setPersonalAllowance(policyTargets.demographics.personal_allowance)
    setHigherRateThreshold(policyTargets.tax_calculations.tax_rates_baseline.income_tax_higher_threshold)
    setPersonalTaxCap(220000)
    setJointTaxCap(440000)
    setCorporateTaxRate(policyTargets.tax_calculations.tax_rates_baseline.corporate_tax)
    setRetailerTaxRate(20)
    // Pillar 2 is fixed by OECD agreement - no toggle to reset
    setVatRate(20)
    setFersaRate(4.35)
    setCustomsDutyRate(0)
    setNiEmployeeRate(11)
    setNiEmployerRate(12.8)
    setNiUpperLimit(policyTargets.tax_calculations.tax_rates_baseline.ni_upper_limit_annual)
    setNiLowerLimit(policyTargets.tax_calculations.tax_rates_baseline.ni_lower_limit_weekly)
    setNiSelfEmployedClass2(policyTargets.tax_calculations.tax_rates_baseline.ni_self_employed_class2_weekly)
    setNiSelfEmployedClass4(policyTargets.tax_calculations.tax_rates_baseline.ni_self_employed_class4)
    setNhsLevyRate(0)
    setNhsLevyFreeAmount(policyTargets.demographics.personal_allowance)
    setNhsLevyIndividualCap(5000)
    setTouristAccommodationLevy(0)
    setAirportPassengerDuty(0)
    setOnlineGamingDuty(0)
    setPensionerNIEnabled(false)
    setTaxCapLevel(225000)
    setGeneralFeesGrowth(0)
    
    // Basic Controls - Expenditure
    setPublicSectorPayRate(3)
    setNonPayInflation(1.5)
    setEfficiencyTarget(0)
    setPopulationChange(0)
    setMeansTestedBenefits(false)
    setStatePensionAge(67)
    setTripleLockEnabled(true)
    setPublicPensionContribution(13.7)
    // Use 2026-27 capital budget from JSON
    const capital2026_27Budget = capitalProgramme.five_year_programme.by_year.find(y => y.year === '2026-27')
    setTotalCapitalBudget(capital2026_27Budget ? capital2026_27Budget.amount / 1000000 : 87.4)
    setBorrowingEnabled(false)
    setBorrowingLimit(0)
    
    // Efficiency measures reset
    setEfficiencyMeasures({
      propertyRationalization: false,
      procurementCentralization: false
    })
    
    // Department adjustments
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
    
    // Reserve Management
    setTargetReserveLevel(2000)
    setAnnualDrawdownLimit(100)
    setInvestmentStrategy('balanced')
    
    // Capital Adjustments
    setCapitalAdjustments({
      capitalGating: false,
      deferVillaMarina: false,
      deferRadcliffe: false,
      deferSecondaryWaste: false,
      deferAirfieldDrainage: false,
      deferBallacubbon: false,
      reduceDigitalFund: false,
      reduceClimateFund: false,
      heritageRailReduction: 0,
      deferLowBCR: 0,
      selectedDeferrals: [],
      heritageRailCut: false,
      climateAcceleration: false,
      housingInvestment: false
    })
    
    // Advanced Options
    setAdvancedOptions({
      airportCharge: 0,
      portDuesIncrease: 0,
      internalRentCharging: false,
      freeTransport: false,
      heritageRailDays: 7,
      airportDepartureTax: 13.50,
      landRegistryNonResident: false,
      companyRegistryFee: 380,
      winterBonusRate: 400,
      winterBonusMeans: 'universal',
      childBenefitThreshold: 0,
      childBenefitTaper: 0,
      housingBenefitCap: 0,
      pensionAge: 67,
      cabinetEfficiency: 0,
      enterpriseGrants: 0,
      publicSectorPay: '2%',
      generalFeesUplift: 0,
      targetedRecovery: [],
      capitalGating: false,
      deferLowBCR: 0,
      doiDeliveryRate: 70,
      deptAdjustments: {
        health_social_care: 0,
        education_sport_culture: 0,
        infrastructure: 0,
        home_affairs: 0,
        treasury: 0,
        cabinet_office: 0,
        enterprise: 0,
        environment: 0,
        executive_government: 0,
        statutory_boards: 0,
        legislature: 0
      }
    })
    
    // Service Cuts / Department Budgets
    setServiceCuts({
      manxCare: 0,
      dhsc: 0,
      education: 0,
      treasury: 0,
      infrastructure: 0,
      homeAffairs: 0,
      cabinetOffice: 0,
      executive: 0,
      defa: 0,
      enterprise: 0,
      statutory: 0,
      legislature: 0,
      heritageRail: false,
      busServices: false,
      artsCouncil: false
    })
    
    // Efficiency Measures
    setEfficiencyMeasures({
      propertyRationalization: false,
      procurementCentralization: false
    })
    
    // Revenue Generation
    setRevenueGeneration({
      touristLevyAmount: 0,
      airportDepartureTax: 13.50,
      landRegistryNonResident: false,
      companyRegistryFee: 380,
      parkingCharges: false,
      planningFees: false,
      courtFees: false,
      vehicleRegistration: false,
      portDuesExtra: 0
    })
    
    // Benefit Reforms
    setBenefitReforms({
      winterBonusReduction: 0,
      winterBonusMeansTest: 'universal',
      childBenefitRestrict: false,
      pensionSupplementTaper: false,
      disabilityReview: false,
      housingBenefitCapAmount: 0
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
              {/* Scenario Name Field */}
              <div className="flex items-center gap-2">
                <Label htmlFor="scenarioName" className="text-sm text-gray-600">Scenario:</Label>
                <Input
                  id="scenarioName"
                  placeholder="Enter scenario name"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  className="w-32 h-8 text-xs"
                />
              </div>
              {/* User Initials Field */}
              <div className="flex items-center gap-2">
                <Label htmlFor="userInitials" className="text-sm text-gray-600">Your Initials:</Label>
                <Input
                  id="userInitials"
                  type="text"
                  placeholder="e.g., JD"
                  value={userInitials}
                  onChange={(e) => setUserInitials(e.target.value.toUpperCase().slice(0, 4))}
                  className="w-20 h-8 text-sm"
                />
              </div>
              <div className="w-px h-8 bg-gray-300" />
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
              {/* Overall Net Balance */}
              <div className="border-r pr-8">
                <span className="text-sm text-gray-500">Overall Net Balance</span>
                <p className={`font-bold text-xl ${(results.revenue - results.expenditure) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(results.revenue - results.expenditure)}
                </p>
              </div>
              {/* Change from Base Case */}
              <div className="border-r pr-8">
                <span className="text-sm text-gray-500">Change from Base Case</span>
                <p className={`font-bold text-xl ${((results.revenue - results.expenditure) - (INITIAL_STATE.revenue.total - INITIAL_STATE.expenditure.total)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {((results.revenue - results.expenditure) - (INITIAL_STATE.revenue.total - INITIAL_STATE.expenditure.total)) >= 0 ? '+' : ''}
                  {formatCurrency((results.revenue - results.expenditure) - (INITIAL_STATE.revenue.total - INITIAL_STATE.expenditure.total))}
                </p>
              </div>
              {/* Revenue */}
              <div>
                <span className="text-sm text-gray-500">Revenue</span>
                <p className="font-semibold text-lg">{formatCurrency(results.revenue)}</p>
                <p className={`text-xs ${results.revenue > INITIAL_STATE.revenue.total ? 'text-green-600' : 'text-red-600'}`}>
                  {results.revenue > INITIAL_STATE.revenue.total ? '+' : ''}
                  {formatCurrency(results.revenue - INITIAL_STATE.revenue.total)}
                </p>
              </div>
              {/* Expenditure */}
              <div>
                <span className="text-sm text-gray-500">Expenditure</span>
                <p className="font-semibold text-lg">{formatCurrency(results.expenditure)}</p>
                <p className={`text-xs ${results.expenditure < INITIAL_STATE.expenditure.total ? 'text-green-600' : 'text-red-600'}`}>
                  {results.expenditure > INITIAL_STATE.expenditure.total ? '+' : ''}
                  {formatCurrency(results.expenditure - INITIAL_STATE.expenditure.total)}
                </p>
              </div>
            </div>
            {/* Reserve Levels Display */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-sm text-gray-500">Reserve Level</span>
                <p className={`font-semibold text-lg ${2000 >= 2000 ? 'text-green-600' : 'text-orange-600'}`}>
                  £2.0bn
                </p>
                <p className="text-xs text-gray-500">
                  Target: £2.0bn minimum
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 hidden">
                <div className="px-3 py-2 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-500">Overall Net Balance</span>
                  <p className={`font-bold text-lg ${results.balance > 0 ? 'text-green-600' : 'text-red-600'}`}>
{formatCurrency(results.balance)}
                  </p>
                  <p className="text-xs text-gray-400">2026-27 Position</p>
                </div>
                <div className="px-3 py-2 bg-blue-50 rounded-lg">
                  <span className="text-xs text-gray-500">Change from Base</span>
                  <p className={`font-bold text-lg ${(results.balance - INITIAL_STATE.balance.surplus) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
{(results.balance - INITIAL_STATE.balance.surplus) >= 0 ? '+' : ''}{formatCurrency(Math.abs(results.balance - INITIAL_STATE.balance.surplus))}
                  </p>
                  <p className="text-xs text-gray-400">Policy Impact</p>
                </div>
              </div>
              
              {/* Reserve Position Indicator */}
              <div className={`px-3 py-2 rounded-lg border ${
                (reservesFunds.general_reserve.balance + reservesFunds.ni_fund.balance_2025_26) < 2200000000 
                  ? 'border-amber-500 bg-amber-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <span className="text-xs text-gray-500">Reserve Position</span>
                <p className="font-semibold text-lg">
                  £{((reservesFunds.general_reserve.balance + reservesFunds.ni_fund.balance_2025_26) / 1000000000).toFixed(2)}bn
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        (reservesFunds.general_reserve.balance + reservesFunds.ni_fund.balance_2025_26) < 2200000000
                          ? 'bg-amber-500'
                          : 'bg-green-500'
                      }`}
                      style={{
                        width: `${Math.min(100, ((reservesFunds.general_reserve.balance + reservesFunds.ni_fund.balance_2025_26) / 2000000000) * 100)}%`
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">Min: £2.0bn</span>
                </div>
                {(reservesFunds.general_reserve.balance + reservesFunds.ni_fund.balance_2025_26) < 2200000000 && (
                  <p className="text-xs text-amber-600 mt-1">⚠️ Approaching minimum target</p>
                )}
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
                    <PoundSterling className="h-5 w-5" />
                    Revenue Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Income Tax Controls - Reordered per requirements */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700">Income Tax</h4>
                    
                    {/* 1. Personal Allowance */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Label>Personal Allowance</Label>
                          <StatusBadge status="existing" />
                        </div>
                      </div>
                      <SliderWithInput
                        value={personalAllowance}
                        onChange={setPersonalAllowance}
                        min={10000}
                        max={20000}
                        step={500}
                        suffix="£"
                      />
                      <p className="text-xs text-gray-500 mt-1">Base: £{policyTargets.demographics.personal_allowance.toLocaleString()} | Change: {formatCurrency(personalAllowance - policyTargets.demographics.personal_allowance)}</p>
                    </div>
                    
                    {/* 2. Standard Rate */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Label>Income Tax - Standard Rate</Label>
                          <StatusBadge status="existing" />
                        </div>
                      </div>
                      <SliderWithInput
                        value={standardTaxRate}
                        onChange={setStandardTaxRate}
                        min={5}
                        max={20}
                        step={1}
                        suffix="%"
                      />
                      <p className="text-xs text-gray-500 mt-1">Base: 10% | Revenue impact: {formatCurrency((standardTaxRate - 10) * 16.5 * 1000000)}</p>
                    </div>
                    
                    {/* 3. Higher Rate */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Label>Income Tax - Higher Rate</Label>
                          <StatusBadge status="existing" />
                        </div>
                      </div>
                      <SliderWithInput
                        value={incomeTaxRate}
                        onChange={setIncomeTaxRate}
                        min={15}
                        max={35}
                        step={1}
                        suffix="%"
                      />
                      <p className="text-xs text-gray-500 mt-1">Base: 21% | Revenue impact: {formatCurrency((incomeTaxRate - 21) * 7.9 * 1000000)}</p>
                    </div>
                    
                    {/* 4. NHS Levy - Moved from separate section */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Label>NHS Levy</Label>
                          <StatusBadge status="consultation" />
                          <InfoTooltip text="Currently under public consultation. Would require new legislation." />
                        </div>
                      </div>
                      <SliderWithInput
                        value={nhsLevyRate}
                        onChange={setNhsLevyRate}
                        min={0}
                        max={5}
                        step={0.5}
                        suffix="%"
                      />
                      {nhsLevyRate > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          Revenue: {formatCurrency(calculateNHSLevy(nhsLevyRate, nhsLevyFreeAmount, nhsLevyIndividualCap).revenue)}
                        </p>
                      )}
                    </div>
                    
                    {/* Tax Cap Level - New control */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Label>Tax Cap Level</Label>
                          <StatusBadge status="proposed" />
                          <InfoTooltip text="Maximum tax payable per person. Affects new registrations only." />
                        </div>
                      </div>
                      <SliderWithInput
                        value={taxCapLevel}
                        onChange={setTaxCapLevel}
                        min={150000}
                        max={500000}
                        step={25000}
                        suffix="£"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Base: £{policyTargets.revenue_proposals.tax_cap.current_level.toLocaleString()} | 
                        Revenue impact: {formatCurrency(Math.max(0, (taxCapLevel - policyTargets.revenue_proposals.tax_cap.current_level) / policyTargets.revenue_proposals.tax_cap.increment * policyTargets.revenue_proposals.tax_cap.revenue_per_increment))}
                      </p>
                    </div>
                  </div>
                  
                  {/* VAT - Greyed out */}
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700">VAT & Customs</h4>
                    
                    <div className="opacity-50">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Label>VAT Rate</Label>
                          <StatusBadge status="existing" />
                          <Badge variant="outline" className="text-xs">Fixed with UK</Badge>
                        </div>
                      </div>
                      <Slider
                        value={[20]}
                        disabled={true}
                        min={15}
                        max={25}
                        step={0.5}
                      />
                      <p className="text-xs text-gray-500 mt-1">Fixed at 20% - UK aligned (cannot be changed independently)</p>
                    </div>
                  </div>
                  
                  {/* National Insurance */}
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700">National Insurance</h4>
                    
                    {/* NI Employee Rate */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Label>NI Employee Rate</Label>
                          <StatusBadge status="existing" />
                        </div>
                      </div>
                      <SliderWithInput
                        value={niEmployeeRate}
                        onChange={setNiEmployeeRate}
                        min={10}
                        max={13}
                        step={0.5}
                        suffix="%"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Base: 11% | Revenue impact: {formatCurrency((niEmployeeRate - 11) * 16.5 * 1000000)}
                      </p>
                    </div>
                    
                    {/* NI Employer Rate */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Label>NI Employer Rate</Label>
                          <StatusBadge status="existing" />
                        </div>
                      </div>
                      <SliderWithInput
                        value={niEmployerRate}
                        onChange={setNiEmployerRate}
                        min={11}
                        max={15}
                        step={0.2}
                        suffix="%"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Base: 12.8% | Revenue impact: {formatCurrency((niEmployerRate - 12.8) * 13 * 1000000)}
                      </p>
                    </div>
                    
                    {/* Pensioner NI Contributions - New control */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="pensionerNI">Pensioner NI Contributions</Label>
                        <StatusBadge status="proposed" />
                        <InfoTooltip text="Introduce NI contributions for working pensioners. Estimated £5m revenue." />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-green-600">
                          {pensionerNIEnabled ? `+£${(policyTargets.revenue_proposals.pensioner_ni.revenue / 1000000).toFixed(0)}m` : '£0'}
                        </span>
                        <Switch
                          id="pensionerNI"
                          checked={pensionerNIEnabled}
                          onCheckedChange={setPensionerNIEnabled}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* General Fees & Charges - New section */}
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700">Fees & Charges</h4>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Label>General Fees & Charges Growth</Label>
                          <StatusBadge status="proposed" />
                          <InfoTooltip text="Percentage increase across all government fees and charges." />
                        </div>
                      </div>
                      <SliderWithInput
                        value={generalFeesGrowth}
                        onChange={setGeneralFeesGrowth}
                        min={-5}
                        max={10}
                        step={0.5}
                        suffix="%"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Base: £{(revenueStreams.revenue_2026_27.departmental_fees / 1000000).toFixed(1)}m | 
                        Revenue impact: {formatCurrency(revenueStreams.revenue_2026_27.departmental_fees * (generalFeesGrowth / 100))}
                      </p>
                    </div>
                  </div>
                  
                  {/* New Revenue Sources */}
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700">New Revenue Sources</h4>
                    
                    {/* Pillar 2 Tax - Fixed by OECD Agreement */}
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Label>Pillar 2 Tax (OECD Minimum)</Label>
                        <StatusBadge status="existing" />
                        <InfoTooltip text="OECD minimum tax (15%) fixed by international agreement. Already included in baseline revenue." />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">
                          £25m (Fixed)
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                          OECD Agreement
                        </span>
                      </div>
                    </div>
                    
                  </div>
                </CardContent>
              </Card>
              
              {/* Expenditure Controls - Phase 3 Macro Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Expenditure Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Welfare & Benefits - Top Priority Position */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700">Welfare & Benefits</h4>
                    
                    {/* Pension Age Toggle */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="pensionAge">State Pension Age</Label>
                        <StatusBadge status="proposed" />
                        <InfoTooltip text="Current age is 67. Raising to 68 saves £15m annually" />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">Age:</span>
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
                          {statePensionAge === 68 ? `Saves £${(policyTargets.benefit_reforms.pension_age_68_saving / 1000000).toFixed(0)}m` : 'Baseline'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Means-Tested Benefits Toggle */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="meansTested">Introduce Enhanced Means Testing</Label>
                        <StatusBadge status="proposed" />
                        <InfoTooltip text="Apply stricter means testing to benefits. Saves £10m annually" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-green-600">
                          {meansTestedBenefits ? 'Saves £10m' : 'Disabled'}
                        </span>
                        <Switch
                          id="meansTested"
                          checked={meansTestedBenefits}
                          onCheckedChange={setMeansTestedBenefits}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Macro-Level Controls */}
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700">Macro Controls</h4>
                    
                    {/* Public Sector Pay */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Label>Public Sector Pay</Label>
                          <StatusBadge status="existing" />
                        </div>
                      </div>
                      <SliderWithInput
                        value={publicSectorPayRate}
                        onChange={setPublicSectorPayRate}
                        min={0}
                        max={5}
                        step={0.5}
                        suffix="%"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Base: £{(policyTargets.pay_assumptions.cost_per_percent_2026_27 * 3 / 1000000).toFixed(1)}m (3% default) | 
                        Impact: {formatCurrency((publicSectorPayRate - 3) * policyTargets.pay_assumptions.cost_per_percent_2026_27)}
                      </p>
                    </div>
                    
                    {/* Non-Pay Inflation */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Label>Non-Pay Inflation</Label>
                          <StatusBadge status="existing" />
                        </div>
                      </div>
                      <SliderWithInput
                        value={nonPayInflation}
                        onChange={setNonPayInflation}
                        min={0}
                        max={3}
                        step={0.25}
                        suffix="%"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Base: 1.5% | Impact on non-pay expenditure
                      </p>
                    </div>
                    
                    {/* Efficiency Target */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Label>Efficiency Target</Label>
                          <StatusBadge status="proposed" />
                        </div>
                      </div>
                      <SliderWithInput
                        value={efficiencyTarget}
                        onChange={setEfficiencyTarget}
                        min={0}
                        max={50}
                        step={5}
                        suffix="m"
                        formatValue={(v) => v.toString()}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Applied across all departments | Saves: £{efficiencyTarget}m
                      </p>
                    </div>
                  </div>
                  
                  {/* Population Assumptions */}
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700">Population Assumptions</h4>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Label>Population Change</Label>
                          <StatusBadge status="scenario" />
                          <InfoTooltip text="Each 100 people change has £1m fiscal impact" />
                        </div>
                      </div>
                      <SliderWithInput
                        value={populationChange}
                        onChange={setPopulationChange}
                        min={-10}
                        max={10}
                        step={1}
                        suffix=" hundred"
                        formatValue={(v) => (v > 0 ? '+' : '') + v}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {populationChange === 0 ? 'Baseline: No change' : 
                         `${populationChange > 0 ? '+' : ''}${populationChange * 100} people | 
                         Fiscal impact: ${populationChange >= 0 ? '+' : ''}£${Math.abs(populationChange)}m`}
                      </p>
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
                            onClick={() => setPublicSectorPayRate(option === 'freeze' ? 0 : parseFloat(option.replace('%', '')))}
                            className={`px-3 py-2 text-sm border rounded ${
                              (option === 'freeze' ? publicSectorPayRate === 0 : publicSectorPayRate === parseFloat(option.replace('%', '')))
                                ? 'bg-blue-50 border-blue-500 text-blue-700' 
                                : 'bg-white hover:bg-gray-50'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Impact: {advancedOptions.publicSectorPay === 'freeze' ? 'Save £10m' : 
                                advancedOptions.publicSectorPay === '1%' ? 'Save £5m' :
                                advancedOptions.publicSectorPay === '2%' ? 'Baseline' : 'Cost £5m'}
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
            
            {/* Advanced Policy Tabs - 6 Comprehensive Categories */}
            <Tabs defaultValue="revenue" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="revenue">Revenue Sources</TabsTrigger>
                <TabsTrigger value="cuts">Department Budgets</TabsTrigger>
                <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
                <TabsTrigger value="benefits">Benefits</TabsTrigger>
                <TabsTrigger value="capital">Capital</TabsTrigger>
              </TabsList>

              {/* Department Budgets Tab - ALL 12 Departments */}
              <TabsContent value="cuts" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Department Budget Adjustments
                    </CardTitle>
                    <CardDescription>
                      Adjust department budgets from -10% (cuts) to +5% (increases) for all 12 departments
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Department Efficiency Controls */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-700">Department Efficiency Targets</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {/* Manx Care - Largest Budget */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm">Manx Care (£{departmentDisplayValues.manxCare.budget}m</Label>
                            <span className={`text-sm ${serviceCuts.manxCare < 0 ? 'text-red-600' : serviceCuts.manxCare > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                              {serviceCuts.manxCare < 0 ? '-' : serviceCuts.manxCare > 0 ? '+' : ''}£{departmentDisplayValues.manxCare.impact}m
                            </span>
                          </div>
                          <Slider
                            value={[serviceCuts.manxCare]}
                            onValueChange={([value]) => setServiceCuts(prev => ({ ...prev, manxCare: value }))}
                            min={-10}
                            max={5}
                            step={0.1}
                            className="flex-1"
                          />
                        </div>

                        {/* Education, Sport & Culture */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm">Education (£{departmentDisplayValues.education.budget}m</Label>
                            <span className={`text-sm ${serviceCuts.education < 0 ? 'text-red-600' : serviceCuts.education > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                              {serviceCuts.education < 0 ? '-' : serviceCuts.education > 0 ? '+' : ''}£{departmentDisplayValues.education.impact}m
                            </span>
                          </div>
                          <Slider
                            value={[serviceCuts.education]}
                            onValueChange={([value]) => setServiceCuts(prev => ({ ...prev, education: value }))}
                            min={-10}
                            max={5}
                            step={0.1}
                            className="flex-1"
                          />
                        </div>

                        {/* Infrastructure */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm">Infrastructure (£{departmentDisplayValues.infrastructure.budget}m</Label>
                            <span className={`text-sm ${serviceCuts.infrastructure < 0 ? 'text-red-600' : serviceCuts.infrastructure > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                              {serviceCuts.infrastructure < 0 ? '-' : serviceCuts.infrastructure > 0 ? '+' : ''}£{departmentDisplayValues.infrastructure.impact}m
                            </span>
                          </div>
                          <Slider
                            value={[serviceCuts.infrastructure]}
                            onValueChange={([value]) => setServiceCuts(prev => ({ ...prev, infrastructure: value }))}
                            min={-10}
                            max={5}
                            step={0.1}
                            className="flex-1"
                          />
                        </div>

                        {/* Treasury - OPERATIONAL ONLY */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm">Treasury Operations (£70m)</Label>
                            <span className={`text-sm ${serviceCuts.treasury < 0 ? 'text-red-600' : serviceCuts.treasury > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                              {serviceCuts.treasury < 0 ? '-' : serviceCuts.treasury > 0 ? '+' : ''}£{Math.abs(serviceCuts.treasury * 70).toFixed(1)}m
                            </span>
                          </div>
                          <Slider
                            value={[serviceCuts.treasury]}
                            onValueChange={([value]) => setServiceCuts(prev => ({ ...prev, treasury: value }))}
                            min={-10}
                            max={5}
                            step={0.1}
                            className="flex-1"
                          />
                        </div>

                        {/* Home Affairs */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm">Home Affairs (£{departmentDisplayValues.homeAffairs.budget}m</Label>
                            <span className={`text-sm ${serviceCuts.homeAffairs < 0 ? 'text-red-600' : serviceCuts.homeAffairs > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                              {serviceCuts.homeAffairs < 0 ? '-' : serviceCuts.homeAffairs > 0 ? '+' : ''}£{departmentDisplayValues.homeAffairs.impact}m
                            </span>
                          </div>
                          <Slider
                            value={[serviceCuts.homeAffairs]}
                            onValueChange={([value]) => setServiceCuts(prev => ({ ...prev, homeAffairs: value }))}
                            min={-10}
                            max={5}
                            step={0.1}
                            className="flex-1"
                          />
                        </div>

                        {/* Cabinet Office */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm">Cabinet Office (£{departmentDisplayValues.cabinetOffice.budget}m</Label>
                            <span className={`text-sm ${serviceCuts.cabinetOffice < 0 ? 'text-red-600' : serviceCuts.cabinetOffice > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                              {serviceCuts.cabinetOffice < 0 ? '-' : serviceCuts.cabinetOffice > 0 ? '+' : ''}£{departmentDisplayValues.cabinetOffice.impact}m
                            </span>
                          </div>
                          <Slider
                            value={[serviceCuts.cabinetOffice]}
                            onValueChange={([value]) => setServiceCuts(prev => ({ ...prev, cabinetOffice: value }))}
                            min={-10}
                            max={5}
                            step={0.1}
                            className="flex-1"
                          />
                        </div>

                        {/* Enterprise */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm">Enterprise (£{departmentDisplayValues.enterprise.budget}m</Label>
                            <span className={`text-sm ${serviceCuts.enterprise < 0 ? 'text-red-600' : serviceCuts.enterprise > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                              {serviceCuts.enterprise < 0 ? '-' : serviceCuts.enterprise > 0 ? '+' : ''}£{departmentDisplayValues.enterprise.impact}m
                            </span>
                          </div>
                          <Slider
                            value={[serviceCuts.enterprise]}
                            onValueChange={([value]) => setServiceCuts(prev => ({ ...prev, enterprise: value }))}
                            min={-10}
                            max={5}
                            step={0.1}
                            className="flex-1"
                          />
                        </div>

                        {/* DEFA */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm">Environment (£{departmentDisplayValues.defa.budget}m</Label>
                            <span className={`text-sm ${serviceCuts.defa < 0 ? 'text-red-600' : serviceCuts.defa > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                              {serviceCuts.defa < 0 ? '-' : serviceCuts.defa > 0 ? '+' : ''}£{departmentDisplayValues.defa.impact}m
                            </span>
                          </div>
                          <Slider
                            value={[serviceCuts.defa]}
                            onValueChange={([value]) => setServiceCuts(prev => ({ ...prev, defa: value }))}
                            min={-10}
                            max={5}
                            step={0.1}
                            className="flex-1"
                          />
                        </div>

                        {/* DHSC */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm">DHSC (£{departmentDisplayValues.dhsc.budget}m</Label>
                            <span className={`text-sm ${serviceCuts.dhsc < 0 ? 'text-red-600' : serviceCuts.dhsc > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                              {serviceCuts.dhsc < 0 ? '-' : serviceCuts.dhsc > 0 ? '+' : ''}£{departmentDisplayValues.dhsc.impact}m
                            </span>
                          </div>
                          <Slider
                            value={[serviceCuts.dhsc]}
                            onValueChange={([value]) => setServiceCuts(prev => ({ ...prev, dhsc: value }))}
                            min={-10}
                            max={5}
                            step={0.1}
                            className="flex-1"
                          />
                        </div>

                        {/* Executive Government */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm">Executive (£{departmentDisplayValues.executive.budget}m</Label>
                            <span className={`text-sm ${serviceCuts.executive < 0 ? 'text-red-600' : serviceCuts.executive > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                              {serviceCuts.executive < 0 ? '-' : serviceCuts.executive > 0 ? '+' : ''}£{departmentDisplayValues.executive.impact}m
                            </span>
                          </div>
                          <Slider
                            value={[serviceCuts.executive]}
                            onValueChange={([value]) => setServiceCuts(prev => ({ ...prev, executive: value }))}
                            min={-10}
                            max={5}
                            step={0.1}
                            className="flex-1"
                          />
                        </div>

                        {/* Statutory Boards */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm">Statutory (£{departmentDisplayValues.statutory.budget}m</Label>
                            <span className={`text-sm ${serviceCuts.statutory < 0 ? 'text-red-600' : serviceCuts.statutory > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                              {serviceCuts.statutory < 0 ? '-' : serviceCuts.statutory > 0 ? '+' : ''}£{departmentDisplayValues.statutory.impact}m
                            </span>
                          </div>
                          <Slider
                            value={[serviceCuts.statutory]}
                            onValueChange={([value]) => setServiceCuts(prev => ({ ...prev, statutory: value }))}
                            min={-5}
                            max={5}
                            step={0.1}
                            className="flex-1"
                          />
                        </div>

                        {/* Legislature */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm">Legislature (£{departmentDisplayValues.legislature.budget}m</Label>
                            <span className={`text-sm ${serviceCuts.legislature < 0 ? 'text-red-600' : serviceCuts.legislature > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                              {serviceCuts.legislature < 0 ? '-' : serviceCuts.legislature > 0 ? '+' : ''}£{departmentDisplayValues.legislature.impact}m
                            </span>
                          </div>
                          <Slider
                            value={[serviceCuts.legislature]}
                            onValueChange={([value]) => setServiceCuts(prev => ({ ...prev, legislature: value }))}
                            min={-5}
                            max={5}
                            step={0.1}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Specific Service Cuts */}
                    <div className="space-y-3 border-t pt-4">
                      <h4 className="text-sm font-semibold text-gray-700">Specific Service Reductions</h4>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-3">
                          <Checkbox
                            checked={serviceCuts.heritageRail}
                            onCheckedChange={(checked) => setServiceCuts(prev => ({ ...prev, heritageRail: !!checked }))}
                          />
                          <span>Heritage Railway to 5 days (Save £600k)</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <Checkbox
                            checked={serviceCuts.busServices}
                            onCheckedChange={(checked) => setServiceCuts(prev => ({ ...prev, busServices: !!checked }))}
                          />
                          <span>Cut bus services by 25% (Save £2.8m)</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <Checkbox
                            checked={serviceCuts.artsCouncil}
                            onCheckedChange={(checked) => setServiceCuts(prev => ({ ...prev, artsCouncil: !!checked }))}
                          />
                          <span>Arts Council 50% cut (Save £1.5m)</span>
                        </label>
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
                      Cross-government efficiency initiatives from policy-targets.json
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Property Portfolio</div>
                          <div className="text-xs text-gray-600">£5m per annum savings</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-green-600">
                            {efficiencyMeasures.propertyRationalization ? '+£5m' : '£0'}
                          </span>
                          <Switch
                            checked={efficiencyMeasures.propertyRationalization}
                            onCheckedChange={(checked) => 
                              setEfficiencyMeasures(prev => ({ ...prev, propertyRationalization: checked }))
                            }
                          />
                        </div>
                      </label>

                      <label className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Centralised Contract Management</div>
                          <div className="text-xs text-gray-600">£2m annual savings</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-green-600">
                            {efficiencyMeasures.procurementCentralization ? '+£2m' : '£0'}
                          </span>
                          <Switch
                            checked={efficiencyMeasures.procurementCentralization}
                            onCheckedChange={(checked) => 
                              setEfficiencyMeasures(prev => ({ ...prev, procurementCentralization: checked }))
                            }
                          />
                        </div>
                      </label>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Revenue Generation Tab */}
              <TabsContent value="revenue" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Revenue Generation
                    </CardTitle>
                    <CardDescription>
                      New revenue sources and fee increases
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Tourist Levy */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label>Tourist Accommodation Levy (per night)</Label>
                        <Badge variant="outline">
                          +£{(revenueGeneration.touristLevyAmount * 1.6).toFixed(1)}m
                        </Badge>
                      </div>
                      <Slider
                        value={[revenueGeneration.touristLevyAmount]}
                        onValueChange={([value]) => 
                          setRevenueGeneration(prev => ({ ...prev, touristLevyAmount: value }))
                        }
                        min={0}
                        max={10}
                        step={1}
                        className="flex-1"
                      />
                      <p className="text-xs text-gray-600">
                        Based on 1.6m visitor nights annually
                      </p>
                    </div>

                    {/* Airport Departure Tax */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label>Airport Departure Tax (per passenger)</Label>
                        <Badge variant="outline">
                          +£{((revenueGeneration.airportDepartureTax - 13.5) * 652000 / 1000000).toFixed(2)}m
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">£{revenueGeneration.airportDepartureTax.toFixed(2)}</span>
                        <Slider
                          value={[revenueGeneration.airportDepartureTax]}
                          onValueChange={([value]) => 
                            setRevenueGeneration(prev => ({ ...prev, airportDepartureTax: value }))
                          }
                          min={13.5}
                          max={35}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-sm text-gray-500">£35 max</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Current: £13.50 | 652,000 passengers/year | UK airports: £13-35
                      </p>
                    </div>

                    {/* Fee Increases */}
                    <div className="space-y-3 border-t pt-4">
                      <h4 className="text-sm font-semibold text-gray-700">Fee Increases & New Charges</h4>
                      
                      {/* Land Registry for Non-Residents */}
                      <label className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Land Registry - Non-Residents</div>
                          <div className="text-xs text-gray-600">100% fee increase for non-resident purchases</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-green-600">
                            {revenueGeneration.landRegistryNonResident ? '+£0.5m' : '£0'}
                          </span>
                          <Switch
                            checked={revenueGeneration.landRegistryNonResident}
                            onCheckedChange={(checked) => 
                              setRevenueGeneration(prev => ({ ...prev, landRegistryNonResident: checked }))
                            }
                          />
                        </div>
                      </label>

                      {/* Company Registry Fee */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label>Company Registry Fee</Label>
                          <Badge variant="outline">
                            +£{((revenueGeneration.companyRegistryFee - 380) / 10 * 0.25).toFixed(2)}m
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium">£{revenueGeneration.companyRegistryFee}</span>
                          <Slider
                            value={[revenueGeneration.companyRegistryFee]}
                            onValueChange={([value]) => 
                              setRevenueGeneration(prev => ({ ...prev, companyRegistryFee: value }))
                            }
                            min={380}
                            max={500}
                            step={10}
                            className="flex-1"
                          />
                          <span className="text-sm text-gray-500">£500 max</span>
                        </div>
                        <p className="text-xs text-gray-600">
                          Current: £380 | Each £10 increase = £0.25m revenue
                        </p>
                      </div>

                      {/* Other Fees */}
                      <div className="space-y-2">
                        <label className="flex items-center space-x-3">
                          <Checkbox
                            checked={revenueGeneration.parkingCharges}
                            onCheckedChange={(checked) => 
                              setRevenueGeneration(prev => ({ ...prev, parkingCharges: !!checked }))
                            }
                          />
                          <span>Parking Charges Increase (+£1m)</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <Checkbox
                            checked={revenueGeneration.planningFees}
                            onCheckedChange={(checked) => 
                              setRevenueGeneration(prev => ({ ...prev, planningFees: !!checked }))
                            }
                          />
                          <span>Planning Fees 25% Increase (+£0.5m)</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <Checkbox
                            checked={revenueGeneration.courtFees}
                            onCheckedChange={(checked) => 
                              setRevenueGeneration(prev => ({ ...prev, courtFees: !!checked }))
                            }
                          />
                          <span>Court Fees 20% Increase (+£0.5m)</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <Checkbox
                            checked={revenueGeneration.vehicleRegistration}
                            onCheckedChange={(checked) => 
                              setRevenueGeneration(prev => ({ ...prev, vehicleRegistration: !!checked }))
                            }
                          />
                          <span>Vehicle Registration 10% Increase (+£1.6m)</span>
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Benefits Reform Tab */}
              <TabsContent value="benefits" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Benefit Reforms
                    </CardTitle>
                    <CardDescription>
                      Transfer payment optimizations from transfer-payments.json
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Winter Bonus Reform */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label>Winter Bonus Reduction (from £400)</Label>
                        <Badge variant="outline">
                          +£{((benefitReforms.winterBonusReduction * 18000) / 1000000).toFixed(1)}m
                        </Badge>
                      </div>
                      <Slider
                        value={[benefitReforms.winterBonusReduction]}
                        onValueChange={([value]) => 
                          setBenefitReforms(prev => ({ ...prev, winterBonusReduction: value }))
                        }
                        min={0}
                        max={400}
                        step={50}
                        className="flex-1"
                      />
                      <p className="text-xs text-gray-600">
                        Current: £400 to 18,000 recipients (£7.2m total)
                      </p>
                    </div>

                    {/* Winter Bonus Means Testing */}
                    <div className="space-y-3">
                      <Label>Winter Bonus Means Testing</Label>
                      <Select
                        value={benefitReforms.winterBonusMeansTest}
                        onValueChange={(value) => 
                          setBenefitReforms(prev => ({ ...prev, winterBonusMeansTest: value as any }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="universal">Universal (current)</SelectItem>
                          <SelectItem value="benefits">Benefits recipients only (+£3.6m)</SelectItem>
                          <SelectItem value="age75">Age 75+ only (+£5.0m)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Other Benefit Reforms */}
                    <div className="space-y-3 border-t pt-4">
                      <h4 className="text-sm font-semibold text-gray-700">Additional Reforms</h4>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-3">
                          <Checkbox
                            checked={benefitReforms.childBenefitRestrict}
                            onCheckedChange={(checked) => 
                              setBenefitReforms(prev => ({ ...prev, childBenefitRestrict: !!checked }))
                            }
                          />
                          <span>Child Benefit to households &lt;£30k (+£3m)</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <Checkbox
                            checked={benefitReforms.pensionSupplementTaper}
                            onCheckedChange={(checked) => 
                              setBenefitReforms(prev => ({ ...prev, pensionSupplementTaper: !!checked }))
                            }
                          />
                          <span>Pension Supplement Taper (+£2m)</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <Checkbox
                            checked={benefitReforms.disabilityReview}
                            onCheckedChange={(checked) => 
                              setBenefitReforms(prev => ({ ...prev, disabilityReview: !!checked }))
                            }
                          />
                          <span>Disability Criteria Review (+£2m)</span>
                        </label>
                      </div>
                    </div>

                    {/* Housing Benefit Cap */}
                    <div className="space-y-3 border-t pt-4">
                      <div className="flex justify-between items-center">
                        <Label>Housing Benefit Monthly Cap</Label>
                        <Badge variant="outline">
                          {benefitReforms.housingBenefitCapAmount > 0 
                            ? `+£${((495 - benefitReforms.housingBenefitCapAmount) * 3200 * 0.3 * 12 / 1000000).toFixed(1)}m`
                            : '£0'}
                        </Badge>
                      </div>
                      <Select
                        value={benefitReforms.housingBenefitCapAmount.toString()}
                        onValueChange={(value) => 
                          setBenefitReforms(prev => ({ ...prev, housingBenefitCapAmount: parseInt(value) }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No cap (current avg: £495/month)</SelectItem>
                          <SelectItem value="400">£400/month cap (+£1.1m)</SelectItem>
                          <SelectItem value="350">£350/month cap (+£1.7m)</SelectItem>
                          <SelectItem value="300">£300/month cap (+£2.2m)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-600">
                        3,200 recipients, affects top 30% of claimants
                      </p>
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
                      £87.4m capital programme with project deferral options
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
                        <span className="text-sm text-green-600">
                          {capitalAdjustments.capitalGating ? '+£22.7m' : '£0'}
                        </span>
                        <Switch
                          checked={capitalAdjustments.capitalGating}
                          onCheckedChange={(checked) => 
                            setCapitalAdjustments(prev => ({ ...prev, capitalGating: checked }))
                          }
                        />
                      </div>
                    </div>

                    {/* Project Deferrals */}
                    <div className="space-y-3 border-t pt-4">
                      <h4 className="text-sm font-semibold text-gray-700">Defer Major Projects</h4>
                      <div className="space-y-2">
                        <label className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={capitalAdjustments.deferVillaMarina}
                              onCheckedChange={(checked) => 
                                setCapitalAdjustments(prev => ({ ...prev, deferVillaMarina: !!checked }))
                              }
                            />
                            <span className="text-sm">Villa Marina & Gaiety Theatre Upgrade</span>
                          </div>
                          <span className="text-sm text-green-600">+£1.5m</span>
                        </label>
                        
                        <label className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={capitalAdjustments.deferRadcliffe}
                              onCheckedChange={(checked) => 
                                setCapitalAdjustments(prev => ({ ...prev, deferRadcliffe: !!checked }))
                              }
                            />
                            <span className="text-sm">Radcliffe Villas</span>
                          </div>
                          <span className="text-sm text-green-600">+£2.3m</span>
                        </label>

                        <label className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={capitalAdjustments.deferSecondaryWaste}
                              onCheckedChange={(checked) => 
                                setCapitalAdjustments(prev => ({ ...prev, deferSecondaryWaste: !!checked }))
                              }
                            />
                            <span className="text-sm">Secondary Waste Incinerator</span>
                          </div>
                          <span className="text-sm text-green-600">+£2.0m</span>
                        </label>

                        <label className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={capitalAdjustments.deferAirfieldDrainage}
                              onCheckedChange={(checked) => 
                                setCapitalAdjustments(prev => ({ ...prev, deferAirfieldDrainage: !!checked }))
                              }
                            />
                            <span className="text-sm">Airfield Drainage</span>
                          </div>
                          <span className="text-sm text-green-600">+£2.9m</span>
                        </label>

                        <label className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={capitalAdjustments.deferBallacubbon}
                              onCheckedChange={(checked) => 
                                setCapitalAdjustments(prev => ({ ...prev, deferBallacubbon: !!checked }))
                              }
                            />
                            <span className="text-sm">Ballacubbon Housing</span>
                          </div>
                          <span className="text-sm text-green-600">+£2.1m</span>
                        </label>

                        <label className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={capitalAdjustments.reduceDigitalFund}
                              onCheckedChange={(checked) => 
                                setCapitalAdjustments(prev => ({ ...prev, reduceDigitalFund: !!checked }))
                              }
                            />
                            <span className="text-sm">Reduce Digital Projects Fund by 50%</span>
                          </div>
                          <span className="text-sm text-green-600">+£2.5m</span>
                        </label>

                        <label className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={capitalAdjustments.reduceClimateFund}
                              onCheckedChange={(checked) => 
                                setCapitalAdjustments(prev => ({ ...prev, reduceClimateFund: !!checked }))
                              }
                            />
                            <span className="text-sm">Reduce Climate Mitigation Fund by 40%</span>
                          </div>
                          <span className="text-sm text-green-600">+£2.0m</span>
                        </label>
                      </div>
                    </div>

                    {/* Heritage Railway Adjustment */}
                    <div className="space-y-3 border-t pt-4">
                      <div className="flex justify-between items-center">
                        <Label>Heritage Railway Capital Budget</Label>
                        <Badge variant="outline">
                          {capitalAdjustments.heritageRailReduction > 0 
                            ? `+£${(capitalAdjustments.heritageRailReduction / 1000000).toFixed(1)}m`
                            : '£0'}
                        </Badge>
                      </div>
                      <Slider
                        value={[capitalAdjustments.heritageRailReduction]}
                        onValueChange={([value]) => 
                          setCapitalAdjustments(prev => ({ ...prev, heritageRailReduction: value }))
                        }
                        min={0}
                        max={2250000}
                        step={250000}
                        className="flex-1"
                      />
                      <p className="text-xs text-gray-600">
                        Reduce from £2.25m annual budget
                      </p>
                    </div>

                    {/* Low BCR Projects */}
                    <div className="space-y-3 border-t pt-4">
                      <Label>Defer Low BCR Projects</Label>
                      <Select
                        value={capitalAdjustments.deferLowBCR.toString()}
                        onValueChange={(value) => 
                          setCapitalAdjustments(prev => ({ ...prev, deferLowBCR: parseInt(value) }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Proceed with all</SelectItem>
                          <SelectItem value="10000000">Defer BCR &lt; 1.5 (+£10m)</SelectItem>
                          <SelectItem value="15000000">Defer BCR &lt; 2.0 (+£15m)</SelectItem>
                          <SelectItem value="20000000">Defer BCR &lt; 2.5 (+£20m)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Infrastructure Tab - REMOVE THIS OLD ONE */}
              <TabsContent value="infrastructure_old" className="space-y-4">
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
                        <span className="text-sm w-12">£{advancedOptions.airportCharge}</span>
                        <Slider
                          value={[advancedOptions.airportCharge]}
                          onValueChange={([value]) => 
                            setAdvancedOptions(prev => ({ ...prev, airportCharge: value }))
                          }
                          min={0}
                          max={10}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-sm text-gray-500 w-20">
                          +£{((advancedOptions.airportCharge * 652000) / 1000000).toFixed(1)}m
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        New charge per passenger (652k passengers/year). UK airports charge £13-35.
                      </p>
                    </div>

                    {/* Port Dues Increase */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label>Port Dues Increase</Label>
                        <Badge variant="outline">Medium confidence</Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm w-12">{advancedOptions.portDuesIncrease}%</span>
                        <Slider
                          value={[advancedOptions.portDuesIncrease]}
                          onValueChange={([value]) => 
                            setAdvancedOptions(prev => ({ ...prev, portDuesIncrease: value }))
                          }
                          min={0}
                          max={30}
                          step={5}
                          className="flex-1"
                        />
                        <span className="text-sm text-gray-500 w-20">
                          +£{((5000000 * (advancedOptions.portDuesIncrease / 100)) / 1000000).toFixed(1)}m
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Increase from current £5m base. Still below UK port rates.
                      </p>
                    </div>

                    {/* Heritage Railway Days */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label>Heritage Railway Operating Days</Label>
                        <Badge variant="outline">Policy choice</Badge>
                      </div>
                      <Select
                        value={advancedOptions.heritageRailDays.toString()}
                        onValueChange={(value) => 
                          setAdvancedOptions(prev => ({ ...prev, heritageRailDays: parseInt(value) }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 days (current)</SelectItem>
                          <SelectItem value="5">5 days (save £600k)</SelectItem>
                          <SelectItem value="3">3 days (save £1.2m)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-600">
                        Current budget £2.25m. Reducing days saves proportional amount.
                      </p>
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
                      Optimize benefits and pension expenditure
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Winter Bonus Reform */}
                    <div className="space-y-3">
                      <Label>Winter Bonus Reform</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs">Amount</Label>
                          <Select
                            value={advancedOptions.winterBonusRate.toString()}
                            onValueChange={(value) => 
                              setAdvancedOptions(prev => ({ ...prev, winterBonusRate: parseInt(value) }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="400">£400 (current)</SelectItem>
                              <SelectItem value="300">£300 (save £2m)</SelectItem>
                              <SelectItem value="200">£200 (save £4m)</SelectItem>
                              <SelectItem value="0">Remove (save £8m)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Eligibility</Label>
                          <Select
                            value={advancedOptions.winterBonusMeans}
                            onValueChange={(value) => 
                              setAdvancedOptions(prev => ({ ...prev, winterBonusMeans: value as any }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="universal">Universal</SelectItem>
                              <SelectItem value="benefits">Benefits only</SelectItem>
                              <SelectItem value="age75">Age 75+ only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Child Benefit Means Testing */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label>Child Benefit Means Testing</Label>
                        <Badge variant="outline">8,500 families</Badge>
                      </div>
                      <Select
                        value={advancedOptions.childBenefitThreshold.toString()}
                        onValueChange={(value) => {
                          const threshold = parseInt(value);
                          setAdvancedOptions(prev => ({ ...prev, childBenefitThreshold: threshold }));
                          if (threshold > 0) {
                            const affectedFamilies = threshold <= 50000 ? 2125 :
                                                     threshold <= 75000 ? 1275 :
                                                     680;
                            const savings = affectedFamilies * 1412; // avg benefit per family
                            setAdvancedOptions(prev => ({ ...prev, childBenefitTaper: savings }));
                          } else {
                            setAdvancedOptions(prev => ({ ...prev, childBenefitTaper: 0 }));
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No means testing</SelectItem>
                          <SelectItem value="50000">£50k threshold (+£3.0m)</SelectItem>
                          <SelectItem value="75000">£75k threshold (+£1.8m)</SelectItem>
                          <SelectItem value="100000">£100k threshold (+£1.0m)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-600">
                        8,500 families, 17,000 children. Total cost: £12m. 
                        First child: £25.60/week, others: £16.95/week
                      </p>
                    </div>

                    {/* Housing Benefit Cap */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label>Housing Benefit Cap (Monthly)</Label>
                        <Badge variant="outline">3,200 recipients</Badge>
                      </div>
                      <Select
                        value={advancedOptions.housingBenefitCap.toString()}
                        onValueChange={(value) => 
                          setAdvancedOptions(prev => ({ ...prev, housingBenefitCap: parseInt(value) }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No cap (current avg: £495/month)</SelectItem>
                          <SelectItem value="400">£400/month cap (+£1.1m)</SelectItem>
                          <SelectItem value="350">£350/month cap (+£1.7m)</SelectItem>
                          <SelectItem value="300">£300/month cap (+£2.2m)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-600">
                        3,200 recipients, average £495/month. 
                        Total cost: £19m. Cap affects top 30% of claimants.
                      </p>
                    </div>

                    {/* Pension Age */}
                    <div className="space-y-3 border-t pt-4 mt-4">
                      <div className="flex justify-between items-center">
                        <Label>State Pension Age</Label>
                        <Badge variant="outline">23,200 pensioners</Badge>
                      </div>
                      <Select
                        value={advancedOptions.pensionAge.toString()}
                        onValueChange={(value) => 
                          setAdvancedOptions(prev => ({ ...prev, pensionAge: parseInt(value) }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="66">Age 66 (current)</SelectItem>
                          <SelectItem value="67">Age 67 (+£12.7m)</SelectItem>
                          <SelectItem value="68">Age 68 (+£25.4m)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-600">
                        Basic pension: 18,600 at £185.15/week.
                        Manx pension: 4,600 at £141.85/week.
                        Total: £206m
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
                      Efficiency measures and operational changes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Cabinet Office Efficiency */}
                    <div className="space-y-3">
                      <Label>Cabinet Office Efficiency Target</Label>
                      <Select
                        value={advancedOptions.cabinetEfficiency.toString()}
                        onValueChange={(value) => 
                          setAdvancedOptions(prev => ({ ...prev, cabinetEfficiency: parseInt(value) }))
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
                        value={advancedOptions.enterpriseGrants.toString()}
                        onValueChange={(value) => 
                          setAdvancedOptions(prev => ({ ...prev, enterpriseGrants: parseInt(value) }))
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
                        value={advancedOptions.publicSectorPay}
                        onValueChange={(value) => 
                          setAdvancedOptions(prev => ({ ...prev, publicSectorPay: value }))
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
                        <span className="text-sm w-12">{advancedOptions.generalFeesUplift}%</span>
                        <Slider
                          value={[advancedOptions.generalFeesUplift]}
                          onValueChange={([value]) => 
                            setAdvancedOptions(prev => ({ ...prev, generalFeesUplift: value }))
                          }
                          min={0}
                          max={10}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-sm text-gray-500 w-20">
                          +£{(150 * (advancedOptions.generalFeesUplift / 100)).toFixed(1)}m
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
                              checked={advancedOptions.targetedRecovery.includes(item.id)}
                              onCheckedChange={(checked) => {
                                setAdvancedOptions(prev => ({
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
                      Optimize capital spending and project delivery (£87.4m base programme)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* DOI Delivery Rate */}
                    <div className="space-y-3">
                      <Label>DOI Capital Delivery Rate</Label>
                      <Select
                        value={advancedOptions.doiDeliveryRate.toString()}
                        onValueChange={(value) => 
                          setAdvancedOptions(prev => ({ ...prev, doiDeliveryRate: parseInt(value) }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="70">70% delivery (realistic) - Save £26.2m</SelectItem>
                          <SelectItem value="60">60% delivery (pessimistic) - Save £35.0m</SelectItem>
                          <SelectItem value="50">50% delivery (emergency) - Save £43.7m</SelectItem>
                          <SelectItem value="100">100% delivery (optimistic) - No savings</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-600">
                        Historical delivery is 70% - adjust budget to match reality
                      </p>
                    </div>

                    {/* DOI Small Works Programme */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label>DOI Small Works Programme (£30m base)</Label>
                        <Badge variant="outline">
                          {advancedOptions.deferLowBCR > 0 ? `-£${(advancedOptions.deferLowBCR / 1000000).toFixed(1)}m` : '£0'}
                        </Badge>
                      </div>
                      <Select
                        value={advancedOptions.deferLowBCR.toString()}
                        onValueChange={(value) => 
                          setAdvancedOptions(prev => ({ ...prev, deferLowBCR: parseInt(value) }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Full programme</SelectItem>
                          <SelectItem value="5000000">Defer 17% (Save £5m)</SelectItem>
                          <SelectItem value="10000000">Defer 33% (Save £10m)</SelectItem>
                          <SelectItem value="15000000">Defer 50% (Save £15m)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-600">
                        Defer lower priority small works and maintenance
                      </p>
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
