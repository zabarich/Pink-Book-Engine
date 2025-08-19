import { DEPARTMENTS, INITIAL_STATE } from './lib/budget-data.js'

console.log('Department Budget Values Check:')
console.log('=====================================')

// Check DEPARTMENTS array
console.log('\nDEPARTMENTS array values:')
DEPARTMENTS.forEach(dept => {
  console.log(`${dept.name}: £${(dept.budget / 1000000).toFixed(1)}m`)
})

console.log('\n\nINITIAL_STATE department values:')
const deptMap = {
  'health': 'Health & Social Care',
  'education': 'Education, Sport & Culture',
  'infrastructure': 'Infrastructure',
  'homeAffairs': 'Home Affairs',
  'treasury': 'Treasury',
  'cabinetOffice': 'Cabinet Office',
  'enterprise': 'Enterprise',
  'environment': 'Environment, Food & Agriculture',
  'executive': 'Executive Government',
  'statutoryBoards': 'Statutory Boards',
  'legislature': 'Legislature'
}

for (const [key, value] of Object.entries(INITIAL_STATE.expenditure.departments)) {
  console.log(`${deptMap[key] || key}: £${(value / 1000000).toFixed(1)}m`)
}

console.log('\n\nVerification of correct values:')
console.log('Treasury should be £146.9m:', INITIAL_STATE.expenditure.departments.treasury === 146878000 ? '✓' : '✗')
console.log('Health should be £298.1m:', INITIAL_STATE.expenditure.departments.health === 298088000 ? '✓' : '✗')
console.log('Infrastructure should be £49.7m:', INITIAL_STATE.expenditure.departments.infrastructure === 49661000 ? '✓' : '✗')

// Calculate total departmental spend
const totalDepartments = Object.values(INITIAL_STATE.expenditure.departments).reduce((sum, val) => sum + val, 0)
console.log(`\nTotal departmental spending: £${(totalDepartments / 1000000).toFixed(1)}m`)
console.log('Expected total (from JSON): £819.8m')
console.log('Match:', Math.abs(totalDepartments - 819790000) < 1000 ? '✓' : '✗')