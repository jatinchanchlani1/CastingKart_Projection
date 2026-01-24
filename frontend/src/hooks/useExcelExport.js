import { useCallback } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MONTHS, YEARS, formatCurrency } from '../lib/utils';

export function useExcelExport() {
  const exportToExcel = useCallback((inputs, projections) => {
    if (!projections) return;

    const workbook = XLSX.utils.book_new();

    // ===== Sheet 1: Inputs =====
    const inputsData = [
      ['CastingKart Financial Master Planner - Inputs'],
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
      ['TEAM COSTS'],
      ['Founder Stipend (₹/month)', inputs.team_costs.founder_stipend],
      ['Founder Count', inputs.team_costs.founder_count],
      ['Interns Count', inputs.team_costs.interns_count],
      ['Intern Salary (₹/month)', inputs.team_costs.intern_salary],
      ['Full-time Start Year', inputs.team_costs.fulltime_start_year],
      ['Full-time Salary (₹/month)', inputs.team_costs.fulltime_salary],
      ['ESOP Percentage (%)', inputs.team_costs.esop_percentage],
      [''],
      ['INFRASTRUCTURE'],
      ['Hosting (₹/month)', inputs.infra_costs.hosting],
      ['Storage (₹/month)', inputs.infra_costs.storage],
      ['AI Compute (₹/month)', inputs.infra_costs.ai_compute_enabled],
      ['SaaS Tools (₹/month)', inputs.infra_costs.saas_tools],
      [''],
      ['MARKETING'],
      ['Organic (₹/month)', inputs.marketing_costs.organic],
      ['Paid (₹/month)', inputs.marketing_costs.paid],
      ['Influencer (₹/month)', inputs.marketing_costs.influencer],
      [''],
      ['TAX & COMPLIANCE'],
      ['Corporate Tax Rate (%)', inputs.tax_inputs.corporate_tax_rate],
      ['GST Rate (%)', inputs.tax_inputs.gst_rate],
      ['Depreciation Rate (%)', inputs.tax_inputs.depreciation_rate],
      [''],
      ['FUNDING'],
      ['Seed Funding (₹)', inputs.funding.seed_funding],
      ['Series A Year', inputs.funding.series_a_year],
      ['Series A Amount (₹)', inputs.funding.series_a_amount],
    ];
    
    const inputsSheet = XLSX.utils.aoa_to_sheet(inputsData);
    inputsSheet['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, inputsSheet, 'Inputs');

    // ===== Sheet 2: Revenue =====
    const revenueMonthlyData = [
      ['REVENUE BREAKDOWN - Monthly (Year 1)'],
      [''],
      ['Month', ...MONTHS],
      ['Artist Premium', ...projections.revenue.monthly.artist_premium],
      ['CD Premium', ...projections.revenue.monthly.cd_premium],
      ['Boosts', ...projections.revenue.monthly.boosts],
      ['Escrow', ...projections.revenue.monthly.escrow],
      ['Total Revenue', ...projections.revenue.monthly.total],
      [''],
      ['REVENUE BREAKDOWN - Annual'],
      [''],
      ['Year', ...YEARS],
      ['Artist Premium', ...projections.revenue.annual.artist_premium],
      ['CD Premium', ...projections.revenue.annual.cd_premium],
      ['Boosts', ...projections.revenue.annual.boosts],
      ['Escrow', ...projections.revenue.annual.escrow],
      ['Total Revenue', ...projections.revenue.annual.total],
    ];
    
    const revenueSheet = XLSX.utils.aoa_to_sheet(revenueMonthlyData);
    revenueSheet['!cols'] = [{ wch: 15 }, ...Array(12).fill({ wch: 12 })];
    XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Revenue');

    // ===== Sheet 3: Costs =====
    const costsData = [
      ['COST BREAKDOWN - Monthly (Year 1)'],
      [''],
      ['Month', ...MONTHS],
      ['Team', ...projections.costs.monthly.team],
      ['Infrastructure', ...projections.costs.monthly.infrastructure],
      ['Marketing', ...projections.costs.monthly.marketing],
      ['Admin', ...projections.costs.monthly.admin],
      ['Total Costs', ...projections.costs.monthly.total],
      [''],
      ['COST BREAKDOWN - Annual'],
      [''],
      ['Year', ...YEARS],
      ['Team', ...projections.costs.annual.team],
      ['Infrastructure', ...projections.costs.annual.infrastructure],
      ['Marketing', ...projections.costs.annual.marketing],
      ['Admin', ...projections.costs.annual.admin],
      ['Total Costs', ...projections.costs.annual.total],
    ];
    
    const costsSheet = XLSX.utils.aoa_to_sheet(costsData);
    costsSheet['!cols'] = [{ wch: 15 }, ...Array(12).fill({ wch: 12 })];
    XLSX.utils.book_append_sheet(workbook, costsSheet, 'Costs');

    // ===== Sheet 4: P&L =====
    const pnlData = [
      ['PROFIT & LOSS - Monthly (Year 1)'],
      [''],
      ['Month', ...MONTHS],
      ['Revenue', ...projections.pnl.monthly.revenue],
      ['Gross Profit', ...projections.pnl.monthly.gross_profit],
      ['Operating Expenses', ...projections.pnl.monthly.operating_expenses],
      ['EBITDA', ...projections.pnl.monthly.ebitda],
      ['Depreciation', ...projections.pnl.monthly.depreciation],
      ['EBIT', ...projections.pnl.monthly.ebit],
      ['Taxes', ...projections.pnl.monthly.taxes],
      ['Net Profit/Loss', ...projections.pnl.monthly.net_profit],
      [''],
      ['PROFIT & LOSS - Annual'],
      [''],
      ['Year', ...YEARS],
      ['Revenue', ...projections.pnl.annual.revenue],
      ['Gross Profit', ...projections.pnl.annual.gross_profit],
      ['Operating Expenses', ...projections.pnl.annual.operating_expenses],
      ['EBITDA', ...projections.pnl.annual.ebitda],
      ['Depreciation', ...projections.pnl.annual.depreciation],
      ['EBIT', ...projections.pnl.annual.ebit],
      ['Taxes', ...projections.pnl.annual.taxes],
      ['Net Profit/Loss', ...projections.pnl.annual.net_profit],
    ];
    
    const pnlSheet = XLSX.utils.aoa_to_sheet(pnlData);
    pnlSheet['!cols'] = [{ wch: 20 }, ...Array(12).fill({ wch: 12 })];
    XLSX.utils.book_append_sheet(workbook, pnlSheet, 'P&L');

    // ===== Sheet 5: Cash Flow =====
    const cashflowData = [
      ['CASH FLOW - Monthly (Year 1)'],
      [''],
      ['Month', ...MONTHS],
      ['Operating Cash Flow', ...projections.cashflow.monthly.operating_cash_flow],
      ['Net Burn', ...projections.cashflow.monthly.net_burn],
      ['Cumulative Cash', ...projections.cashflow.monthly.cumulative_cash],
      ['Runway (Months)', ...projections.cashflow.monthly.runway_months],
      [''],
      ['CASH FLOW - Annual'],
      [''],
      ['Year', ...YEARS],
      ['Operating Cash Flow', ...projections.cashflow.annual.operating_cash_flow],
      ['Net Burn', ...projections.cashflow.annual.net_burn],
      ['Cumulative Cash', ...projections.cashflow.annual.cumulative_cash],
      ['Funding Received', ...projections.cashflow.annual.funding_received],
    ];
    
    const cashflowSheet = XLSX.utils.aoa_to_sheet(cashflowData);
    cashflowSheet['!cols'] = [{ wch: 20 }, ...Array(12).fill({ wch: 12 })];
    XLSX.utils.book_append_sheet(workbook, cashflowSheet, 'Cash Flow');

    // ===== Sheet 6: Unit Economics =====
    const unitEconData = [
      ['UNIT ECONOMICS'],
      [''],
      ['Metric', ...YEARS],
      ['ARPU - Artists (₹)', ...projections.unit_economics.arpu_artists],
      ['ARPU - CDs (₹)', ...projections.unit_economics.arpu_cds],
      ['Gross Margin per User (₹)', ...projections.unit_economics.gross_margin_per_user],
      ['Contribution Margin (₹)', ...projections.unit_economics.contribution_margin],
      [''],
      ['Break-even Month', projections.unit_economics.break_even_month],
      ['Break-even Year', projections.unit_economics.break_even_year],
    ];
    
    const unitEconSheet = XLSX.utils.aoa_to_sheet(unitEconData);
    unitEconSheet['!cols'] = [{ wch: 25 }, ...Array(5).fill({ wch: 12 })];
    XLSX.utils.book_append_sheet(workbook, unitEconSheet, 'Unit Economics');

    // ===== Sheet 7: Key Metrics =====
    const metricsData = [
      ['KEY METRICS (VC-STYLE)'],
      [''],
      ['Metric', ...YEARS],
      ['Gross Margin (%)', ...projections.key_metrics.gross_margin_pct],
      ['EBITDA Margin (%)', ...projections.key_metrics.ebitda_margin_pct],
      ['Burn Multiple', ...projections.key_metrics.burn_multiple],
      ['Rule of 40', ...projections.key_metrics.rule_of_40],
      ['Capital Efficiency', ...projections.key_metrics.capital_efficiency],
      [''],
      ['Revenue CAGR (%)', projections.key_metrics.revenue_cagr],
      ['Cost CAGR (%)', projections.key_metrics.cost_cagr],
    ];
    
    const metricsSheet = XLSX.utils.aoa_to_sheet(metricsData);
    metricsSheet['!cols'] = [{ wch: 20 }, ...Array(5).fill({ wch: 12 })];
    XLSX.utils.book_append_sheet(workbook, metricsSheet, 'Key Metrics');

    // ===== Sheet 8: Scenarios =====
    const scenariosData = [
      ['SCENARIO COMPARISON'],
      [''],
      ['REVENUE'],
      ['Year', ...YEARS],
      ['Conservative', ...projections.scenarios.conservative.revenue],
      ['Base', ...projections.scenarios.base.revenue],
      ['Aggressive', ...projections.scenarios.aggressive.revenue],
      [''],
      ['EBITDA'],
      ['Year', ...YEARS],
      ['Conservative', ...projections.scenarios.conservative.ebitda],
      ['Base', ...projections.scenarios.base.ebitda],
      ['Aggressive', ...projections.scenarios.aggressive.ebitda],
      [''],
      ['CUMULATIVE CASH'],
      ['Year', ...YEARS],
      ['Conservative', ...projections.scenarios.conservative.cumulative_cash],
      ['Base', ...projections.scenarios.base.cumulative_cash],
      ['Aggressive', ...projections.scenarios.aggressive.cumulative_cash],
    ];
    
    const scenariosSheet = XLSX.utils.aoa_to_sheet(scenariosData);
    scenariosSheet['!cols'] = [{ wch: 15 }, ...Array(5).fill({ wch: 15 })];
    XLSX.utils.book_append_sheet(workbook, scenariosSheet, 'Scenarios');

    // Generate and save file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const date = new Date().toISOString().split('T')[0];
    saveAs(data, `CastingKart_Financial_Plan_${date}.xlsx`);
  }, []);

  return { exportToExcel };
}
