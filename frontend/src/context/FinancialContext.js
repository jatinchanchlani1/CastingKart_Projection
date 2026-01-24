import React, { createContext, useContext } from 'react';
import { useFinancialData } from '../hooks/useFinancialData';
import { useExcelExport } from '../hooks/useExcelExport';

const FinancialContext = createContext(null);

export function FinancialProvider({ children }) {
  const financialData = useFinancialData();
  const { exportToExcel } = useExcelExport();

  const handleExport = () => {
    exportToExcel(financialData.inputs, financialData.projections);
  };

  return (
    <FinancialContext.Provider value={{ ...financialData, exportToExcel: handleExport }}>
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancial() {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
}
