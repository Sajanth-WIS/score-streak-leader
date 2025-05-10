// Core KPI score types
export interface KpiScores {
  accounts: number[]; // Array of 3 monthly percentages
  vat: number[];      // Array of 3 monthly percentages
  sa: number[];       // Array of 3 monthly percentages
}

// Employee data for bonus calculation
export interface EmployeeData {
  id?: string;
  name: string;
  monthlySalary: number;
  kpiScores: KpiScores;
}

// Detailed result for a specific KPI
export interface KpiResult {
  monthlyScores: number[]; // Raw monthly percentages
  monthlyPoints: number[]; // Points earned each month
  averagePercentage: number; // Average percentage across 3 months
  totalPoints: number; // Total points earned for this KPI
  maxPoints: number; // Maximum possible points
  percentage: number; // Percentage of max points earned
}

// Complete bonus calculation result
export interface BonusCalculation {
  accounts: KpiResult;
  vat: KpiResult;
  sa: KpiResult;
  totalScore: number; // Out of 100
  bonusPercentage: number; // Percentage of quarterly pool
  bonusAmount: number; // Final bonus amount
  quarterlyPool: number; // Monthly salary ÷ 4
}

// Fiscal year period for SA calculation
export enum FiscalPeriod {
  Q1 = "Q1", // Apr-Jun
  Q2 = "Q2", // Jul-Sep
  Q3 = "Q3", // Oct-Dec
  Q4 = "Q4"  // Jan-Mar
} 