// Senior Auditor Test Suite - Simplified version
import { 
  calculateIncomeTaxChange, 
  calculateNIChange, 
  calculateCorporateTaxChange,
  calculateVATChange,
  INCOME_TAX_DATA,
  NATIONAL_INSURANCE_DATA,
  CORPORATE_TAX_DATA,
  VAT_DATA
} from './lib/calculations/tax-calculations.ts';

import {
  calculatePensionChanges,
  STATE_PENSION_DATA
} from './lib/calculations/benefits-calculations.ts';

console.log('=== SENIOR AUDITOR INDEPENDENT VERIFICATION ===\n');

// CRITICAL TEST 1: Income Tax Standard Rate 10% -> 11%
console.log('CRITICAL TEST 1: Income Tax Standard Rate 10% -> 11%');
const standardRateResult = calculateIncomeTaxChange(1, 0);
console.log(`Expected: £16,500,000`);
console.log(`Actual: £${standardRateResult.toLocaleString()}`);
const test1Pass = Math.abs(standardRateResult - 16514500) < 100000;
console.log(`Status: ${test1Pass ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Deviation: ${((standardRateResult - 16514500) / 16514500 * 100).toFixed(2)}%\n`);

// CRITICAL TEST 2: Income Tax Higher Rate 21% -> 22%
console.log('CRITICAL TEST 2: Income Tax Higher Rate 21% -> 22%');
const higherRateResult = calculateIncomeTaxChange(0, 1);
console.log(`Expected: £7,900,000`);
console.log(`Actual: £${higherRateResult.toLocaleString()}`);
const test2Pass = Math.abs(higherRateResult - 7864048) < 100000;
console.log(`Status: ${test2Pass ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Deviation: ${((higherRateResult - 7864048) / 7864048 * 100).toFixed(2)}%\n`);

// CRITICAL TEST 3: Both rates changed - should sum correctly
console.log('CRITICAL TEST 3: Both rates changed by 1%');
const bothRatesResult = calculateIncomeTaxChange(1, 1);
const expectedTotal = 16514500 + 7864048;
console.log(`Expected: £${expectedTotal.toLocaleString()}`);
console.log(`Actual: £${bothRatesResult.toLocaleString()}`);
const test3Pass = Math.abs(bothRatesResult - expectedTotal) < 1000;
console.log(`Status: ${test3Pass ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Components sum correctly: ${test3Pass ? 'YES' : 'NO'}\n`);

// CRITICAL TEST 4: Different changes give different results (NOT £1.9m for all)
console.log('CRITICAL TEST 4: Different changes must give different results');
const test1percent = calculateIncomeTaxChange(1, 0);
const test2percent = calculateIncomeTaxChange(2, 0);
const test3percent = calculateIncomeTaxChange(3, 0);
console.log(`1% change: £${test1percent.toLocaleString()}`);
console.log(`2% change: £${test2percent.toLocaleString()}`);
console.log(`3% change: £${test3percent.toLocaleString()}`);
const test4Pass = (test1percent !== test2percent) && (test2percent !== test3percent);
console.log(`Status: ${test4Pass ? '✅ PASS - Different results' : '❌ FAIL - Identical results (BROKEN!)'}\n`);

// CRITICAL TEST 5: National Insurance - No arbitrary multipliers
console.log('CRITICAL TEST 5: National Insurance Employee Rate +1%');
const niEmployeeResult = calculateNIChange(1, 0);
const expectedNIEmployee = 164871000 / 0.11 * 0.01; // Base * rate change
console.log(`Expected: £${expectedNIEmployee.toLocaleString()}`);
console.log(`Actual: £${niEmployeeResult.toLocaleString()}`);
const test5Pass = Math.abs(niEmployeeResult - expectedNIEmployee) < 10000;
console.log(`Status: ${test5Pass ? '✅ PASS' : '❌ FAIL'}`);
const noMultiplier = niEmployeeResult > expectedNIEmployee * 0.9;
console.log(`No × 0.5 multiplier: ${noMultiplier ? '✅ YES' : '❌ NO (BROKEN!)'}\n`);

// DATA VALIDATION
console.log('=== DATA VALIDATION AGAINST PINK BOOK ===');
console.log(`Income Tax Total: £${INCOME_TAX_DATA.total_revenue.toLocaleString()} (Expected: £384,040,000)`);
console.log(`NI Total: £${NATIONAL_INSURANCE_DATA.total_revenue.toLocaleString()} (Expected: £329,742,000)`);
console.log(`State Pension: £${STATE_PENSION_DATA.total_cost.toLocaleString()} (Expected: £245,000,000)`);
console.log(`VAT Total: £${VAT_DATA.total_revenue.toLocaleString()} (Expected: £388,464,000)`);

// FINAL VERDICT
console.log('\n=== AUDIT VERDICT ===');
const allTestsPass = test1Pass && test2Pass && test3Pass && test4Pass && test5Pass && noMultiplier;
if (allTestsPass) {
  console.log('✅ ALL CRITICAL TESTS PASSED');
  console.log('The tax calculation engine appears to be FIXED and ACCURATE');
} else {
  console.log('❌ CRITICAL FAILURES DETECTED');
  console.log('The tool is NOT ready for ministerial use');
}

console.log('\n=== END OF AUDIT ===');