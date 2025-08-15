# Isle of Man Budget Explorer - Clean Data Specification

## Executive Summary
Build a single-user Budget Explorer that uses ONLY verified Pink Book data to enable exploration of the £1.4 billion Isle of Man government budget. This tool presents options and calculates impacts without making prescriptive recommendations, clearly distinguishing between Pink Book facts and user-derived calculations.

## Core Architecture

### Technology Stack
- **Frontend**: Next.js 14+ with App Router
- **UI Components**: shadcn/ui + Tailwind CSS
- **State Management**: Zustand with persistence
- **Calculations**: TypeScript with WebAssembly for complex models
- **Visualizations**: Recharts + D3.js
- **Data**: Clean JSON files from `/data/raw/` (Pink Book only)
- **Derived Data**: User calculations in `/data/derived/`
- **Citations**: Every number includes source reference

## Page Structure

### 1. Core Dashboard (`app/page.tsx`)

#### Current State Display (Pink Book Data)
- **Revenue**: £1.389bn (Pink Book p.6)
- **Expenditure**: £1.388bn (Pink Book p.6)
- **Surplus/Deficit**: £1.265m (Pink Book p.6)
- **Reserve Drawdown**: £70.3m (Pink Book p.12)
- **Reserve Balance**: £1.852bn (Pink Book p.19)

Each value displays with source badge: 🟢 Pink Book | 🟡 User Calculation

#### 5-Year Projections
- Revenue growth trajectory
- Expenditure trends
- Reserve depletion/growth path
- Structural deficit evolution

#### Exploration Metrics (User Derived)
- **Reserve Runway**: "If current trends continue" calculation
- **Structural Balance**: User scenario vs Pink Book baseline
- **Tax Comparison**: Your rates vs other jurisdictions
- **Budget Impact**: Difference from Pink Book figures

Note: These are simplified calculations based on your inputs

#### Department Spending Breakdown
Visual breakdown of all 8 departments:
- Health & Social Care: £357m
- Education, Sport & Culture: £141m
- Infrastructure: £116m
- Home Affairs: £75m
- Cabinet Office: £45m
- Treasury: £460m
- Enterprise: £35m
- Environment, Food & Agriculture: £25m

#### Revenue Composition
- Income Tax: £384m
- VAT: £388m
- National Insurance: £330m
- Customs & Excise: £86m
- Departmental Income: £151m
- Other: £50m

### 2. Exploration Interface (`app/explore/page.tsx`)

**Principle**: Present options without prescriptions. Show what "could" happen, not what "should" happen.

#### Revenue Controls Panel

##### Income Tax Explorer
"Explore different income tax rates:" (not "Optimize your tax rates")
```typescript
{
  personalAllowance: {
    current: 14500,
    range: [10000, 20000],
    step: 500
  },
  standardRate: {
    current: 0.10,
    range: [0.08, 0.15],
    step: 0.005
  },
  higherRate: {
    current: 0.21,
    range: [0.18, 0.30],
    step: 0.005
  },
  higherThreshold: {
    current: 21000,
    range: [15000, 30000],
    step: 1000
  },
  taxCap: {
    current: 220000,
    range: [150000, 500000],
    step: 10000
  }
}
```

##### Corporate Tax Controls
```typescript
{
  standardRate: {
    current: 0,
    range: [0, 0.10],
    step: 0.01
  },
  bankingRate: {
    current: 0.15,
    range: [0.10, 0.20],
    step: 0.01
  },
  largeRetailRate: {
    current: 0.15,
    range: [0.10, 0.20],
    step: 0.01
  }
}
```

##### National Insurance Controls
```typescript
{
  employeeRate: {
    current: 0.11,
    range: [0.09, 0.15],
    step: 0.005
  },
  employerRate: {
    current: 0.128,
    range: [0.10, 0.15],
    step: 0.005
  },
  upperEarningsLimit: {
    current: 50270,
    range: [40000, 75000],
    step: 1000
  }
}
```

##### VAT Control
```typescript
{
  standardRate: {
    current: 0.20,
    range: [0.15, 0.25],
    step: 0.005
  }
}
```

##### Vehicle Duty Control
Integration with original vehicle duty model:
- Base rates: £65-724
- First registration supplement
- Electric vehicle discount
- Revenue projection: £16m baseline

##### New Revenue Toggles
```typescript
{
  nhsLevy: {
    enabled: false,
    amount: [0, 10, 25, 50], // £m options
    description: "Dedicated health funding"
  },
  tourismTax: {
    enabled: false,
    perNight: [0, 2, 5, 10], // £ per night
    projectedYield: [0, 3, 7, 10] // £m
  },
  digitalServicesTax: {
    enabled: false,
    rate: [0, 0.02, 0.03, 0.05],
    projectedYield: [0, 5, 10, 20] // £m
  }
}
```

#### Expenditure Controls Panel

##### Department Budget Sliders
Each department gets an adjustment slider:
```typescript
{
  health: {
    base: 357000000,
    adjustment: 0, // -20% to +20%
    minimum: 285600000,
    maximum: 428400000
  },
  education: {
    base: 141000000,
    adjustment: 0,
    minimum: 112800000,
    maximum: 169200000
  },
  // ... all 8 departments
}
```

##### Department Efficiency Factor
```typescript
{
  globalEfficiency: 0, // 0-10% savings
  departmentSpecific: {
    health: 0,
    education: 0,
    infrastructure: 0,
    // ... per department overrides
  }
}
```

#### Major Policy Toggles Panel

##### Public Sector Pay
```typescript
{
  payIncrease: {
    options: ["freeze", "1%", "2%", "3%", "inflation"],
    baseCost: 507240000,
    impactPerPercent: 5072400
  }
}
```

##### Pension Reform
```typescript
{
  pensionScheme: {
    options: ["current", "reformed", "hybrid"],
    savings: {
      current: 0,
      reformed: 20000000,
      hybrid: 10000000
    }
  }
}
```

##### Benefits Uprating
```typescript
{
  uprating: {
    options: ["0%", "inflation-1%", "inflation", "inflation+1%"],
    baseCost: 87943000,
    inflationRate: 0.041
  }
}
```

##### Capital Programme
```typescript
{
  annualCapital: {
    options: [60000000, 87400000, 100000000],
    current: 87400000
  }
}
```

##### Service Policies
```typescript
{
  freePublicTransport: {
    enabled: false,
    cost: 12000000,
    currentSubsidy: 5000000
  },
  heritageRailway: {
    operatingDays: {
      current: 365, // Pink Book assumption
      userInput: 365,
      impact: "Calculation: (365 - userDays) / 365 * £2.25m"
    }
  },
  schoolConsolidation: {
    enabled: false,
    savings: 10000000,
    serviceImpact: "medium"
  }
}
```

#### Reserve Strategy Panel

```typescript
{
  targetBalance: {
    options: [1500000000, 2000000000, 2500000000],
    current: 2000000000
  },
  drawdownPath: {
    options: ["aggressive", "moderate", "conservative"],
    current: "moderate"
  },
  investmentReturn: {
    options: [0.03, 0.045, 0.06],
    current: 0.045,
    riskLevel: ["low", "medium", "high"]
  }
}
```

### 3. Real-Time Calculation Engine

#### Revenue Calculations

##### Behavioral Response Models
```typescript
class RevenueCalculator {
  calculateIncomeTax(params: TaxParams): RevenueResult {
    const behavioral = this.lafferCurve(params.rate);
    const competitive = this.competitionEffect(params.rate);
    const growth = this.growthImpact(params.rate);
    
    return {
      gross: baseYield * (1 + rateChange),
      behavioral: gross * behavioral,
      net: gross * behavioral * competitive * growth,
      confidence: this.confidenceInterval()
    };
  }
  
  lafferCurve(rate: number): number {
    // Diminishing returns above 40% total rate
    const optimal = 0.37;
    if (rate <= optimal) return 1;
    return Math.max(0.5, 1 - Math.pow((rate - optimal) / 0.3, 2));
  }
  
  competitionEffect(rate: number): number {
    // People leave if tax > UK by 5%+
    const ukRate = 0.45;
    const differential = rate - ukRate;
    if (differential <= 0) return 1;
    return Math.max(0.7, 1 - differential * 2);
  }
}
```

#### Expenditure Impact Calculations

##### Service Level Indicators
```typescript
interface ServiceLevel {
  health: {
    current: number;
    minimum: number;
    calculation: (budget: number) => number;
    impacts: {
      waitingTimes: number;
      staffRatios: number;
      serviceAvailability: number;
    };
  };
  // ... for each department
}
```

##### Cross-Department Dependencies
```typescript
const dependencies = {
  health_education: 0.3,
  transport_economy: 0.5,
  housing_health: 0.4,
  police_social: 0.3
};

function calculateRippleEffects(change: DepartmentChange): Impact {
  // Calculate secondary impacts
}
```

#### Sustainability Metrics

```typescript
class SustainabilityCalculator {
  calculateMetrics(scenario: Scenario): Metrics {
    return {
      reserveRunway: this.yearsUntilDepletion(scenario),
      structuralBalance: this.getStructuralBalance(scenario),
      debtSustainability: this.debtToGDP(scenario),
      generationalFairness: this.fairnessIndex(scenario),
      sustainabilityScore: this.overallScore(scenario)
    };
  }
  
  yearsUntilDepletion(scenario: Scenario): number {
    let balance = scenario.currentReserves;
    let years = 0;
    
    while (balance > 0 && years < 50) {
      balance += scenario.annualSurplus[years];
      balance *= (1 + scenario.investmentReturn);
      years++;
    }
    
    return years;
  }
}
```

### 4. Preset Scenarios

```typescript
const explorationExamples = {
  "Explore Budget Balance": {
    description: "What changes could lead to a balanced budget?",
    changes: {
      incomeHigherRate: 0.22,
      efficiency: 0.05,
      capitalProgramme: 60000000
    }
  },
  "Low Tax Island": {
    description: "Minimize taxes, reduce services",
    changes: {
      incomeHigherRate: 0.18,
      corporateStandard: 0,
      departmentCuts: 0.15,
      capitalProgramme: 40000000
    }
  },
  "High Service Nordic": {
    description: "High tax, high quality services",
    changes: {
      incomeHigherRate: 0.28,
      vat: 0.23,
      nhsLevy: 50000000,
      departmentIncreases: 0.10
    }
  },
  "Crisis Response": {
    description: "Handle 20% revenue drop",
    changes: {
      revenueShock: -0.20,
      efficiency: 0.10,
      payFreeze: true,
      reserveDrawdown: "aggressive"
    }
  },
  "Growth Strategy": {
    description: "Invest for 100k population",
    changes: {
      capitalProgramme: 100000000,
      infrastructure: 0.20,
      enterprise: 0.30,
      digitalTax: 20000000
    }
  },
  "Climate Priority": {
    description: "Double climate spending",
    changes: {
      climateCapital: 100000000,
      carbonTax: true,
      fossilSubsidyRemoval: true
    }
  },
  "Explore £50m Adjustment": {
    description: "What combination of changes could adjust the budget by £50m?",
    changes: {
      efficiency: 0.07,
      pensionReform: "reformed",
      procurementSavings: 10000000,
      propertyRationalization: 5000000
    }
  }
};
```

### 5. Visualization Panels

#### Revenue Waterfall Chart
Show incremental impact of each tax change:
- Baseline → Income tax change → NI change → VAT change → New revenues → Total

#### Expenditure Sankey Diagram
Flow visualization:
- Total Budget → Departments → Services → Outcomes

#### Reserve Trajectory Chart
10-year projection with confidence bands:
- Current policy
- Scenario policy
- Best/worst case bands

#### Sustainability Dashboard
Traffic light system:
- 🟢 Green: Sustainable (>5 years runway)
- 🟡 Amber: Caution (2-5 years)
- 🔴 Red: Critical (<2 years)

#### Winners/Losers Matrix
2x2 grid showing impact by group:
- Pensioners
- Working families
- Businesses
- Young people

#### Implementation Timeline
Gantt chart showing:
- Immediate changes (Month 1)
- Legislative requirements (Months 2-6)
- Full implementation (Year 1)
- Review points

### 6. Constraints & Warnings System

```typescript
interface Constraints {
  minimumService: {
    health: 250000000, // Below = service collapse
    education: 100000000,
    police: 25000000
  },
  politicalFeasibility: {
    maxCut: 0.10, // >10% = high risk
    maxTaxIncrease: 0.05 // >5% = high risk
  },
  competitiveness: {
    maxTaxDifferential: 0.05, // vs UK
    corporateTaxCeiling: 0.125 // vs Ireland
  },
  reserveDanger: {
    minimum: 1000000000,
    critical: 750000000
  }
}

function analyzeScenario(scenario: Scenario): Analysis[] {
  const warnings = [];
  
  // Check each constraint
  if (scenario.reserves < constraints.reserveDanger.minimum) {
    warnings.push({
      type: "information",
      message: "This would reduce reserves below £1bn (current: £1.852bn Pink Book p.19)"
    });
  }
  
  // ... check all constraints
  
  return warnings;
}
```

### 7. Export Features

#### Save/Load Scenarios
```typescript
interface SavedScenario {
  id: string;
  name: string;
  description: string;
  timestamp: Date;
  changes: ScenarioChanges;
  results: ScenarioResults;
  notes: string;
}
```

#### PDF Report Generation
- Executive summary (1 page)
- Current vs proposed comparison
- Impact analysis
- Implementation plan
- Risk assessment

#### Executive Summary
Auto-generated bullets:
- Total revenue impact: £X
- Total expenditure change: £Y
- Reserve trajectory: Z years
- Key risks: [...] 
- Implementation priorities: [...]

### 8. Data Integration

Use extracted Pink Book data:
- Population: 85,000
- Public sector workers: 6,000
- Current reserves: £1.76bn
- NI Fund: £850m
- All actual tax yields
- All department costs
- All benefits and pensions

### 9. Performance Requirements

- Calculation latency: <100ms
- UI response: <50ms
- Smooth slider interaction: 60fps
- Support 50+ concurrent calculations
- Auto-save every 10 seconds

### 10. UI/UX Principles

- **Immediate feedback**: Every change shows impact instantly
- **Progressive disclosure**: Simple by default, detailed on demand
- **Mobile responsive**: Works on tablets for workshop use
- **Accessibility**: WCAG 2.1 AA compliant
- **Dark mode**: For long workshop sessions
- **Undo/redo**: Full history navigation

## Implementation Phases

### Phase 1: Core Dashboard (Week 1)
- Basic layout and components
- Current state display
- Static department/revenue breakdowns

### Phase 2: Calculation Engine (Week 2)
- Revenue calculators
- Expenditure models
- Sustainability metrics

### Phase 3: Workshop Interface (Week 3)
- Control panels
- Real-time updates
- Constraint validation

### Phase 4: Visualizations (Week 4)
- Charts and graphs
- Interactive elements
- Export features

### Phase 5: Polish & Testing (Week 5)
- Performance optimization
- Edge case handling
- User testing

## Success Criteria

1. **Data Integrity**: 100% traceable to Pink Book sources
2. **Transparency**: All calculations visible and explained
3. **Neutrality**: Zero prescriptive recommendations
4. **Exploration**: Users can test any scenario
5. **Clarity**: Clear distinction between facts and calculations

## Technical Stack Detail

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "zustand": "^4.4.0",
    "recharts": "^2.10.0",
    "d3": "^7.8.0",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "tailwindcss": "^3.4.0",
    "lucide-react": "^0.300.0",
    "react-pdf": "^7.5.0",
    "xlsx": "^0.18.5"
  }
}
```

## File Structure

```
app/
├── page.tsx                 # Dashboard
├── workshop/
│   └── page.tsx            # Workshop interface
├── components/
│   ├── revenue-controls.tsx
│   ├── expenditure-controls.tsx
│   ├── policy-toggles.tsx
│   ├── visualization-panel.tsx
│   └── constraints-warnings.tsx
├── lib/
│   ├── calculations/
│   │   ├── revenue.ts
│   │   ├── expenditure.ts
│   │   └── sustainability.ts
│   ├── data/
│   │   └── [JSON files]
│   └── stores/
│       └── scenario-store.ts
└── styles/
    └── globals.css
```

This MVP provides complete control over the entire £1.4 billion government budget with real-time modeling of impacts, enabling transformative budget decision-making for the Isle of Man.