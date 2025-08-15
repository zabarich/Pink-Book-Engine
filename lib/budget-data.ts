import { Department, RevenueStream } from './types'

// Actual Pink Book 2025-26 data
export const DEPARTMENTS: Department[] = [
  {
    name: 'Health & Social Care',
    budget: 357240000,
    color: '#ef4444',
    minViable: 250000000,
    description: 'NHS, social care, public health'
  },
  {
    name: 'Education, Sport & Culture',
    budget: 141000000,
    color: '#3b82f6',
    minViable: 100000000,
    description: 'Schools, higher education, culture, sports'
  },
  {
    name: 'Infrastructure',
    budget: 116182000,
    color: '#10b981',
    minViable: 80000000,
    description: 'Roads, transport, ports, airport, public estates'
  },
  {
    name: 'Home Affairs',
    budget: 75000000,
    color: '#f59e0b',
    minViable: 60000000,
    description: 'Police, prison, fire, courts'
  },
  {
    name: 'Treasury',
    budget: 460000000,
    color: '#8b5cf6',
    minViable: 400000000,
    description: 'Benefits, pensions, revenue services'
  },
  {
    name: 'Cabinet Office',
    budget: 45000000,
    color: '#ec4899',
    minViable: 35000000,
    description: 'Central administration, IT, HR'
  },
  {
    name: 'Enterprise',
    budget: 35000000,
    color: '#06b6d4',
    minViable: 20000000,
    description: 'Economic development, tourism, finance'
  },
  {
    name: 'Environment, Food & Agriculture',
    budget: 25000000,
    color: '#84cc16',
    minViable: 15000000,
    description: 'Environment, planning, agriculture, fisheries'
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
    total: 1387759000,
    departments: {
      health: 357240000,
      education: 141000000,
      infrastructure: 116182000,
      homeAffairs: 75000000,
      treasury: 460000000,
      cabinetOffice: 45000000,
      enterprise: 35000000,
      environment: 25000000
    },
    employeeCosts: 507240000,
    pensionCosts: 142921000,
    welfareBenefits: 87943000,
    capitalFinancing: 19000000
  },
  balance: {
    surplus: 1265000,
    structuralDeficit: -91400000,
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