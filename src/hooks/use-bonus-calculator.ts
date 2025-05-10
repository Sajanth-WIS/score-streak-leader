import { useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { 
  calculateBonus, 
  validateKpiInput, 
  determineFiscalPeriod 
} from '@/lib/bonus-engine';
import type { 
  EmployeeData, 
  BonusCalculation, 
  KpiScores, 
  FiscalPeriod 
} from '@/lib/bonus-engine/types';

export function useBonusCalculator() {
  const { settings } = useSettings();
  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null);
  const [bonusResult, setBonusResult] = useState<BonusCalculation | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [fiscalPeriod, setFiscalPeriod] = useState<FiscalPeriod>(determineFiscalPeriod());
  
  // Initialize default employee data
  const initializeEmployee = (id?: string) => {
    setEmployeeData({
      id,
      name: '',
      monthlySalary: 0,
      kpiScores: {
        accounts: [0, 0, 0],
        vat: [0, 0, 0],
        sa: [0, 0, 0]
      }
    });
    setBonusResult(null);
    setValidationErrors([]);
  };
  
  // Load employee data if available
  const loadEmployeeData = (employee: EmployeeData) => {
    setEmployeeData(employee);
    setBonusResult(null);
    setValidationErrors([]);
  };
  
  // Update employee data
  const updateEmployeeData = (data: Partial<EmployeeData>) => {
    setEmployeeData(prev => {
      if (!prev) return data as EmployeeData;
      return { ...prev, ...data };
    });
    // Clear results when data changes
    setBonusResult(null);
  };
  
  // Update a specific KPI score
  const updateKpiScore = (kpi: keyof KpiScores, month: number, value: number) => {
    if (!employeeData) return;
    
    const newKpiScores = { ...employeeData.kpiScores };
    const scores = [...newKpiScores[kpi]];
    scores[month] = value;
    newKpiScores[kpi] = scores;
    
    updateEmployeeData({ kpiScores: newKpiScores });
  };
  
  // Calculate bonus
  const calculateEmployeeBonus = () => {
    if (!employeeData) {
      setValidationErrors(['No employee data provided']);
      return;
    }
    
    // Validate inputs
    const errors = validateKpiInput(employeeData.kpiScores);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return null;
    }
    
    // Clear previous errors
    setValidationErrors([]);
    
    // Get weights from settings
    const kpiWeights = {
      accounts: settings.kpiCalculation.accountsWeight,
      vat: settings.kpiCalculation.vatWeight,
      sa: settings.kpiCalculation.saWeight
    };
    
    // Calculate bonus
    const result = calculateBonus(
      employeeData,
      kpiWeights,
      settings.kpiCalculation.bonusPoolDivisor,
      fiscalPeriod
    );
    
    setBonusResult(result);
    return result;
  };
  
  return {
    employeeData,
    bonusResult,
    validationErrors,
    fiscalPeriod,
    setFiscalPeriod,
    initializeEmployee,
    loadEmployeeData,
    updateEmployeeData,
    updateKpiScore,
    calculateEmployeeBonus,
    isValid: validationErrors.length === 0
  };
} 