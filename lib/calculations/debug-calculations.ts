// Debug Calculation Engine - Full traceability for all calculations
// This file ensures every monetary value traces back to source JSON data

const revenueStreams = require('@/data/source/revenue-streams.json');
const departmentBudgets = require('@/data/source/department-budgets.json');
const transferPayments = require('@/data/source/transfer-payments.json');
const forwardLooking = require('@/data/source/forward-looking.json');
const capitalProgramme = require('@/data/source/capital-programme.json');

export interface CalculationTrace {
  sourceFile: string;
  sourcePath: string;
  sourceValue: number;
  formula: string;
  calculatedValue: number;
}

export interface BudgetCalculation {
  baselineRevenue: {
    total: number;
    components: CalculationTrace[];
  };
  baselineExpenditure: {
    total: number;
    components: CalculationTrace[];
  };
  balance: number;
  debugLog: string[];
}

/**
 * Calculate baseline budget with full traceability
 * INCLUDES Pillar 2 tax in baseline by default as per requirement
 */
export function calculateBaselineBudget(includePillar2: boolean = true): BudgetCalculation {
  const debugLog: string[] = [];
  const revenueComponents: CalculationTrace[] = [];
  const expenditureComponents: CalculationTrace[] = [];

  // REVENUE CALCULATION
  debugLog.push('=== REVENUE CALCULATION ===');
  
  // Income Tax
  const incomeTaxRevenue = revenueStreams.incomeText.current;
  revenueComponents.push({
    sourceFile: 'revenue-streams.json',
    sourcePath: 'incomeText.current',
    sourceValue: incomeTaxRevenue,
    formula: 'Direct from source',
    calculatedValue: incomeTaxRevenue
  });
  debugLog.push(`Income Tax: £${incomeTaxRevenue.toLocaleString()} (revenue-streams.json → incomeText → current)`);

  // National Insurance
  const niRevenue = revenueStreams.nationalInsurance.total_revenue;
  revenueComponents.push({
    sourceFile: 'revenue-streams.json',
    sourcePath: 'nationalInsurance.total_revenue',
    sourceValue: niRevenue,
    formula: 'Direct from source',
    calculatedValue: niRevenue
  });
  debugLog.push(`National Insurance: £${niRevenue.toLocaleString()} (revenue-streams.json → nationalInsurance → total_revenue)`);

  // Use summary totals for reliable calculation
  // The summary contains pre-calculated totals that include all components
  const customsExciseTotal = revenueStreams.summary.customs_excise_total; // Includes VAT and duties
  revenueComponents.push({
    sourceFile: 'revenue-streams.json',
    sourcePath: 'summary.customs_excise_total',
    sourceValue: customsExciseTotal,
    formula: 'Customs & Excise total (includes VAT)',
    calculatedValue: customsExciseTotal
  });
  debugLog.push(`Customs & Excise (inc. VAT): £${customsExciseTotal.toLocaleString()} (revenue-streams.json → summary → customs_excise_total)`);

  // Departmental Income
  const deptIncomeRevenue = revenueStreams.summary.departmental_income_total;
  revenueComponents.push({
    sourceFile: 'revenue-streams.json',
    sourcePath: 'summary.departmental_income_total',
    sourceValue: deptIncomeRevenue,
    formula: 'Direct from source',
    calculatedValue: deptIncomeRevenue
  });
  debugLog.push(`Departmental Income: £${deptIncomeRevenue.toLocaleString()} (revenue-streams.json → summary → departmental_income_total)`);

  // Other Treasury Income
  const otherRevenue = revenueStreams.summary.other_treasury_income;
  revenueComponents.push({
    sourceFile: 'revenue-streams.json',
    sourcePath: 'summary.other_treasury_income',
    sourceValue: otherRevenue,
    formula: 'Direct from source',
    calculatedValue: otherRevenue
  });
  debugLog.push(`Other Treasury Income: £${otherRevenue.toLocaleString()} (revenue-streams.json → summary → other_treasury_income)`);
  
  // Employee Pension Contributions
  const pensionContributions = revenueStreams.summary.employee_pension_contributions;
  revenueComponents.push({
    sourceFile: 'revenue-streams.json',
    sourcePath: 'summary.employee_pension_contributions',
    sourceValue: pensionContributions,
    formula: 'Direct from source',
    calculatedValue: pensionContributions
  });
  debugLog.push(`Employee Pension Contributions: £${pensionContributions.toLocaleString()} (revenue-streams.json → summary → employee_pension_contributions)`);

  // Pillar 2 Tax (included by default)
  let pillar2Revenue = 0;
  if (includePillar2) {
    pillar2Revenue = forwardLooking.pillarTwoTax.projections["2025-26"];
    revenueComponents.push({
      sourceFile: 'forward-looking.json',
      sourcePath: 'pillarTwoTax.projections.2025-26',
      sourceValue: pillar2Revenue,
      formula: 'Direct from source (OECD Pillar Two)',
      calculatedValue: pillar2Revenue
    });
    debugLog.push(`Pillar 2 Tax: £${pillar2Revenue.toLocaleString()} (forward-looking.json → pillarTwoTax → projections → 2025-26)`);
  }

  // Total Revenue
  const totalRevenue = revenueComponents.reduce((sum, comp) => sum + comp.calculatedValue, 0);
  debugLog.push(`TOTAL REVENUE: £${totalRevenue.toLocaleString()}`);

  // EXPENDITURE CALCULATION
  debugLog.push('\n=== EXPENDITURE CALCULATION ===');

  // Use the summary totals from the corrected department-budgets.json
  const deptNetExpenditure = departmentBudgets.summary.departmental_net_expenditure;
  expenditureComponents.push({
    sourceFile: 'department-budgets.json',
    sourcePath: 'summary.departmental_net_expenditure',
    sourceValue: deptNetExpenditure,
    formula: 'Total departmental net expenditure',
    calculatedValue: deptNetExpenditure
  });
  debugLog.push(`Departmental Net Expenditure: £${deptNetExpenditure.toLocaleString()} (department-budgets.json → summary → departmental_net_expenditure)`);

  // Transfer Payments (from department-budgets.json summary)
  const transferPaymentsTotal = departmentBudgets.summary.transfer_payments;
  expenditureComponents.push({
    sourceFile: 'department-budgets.json',
    sourcePath: 'summary.transfer_payments',
    sourceValue: transferPaymentsTotal,
    formula: 'Total transfer payments (pensions + benefits)',
    calculatedValue: transferPaymentsTotal
  });
  debugLog.push(`Transfer Payments: £${transferPaymentsTotal.toLocaleString()} (department-budgets.json → summary → transfer_payments)`);

  // Capital Programme (from department-budgets.json summary)
  const capitalSpending = departmentBudgets.summary.capital_expenditure;
  expenditureComponents.push({
    sourceFile: 'department-budgets.json',
    sourcePath: 'summary.capital_expenditure',
    sourceValue: capitalSpending,
    formula: 'Capital programme allocation',
    calculatedValue: capitalSpending
  });
  debugLog.push(`Capital Expenditure: £${capitalSpending.toLocaleString()} (department-budgets.json → summary → capital_expenditure)`);

  // Reserves and Contingencies (to balance the budget)
  const reservesContingencies = departmentBudgets.summary.reserves_and_contingencies;
  expenditureComponents.push({
    sourceFile: 'department-budgets.json',
    sourcePath: 'summary.reserves_and_contingencies',
    sourceValue: reservesContingencies,
    formula: 'Reserves drawdown and contingencies',
    calculatedValue: reservesContingencies
  });
  debugLog.push(`Reserves & Contingencies: £${reservesContingencies.toLocaleString()} (department-budgets.json → summary → reserves_and_contingencies)`);

  // Total Expenditure
  const totalExpenditure = expenditureComponents.reduce((sum, comp) => sum + comp.calculatedValue, 0);
  debugLog.push(`TOTAL EXPENDITURE: £${totalExpenditure.toLocaleString()}`);

  // Balance
  const balance = totalRevenue - totalExpenditure;
  debugLog.push(`\n=== BUDGET BALANCE ===`);
  debugLog.push(`Revenue: £${totalRevenue.toLocaleString()}`);
  debugLog.push(`Expenditure: £${totalExpenditure.toLocaleString()}`);
  debugLog.push(`Balance: £${balance.toLocaleString()} (${balance >= 0 ? 'SURPLUS' : 'DEFICIT'})`);

  return {
    baselineRevenue: {
      total: totalRevenue,
      components: revenueComponents
    },
    baselineExpenditure: {
      total: totalExpenditure,
      components: expenditureComponents
    },
    balance,
    debugLog
  };
}

/**
 * Calculate impact of Pillar 2 Tax toggle
 */
export function calculatePillar2Impact(enabled: boolean): CalculationTrace {
  const pillar2Revenue = forwardLooking.pillarTwoTax.projections["2025-26"];
  
  return {
    sourceFile: 'forward-looking.json',
    sourcePath: 'pillarTwoTax.projections.2025-26',
    sourceValue: pillar2Revenue,
    formula: enabled ? 'Pillar 2 enabled' : 'Pillar 2 disabled',
    calculatedValue: enabled ? pillar2Revenue : 0
  };
}

/**
 * Calculate Winter Bonus means-testing savings
 * IMPORTANT: This REDUCES expenditure, not increases revenue
 */
export function calculateWinterBonusSavings(meansTestOption: 'universal' | 'benefits' | 'age75'): CalculationTrace {
  const winterBonusBase = transferPayments.benefits.winterBonus.annual_cost;
  
  let savingsRate = 0;
  let formula = '';
  
  switch (meansTestOption) {
    case 'universal':
      savingsRate = 0;
      formula = 'Universal payment (no savings)';
      break;
    case 'benefits':
      savingsRate = 0.5; // Save 50% by limiting to benefits recipients
      formula = 'Benefits recipients only (50% savings)';
      break;
    case 'age75':
      savingsRate = 0.28; // Save 28% by limiting to age 75+
      formula = 'Age 75+ only (28% savings)';
      break;
  }
  
  const savings = winterBonusBase * savingsRate;
  
  return {
    sourceFile: 'transfer-payments.json',
    sourcePath: 'benefits.winterBonus.annual_cost',
    sourceValue: winterBonusBase,
    formula,
    calculatedValue: savings
  };
}

/**
 * Calculate National Insurance revenue changes
 */
export function calculateNIRevenueChange(
  employeeRateChange: number, 
  employerRateChange: number
): { employee: CalculationTrace; employer: CalculationTrace } {
  
  // Employee NI calculation
  const employeeBase = revenueStreams.nationalInsurance.employee.revenue;
  const employeeCurrentRate = revenueStreams.nationalInsurance.employee.rates.standard;
  const employeeNIBase = employeeBase / employeeCurrentRate; // Calculate taxable base
  const employeeRevenueChange = employeeNIBase * (employeeRateChange / 100);
  
  // Employer NI calculation
  const employerBase = revenueStreams.nationalInsurance.employer.revenue;
  const employerCurrentRate = revenueStreams.nationalInsurance.employer.rates.standard;
  const employerNIBase = employerBase / employerCurrentRate; // Calculate taxable base
  const employerRevenueChange = employerNIBase * (employerRateChange / 100);
  
  return {
    employee: {
      sourceFile: 'revenue-streams.json',
      sourcePath: 'nationalInsurance.employee',
      sourceValue: employeeBase,
      formula: `Base: £${employeeBase.toLocaleString()} / ${employeeCurrentRate} * ${employeeRateChange}%`,
      calculatedValue: employeeRevenueChange
    },
    employer: {
      sourceFile: 'revenue-streams.json',
      sourcePath: 'nationalInsurance.employer',
      sourceValue: employerBase,
      formula: `Base: £${employerBase.toLocaleString()} / ${employerCurrentRate} * ${employerRateChange}%`,
      calculatedValue: employerRevenueChange
    }
  };
}

/**
 * Calculate Vehicle Duty revenue change
 */
export function calculateVehicleDutyChange(adjustmentPercent: number): CalculationTrace {
  const vehicleDutyBase = revenueStreams.duties.vehicle.amount;
  const revenueChange = vehicleDutyBase * (adjustmentPercent / 100);
  
  return {
    sourceFile: 'revenue-streams.json',
    sourcePath: 'duties.vehicle.amount',
    sourceValue: vehicleDutyBase,
    formula: `Base: £${vehicleDutyBase.toLocaleString()} * ${adjustmentPercent}%`,
    calculatedValue: revenueChange
  };
}

/**
 * Calculate State Pension Age savings
 */
export function calculatePensionAgeSavings(newAge: number): CalculationTrace {
  const currentAge = 66;
  const yearsDifference = newAge - currentAge;
  
  if (yearsDifference <= 0) {
    return {
      sourceFile: 'transfer-payments.json',
      sourcePath: 'statePension',
      sourceValue: 0,
      formula: 'No increase in pension age',
      calculatedValue: 0
    };
  }
  
  const totalPensionCost = transferPayments.statePension.total_cost;
  const currentPensioners = transferPayments.statePension.demographics.current_pensioners;
  const newPensionersAnnual = transferPayments.statePension.demographics.new_pensioners_annual;
  const averagePension = totalPensionCost / currentPensioners;
  
  // For each year of age increase, save the cost of new pensioners that year
  // Plus knock-on effects (1.2x multiplier for administrative and social impacts)
  const savingsPerYear = newPensionersAnnual * averagePension * 1.2;
  const totalSavings = savingsPerYear * yearsDifference;
  
  return {
    sourceFile: 'transfer-payments.json',
    sourcePath: 'statePension.total_cost',
    sourceValue: totalPensionCost,
    formula: `${newPensionersAnnual} new pensioners × £${averagePension.toFixed(0)} avg × 1.2 factor × ${yearsDifference} years`,
    calculatedValue: totalSavings
  };
}

/**
 * Export debug information to console
 */
export function exportDebugLog(calculation: BudgetCalculation): void {
  console.group('🔍 BUDGET CALCULATION DEBUG LOG');
  calculation.debugLog.forEach(line => console.log(line));
  console.groupEnd();
}