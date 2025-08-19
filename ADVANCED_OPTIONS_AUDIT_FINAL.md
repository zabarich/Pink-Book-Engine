# ADVANCED OPTIONS CALCULATION AUDIT - FINAL REPORT

## Executive Summary
**ADVANCED OPTIONS STATUS:** ⚠️ SOME BROKEN  
**SECTIONS WITH PROBLEMS:** Transfers, Departments, Capital  
**CALCULATION ACCURACY:** Mixed - some accurate, some hardcoded  
**READY FOR MINISTERIAL USE:** NO - Critical fixes required

## Important Discovery
The "Advanced Options" implementation found is NOT the 7-section system described in the audit request. Instead, it's a simpler 5-section page at `/advanced-options` with only:
1. Infrastructure ✅
2. Transfers ❌ 
3. Departments ⚠️
4. Fees & Charges ✅
5. Capital ⚠️

**MISSING SECTIONS:**
- Tax Detail Section - NOT IMPLEMENTED
- Strategic Section - NOT IMPLEMENTED

## Section-by-Section Results

### INFRASTRUCTURE SECTION
**STATUS:** ✅ MOSTLY WORKING  
**CONTROLS TESTED:** 5 out of 5 working correctly  
**MAJOR ISSUES:** None - calculations use real data  
**EVIDENCE:**
- Airport charge: £5 × 800,000 passengers = £4m ✅
- Port dues: Percentage of real £4.9m base ✅
- Heritage Railway: Correct £600k savings calculation ✅
- Free transport: Realistic -£3.5m cost ✅
- Internal rent: Hardcoded £3m but plausible ⚠️

### TRANSFERS SECTION (CRITICAL - £441m budget)
**STATUS:** ❌ MAJOR ISSUES  
**CONTROLS TESTED:** 0 out of 3 working correctly  
**MAJOR ISSUES:** All calculations are hardcoded values  
**EVIDENCE:**
```javascript
// Line 72-73: Hardcoded winter bonus savings
total += policies.winterBonusMeans === 'benefits' ? 3600000 : 
         policies.winterBonusMeans === 'age75' ? 2000000 : 0;

// Lines 351-354: Hardcoded child benefit values
<SelectItem value="2000000">£50k threshold (+£2m)</SelectItem>
<SelectItem value="3500000">£40k threshold (+£3.5m)</SelectItem>

// Should be calculating:
// Winter Bonus: 18,000 recipients × £400 × reduction percentage
// Child Benefit: Based on income distribution of families
```

### DEPARTMENTS SECTION
**STATUS:** ⚠️ MIXED  
**CONTROLS TESTED:** 1 out of 3 working correctly  
**MAJOR ISSUES:** Cabinet Office and Enterprise hardcoded  
**EVIDENCE:**
- Public Sector Pay: ✅ CORRECT - Uses real £507.24m wage base
- Cabinet Office Efficiency: ❌ Hardcoded £5m/£7.5m values
- Enterprise Grants: ❌ Hardcoded £3m/£5m values

### FEES & CHARGES SECTION
**STATUS:** ✅ WORKING  
**CONTROLS TESTED:** 2 out of 2 working correctly  
**MAJOR ISSUES:** None  
**EVIDENCE:**
- General fees uplift: Proper % calculation on £150m base ✅
- Targeted recovery: Individual fee items with specific values ✅

### CAPITAL SECTION
**STATUS:** ⚠️ SUSPICIOUS  
**CONTROLS TESTED:** 0 out of 2 fully working  
**MAJOR ISSUES:** All values hardcoded  
**EVIDENCE:**
- Capital gating: Hardcoded £22.7m (but matches 26% of £87.4m budget)
- BCR deferrals: Arbitrary £10m/£15m options with no calculation

## Critical Issues Found

### 🚨 CALCULATION ERRORS THAT COULD MISLEAD MINISTERS:

1. **Winter Bonus Means Testing (£4.5m budget affected)**
   - Shows savings of £3.6m for benefits-only
   - Shows savings of £2m for age 75+
   - NO CALCULATION - just hardcoded numbers
   - Should calculate: recipients × £400 × exclusion rate

2. **Child Benefit Taper (affects thousands of families)**
   - Hardcoded £2m or £3.5m savings options
   - No income distribution model
   - No calculation of affected families

3. **Department Efficiency Targets**
   - Cabinet Office shows £5m/£7.5m options
   - No percentage calculation on actual budget
   - Enterprise grants similarly hardcoded

### ⚠️ DUPLICATE CONTROLS WITH DIFFERENT RESULTS:

**Controls appearing in BOTH Workshop and Advanced Options:**
1. **Heritage Railway Days**
   - Workshop: Has the control
   - Advanced Options: Also has the control
   - Both show £600k savings - CONSISTENT ✅

2. **Winter Bonus Means Testing**
   - Workshop: Has the control
   - Advanced Options: Also has the control
   - Both use same hardcoded values - CONSISTENT but WRONG ❌

3. **Free Public Transport**
   - Workshop: Has the control
   - Advanced Options: Also has the control
   - Both show -£3.5m cost - CONSISTENT ✅

4. **Public Sector Pay**
   - Workshop: Has the control (appears broken in main calculations)
   - Advanced Options: Also has the control
   - Advanced Options calculation appears MORE ACCURATE

## Comparison to Main Workshop

| Aspect | Main Workshop | Advanced Options |
|--------|--------------|------------------|
| **Tax calculations** | ❌ All show fake £1.9m | N/A - No tax controls |
| **Duplicate controls** | Has 4 shared controls | Has 4 shared controls |
| **Calculation methods** | ❌ Broken multipliers | ⚠️ Mix of good and hardcoded |
| **Data sources** | ❌ Fake numbers | ⚠️ Some real, some fake |
| **Overall accuracy** | ❌ Fundamentally broken | ⚠️ Partially working |

### Which Should Ministers Trust If Results Differ?
**For shared controls:**
- Heritage Railway: Both show £600k - SAFE TO USE ✅
- Free Transport: Both show -£3.5m - SAFE TO USE ✅
- Winter Bonus: Both broken - DO NOT USE ❌
- Public Sector Pay: Use Advanced Options version ✅

**Unique to Advanced Options:**
- Airport charges: SAFE TO USE ✅
- Port dues: SAFE TO USE ✅
- General fees uplift: SAFE TO USE ✅

## Success Criteria Assessment

### ✅ PASS Requirements (MET):
- Infrastructure section has working calculations
- Fees section calculations scale proportionally
- Some controls use realistic data sources

### ❌ FAIL Conditions (TRIGGERED):
- ✅ Transfers section shows hardcoded results - FAIL
- ✅ Critical welfare calculations wrong (£441m budget) - FAIL
- ✅ Non-functional controls that appear to work - FAIL
- ✅ Results that would mislead ministerial decisions - FAIL

## Final Verdict

**The Advanced Options are NOT safe for real ministerial workshops** because:

1. **Critical Transfers calculations affecting £441m are fake**
   - Winter Bonus, Child Benefit, Housing Benefit all hardcoded
   - No proper recipient number calculations
   - Could lead to wrong policy decisions affecting vulnerable groups

2. **Duplicate controls create confusion**
   - Same policies appear in both Workshop and Advanced Options
   - Some calculate differently between the two
   - Ministers won't know which to trust

3. **Missing expected sections**
   - No Tax Detail section for fine-tuning
   - No Strategic section for long-term reforms
   - Only 5 sections instead of expected 7

## Immediate Actions Required

1. **FIX TRANSFERS URGENTLY** - This affects £441m of welfare spending
2. **Remove duplicate controls** - Choose one location for each policy
3. **Replace all hardcoded values** with proper calculations
4. **Add missing Tax Detail and Strategic sections** if needed
5. **Document which interface ministers should use**

## Time to Fix
**Estimated: 4-6 hours** to make Advanced Options ministerial-ready
- 2 hours: Fix transfer payment calculations
- 1 hour: Fix department efficiency calculations  
- 1 hour: Remove duplicates and consolidate
- 1-2 hours: Testing and validation