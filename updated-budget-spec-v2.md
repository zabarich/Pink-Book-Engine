# Isle of Man Budget Explorer - Implementation Stories & Tracking

## 🎯 WHAT WE'RE BUILDING

### Project Overview
**Product:** Interactive web-based budget scenario modelling tool for Isle of Man Government  
**Purpose:** Enable ministers to test fiscal policy changes and see real-time impacts on the £1.4bn budget  
**Users:** Government ministers, Treasury officials, policy makers  
**Context:** Preparation for 2025-26 budget workshops where ministers need to find savings/revenue

### The Problem
Ministers currently work with static Pink Book PDF (300+ pages) and can't easily see how policy changes affect the overall budget. They need to close a budget gap and want to test combinations of tax rises, spending cuts, and efficiency measures.

### The Solution
An interactive dashboard with two modes:
1. **Basic Controls** - Major policy levers (£10m+ impact) for quick big-picture changes
2. **Advanced Options** - 30+ detailed scenarios for fine-tuning

### Current State (What Exists)
```
✅ WORKING:
- Core React app structure exists
- 6 validated JSON files with all Pink Book data
- Basic calculation engine works
- Workshop interface with sliders/controls
- Tourist Levy properly calculates (£1.6m per £1)
- DHSC/Manx Care split displays correctly
- Treasury shows operational budget (£70m)

❌ BROKEN/WRONG:
- Advanced Options full of fake hardcoded data
- Tourist Levy in wrong section (too granular for Basic)
- Missing critical controls (Pillar 2 Tax worth £35m!)
- Missing NI rates, pension age controls
- 28 TODOs with hardcoded values throughout
```

### Desired End State
```
BASIC CONTROLS (Quick Access):
┌─────────────────────────────────────┐
│ REVENUE CONTROLS                    │
│ • Income Tax: [10%] [21%] sliders   │
│ • Corporate Banking: [10%] slider    │
│ • Pillar 2 Tax: [ON/OFF] = £35m     │
│ • NI Rates: [11%] [12.8%] sliders   │
│ • VAT: [20%] slider                 │
│                                      │
│ EXPENDITURE CONTROLS                │
│ • 12 Department budget sliders      │
│ • Public Sector Pay: 0/1/2/3%       │
│ • Pension Age: [67] [68] = £15m     │
└─────────────────────────────────────┘

ADVANCED OPTIONS (Detailed Scenarios):
┌─────────────────────────────────────┐
│ [Tax] [Cuts] [Efficiency] [Revenue] │
│ [Benefits] [Capital]                │
│                                      │
│ Tab Content: 30+ specific measures  │
│ Each with clear £ impact             │
└─────────────────────────────────────┘

ALWAYS VISIBLE:
Revenue: £1.40bn [+/- changes]
Expenditure: £1.40bn [+/- changes]
Balance: £XXm [surplus/deficit]
```

### Why This Matters
- **Ministerial Workshop in [SOON]** - Tool needed for policy decisions
- **£50m+ budget gap** - Need to find savings/revenue
- **Current process too slow** - Takes days to model scenarios in spreadsheets
- **Political sensitivity** - Ministers need to test ideas privately before proposing

### Technical Context
- **Next.js/React application**
- **Data source:** 6 JSON files extracted from Pink Book 2025-26
- **Key principle:** If it's not in the JSON files, it doesn't exist
- **Critical rule:** NO hardcoded values - everything must trace to source data

### What Success Looks Like
Ministers can:
1. Adjust major tax rates and see immediate revenue impact
2. Test department budget cuts and see savings
3. Enable/disable policy options (like Pillar 2 Tax)
4. Compare different scenario combinations
5. Export their preferred package for discussion
6. Trust that ALL numbers are real Pink Book data

## 📊 KEY DATA SOURCES & CALCULATIONS

### Understanding the JSON Files
```
revenue-streams.json
├── incomeText: £384m (Income tax total)
│   ├── standard rate: 10% = £165m portion
│   └── higher rate: 21% = £165m portion
├── nationalInsurance: £330m
│   ├── employee: £165m (11% rate)
│   └── employer: £132m (12.8% rate)
├── corporateTax: £23.4m
│   └── tenPercent (banking): £18.7m
└── customsAndExcise: £474m (includes VAT)

department-budgets.json
├── Each department has:
│   ├── gross_expenditure (total cost)
│   ├── income (what they generate)
│   └── net_expenditure (actual cost to Treasury)
└── Total net expenditure: £1,387.8m

transfer-payments.json
├── State pensions: £210m
├── Other benefits: £231m
└── Total: £441m (32% of budget!)

Key Calculations:
- Income Tax: Each 1% = £10m (based on £1bn tax base)
- NI Employee: Each 1% = £16.5m
- NI Employer: Each 1% = £13m
- Department cuts: Percentage of their net_expenditure
- Pillar 2 Tax: Flat £35m when enabled (from forward-looking.json)
```

### Example Calculation Flow
```
User moves Income Tax from 10% to 11%:
1. System reads base: £384m (from revenue-streams.json)
2. Calculates 1% = £384m ÷ 38.4 = £10m
3. Adds £10m to revenue
4. Updates budget balance
5. Shows: Revenue £1.41bn (+£10m)
```

## ⚠️ CRITICAL WARNINGS - READ BEFORE STARTING

### Common Traps to Avoid
```
❌ DON'T: Add numbers like £16.039m for vehicle duty
✅ DO: Use the actual JSON value or remove the feature

❌ DON'T: Create TODO comments to hide missing data
✅ DO: If data isn't in JSON, feature doesn't exist

❌ DON'T: Make up plausible-sounding values
✅ DO: Every number must trace to a JSON file

❌ DON'T: Implement internal department charging
✅ DO: This just moves money around, doesn't raise revenue

❌ DON'T: Say "means test Child Benefit"
✅ DO: Say "Restrict Child Benefit to <£30k income"
```

### The Golden Rules
1. **The JSON files are the single source of truth**
2. **If you can't find it in JSON, ask before inventing**
3. **One story at a time - no jumping ahead**
4. **Log what you did - no silent technical debt**
5. **Test each story's specific criteria**

## 🎨 INTERFACE EXAMPLES (What You're Building)

### Basic Controls Example
```
REVENUE CONTROLS
┌─Income Tax─────────────────────────┐
│ Standard Rate    [----●----] 11%   │ ← Slider shows current rate
│                  (+£10m revenue)    │ ← Real-time impact
│                                     │
│ Higher Rate      [-------●-] 22%   │
│                  (+£8m revenue)     │
└─────────────────────────────────────┘

┌─New Revenue Sources────────────────┐
│ ☑ Enable Pillar 2 Tax              │ ← Toggle adds £35m
│   Impact: +£35m revenue            │
└─────────────────────────────────────┘
```

### Advanced Options Example
```
[Tax Changes] [Service Cuts] [Efficiency] [Revenue] [Benefits] [Capital]
    ↓
┌─Tax Change Scenarios───────────────┐
│ Income Tax Increases:              │
│ ○ Current (no change)              │
│ ○ +1% across all bands (+£10m)    │
│ ● +2% across all bands (+£20m)    │ ← Selected
│ ○ +3% across all bands (+£30m)    │
│                                     │
│ Corporate Banking Rate:            │
│ ○ Keep at 10% (current)           │
│ ○ Increase to 12% (+£3.5m)        │
│ ● Increase to 15% (+£8.75m)       │ ← Selected
│                                     │
│ Total Impact: +£28.75m revenue     │
└─────────────────────────────────────┘
```

### Budget Balance Bar (Always Visible)
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Revenue: £1.42bn (+£28.75m) | Expenditure: £1.39bn | Balance: £30m surplus ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🚀 QUICK START FOR IMPLEMENTERS

### If you're a fresh Claude Code agent, start here:

1. **Read the "WHAT WE'RE BUILDING" section above** - Understand the context

2. **Check the Implementation Log** - See what's already been done

3. **Find the next unchecked story** in the checklist below

4. **Read that story's specification** in the detailed section

5. **Implement ONLY that story** - Don't skip ahead

6. **Test it works** using the test criteria

7. **Update the Implementation Log** with what you did

8. **Check the box** ☑ when complete

9. **Stop and hand over** to the next agent

### Your First Story Should Be:
Look at the checklist below. Find the first unchecked box. That's your story.
If it's 1.1, you're removing Tourist Levy from Basic Controls.
If it's 2.3, you're adding NI Employee Rate slider.
Simple as that.

## 📋 IMPLEMENTATION CHECKLIST (Update as Complete)

### Phase 1: Basic Controls Cleanup
- [x] 1.1 Remove Tourist Levy from Basic Controls
- [x] 1.2 Remove Airport Duty from Basic Controls  
- [x] 1.3 Remove Shared Services from Basic Controls
- [x] 1.4 Remove Digital Transformation from Basic Controls

### Phase 2: Add Missing Major Controls
- [x] 2.1 Add Pillar 2 Tax toggle to Basic (£35m when enabled)
- [x] 2.2 Add Corporate Tax Banking slider to Basic (10% current)
- [x] 2.3 Add NI Employee Rate slider to Basic (11% current)
- [x] 2.4 Add NI Employer Rate slider to Basic (12.8% current)
- [x] 2.5 Add Pension Age toggle to Basic (67/68, saves £15m)

### Phase 3: Delete Fake Advanced Options
- [x] 3.1 Remove all fake Advanced Options tabs
- [x] 3.2 Remove all hardcoded values in Advanced Options
- [x] 3.3 Create empty Advanced Options structure

### Phase 4: Implement Tax Scenarios
- [x] 4.1 Add Income Tax +1/2/3% scenarios (£10m per 1%)
- [x] 4.2 Add Higher Rate 22% and 23% scenarios
- [x] 4.3 Add Corporate Banking 12% and 15% scenarios

### Phase 5: Implement Service Cuts
- [ ] 5.1 Add Health efficiency scenarios (5% = £14m, 10% = £29m)
- [ ] 5.2 Add Education cut scenarios (5% = £7m, 10% = £14m)
- [ ] 5.3 Add Infrastructure cuts (Heritage Rail, Bus services)
- [ ] 5.4 Add Culture cuts (Arts Council, Museums)

### Phase 6: Implement Efficiency Savings
- [ ] 6.1 Add Shared Services scenario (£15m over 2-3 years)
- [ ] 6.2 Add Digital Transformation scenario (£20m over 3-5 years)
- [ ] 6.3 Add Property Rationalization (£5m)
- [ ] 6.4 Add Procurement Centralization (£10m)

### Phase 7: Implement Revenue Generation
- [ ] 7.1 Add Tourist Levy to Advanced (£1.6m per £1)
- [ ] 7.2 Add Airport Duty increase to Advanced
- [ ] 7.3 Add Wealth Tax (£5m)
- [ ] 7.4 Add Carbon Tax (£3m)
- [ ] 7.5 Add Parking Charges (£1m)
- [ ] 7.6 Add Fee increases (Planning, Court, Vehicle)

### Phase 8: Implement Benefit Reforms
- [ ] 8.1 Add Winter Bonus reduction (£1.8m)
- [ ] 8.2 Add Child Benefit threshold (£3m) - WITH CORRECT WORDING
- [ ] 8.3 Add Housing Benefit cap (£2m)
- [ ] 8.4 Add Pension Supplement taper (£2.5m)

### Phase 9: Implement Capital Adjustments
- [ ] 9.1 Add Project Deferrals (£20m)
- [ ] 9.2 Add Heritage Rail cuts (£2.25m)
- [ ] 9.3 Add Climate Spending acceleration (-£20m)
- [ ] 9.4 Add Housing Crisis investment (-£30m)

### Phase 10: Final Features
- [ ] 10.1 Add scenario comparison feature
- [ ] 10.2 Add export functionality
- [ ] 10.3 Add save/load scenarios
- [ ] 10.4 Final testing with all JSON data

---

## 📝 IMPLEMENTATION LOG
**Instructions: Each Claude Code session MUST add an entry here**

| Date | Agent | Story # | What Was Done | Issues/TODOs Created | Next Story |
|------|-------|---------|---------------|---------------------|------------|
| 2025-08-21 | Agent 1 | Pre-work | Fixed Tourist Levy, Treasury, DHSC display bugs | None | Start 1.1 |
| 2025-08-21 | Agent 2 | 1.1-1.4 | Removed Tourist Levy, Airport Duty, Shared Services, and Digital Transformation from Basic Controls | None | 2.1 |
| 2025-08-21 | Agent 2 | 2.1-2.5 | Added Pillar 2 Tax toggle (£35m), Corporate Banking slider, NI Employee/Employer sliders, and Pension Age toggle to Basic Controls | None | 3.1 |
| 2025-08-21 | Agent 2 | 3.1-3.3 | Removed all fake Advanced Options tabs, removed hardcoded values, created empty tab structure (Tax/Cuts/Efficiency/Revenue/Benefits/Capital) | None | 4.1 |
| 2025-08-21 | Agent 2 | 4.1-4.3 | Implemented Tax Changes tab with Income Tax +1/2/3% scenarios (£10m per %), Higher Rate 22/23% options, and Corporate Banking 12/15% options | None | 5.1 |
| | | | | | |

---

## 🎯 IMPLEMENTATION RULES FOR EACH STORY

### For Claude Code:
1. **DO ONE STORY AT A TIME** - No jumping ahead
2. **NO TODOs** - If you can't complete it, log the issue
3. **NO HARDCODED VALUES** - Use JSON or don't implement
4. **UPDATE THE LOG** - Every session must document what was done
5. **CHECK THE BOX** - Mark complete only when fully working

### Story Acceptance Criteria:
Each story is ONLY complete when:
- Feature works as specified
- No hardcoded values
- No TODOs in code
- Calculations match JSON data
- Log entry added

---

## 📊 DETAILED STORY SPECIFICATIONS

### 1.1 Remove Tourist Levy from Basic Controls
**Task:** Delete Tourist Accommodation Levy from Basic Controls
**Location:** `/app/workshop/page.tsx` Basic Controls section
**Test:** Tourist Levy no longer appears in Basic Controls
**Data:** N/A - removal only

### 1.2 Remove Airport Duty from Basic Controls
**Task:** Delete Airport Passenger Duty from Basic Controls
**Location:** `/app/workshop/page.tsx` Basic Controls section
**Test:** Airport Duty no longer appears in Basic Controls
**Data:** N/A - removal only

### 1.3 Remove Shared Services from Basic Controls
**Task:** Delete Expand Shared Services from Basic Controls
**Location:** `/app/workshop/page.tsx` Basic Controls section
**Test:** Shared Services no longer appears in Basic Controls
**Data:** N/A - removal only

### 1.4 Remove Digital Transformation from Basic Controls
**Task:** Delete Digital Transformation from Basic Controls
**Location:** `/app/workshop/page.tsx` Basic Controls section
**Test:** Digital Transformation no longer appears in Basic Controls
**Data:** N/A - removal only

### 2.1 Add Pillar 2 Tax Toggle
**Task:** Add toggle switch for Pillar 2 Tax in Basic Controls
**Location:** `/app/workshop/page.tsx` Revenue Controls section
**Functionality:** When ON, adds £35m to revenue
**Data Source:** `forward-looking.json` → pillar_two_tax
**Test:** Toggle ON = +£35m revenue, OFF = £0

### 2.2 Add Corporate Tax Banking Slider
**Task:** Add slider for Corporate Banking Tax rate
**Location:** `/app/workshop/page.tsx` Revenue Controls section
**Range:** 10% to 20%
**Current:** 10%
**Impact:** £3.5m per 2% increase
**Data Source:** `revenue-streams.json` → corporateTax.tenPercent
**Test:** 12% = +£3.5m, 15% = +£8.75m

### 2.3 Add NI Employee Rate Slider
**Task:** Add slider for NI Employee contribution rate
**Location:** `/app/workshop/page.tsx` Revenue Controls section
**Range:** 10% to 13%
**Current:** 11%
**Impact:** £16.5m per 1%
**Data Source:** `revenue-streams.json` → nationalInsurance.employee
**Test:** 12% = +£16.5m revenue

### 2.4 Add NI Employer Rate Slider
**Task:** Add slider for NI Employer contribution rate
**Location:** `/app/workshop/page.tsx` Revenue Controls section
**Range:** 11% to 15%
**Current:** 12.8%
**Impact:** £13m per 1%
**Data Source:** `revenue-streams.json` → nationalInsurance.employer
**Test:** 13.8% = +£13m revenue

### 2.5 Add Pension Age Toggle
**Task:** Add toggle for pension age (67 or 68)
**Location:** `/app/workshop/page.tsx` Expenditure Controls section
**Options:** 67 (current) / 68 (proposed)
**Impact:** 68 = -£15m expenditure
**Data Source:** `transfer-payments.json` → retirement_pension
**Test:** Age 68 = £15m reduction in expenditure

### 3.1 Remove All Fake Advanced Options Tabs
**Task:** Delete the fake Infrastructure/Transfers/Departments/Fees/Capital/Tax Detail/Strategic tabs
**Location:** `/app/advanced-options/page.tsx`
**Test:** No tabs visible, clean slate for rebuild

### 3.2 Remove All Hardcoded Values
**Task:** Search and remove any hardcoded numbers in Advanced Options
**Location:** `/app/advanced-options/` all files
**Test:** grep search finds no large numbers

### 3.3 Create Empty Advanced Options Structure
**Task:** Create tab structure: Tax Changes | Service Cuts | Efficiency | Revenue | Benefits | Capital
**Location:** `/app/advanced-options/page.tsx`
**Test:** Six empty tabs display correctly

### 4.1 Add Income Tax Increment Scenarios
**Task:** Add +1%, +2%, +3% options for income tax
**Location:** Advanced Options → Tax Changes tab
**Calculation:** Each 1% = £10m
**Data Source:** `revenue-streams.json` → incomeText.current (£384m base)
**Test:** +1% = £10m, +2% = £20m, +3% = £30m

### 4.2 Add Higher Rate Scenarios
**Task:** Add options for 22% and 23% higher rate
**Location:** Advanced Options → Tax Changes tab
**Impact:** 22% = £8m, 23% = £16m
**Data Source:** `revenue-streams.json` → incomeText.bands.higher
**Test:** Selecting 22% adds £8m revenue

### 4.3 Add Corporate Banking Scenarios
**Task:** Add 12% and 15% corporate banking options
**Location:** Advanced Options → Tax Changes tab
**Impact:** 12% = £3.5m, 15% = £8.75m
**Data Source:** `revenue-streams.json` → corporateTax.tenPercent
**Test:** Each option calculates correctly

### 5.1 Add Health Efficiency Scenarios
**Task:** Add 5% and 10% efficiency options for Health
**Location:** Advanced Options → Service Cuts tab
**Budget:** £298.1m (from DHSC net expenditure)
**Impact:** 5% = £14m, 10% = £29m
**Data Source:** `department-budgets.json` → DHSC.net_expenditure
**Test:** Cuts calculate from actual budget

### 5.2 Add Education Cut Scenarios
**Task:** Add 5% and 10% cut options for Education
**Location:** Advanced Options → Service Cuts tab
**Budget:** £149.8m
**Impact:** 5% = £7m, 10% = £14m
**Data Source:** `department-budgets.json` → DESC.net_expenditure
**Test:** Cuts calculate correctly

### 5.3 Add Infrastructure Cuts
**Task:** Add Heritage Rail (5 days) and Bus service cuts
**Location:** Advanced Options → Service Cuts tab
**Impact:** Heritage Rail = £0.6m, Bus = £2.5m
**Data Source:** `capital-programme.json` → Heritage Rail Budget
**Test:** Each option shows correct saving

### 5.4 Add Culture Cuts
**Task:** Add Arts Council 50% and Museum closure options
**Location:** Advanced Options → Service Cuts tab
**Impact:** Arts = £1m, Museums = £2.9m
**Data Source:** Calculate from DESC sub-budgets
**Test:** Savings display correctly

### 6.1 Add Shared Services Scenario
**Task:** Add Shared Services expansion option
**Location:** Advanced Options → Efficiency tab
**Impact:** £15m over 2-3 years
**Note:** Show as phased: Year 1: £5m, Year 2: £10m, Year 3: £15m
**Test:** Displays phased implementation

### 6.2 Add Digital Transformation
**Task:** Add Digital Transformation program
**Location:** Advanced Options → Efficiency tab
**Impact:** £20m over 3-5 years
**Note:** Phased implementation
**Test:** Shows timeline and cumulative savings

### 6.3 Add Property Rationalization
**Task:** Add property/estate rationalization
**Location:** Advanced Options → Efficiency tab
**Impact:** £5m from asset sales
**Test:** One-time saving displayed

### 6.4 Add Procurement Centralization
**Task:** Add centralized procurement option
**Location:** Advanced Options → Efficiency tab
**Impact:** £10m from better contracts
**Test:** Savings calculate correctly

### 7.1 Add Tourist Levy to Advanced
**Task:** Move Tourist Accommodation Levy here
**Location:** Advanced Options → Revenue tab
**Calculation:** £1.6m per £1/night
**Test:** £5/night = £8m revenue

### 7.2 Add Airport Duty to Advanced
**Task:** Move Airport Passenger Duty here
**Location:** Advanced Options → Revenue tab
**Base:** Current £4.6m
**Test:** Increase options work

### 7.3 Add Wealth Tax
**Task:** Add new wealth tax option
**Location:** Advanced Options → Revenue tab
**Impact:** £5m
**Test:** Toggle adds £5m revenue

### 7.4 Add Carbon Tax
**Task:** Add carbon tax option
**Location:** Advanced Options → Revenue tab
**Impact:** £3m
**Test:** Enables £3m revenue

### 7.5 Add Parking Charges
**Task:** Add parking charge introduction
**Location:** Advanced Options → Revenue tab
**Impact:** £1m
**Test:** Shows £1m when enabled

### 7.6 Add Fee Increases
**Task:** Add Planning (£0.5m), Court (£0.5m), Vehicle Registration (£1.5m)
**Location:** Advanced Options → Revenue tab
**Test:** Each fee increase calculates correctly

### 8.1 Add Winter Bonus Reduction
**Task:** Add option to reduce Winter Bonus from £400 to £300
**Location:** Advanced Options → Benefits tab
**Impact:** £1.8m saving
**Affected:** 18,000 people
**Data Source:** `transfer-payments.json` → winter_bonus
**Test:** Shows savings and affected numbers

### 8.2 Add Child Benefit Reform
**Task:** Add "Restrict to households <£30k income"
**Location:** Advanced Options → Benefits tab
**Impact:** £3m saving
**Affected:** 2,000 families
**CRITICAL:** Use correct wording - NOT "introduce means test"
**Test:** Correct description and savings

### 8.3 Add Housing Benefit Cap
**Task:** Add £25k annual cap option
**Location:** Advanced Options → Benefits tab
**Impact:** £2m saving
**Affected:** 150 households
**Test:** Shows impact correctly

### 8.4 Add Pension Supplement Taper
**Task:** Add taper for higher earners
**Location:** Advanced Options → Benefits tab
**Impact:** £2.5m saving
**Test:** Calculates taper savings

### 9.1 Add Project Deferrals
**Task:** Add option to defer non-critical capital projects
**Location:** Advanced Options → Capital tab
**Impact:** £20m (2-year delay)
**Data Source:** `capital-programme.json`
**Test:** Shows freed capital

### 9.2 Add Heritage Rail Cuts
**Task:** Add Heritage Rail investment reduction
**Location:** Advanced Options → Capital tab
**Impact:** £2.25m annual reduction
**Data Source:** `capital-programme.json` → Heritage Rail Budget
**Test:** Annual savings display

### 9.3 Add Climate Spending Acceleration
**Task:** Add accelerated climate investment
**Location:** Advanced Options → Capital tab
**Impact:** -£20m (costs money)
**Source:** From economic fund
**Test:** Shows as cost not saving

### 9.4 Add Housing Crisis Investment
**Task:** Add emergency housing investment
**Location:** Advanced Options → Capital tab
**Impact:** -£30m (costs money)
**Test:** Displays as additional expenditure

### 10.1 Add Scenario Comparison
**Task:** Add ability to compare 2-3 scenarios side by side
**Location:** New comparison view
**Test:** Can compare different policy packages

### 10.2 Add Export Functionality
**Task:** Export scenarios to CSV/PDF
**Location:** Export button in UI
**Test:** Generates downloadable file

### 10.3 Add Save/Load Scenarios
**Task:** Save and reload policy packages
**Location:** Save/Load buttons
**Test:** Scenarios persist and reload

### 10.4 Final Testing
**Task:** Test all features with real data
**Test:** No hardcoded values, all calculations correct

---

## ⚠️ CRITICAL REMINDERS

1. **ONE STORY AT A TIME** - Complete it fully before moving on
2. **LOG EVERYTHING** - Future agents need to know what you did
3. **NO SHORTCUTS** - If you can't get data from JSON, don't fake it
4. **TEST YOUR WORK** - Each story has specific test criteria
5. **ASK IF STUCK** - Better to ask than create technical debt

This is a marathon, not a sprint. Each story builds on the last. Do them in order!