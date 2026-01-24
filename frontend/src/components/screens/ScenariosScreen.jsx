import React from 'react';
import { useFinancial } from '../../context/FinancialContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, BarChart, Bar, AreaChart, Area
} from 'recharts';
import { GitCompare, TrendingUp, Wallet, ArrowRight } from 'lucide-react';
import { formatCurrency, YEARS, SCENARIO_COLORS } from '../../lib/utils';

function ScenarioBadge({ scenario }) {
  const colors = {
    conservative: 'bg-amber-100 text-amber-800 border-amber-200',
    base: 'bg-blue-100 text-blue-800 border-blue-200',
    aggressive: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  };
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${colors[scenario]}`}>
      {scenario.charAt(0).toUpperCase() + scenario.slice(1)}
    </span>
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

export function ScenariosScreen() {
  const { projections, inputs, loading } = useFinancial();

  if (loading || !projections) {
    return (
      <div className="space-y-6" data-testid="scenarios-screen-loading">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <Card key={i} className="p-6">
              <div className="skeleton h-6 w-32 mb-4" />
              <div className="skeleton h-10 w-40" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const { scenarios } = projections;
  const currentScenario = inputs.timeline.scenario;

  // Prepare revenue comparison data
  const revenueData = YEARS.map((year, idx) => ({
    name: year,
    Conservative: scenarios.conservative.revenue[idx],
    Base: scenarios.base.revenue[idx],
    Aggressive: scenarios.aggressive.revenue[idx]
  }));

  // Prepare EBITDA comparison data
  const ebitdaData = YEARS.map((year, idx) => ({
    name: year,
    Conservative: scenarios.conservative.ebitda[idx],
    Base: scenarios.base.ebitda[idx],
    Aggressive: scenarios.aggressive.ebitda[idx]
  }));

  // Prepare cash comparison data
  const cashData = YEARS.map((year, idx) => ({
    name: year,
    Conservative: scenarios.conservative.cumulative_cash[idx],
    Base: scenarios.base.cumulative_cash[idx],
    Aggressive: scenarios.aggressive.cumulative_cash[idx]
  }));

  // Calculate Y5 totals for summary cards
  const y5Revenue = {
    conservative: scenarios.conservative.revenue[4],
    base: scenarios.base.revenue[4],
    aggressive: scenarios.aggressive.revenue[4]
  };

  const y5Cash = {
    conservative: scenarios.conservative.cumulative_cash[4],
    base: scenarios.base.cumulative_cash[4],
    aggressive: scenarios.aggressive.cumulative_cash[4]
  };

  return (
    <div className="space-y-6" data-testid="scenarios-screen">
      {/* Scenario Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['conservative', 'base', 'aggressive'].map((scenario) => (
          <Card 
            key={scenario} 
            className={`p-6 ${currentScenario === scenario ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
          >
            <div className="flex items-center justify-between mb-4">
              <ScenarioBadge scenario={scenario} />
              {currentScenario === scenario && (
                <span className="text-xs text-blue-600 font-medium">ACTIVE</span>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Y5 Revenue</p>
                <p className="text-2xl font-bold font-mono tabular-nums" style={{ color: SCENARIO_COLORS[scenario] }}>
                  {formatCurrency(y5Revenue[scenario], true)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Y5 Cash Position</p>
                <p className={`text-lg font-semibold font-mono tabular-nums ${y5Cash[scenario] < 0 ? 'text-rose-500' : ''}`}>
                  {formatCurrency(y5Cash[scenario], true)}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Revenue Comparison Chart */}
      <Card className="chart-container">
        <CardHeader className="pb-2">
          <CardTitle className="chart-title flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Revenue Comparison by Scenario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748B" />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  stroke="#64748B"
                  tickFormatter={(v) => formatCurrency(v, true)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="Conservative" fill={SCENARIO_COLORS.conservative} />
                <Bar dataKey="Base" fill={SCENARIO_COLORS.base} />
                <Bar dataKey="Aggressive" fill={SCENARIO_COLORS.aggressive} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* EBITDA Comparison Chart */}
      <Card className="chart-container">
        <CardHeader className="pb-2">
          <CardTitle className="chart-title flex items-center gap-2">
            <GitCompare className="w-4 h-4" />
            EBITDA Comparison by Scenario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ebitdaData}>
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
                  dataKey="Conservative" 
                  stroke={SCENARIO_COLORS.conservative}
                  strokeWidth={2}
                  dot={{ fill: SCENARIO_COLORS.conservative }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Base" 
                  stroke={SCENARIO_COLORS.base}
                  strokeWidth={2}
                  dot={{ fill: SCENARIO_COLORS.base }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Aggressive" 
                  stroke={SCENARIO_COLORS.aggressive}
                  strokeWidth={2}
                  dot={{ fill: SCENARIO_COLORS.aggressive }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Cash Position Comparison Chart */}
      <Card className="chart-container">
        <CardHeader className="pb-2">
          <CardTitle className="chart-title flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Cash Position Comparison by Scenario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashData}>
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
                  dataKey="Conservative" 
                  stroke={SCENARIO_COLORS.conservative}
                  fill={SCENARIO_COLORS.conservative}
                  fillOpacity={0.2}
                />
                <Area 
                  type="monotone" 
                  dataKey="Base" 
                  stroke={SCENARIO_COLORS.base}
                  fill={SCENARIO_COLORS.base}
                  fillOpacity={0.2}
                />
                <Area 
                  type="monotone" 
                  dataKey="Aggressive" 
                  stroke={SCENARIO_COLORS.aggressive}
                  fill={SCENARIO_COLORS.aggressive}
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card className="data-table-container">
        <CardHeader>
          <CardTitle className="chart-title">Scenario Comparison Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th className="text-right">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SCENARIO_COLORS.conservative }} />
                      Conservative
                    </span>
                  </th>
                  <th className="text-right">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SCENARIO_COLORS.base }} />
                      Base
                    </span>
                  </th>
                  <th className="text-right">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SCENARIO_COLORS.aggressive }} />
                      Aggressive
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-slate-50">
                  <td colSpan={4} className="font-semibold text-slate-700">Revenue</td>
                </tr>
                {YEARS.map((year, idx) => (
                  <tr key={`rev-${year}`}>
                    <td className="font-medium pl-6">{year}</td>
                    <td className="text-right font-mono">{formatCurrency(scenarios.conservative.revenue[idx], true)}</td>
                    <td className="text-right font-mono">{formatCurrency(scenarios.base.revenue[idx], true)}</td>
                    <td className="text-right font-mono">{formatCurrency(scenarios.aggressive.revenue[idx], true)}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50">
                  <td colSpan={4} className="font-semibold text-slate-700">EBITDA</td>
                </tr>
                {YEARS.map((year, idx) => (
                  <tr key={`ebitda-${year}`}>
                    <td className="font-medium pl-6">{year}</td>
                    <td className={`text-right font-mono ${scenarios.conservative.ebitda[idx] < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                      {formatCurrency(scenarios.conservative.ebitda[idx], true)}
                    </td>
                    <td className={`text-right font-mono ${scenarios.base.ebitda[idx] < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                      {formatCurrency(scenarios.base.ebitda[idx], true)}
                    </td>
                    <td className={`text-right font-mono ${scenarios.aggressive.ebitda[idx] < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                      {formatCurrency(scenarios.aggressive.ebitda[idx], true)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50">
                  <td colSpan={4} className="font-semibold text-slate-700">Cumulative Cash</td>
                </tr>
                {YEARS.map((year, idx) => (
                  <tr key={`cash-${year}`}>
                    <td className="font-medium pl-6">{year}</td>
                    <td className={`text-right font-mono ${scenarios.conservative.cumulative_cash[idx] < 0 ? 'text-rose-500' : ''}`}>
                      {formatCurrency(scenarios.conservative.cumulative_cash[idx], true)}
                    </td>
                    <td className={`text-right font-mono ${scenarios.base.cumulative_cash[idx] < 0 ? 'text-rose-500' : ''}`}>
                      {formatCurrency(scenarios.base.cumulative_cash[idx], true)}
                    </td>
                    <td className={`text-right font-mono ${scenarios.aggressive.cumulative_cash[idx] < 0 ? 'text-rose-500' : ''}`}>
                      {formatCurrency(scenarios.aggressive.cumulative_cash[idx], true)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Assumptions Info */}
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <GitCompare className="w-5 h-5 text-slate-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-slate-900">Scenario Multipliers</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="font-medium text-amber-800">Conservative</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Growth: 0.7x • Conversion: 0.8x • Costs: 1.2x
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="font-medium text-blue-800">Base</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Growth: 1.0x • Conversion: 1.0x • Costs: 1.0x
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <p className="font-medium text-emerald-800">Aggressive</p>
                  <p className="text-sm text-emerald-700 mt-1">
                    Growth: 1.4x • Conversion: 1.2x • Costs: 0.9x
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
