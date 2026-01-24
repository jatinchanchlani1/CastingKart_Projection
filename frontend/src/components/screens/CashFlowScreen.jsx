import React from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend, ComposedChart, Bar, ReferenceLine
} from 'recharts';
import { Wallet, TrendingDown, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency, MONTHS, YEARS, CHART_COLORS } from '../../lib/utils';

function KPICard({ label, value, sublabel, positive, negative }) {
  const isNegative = negative || (typeof value === 'number' && value < 0);
  return (
    <Card className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className={`kpi-value ${isNegative ? 'text-rose-500' : ''}`}>
        {typeof value === 'number' ? formatCurrency(value, true) : value}
      </div>
      {sublabel && <p className="text-xs text-slate-500 mt-1">{sublabel}</p>}
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
              {entry.name === 'Runway' ? `${entry.value} months` : formatCurrency(entry.value, true)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function CashFlowScreen() {
  const { projections, inputs, loading } = useFinancial();

  if (loading || !projections) {
    return (
      <div className="space-y-6" data-testid="cashflow-screen-loading">
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

  const { cashflow, pnl } = projections;

  // Prepare monthly data
  const monthlyData = MONTHS.map((month, idx) => ({
    name: month,
    'Operating Cash Flow': cashflow.monthly.operating_cash_flow[idx],
    'Net Burn': cashflow.monthly.net_burn[idx],
    'Cumulative Cash': cashflow.monthly.cumulative_cash[idx],
    'Runway': Math.min(cashflow.monthly.runway_months[idx], 100)
  }));

  // Prepare annual data
  const annualData = YEARS.map((year, idx) => ({
    name: year,
    'Operating Cash Flow': cashflow.annual.operating_cash_flow[idx],
    'Net Burn': cashflow.annual.net_burn[idx],
    'Cumulative Cash': cashflow.annual.cumulative_cash[idx],
    'Funding': cashflow.annual.funding_received[idx]
  }));

  // Calculate metrics
  const initialFunding = inputs.funding.seed_funding;
  const currentCash = cashflow.monthly.cumulative_cash[11]; // End of Y1
  const avgMonthlyBurn = cashflow.monthly.net_burn.filter(b => b > 0).reduce((a, b) => a + b, 0) / 
    Math.max(cashflow.monthly.net_burn.filter(b => b > 0).length, 1);
  const runwayMonths = avgMonthlyBurn > 0 ? Math.floor(currentCash / avgMonthlyBurn) : 999;
  const totalBurnY1 = cashflow.monthly.net_burn.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6" data-testid="cashflow-screen">
      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard 
          label="Initial Funding" 
          value={initialFunding}
          sublabel="Seed round"
        />
        <KPICard 
          label="End of Y1 Cash" 
          value={currentCash}
          negative={currentCash < 0}
        />
        <KPICard 
          label="Avg Monthly Burn" 
          value={avgMonthlyBurn}
        />
        <KPICard 
          label="Runway (from Y1 end)" 
          value={runwayMonths > 100 ? '100+ months' : `${runwayMonths} months`}
        />
      </div>

      {/* Cash Position & Runway Chart */}
      <Card className="chart-container">
        <CardHeader className="pb-2">
          <CardTitle className="chart-title flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Cash Position & Runway - Year 1
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyData}>
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
                  tickFormatter={(v) => `${v}m`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="Cumulative Cash" 
                  stroke={CHART_COLORS.cash} 
                  fill={CHART_COLORS.cash}
                  fillOpacity={0.3}
                />
                <Bar yAxisId="left" dataKey="Net Burn" fill={CHART_COLORS.cost} />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="Runway" 
                  stroke={CHART_COLORS.profit}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS.profit }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Annual Cash Flow Chart */}
      <Card className="chart-container">
        <CardHeader className="pb-2">
          <CardTitle className="chart-title flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            Annual Cash Flow - 5 Year Projection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={annualData}>
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
                <Bar dataKey="Operating Cash Flow" fill={CHART_COLORS.profit} />
                <Bar dataKey="Funding" fill={CHART_COLORS.cash} />
                <Line 
                  type="monotone" 
                  dataKey="Cumulative Cash" 
                  stroke={CHART_COLORS.revenue}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS.revenue }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Cash Flow Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Table */}
        <Card className="data-table-container">
          <CardHeader>
            <CardTitle className="chart-title">Monthly Cash Flow (Y1)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th className="text-right">OCF</th>
                    <th className="text-right">Net Burn</th>
                    <th className="text-right">Cash</th>
                    <th className="text-right">Runway</th>
                  </tr>
                </thead>
                <tbody>
                  {MONTHS.map((month, idx) => (
                    <tr key={month}>
                      <td className="font-medium">{month}</td>
                      <td className={`text-right ${cashflow.monthly.operating_cash_flow[idx] < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                        {formatCurrency(cashflow.monthly.operating_cash_flow[idx], true)}
                      </td>
                      <td className="text-right text-rose-500">
                        {formatCurrency(cashflow.monthly.net_burn[idx], true)}
                      </td>
                      <td className={`text-right font-semibold ${cashflow.monthly.cumulative_cash[idx] < 0 ? 'text-rose-500' : ''}`}>
                        {formatCurrency(cashflow.monthly.cumulative_cash[idx], true)}
                      </td>
                      <td className="text-right">
                        {cashflow.monthly.runway_months[idx] > 100 ? '100+' : cashflow.monthly.runway_months[idx]}m
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Annual Table */}
        <Card className="data-table-container">
          <CardHeader>
            <CardTitle className="chart-title">Annual Cash Flow (Y1-Y5)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th className="text-right">OCF</th>
                    <th className="text-right">Funding</th>
                    <th className="text-right">Cumulative</th>
                  </tr>
                </thead>
                <tbody>
                  {YEARS.map((year, idx) => (
                    <tr key={year}>
                      <td className="font-medium">{year}</td>
                      <td className={`text-right ${cashflow.annual.operating_cash_flow[idx] < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                        {formatCurrency(cashflow.annual.operating_cash_flow[idx], true)}
                      </td>
                      <td className="text-right text-blue-600">
                        {cashflow.annual.funding_received[idx] > 0 
                          ? formatCurrency(cashflow.annual.funding_received[idx], true) 
                          : '-'}
                      </td>
                      <td className={`text-right font-semibold ${cashflow.annual.cumulative_cash[idx] < 0 ? 'text-rose-500' : ''}`}>
                        {formatCurrency(cashflow.annual.cumulative_cash[idx], true)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Runway Calculator Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900">Runway Calculator</h4>
              <p className="text-sm text-blue-700 mt-1">
                Based on current burn rate of <span className="font-mono font-semibold">{formatCurrency(avgMonthlyBurn, true)}/month</span> and 
                ending Y1 cash of <span className="font-mono font-semibold">{formatCurrency(currentCash, true)}</span>, 
                your runway is approximately <span className="font-mono font-semibold">{runwayMonths > 100 ? '100+' : runwayMonths} months</span>.
                {inputs.funding.series_a_year <= 5 && (
                  <span> Series A funding of {formatCurrency(inputs.funding.series_a_amount, true)} is planned for Year {inputs.funding.series_a_year}.</span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
