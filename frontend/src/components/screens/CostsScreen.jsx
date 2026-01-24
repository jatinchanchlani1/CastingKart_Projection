import React from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { PieChartIcon, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency, MONTHS, YEARS, CHART_COLORS } from '../../lib/utils';

function KPICard({ label, value, trend, trendLabel, positive }) {
  return (
    <Card className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
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
            <span className="custom-tooltip-value">{formatCurrency(entry.value, true)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

const PIE_COLORS = [CHART_COLORS.team, CHART_COLORS.infrastructure, CHART_COLORS.marketing, CHART_COLORS.admin];

export function CostsScreen() {
  const { projections, loading } = useFinancial();

  if (loading || !projections) {
    return (
      <div className="space-y-6" data-testid="costs-screen-loading">
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

  const { costs, pnl } = projections;

  // Prepare monthly data
  const monthlyData = MONTHS.map((month, idx) => ({
    name: month,
    'Team': costs.monthly.team[idx],
    'Infrastructure': costs.monthly.infrastructure[idx],
    'Marketing': costs.monthly.marketing[idx],
    'Admin': costs.monthly.admin[idx],
    total: costs.monthly.total[idx],
    burn: -pnl.monthly.ebitda[idx]
  }));

  // Prepare annual data
  const annualData = YEARS.map((year, idx) => ({
    name: year,
    'Team': costs.annual.team[idx],
    'Infrastructure': costs.annual.infrastructure[idx],
    'Marketing': costs.annual.marketing[idx],
    'Admin': costs.annual.admin[idx],
    total: costs.annual.total[idx]
  }));

  // Pie chart data for Y1 cost composition
  const pieData = [
    { name: 'Team', value: costs.annual.team[0] },
    { name: 'Infrastructure', value: costs.annual.infrastructure[0] },
    { name: 'Marketing', value: costs.annual.marketing[0] },
    { name: 'Admin', value: costs.annual.admin[0] },
  ];

  // Calculate metrics
  const totalY1Costs = costs.annual.total[0];
  const avgMonthlyBurn = costs.monthly.total.reduce((a, b) => a + b, 0) / 12;
  const fixedCosts = costs.annual.team[0] + costs.annual.infrastructure[0] + costs.annual.admin[0];
  const variableCosts = costs.annual.marketing[0];
  const fixedPct = (fixedCosts / totalY1Costs * 100).toFixed(0);

  return (
    <div className="space-y-6" data-testid="costs-screen">
      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard 
          label="Year 1 Total Costs" 
          value={formatCurrency(totalY1Costs, true)} 
        />
        <KPICard 
          label="Avg Monthly Burn" 
          value={formatCurrency(avgMonthlyBurn, true)} 
        />
        <KPICard 
          label="Fixed Costs" 
          value={`${fixedPct}%`}
        />
        <KPICard 
          label="Variable Costs" 
          value={`${100 - parseInt(fixedPct)}%`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Burn Chart */}
        <Card className="chart-container lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="chart-title flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Monthly Costs & Burn - Year 1
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748B" />
                  <YAxis 
                    tick={{ fontSize: 12 }} 
                    stroke="#64748B"
                    tickFormatter={(v) => formatCurrency(v, true)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="Team" 
                    stackId="1" 
                    stroke={CHART_COLORS.team} 
                    fill={CHART_COLORS.team}
                    fillOpacity={0.8}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Infrastructure" 
                    stackId="1" 
                    stroke={CHART_COLORS.infrastructure} 
                    fill={CHART_COLORS.infrastructure}
                    fillOpacity={0.8}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Marketing" 
                    stackId="1" 
                    stroke={CHART_COLORS.marketing} 
                    fill={CHART_COLORS.marketing}
                    fillOpacity={0.8}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Admin" 
                    stackId="1" 
                    stroke={CHART_COLORS.admin} 
                    fill={CHART_COLORS.admin}
                    fillOpacity={0.8}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cost Composition Pie */}
        <Card className="chart-container">
          <CardHeader className="pb-2">
            <CardTitle className="chart-title flex items-center gap-2">
              <PieChartIcon className="w-4 h-4" />
              Cost Composition (Y1)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value, true)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Annual Costs Chart */}
      <Card className="chart-container">
        <CardHeader className="pb-2">
          <CardTitle className="chart-title flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            Annual Costs - 5 Year Projection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={annualData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748B" />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  stroke="#64748B"
                  tickFormatter={(v) => formatCurrency(v, true)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="Team" stackId="a" fill={CHART_COLORS.team} />
                <Bar dataKey="Infrastructure" stackId="a" fill={CHART_COLORS.infrastructure} />
                <Bar dataKey="Marketing" stackId="a" fill={CHART_COLORS.marketing} />
                <Bar dataKey="Admin" stackId="a" fill={CHART_COLORS.admin} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Cost Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Table */}
        <Card className="data-table-container">
          <CardHeader>
            <CardTitle className="chart-title">Monthly Costs (Y1)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th className="text-right">Team</th>
                    <th className="text-right">Infra</th>
                    <th className="text-right">Marketing</th>
                    <th className="text-right">Admin</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {MONTHS.map((month, idx) => (
                    <tr key={month}>
                      <td className="font-medium">{month}</td>
                      <td className="text-right">{formatCurrency(costs.monthly.team[idx], true)}</td>
                      <td className="text-right">{formatCurrency(costs.monthly.infrastructure[idx], true)}</td>
                      <td className="text-right">{formatCurrency(costs.monthly.marketing[idx], true)}</td>
                      <td className="text-right">{formatCurrency(costs.monthly.admin[idx], true)}</td>
                      <td className="text-right font-semibold">{formatCurrency(costs.monthly.total[idx], true)}</td>
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
            <CardTitle className="chart-title">Annual Costs (Y1-Y5)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th className="text-right">Team</th>
                    <th className="text-right">Infra</th>
                    <th className="text-right">Marketing</th>
                    <th className="text-right">Admin</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {YEARS.map((year, idx) => (
                    <tr key={year}>
                      <td className="font-medium">{year}</td>
                      <td className="text-right">{formatCurrency(costs.annual.team[idx], true)}</td>
                      <td className="text-right">{formatCurrency(costs.annual.infrastructure[idx], true)}</td>
                      <td className="text-right">{formatCurrency(costs.annual.marketing[idx], true)}</td>
                      <td className="text-right">{formatCurrency(costs.annual.admin[idx], true)}</td>
                      <td className="text-right font-semibold">{formatCurrency(costs.annual.total[idx], true)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
