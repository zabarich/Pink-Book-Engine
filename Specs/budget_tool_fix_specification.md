# Isle of Man Budget Tool - Emergency Fix Specification

## Executive Summary

The current budget tool contains catastrophic calculation errors throughout, using fake math and arbitrary multipliers instead of real fiscal modeling. This specification details the complete rebuild required to create a functional policy tool suitable for ministerial workshops.

---

## 1. Critical Issues Identified

### 1.1 Revenue Calculation Failures
- **Income Tax**: Shows £1.9m for all changes (should be £16.5m for standard rate, £7.9m for higher rate)
- **National Insurance**: Uses arbitrary × 0.5 multiplier, underestimating by 50%
- **Corporate Tax**: Hardcoded £500m base with no data source
- **Banking Tax**: Hardcoded £100m base
- **VAT**: Arbitrary × 0.9 multiplier claiming to be "FERSA adjustment"

### 1.2 Systemic Problems
- Arbitrary multipliers throughout (× 0.5, × 0.8, × 0.9)
- Revenue-based calculations instead of taxable income calculations
- Hardcoded values with comments like "rough estimate"
- Non-functional save/export features
- Missing proper tax band modeling

---

## 2. Data Foundation Requirements

### 2.1 Income Tax Data Structure
```javascript
const INCOME_TAX_DATA = {
  total_revenue: 384040000, // £384.04m from Pink Book
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
  },
  company_tax: 23400000, // £23.4m
  non_resident_tax: 30350000 // £30.35m
};
```

### 2.2 National Insurance Data Structure
```javascript
const NATIONAL_INSURANCE_DATA = {
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
```

### 2.3 Department Budget Data
```javascript
const DEPARTMENT_BUDGETS = {
  health_social_care: {
    total_expenditure: 369000000,
    net_expenditure: 298000000,
    income: 71000000,
    employee_costs: 180000000,
    staff_count: 3500
  },
  education_sport_culture: {
    total_expenditure: 161000000,
    net_expenditure: 150000000,
    income: 11000000,
    employee_costs: 75000000
  },
  // ... all departments with real Pink Book figures
};
```

---

## 3. Calculation Engine Rebuild

### 3.1 Income Tax Calculations

#### Current Broken Code:
```javascript
// BROKEN - DO NOT USE
newRevenue += incomeTaxBase * higherRateDiff * 0.5 * lafferMultiplier
newRevenue += incomeTaxBase * standardRateDiff * 0.5
```

#### Required Fix:
```javascript
function calculateIncomeTaxChange(standardRateChange, higherRateChange) {
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
```

### 3.2 National Insurance Calculations

#### Current Broken Code:
```javascript
// BROKEN - DO NOT USE
newRevenue += INITIAL_STATE.revenue.nationalInsurance * niDiff * 0.5
```

#### Required Fix:
```javascript
function calculateNIChange(employeeRateChange, employerRateChange) {
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
```

### 3.3 Corporate Tax Calculations

#### Current Broken Code:
```javascript
// BROKEN - DO NOT USE
newRevenue += 500000000 * (corporateTaxRate / 100) * 0.8
newRevenue += 100000000 * ((bankingTaxRate - 10) / 100)
```

#### Required Fix:
```javascript
const CORPORATE_TAX_DATA = {
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

function calculateCorporateTaxChange(newBankingRate, newRetailRate) {
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
```

---

## 4. Benefits and Welfare Calculations

### 4.1 State Pension Calculations

#### Current Broken Code:
```javascript
// BROKEN - DO NOT USE
if (!tripleLockEnabled) {
  newExpenditure -= 5000000 // Rough estimate
}
```

#### Required Fix:
```javascript
const STATE_PENSION_DATA = {
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

function calculatePensionChanges(options) {
  let totalChange = 0;
  
  // Triple lock modification
  if (options.modifyTripleLock) {
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
```

### 4.2 Benefits Calculations

#### Required Implementation:
```javascript
const BENEFITS_DATA = {
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
  // ... other benefits
};

function calculateBenefitChanges(changes) {
  let totalSavings = 0;
  
  // Winter bonus changes
  if (changes.winterBonusReduction) {
    const newRate = BENEFITS_DATA.winter_bonus.current_rate - changes.winterBonusReduction;
    const savings = BENEFITS_DATA.winter_bonus.recipients * changes.winterBonusReduction;
    totalSavings += savings;
  }
  
  // Child benefit means testing
  if (changes.childBenefitMeansTest) {
    const affectedFamilies = estimateAffectedFamilies(changes.childBenefitMeansTest.threshold);
    totalSavings += affectedFamilies * averageChildBenefitPerFamily();
  }
  
  return totalSavings;
}
```

---

## 5. Save/Export Functionality

### 5.1 Scenario Data Structure
```javascript
const ScenarioSchema = {
  id: string,
  name: string,
  created_by: string,
  created_at: timestamp,
  revenue_changes: {
    income_tax: {
      standard_rate_change: number,
      higher_rate_change: number
    },
    national_insurance: {
      employee_rate_change: number,
      employer_rate_change: number
    },
    corporate_tax: {
      banking_rate: number,
      retail_rate: number
    },
    // ... other revenue changes
  },
  expenditure_changes: {
    department_adjustments: {
      [department_name]: percentage_change
    },
    benefit_changes: {
      // ... benefit modifications
    },
    // ... other expenditure changes
  },
  calculated_impact: {
    total_revenue_change: number,
    total_expenditure_change: number,
    net_budget_impact: number,
    reserve_impact: number
  }
};
```

### 5.2 Save Functionality
```javascript
function saveScenario(scenarioData) {
  const scenario = {
    ...scenarioData,
    id: generateScenarioId(),
    created_at: new Date().toISOString(),
    calculated_impact: calculateTotalImpact(scenarioData)
  };
  
  // Save to localStorage for demo, database for production
  localStorage.setItem(`scenario_${scenario.id}`, JSON.stringify(scenario));
  
  return scenario.id;
}

function loadScenario(scenarioId) {
  const saved = localStorage.getItem(`scenario_${scenarioId}`);
  return saved ? JSON.parse(saved) : null;
}

function listSavedScenarios() {
  const scenarios = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('scenario_')) {
      const scenario = JSON.parse(localStorage.getItem(key));
      scenarios.push(scenario);
    }
  }
  return scenarios.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}
```

### 5.3 Export Functionality
```javascript
function exportScenario(scenarioId, format = 'pdf') {
  const scenario = loadScenario(scenarioId);
  if (!scenario) throw new Error('Scenario not found');
  
  switch (format) {
    case 'pdf':
      return generatePDFReport(scenario);
    case 'excel':
      return generateExcelReport(scenario);
    case 'json':
      return JSON.stringify(scenario, null, 2);
    default:
      throw new Error('Unsupported export format');
  }
}

function generatePDFReport(scenario) {
  // Implementation using jsPDF or similar
  const content = {
    title: `Budget Scenario: ${scenario.name}`,
    summary: generateScenarioSummary(scenario),
    revenue_changes: formatRevenueChanges(scenario.revenue_changes),
    expenditure_changes: formatExpenditureChanges(scenario.expenditure_changes),
    impact_analysis: formatImpactAnalysis(scenario.calculated_impact)
  };
  
  return generatePDF(content);
}
```

---

## 6. Comparison and Consensus Features

### 6.1 Multi-Scenario Comparison
```javascript
function compareScenarios(scenarioIds) {
  const scenarios = scenarioIds.map(id => loadScenario(id));
  
  return {
    revenue_comparison: compareRevenueChanges(scenarios),
    expenditure_comparison: compareExpenditureChanges(scenarios),
    consensus_items: findConsensusItems(scenarios),
    divergent_items: findDivergentItems(scenarios),
    impact_range: calculateImpactRange(scenarios)
  };
}

function findConsensusItems(scenarios, threshold = 0.7) {
  const consensusItems = [];
  const totalScenarios = scenarios.length;
  
  // Check each policy option across all scenarios
  const allPolicyOptions = extractAllPolicyOptions(scenarios);
  
  allPolicyOptions.forEach(option => {
    const adoptionCount = scenarios.filter(scenario => 
      isPolicyAdopted(scenario, option)
    ).length;
    
    const adoptionRate = adoptionCount / totalScenarios;
    
    if (adoptionRate >= threshold) {
      consensusItems.push({
        policy: option,
        adoption_rate: adoptionRate,
        adopted_by: adoptionCount,
        total_scenarios: totalScenarios
      });
    }
  });
  
  return consensusItems;
}
```

### 6.2 Ministerial Workshop Interface
```javascript
function generateMinisterialReport(ministerName, scenarios) {
  const consensusItems = findConsensusItems(scenarios);
  const ministerScenario = scenarios.find(s => s.created_by === ministerName);
  
  return {
    minister: ministerName,
    scenario_summary: ministerScenario ? generateScenarioSummary(ministerScenario) : null,
    consensus_alignment: calculateConsensusAlignment(ministerScenario, consensusItems),
    unique_proposals: findUniqueProposals(ministerScenario, scenarios),
    compromise_opportunities: identifyCompromiseOpportunities(ministerScenario, scenarios)
  };
}
```

---

## 7. £1m Policy Menu Implementation

### 7.1 Policy Options Database
```javascript
const POLICY_MENU = {
  enterprise: [
    {
      id: 'company_registration_fees',
      name: 'Increase Company Registration Fees',
      impact: 1000000,
      risk_level: 'low',
      implementation_complexity: 'low',
      calculation: () => {
        // Specific calculation based on current fee structure
        const currentFees = 150; // Current annual fee
        const companies = 7500; // Number of companies
        const increase = 50; // Proposed increase
        return companies * increase;
      }
    },
    {
      id: 'tourism_tax',
      name: 'Tourism Tax/Levy',
      impact: 1000000,
      risk_level: 'medium',
      implementation_complexity: 'medium',
      calculation: () => {
        const annualVisitors = 350000; // Estimated
        const taxPerVisitor = 3; // £3 per visitor
        return annualVisitors * taxPerVisitor;
      }
    },
    // ... all 50+ options with real calculations
  ],
  // ... other departments
};
```

### 7.2 Dynamic Policy Selection
```javascript
function calculatePolicyImpact(selectedPolicies) {
  let totalImpact = 0;
  let riskAssessment = { low: 0, medium: 0, high: 0 };
  
  selectedPolicies.forEach(policyId => {
    const policy = findPolicyById(policyId);
    if (policy) {
      totalImpact += policy.calculation();
      riskAssessment[policy.risk_level]++;
    }
  });
  
  return {
    total_impact: totalImpact,
    risk_distribution: riskAssessment,
    feasibility_score: calculateFeasibilityScore(riskAssessment),
    implementation_timeline: estimateImplementationTimeline(selectedPolicies)
  };
}
```

---

## 8. Implementation Priority

### Phase 1: Critical Fixes (Immediate)
1. **Replace all broken tax calculations** with proper formulas
2. **Remove arbitrary multipliers** throughout the codebase
3. **Implement basic save/load functionality**
4. **Fix department budget calculations** (these seem mostly correct)

### Phase 2: Enhanced Functionality (Week 2)
1. **Add detailed benefits/welfare calculations**
2. **Implement proper corporate tax modeling**
3. **Add export functionality** (PDF/Excel)
4. **Create policy comparison features**

### Phase 3: Ministerial Workshop Features (Week 3)
1. **Build consensus identification tools**
2. **Add risk assessment framework**
3. **Implement £1m policy menu**
4. **Create ministerial reporting dashboard**

### Phase 4: Polish and Validation (Week 4)
1. **Validate all calculations against Pink Book**
2. **Add comprehensive error handling**
3. **Implement data validation**
4. **Create user documentation**

---

## 9. Testing Requirements

### 9.1 Calculation Validation Tests
```javascript
describe('Income Tax Calculations', () => {
  test('Standard rate 10% to 11% should increase revenue by £16.5m', () => {
    const result = calculateIncomeTaxChange(1, 0); // 1% increase, 0% higher rate
    expect(result).toBeCloseTo(16500000, 0);
  });
  
  test('Higher rate 21% to 22% should increase revenue by £7.9m', () => {
    const result = calculateIncomeTaxChange(0, 1); // 0% standard, 1% higher rate
    expect(result).toBeCloseTo(7900000, 0);
  });
  
  test('Both rates changed should sum correctly', () => {
    const result = calculateIncomeTaxChange(1, 1);
    expect(result).toBeCloseTo(24400000, 0); // £16.5m + £7.9m
  });
});
```

### 9.2 Integration Tests
- Test complete scenario calculation
- Verify save/load functionality
- Test export formats
- Validate consensus detection

### 9.3 User Acceptance Tests
- Ministerial workshop simulation
- Policy comparison workflows
- Error handling scenarios
- Performance under load

---

## 10. Success Criteria

### 10.1 Functional Requirements
- [ ] All tax calculations produce accurate results within 1% tolerance
- [ ] Save/export functionality works for all supported formats
- [ ] Consensus detection identifies common policies across scenarios
- [ ] All 50+ £1m policies calculate correctly
- [ ] Department budget adjustments scale proportionally

### 10.2 User Experience Requirements
- [ ] Ministers can create scenarios in under 10 minutes
- [ ] Comparison view clearly shows consensus vs divergent items
- [ ] Risk indicators help guide policy selection
- [ ] Export reports are suitable for Cabinet presentation

### 10.3 Data Integrity Requirements
- [ ] All calculations traceable to Pink Book sources
- [ ] No hardcoded values without clear documentation
- [ ] Validation prevents impossible scenarios (negative budgets, etc.)
- [ ] Historical scenario data preserved for analysis

---

## 11. Risk Mitigation

### 11.1 Technical Risks
- **Calculation Errors**: Implement comprehensive test suite
- **Data Corruption**: Add validation and backup mechanisms
- **Performance Issues**: Optimize calculations and implement caching

### 11.2 Political Risks
- **Wrong Policy Advice**: Validate against expert economist review
- **Tool Misuse**: Add clear disclaimers and guidance
- **Transparency Concerns**: Ensure all calculations are auditable

### 11.3 Implementation Risks
- **Timeline Pressure**: Prioritize critical fixes first
- **Resource Constraints**: Focus on ministerial workshop functionality
- **Quality Assurance**: Cannot compromise on calculation accuracy

---

This specification provides a complete roadmap for rebuilding the budget tool into a reliable policy analysis platform suitable for real government decision-making.