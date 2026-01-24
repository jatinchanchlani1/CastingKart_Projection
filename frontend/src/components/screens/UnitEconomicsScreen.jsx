import React from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend
} from 'recharts';
import { Target, TrendingUp, Users, DollarSign } from 'lucide-react';
import { formatCurrency, YEARS, CHART_COLORS } from '../../lib/utils';

function MetricCard({ icon: Icon, label, value, sublabel, highlight }) {
  return (
    <Card className={`metric-card ${highlight ? 'border-emerald-200 bg-emerald-50' : ''}`}>
      <div className="metric-card-header">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${highlight ? 'bg-emerald-100' : 'bg-slate-100'}`}>
          <Icon className={`w-5 h-5 ${highlight ? 'text-emerald-600' : 'text-slate-600'}`} />
        </div>
      </div>
      <div className="metric-card-title">{label}</div>
      <div className={`metric-card-value ${highlight ? 'text-emerald-700' : ''}`}>{value}</div>
      {sublabel && <div className="metric-card-subtitle">{sublabel}</div>}
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
            <span className="custom-tooltip-value">
              {entry.name.includes('₹') || entry.name.includes('ARPU') || entry.name.includes('Margin') 
                ? formatCurrency(entry.value, true)
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function UnitEconomicsScreen() {
  const { projections, loading } = useFinancial();

  if (loading || !projections) {
    return (
      <div className="space-y-6" data-testid="unit-economics-screen-loading">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <Card key={i} className="metric-card">
              <div className="skeleton h-10 w-10 rounded-lg mb-4" />
              <div className="skeleton h-4 w-24 mb-2" />
              <div className="skeleton h-8 w-32" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const { unit_economics, users } = projections;

  // Prepare chart data
  const arpuData = YEARS.map((year, idx) => ({
    name: year,
    'ARPU Artists': unit_economics.arpu_artists[idx],
    'ARPU CDs': unit_economics.arpu_cds[idx]
  }));

  const marginData = YEARS.map((year, idx) => ({
    name: year,
    'Gross Margin/User': unit_economics.gross_margin_per_user[idx],
    'Contribution Margin': unit_economics.contribution_margin[idx]
  }));

  const breakEvenMonth = unit_economics.break_even_month;
  const breakEvenYear = unit_economics.break_even_year;

  // Y1 metrics
  const arpuArtistsY1 = unit_economics.arpu_artists[0];
  const arpuCDsY1 = unit_economics.arpu_cds[0];
  const grossMarginY1 = unit_economics.gross_margin_per_user[0];
  const contributionMarginY1 = unit_economics.contribution_margin[0];

  return (
    <div className="space-y-6" data-testid="unit-economics-screen">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          icon={Users}
          label="ARPU (Artists)"
          value={formatCurrency(arpuArtistsY1, true)}
          sublabel="Annual revenue per paying artist"
        />
        <MetricCard 
          icon={Users}
          label="ARPU (CDs)"
          value={formatCurrency(arpuCDsY1, true)}
          sublabel="Annual revenue per CD"
        />
        <MetricCard 
          icon={DollarSign}
          label="Gross Margin/User"
          value={formatCurrency(grossMarginY1, true)}
          sublabel="After platform costs"
        />
        <MetricCard 
          icon={Target}
          label="Break-even"
          value={breakEvenMonth > 0 ? `Month ${breakEvenMonth}` : 'N/A'}
          sublabel={breakEvenYear > 0 ? `Year ${breakEvenYear}` : 'Beyond projection'}
          highlight={breakEvenMonth > 0}
        />
      </div>

      {/* ARPU Chart */}
      <Card className="chart-container">
        <CardHeader className="pb-2">
          <CardTitle className="chart-title flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            ARPU Trends - 5 Year Projection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={arpuData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748B" />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  stroke="#64748B"
                  tickFormatter={(v) => formatCurrency(v, true)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="ARPU Artists" fill={CHART_COLORS.revenue} />
                <Bar dataKey="ARPU CDs" fill={CHART_COLORS.cash} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Margin Chart */}
      <Card className="chart-container">
        <CardHeader className="pb-2">
          <CardTitle className="chart-title flex items-center gap-2">
            <Target className="w-4 h-4" />
            Unit Economics - Margins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={marginData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748B" />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  stroke="#64748B"
                  tickFormatter={(v) => formatCurrency(v, true)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="Gross Margin/User" 
                  stroke={CHART_COLORS.profit}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS.profit }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Contribution Margin" 
                  stroke={CHART_COLORS.cash}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS.cash }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card className="data-table-container">
        <CardHeader>
          <CardTitle className="chart-title">Unit Economics Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  {YEARS.map(y => <th key={y} className="text-right">{y}</th>)}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-medium">ARPU - Artists (₹)</td>
                  {unit_economics.arpu_artists.map((v, i) => (
                    <td key={i} className="text-right font-mono">{formatCurrency(v, true)}</td>
                  ))}
                </tr>
                <tr>
                  <td className="font-medium">ARPU - CDs (₹)</td>
                  {unit_economics.arpu_cds.map((v, i) => (
                    <td key={i} className="text-right font-mono">{formatCurrency(v, true)}</td>
                  ))}
                </tr>
                <tr>
                  <td className="font-medium">Gross Margin/User (₹)</td>
                  {unit_economics.gross_margin_per_user.map((v, i) => (
                    <td key={i} className="text-right font-mono">{formatCurrency(v, true)}</td>
                  ))}
                </tr>
                <tr>
                  <td className="font-medium">Contribution Margin (₹)</td>
                  {unit_economics.contribution_margin.map((v, i) => (
                    <td key={i} className={`text-right font-mono ${v < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                      {formatCurrency(v, true)}
                    </td>
                  ))}
                </tr>
                <tr className="bg-slate-50">
                  <td className="font-semibold">Total Artists (EOY)</td>
                  {users.annual_artists.map((v, i) => (
                    <td key={i} className="text-right font-mono font-semibold">{v.toLocaleString('en-IN')}</td>
                  ))}
                </tr>
                <tr className="bg-slate-50">
                  <td className="font-semibold">Total CDs (EOY)</td>
                  {users.annual_cds.map((v, i) => (
                    <td key={i} className="text-right font-mono font-semibold">{v.toLocaleString('en-IN')}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Break-even Info */}
      <Card className={`${breakEvenMonth > 0 ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Target className={`w-5 h-5 mt-0.5 ${breakEvenMonth > 0 ? 'text-emerald-600' : 'text-amber-600'}`} />
            <div>
              <h4 className={`font-semibold ${breakEvenMonth > 0 ? 'text-emerald-900' : 'text-amber-900'}`}>
                Break-even Analysis
              </h4>
              <p className={`text-sm mt-1 ${breakEvenMonth > 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                {breakEvenMonth > 0 ? (
                  <>
                    Based on current projections, the business reaches cumulative break-even in 
                    <span className="font-mono font-semibold"> Month {breakEvenMonth} (Year {breakEvenYear})</span>.
                    This accounts for all operational costs and assumes consistent growth patterns.
                  </>
                ) : (
                  <>
                    Break-even point is not reached within the 5-year projection period. 
                    Consider adjusting monetization rates, reducing costs, or accelerating user growth.
                  </>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
