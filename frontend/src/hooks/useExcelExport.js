import { useCallback } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MONTHS, YEARS, formatCurrency } from '../lib/utils';

export function useExcelExport() {
  const exportToExcel = useCallback((inputs, projections) => {
    if (!projections) return;

    const workbook = XLSX.utils.book_new();

    // Helper to create chart placeholder with data visualization
    const createSparklineData = (data, label) => {
      const max = Math.max(...data.map(Math.abs));
      return data.map(v => {
        const bars = Math.round((Math.abs(v) / max) * 10) || 0;
        const bar = v >= 0 ? '█' : '░';
        return bar.repeat(bars);
      });
    };

    // ===== Sheet 1: Dashboard with Visual Charts =====
    const dashboardData = [
      ['═══════════════════════════════════════════════════════════════════════════════'],
      ['                    CASTINGKART FINANCIAL MASTER PLANNER                       '],
      ['                         EXECUTIVE DASHBOARD                                   '],
      ['═══════════════════════════════════════════════════════════════════════════════'],
      [''],
      ['SCENARIO:', inputs.timeline.scenario.toUpperCase(), '', 'Generated:', new Date().toLocaleDateString()],
      [''],
      ['─────────────────────────────────────────────────────────────────────────────────'],
      ['                              5-YEAR FINANCIAL OVERVIEW                         '],
      ['─────────────────────────────────────────────────────────────────────────────────'],
      [''],
      ['METRIC', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'VISUAL TREND'],
      ['Revenue', ...projections.revenue.annual.total, createSparklineData(projections.revenue.annual.total, 'rev').join('')],
      ['Total Costs', ...projections.costs.annual.total, createSparklineData(projections.costs.annual.total, 'cost').join('')],
      ['EBITDA', ...projections.pnl.annual.ebitda, createSparklineData(projections.pnl.annual.ebitda, 'ebitda').join('')],
      ['Net Profit', ...projections.pnl.annual.net_profit, createSparklineData(projections.pnl.annual.net_profit, 'net').join('')],
      ['Cash Position', ...projections.cashflow.annual.cumulative_cash, createSparklineData(projections.cashflow.annual.cumulative_cash, 'cash').join('')],
      [''],
      ['─────────────────────────────────────────────────────────────────────────────────'],
      ['                              KEY PERFORMANCE INDICATORS                        '],
      ['─────────────────────────────────────────────────────────────────────────────────'],
      [''],
      ['Revenue CAGR', `${projections.key_metrics.revenue_cagr}%`, '', 'Cost CAGR', `${projections.key_metrics.cost_cagr}%`],
      ['Break-even', projections.unit_economics.break_even_month > 0 ? `Month ${projections.unit_economics.break_even_month}` : 'Beyond Y5'],
      [''],
      ['MARGINS BY YEAR', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5'],
      ['Gross Margin %', ...projections.key_metrics.gross_margin_pct.map(v => `${v}%`)],
      ['EBITDA Margin %', ...projections.key_metrics.ebitda_margin_pct.map(v => `${v}%`)],
      ['Rule of 40', ...projections.key_metrics.rule_of_40.map(v => v.toFixed(1))],
      ['Burn Multiple', ...projections.key_metrics.burn_multiple.map(v => `${v.toFixed(2)}x`)],
      [''],
      ['─────────────────────────────────────────────────────────────────────────────────'],
      ['                              FUNDING OVERVIEW                                  '],
      ['─────────────────────────────────────────────────────────────────────────────────'],
      [''],
      ['Round', 'Amount', 'Timing', 'Investor'],
      ...inputs.funding.rounds.map(r => [r.name, r.amount, `Y${r.year} M${r.month}`, r.investor || '-']),
      ['', '', '', ''],
      ['TOTAL FUNDING', inputs.funding.rounds.reduce((sum, r) => sum + r.amount, 0)],
    ];
    
    const dashboardSheet = XLSX.utils.aoa_to_sheet(dashboardData);
    dashboardSheet['!cols'] = [{ wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, dashboardSheet, 'Dashboard');

    // ===== Sheet 2: Revenue Charts & Data =====
    const revenueChartData = [
      ['═══════════════════════════════════════════════════════════════════════════════'],
      ['                              REVENUE ANALYSIS                                  '],
      ['═══════════════════════════════════════════════════════════════════════════════'],
      [''],
      ['ANNUAL REVENUE CHART (Visual Representation)'],
      ['─────────────────────────────────────────────────────────────────────────────────'],
      [''],
    ];
    
    // Add visual bar chart for annual revenue
    const maxRevenue = Math.max(...projections.revenue.annual.total);
    YEARS.forEach((year, idx) => {
      const value = projections.revenue.annual.total[idx];
      const barLength = Math.round((value / maxRevenue) * 40) || 0;
      const bar = '█'.repeat(barLength);
      revenueChartData.push([year, bar, formatCurrency(value, true)]);
    });
    
    revenueChartData.push(['']);
    revenueChartData.push(['REVENUE BREAKDOWN BY STREAM']);
    revenueChartData.push(['─────────────────────────────────────────────────────────────────────────────────']);
    revenueChartData.push(['']);
    revenueChartData.push(['Stream', ...YEARS, 'Total']);
    
    const streams = [
      { name: 'Artist Premium', data: projections.revenue.annual.artist_premium },
      { name: 'CD Premium', data: projections.revenue.annual.cd_premium },
      { name: 'Boosts', data: projections.revenue.annual.boosts },
      { name: 'Escrow', data: projections.revenue.annual.escrow },
      { name: 'Other Income', data: projections.revenue.annual.other_income },
    ];
    
    streams.forEach(stream => {
      const total = stream.data.reduce((a, b) => a + b, 0);
      revenueChartData.push([stream.name, ...stream.data, total]);
    });
    
    revenueChartData.push(['TOTAL', ...projections.revenue.annual.total, projections.revenue.annual.total.reduce((a, b) => a + b, 0)]);
    
    revenueChartData.push(['']);
    revenueChartData.push(['MONTHLY REVENUE - YEAR 1']);
    revenueChartData.push(['─────────────────────────────────────────────────────────────────────────────────']);
    revenueChartData.push(['Month', ...MONTHS]);
    revenueChartData.push(['Total', ...projections.revenue.monthly.total]);
    
    // Monthly bar chart
    revenueChartData.push(['']);
    revenueChartData.push(['MONTHLY REVENUE CHART (Y1)']);
    const maxMonthlyRev = Math.max(...projections.revenue.monthly.total);
    MONTHS.forEach((month, idx) => {
      const value = projections.revenue.monthly.total[idx];
      const barLength = Math.round((value / (maxMonthlyRev || 1)) * 30) || 0;
      const bar = '▓'.repeat(barLength);
      revenueChartData.push([month, bar, formatCurrency(value, true)]);
    });
    
    const revenueSheet = XLSX.utils.aoa_to_sheet(revenueChartData);
    revenueSheet['!cols'] = [{ wch: 15 }, { wch: 45 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Revenue Charts');

    // ===== Sheet 3: Cost Charts & Data =====
    const costChartData = [
      ['═══════════════════════════════════════════════════════════════════════════════'],
      ['                              COST ANALYSIS                                     '],
      ['═══════════════════════════════════════════════════════════════════════════════'],
      [''],
      ['ANNUAL COST CHART (Visual Representation)'],
      ['─────────────────────────────────────────────────────────────────────────────────'],
      [''],
    ];
    
    // Add visual bar chart for annual costs
    const maxCost = Math.max(...projections.costs.annual.total);
    YEARS.forEach((year, idx) => {
      const value = projections.costs.annual.total[idx];
      const barLength = Math.round((value / maxCost) * 40) || 0;
      const bar = '█'.repeat(barLength);
      costChartData.push([year, bar, formatCurrency(value, true)]);
    });
    
    costChartData.push(['']);
    costChartData.push(['COST COMPOSITION - YEAR 1 (PIE CHART REPRESENTATION)']);
    costChartData.push(['─────────────────────────────────────────────────────────────────────────────────']);
    costChartData.push(['']);
    
    const totalY1Cost = projections.costs.annual.total[0] || 1;
    const costCategories = [
      { name: 'Team', value: projections.costs.annual.team[0] },
      { name: 'Digital Infrastructure', value: projections.costs.annual.digital_infra[0] },
      { name: 'Physical Infrastructure', value: projections.costs.annual.physical_infra[0] },
      { name: 'Hardware', value: projections.costs.annual.hardware[0] },
      { name: 'Marketing', value: projections.costs.annual.marketing[0] },
      { name: 'Travel', value: projections.costs.annual.travel[0] },
      { name: 'Admin', value: projections.costs.annual.admin[0] },
      { name: 'Other', value: projections.costs.annual.other[0] },
    ].filter(c => c.value > 0);
    
    costChartData.push(['Category', 'Visual', 'Amount', '% Share']);
    costCategories.forEach(cat => {
      const pct = Math.round((cat.value / totalY1Cost) * 100);
      const barLength = Math.round(pct / 2.5);
      const bar = '●'.repeat(barLength);
      costChartData.push([cat.name, bar, cat.value, `${pct}%`]);
    });
    
    costChartData.push(['']);
    costChartData.push(['COST BREAKDOWN BY CATEGORY']);
    costChartData.push(['─────────────────────────────────────────────────────────────────────────────────']);
    costChartData.push(['Category', ...YEARS]);
    costChartData.push(['Team', ...projections.costs.annual.team]);
    costChartData.push(['Digital Infra', ...projections.costs.annual.digital_infra]);
    costChartData.push(['Physical Infra', ...projections.costs.annual.physical_infra]);
    costChartData.push(['Hardware', ...projections.costs.annual.hardware]);
    costChartData.push(['Marketing', ...projections.costs.annual.marketing]);
    costChartData.push(['Travel', ...projections.costs.annual.travel]);
    costChartData.push(['Admin', ...projections.costs.annual.admin]);
    costChartData.push(['Other', ...projections.costs.annual.other]);
    costChartData.push(['TOTAL', ...projections.costs.annual.total]);
    
    const costSheet = XLSX.utils.aoa_to_sheet(costChartData);
    costSheet['!cols'] = [{ wch: 22 }, { wch: 45 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(workbook, costSheet, 'Cost Charts');

    // ===== Sheet 4: P&L with Charts =====
    const pnlChartData = [
      ['═══════════════════════════════════════════════════════════════════════════════'],
      ['                          PROFIT & LOSS ANALYSIS                               '],
      ['═══════════════════════════════════════════════════════════════════════════════'],
      [''],
      ['EBITDA TREND CHART'],
      ['─────────────────────────────────────────────────────────────────────────────────'],
      [''],
    ];
    
    // EBITDA visual chart
    const maxEbitda = Math.max(...projections.pnl.annual.ebitda.map(Math.abs));
    YEARS.forEach((year, idx) => {
      const value = projections.pnl.annual.ebitda[idx];
      const barLength = Math.round((Math.abs(value) / (maxEbitda || 1)) * 35);
      const bar = value >= 0 ? '█'.repeat(barLength) : '░'.repeat(barLength);
      const prefix = value >= 0 ? '+' : '-';
      pnlChartData.push([year, value >= 0 ? bar : `${bar} (LOSS)`, `${prefix}${formatCurrency(Math.abs(value), true)}`]);
    });
    
    pnlChartData.push(['']);
    pnlChartData.push(['PROFITABILITY JOURNEY']);
    pnlChartData.push(['─────────────────────────────────────────────────────────────────────────────────']);
    pnlChartData.push(['']);
    
    // Find when profitability is achieved
    const profitableYear = projections.pnl.annual.net_profit.findIndex(np => np > 0);
    if (profitableYear >= 0) {
      pnlChartData.push([`✓ Profitability achieved in Year ${profitableYear + 1}`]);
    } else {
      pnlChartData.push(['○ Profitability beyond 5-year projection']);
    }
    
    pnlChartData.push(['']);
    pnlChartData.push(['ANNUAL P&L STATEMENT']);
    pnlChartData.push(['─────────────────────────────────────────────────────────────────────────────────']);
    pnlChartData.push(['Line Item', ...YEARS]);
    pnlChartData.push(['Revenue', ...projections.pnl.annual.revenue]);
    pnlChartData.push(['Gross Profit (85%)', ...projections.pnl.annual.gross_profit]);
    pnlChartData.push(['Operating Expenses', ...projections.pnl.annual.operating_expenses]);
    pnlChartData.push(['─────────────', '', '', '', '', '']);
    pnlChartData.push(['EBITDA', ...projections.pnl.annual.ebitda]);
    pnlChartData.push(['Depreciation', ...projections.pnl.annual.depreciation]);
    pnlChartData.push(['EBIT', ...projections.pnl.annual.ebit]);
    pnlChartData.push(['Taxes', ...projections.pnl.annual.taxes]);
    pnlChartData.push(['─────────────', '', '', '', '', '']);
    pnlChartData.push(['NET PROFIT/LOSS', ...projections.pnl.annual.net_profit]);
    
    pnlChartData.push(['']);
    pnlChartData.push(['MARGIN ANALYSIS']);
    pnlChartData.push(['Metric', ...YEARS]);
    pnlChartData.push(['Gross Margin %', ...projections.key_metrics.gross_margin_pct.map(v => `${v}%`)]);
    pnlChartData.push(['EBITDA Margin %', ...projections.key_metrics.ebitda_margin_pct.map(v => `${v}%`)]);
    
    const pnlSheet = XLSX.utils.aoa_to_sheet(pnlChartData);
    pnlSheet['!cols'] = [{ wch: 22 }, { wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, pnlSheet, 'P&L Charts');

    // ===== Sheet 5: Cash Flow with Charts =====
    const cashChartData = [
      ['═══════════════════════════════════════════════════════════════════════════════'],
      ['                          CASH FLOW & RUNWAY                                   '],
      ['═══════════════════════════════════════════════════════════════════════════════'],
      [''],
      ['CASH POSITION TREND'],
      ['─────────────────────────────────────────────────────────────────────────────────'],
      [''],
    ];
    
    // Cash position visual chart
    const maxCash = Math.max(...projections.cashflow.annual.cumulative_cash.map(Math.abs));
    YEARS.forEach((year, idx) => {
      const value = projections.cashflow.annual.cumulative_cash[idx];
      const barLength = Math.round((Math.abs(value) / (maxCash || 1)) * 35);
      const bar = value >= 0 ? '█'.repeat(barLength) : '░'.repeat(barLength);
      const status = value >= 0 ? '✓' : '⚠';
      cashChartData.push([year, bar, formatCurrency(value, true), status]);
    });
    
    cashChartData.push(['']);
    cashChartData.push(['RUNWAY ANALYSIS (Monthly - Year 1)']);
    cashChartData.push(['─────────────────────────────────────────────────────────────────────────────────']);
    cashChartData.push(['']);
    cashChartData.push(['Month', 'Cash Position', 'Runway (Months)', 'Status']);
    
    MONTHS.forEach((month, idx) => {
      const cash = projections.cashflow.monthly.cumulative_cash[idx];
      const runway = projections.cashflow.monthly.runway_months[idx];
      const status = runway > 12 ? '✓ Safe' : runway > 6 ? '○ Monitor' : '⚠ Critical';
      cashChartData.push([month, formatCurrency(cash, true), runway > 100 ? '100+' : runway, status]);
    });
    
    cashChartData.push(['']);
    cashChartData.push(['FUNDING TIMELINE']);
    cashChartData.push(['─────────────────────────────────────────────────────────────────────────────────']);
    cashChartData.push(['Year', 'Funding Received', 'Cumulative Cash']);
    YEARS.forEach((year, idx) => {
      cashChartData.push([year, projections.cashflow.annual.funding_received[idx], projections.cashflow.annual.cumulative_cash[idx]]);
    });
    
    const cashSheet = XLSX.utils.aoa_to_sheet(cashChartData);
    cashSheet['!cols'] = [{ wch: 12 }, { wch: 40 }, { wch: 18 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, cashSheet, 'Cash Flow Charts');

    // ===== Sheet 6: Scenario Comparison Charts =====
    const scenarioChartData = [
      ['═══════════════════════════════════════════════════════════════════════════════'],
      ['                          SCENARIO COMPARISON                                  '],
      ['═══════════════════════════════════════════════════════════════════════════════'],
      [''],
      ['REVENUE BY SCENARIO'],
      ['─────────────────────────────────────────────────────────────────────────────────'],
      [''],
      ['Year', 'Conservative', 'Base', 'Aggressive', 'Visual Comparison'],
    ];
    
    const maxScenarioRev = Math.max(
      ...projections.scenarios.conservative.revenue,
      ...projections.scenarios.base.revenue,
      ...projections.scenarios.aggressive.revenue
    );
    
    YEARS.forEach((year, idx) => {
      const cons = projections.scenarios.conservative.revenue[idx];
      const base = projections.scenarios.base.revenue[idx];
      const aggr = projections.scenarios.aggressive.revenue[idx];
      
      const consBar = '░'.repeat(Math.round((cons / maxScenarioRev) * 15));
      const baseBar = '▒'.repeat(Math.round((base / maxScenarioRev) * 15));
      const aggrBar = '█'.repeat(Math.round((aggr / maxScenarioRev) * 15));
      
      scenarioChartData.push([year, cons, base, aggr, `${consBar}|${baseBar}|${aggrBar}`]);
    });
    
    scenarioChartData.push(['']);
    scenarioChartData.push(['Legend: ░ Conservative | ▒ Base | █ Aggressive']);
    scenarioChartData.push(['']);
    scenarioChartData.push(['EBITDA BY SCENARIO']);
    scenarioChartData.push(['─────────────────────────────────────────────────────────────────────────────────']);
    scenarioChartData.push(['Year', 'Conservative', 'Base', 'Aggressive']);
    YEARS.forEach((year, idx) => {
      scenarioChartData.push([
        year,
        projections.scenarios.conservative.ebitda[idx],
        projections.scenarios.base.ebitda[idx],
        projections.scenarios.aggressive.ebitda[idx]
      ]);
    });
    
    scenarioChartData.push(['']);
    scenarioChartData.push(['CUMULATIVE CASH BY SCENARIO']);
    scenarioChartData.push(['─────────────────────────────────────────────────────────────────────────────────']);
    scenarioChartData.push(['Year', 'Conservative', 'Base', 'Aggressive']);
    YEARS.forEach((year, idx) => {
      scenarioChartData.push([
        year,
        projections.scenarios.conservative.cumulative_cash[idx],
        projections.scenarios.base.cumulative_cash[idx],
        projections.scenarios.aggressive.cumulative_cash[idx]
      ]);
    });
    
    scenarioChartData.push(['']);
    scenarioChartData.push(['SCENARIO MULTIPLIERS']);
    scenarioChartData.push(['Scenario', 'Growth', 'Conversion', 'Costs']);
    scenarioChartData.push(['Conservative', '0.7x', '0.8x', '1.2x']);
    scenarioChartData.push(['Base', '1.0x', '1.0x', '1.0x']);
    scenarioChartData.push(['Aggressive', '1.4x', '1.2x', '0.9x']);
    
    const scenarioSheet = XLSX.utils.aoa_to_sheet(scenarioChartData);
    scenarioSheet['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(workbook, scenarioSheet, 'Scenario Charts');

    // ===== Sheet 7: All Inputs (Detailed) =====
    const inputsData = [
      ['═══════════════════════════════════════════════════════════════════════════════'],
      ['                          MASTER INPUTS & ASSUMPTIONS                          '],
      ['═══════════════════════════════════════════════════════════════════════════════'],
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
      ['MONETIZATION'],
      ['Artist Premium Price', inputs.artist_monetization.premium_price],
      ['Artist Conversion %', inputs.artist_monetization.conversion_rate],
      ['Artist Churn %', inputs.artist_monetization.churn_rate],
      ['CD Premium Price', inputs.cd_monetization.premium_price],
      ['CD Conversion %', inputs.cd_monetization.conversion_rate],
      ['CD Churn %', inputs.cd_monetization.churn_rate],
      [''],
      ['TEAM MEMBERS'],
      ['Name', 'Role', 'Monthly Salary', 'Start'],
      ...inputs.team_costs.members.map(m => [m.name, m.role, m.monthly_salary, `Y${m.start_year} M${m.start_month}`]),
      ['ESOP %', inputs.team_costs.esop_percentage],
      [''],
      ['PHYSICAL INFRASTRUCTURE'],
      ['Office Rent', inputs.physical_infra.office_rent],
      ['Electricity', inputs.physical_infra.electricity],
      ['Internet', inputs.physical_infra.internet],
      ['Maintenance', inputs.physical_infra.maintenance],
      ['Office Starts', `Y${inputs.physical_infra.office_start_year} M${inputs.physical_infra.office_start_month}`],
      [''],
      ['DIGITAL INFRASTRUCTURE'],
      ['Hosting', inputs.digital_infra.hosting],
      ['Storage', inputs.digital_infra.storage],
      ['SaaS Tools', inputs.digital_infra.saas_tools],
      ['AI Compute (when enabled)', inputs.digital_infra.ai_compute_enabled],
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
      ['Item', 'Monthly', 'Type', 'Start'],
      ...inputs.travel_costs.items.map(t => [t.name, t.estimated_monthly, t.is_recurring ? 'Monthly' : 'One-time', `Y${t.start_year} M${t.start_month}`]),
      [''],
      ['OTHER EXPENSES'],
      ['Item', 'Amount', 'Type', 'Start'],
      ...inputs.other_expenses.items.map(e => [e.name, e.amount, e.is_recurring ? 'Monthly' : 'One-time', `Y${e.start_year} M${e.start_month}`]),
      [''],
      ['OTHER INCOME'],
      ['Source', 'Amount', 'Type', 'Start'],
      ...inputs.other_income.items.map(i => [i.name, i.amount, i.is_recurring ? 'Monthly' : 'One-time', `Y${i.start_year} M${i.start_month}`]),
      [''],
      ['FUNDING ROUNDS'],
      ['Round', 'Amount', 'Timing', 'Investor'],
      ...inputs.funding.rounds.map(r => [r.name, r.amount, `Y${r.year} M${r.month}`, r.investor || '-']),
      [''],
      ['TAX & COMPLIANCE'],
      ['Corporate Tax %', inputs.tax_inputs.corporate_tax_rate],
      ['GST %', inputs.tax_inputs.gst_rate],
      ['TDS %', inputs.tax_inputs.tds_rate],
      ['Depreciation %', inputs.tax_inputs.depreciation_rate],
    ];
    
    const inputsSheet = XLSX.utils.aoa_to_sheet(inputsData);
    inputsSheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, inputsSheet, 'All Inputs');

    // ===== Sheet 8: Unit Economics =====
    const unitEconData = [
      ['═══════════════════════════════════════════════════════════════════════════════'],
      ['                          UNIT ECONOMICS                                       '],
      ['═══════════════════════════════════════════════════════════════════════════════'],
      [''],
      ['PER-USER METRICS'],
      ['Metric', ...YEARS],
      ['ARPU - Artists (₹)', ...projections.unit_economics.arpu_artists],
      ['ARPU - CDs (₹)', ...projections.unit_economics.arpu_cds],
      ['Gross Margin/User (₹)', ...projections.unit_economics.gross_margin_per_user],
      ['Contribution Margin (₹)', ...projections.unit_economics.contribution_margin],
      [''],
      ['BREAK-EVEN'],
      ['Break-even Month', projections.unit_economics.break_even_month || 'N/A'],
      ['Break-even Year', projections.unit_economics.break_even_year || 'Beyond Y5'],
      [''],
      ['USER BASE'],
      ['Year', ...YEARS],
      ['Artists (EOY)', ...projections.users.annual_artists],
      ['CDs (EOY)', ...projections.users.annual_cds],
      ['Total Users', ...projections.users.annual_artists.map((a, i) => a + projections.users.annual_cds[i])],
    ];
    
    const unitEconSheet = XLSX.utils.aoa_to_sheet(unitEconData);
    unitEconSheet['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(workbook, unitEconSheet, 'Unit Economics');

    // ===== Sheet 9: Key Metrics =====
    const metricsData = [
      ['═══════════════════════════════════════════════════════════════════════════════'],
      ['                          KEY METRICS (VC DASHBOARD)                           '],
      ['═══════════════════════════════════════════════════════════════════════════════'],
      [''],
      ['GROWTH METRICS'],
      ['Revenue CAGR', `${projections.key_metrics.revenue_cagr}%`, '', 'Benchmark: >50%'],
      ['Cost CAGR', `${projections.key_metrics.cost_cagr}%`, '', 'Benchmark: <Revenue CAGR'],
      [''],
      ['ANNUAL METRICS'],
      ['Metric', ...YEARS, 'Benchmark'],
      ['Gross Margin %', ...projections.key_metrics.gross_margin_pct.map(v => `${v}%`), '>60%'],
      ['EBITDA Margin %', ...projections.key_metrics.ebitda_margin_pct.map(v => `${v}%`), '>20%'],
      ['Burn Multiple', ...projections.key_metrics.burn_multiple.map(v => `${v.toFixed(2)}x`), '<2x'],
      ['Rule of 40', ...projections.key_metrics.rule_of_40.map(v => v.toFixed(1)), '>40'],
      ['Capital Efficiency', ...projections.key_metrics.capital_efficiency.map(v => `${v.toFixed(2)}x`), '>1x'],
    ];
    
    const metricsSheet = XLSX.utils.aoa_to_sheet(metricsData);
    metricsSheet['!cols'] = [{ wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, metricsSheet, 'Key Metrics');

    // ===== Sheet 10: Raw Data (for manual charting) =====
    const rawData = [
      ['RAW DATA FOR CUSTOM CHARTS'],
      [''],
      ['MONTHLY DATA - YEAR 1'],
      ['Month', 'Revenue', 'Costs', 'EBITDA', 'Cash Position'],
      ...MONTHS.map((m, i) => [
        m,
        projections.revenue.monthly.total[i],
        projections.costs.monthly.total[i],
        projections.pnl.monthly.ebitda[i],
        projections.cashflow.monthly.cumulative_cash[i]
      ]),
      [''],
      ['ANNUAL DATA'],
      ['Year', 'Revenue', 'Costs', 'EBITDA', 'Net Profit', 'Cash Position'],
      ...YEARS.map((y, i) => [
        y,
        projections.revenue.annual.total[i],
        projections.costs.annual.total[i],
        projections.pnl.annual.ebitda[i],
        projections.pnl.annual.net_profit[i],
        projections.cashflow.annual.cumulative_cash[i]
      ]),
    ];
    
    const rawDataSheet = XLSX.utils.aoa_to_sheet(rawData);
    rawDataSheet['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, rawDataSheet, 'Raw Data');

    // Generate and save file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const date = new Date().toISOString().split('T')[0];
    const scenario = inputs.timeline.scenario.charAt(0).toUpperCase() + inputs.timeline.scenario.slice(1);
    saveAs(data, `CastingKart_Financial_Plan_${scenario}_${date}.xlsx`);
  }, []);

  return { exportToExcel };
}
