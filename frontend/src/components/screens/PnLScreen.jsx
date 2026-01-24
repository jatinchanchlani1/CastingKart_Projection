import React from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, LineChart, Line, ComposedChart, ReferenceLine
} from 'recharts';
import { FileText, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency, MONTHS, YEARS, CHART_COLORS } from '../../lib/utils';

function KPICard({ label, value, trend, trendLabel, positive, negative }) {
  const isNegative = negative || (typeof value === 'number' && value < 0);
  return (
    <Card className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className={`kpi-value ${isNegative ? 'text-rose-500' : ''}`}>
        {typeof value === 'number' ? formatCurrency(value, true) : value}
      </div>
      {trend !== undefined && (
        <div className={`kpi-trend ${positive ? 'positive' : 'negative'}`}>
          {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}% {trendLabel}
        </div>
      )}
    </Card>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="custom-tooltip-label">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs text-slate-600">{entry.name}:</span>
            <span className={`custom-tooltip-value ${entry.value < 0 ? 'text-rose-500' : ''}`}>
              {formatCurrency(entry.value, true)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function PnLScreen() {
  const { projections, loading } = useFinancial();

  if (loading || !projections) {
    return (
      <div className="space-y-6" data-testid="pnl-screen-loading">
        <div className="kpi-grid">
          {[1,2,3,4].map(i => (
            <Card key={i} className="kpi-card">
              <div className="skeleton h-4 w-24 mb-2" />
              <div className="skeleton h-8 w-32" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const { pnl, revenue, costs } = projections;

  // Prepare monthly data
  const monthlyData = MONTHS.map((month, idx) => ({
    name: month,
    Revenue: pnl.monthly.revenue[idx],
    'Operating Expenses': -pnl.monthly.operating_expenses[idx],
    EBITDA: pnl.monthly.ebitda[idx],
    'Net Profit': pnl.monthly.net_profit[idx]
  }));

  // Prepare annual data
  const annualData = YEARS.map((year, idx) => ({
    name: year,
    Revenue: pnl.annual.revenue[idx],
    'Gross Profit': pnl.annual.gross_profit[idx],
    'Operating Expenses': pnl.annual.operating_expenses[idx],
    EBITDA: pnl.annual.ebitda[idx],
    'Net Profit': pnl.annual.net_profit[idx]
  }));

  // EBITDA trend data
  const ebitdaData = YEARS.map((year, idx) => ({
    name: year,
    EBITDA: pnl.annual.ebitda[idx],
    'EBITDA Margin': pnl.annual.revenue[idx] > 0 
      ? ((pnl.annual.ebitda[idx] / pnl.annual.revenue[idx]) * 100).toFixed(1)
      : 0
  }));

  // Calculate metrics
  const y1Revenue = pnl.annual.revenue[0];
  const y1EBITDA = pnl.annual.ebitda[0];
  const y1NetProfit = pnl.annual.net_profit[0];
  const y5EBITDA = pnl.annual.ebitda[4];
  const ebitdaMarginY1 = y1Revenue > 0 ? ((y1EBITDA / y1Revenue) * 100).toFixed(1) : 0;
  const grossMargin = 85; // Fixed 85% gross margin for marketplace

  // Find breakeven year
  const breakevenYear = pnl.annual.net_profit.findIndex(np => np > 0);

  return (
    <div className="space-y-6" data-testid="pnl-screen">
      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard 
          label="Y1 Revenue" 
          value={y1Revenue} 
        />
        <KPICard 
          label="Y1 EBITDA" 
          value={y1EBITDA}
          negative={y1EBITDA < 0}
        />
        <KPICard 
          label="EBITDA Margin (Y1)" 
          value={`${ebitdaMarginY1}%`}
        />
        <KPICard 
          label="Breakeven Year" 
          value={breakevenYear >= 0 ? `Year ${breakevenYear + 1}` : 'Beyond Y5'}
        />
      </div>

      {/* EBITDA Trend Chart */}
      <Card className="chart-container">
        <CardHeader className="pb-2">
          <CardTitle className="chart-title flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            EBITDA Trend - 5 Year Projection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={ebitdaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748B" />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 12 }} 
                  stroke="#64748B"
                  tickFormatter={(v) => formatCurrency(v, true)}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }} 
                  stroke="#64748B"
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <ReferenceLine yAxisId="left" y={0} stroke="#E2E8F0" strokeWidth={2} />
                <Bar yAxisId="left" dataKey="EBITDA" fill={CHART_COLORS.profit} />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="EBITDA Margin" 
                  stroke={CHART_COLORS.cash}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS.cash }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Monthly P&L Chart */}
      <Card className="chart-container">
        <CardHeader className="pb-2">
          <CardTitle className="chart-title flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Monthly P&L - Year 1
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748B" />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  stroke="#64748B"
                  tickFormatter={(v) => formatCurrency(v, true)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <ReferenceLine y={0} stroke="#E2E8F0" strokeWidth={2} />
                <Bar dataKey="Revenue" fill={CHART_COLORS.revenue} />
                <Line type="monotone" dataKey="EBITDA" stroke={CHART_COLORS.profit} strokeWidth={2} />
                <Line type="monotone" dataKey="Net Profit" stroke={CHART_COLORS.cash} strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* P&L Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly P&L Table */}
        <Card className="data-table-container">
          <CardHeader>
            <CardTitle className="chart-title">Monthly P&L (Y1)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th className="text-right">Revenue</th>
                    <th className="text-right">Gross Profit</th>
                    <th className="text-right">OpEx</th>
                    <th className="text-right">EBITDA</th>
                    <th className="text-right">Net P/L</th>
                  </tr>
                </thead>
                <tbody>
                  {MONTHS.map((month, idx) => (
                    <tr key={month}>
                      <td className="font-medium">{month}</td>
                      <td className="text-right">{formatCurrency(pnl.monthly.revenue[idx], true)}</td>
                      <td className="text-right">{formatCurrency(pnl.monthly.gross_profit[idx], true)}</td>
                      <td className="text-right">{formatCurrency(pnl.monthly.operating_expenses[idx], true)}</td>
                      <td className={`text-right font-semibold ${pnl.monthly.ebitda[idx] < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                        {formatCurrency(pnl.monthly.ebitda[idx], true)}
                      </td>
                      <td className={`text-right font-semibold ${pnl.monthly.net_profit[idx] < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                        {formatCurrency(pnl.monthly.net_profit[idx], true)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Annual P&L Table */}
        <Card className="data-table-container">
          <CardHeader>
            <CardTitle className="chart-title">Annual P&L (Y1-Y5)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Line Item</th>
                    {YEARS.map(y => <th key={y} className="text-right">{y}</th>)}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-medium">Revenue</td>
                    {pnl.annual.revenue.map((v, i) => (
                      <td key={i} className="text-right">{formatCurrency(v, true)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="font-medium">Gross Profit</td>
                    {pnl.annual.gross_profit.map((v, i) => (
                      <td key={i} className="text-right">{formatCurrency(v, true)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="font-medium">Operating Expenses</td>
                    {pnl.annual.operating_expenses.map((v, i) => (
                      <td key={i} className="text-right">{formatCurrency(v, true)}</td>
                    ))}
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="font-semibold">EBITDA</td>
                    {pnl.annual.ebitda.map((v, i) => (
                      <td key={i} className={`text-right font-semibold ${v < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                        {formatCurrency(v, true)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="font-medium">Depreciation</td>
                    {pnl.annual.depreciation.map((v, i) => (
                      <td key={i} className="text-right">{formatCurrency(v, true)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="font-medium">EBIT</td>
                    {pnl.annual.ebit.map((v, i) => (
                      <td key={i} className={`text-right ${v < 0 ? 'text-rose-500' : ''}`}>
                        {formatCurrency(v, true)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="font-medium">Taxes</td>
                    {pnl.annual.taxes.map((v, i) => (
                      <td key={i} className="text-right">{formatCurrency(v, true)}</td>
                    ))}
                  </tr>
                  <tr className="bg-slate-100">
                    <td className="font-bold">Net Profit/Loss</td>
                    {pnl.annual.net_profit.map((v, i) => (
                      <td key={i} className={`text-right font-bold ${v < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                        {formatCurrency(v, true)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
