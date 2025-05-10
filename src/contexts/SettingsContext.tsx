import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

// Define the currency formats and symbols
export type CurrencyConfig = {
  code: string;
  symbol: string;
  position: 'prefix' | 'suffix';
};

export const CURRENCIES: Record<string, CurrencyConfig> = {
  LKR: { code: 'LKR', symbol: 'LKR', position: 'prefix' },
  USD: { code: 'USD', symbol: '$', position: 'prefix' },
  GBP: { code: 'GBP', symbol: '£', position: 'prefix' },
  EUR: { code: 'EUR', symbol: '€', position: 'prefix' },
  INR: { code: 'INR', symbol: '₹', position: 'prefix' },
};

// Define KPI calculation settings
export type KpiCalculationConfig = {
  accountsWeight: number; // Out of 100
  vatWeight: number; // Out of 100
  saWeight: number; // Out of 100
  bonusPoolDivisor: number; // Divides annual salary to get bonus pool (e.g., 4 means quarterly bonus)
};

// Define the settings type
export interface AppSettings {
  currency: CurrencyConfig;
  kpiCalculation: KpiCalculationConfig;
  dateFormat: string;
  showTeamFilters: boolean;
  enableNotifications: boolean;
  defaultView: 'team' | 'individual';
  showSalaries: boolean; // Whether to show salary information to everyone
  pageSize: number; // Default number of items per page in tables
  animationsEnabled: boolean; // Whether to show animations
}

// Default settings
export const DEFAULT_SETTINGS: AppSettings = {
  currency: CURRENCIES.LKR,
  kpiCalculation: {
    accountsWeight: 40,
    vatWeight: 30,
    saWeight: 30,
    bonusPoolDivisor: 4,
  },
  dateFormat: 'YYYY-MM-DD',
  showTeamFilters: true,
  enableNotifications: true,
  defaultView: 'team',
  showSalaries: true,
  pageSize: 10,
  animationsEnabled: true,
};

// Context type with settings and updater function
interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  updateKpiCalculation: (updates: Partial<KpiCalculationConfig>) => void;
  formatCurrency: (amount: number) => string;
  resetSettings: () => void;
}

// Create context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Provider component
export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Try to load settings from localStorage, or use defaults
  const [settings, setSettings] = useState<AppSettings>(() => {
    const savedSettings = localStorage.getItem('appSettings');
    return savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS;
  });

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  // Update settings
  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  // Update KPI calculation settings specifically
  const updateKpiCalculation = (updates: Partial<KpiCalculationConfig>) => {
    setSettings(prev => ({
      ...prev,
      kpiCalculation: { ...prev.kpiCalculation, ...updates }
    }));
  };

  // Reset settings to defaults
  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  // Helper function to format currency values
  const formatCurrency = (amount: number): string => {
    const { symbol, position } = settings.currency;
    const formattedAmount = amount.toLocaleString();
    
    return position === 'prefix' 
      ? `${symbol} ${formattedAmount}` 
      : `${formattedAmount} ${symbol}`;
  };

  return (
    <SettingsContext.Provider 
      value={{ 
        settings, 
        updateSettings, 
        updateKpiCalculation, 
        formatCurrency, 
        resetSettings 
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

// Hook for using the settings context
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 