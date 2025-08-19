# Product Requirements Document
## Isle of Man Government Master Policy Engine

**Version:** 2.0  
**Status:** Draft  
**Scope:** Comprehensive Government Budget & Policy Modeling Platform

---

## 1. Executive Summary

### 1.1 Vision
Transform the Isle of Man Pink Book from a static PDF into a dynamic, interconnected policy modeling platform that enables real-time scenario planning across the entire £1.46 billion government budget.

### 1.2 Core Capability
Enable the Chief Executive and Council of Ministers to model complex policy decisions in workshop settings, seeing immediate cross-department impacts, revenue implications, and trade-offs across all government operations.

---

## 2. Data Architecture

### 2.1 Input Data Requirements

#### 2.1.1 Revenue Streams (`revenue-streams.json`)
```typescript
interface RevenueStreams {
  incomeText: {
    current: number;  // £400m+
    bands: {
      standard: { rate: 0.10, threshold: 14500, revenue: number };
      higher: { rate: 0.22, threshold: 21000, revenue: number };
      cap: { amount: 220000, affected: number };
    };
    projections: YearlyProjection[];
  };
  
  nationalInsurance: {
    employee: { rates: NIRates, revenue: number };
    employer: { rates: NIRates, revenue: number };
    selfEmployed: { rates: NIRates, revenue: number };
    fund_balance: number;  // £1bn+ by 2030
  };
  
  corporateTax: {
    zeroRate: { companies: number, revenue: 0 };
    tenPercent: { companies: number, revenue: number };
    fifteenPercent: { companies: number, revenue: number };  // Banks/large retail
    petroleum: { rate: 0.20, revenue: number };
  };
  
  vat: {
    rate: 0.20;
    revenue: number;
    exemptions: string[];
  };
  
  duties: {
    vehicle: number;  // £16m
    alcohol: number;
    tobacco: number;
    fuel: number;
    customs: number;
  };
  
  otherIncome: {
    fees: number;
    charges: number;
    fines: number;
    investmentReturns: number;  // From £1.76bn reserves
  };
}
```

#### 2.1.2 Department Budgets (`department-budgets.json`)
```typescript
interface DepartmentBudgets {
  health_social_care: {
    total: number;  // £400m+ by 2028
    breakdown: {
      manxCare: number;
      publicHealth: number;
      socialServices: number;
      mentalHealth: number;
    };
    staff: { count: number, cost: number };
    pressures: string[];
  };
  
  education_sport_culture: {
    total: number;  // £141m
    breakdown: {
      schools: number;
      higherEducation: number;
      sports: number;
      culture: number;
    };
    capitalProjects: Project[];
  };
  
  infrastructure: {
    total: number;
    breakdown: {
      highways: number;  // £6.1m maintenance
      publicTransport: {
        buses: { subsidy: number, routes: number };
        heritageRail: { subsidy: number, operating_days: number };
      };
      ports: number;
      airport: number;
      utilities: number;
    };
  };
  
  cabinet_office: {
    total: number;
    breakdown: {
      administration: number;
      externalRelations: number;
      hr: number;
      it: number;
    };
  };
  
  home_affairs: {
    total: number;
    breakdown: {
      police: number;
      prison: number;
      fire: number;
      courts: number;
    };
  };
  
  treasury: {
    total: number;
    breakdown: {
      revenueServices: number;
      customs: number;
      socialSecurity: number;
    };
  };
  
  enterprise: {
    total: number;
    breakdown: {
      economicDevelopment: number;
      tourism: number;
      finance: number;
      digital: number;
    };
  };
  
  environment_food_agriculture: {
    total: number;
    breakdown: {
      environment: number;
      planning: number;
      agriculture: number;
      fisheries: number;
    };
  };
}
```

#### 2.1.3 Capital Programme (`capital-programme.json`)
```typescript
interface CapitalProgramme {
  total: number;  // £300m over 5 years
  annual: number;  // £87.4m in 2025-26
  projects: [
    {
      name: string;
      department: string;
      totalCost: number;
      yearlyCosts: Record<number, number>;
      status: 'planned' | 'approved' | 'in_progress' | 'completed';
      priority: 'critical' | 'high' | 'medium' | 'low';
      benefits: string[];
    }
  ];
  funds: {
    climateChange: number;  // £10m
    housingDeficiency: number;  // £9.5m
    projectDevelopment: number;
    economicStrategy: number;  // £47.9m unallocated
  };
}
```

#### 2.1.4 Transfer Payments (`transfer-payments.json`)
```typescript
interface TransferPayments {
  statePension: {
    basic: { weekly: 176.45, recipients: number, total: number };
    manx: { weekly: 251.30, recipients: number, total: number };
    increases: { rate: 0.041, triplelock: boolean };
  };
  
  benefits: {
    unemploymentBenefit: { rate: number, recipients: number };
    incomeSupport: { rate: number, recipients: number };
    disabilityAllowance: { rate: number, recipients: number };
    childBenefit: { rate: number, recipients: number };
    winterBonus: { amount: 400, recipients: number };
    housingBenefit: { total: number };
  };
  
  publicSectorPensions: {
    currentPensioners: number;
    annualCost: number;
    futureLibability: number;
  };
}
```

#### 2.1.5 Reserves & Funds (`reserves-funds.json`)
```typescript
interface ReservesAndFunds {
  generalReserve: {
    current: number;  // £1.76bn
    target2030: number;  // £2bn
    withdrawals: {
      2025: 110600000;
      2026: number;
      2027: number;
      2028: number;
      2029: number;
      2030: 49700000;
    };
  };
  
  nationalInsuranceFund: {
    current: number;
    projected2030: number;  // £1bn+
    sustainability: string;
  };
  
  specialFunds: {
    transformation: number;  // £5.3m
    economicStrategy: number;
    climateAction: number;
    housing: number;
  };
}
```

### 2.2 Output Requirements

#### 2.2.1 Scenario Results
```typescript
interface ScenarioResults {
  financial: {
    totalRevenue: number;
    totalExpenditure: number;
    surplus_deficit: number;
    reserveDrawdown: number;
    sustainabilityScore: number;
  };
  
  impacts: {
    byDepartment: Record<string, DepartmentImpact>;
    onCitizens: {
      averageTaxChange: number;
      serviceLevel: 'improved' | 'maintained' | 'reduced';
      winners: Group[];
      losers: Group[];
    };
    onBusiness: {
      competitiveness: number;
      taxBurden: number;
      growthOutlook: string;
    };
  };
  
  risks: {
    political: 'low' | 'medium' | 'high';
    implementation: string[];
    economic: string[];
    social: string[];
  };
  
  timeline: {
    implementation: Phase[];
    breakEven: number | null;
    fullBenefit: number;
  };
}
```

---

## 3. Core Modeling Engines

### 3.1 Revenue Optimization Engine
```typescript
interface RevenueOptimizer {
  inputs: {
    targetRevenue: number;
    constraints: {
      maxTaxIncrease: number;
      protectedGroups: string[];
      competitivenessThreshold: number;
    };
  };
  
  outputs: {
    optimalRates: TaxRates;
    revenueProjection: YearlyProjection[];
    economicImpact: ImpactAssessment;
  };
  
  features: [
    'Multi-variable optimization',
    'Behavioral response modeling',
    'Laffer curve consideration',
    'International competitiveness scoring'
  ];
}
```

### 3.2 Department Efficiency Analyzer
```typescript
interface EfficiencyAnalyzer {
  analyze(department: string): {
    currentEfficiency: number;
    benchmarks: International[];
    savings_opportunities: Opportunity[];
    service_impact: Assessment;
  };
  
  simulate_reduction(amount: number): {
    feasible: boolean;
    method: 'headcount' | 'procurement' | 'service_reduction' | 'efficiency';
    consequences: string[];
  };
}
```

### 3.3 Cross-Department Impact Modeler
```typescript
interface CrossImpactModeler {
  dependencies: {
    health_education: 0.3;  // Healthy kids learn better
    transport_economy: 0.5;  // Transport enables work
    housing_health: 0.4;    // Housing quality affects health
    // ... all cross-dependencies
  };
  
  calculate_ripple_effects(change: DepartmentChange): {
    direct: Impact;
    indirect: Impact[];
    total: Impact;
    timeline: Quarter[];
  };
}
```

### 3.4 Political Feasibility Scorer
```typescript
interface PoliticalFeasibility {
  score(scenario: Scenario): {
    overall: number;  // 0-100
    by_constituency: Record<string, number>;
    by_demographic: Record<string, number>;
    election_impact: 'positive' | 'neutral' | 'negative';
    media_reaction: Prediction;
  };
}
```

---

## 4. Workshop Mode Features

### 4.1 CEO Dashboard
```typescript
interface CEODashboard {
  displays: {
    current_state: {
      revenue: GaugeChart;
      expenditure: GaugeChart;
      reserve_trajectory: LineChart;
      key_metrics: MetricCard[];
    };
    
    scenario_workspace: {
      active_scenarios: Scenario[];
      comparison_table: ComparisonMatrix;
      winner_loser_analysis: ImpactChart;
    };
    
    decision_support: {
      recommendations: Recommendation[];
      risk_matrix: RiskMatrix;
      implementation_roadmap: Timeline;
    };
  };
}
```

### 4.2 Interactive Controls
```typescript
interface WorkshopControls {
  quick_scenarios: [
    'Find £50m savings',
    'Achieve reserve independence by 2030',
    'Make public transport free',
    'Reduce Heritage Railway to 5 days',
    'Implement NHS levy',
    'Optimize for population 100k'
  ];
  
  sliders: {
    tax_rates: TaxSlider[];
    department_budgets: BudgetSlider[];
    service_levels: ServiceSlider[];
  };
  
  toggles: {
    policy_options: PolicyToggle[];
    constraints: ConstraintToggle[];
  };
}
```

### 4.3 Real-time Collaboration
```typescript
interface CollaborationFeatures {
  multi_user: {
    concurrent_editing: boolean;
    role_based_access: Role[];
    change_tracking: AuditLog;
  };
  
  voting: {
    scenario_preference: VotingSystem;
    consensus_builder: ConsensusTools;
  };
  
  export: {
    presentation_mode: PowerPoint;
    report_generation: PDF;
    data_export: Excel;
  };
}
```

---

## 5. Implementation Priorities

### Phase 1: Core Infrastructure
- Data extraction from Pink Book
- Basic calculation engines
- Department budget modeling
- Revenue projection system

### Phase 2: Integration Layer
- Cross-department dependencies
- Reserve management modeling
- Political feasibility scoring
- Scenario comparison tools

### Phase 3: Advanced Analytics
- Optimization algorithms
- Monte Carlo simulations
- Behavioral modeling
- Economic impact assessment

### Phase 4: Workshop Features
- Real-time collaboration
- Presentation mode
- Consensus building tools
- Executive reporting

---

## 6. Success Metrics

### 6.1 Quantitative
- Model accuracy: ±2% of actual outcomes
- Calculation speed: <500ms for complex scenarios
- User adoption: 100% of senior officials within 6 months
- Scenarios tested: 50+ in first quarter
- Savings identified: £10m+ in first year

### 6.2 Qualitative
- Improved decision quality
- Faster policy development
- Better stakeholder buy-in
- Reduced political risk
- Enhanced transparency

---

## 7. Technical Architecture

### 7.1 Data Pipeline
```
Pink Book PDF → OCR/Parser → Validation → JSON/YAML → 
→ Data Store → Calculation Engines → API Layer → 
→ React Frontend → Visualization → Export
```

### 7.2 Technology Stack
- **Frontend:** Next.js, TypeScript, shadcn/ui, Recharts, D3.js
- **State:** Zustand with persistence
- **Backend:** Next.js API routes, Edge functions
- **Calculation:** WebAssembly for complex calculations
- **Export:** React-PDF, ExcelJS
- **Collaboration:** WebSockets for real-time updates

### 7.3 Performance Requirements
- Support 50 concurrent users
- Sub-second response for all interactions
- Handle 1M+ calculations per scenario
- Store 1000+ saved scenarios
- Generate reports in <10 seconds

---

## 8. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Data accuracy | Multi-source validation, audit trails |
| Model complexity | Phased rollout, extensive testing |
| User adoption | Training program, intuitive UI |
| Political sensitivity | Access controls, scenario privacy |
| Technical debt | Modular architecture, documentation |

---

## 9. Governance

### 9.1 Ownership
- **Executive Sponsor:** Chief Executive
- **Product Owner:** Chief Financial Officer
- **Technical Lead:** Head of Digital Services
- **User Champions:** Department heads

### 9.2 Review Process
- Weekly progress reviews during development
- Monthly steering committee
- Quarterly Council of Ministers demonstration
- Annual effectiveness assessment

---

## Document Control

| Version | Date | Description |
|---------|------|-------------|
| 2.0 | Current | Master Policy Engine PRD |