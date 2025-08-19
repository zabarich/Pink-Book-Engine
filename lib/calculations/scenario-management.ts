// Scenario Management - Save, Load, Export functionality

export interface ScenarioData {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  revenue_changes: {
    income_tax: {
      standard_rate_change: number;
      higher_rate_change: number;
    };
    national_insurance: {
      employee_rate_change: number;
      employer_rate_change: number;
    };
    corporate_tax: {
      banking_rate: number;
      retail_rate: number;
    };
    vat: {
      rate_change: number;
    };
    customs_excise: {
      alcohol_duty_change: number;
      tobacco_duty_change: number;
      fuel_duty_change: number;
    };
    new_revenues: {
      tourist_levy: number;
      airport_duty: number;
      gaming_duty: number;
    };
  };
  expenditure_changes: {
    department_adjustments: Record<string, number>;
    benefit_changes: {
      winter_bonus_reduction?: number;
      winter_bonus_means_test?: 'universal' | 'benefits' | 'age75';
      child_benefit_taper?: number;
      housing_benefit_cap?: number;
    };
    efficiency_measures: {
      shared_services: number;
      digital_transformation: number;
      procurement_centralization: number;
    };
    pay_policy: 'freeze' | '1%' | '2%' | '3%';
    capital_budget: number;
  };
  calculated_impact: {
    total_revenue_change: number;
    total_expenditure_change: number;
    net_budget_impact: number;
    reserve_impact: number;
    sustainability_years: number;
  };
  policy_options: string[];
  notes?: string;
}

/**
 * Generate unique scenario ID
 */
function generateScenarioId(): string {
  return `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Save scenario to localStorage
 */
export function saveScenario(scenarioData: Omit<ScenarioData, 'id' | 'created_at'>): string {
  const scenario: ScenarioData = {
    ...scenarioData,
    id: generateScenarioId(),
    created_at: new Date().toISOString()
  };
  
  try {
    // Save to localStorage
    localStorage.setItem(`scenario_${scenario.id}`, JSON.stringify(scenario));
    
    // Update scenarios index
    const scenariosIndex = getScenariosIndex();
    scenariosIndex.push({
      id: scenario.id,
      name: scenario.name,
      created_by: scenario.created_by,
      created_at: scenario.created_at,
      net_impact: scenario.calculated_impact.net_budget_impact
    });
    localStorage.setItem('scenarios_index', JSON.stringify(scenariosIndex));
    
    return scenario.id;
  } catch (error) {
    console.error('Failed to save scenario:', error);
    throw new Error('Failed to save scenario');
  }
}

/**
 * Load scenario from localStorage
 */
export function loadScenario(scenarioId: string): ScenarioData | null {
  try {
    const saved = localStorage.getItem(`scenario_${scenarioId}`);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load scenario:', error);
    return null;
  }
}

/**
 * Delete scenario
 */
export function deleteScenario(scenarioId: string): boolean {
  try {
    localStorage.removeItem(`scenario_${scenarioId}`);
    
    // Update scenarios index
    const scenariosIndex = getScenariosIndex();
    const filtered = scenariosIndex.filter(s => s.id !== scenarioId);
    localStorage.setItem('scenarios_index', JSON.stringify(filtered));
    
    return true;
  } catch (error) {
    console.error('Failed to delete scenario:', error);
    return false;
  }
}

/**
 * Get scenarios index
 */
function getScenariosIndex(): any[] {
  try {
    const index = localStorage.getItem('scenarios_index');
    return index ? JSON.parse(index) : [];
  } catch {
    return [];
  }
}

/**
 * List all saved scenarios
 */
export function listSavedScenarios(): Array<{
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  net_impact: number;
}> {
  return getScenariosIndex().sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

/**
 * Export scenario as JSON
 */
export function exportScenarioAsJSON(scenarioId: string): string {
  const scenario = loadScenario(scenarioId);
  if (!scenario) throw new Error('Scenario not found');
  
  return JSON.stringify(scenario, null, 2);
}

/**
 * Import scenario from JSON
 */
export function importScenarioFromJSON(jsonString: string): string {
  try {
    const scenario = JSON.parse(jsonString);
    // Generate new ID for imported scenario
    delete scenario.id;
    delete scenario.created_at;
    scenario.name = `${scenario.name} (Imported)`;
    
    return saveScenario(scenario);
  } catch (error) {
    console.error('Failed to import scenario:', error);
    throw new Error('Invalid scenario JSON');
  }
}

/**
 * Generate PDF report content
 */
export function generatePDFReportContent(scenario: ScenarioData): string {
  const formatCurrency = (amount: number) => {
    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? '-' : amount > 0 ? '+' : '';
    return `${sign}£${absAmount.toLocaleString()}`;
  };
  
  let content = `
ISLE OF MAN BUDGET SCENARIO REPORT
===================================
Scenario: ${scenario.name}
Created by: ${scenario.created_by}
Date: ${new Date(scenario.created_at).toLocaleDateString()}

EXECUTIVE SUMMARY
-----------------
Total Revenue Change: ${formatCurrency(scenario.calculated_impact.total_revenue_change)}
Total Expenditure Change: ${formatCurrency(scenario.calculated_impact.total_expenditure_change)}
Net Budget Impact: ${formatCurrency(scenario.calculated_impact.net_budget_impact)}
Reserve Impact: ${formatCurrency(scenario.calculated_impact.reserve_impact)}
Sustainability: ${scenario.calculated_impact.sustainability_years} years

REVENUE CHANGES
---------------
Income Tax:
  - Standard Rate: ${scenario.revenue_changes.income_tax.standard_rate_change > 0 ? '+' : ''}${scenario.revenue_changes.income_tax.standard_rate_change}%
  - Higher Rate: ${scenario.revenue_changes.income_tax.higher_rate_change > 0 ? '+' : ''}${scenario.revenue_changes.income_tax.higher_rate_change}%

National Insurance:
  - Employee Rate: ${scenario.revenue_changes.national_insurance.employee_rate_change > 0 ? '+' : ''}${scenario.revenue_changes.national_insurance.employee_rate_change}%
  - Employer Rate: ${scenario.revenue_changes.national_insurance.employer_rate_change > 0 ? '+' : ''}${scenario.revenue_changes.national_insurance.employer_rate_change}%

Corporate Tax:
  - Banking Rate: ${scenario.revenue_changes.corporate_tax.banking_rate}%
  - Retail Rate: ${scenario.revenue_changes.corporate_tax.retail_rate}%

VAT:
  - Rate Change: ${scenario.revenue_changes.vat.rate_change > 0 ? '+' : ''}${scenario.revenue_changes.vat.rate_change}%

New Revenue Sources:
  - Tourist Levy: £${scenario.revenue_changes.new_revenues.tourist_levy} per night
  - Airport Duty: £${scenario.revenue_changes.new_revenues.airport_duty} per passenger
  - Gaming Duty: ${scenario.revenue_changes.new_revenues.gaming_duty}%

EXPENDITURE CHANGES
-------------------
Department Adjustments:
${Object.entries(scenario.expenditure_changes.department_adjustments)
  .map(([dept, change]) => `  - ${dept}: ${change > 0 ? '+' : ''}${change}%`)
  .join('\n')}

Pay Policy: ${scenario.expenditure_changes.pay_policy} increase

Efficiency Measures:
  - Shared Services: £${scenario.expenditure_changes.efficiency_measures.shared_services}m
  - Digital Transformation: £${scenario.expenditure_changes.efficiency_measures.digital_transformation}m
  - Procurement: £${scenario.expenditure_changes.efficiency_measures.procurement_centralization}m

Capital Budget: £${scenario.expenditure_changes.capital_budget}m

POLICY OPTIONS SELECTED
-----------------------
${scenario.policy_options.join('\n')}

${scenario.notes ? `
NOTES
-----
${scenario.notes}
` : ''}

===================================
Generated: ${new Date().toISOString()}
`;
  
  return content;
}

/**
 * Generate Excel export data structure
 */
export function generateExcelData(scenario: ScenarioData): any[][] {
  const data: any[][] = [
    ['Isle of Man Budget Scenario Report'],
    [],
    ['Scenario Information'],
    ['Name', scenario.name],
    ['Created By', scenario.created_by],
    ['Date', new Date(scenario.created_at).toLocaleDateString()],
    [],
    ['Impact Summary'],
    ['Metric', 'Value'],
    ['Total Revenue Change', scenario.calculated_impact.total_revenue_change],
    ['Total Expenditure Change', scenario.calculated_impact.total_expenditure_change],
    ['Net Budget Impact', scenario.calculated_impact.net_budget_impact],
    ['Reserve Impact', scenario.calculated_impact.reserve_impact],
    ['Sustainability (years)', scenario.calculated_impact.sustainability_years],
    [],
    ['Revenue Changes'],
    ['Category', 'Item', 'Change'],
    ['Income Tax', 'Standard Rate', `${scenario.revenue_changes.income_tax.standard_rate_change}%`],
    ['Income Tax', 'Higher Rate', `${scenario.revenue_changes.income_tax.higher_rate_change}%`],
    ['National Insurance', 'Employee Rate', `${scenario.revenue_changes.national_insurance.employee_rate_change}%`],
    ['National Insurance', 'Employer Rate', `${scenario.revenue_changes.national_insurance.employer_rate_change}%`],
    ['Corporate Tax', 'Banking Rate', `${scenario.revenue_changes.corporate_tax.banking_rate}%`],
    ['Corporate Tax', 'Retail Rate', `${scenario.revenue_changes.corporate_tax.retail_rate}%`],
    ['VAT', 'Rate Change', `${scenario.revenue_changes.vat.rate_change}%`],
    [],
    ['Expenditure Changes'],
    ['Department', 'Adjustment'],
    ...Object.entries(scenario.expenditure_changes.department_adjustments)
      .map(([dept, change]) => [dept, `${change}%`]),
    [],
    ['Efficiency Measures'],
    ['Measure', 'Savings (£m)'],
    ['Shared Services', scenario.expenditure_changes.efficiency_measures.shared_services],
    ['Digital Transformation', scenario.expenditure_changes.efficiency_measures.digital_transformation],
    ['Procurement Centralization', scenario.expenditure_changes.efficiency_measures.procurement_centralization]
  ];
  
  return data;
}

/**
 * Compare multiple scenarios
 */
export function compareScenarios(scenarioIds: string[]): {
  revenue_comparison: Record<string, number[]>;
  expenditure_comparison: Record<string, number[]>;
  consensus_items: string[];
  divergent_items: string[];
  impact_range: {
    min: number;
    max: number;
    average: number;
  };
} {
  const scenarios = scenarioIds.map(id => loadScenario(id)).filter(s => s !== null) as ScenarioData[];
  
  if (scenarios.length === 0) {
    throw new Error('No valid scenarios found');
  }
  
  // Revenue comparison
  const revenue_comparison: Record<string, number[]> = {
    income_tax_standard: scenarios.map(s => s.revenue_changes.income_tax.standard_rate_change),
    income_tax_higher: scenarios.map(s => s.revenue_changes.income_tax.higher_rate_change),
    ni_employee: scenarios.map(s => s.revenue_changes.national_insurance.employee_rate_change),
    ni_employer: scenarios.map(s => s.revenue_changes.national_insurance.employer_rate_change),
    vat: scenarios.map(s => s.revenue_changes.vat.rate_change)
  };
  
  // Expenditure comparison
  const expenditure_comparison: Record<string, number[]> = {};
  const allDepartments = new Set<string>();
  scenarios.forEach(s => {
    Object.keys(s.expenditure_changes.department_adjustments).forEach(dept => allDepartments.add(dept));
  });
  
  allDepartments.forEach(dept => {
    expenditure_comparison[dept] = scenarios.map(s => 
      s.expenditure_changes.department_adjustments[dept] || 0
    );
  });
  
  // Find consensus items (appearing in >70% of scenarios)
  const consensus_items: string[] = [];
  const threshold = scenarios.length * 0.7;
  
  // Check for consensus on major policies
  const policyFrequency: Record<string, number> = {};
  scenarios.forEach(s => {
    s.policy_options.forEach(policy => {
      policyFrequency[policy] = (policyFrequency[policy] || 0) + 1;
    });
  });
  
  Object.entries(policyFrequency).forEach(([policy, count]) => {
    if (count >= threshold) {
      consensus_items.push(policy);
    }
  });
  
  // Find divergent items
  const divergent_items: string[] = [];
  Object.entries(revenue_comparison).forEach(([key, values]) => {
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (max - min > 5) { // More than 5% difference
      divergent_items.push(key);
    }
  });
  
  // Calculate impact range
  const impacts = scenarios.map(s => s.calculated_impact.net_budget_impact);
  const impact_range = {
    min: Math.min(...impacts),
    max: Math.max(...impacts),
    average: impacts.reduce((a, b) => a + b, 0) / impacts.length
  };
  
  return {
    revenue_comparison,
    expenditure_comparison,
    consensus_items,
    divergent_items,
    impact_range
  };
}