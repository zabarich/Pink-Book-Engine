# Isle of Man Master Policy Engine

## 🚨 ABSOLUTE LAWS FOR DEVELOPMENT

<law>
**NEVER WRITE TODO, PLACEHOLDER, OR ANY FORM OF INCOMPLETE CODE**
- Never write "TODO" comments
- Never write "Placeholder" comments  
- Never write "Will implement later" comments
- Never write "To be completed" comments
- Never leave any function stub or incomplete implementation
- Every piece of code must be fully functional when written
- If you cannot complete something, DO NOT START IT
- The application must be production-ready at every single commit
</law>

<law>
**NO HARDCODING VALUES INTO THE CODE!!!! NO LAZY BEHAVIOUR**
- ALL numeric values must come from JSON files
- NO hardcoded numbers in TypeScript/JavaScript code
- NO exceptions - not even "temporary" ones
- NO lazy shortcuts - do it right the first time
- Before writing ANY number, check if it should be in JSON
- Start EVERY task by saying "No hardcoding"
</law>

## ⚠️ CRITICAL: EMERGENCY REBUILD IN PROGRESS
**Specification Document**: `C:\Users\shopp\OneDrive\Apps\PINK BOOK\Specs\budget_tool_fix_specification.md`

This tool is undergoing a complete rebuild due to catastrophic calculation errors. A Senior Auditor will review all work. Do NOT use the tool until all fixes are verified.

## Project Overview
Building a comprehensive budget modeling tool for the Isle of Man Government that covers the entire £1.4 billion budget with real-time scenario planning capabilities.

## Current Context
We have successfully:
1. Extracted all 93 pages of the Pink Book 2025-26
2. Created structured JSON data files with all revenue and expenditure details
3. Identified key figures including:
   - Vehicle Duty: £16,039,000
   - Heritage Railway: £2,250,000 annual budget
   - Public Transport: £11.37m total support
   - Total Budget: £1.389 billion revenue, £1.388 billion expenditure

## Specification
**IMPORTANT: Read the full specification at `spec.md` before making any changes.**

The spec.md file contains:
- Complete MVP requirements
- All revenue and expenditure controls
- Real-time calculation models
- Visualization requirements
- Workshop scenarios to support
- Technical implementation details

## Key Features to Implement
1. **Core Dashboard**: Real-time view of £1.4bn budget
2. **Workshop Interface**: Interactive controls for all revenue/spending levers
3. **Calculation Engine**: Behavioral models, sustainability metrics
4. **Preset Scenarios**: One-click policy packages
5. **Visualizations**: Waterfall, Sankey, trajectory charts
6. **Export System**: PDF reports, scenario saving

## Data Structure
All Pink Book data is extracted and stored in `/data/source/`:
- `revenue-streams.json` - All government income (£1.389bn)
- `department-budgets.json` - All department spending (£1.388bn)
- `capital-programme.json` - Infrastructure investments (£87.4m/year)
- `transfer-payments.json` - Benefits and pensions (£441m)
- `reserves-funds.json` - Reserve positions (£1.76bn general)

## Workshop Scenarios to Support
The tool must enable these key scenarios:
1. "Find £50m savings" - Optimization across all departments
2. "Make buses free" - Additional £3.5m cost modeling
3. "Reduce Heritage Railway to 5 days" - Save £600k
4. "Balance budget by 2030" - Eliminate structural deficit
5. Vehicle duty policy changes - Our original £16m revenue stream

## Technical Stack
- Next.js 14+ with App Router
- TypeScript for type safety
- shadcn/ui + Tailwind for UI
- Zustand for state management
- Recharts + D3.js for visualizations
- Real Pink Book data (already extracted)

## Implementation Plan
**IMPORTANT: See `IMPLEMENTATION_PLAN.md` for detailed implementation of Specific Policies Panel with £49-72m additional savings potential.**

## Development Commands
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint and typecheck
npm run lint
npm run typecheck
```

## File Structure
```
app/
├── page.tsx                    # Main dashboard
├── workshop/
│   └── page.tsx               # Interactive workshop
├── components/
│   ├── revenue-controls.tsx   # Tax and revenue sliders
│   ├── expenditure-controls.tsx # Department budgets
│   ├── policy-toggles.tsx     # Major policy switches
│   └── visualizations/        # Charts and graphs
├── lib/
│   ├── calculations/          # Revenue/expenditure models
│   ├── data/                  # JSON data files
│   └── stores/                # State management
```

## Implementation Priority
1. **Phase 1**: Core dashboard with current budget display
2. **Phase 2**: Calculation engine with real modeling
3. **Phase 3**: Workshop interface with all controls
4. **Phase 4**: Visualizations and charts
5. **Phase 5**: Export and reporting features

## Key Calculations to Implement
- **Laffer Curve**: Diminishing returns on high tax rates
- **Behavioral Response**: People leaving if taxes too high
- **Service Levels**: Minimum viable thresholds per department
- **Sustainability Score**: Years until reserve depletion
- **Cross-Dependencies**: Ripple effects between departments

## Testing Checklist
- [ ] All revenue streams calculate correctly (£1.389bn total)
- [ ] All departments budget properly (£1.388bn total)
- [ ] Vehicle duty model works (£16m baseline)
- [ ] Heritage Railway scenario saves £600k
- [ ] "Find £50m" scenario identifies real savings
- [ ] Reserve trajectory calculates accurately
- [ ] Sustainability metrics are realistic
- [ ] Export features work properly

## Quality Assurance Checklist
Before handover to Senior Auditor, ALL items must be verified:
- [ ] Income tax 10%→11% calculates £16.5m (NOT £1.9m)
- [ ] Higher rate 21%→22% calculates £7.9m (NOT £1.9m)
- [ ] National Insurance uses proper employer/employee splits
- [ ] All arbitrary multipliers (× 0.5, × 0.8, × 0.9) removed
- [ ] All department budgets use real Pink Book figures
- [ ] Save scenario actually saves data
- [ ] Export produces real PDF/Excel files
- [ ] No "rough estimate" comments remain in code
- [ ] All calculations traceable to Pink Book sources
- [ ] 50+ £1m policy options calculate properly

## Critical Fixes Required
1. **Tax Calculations**: Currently showing £1.9m for ALL changes - BROKEN
2. **Arbitrary Multipliers**: Remove all × 0.5, × 0.8, × 0.9 fake adjustments
3. **Hardcoded Values**: Replace £500m corporate tax, £100m banking tax guesses
4. **Save/Export**: Currently non-functional, must work for ministerial use
5. **Benefits Calculations**: Remove all "rough estimates"

## Notes for Development
- This is a single-user MVP, no auth required
- Focus on calculation accuracy over UI polish initially
- Use real Pink Book data, not mock data
- Ensure all £1.4 billion is accounted for
- Make it fast (<100ms calculations)
- Keep it simple but comprehensive

## Contact
This tool is being built for the Isle of Man Government to transform budget decision-making. It will be used in Council of Ministers workshops to model policy impacts in real-time.