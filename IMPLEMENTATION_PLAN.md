# Specific Policies Panel - Implementation Plan

## Overview
Fix parser error and enhance the Specific Policies Panel with concrete, data-driven policy options using verified Pink Book data.

## Phase 1: Fix Parser Error
### Problem
The `calculateTotalImpact` function is defined as a const arrow function inside the component, causing parser issues.

### Solution
Move the calculation logic to useMemo hook to avoid nested arrow functions and improve performance:
```typescript
const totalImpact = useMemo(() => {
  let total = 0;
  // calculation logic
  return total;
}, [dependencies]);
```

## Phase 2: Infrastructure Revenue Generation Policies
Add policies based on department-budgets.json data:

### 2.1 Airport Passenger Charge
- Current income: £4.761m (from JSON)
- Net cost: £8.284m (from JSON)
- Implementation: £0-5 per passenger × 800,000 passengers
- Potential: £0-4m additional revenue

### 2.2 Port Dues Increase
- Current budget: £4.883m (from JSON)
- Implementation: 0-10% increase on commercial operations
- Potential: £0-0.49m additional revenue

### 2.3 Public Estates Optimization
- Current net: £21.147m (from JSON)
- Total budget: £36.106m (from JSON)
- Implementation: Internal rent charging, space rationalization
- Potential: £3m from full cost recovery

## Phase 3: Transfer Payment Reforms
Add policies based on transfer-payments.json data:

### 3.1 Winter Bonus Means Testing
- Current cost: £7.2m (from JSON)
- Recipients: 18,000 (from JSON)
- Options:
  - Universal (current): £0 saving
  - Benefits recipients only: £3.6m saving
  - Age 75+ only: £2m saving

### 3.2 Child Benefit Income Taper
- Current cost: £12m (from JSON)
- Families: 8,500 (from JSON)
- Implementation: Taper for households >£50k
- Potential: £0-3m savings

### 3.3 Housing Benefit Optimization
- Current cost: £17.28m (from JSON)
- Recipients: 3,200 (from JSON)
- Implementation: Local reference rent caps
- Potential: £0-1.5m savings

## Phase 4: Department Operations
Add policies based on department-budgets.json data:

### 4.1 Cabinet Office Efficiency
- Total budget: £45m (from JSON)
- Breakdown:
  - IT: £15m
  - Administration: £12m
  - HR: £10m
- Potential: £0-4m through consolidation

### 4.2 Enterprise Grant Review
- Total budget: £35m (from JSON)
- Current income: £5m (from JSON)
- Grants breakdown:
  - Film fund: £2m
  - Business grants: £3m
- Potential: £0-4.5m through optimization

## Phase 5: Fees & Charges Uplift
Add policies based on revenue-streams.json data:

### 5.1 General Fees Uplift
- Base amount: £150.611m (from JSON)
- Implementation: 0-10% general increase
- Potential: £0-15m additional revenue

### 5.2 Targeted Cost Recovery
- Infrastructure fees: £43.286m (from JSON)
- Health fees: £18.5m (from JSON)
- Home Affairs fees: £12m (from JSON)
- Enterprise fees: £8.5m (from JSON)
- Potential: £2m from full cost recovery

## Phase 6: Capital Programme Management
Add policies based on capital-programme.json and forward-looking.json:

### 6.1 Capital Delivery Management
- 2025-26 budget: £87.4m (from JSON)
- Historical delivery: 74% (from JSON)
- Typical underspend: £22.7m (26% of budget)
- Implementation: Cash-gate to delivery capacity

### 6.2 Project Prioritization
- Capital contingency: £9.9m (from JSON)
- Implementation: Defer low BCR projects
- Potential: £0-5m additional savings

## Implementation Steps

1. **Fix Parser Error** (Immediate)
   - Convert calculateTotalImpact to useMemo
   - Test component rendering

2. **Load JSON Data** (30 mins)
   - Import all relevant JSON files
   - Create data access functions
   - Validate data integrity

3. **Update Policy Definitions** (1 hour)
   - Add all new policy options
   - Link to source data
   - Implement calculation logic

4. **Enhance UI Components** (1 hour)
   - Add new sliders and toggles
   - Implement tabbed interface
   - Add progress indicators

5. **Add Validation** (30 mins)
   - Minimum/maximum constraints
   - Political feasibility warnings
   - Service level checks

6. **Testing** (30 mins)
   - Verify all calculations
   - Check £49-72m total range
   - Test user interactions

## Data Sources
All values reference existing Pink Book JSON files:
- `/data/source/department-budgets.json`
- `/data/source/transfer-payments.json`
- `/data/source/revenue-streams.json`
- `/data/source/capital-programme.json`
- `/data/source/forward-looking.json`

## Success Metrics
- Parser error resolved
- All policies calculate correctly
- Total potential: £49-72m
- All values traceable to Pink Book
- Real-time calculation updates

## Risk Mitigation
- Keep original component as backup
- Test each policy incrementally
- Validate against Pink Book sources
- Include confidence indicators
- Add political sensitivity warnings