import { Department, RevenueStream } from './types'
import { BudgetDataService, getDepartmentsFromJSON, getRevenueStreamsFromJSON } from './services/budget-data-service'

// ALL DATA FROM JSON - NO HARDCODED VALUES
export const DEPARTMENTS: Department[] = getDepartmentsFromJSON();
export const REVENUE_STREAMS: RevenueStream[] = getRevenueStreamsFromJSON();

// Initial state - ALL values from JSON data service
export const INITIAL_STATE = {
  revenue: {
    total: BudgetDataService.getRevenue.total(),
    vat: BudgetDataService.getRevenue.vat(),
    incomeTax: BudgetDataService.getRevenue.incomeTax(),
    nationalInsurance: BudgetDataService.getRevenue.nationalInsurance(),
    customsExcise: BudgetDataService.getRevenue.customsExcise(),
    vehicleDuty: BudgetDataService.getRevenue.vehicleDuty(),
    departmentalIncome: BudgetDataService.getRevenue.departmentalIncome(),
    other: BudgetDataService.getRevenue.feesAndCharges()
  },
  expenditure: {
    total: BudgetDataService.getExpenditure.total(),
    departments: {
      health: BudgetDataService.getExpenditure.byDepartment('Health & Social Care'),
      education: BudgetDataService.getExpenditure.byDepartment('Education, Sport & Culture'),
      infrastructure: BudgetDataService.getExpenditure.byDepartment('Infrastructure'),
      homeAffairs: BudgetDataService.getExpenditure.byDepartment('Home Affairs'),
      treasury: BudgetDataService.getExpenditure.byDepartment('Treasury'),
      cabinetOffice: BudgetDataService.getExpenditure.byDepartment('Cabinet Office'),
      enterprise: BudgetDataService.getExpenditure.byDepartment('Enterprise'),
      environment: BudgetDataService.getExpenditure.byDepartment('Environment, Food & Agriculture'),
      executive: BudgetDataService.getExpenditure.byDepartment('Executive Government'),
      statutoryBoards: BudgetDataService.getExpenditure.byDepartment('Statutory Boards'),
      legislature: BudgetDataService.getExpenditure.byDepartment('Legislature')
    },
    employeeCosts: BudgetDataService.getExpenditure.employeeCosts(),
    pensionCosts: BudgetDataService.getTransferPayments.statePension(),
    welfareBenefits: BudgetDataService.getTransferPayments.treasuryFundedBenefits(),
    capitalFinancing: BudgetDataService.getExpenditure.capitalProgramme()
  },
  balance: {
    surplus: BudgetDataService.getBudgetBalance(),
    structuralDeficit: -BudgetDataService.getReserves.drawdown(),
    reserves: BudgetDataService.getReserves.generalReserve(),
    niFund: BudgetDataService.getReserves.niFund()
  },
  metrics: {
    population: BudgetDataService.getMetrics.population(),
    publicSectorWorkers: BudgetDataService.getMetrics.publicSectorWorkers(),
    pensioners: BudgetDataService.getMetrics.pensioners(),
    gdp: BudgetDataService.getMetrics.gdp()
  }
}