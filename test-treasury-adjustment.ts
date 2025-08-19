import { DEPARTMENTS, INITIAL_STATE } from './lib/budget-data'

console.log('Treasury Adjustment Test:')
console.log('=====================================')

const treasuryDept = DEPARTMENTS.find(d => d.name === 'Treasury')
const treasuryInitial = INITIAL_STATE.expenditure.departments.treasury

console.log(`Treasury Department budget: £${(treasuryDept!.budget / 1000000).toFixed(1)}m`)
console.log(`Treasury INITIAL_STATE budget: £${(treasuryInitial / 1000000).toFixed(1)}m`)

// Test 10% adjustment
const adjustment = 0.10 // 10%
const expectedImpact = treasuryDept!.budget * adjustment
const expectedImpactMillions = expectedImpact / 1000000

console.log(`\n10% adjustment calculation:`)
console.log(`Base budget: £${(treasuryDept!.budget / 1000000).toFixed(1)}m`)
console.log(`10% of budget: £${expectedImpactMillions.toFixed(1)}m`)
console.log(`Expected: £14.7m (10% of £146.9m)`)
console.log(`Correct:`, Math.abs(expectedImpactMillions - 14.7) < 0.1 ? '✓' : '✗')

// Test that it's NOT calculating based on old £460m value
const oldWrongValue = 460000000
const wrongImpact = oldWrongValue * adjustment / 1000000
console.log(`\nVerify NOT using old £460m value:`)
console.log(`10% of wrong £460m would be: £${wrongImpact.toFixed(1)}m`)
console.log(`We are calculating: £${expectedImpactMillions.toFixed(1)}m`)
console.log(`Confirmed using correct value:`, Math.abs(expectedImpactMillions - 46.0) > 30 ? '✓' : '✗')