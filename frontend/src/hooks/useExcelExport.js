import { useCallback } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MONTHS, YEARS, formatCurrency } from '../lib/utils';

export function useExcelExport() {
  const exportToExcel = useCallback((inputs, projections) => {
    if (!projections) return;

    const workbook = XLSX.utils.book_new();

    // Helper function to add styling info
    const addHeader = (sheet, range) => {
      if (!sheet['!merges']) sheet['!merges'] = [];
    };

    // ===== Sheet 1: Summary Dashboard =====
    const summaryData = [
      ['CASTINGKART FINANCIAL MASTER PLANNER'],
      [''],
      ['EXECUTIVE SUMMARY'],
      [''],
      ['Scenario', inputs.timeline.scenario.toUpperCase()],
      ['Projection Period', `${inputs.timeline.projection_years} Years`],
      ['Revenue Start', `Month ${inputs.timeline.revenue_start_month}`],
      [''],
      ['KEY METRICS', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5'],
      ['Revenue', ...projections.revenue.annual.total.map(v => v)],
      ['Total Costs', ...projections.costs.annual.total.map(v => v)],
      ['EBITDA', ...projections.pnl.annual.ebitda.map(v => v)],
      ['Net Profit/Loss', ...projections.pnl.annual.net_profit.map(v => v)],
      ['Cumulative Cash', ...projections.cashflow.annual.cumulative_cash.map(v => v)],
      [''],
      ['GROWTH METRICS'],
      ['Revenue CAGR', `${projections.key_metrics.revenue_cagr}%`],
      ['Cost CAGR', `${projections.key_metrics.cost_cagr}%`],
      ['Break-even', projections.unit_economics.break_even_month > 0 ? `Month ${projections.unit_economics.break_even_month}` : 'Beyond Y5'],
      [''],
      ['FUNDING SUMMARY'],
      ...inputs.funding.rounds.map(r => [r.name, r.amount, `Y${r.year} M${r.month}`, r.investor]),
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // ===== Sheet 2: All Inputs =====
    const inputsData = [
      ['MASTER INPUTS & ASSUMPTIONS'],
      [''],
      ['TIMELINE & PLANNING'],
      ['Revenue Start Month', inputs.timeline.revenue_start_month],
      ['Projection Years', inputs.timeline.projection_years],
      ['Inflation Rate (%)', inputs.timeline.inflation_rate],
      ['Scenario', inputs.timeline.scenario.toUpperCase()],
      [''],
      ['USER GROWTH (End of Year)'],
      ['', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5'],
      ['Artists', inputs.user_growth.artists_y1, inputs.user_growth.artists_y2, inputs.user_growth.artists_y3, inputs.user_growth.artists_y4, inputs.user_growth.artists_y5],
      ['Casting Directors', inputs.user_growth.cds_y1, inputs.user_growth.cds_y2, inputs.user_growth.cds_y3, inputs.user_growth.cds_y4, inputs.user_growth.cds_y5],
      [''],
      ['ARTIST MONETIZATION'],
      ['Premium Price (₹/month)', inputs.artist_monetization.premium_price],
      ['Conversion Rate (%)', inputs.artist_monetization.conversion_rate],
      ['Churn Rate (%)', inputs.artist_monetization.churn_rate],
      [''],
      ['CD MONETIZATION'],
      ['Premium Price (₹/month)', inputs.cd_monetization.premium_price],
      ['Conversion Rate (%)', inputs.cd_monetization.conversion_rate],
      ['Churn Rate (%)', inputs.cd_monetization.churn_rate],
      [''],
      ['TRANSACTIONAL'],
      ['Avg Jobs per CD/month', inputs.transactional.avg_jobs_per_cd],
      ['Job Boost Price (₹)', inputs.transactional.job_boost_price],
      ['Boost Percentage (%)', inputs.transactional.boost_percentage],
      ['Escrow Fee (%)', inputs.transactional.escrow_fee_percentage],
      ['Escrow Enabled Year', inputs.transactional.escrow_enabled_year],
      [''],
      ['TEAM MEMBERS'],
      ['Name', 'Role', 'Monthly Salary', 'Start'],
      ...inputs.team_costs.members.map(m => [m.name, m.role, m.monthly_salary, `Y${m.start_year} M${m.start_month}`]),
      ['ESOP Allocation (%)', inputs.team_costs.esop_percentage],
      [''],
      ['PHYSICAL INFRASTRUCTURE (Monthly)'],
      ['Office Rent', inputs.physical_infra.office_rent],
      ['Electricity', inputs.physical_infra.electricity],
      ['Internet', inputs.physical_infra.internet],
      ['Maintenance', inputs.physical_infra.maintenance],
      ['Office Starts', `Y${inputs.physical_infra.office_start_year} M${inputs.physical_infra.office_start_month}`],
      [''],
      ['DIGITAL INFRASTRUCTURE (Monthly)'],
      ['Hosting', inputs.digital_infra.hosting],
      ['Storage', inputs.digital_infra.storage],
      ['AI Compute (when enabled)', inputs.digital_infra.ai_compute_enabled],
      ['SaaS Tools', inputs.digital_infra.saas_tools],
      [''],
      ['HARDWARE & EQUIPMENT'],
      ['Item', 'Unit Cost', 'Quantity', 'Purchase'],
      ...inputs.hardware_costs.items.map(h => [h.name, h.unit_cost, h.quantity, `Y${h.purchase_year} M${h.purchase_month}`]),
      [''],
      ['MARKETING (Monthly)'],
      ['Organic', inputs.marketing_costs.organic],
      ['Paid', inputs.marketing_costs.paid],
      ['Influencer', inputs.marketing_costs.influencer],
      [''],
      ['TRAVEL COSTS'],
      ['Item', 'Monthly Amount', 'Type', 'Start'],
      ...inputs.travel_costs.items.map(t => [t.name, t.estimated_monthly, t.is_recurring ? 'Recurring' : 'One-time', `Y${t.start_year} M${t.start_month}`]),
      [''],
      ['OTHER EXPENSES'],
      ['Item', 'Amount', 'Type', 'Start'],
      ...inputs.other_expenses.items.map(e => [e.name, e.amount, e.is_recurring ? 'Recurring' : 'One-time', `Y${e.start_year} M${e.start_month}`]),
      [''],
      ['OTHER INCOME'],
      ['Source', 'Amount', 'Type', 'Start'],
      ...inputs.other_income.items.map(i => [i.name, i.amount, i.is_recurring ? 'Recurring' : 'One-time', `Y${i.start_year} M${i.start_month}`]),
      [''],
      ['FUNDING ROUNDS'],
      ['Round', 'Amount', 'Timing', 'Investor', 'Notes'],
      ...inputs.funding.rounds.map(r => [r.name, r.amount, `Y${r.year} M${r.month}`, r.investor, r.notes || '']),
      [''],
      ['TAX & COMPLIANCE'],
      ['Corporate Tax Rate (%)', inputs.tax_inputs.corporate_tax_rate],
      ['GST Rate (%)', inputs.tax_inputs.gst_rate],
      ['TDS Rate (%)', inputs.tax_inputs.tds_rate],
      ['Depreciation Rate (%)', inputs.tax_inputs.depreciation_rate],
    ];
    
    const inputsSheet = XLSX.utils.aoa_to_sheet(inputsData);
    inputsSheet['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, inputsSheet, 'Inputs');

    // ===== Sheet 3: Revenue =====
    const revenueData = [
      ['REVENUE BREAKDOWN'],
      [''],
      ['MONTHLY REVENUE - YEAR 1'],
      ['Month', ...MONTHS],
      ['Artist Premium', ...projections.revenue.monthly.artist_premium],
      ['CD Premium', ...projections.revenue.monthly.cd_premium],
      ['Boosts', ...projections.revenue.monthly.boosts],
      ['Escrow', ...projections.revenue.monthly.escrow],
      ['Other Income', ...projections.revenue.monthly.other_income],
      ['TOTAL REVENUE', ...projections.revenue.monthly.total],
      [''],
      ['ANNUAL REVENUE - 5 YEARS'],
      ['Year', ...YEARS],
      ['Artist Premium', ...projections.revenue.annual.artist_premium],
      ['CD Premium', ...projections.revenue.annual.cd_premium],
      ['Boosts', ...projections.revenue.annual.boosts],
      ['Escrow', ...projections.revenue.annual.escrow],
      ['Other Income', ...projections.revenue.annual.other_income],
      ['TOTAL REVENUE', ...projections.revenue.annual.total],
      [''],
      ['REVENUE GROWTH'],
      ['Year', ...YEARS],
      ['YoY Growth %', 0, 
        ...YEARS.slice(1).map((_, i) => {
          const prev = projections.revenue.annual.total[i];
          const curr = projections.revenue.annual.total[i + 1];
          return prev > 0 ? Math.round((curr - prev) / prev * 100) : 0;
        })
      ],
    ];
    
    const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData);
    revenueSheet['!cols'] = [{ wch: 18 }, ...Array(12).fill({ wch: 12 })];
    XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Revenue');

    // ===== Sheet 4: Costs =====
    const costsData = [
      ['COST BREAKDOWN'],
      [''],
      ['MONTHLY COSTS - YEAR 1'],
      ['Month', ...MONTHS],
      ['Team', ...projections.costs.monthly.team],
      ['Digital Infrastructure', ...projections.costs.monthly.digital_infra],
      ['Physical Infrastructure', ...projections.costs.monthly.physical_infra],
      ['Hardware', ...projections.costs.monthly.hardware],
      ['Marketing', ...projections.costs.monthly.marketing],
      ['Travel', ...projections.costs.monthly.travel],
      ['Admin', ...projections.costs.monthly.admin],
      ['Other Expenses', ...projections.costs.monthly.other],
      ['TOTAL COSTS', ...projections.costs.monthly.total],
      [''],
      ['ANNUAL COSTS - 5 YEARS'],
      ['Year', ...YEARS],
      ['Team', ...projections.costs.annual.team],
      ['Digital Infrastructure', ...projections.costs.annual.digital_infra],
      ['Physical Infrastructure', ...projections.costs.annual.physical_infra],
      ['Hardware', ...projections.costs.annual.hardware],
      ['Marketing', ...projections.costs.annual.marketing],
      ['Travel', ...projections.costs.annual.travel],
      ['Admin', ...projections.costs.annual.admin],
      ['Other Expenses', ...projections.costs.annual.other],
      ['TOTAL COSTS', ...projections.costs.annual.total],
      [''],
      ['COST COMPOSITION - YEAR 1'],
      ['Category', 'Amount', '% of Total'],
      ['Team', projections.costs.annual.team[0], Math.round(projections.costs.annual.team[0] / projections.costs.annual.total[0] * 100) + '%'],
      ['Digital Infra', projections.costs.annual.digital_infra[0], Math.round(projections.costs.annual.digital_infra[0] / projections.costs.annual.total[0] * 100) + '%'],
      ['Physical Infra', projections.costs.annual.physical_infra[0], Math.round(projections.costs.annual.physical_infra[0] / projections.costs.annual.total[0] * 100) + '%'],
      ['Hardware', projections.costs.annual.hardware[0], Math.round(projections.costs.annual.hardware[0] / projections.costs.annual.total[0] * 100) + '%'],
      ['Marketing', projections.costs.annual.marketing[0], Math.round(projections.costs.annual.marketing[0] / projections.costs.annual.total[0] * 100) + '%'],
      ['Travel', projections.costs.annual.travel[0], Math.round(projections.costs.annual.travel[0] / projections.costs.annual.total[0] * 100) + '%'],
      ['Admin', projections.costs.annual.admin[0], Math.round(projections.costs.annual.admin[0] / projections.costs.annual.total[0] * 100) + '%'],
      ['Other', projections.costs.annual.other[0], Math.round(projections.costs.annual.other[0] / projections.costs.annual.total[0] * 100) + '%'],
    ];
    
    const costsSheet = XLSX.utils.aoa_to_sheet(costsData);
    costsSheet['!cols'] = [{ wch: 22 }, ...Array(12).fill({ wch: 12 })];
    XLSX.utils.book_append_sheet(workbook, costsSheet, 'Costs');

    // ===== Sheet 5: P&L =====
    const pnlData = [
      ['PROFIT & LOSS STATEMENT'],
      [''],
      ['MONTHLY P&L - YEAR 1'],
      ['Month', ...MONTHS],
      ['Revenue', ...projections.pnl.monthly.revenue],
      ['Gross Profit (85%)', ...projections.pnl.monthly.gross_profit],
      ['Operating Expenses', ...projections.pnl.monthly.operating_expenses],
      ['EBITDA', ...projections.pnl.monthly.ebitda],
      ['Depreciation', ...projections.pnl.monthly.depreciation],
      ['EBIT', ...projections.pnl.monthly.ebit],
      ['Taxes', ...projections.pnl.monthly.taxes],
      ['NET PROFIT/LOSS', ...projections.pnl.monthly.net_profit],
      [''],
      ['ANNUAL P&L - 5 YEARS'],
      ['Line Item', ...YEARS],
      ['Revenue', ...projections.pnl.annual.revenue],
      ['Gross Profit (85%)', ...projections.pnl.annual.gross_profit],
      ['Operating Expenses', ...projections.pnl.annual.operating_expenses],
      ['EBITDA', ...projections.pnl.annual.ebitda],
      ['Depreciation', ...projections.pnl.annual.depreciation],
      ['EBIT', ...projections.pnl.annual.ebit],
      ['Taxes', ...projections.pnl.annual.taxes],
      ['NET PROFIT/LOSS', ...projections.pnl.annual.net_profit],
      [''],
      ['MARGINS'],
      ['Year', ...YEARS],
      ['Gross Margin %', ...projections.key_metrics.gross_margin_pct.map(v => v + '%')],
      ['EBITDA Margin %', ...projections.key_metrics.ebitda_margin_pct.map(v => v + '%')],
    ];
    
    const pnlSheet = XLSX.utils.aoa_to_sheet(pnlData);
    pnlSheet['!cols'] = [{ wch: 22 }, ...Array(12).fill({ wch: 12 })];
    XLSX.utils.book_append_sheet(workbook, pnlSheet, 'P&L');

    // ===== Sheet 6: Cash Flow =====
    const cashflowData = [
      ['CASH FLOW & RUNWAY'],
      [''],
      ['MONTHLY CASH FLOW - YEAR 1'],
      ['Month', ...MONTHS],
      ['Operating Cash Flow', ...projections.cashflow.monthly.operating_cash_flow],
      ['Net Burn', ...projections.cashflow.monthly.net_burn],
      ['Cumulative Cash', ...projections.cashflow.monthly.cumulative_cash],
      ['Runway (Months)', ...projections.cashflow.monthly.runway_months],
      [''],
      ['ANNUAL CASH FLOW - 5 YEARS'],
      ['Year', ...YEARS],
      ['Operating Cash Flow', ...projections.cashflow.annual.operating_cash_flow],
      ['Funding Received', ...projections.cashflow.annual.funding_received],
      ['Net Burn', ...projections.cashflow.annual.net_burn],
      ['Cumulative Cash', ...projections.cashflow.annual.cumulative_cash],
      [''],
      ['FUNDING SUMMARY'],
      ['Initial Funding (Y1)', projections.cashflow.initial_funding],
      ['Total Funding Raised', inputs.funding.rounds.reduce((sum, r) => sum + r.amount, 0)],
    ];
    
    const cashflowSheet = XLSX.utils.aoa_to_sheet(cashflowData);
    cashflowSheet['!cols'] = [{ wch: 22 }, ...Array(12).fill({ wch: 12 })];
    XLSX.utils.book_append_sheet(workbook, cashflowSheet, 'Cash Flow');

    // ===== Sheet 7: Unit Economics =====
    const unitEconData = [
      ['UNIT ECONOMICS'],
      [''],
      ['PER-USER METRICS'],
      ['Metric', ...YEARS],
      ['ARPU - Artists (₹)', ...projections.unit_economics.arpu_artists],
      ['ARPU - CDs (₹)', ...projections.unit_economics.arpu_cds],
      ['Gross Margin per User (₹)', ...projections.unit_economics.gross_margin_per_user],
      ['Contribution Margin (₹)', ...projections.unit_economics.contribution_margin],
      [''],
      ['BREAK-EVEN ANALYSIS'],
      ['Break-even Month', projections.unit_economics.break_even_month || 'N/A'],
      ['Break-even Year', projections.unit_economics.break_even_year || 'Beyond Y5'],
      [''],
      ['USER BASE'],
      ['Year', ...YEARS],
      ['Total Artists (EOY)', ...projections.users.annual_artists],
      ['Total CDs (EOY)', ...projections.users.annual_cds],
      ['Total Users', ...projections.users.annual_artists.map((a, i) => a + projections.users.annual_cds[i])],
    ];
    
    const unitEconSheet = XLSX.utils.aoa_to_sheet(unitEconData);
    unitEconSheet['!cols'] = [{ wch: 28 }, ...Array(5).fill({ wch: 12 })];
    XLSX.utils.book_append_sheet(workbook, unitEconSheet, 'Unit Economics');

    // ===== Sheet 8: Key Metrics =====
    const metricsData = [
      ['KEY METRICS (VC-STYLE DASHBOARD)'],
      [''],
      ['GROWTH & EFFICIENCY'],
      ['Metric', 'Value', 'Benchmark', 'Status'],
      ['Revenue CAGR', `${projections.key_metrics.revenue_cagr}%`, '>50%', projections.key_metrics.revenue_cagr > 50 ? 'Good' : projections.key_metrics.revenue_cagr > 20 ? 'Ok' : 'Low'],
      ['Cost CAGR', `${projections.key_metrics.cost_cagr}%`, '<Revenue CAGR', projections.key_metrics.cost_cagr < projections.key_metrics.revenue_cagr ? 'Good' : 'High'],
      [''],
      ['ANNUAL METRICS'],
      ['Metric', ...YEARS, 'Benchmark'],
      ['Gross Margin %', ...projections.key_metrics.gross_margin_pct.map(v => v + '%'), '>60%'],
      ['EBITDA Margin %', ...projections.key_metrics.ebitda_margin_pct.map(v => v + '%'), '>20%'],
      ['Burn Multiple', ...projections.key_metrics.burn_multiple.map(v => v.toFixed(2) + 'x'), '<2x'],
      ['Rule of 40', ...projections.key_metrics.rule_of_40, '>40'],
      ['Capital Efficiency', ...projections.key_metrics.capital_efficiency.map(v => v.toFixed(2) + 'x'), '>1x'],
      [''],
      ['INTERPRETATION'],
      ['Rule of 40 = Growth Rate + Profit Margin'],
      ['Burn Multiple = Net Burn / Net New ARR'],
      ['Capital Efficiency = Revenue / Total Funding'],
    ];
    
    const metricsSheet = XLSX.utils.aoa_to_sheet(metricsData);
    metricsSheet['!cols'] = [{ wch: 20 }, ...Array(6).fill({ wch: 12 })];
    XLSX.utils.book_append_sheet(workbook, metricsSheet, 'Key Metrics');

    // ===== Sheet 9: Scenarios =====
    const scenariosData = [
      ['SCENARIO COMPARISON'],
      [''],
      ['REVENUE BY SCENARIO'],
      ['Year', ...YEARS],
      ['Conservative', ...projections.scenarios.conservative.revenue],
      ['Base', ...projections.scenarios.base.revenue],
      ['Aggressive', ...projections.scenarios.aggressive.revenue],
      [''],
      ['EBITDA BY SCENARIO'],
      ['Year', ...YEARS],
      ['Conservative', ...projections.scenarios.conservative.ebitda],
      ['Base', ...projections.scenarios.base.ebitda],
      ['Aggressive', ...projections.scenarios.aggressive.ebitda],
      [''],
      ['TOTAL COSTS BY SCENARIO'],
      ['Year', ...YEARS],
      ['Conservative', ...projections.scenarios.conservative.costs],
      ['Base', ...projections.scenarios.base.costs],
      ['Aggressive', ...projections.scenarios.aggressive.costs],
      [''],
      ['CUMULATIVE CASH BY SCENARIO'],
      ['Year', ...YEARS],
      ['Conservative', ...projections.scenarios.conservative.cumulative_cash],
      ['Base', ...projections.scenarios.base.cumulative_cash],
      ['Aggressive', ...projections.scenarios.aggressive.cumulative_cash],
      [''],
      ['SCENARIO MULTIPLIERS'],
      ['Scenario', 'Growth', 'Conversion', 'Costs'],
      ['Conservative', '0.7x', '0.8x', '1.2x'],
      ['Base', '1.0x', '1.0x', '1.0x'],
      ['Aggressive', '1.4x', '1.2x', '0.9x'],
    ];
    
    const scenariosSheet = XLSX.utils.aoa_to_sheet(scenariosData);
    scenariosSheet['!cols'] = [{ wch: 15 }, ...Array(5).fill({ wch: 15 })];
    XLSX.utils.book_append_sheet(workbook, scenariosSheet, 'Scenarios');

    // ===== Sheet 10: Team Details =====
    const teamData = [
      ['TEAM BREAKDOWN'],
      [''],
      ['TEAM MEMBERS'],
      ['Name', 'Role', 'Monthly Salary (₹)', 'Start Date', 'Annual Cost (Y1)'],
      ...inputs.team_costs.members.map(m => {
        const startAbsMonth = (m.start_year - 1) * 12 + m.start_month;
        const monthsInY1 = startAbsMonth <= 12 ? Math.max(0, 12 - startAbsMonth + 1) : 0;
        return [m.name, m.role.charAt(0).toUpperCase() + m.role.slice(1), m.monthly_salary, `Y${m.start_year} M${m.start_month}`, m.monthly_salary * monthsInY1];
      }),
      [''],
      ['SUMMARY BY ROLE'],
      ['Role', 'Count', 'Total Monthly', 'Total Annual (Y1)'],
      ...['founder', 'intern', 'employee', 'other'].map(role => {
        const members = inputs.team_costs.members.filter(m => m.role === role);
        const totalMonthly = members.reduce((sum, m) => sum + m.monthly_salary, 0);
        return [role.charAt(0).toUpperCase() + role.slice(1), members.length, totalMonthly, totalMonthly * 12];
      }),
      [''],
      ['ESOP Allocation', `${inputs.team_costs.esop_percentage}%`],
    ];
    
    const teamSheet = XLSX.utils.aoa_to_sheet(teamData);
    teamSheet['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(workbook, teamSheet, 'Team');

    // ===== Sheet 11: Funding Details =====
    const fundingData = [
      ['FUNDING DETAILS'],
      [''],
      ['FUNDING ROUNDS'],
      ['Round Name', 'Amount (₹)', 'Timing', 'Investor', 'Notes'],
      ...inputs.funding.rounds.map(r => [r.name, r.amount, `Year ${r.year} Month ${r.month}`, r.investor || '-', r.notes || '-']),
      [''],
      ['TOTAL FUNDING', inputs.funding.rounds.reduce((sum, r) => sum + r.amount, 0)],
      [''],
      ['FUNDING TIMELINE'],
      ['Year', 'Funding Received', 'Cumulative'],
      ...YEARS.map((y, i) => {
        const yearFunding = inputs.funding.rounds.filter(r => r.year === i + 1).reduce((sum, r) => sum + r.amount, 0);
        const cumulative = inputs.funding.rounds.filter(r => r.year <= i + 1).reduce((sum, r) => sum + r.amount, 0);
        return [y, yearFunding, cumulative];
      }),
    ];
    
    const fundingSheet = XLSX.utils.aoa_to_sheet(fundingData);
    fundingSheet['!cols'] = [{ wch: 18 }, { wch: 15 }, { wch: 18 }, { wch: 20 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(workbook, fundingSheet, 'Funding');

    // Generate and save file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const date = new Date().toISOString().split('T')[0];
    const scenario = inputs.timeline.scenario.charAt(0).toUpperCase() + inputs.timeline.scenario.slice(1);
    saveAs(data, `CastingKart_Financial_Plan_${scenario}_${date}.xlsx`);
  }, []);

  return { exportToExcel };
}
