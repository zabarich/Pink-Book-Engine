// Debug Calculation Engine - Full traceability for all calculations
// This file ensures every monetary value traces back to source JSON data

import revenueStreams from '@/data/source/revenue-streams.json';
import departmentBudgets from '@/data/source/department-budgets.json';
import transferPayments from '@/data/source/transfer-payments.json';
import forwardLooking from '@/data/source/forward-looking.json';
import capitalProgramme from '@/data/source/capital-programme.json';

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

  // VAT
  const vatRevenue = revenueStreams.vat.revenue;
  revenueComponents.push({
    sourceFile: 'revenue-streams.json',
    sourcePath: 'vat.revenue',
    sourceValue: vatRevenue,
    formula: 'Direct from source',
    calculatedValue: vatRevenue
  });
  debugLog.push(`VAT: £${vatRevenue.toLocaleString()} (revenue-streams.json → vat → revenue)`);

  // Customs & Excise
  const customsRevenue = revenueStreams.customsExcise.revenue;
  revenueComponents.push({
    sourceFile: 'revenue-streams.json',
    sourcePath: 'customsExcise.revenue',
    sourceValue: customsRevenue,
    formula: 'Direct from source',
    calculatedValue: customsRevenue
  });
  debugLog.push(`Customs & Excise: £${customsRevenue.toLocaleString()} (revenue-streams.json → customsExcise → revenue)`);

  // Departmental Income
  const deptIncomeRevenue = revenueStreams.departmentalIncome.revenue;
  revenueComponents.push({
    sourceFile: 'revenue-streams.json',
    sourcePath: 'departmentalIncome.revenue',
    sourceValue: deptIncomeRevenue,
    formula: 'Direct from source',
    calculatedValue: deptIncomeRevenue
  });
  debugLog.push(`Departmental Income: £${deptIncomeRevenue.toLocaleString()} (revenue-streams.json → departmentalIncome → revenue)`);

  // Vehicle Duty
  const vehicleDutyRevenue = revenueStreams.duties.vehicle.amount;
  revenueComponents.push({
    sourceFile: 'revenue-streams.json',
    sourcePath: 'duties.vehicle.amount',
    sourceValue: vehicleDutyRevenue,
    formula: 'Direct from source',
    calculatedValue: vehicleDutyRevenue
  });
  debugLog.push(`Vehicle Duty: £${vehicleDutyRevenue.toLocaleString()} (revenue-streams.json → duties → vehicle → amount)`);

  // Other Revenue
  const otherRevenue = revenueStreams.otherIncome.revenue;
  revenueComponents.push({
    sourceFile: 'revenue-streams.json',
    sourcePath: 'otherIncome.revenue',
    sourceValue: otherRevenue,
    formula: 'Direct from source',
    calculatedValue: otherRevenue
  });
  debugLog.push(`Other Income: £${otherRevenue.toLocaleString()} (revenue-streams.json → otherIncome → revenue)`);

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

  // Department Budgets
  const departments = [
    { key: 'health_social_care', name: 'Health & Social Care' },
    { key: 'education_sport_culture', name: 'Education, Sport & Culture' },
    { key: 'infrastructure', name: 'Infrastructure' },
    { key: 'home_affairs', name: 'Home Affairs' },
    { key: 'treasury', name: 'Treasury' },
    { key: 'cabinet_office', name: 'Cabinet Office' },
    { key: 'enterprise', name: 'Enterprise' },
    { key: 'environment_food_agriculture', name: 'Environment, Food & Agriculture' }
  ];

  for (const dept of departments) {
    const deptBudget = (departmentBudgets as any)[dept.key].total;
    expenditureComponents.push({
      sourceFile: 'department-budgets.json',
      sourcePath: `${dept.key}.total`,
      sourceValue: deptBudget,
      formula: 'Direct from source',
      calculatedValue: deptBudget
    });
    debugLog.push(`${dept.name}: £${deptBudget.toLocaleString()} (department-budgets.json → ${dept.key} → total)`);
  }

  // Transfer Payments (State Pension + Benefits)
  const statePensionCost = transferPayments.statePension.total_cost;
  expenditureComponents.push({
    sourceFile: 'transfer-payments.json',
    sourcePath: 'statePension.total_cost',
    sourceValue: statePensionCost,
    formula: 'Direct from source',
    calculatedValue: statePensionCost
  });
  debugLog.push(`State Pension: £${statePensionCost.toLocaleString()} (transfer-payments.json → statePension → total_cost)`);

  const benefitsCost = transferPayments.benefits.total_cost;
  expenditureComponents.push({
    sourceFile: 'transfer-payments.json',
    sourcePath: 'benefits.total_cost',
    sourceValue: benefitsCost,
    formula: 'Direct from source',
    calculatedValue: benefitsCost
  });
  debugLog.push(`Benefits: £${benefitsCost.toLocaleString()} (transfer-payments.json → benefits → total_cost)`);

  const publicPensionsCost = transferPayments.publicSectorPensions.total_annual_cost;
  expenditureComponents.push({
    sourceFile: 'transfer-payments.json',
    sourcePath: 'publicSectorPensions.total_annual_cost',
    sourceValue: publicPensionsCost,
    formula: 'Direct from source',
    calculatedValue: publicPensionsCost
  });
  debugLog.push(`Public Sector Pensions: £${publicPensionsCost.toLocaleString()} (transfer-payments.json → publicSectorPensions → total_annual_cost)`);

  // Capital Programme
  const capitalSpending = capitalProgramme.summary.total_annual_allocation;
  expenditureComponents.push({
    sourceFile: 'capital-programme.json',
    sourcePath: 'summary.total_annual_allocation',
    sourceValue: capitalSpending,
    formula: 'Direct from source',
    calculatedValue: capitalSpending
  });
  debugLog.push(`Capital Programme: £${capitalSpending.toLocaleString()} (capital-programme.json → summary → total_annual_allocation)`);

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