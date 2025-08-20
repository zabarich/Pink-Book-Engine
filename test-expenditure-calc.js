const db = require('./data/source/department-budgets.json');
const tp = require('./data/source/transfer-payments.json');

console.log('=== EXPENDITURE CALCULATION INVESTIGATION ===\n');

// Calculate department totals
let deptTotalWithTreasury = 0;
let deptTotalWithoutTreasury = 0;
let grossTotal = 0;

console.log('DEPARTMENT BREAKDOWN:');
db.departments.forEach(d => {
  console.log(`${d.name}:`);
  console.log(`  Gross: £${(d.gross_expenditure/1e6).toFixed(1)}m`);
  console.log(`  Income: £${(d.income/1e6).toFixed(1)}m`);
  console.log(`  Net: £${(d.net_expenditure/1e6).toFixed(1)}m`);
  
  deptTotalWithTreasury += d.net_expenditure;
  if (d.name !== 'Treasury') {
    deptTotalWithoutTreasury += d.net_expenditure;
  }
  grossTotal += d.gross_expenditure;
});

console.log('\n=== TOTALS ===');
console.log('Departments NET (all):', `£${(deptTotalWithTreasury/1e6).toFixed(1)}m`);
console.log('Departments NET (excl Treasury):', `£${(deptTotalWithoutTreasury/1e6).toFixed(1)}m`);
console.log('Departments GROSS (all):', `£${(grossTotal/1e6).toFixed(1)}m`);
console.log('Transfer Payments:', `£${(tp.metadata.total_transfer_payments/1e6).toFixed(1)}m`);
console.log('Capital Expenditure:', `£87.4m`);

console.log('\n=== CALCULATION OPTIONS ===');

// Option 1: Use NET excluding Treasury
const option1 = deptTotalWithoutTreasury + tp.metadata.total_transfer_payments + 87400000;
console.log('Option 1 (NET excl Treasury + Transfers + Capital):', `£${(option1/1e6).toFixed(1)}m`);

// Option 2: Use GROSS for all
const option2 = grossTotal + tp.metadata.total_transfer_payments + 87400000;
console.log('Option 2 (GROSS all + Transfers + Capital):', `£${(option2/1e6).toFixed(1)}m`);

// Option 3: Current broken calculation
const option3 = deptTotalWithTreasury + tp.metadata.total_transfer_payments + 87400000 + 110600000;
console.log('Option 3 (Current - NET all + Transfers + Capital + Reserves):', `£${(option3/1e6).toFixed(1)}m`);

console.log('\n=== WHAT THE CODE IS DOING ===');
console.log('The debug-calculations.ts is summing:');
console.log('1. All department net_expenditure (INCLUDING Treasury negative):', `£${(deptTotalWithTreasury/1e6).toFixed(1)}m`);
console.log('2. Transfer payments:', `£${(tp.metadata.total_transfer_payments/1e6).toFixed(1)}m`);
console.log('3. Capital:', `£87.4m`);
console.log('4. Reserves drawdown:', `£110.6m`);
console.log('TOTAL:', `£${((deptTotalWithTreasury + tp.metadata.total_transfer_payments + 87400000 + 110600000)/1e6).toFixed(1)}m`);

console.log('\n=== THE PROBLEM ===');
console.log('Treasury has NEGATIVE £710.7m net expenditure because it COLLECTS revenue!');
console.log('This is incorrectly reducing total expenditure by £710.7m');

console.log('\n=== THE FIX ===');
console.log('Either:');
console.log('1. Exclude Treasury from department totals, OR');
console.log('2. Use gross_expenditure for all departments');
console.log('\nCorrect total should be around £1,387.8m');