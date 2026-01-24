import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function DashboardLayout({ children }) {
  return (
    <div className="app-container">
      {children}
    </div>
  );
}
