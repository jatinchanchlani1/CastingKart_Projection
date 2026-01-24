import React from 'react';
import { RefreshCw, Download, HelpCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { useFinancial } from '../../context/FinancialContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

const screenTitles = {
  inputs: 'Master Inputs & Assumptions',
  revenue: 'Revenue Breakdown',
  costs: 'Cost & Burn Analysis',
  pnl: 'Profit & Loss Statement',
  cashflow: 'Cash Flow & Runway',
  'unit-economics': 'Unit Economics',
  metrics: 'Key Metrics Dashboard',
  scenarios: 'Scenario Comparison',
};

const screenDescriptions = {
  inputs: 'Configure all financial assumptions. Changes auto-update all projections.',
  revenue: 'Monthly (Y1) and annual (Y1-Y5) revenue breakdown by stream.',
  costs: 'Detailed cost analysis including team, infrastructure, and marketing.',
  pnl: 'Complete P&L with EBITDA, depreciation, taxes, and net profit.',
  cashflow: 'Operating cash flow, burn rate, and runway projections.',
  'unit-economics': 'Per-user metrics: ARPU, margins, and break-even analysis.',
  metrics: 'VC-style KPIs: CAGR, margins, burn multiple, Rule of 40.',
  scenarios: 'Compare Conservative, Base, and Aggressive scenarios.',
};

export function Header({ activeScreen }) {
  const { resetInputs, exportToExcel, loading, inputs } = useFinancial();

  const scenarioBadgeClass = {
    conservative: 'bg-amber-100 text-amber-800',
    base: 'bg-blue-100 text-blue-800',
    aggressive: 'bg-emerald-100 text-emerald-800',
  };

  return (
    <header className="content-header" data-testid="header">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {screenTitles[activeScreen]}
            </h2>
            <span className={`scenario-badge ${scenarioBadgeClass[inputs.timeline.scenario]}`}>
              {inputs.timeline.scenario.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">{screenDescriptions[activeScreen]}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetInputs}
                  disabled={loading}
                  data-testid="reset-btn"
                >
                  <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                  Reset
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset all inputs to defaults</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button
            size="sm"
            onClick={exportToExcel}
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800"
            data-testid="header-export-btn"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export Excel
          </Button>
        </div>
      </div>
    </header>
  );
}
