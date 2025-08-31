# Revenue Baseline Audit Report
## Issue: App Starts with £34.4m Above Baseline

### Executive Summary
✅ **ROOT CAUSE IDENTIFIED**
The app shows £34.4m above baseline due to two specific configuration issues:

---

## FOUND: Default State Issues

### Issue 1: Pillar 2 Tax Double-Counting ⚠️
**State Variable:** `pillarTwoEnabled`  
**Current Default:** `useState(true)`  
**Should be:** `useState(false)` OR adjust baseline calculation  
**Impact:** £25,000,000  
**Location:** Line 159 in `app/workshop/page.tsx`

**Problem:** 
- Line 805: Baseline calculated with `calculateBaselineBudget(true)` (Pillar 2 included)
- Line 867: When `pillarTwoEnabled = true`, adds £25m again
- Result: Pillar 2 is counted twice

**Evidence:**
```typescript
// Line 159
const [pillarTwoEnabled, setPillarTwoEnabled] = useState(true) // ← ISSUE

// Line 867 
if (pillarTwoEnabled) {
  newRevenue += policyTargets.pillar_two_timeline['2026_27'] // £25m for 2026-27
}
```

---

### Issue 2: Corporate Tax Banking Rate Mismatch ⚠️
**State Variable:** Banking rate in corporate tax calculation  
**Current Default:** 15% (Pillar 2 rate)  
**Baseline Expected:** 10%  
**Impact:** £9,360,000  
**Location:** Line 850 in `app/workshop/page.tsx`

**Problem:**
- Tax calculation expects banking rate baseline of 10%
- App passes 15% as "baseline" rate  
- Generates £9.36m revenue because 15% ≠ 10%

**Evidence:**
```typescript
// Line 850 - Passes 15% as baseline
const corporateTaxImpact = calculateCorporateTaxChange(15, retailerTaxRate)

// But tax-calculations.ts expects 10% baseline (Line 160)
if (newBankingRate !== 10) {  // ← Expects 10%, not 15%
```

**Calculation:**
- Current banking revenue: £18.72m at 10%
- Taxable profit: £18.72m ÷ 0.10 = £187.2m  
- At 15%: £187.2m × 0.15 = £28.08m
- **Impact: £28.08m - £18.72m = £9.36m**

---

## TOTAL IMPACT BREAKDOWN
| Issue | Amount | Line |
|-------|--------|------|
| Pillar 2 Double-Count | £25,000,000 | 159, 867 |
| Corporate Tax Mismatch | £9,360,000 | 850 |
| **TOTAL** | **£34,360,000** | |

**Verification:** £34,360,000 ≈ £34.4m observed ✅

---

## RECOMMENDATION

### Option A: Fix Default States (Recommended)
Change these defaults to start at true baseline:
```typescript
// Line 159: Start with Pillar 2 disabled  
const [pillarTwoEnabled, setPillarTwoEnabled] = useState(false)

// Line 850: Use 10% as banking baseline rate
const corporateTaxImpact = calculateCorporateTaxChange(10, retailerTaxRate)
```

### Option B: Adjust Baseline Calculation
Alternatively, change baseline calculation to exclude Pillar 2:
```typescript
// Line 805: Calculate baseline without Pillar 2
const baseline = calculateBaselineBudget(false)
```

---

## VERIFIED CORRECT ITEMS ✅
- NHS Levy Rate: 0% ✅ 
- Pensioner NI: false ✅
- General Fees Growth: 0% ✅  
- Tax Cap Level: £225,000 (matches baseline) ✅
- Personal Allowance: Uses baseline value ✅
- Income Tax Rates: 10%/21% (baseline values) ✅
- VAT Rate: 20% (matches baseline) ✅
- NI Rates: 11%/12.8% (baseline values) ✅

---

## EXPECTED RESULT AFTER FIX
- **Revenue:** £1,446,963,000 (true baseline)  
- **Change from Base Case:** £0
- **No false revenue inflation**

---

*Audit completed: August 31, 2025*  
*Issue: Revenue starts £34.4m above baseline*  
*Status: ROOT CAUSE IDENTIFIED - Ready for fix*