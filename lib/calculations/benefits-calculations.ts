// Benefits and Welfare Calculations - Accurate figures from Pink Book

// State Pension Data - Real Pink Book figures
export const STATE_PENSION_DATA = {
  total_cost: 245000000, // £245m
  basic_pension: {
    weekly_rate: 176.45,
    annual_rate: 9175.40,
    recipients: 15000,
    total_cost: 137632500
  },
  manx_pension: {
    weekly_rate: 251.30,
    annual_rate: 13067.60,
    recipients: 8200,
    total_cost: 107154320
  },
  triple_lock_increase: 0.041 // 4.1% current year
};

// Benefits Data - Real Pink Book figures
export const BENEFITS_DATA = {
  winter_bonus: {
    current_rate: 400,
    recipients: 18000,
    total_cost: 7200000
  },
  child_benefit: {
    first_child_rate: 25.60,
    other_children_rate: 16.95,
    families: 8500,
    total_children: 14000,
    total_cost: 12000000
  },
  housing_benefit: {
    recipients: 3200,
    average_monthly: 450,
    total_cost: 17280000
  },
  income_support: {
    recipients: 2100,
    average_weekly: 145,
    total_cost: 15834000
  },
  disability_benefits: {
    recipients: 4500,
    average_annual: 5200,
    total_cost: 23400000
  },
  jobseekers_allowance: {
    recipients: 350,
    average_weekly: 85,
    total_cost: 1547000
  },
  employed_persons_allowance: {
    recipients: 1200,
    average_annual: 3600,
    total_cost: 4320000
  },
  nursing_care_contribution: {
    recipients: 800,
    weekly_rate: 135,
    total_cost: 5616000
  }
};

/**
 * Calculate Pension Policy Changes
 * Returns the cost impact of pension policy modifications
 */
export function calculatePensionChanges(options: {
  modifyTripleLock?: boolean;
  newTripleLockRate?: number;
  retirementAgeIncrease?: number;
  meansTestingThreshold?: number;
}): number {
  let totalChange = 0;
  
  // Triple lock modification
  if (options.modifyTripleLock && options.newTripleLockRate !== undefined) {
    const currentIncrease = STATE_PENSION_DATA.total_cost * STATE_PENSION_DATA.triple_lock_increase;
    const newIncrease = STATE_PENSION_DATA.total_cost * (options.newTripleLockRate / 100);
    totalChange += newIncrease - currentIncrease;
  }
  
  // Retirement age change
  if (options.retirementAgeIncrease) {
    const affectedPopulation = options.retirementAgeIncrease * 400; // ~400 people per year
    const averageAnnualPension = STATE_PENSION_DATA.total_cost / 
                                (STATE_PENSION_DATA.basic_pension.recipients + 
                                 STATE_PENSION_DATA.manx_pension.recipients);
    totalChange -= affectedPopulation * averageAnnualPension;
  }
  
  // Means testing
  if (options.meansTestingThreshold) {
    const estimatedAffected = calculateMeansTestAffected(options.meansTestingThreshold);
    totalChange -= estimatedAffected.savings;
  }
  
  return totalChange;
}

/**
 * Calculate means testing impact
 */
function calculateMeansTestAffected(threshold: number): { affected: number; savings: number } {
  // Estimate based on income distribution
  const totalRecipients = STATE_PENSION_DATA.basic_pension.recipients + 
                         STATE_PENSION_DATA.manx_pension.recipients;
  
  // Rough estimate: 20% have income above £50k, 10% above £75k, 5% above £100k
  let affectedPercentage = 0;
  if (threshold <= 50000) affectedPercentage = 0.20;
  else if (threshold <= 75000) affectedPercentage = 0.10;
  else if (threshold <= 100000) affectedPercentage = 0.05;
  else affectedPercentage = 0.02;
  
  const affected = Math.round(totalRecipients * affectedPercentage);
  const averagePension = STATE_PENSION_DATA.total_cost / totalRecipients;
  const savings = affected * averagePension * 0.5; // Assume 50% reduction for means tested
  
  return { affected, savings };
}

/**
 * Calculate Benefit Changes
 * Returns the savings from benefit modifications
 */
export function calculateBenefitChanges(changes: {
  winterBonusReduction?: number;
  winterBonusMeansTest?: 'universal' | 'benefits' | 'age75';
  childBenefitMeansTest?: { threshold: number };
  childBenefitTaper?: number;
  housingBenefitCap?: number;
  disabilityReassessment?: boolean;
}): number {
  let totalSavings = 0;
  
  // Winter bonus changes
  if (changes.winterBonusReduction) {
    const savings = BENEFITS_DATA.winter_bonus.recipients * changes.winterBonusReduction;
    totalSavings += savings;
  }
  
  if (changes.winterBonusMeansTest) {
    switch (changes.winterBonusMeansTest) {
      case 'benefits':
        // Only pay to those on income support/housing benefit (~50%)
        totalSavings += BENEFITS_DATA.winter_bonus.total_cost * 0.5;
        break;
      case 'age75':
        // Only pay to those over 75 (~30% of recipients)
        totalSavings += BENEFITS_DATA.winter_bonus.total_cost * 0.7;
        break;
    }
  }
  
  // Child benefit means testing
  if (changes.childBenefitMeansTest) {
    const affectedFamilies = estimateAffectedFamilies(changes.childBenefitMeansTest.threshold);
    const averageBenefit = BENEFITS_DATA.child_benefit.total_cost / BENEFITS_DATA.child_benefit.families;
    totalSavings += affectedFamilies * averageBenefit;
  }
  
  // Child benefit taper
  if (changes.childBenefitTaper) {
    totalSavings += changes.childBenefitTaper;
  }
  
  // Housing benefit cap
  if (changes.housingBenefitCap) {
    // Estimate savings based on cap level
    const currentAverage = BENEFITS_DATA.housing_benefit.average_monthly;
    if (changes.housingBenefitCap < currentAverage) {
      const reduction = currentAverage - changes.housingBenefitCap;
      const affectedRecipients = BENEFITS_DATA.housing_benefit.recipients * 0.3; // Top 30%
      totalSavings += affectedRecipients * reduction * 12; // Annual saving
    }
  }
  
  // Disability reassessment
  if (changes.disabilityReassessment) {
    // Assume 10% reduction through stricter assessment
    totalSavings += BENEFITS_DATA.disability_benefits.total_cost * 0.1;
  }
  
  return totalSavings;
}

/**
 * Estimate families affected by child benefit means testing
 */
function estimateAffectedFamilies(threshold: number): number {
  // Based on income distribution
  let affectedPercentage = 0;
  if (threshold <= 50000) affectedPercentage = 0.25;
  else if (threshold <= 75000) affectedPercentage = 0.15;
  else if (threshold <= 100000) affectedPercentage = 0.08;
  else affectedPercentage = 0.03;
  
  return Math.round(BENEFITS_DATA.child_benefit.families * affectedPercentage);
}

/**
 * Calculate Public Sector Pay Impact
 */
export function calculatePayBillChange(
  currentPayBill: number,
  payChange: 'freeze' | '1%' | '2%' | '3%'
): number {
  const rates = {
    'freeze': 0,
    '1%': 0.01,
    '2%': 0.02,
    '3%': 0.03
  };
  
  return currentPayBill * rates[payChange];
}

/**
 * Calculate Efficiency Savings
 */
export function calculateEfficiencySavings(options: {
  sharedServices?: number; // 0-15m
  digitalTransformation?: number; // 0-20m
  procurementCentralization?: number; // 0-10m
  estateRationalization?: number; // 0-8m
}): number {
  let totalSavings = 0;
  
  if (options.sharedServices) {
    totalSavings += Math.min(15000000, options.sharedServices * 1000000);
  }
  
  if (options.digitalTransformation) {
    totalSavings += Math.min(20000000, options.digitalTransformation * 1000000);
  }
  
  if (options.procurementCentralization) {
    totalSavings += Math.min(10000000, options.procurementCentralization * 1000000);
  }
  
  if (options.estateRationalization) {
    totalSavings += Math.min(8000000, options.estateRationalization * 1000000);
  }
  
  return totalSavings;
}