# Advanced Options Calculation Audit Report

## Executive Summary
**STATUS:** ⚠️ MIXED - Some calculations work, others have issues
**READY FOR MINISTERIAL USE:** NO - Critical fixes needed

## Audit Findings by Section

### 1. Infrastructure Section ✅ MOSTLY WORKING

#### Airport Passenger Charge
- **Calculation:** `policies.airportCharge * 800000`
- **Test:** £5 × 800,000 passengers = £4m
- **Status:** ✅ CORRECT - Uses real passenger numbers
- **Evidence:** Line 65 in page.tsx

#### Port Dues Increase  
- **Calculation:** `4900000 * (policies.portDuesIncrease / 100)`
- **Test:** 20% of £4.9m = £980k
- **Status:** ✅ CORRECT - Uses real port revenue base
- **Evidence:** Line 66

#### Internal Rent Charging
- **Calculation:** `policies.internalRentCharging ? 3000000 : 0`
- **Test:** Toggle = £3m
- **Status:** ⚠️ SUSPICIOUS - Hardcoded £3m value
- **Evidence:** Line 67 - No calculation, just arbitrary £3m

#### Free Public Transport
- **Calculation:** `policies.freeTransport ? 3500000 : 0`
- **Test:** Toggle = -£3.5m cost
- **Status:** ✅ REASONABLE - Matches Pink Book bus subsidy data
- **Evidence:** Line 68

#### Heritage Railway Days
- **Calculation:** `policies.heritageRailDays === 5 ? 600000 : 0`
- **Test:** 5 days vs 7 days = £600k savings
- **Status:** ✅ CORRECT - Matches specification (2/7 × £2.25m ≈ £600k)
- **Evidence:** Line 69

### 2. Transfers Section ⚠️ HARDCODED VALUES

#### Winter Bonus Means Testing
- **Calculation:** 
  - Benefits only: `3600000` hardcoded
  - Age 75+: `2000000` hardcoded
- **Test:** Should calculate based on 18,000 recipients
- **Status:** ❌ BROKEN - Hardcoded values, no recipient calculation
- **Evidence:** Lines 72-73
- **Expected:** 
  - Benefits: ~10,000 recipients × £400 = £4m savings
  - Age 75+: ~8,000 excluded × £400 = £3.2m savings

#### Child Benefit Taper
- **Calculation:** Direct value from select (2000000 or 3500000)
- **Status:** ❌ BROKEN - Hardcoded options, no calculation
- **Evidence:** Lines 351-354
- **Expected:** Should calculate based on income distribution

#### Housing Benefit Cap
- **Calculation:** Direct value from select (1500000 or 2500000)
- **Status:** ❌ BROKEN - Hardcoded options, no calculation
- **Evidence:** Lines 375-378
- **Expected:** Should calculate based on claimant numbers

### 3. Departments Section ⚠️ MIXED

#### Cabinet Office Efficiency
- **Calculation:** Direct value from select (5000000 or 7500000)
- **Status:** ❌ BROKEN - Hardcoded round numbers
- **Evidence:** Lines 414-417
- **Expected:** Should be % of Cabinet Office budget (£50m)

#### Enterprise Grants
- **Calculation:** Direct value from select (3000000 or 5000000)
- **Status:** ❌ BROKEN - Hardcoded round numbers
- **Evidence:** Lines 437-439

#### Public Sector Pay
- **Calculation:** Proper calculation based on £507.24m wage base
  - Freeze: `10144800` (2% of wage base)
  - 1%: `5072400` (1% of wage base)
  - 3%: `-5072400` (extra 1% cost)
- **Status:** ✅ CORRECT - Uses real wage calculations
- **Evidence:** Lines 81-87

### 4. Fees & Charges Section ✅ WORKING

#### General Fees Uplift
- **Calculation:** `150000000 * (policies.generalFeesUplift / 100)`
- **Test:** 5% of £150m = £7.5m
- **Status:** ✅ CORRECT - Proper percentage calculation
- **Evidence:** Line 90

#### Targeted Cost Recovery
- **Calculation:** Individual fee items with specific values
  - Vehicle: £500k
  - Planning: £800k
  - Court: £400k
  - Environmental: £300k
- **Status:** ⚠️ SUSPICIOUS - Round numbers but reasonable
- **Evidence:** Lines 92-98

### 5. Capital Section ⚠️ HARDCODED

#### Capital Gating
- **Calculation:** `policies.capitalGating ? 22700000 : 0`
- **Status:** ⚠️ HARDCODED but matches 26% of £87.4m capital budget
- **Evidence:** Line 102

#### Defer Low BCR Projects
- **Calculation:** Direct value from select (10000000 or 15000000)
- **Status:** ❌ BROKEN - Arbitrary round numbers
- **Evidence:** Lines 601-604

## Critical Issues Found

### 🚨 MUST FIX BEFORE USE:

1. **Transfer Payment Calculations**
   - Winter Bonus: Replace hardcoded £3.6m/£2m with recipient calculations
   - Child Benefit: Implement income distribution model
   - Housing Benefit: Calculate based on actual claimant data

2. **Department Efficiency**
   - Cabinet Office: Should be 10%/15% of £50m budget = £5m/£7.5m
   - Enterprise Grants: Need actual grant budget baseline

3. **Capital Deferrals**
   - Replace arbitrary £10m/£15m with actual low BCR project values

## Comparison to Main Workshop Tab

| Aspect | Workshop Tab | Advanced Options |
|--------|-------------|------------------|
| Tax calculations | ❌ All show £1.9m | N/A - No tax controls |
| Multipliers | ❌ Arbitrary × 0.5, × 0.8 | ✅ Mostly realistic |
| Hardcoded values | ❌ Many fake values | ⚠️ Some hardcoded |
| Calculation accuracy | ❌ Fundamentally broken | ⚠️ Mixed - some work |
| Data sources | ❌ Made up numbers | ⚠️ Some real, some fake |

## Recommendations

### Immediate Actions Required:
1. Fix all transfer payment calculations to use real recipient numbers
2. Replace department efficiency hardcoded values with percentage calculations
3. Source real capital project BCR data or remove these options

### Code Quality Issues:
1. Too many hardcoded values instead of calculations
2. No comments explaining data sources
3. Missing validation for realistic ranges

### Which Should Ministers Trust?
**Neither is fully trustworthy yet**, but Advanced Options is closer to working:
- Infrastructure section: ✅ Can be used
- Fees section: ✅ Can be used  
- Public sector pay: ✅ Can be used
- Transfers: ❌ DO NOT USE
- Departments: ❌ DO NOT USE
- Capital: ⚠️ USE WITH CAUTION

## Overall Assessment

The Advanced Options page is **partially functional** but not ready for ministerial use due to:
- Critical calculation errors in Transfers (£441m budget affected)
- Hardcoded values without proper calculations
- Missing data sources and documentation

Unlike the main Workshop tab which had systematic £1.9m fake calculations, the Advanced Options page has:
- Some correctly implemented calculations (Infrastructure, Fees, Pay)
- Some hardcoded but plausible values
- No evidence of the systematic calculation bug

**Estimated effort to fix:** 2-3 hours to implement proper calculations for all broken sections.