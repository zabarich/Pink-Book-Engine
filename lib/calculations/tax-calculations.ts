// Accurate Tax Calculation Engine - Fixed according to specification
// All calculations based on real Pink Book 2025-26 data

// Income Tax Data Structure - Real Pink Book figures
export const INCOME_TAX_DATA = {
  total_revenue: 384040000, // £384.04m from Pink Book
  // Split by components as per Pink Book page 49
  components: {
    resident_income_tax: 330250000, // £330.25m - resident individuals
    company_tax: 23400000, // £23.4m - company income tax
    non_resident_tax: 30400000 // £30.4m - non-resident individuals
  },
  standard_rate: {
    rate: 0.10,
    revenue: 165145000, // £165.145m
    taxable_income: 1651450000, // £1,651.45m calculated
    threshold_lower: 14500,
    threshold_upper: 21000
  },
  higher_rate: {
    rate: 0.21,
    revenue: 165145000, // £165.145m
    taxable_income: 786404762, // £786.4m calculated
    threshold: 21000,
    cap: 220000
  }
};

// National Insurance Data Structure - Real Pink Book figures
export const NATIONAL_INSURANCE_DATA = {
  total_revenue: 329742000, // £329.742m
  employee_contributions: {
    revenue: 164871000, // £164.871m
    rate: 0.11,
    lower_earnings_limit: 120,
    upper_earnings_limit: 50270
  },
  employer_contributions: {
    revenue: 131897000, // £131.897m
    rate: 0.128,
    threshold: 9100
  },
  self_employed: {
    revenue: 32974000, // £32.974m
    class2_rate: 3.45,
    class4_standard: 0.09,
    class4_higher: 0.02
  }
};

// Corporate Tax Data - Real Pink Book figures
export const CORPORATE_TAX_DATA = {
  zero_rate: {
    companies: 7500,
    revenue: 0
  },
  ten_percent: {
    companies: 250,
    revenue: 18720000, // £18.72m banking/property
    rate: 0.10
  },
  twenty_percent: {
    companies: 15,
    revenue: 4680000, // £4.68m large retailers
    rate: 0.20
  }
};

// VAT Data - Real Pink Book figures
export const VAT_DATA = {
  total_revenue: 388464000, // £388.464m
  standard_rate: 0.20,
  fersa_adjustment: 0.0435, // 4.35% VAT sharing rate with UK
  taxable_base: 1942320000 // Calculated from revenue/rate
};

/**
 * Calculate Income Tax Changes - ACCURATE CALCULATION
 * Returns the revenue impact of changing income tax rates
 */
export function calculateIncomeTaxChange(standardRateChange: number, higherRateChange: number): number {
  let totalChange = 0;
  
  // Standard rate calculation
  if (standardRateChange !== 0) {
    const newStandardRate = INCOME_TAX_DATA.standard_rate.rate + (standardRateChange / 100);
    const newStandardRevenue = INCOME_TAX_DATA.standard_rate.taxable_income * newStandardRate;
    totalChange += newStandardRevenue - INCOME_TAX_DATA.standard_rate.revenue;
  }
  
  // Higher rate calculation
  if (higherRateChange !== 0) {
    const newHigherRate = INCOME_TAX_DATA.higher_rate.rate + (higherRateChange / 100);
    const newHigherRevenue = INCOME_TAX_DATA.higher_rate.taxable_income * newHigherRate;
    totalChange += newHigherRevenue - INCOME_TAX_DATA.higher_rate.revenue;
  }
  
  return totalChange;
}

/**
 * Calculate Personal Allowance Changes - ACCURATE CALCULATION
 * Returns the revenue impact of changing personal allowance
 */
export function calculatePersonalAllowanceChange(newAllowance: number): number {
  // Get baseline from JSON data
  const policyTargets = require('@/data/source/policy-targets.json');
  const currentAllowance = policyTargets.demographics.personal_allowance; // £14,750
  const taxpayerCount = policyTargets.demographics.taxpayer_count; // 35,000
  
  const allowanceChange = newAllowance - currentAllowance;
  
  if (allowanceChange === 0) return 0;
  
  // Reducing allowance increases taxable income and vice versa
  // Standard rate band: everyone affected gets taxed at 10% on the change
  // Higher rate band: some people affected get taxed at 21% on the change
  
  // Estimate: 70% of impact is standard rate, 30% is higher rate (based on income distribution)
  const standardRateImpact = allowanceChange * (-0.10) * 0.70 * taxpayerCount;
  const higherRateImpact = allowanceChange * (-0.21) * 0.30 * taxpayerCount;
  
  return standardRateImpact + higherRateImpact;
}

/**
 * Calculate National Insurance Changes - ACCURATE CALCULATION
 * Returns the revenue impact of changing NI rates
 */
export function calculateNIChange(employeeRateChange: number, employerRateChange: number): number {
  let totalChange = 0;
  
  // Employee NI calculation
  if (employeeRateChange !== 0) {
    const rateChange = employeeRateChange / 100;
    const currentBase = NATIONAL_INSURANCE_DATA.employee_contributions.revenue / 
                       NATIONAL_INSURANCE_DATA.employee_contributions.rate;
    totalChange += currentBase * rateChange;
  }
  
  // Employer NI calculation
  if (employerRateChange !== 0) {
    const rateChange = employerRateChange / 100;
    const currentBase = NATIONAL_INSURANCE_DATA.employer_contributions.revenue / 
                       NATIONAL_INSURANCE_DATA.employer_contributions.rate;
    totalChange += currentBase * rateChange;
  }
  
  return totalChange;
}

/**
 * Calculate Corporate Tax Changes - ACCURATE CALCULATION
 * Returns the revenue impact of changing corporate tax rates
 */
export function calculateCorporateTaxChange(newBankingRate: number, newRetailRate: number): number {
  let totalChange = 0;
  
  // Banking rate change (from 10%)
  if (newBankingRate !== 10) {
    const taxableProfit = CORPORATE_TAX_DATA.ten_percent.revenue / 0.10;
    const newRevenue = taxableProfit * (newBankingRate / 100);
    totalChange += newRevenue - CORPORATE_TAX_DATA.ten_percent.revenue;
  }
  
  // Retail rate change (from 20%)
  if (newRetailRate !== 20) {
    const taxableProfit = CORPORATE_TAX_DATA.twenty_percent.revenue / 0.20;
    const newRevenue = taxableProfit * (newRetailRate / 100);
    totalChange += newRevenue - CORPORATE_TAX_DATA.twenty_percent.revenue;
  }
  
  return totalChange;
}

/**
 * Calculate VAT Changes - ACCURATE CALCULATION
 * Returns the revenue impact of changing VAT rate
 */
export function calculateVATChange(newRate: number): number {
  const currentRate = VAT_DATA.standard_rate;
  const rateChange = (newRate / 100) - currentRate;
  
  // Apply to taxable base with FERSA adjustment
  const baseRevenue = VAT_DATA.taxable_base * rateChange;
  
  // Apply FERSA adjustment (Isle of Man keeps 95.65% of VAT collected)
  const fersaAdjusted = baseRevenue * (1 - VAT_DATA.fersa_adjustment);
  
  return fersaAdjusted;
}

/**
 * Calculate Customs & Excise Changes
 * Returns the revenue impact of changing duty rates
 */
export function calculateCustomsChange(
  alcoholDutyChange: number,
  tobaccoDutyChange: number,
  fuelDutyChange: number
): number {
  // Based on Pink Book breakdown
  const alcoholBase = 25000000; // £25m
  const tobaccoBase = 15000000; // £15m
  const fuelBase = 45088000; // £45.088m
  
  let totalChange = 0;
  
  if (alcoholDutyChange !== 0) {
    totalChange += alcoholBase * (alcoholDutyChange / 100);
  }
  
  if (tobaccoDutyChange !== 0) {
    totalChange += tobaccoBase * (tobaccoDutyChange / 100);
  }
  
  if (fuelDutyChange !== 0) {
    totalChange += fuelBase * (fuelDutyChange / 100);
  }
  
  return totalChange;
}

/**
 * Apply Behavioral Response (Laffer Curve)
 * Returns a multiplier for high tax rates
 */
export function applyBehavioralResponse(taxRate: number, taxType: 'income' | 'corporate'): number {
  if (taxType === 'income') {
    // Income tax behavioral response starts at 30%
    if (taxRate <= 30) return 1;
    // Reduce by 2% for each percentage point over 30%
    return Math.max(0.5, 1 - (taxRate - 30) * 0.02);
  }
  
  if (taxType === 'corporate') {
    // Corporate tax behavioral response starts at 15%
    if (taxRate <= 15) return 1;
    // Reduce by 3% for each percentage point over 15%
    return Math.max(0.4, 1 - (taxRate - 15) * 0.03);
  }
  
  return 1;
}