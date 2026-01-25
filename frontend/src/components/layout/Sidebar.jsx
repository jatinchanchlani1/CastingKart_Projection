import React from 'react';
import { 
  Calculator, 
  TrendingUp, 
  PieChart, 
  FileText, 
  Wallet, 
  Target,
  BarChart3,
  GitCompare,
  Download
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useFinancial } from '../../context/FinancialContext';
import { Button } from '../ui/button';

const navItems = [
  { id: 'inputs', label: 'Master Inputs', icon: Calculator, description: 'Configure assumptions' },
  { id: 'revenue', label: 'Revenue', icon: TrendingUp, description: 'Revenue breakdown' },
  { id: 'costs', label: 'Costs & Burn', icon: PieChart, description: 'Cost analysis' },
  { id: 'pnl', label: 'P&L Statement', icon: FileText, description: 'Profit & Loss' },
  { id: 'cashflow', label: 'Cash Flow', icon: Wallet, description: 'Runway & cash' },
  { id: 'unit-economics', label: 'Unit Economics', icon: Target, description: 'Per-user metrics' },
  { id: 'metrics', label: 'Key Metrics', icon: BarChart3, description: 'VC dashboard' },
  { id: 'scenarios', label: 'Scenarios', icon: GitCompare, description: 'Compare scenarios' },
];

export function Sidebar({ activeScreen, onScreenChange }) {
  const { exportToExcel, loading } = useFinancial();

  return (
    <aside className="sidebar" data-testid="sidebar">
      <div className="sidebar-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
              CK
            </h1>
            <p className="text-xs text-slate-500">Financial Planner</p>
          </div>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <div className="px-4 mb-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Screens</p>
        </div>
        
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onScreenChange(item.id)}
            data-testid={`nav-${item.id}`}
            className={cn(
              'sidebar-nav-item w-full text-left',
              activeScreen === item.id && 'active'
            )}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.label}</p>
              <p className="text-xs text-slate-400 truncate">{item.description}</p>
            </div>
          </button>
        ))}
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-white">
        <Button
          onClick={exportToExcel}
          disabled={loading}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white"
          data-testid="export-excel-btn"
        >
          <Download className="w-4 h-4 mr-2" />
          Export to Excel
        </Button>
      </div>
    </aside>
  );
}
