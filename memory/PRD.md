# CastingKart Financial Master Planner - PRD

## Original Problem Statement
Build a complete, professional, investor-grade Financial Master Planner web application for CastingKart (Indian startup in Entertainment/Casting/Creator Marketplace). The app replaces Excel entirely with one input screen and multiple output screens, performing MBA-level financial calculations with investor-grade charts and Excel export functionality.

## Architecture
- **Frontend**: React with Tailwind CSS, Recharts for visualizations
- **Backend**: FastAPI with real-time financial calculation engine
- **Database**: MongoDB for storing saved scenarios
- **Export**: SheetJS (xlsx) for client-side Excel export

## User Personas
1. **Startup Founders** - Configure financial assumptions, analyze projections
2. **VC/Angel Investors** - Review financial metrics, compare scenarios
3. **Grant Committees** - Evaluate funding requirements and runway

## Core Requirements (Static)
- ✅ Single input screen with all financial assumptions
- ✅ 8 output screens (Revenue, Costs, P&L, Cash Flow, Unit Economics, Metrics, Scenarios)
- ✅ Currency: INR only
- ✅ Revenue starts Month 7 (configurable)
- ✅ Monthly projections (Y1), Annual (Y1-Y5)
- ✅ Professional charts with Recharts
- ✅ Export to Excel with multiple sheets
- ✅ Real-time recalculation on input changes
- ✅ Scenario comparison (Conservative/Base/Aggressive)

## What's Been Implemented (January 24, 2026)
1. **Master Inputs Screen** - Timeline, User Growth, Monetization, Costs, Tax, Funding inputs
2. **Revenue Breakdown Screen** - Monthly/Annual revenue, ARPU, stacked charts
3. **Cost & Burn Analysis Screen** - Cost breakdown pie charts, burn rate
4. **P&L Statement Screen** - EBITDA, EBIT, Net profit with trend charts
5. **Cash Flow & Runway Screen** - Operating cash flow, runway calculator
6. **Unit Economics Screen** - ARPU, margins, break-even analysis
7. **Key Metrics Dashboard** - CAGR, Rule of 40, burn multiple, radar chart
8. **Scenario Comparison Screen** - Conservative/Base/Aggressive comparison
9. **Excel Export** - Multi-sheet export with all projections
10. **Backend API** - Complete calculation engine with scenario support

## Prioritized Backlog

### P0 (Critical) - DONE
- All 8 screens implemented
- Real-time calculations
- Excel export

### P1 (High Priority) - Future
- Save/Load scenarios to MongoDB
- PDF export for investor reports
- Input validation with error messages

### P2 (Medium Priority) - Future
- Dark mode toggle
- Mobile responsive improvements
- Multi-currency support
- Custom scenario creation

## Next Tasks
1. Add input validation to prevent negative values
2. Improve mobile/tablet responsiveness
3. Add PDF export option for pitch decks
4. Save scenarios feature with naming
