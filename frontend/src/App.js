import React, { useState } from 'react';
import "@/App.css";
import { FinancialProvider, useFinancial } from './context/FinancialContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MasterInputsScreen } from './components/screens/MasterInputsScreen';
import { RevenueScreen } from './components/screens/RevenueScreen';
import { CostsScreen } from './components/screens/CostsScreen';
import { PnLScreen } from './components/screens/PnLScreen';
import { CashFlowScreen } from './components/screens/CashFlowScreen';
import { UnitEconomicsScreen } from './components/screens/UnitEconomicsScreen';
import { KeyMetricsScreen } from './components/screens/KeyMetricsScreen';
import { ScenariosScreen } from './components/screens/ScenariosScreen';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const [activeScreen, setActiveScreen] = useState('inputs');
  const { loading } = useFinancial();

  const renderScreen = () => {
    switch (activeScreen) {
      case 'inputs':
        return <MasterInputsScreen />;
      case 'revenue':
        return <RevenueScreen />;
      case 'costs':
        return <CostsScreen />;
      case 'pnl':
        return <PnLScreen />;
      case 'cashflow':
        return <CashFlowScreen />;
      case 'unit-economics':
        return <UnitEconomicsScreen />;
      case 'metrics':
        return <KeyMetricsScreen />;
      case 'scenarios':
        return <ScenariosScreen />;
      default:
        return <MasterInputsScreen />;
    }
  };

  return (
    <div className="app-container" data-testid="app-container">
      <Sidebar activeScreen={activeScreen} onScreenChange={setActiveScreen} />
      
      <main className="main-content">
        <Header activeScreen={activeScreen} />
        
        <div className="content-body">
          {loading && (
            <div className="fixed top-4 right-4 bg-white border border-slate-200 rounded-lg px-4 py-2 shadow-lg flex items-center gap-2 z-50">
              <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              <span className="text-sm text-slate-600">Calculating...</span>
            </div>
          )}
          
          {renderScreen()}
        </div>
      </main>
      
      <Toaster position="bottom-right" />
    </div>
  );
}

function App() {
  return (
    <FinancialProvider>
      <AppContent />
    </FinancialProvider>
  );
}

export default App;
