import React from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { BarChart3, TrendingUp, Award, AlertCircle, CheckCircle } from 'lucide-react';
import { formatCurrency, formatPercentage, YEARS, CHART_COLORS } from '../../lib/utils';

function MetricCard({ label, value, sublabel, status, trend }) {
  const statusColors = {
    good: 'text-emerald-600',
    warning: 'text-amber-600',
    bad: 'text-rose-600',
    neutral: 'text-slate-600'
  };

  const StatusIcon = status === 'good' ? CheckCircle : status === 'bad' ? AlertCircle : null;

  return (
    <Card className="metric-card">
      <div className="flex items-center justify-between mb-2">
        <span className="kpi-label">{label}</span>
        {StatusIcon && <StatusIcon className={`w-4 h-4 ${statusColors[status]}`} />}
      </div>
      <div className={`kpi-value ${statusColors[status] || ''}`}>{value}</div>
      {sublabel && <div className="metric-card-subtitle">{sublabel}</div>}
      {trend && (
        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          {trend}
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
            <span className="custom-tooltip-value">
              {entry.name.includes('%') ? `${entry.value}%` : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function KeyMetricsScreen() {
  const { projections, loading } = useFinancial();

  if (loading || !projections) {
    return (
      <div className="space-y-6" data-testid="metrics-screen-loading">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <Card key={i} className="metric-card">
              <div className="skeleton h-4 w-24 mb-2" />
              <div className="skeleton h-8 w-32" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const { key_metrics, revenue, pnl } = projections;

  // Prepare chart data
  const marginData = YEARS.map((year, idx) => ({
    name: year,
    'Gross Margin %': key_metrics.gross_margin_pct[idx],
    'EBITDA Margin %': key_metrics.ebitda_margin_pct[idx]
  }));

  const efficiencyData = YEARS.map((year, idx) => ({
    name: year,
    'Burn Multiple': key_metrics.burn_multiple[idx],
    'Rule of 40': key_metrics.rule_of_40[idx],
    'Capital Efficiency': key_metrics.capital_efficiency[idx] * 100
  }));

  // Radar chart data for Y5
  const radarData = [
    { metric: 'Gross Margin', value: Math.min(key_metrics.gross_margin_pct[4], 100), fullMark: 100 },
    { metric: 'EBITDA Margin', value: Math.max(key_metrics.ebitda_margin_pct[4], -50), fullMark: 100 },
    { metric: 'Rule of 40', value: Math.min(Math.max(key_metrics.rule_of_40[4], 0), 100), fullMark: 100 },
    { metric: 'Capital Eff.', value: Math.min(key_metrics.capital_efficiency[4] * 100, 100), fullMark: 100 },
    { metric: 'Growth Score', value: Math.min(key_metrics.revenue_cagr, 100), fullMark: 100 },
  ];

  // Determine metric statuses
  const revenueCagrStatus = key_metrics.revenue_cagr > 50 ? 'good' : key_metrics.revenue_cagr > 20 ? 'warning' : 'bad';
  const rule40Y5 = key_metrics.rule_of_40[4];
  const rule40Status = rule40Y5 >= 40 ? 'good' : rule40Y5 >= 20 ? 'warning' : 'bad';
  const burnMultipleY1 = key_metrics.burn_multiple[0];
  const burnStatus = burnMultipleY1 < 2 ? 'good' : burnMultipleY1 < 5 ? 'warning' : 'bad';

  return (
    <div className="space-y-6" data-testid="metrics-screen">
      {/* Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          label="Revenue CAGR"
          value={`${key_metrics.revenue_cagr}%`}
          sublabel="5-year compound growth"
          status={revenueCagrStatus}
        />
        <MetricCard 
          label="Cost CAGR"
          value={`${key_metrics.cost_cagr}%`}
          sublabel="5-year compound growth"
          status={key_metrics.cost_cagr < key_metrics.revenue_cagr ? 'good' : 'warning'}
        />
        <MetricCard 
          label="Rule of 40 (Y5)"
          value={rule40Y5.toFixed(1)}
          sublabel="Growth + Profitability"
          status={rule40Status}
        />
        <MetricCard 
          label="Burn Multiple (Y1)"
          value={burnMultipleY1.toFixed(2)}
          sublabel="Net burn / Net new ARR"
          status={burnStatus}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Margin Trends */}
        <Card className="chart-container">
          <CardHeader className="pb-2">
            <CardTitle className="chart-title flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Margin Trends
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
                    tickFormatter={(v) => `${v}%`}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="Gross Margin %" 
                    stroke={CHART_COLORS.profit}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.profit }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="EBITDA Margin %" 
                    stroke={CHART_COLORS.cash}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.cash }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card className="chart-container">
          <CardHeader className="pb-2">
            <CardTitle className="chart-title flex items-center gap-2">
              <Award className="w-4 h-4" />
              VC Scorecard (Y5)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar 
                    name="Score" 
                    dataKey="value" 
                    stroke={CHART_COLORS.cash} 
                    fill={CHART_COLORS.cash} 
                    fillOpacity={0.5} 
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Efficiency Metrics Chart */}
      <Card className="chart-container">
        <CardHeader className="pb-2">
          <CardTitle className="chart-title flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Capital Efficiency Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={efficiencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748B" />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  stroke="#64748B"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="Rule of 40" 
                  stroke={CHART_COLORS.profit}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS.profit }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Burn Multiple" 
                  stroke={CHART_COLORS.cost}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS.cost }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Capital Efficiency" 
                  stroke={CHART_COLORS.cash}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS.cash }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics Table */}
      <Card className="data-table-container">
        <CardHeader>
          <CardTitle className="chart-title">Key Metrics Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  {YEARS.map(y => <th key={y} className="text-right">{y}</th>)}
                  <th className="text-right">Benchmark</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-medium">Gross Margin %</td>
                  {key_metrics.gross_margin_pct.map((v, i) => (
                    <td key={i} className="text-right font-mono">{v}%</td>
                  ))}
                  <td className="text-right text-slate-500">&gt;60%</td>
                </tr>
                <tr>
                  <td className="font-medium">EBITDA Margin %</td>
                  {key_metrics.ebitda_margin_pct.map((v, i) => (
                    <td key={i} className={`text-right font-mono ${v < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                      {v}%
                    </td>
                  ))}
                  <td className="text-right text-slate-500">&gt;20%</td>
                </tr>
                <tr>
                  <td className="font-medium">Burn Multiple</td>
                  {key_metrics.burn_multiple.map((v, i) => (
                    <td key={i} className={`text-right font-mono ${v > 3 ? 'text-rose-500' : v > 1.5 ? 'text-amber-500' : 'text-emerald-600'}`}>
                      {v.toFixed(2)}x
                    </td>
                  ))}
                  <td className="text-right text-slate-500">&lt;2x</td>
                </tr>
                <tr>
                  <td className="font-medium">Rule of 40</td>
                  {key_metrics.rule_of_40.map((v, i) => (
                    <td key={i} className={`text-right font-mono ${v >= 40 ? 'text-emerald-600' : v >= 20 ? 'text-amber-500' : 'text-rose-500'}`}>
                      {v.toFixed(1)}
                    </td>
                  ))}
                  <td className="text-right text-slate-500">&gt;40</td>
                </tr>
                <tr>
                  <td className="font-medium">Capital Efficiency</td>
                  {key_metrics.capital_efficiency.map((v, i) => (
                    <td key={i} className="text-right font-mono">{v.toFixed(2)}x</td>
                  ))}
                  <td className="text-right text-slate-500">&gt;1x</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Investor Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`p-4 ${revenueCagrStatus === 'good' ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200'}`}>
          <div className="flex items-start gap-3">
            <TrendingUp className={`w-5 h-5 ${revenueCagrStatus === 'good' ? 'text-emerald-600' : 'text-slate-600'}`} />
            <div>
              <h4 className="font-semibold text-slate-900">Growth</h4>
              <p className="text-sm text-slate-600 mt-1">
                {key_metrics.revenue_cagr}% revenue CAGR indicates 
                {key_metrics.revenue_cagr > 50 ? ' strong hyper-growth trajectory' : 
                 key_metrics.revenue_cagr > 20 ? ' healthy growth' : ' moderate growth'}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className={`p-4 ${rule40Status === 'good' ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200'}`}>
          <div className="flex items-start gap-3">
            <Award className={`w-5 h-5 ${rule40Status === 'good' ? 'text-emerald-600' : 'text-slate-600'}`} />
            <div>
              <h4 className="font-semibold text-slate-900">Rule of 40</h4>
              <p className="text-sm text-slate-600 mt-1">
                Y5 score of {rule40Y5.toFixed(1)} 
                {rule40Y5 >= 40 ? ' exceeds benchmark - investor ready' : 
                 rule40Y5 >= 20 ? ' approaching benchmark' : ' needs improvement'}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className={`p-4 ${burnStatus === 'good' ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200'}`}>
          <div className="flex items-start gap-3">
            <BarChart3 className={`w-5 h-5 ${burnStatus === 'good' ? 'text-emerald-600' : 'text-slate-600'}`} />
            <div>
              <h4 className="font-semibold text-slate-900">Burn Efficiency</h4>
              <p className="text-sm text-slate-600 mt-1">
                Y1 burn multiple of {burnMultipleY1.toFixed(2)}x 
                {burnMultipleY1 < 2 ? ' shows capital efficiency' : 
                 burnMultipleY1 < 5 ? ' is acceptable for early stage' : ' is high - review costs'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
