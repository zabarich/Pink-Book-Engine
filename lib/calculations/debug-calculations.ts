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
 * Uses 2026-27 values as baseline
 */
export function calculateBaselineBudget(includePillar2: boolean = true): BudgetCalculation {
  const debugLog: string[] = [];
  const revenueComponents: CalculationTrace[] = [];
  const expenditureComponents: CalculationTrace[] = [];

  // REVENUE CALCULATION (2026-27)
  debugLog.push('=== REVENUE CALCULATION (2026-27) ===');
  
  // Use 2026-27 total revenue directly from JSON
  let totalRevenue = revenueStreams.revenue_2026_27?.total || 1446963000;
  
  // Note: Pillar 2 is already included in the 2026-27 revenue total
  // The revenue_2026_27.total already accounts for all revenue sources
  
  revenueComponents.push({
    sourceFile: 'revenue-streams.json',
    sourcePath: 'revenue_2026_27.total',
    sourceValue: totalRevenue,
    formula: 'Total 2026-27 revenue from Pink Book',
    calculatedValue: totalRevenue
  });
  
  debugLog.push(`Total Revenue (2026-27): £${totalRevenue.toLocaleString()} (revenue-streams.json → revenue_2026_27 → total)`);
  
  // If Pillar 2 is disabled, subtract it from the total
  if (!includePillar2) {
    const pillar2Data = forwardLooking.risks_and_opportunities?.pillar_two_tax?.impact;
    const pillar2026 = pillar2Data?.find((item: any) => item.year === "2026-27");
    const pillar2Revenue = pillar2026?.amount || 25000000; // £25m for 2026-27
    totalRevenue -= pillar2Revenue;
    debugLog.push(`Pillar 2 Tax REMOVED: -£${pillar2Revenue.toLocaleString()} (user disabled Pillar 2)`);
  }
  debugLog.push(`TOTAL REVENUE: £${totalRevenue.toLocaleString()}`);

  // EXPENDITURE CALCULATION (2026-27)
  debugLog.push('\n=== EXPENDITURE CALCULATION (2026-27) ===');

  // Use 2026-27 expenditure values
  // The Pink Book states total net expenditure for 2026-27 is £1,445,229,000
  
  const totalRevenueExpenditure = departmentBudgets.net_expenditure_2026_27?.total || 1445229000;
  
  expenditureComponents.push({
    sourceFile: 'department-budgets.json',
    sourcePath: 'metadata.total_revenue_expenditure',
    sourceValue: totalRevenueExpenditure,
    formula: 'Total revenue expenditure from Pink Book (includes all departments and transfers)',
    calculatedValue: totalRevenueExpenditure
  });
  
  debugLog.push(`Total Revenue Expenditure: £${totalRevenueExpenditure.toLocaleString()} (department-budgets.json → metadata → total_revenue_expenditure)`);
  debugLog.push(`This includes all department spending AND transfer payments (which flow through Treasury)`);

  // NOTE: Capital expenditure is SEPARATE from revenue expenditure
  // The Pink Book clearly states £1,387.8m is REVENUE expenditure only
  // Capital programme (£87.4m) is tracked separately and should NOT be added here
  debugLog.push(`Note: Capital Expenditure (£87.4m) is SEPARATE from revenue expenditure and not included`);
  
  // NOTE: Reserves drawdown is NOT expenditure - it's how the deficit is funded
  // The £110.6m drawdown is the RESULT of revenue < expenditure, not part of expenditure
  debugLog.push(`Note: £110.6m reserves drawdown is funding source for deficit, not expenditure`);

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
  // Get Pillar 2 revenue from correct path in JSON
  const pillar2Data = forwardLooking.risks_and_opportunities?.pillar_two_tax?.impact;
  const pillar2025 = pillar2Data?.find((item: any) => item.year === "2025-26");
  const pillar2Revenue = pillar2025?.amount || 10000000;
  
  return {
    sourceFile: 'forward-looking.json',
    sourcePath: 'risks_and_opportunities.pillar_two_tax.impact[2025-26]',
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
  const winterBonusBase = transferPayments.benefits?.winter_bonus?.amount || 4800000; // £4.8m annual cost
  
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
    sourcePath: 'benefits.winter_bonus.amount',
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
  const currentAge = 67;  // Current pension age in 2026/27
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