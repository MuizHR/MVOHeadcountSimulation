# SimulationHistoryViewer Updates Needed

## Problem
The history viewer is currently showing simplified versions of:
1. **Workload tab (Tab 2)** - Only showing range inputs, but actual wizard has 15 questions organized in 5 sections
2. **Results tab (Tab 5)** - Showing basic cards, but actual wizard has comprehensive dashboard with KPI cards, comparison tables, and AI summary

## Solution Required

### Tab 2: Workload & Risk Inputs
**Current Implementation**: Shows min-typical-max range inputs only
**Required**: Show all 15 questions from Step3HRQuestions.tsx in read-only format:

**Section 1: About the Work** (Q1-3)
- Q1: Work Type dropdown (display selected value)
- Q2: Complexity (4 cards - show selected)
- Q3: Volume (5 cards - show selected)

**Section 2: About Daily Productivity** (Q4-6)
- Q4: Tasks per staff (4 cards - show selected)
- Q5: Productivity when good (4 cards - show selected)
- Q6: Productivity when bad (4 cards - show selected)

**Section 3: Staff & Risk Factors** (Q7-9)
- Q7: Absenteeism (4 cards - show selected)
- Q8: Ramp-up time (4 cards - show selected)
- Q9: Team stability (3 cards - show selected)

**Section 4: Staff Type & Cost** (Q10-11)
- Q10: Staff configuration table (show configured roles)
- Q11: Overtime frequency (3 cards - show selected)

**Section 5: Targets & Priorities** (Q13-15)
- Q13: Deadline (5 cards - show selected)
- Q14: Impact level (3 cards - show selected)
- Q15: Priority (3 cards - show selected)

**Data Source**: subFunction.hrAnswers object contains all the answers

### Tab 5: Results
**Current Implementation**: Basic FTE, Cost, Workload cards + simple sub-function list
**Required**: Full dashboard matching Step6ResultsDashboard.tsx:

1. **MVO Recommendation Banner** (teal gradient card at top)
2. **Export Buttons Row** (Word, PDF, Excel, Email)
3. **Key Statistics Section** (KPICards component) showing:
   - Headcount (with baseline vs MVO change)
   - Delivery Time (avg + P90)
   - Cost & Savings (monthly cost + savings)
   - Failure Risk (percentage + status)

4. **Sub-Function Breakdown** (Accordion with detailed breakdown per sub-function)
5. **Headcount Comparison Table** (showing all scenarios from baseline-2 to baseline+5)
6. **System-Suggested Role Composition** (showing recommended roles with counts and salary ranges)
7. **AI Summary** (purple gradient box with key takeaways)
8. **Understanding the Results** (blue info box explaining metrics)

**Data Source**: resultPayload.simulationResult object contains all dashboard data

## Implementation Steps

1. Read hrAnswers from each subFunction to populate all 15 questions
2. Use SimulationResult type from dashboardResult.ts for results data
3. Import and reuse dashboard components: KPICards, SubFunctionAccordion, HeadcountComparisonTable, SystemRoleCompositionPanel
4. Style all question cards as read-only (disabled, cursor-not-allowed, selected items highlighted in teal)

## Files to Reference
- `/src/components/wizard/Step3HRQuestions.tsx` - For complete question structure
- `/src/components/wizard/Step6ResultsDashboard.tsx` - For complete results layout
- `/src/components/dashboard/*.tsx` - For dashboard component implementations
- `/src/types/dashboardResult.ts` - For SimulationResult type definition
