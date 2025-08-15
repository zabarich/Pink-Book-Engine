export interface Department {
  name: string
  budget: number
  color: string
  minViable: number
  description: string
}

export interface RevenueStream {
  name: string
  amount: number
  color: string
  adjustable: boolean
  description: string
}

export interface BudgetState {
  revenue: {
    total: number
    vat: number
    incomeTax: number
    nationalInsurance: number
    customsExcise: number
    vehicleDuty: number
    departmentalIncome: number
    other: number
  }
  expenditure: {
    total: number
    departments: {
      health: number
      education: number
      infrastructure: number
      homeAffairs: number
      treasury: number
      cabinetOffice: number
      enterprise: number
      environment: number
    }
    employeeCosts: number
    pensionCosts: number
    welfareBenefits: number
    capitalFinancing: number
  }
  balance: {
    surplus: number
    structuralDeficit: number
    reserves: number
    niFund: number
  }
  metrics: {
    population: number
    publicSectorWorkers: number
    pensioners: number
    gdp: number
  }
}