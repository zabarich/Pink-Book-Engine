import { Department, RevenueStream } from './types'

// Actual Pink Book 2025-26 data
export const DEPARTMENTS: Department[] = [
  {
    name: 'Health & Social Care',
    budget: 298088000, // NET expenditure from department-budgets.json
    color: '#ef4444',
    minViable: 250000000,
    description: 'NHS, social care, public health'
  },
  {
    name: 'Education, Sport & Culture',
    budget: 149834000, // NET expenditure from department-budgets.json
    color: '#3b82f6',
    minViable: 100000000,
    description: 'Schools, higher education, culture, sports'
  },
  {
    name: 'Infrastructure',
    budget: 49661000, // NET expenditure from department-budgets.json
    color: '#10b981',
    minViable: 40000000,
    description: 'Roads, transport, ports, airport, public estates'
  },
  {
    name: 'Home Affairs',
    budget: 43951000, // NET expenditure from department-budgets.json
    color: '#f59e0b',
    minViable: 35000000,
    description: 'Police, prison, fire, courts'
  },
  {
    name: 'Treasury',
    budget: 146878000, // NET expenditure from department-budgets.json (excludes transfer payments)
    color: '#8b5cf6',
    minViable: 120000000,
    description: 'Revenue services, administration (transfer payments shown separately)'
  },
  {
    name: 'Cabinet Office',
    budget: 43380000, // NET expenditure from department-budgets.json
    color: '#ec4899',
    minViable: 35000000,
    description: 'Central administration, IT, HR'
  },
  {
    name: 'Enterprise',
    budget: 3242000, // NET expenditure from department-budgets.json
    color: '#06b6d4',
    minViable: 2000000,
    description: 'Economic development, tourism, finance'
  },
  {
    name: 'Environment, Food & Agriculture',
    budget: 19443000, // NET expenditure from department-budgets.json
    color: '#84cc16',
    minViable: 15000000,
    description: 'Environment, planning, agriculture, fisheries'
  },
  {
    name: 'Executive Government',
    budget: 56345000, // NET expenditure from department-budgets.json
    color: '#fbbf24',
    minViable: 45000000,
    description: 'Executive offices and services'
  },
  {
    name: 'Statutory Boards',
    budget: 3377000, // NET expenditure from department-budgets.json
    color: '#9333ea',
    minViable: 2500000,
    description: 'Regulatory and statutory bodies'
  },
  {
    name: 'Legislature',
    budget: 5591000, // NET expenditure from department-budgets.json
    color: '#dc2626',
    minViable: 4500000,
    description: 'Legislative branch operations'
  }
]

export const REVENUE_STREAMS: RevenueStream[] = [
  {
    name: 'VAT',
    amount: 388464000,
    color: '#3b82f6',
    adjustable: true,
    description: '20% standard rate, shared with UK'
  },
  {
    name: 'Income Tax',
    amount: 384040000,
    color: '#10b981',
    adjustable: true,
    description: 'Personal and corporate income tax'
  },
  {
    name: 'National Insurance',
    amount: 329742000,
    color: '#f59e0b',
    adjustable: true,
    description: 'Employee and employer contributions'
  },
  {
    name: 'Departmental Income',
    amount: 150611000,
    color: '#8b5cf6',
    adjustable: false,
    description: 'Fees, charges, and services'
  },
  {
    name: 'Customs & Excise',
    amount: 85088000,
    color: '#ec4899',
    adjustable: true,
    description: 'Duties on alcohol, tobacco, fuel'
  },
  {
    name: 'Vehicle Duty',
    amount: 16039000,
    color: '#06b6d4',
    adjustable: true,
    description: 'Annual vehicle duty and registration'
  },
  {
    name: 'Other Income',
    amount: 35040000,
    color: '#84cc16',
    adjustable: false,
    description: 'Investment returns, dividends, fines'
  }
]

export const INITIAL_STATE = {
  revenue: {
    total: 1389024000,
    vat: 388464000,
    incomeTax: 384040000,
    nationalInsurance: 329742000,
    customsExcise: 85088000,
    vehicleDuty: 16039000,
    departmentalIncome: 150611000,
    other: 35040000
  },
  expenditure: {
    total: 1387759000, // Correct total from Pink Book 2025-26
    departments: {
      health: 298088000, // NET expenditure
      education: 149834000, // NET expenditure
      infrastructure: 49661000, // NET expenditure
      homeAffairs: 43951000, // NET expenditure
      treasury: 146878000, // NET expenditure (excludes transfers)
      cabinetOffice: 43380000, // NET expenditure
      enterprise: 3242000, // NET expenditure
      environment: 19443000, // NET expenditure
      executive: 56345000, // NET expenditure
      statutoryBoards: 3377000, // NET expenditure
      legislature: 5591000 // NET expenditure
    },
    employeeCosts: 507240000,
    pensionCosts: 142921000,
    welfareBenefits: 87943000,
    capitalFinancing: 19000000
  },
  balance: {
    surplus: -70976000, // Actual deficit from Pink Book
    structuralDeficit: -110600000, // Reserve drawdown required
    reserves: 1760000000,
    niFund: 850000000
  },
  metrics: {
    population: 85000,
    publicSectorWorkers: 6000,
    pensioners: 23200,
    gdp: 5500000000
  }
}