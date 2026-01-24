import React from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, LineChart, Line
} from 'recharts';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency, formatNumber, MONTHS, YEARS, CHART_COLORS, calculateGrowth } from '../../lib/utils';

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

export function RevenueScreen() {
  const { projections, loading } = useFinancial();

  if (loading || !projections) {
    return (
      <div className="space-y-6" data-testid="revenue-screen-loading">
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

  const { revenue, users } = projections;

  // Prepare monthly data for charts
  const monthlyData = MONTHS.map((month, idx) => ({
    name: month,
    'Artist Premium': revenue.monthly.artist_premium[idx],
    'CD Premium': revenue.monthly.cd_premium[idx],
    'Boosts': revenue.monthly.boosts[idx],
    'Escrow': revenue.monthly.escrow[idx],
    total: revenue.monthly.total[idx]
  }));

  // Prepare annual data for charts
  const annualData = YEARS.map((year, idx) => ({
    name: year,
    'Artist Premium': revenue.annual.artist_premium[idx],
    'CD Premium': revenue.annual.cd_premium[idx],
    'Boosts': revenue.annual.boosts[idx],
    'Escrow': revenue.annual.escrow[idx],
    total: revenue.annual.total[idx]
  }));

  // Calculate totals and metrics
  const totalY1Revenue = revenue.annual.total[0];
  const totalY5Revenue = revenue.annual.total[4];
  const revenueGrowth = calculateGrowth(totalY5Revenue, totalY1Revenue);
  
  // ARPU calculations
  const arpuArtistY1 = users.annual_artists[0] > 0 
    ? revenue.annual.artist_premium[0] / (users.annual_artists[0] * 0.05) 
    : 0;
  const arpuCDY1 = users.annual_cds[0] > 0 
    ? (revenue.annual.cd_premium[0] + revenue.annual.boosts[0]) / users.annual_cds[0] 
    : 0;

  return (
    <div className="space-y-6" data-testid="revenue-screen">
      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard 
          label="Year 1 Revenue" 
          value={formatCurrency(totalY1Revenue, true)} 
          trend={0}
          trendLabel="vs. prev"
          positive={true}
        />
        <KPICard 
          label="Year 5 Revenue" 
          value={formatCurrency(totalY5Revenue, true)} 
          trend={revenueGrowth.toFixed(0)}
          trendLabel="vs. Y1"
          positive={true}
        />
        <KPICard 
          label="ARPU (Artists)" 
          value={formatCurrency(arpuArtistY1, true)} 
        />
        <KPICard 
          label="ARPU (CDs)" 
          value={formatCurrency(arpuCDY1, true)} 
        />
      </div>

      {/* Monthly Revenue Chart */}
      <Card className="chart-container">
        <CardHeader className="pb-2">
          <CardTitle className="chart-title flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Monthly Revenue - Year 1
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
                  dataKey="Artist Premium" 
                  stackId="1" 
                  stroke={CHART_COLORS.artistPremium} 
                  fill={CHART_COLORS.artistPremium}
                  fillOpacity={0.8}
                />
                <Area 
                  type="monotone" 
                  dataKey="CD Premium" 
                  stackId="1" 
                  stroke={CHART_COLORS.cdPremium} 
                  fill={CHART_COLORS.cdPremium}
                  fillOpacity={0.8}
                />
                <Area 
                  type="monotone" 
                  dataKey="Boosts" 
                  stackId="1" 
                  stroke={CHART_COLORS.boosts} 
                  fill={CHART_COLORS.boosts}
                  fillOpacity={0.8}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Annual Revenue Chart */}
      <Card className="chart-container">
        <CardHeader className="pb-2">
          <CardTitle className="chart-title flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Annual Revenue - 5 Year Projection
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
                <Bar dataKey="Artist Premium" stackId="a" fill={CHART_COLORS.artistPremium} />
                <Bar dataKey="CD Premium" stackId="a" fill={CHART_COLORS.cdPremium} />
                <Bar dataKey="Boosts" stackId="a" fill={CHART_COLORS.boosts} />
                <Bar dataKey="Escrow" stackId="a" fill={CHART_COLORS.escrow} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Table */}
        <Card className="data-table-container">
          <CardHeader>
            <CardTitle className="chart-title">Monthly Revenue (Y1)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th className="text-right">Artist</th>
                    <th className="text-right">CD</th>
                    <th className="text-right">Boosts</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {MONTHS.map((month, idx) => (
                    <tr key={month}>
                      <td className="font-medium">{month}</td>
                      <td className="text-right">{formatCurrency(revenue.monthly.artist_premium[idx], true)}</td>
                      <td className="text-right">{formatCurrency(revenue.monthly.cd_premium[idx], true)}</td>
                      <td className="text-right">{formatCurrency(revenue.monthly.boosts[idx], true)}</td>
                      <td className="text-right font-semibold">{formatCurrency(revenue.monthly.total[idx], true)}</td>
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
            <CardTitle className="chart-title">Annual Revenue (Y1-Y5)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th className="text-right">Artist</th>
                    <th className="text-right">CD</th>
                    <th className="text-right">Boosts</th>
                    <th className="text-right">Escrow</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {YEARS.map((year, idx) => (
                    <tr key={year}>
                      <td className="font-medium">{year}</td>
                      <td className="text-right">{formatCurrency(revenue.annual.artist_premium[idx], true)}</td>
                      <td className="text-right">{formatCurrency(revenue.annual.cd_premium[idx], true)}</td>
                      <td className="text-right">{formatCurrency(revenue.annual.boosts[idx], true)}</td>
                      <td className="text-right">{formatCurrency(revenue.annual.escrow[idx], true)}</td>
                      <td className="text-right font-semibold">{formatCurrency(revenue.annual.total[idx], true)}</td>
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
