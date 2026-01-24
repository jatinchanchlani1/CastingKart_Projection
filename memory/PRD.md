# CastingKart Financial Master Planner - PRD v2.0

## Original Problem Statement
Build a complete, professional, investor-grade Financial Master Planner web application for CastingKart (Indian startup in Entertainment/Casting/Creator Marketplace). Enhanced with dynamic input sections for team salaries, funding rounds, hardware costs, travel, other expenses, and other income.

## Architecture
- **Frontend**: React with Tailwind CSS, Recharts for visualizations
- **Backend**: FastAPI with real-time financial calculation engine
- **Database**: MongoDB for storing saved scenarios
- **Export**: SheetJS (xlsx) for client-side Excel export with 11 sheets

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
- ✅ Export to Excel with 11 sheets
- ✅ Real-time recalculation on input changes
- ✅ Scenario comparison (Conservative/Base/Aggressive)

## What's Been Implemented (January 24, 2026)

### Phase 1 - MVP
1. All 8 screens implemented
2. Real-time calculations
3. Basic Excel export

### Phase 2 - Enhanced Dynamic Inputs (Current)
1. **Dynamic Team & Salaries**
   - Add/remove founders with stipend and start date
   - Add/remove interns with salary and start date
   - Add/remove full-time employees with salary and start date
   - Add/remove others (consultants) with payment and start date
   - ESOP allocation slider

2. **Physical Infrastructure**
   - Office rent, electricity, internet, maintenance
   - Office start date (month/year)

3. **Digital Infrastructure**
   - Hosting, storage, SaaS tools, AI compute

4. **Hardware & Equipment (Dynamic)**
   - Laptops, chairs, tables, stationery
   - Unit cost, quantity, purchase month/year
   - Add/remove items

5. **Travel Costs (Dynamic)**
   - Local travel, client meetings
   - Monthly amount, recurring/one-time toggle
   - Start month/year, Add/remove items

6. **Other Expenses (Dynamic)**
   - Miscellaneous expenses
   - Amount, recurring/one-time toggle
   - Start month/year, Add/remove items

7. **Other Income Sources (Dynamic)**
   - Google Ads revenue, other income
   - Amount, recurring/one-time toggle
   - Start month/year, Add/remove items

8. **Funding Rounds (Dynamic)**
   - Multiple funding rounds (Seed, Series A, etc.)
   - Amount, timing, investor name, notes
   - Add/remove rounds

9. **Enhanced Excel Export**
   - 11 sheets: Summary, Inputs, Revenue, Costs, P&L, Cash Flow, Unit Economics, Key Metrics, Scenarios, Team, Funding
   - All dynamic inputs included
   - Cost composition and growth analysis

## Prioritized Backlog

### P0 (Critical) - DONE
- All 8 screens implemented
- All dynamic input sections
- Enhanced Excel export

### P1 (High Priority) - Future
- Save/Load scenarios to MongoDB
- PDF export for investor reports
- Chart images in Excel export

### P2 (Medium Priority) - Future
- Dark mode toggle
- Mobile responsive improvements
- Multi-currency support
- Custom scenario creation with custom multipliers

## Next Tasks
1. Add Save/Load functionality for scenarios
2. Add PDF export option for pitch decks
3. Add chart images to Excel export
