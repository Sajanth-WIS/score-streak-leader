import { KpiScores, EmployeeData, KpiResult, BonusCalculation, FiscalPeriod } from './types';
import { useSettings } from '@/contexts/SettingsContext';

/**
 * Calculate points for a single KPI percentage based on tiered logic
 * ≥ 90% → full points
 * 80–89% → 85% of max points
 * 70–79% → 65% of max points
 * 60–69% → 35% of max points
 * < 60% → 0 points
 */
export function calculateKpiPoints(percentage: number, maxPoints: number): number {
  if (percentage >= 90) return maxPoints;
  if (percentage >= 80) return maxPoints * 0.85;
  if (percentage >= 70) return maxPoints * 0.65;
  if (percentage >= 60) return maxPoints * 0.35;
  return 0;
}

/**
 * Calculate detailed results for a specific KPI
 */
export function calculateKpiResult(
  monthlyPercentages: number[], 
  maxPoints: number
): KpiResult {
  // Calculate points for each month
  const monthlyPoints = monthlyPercentages.map(pct => calculateKpiPoints(pct, maxPoints));
  
  // Calculate average percentage across the 3 months
  const averagePercentage = monthlyPercentages.reduce((a, b) => a + b, 0) / monthlyPercentages.length;
  
  // Calculate average points across the 3 months
  const totalPoints = monthlyPoints.reduce((a, b) => a + b, 0) / monthlyPercentages.length;
  
  return {
    monthlyScores: monthlyPercentages,
    monthlyPoints,
    averagePercentage,
    totalPoints,
    maxPoints,
    percentage: (totalPoints / maxPoints) * 100
  };
}

/**
 * Special SA calculation with cumulative targets based on fiscal period
 */
export function calculateSaWithCumulativeTargets(
  monthlyPercentages: number[],
  fiscalPeriod: FiscalPeriod
): number[] {
  // This is a placeholder for the cumulative SA targets logic
  // In a real system, this would adjust the percentages based on:
  // - Which quarter of the fiscal year we're in
  // - Cumulative targets from April-January
  
  switch (fiscalPeriod) {
    case FiscalPeriod.Q1: // Apr-Jun (start of tax year)
      // Early in tax year - normal expectations
      return monthlyPercentages;
      
    case FiscalPeriod.Q2: // Jul-Sep
      // Starting to build momentum
      return monthlyPercentages;
      
    case FiscalPeriod.Q3: // Oct-Dec
      // Higher expectations toward tax deadline
      // Potentially adjust percentages based on cumulative targets
      return monthlyPercentages;
      
    case FiscalPeriod.Q4: // Jan-Mar (tax deadline approaching)
      // Highest expectations as tax deadline is near
      // Potentially use a more stringent scoring model
      return monthlyPercentages;
      
    default:
      return monthlyPercentages;
  }
}

/**
 * Validate KPI scores input data
 */
export function validateKpiInput(kpiScores: KpiScores): string[] {
  const errors: string[] = [];
  
  // Check that all arrays have exactly 3 months of data
  ['accounts', 'vat', 'sa'].forEach(kpiName => {
    const scores = kpiScores[kpiName as keyof KpiScores];
    
    if (!Array.isArray(scores) || scores.length !== 3) {
      errors.push(`${kpiName} must have exactly 3 monthly percentages`);
    } else {
      // Check that all percentages are valid numbers between 0-100
      scores.forEach((score, index) => {
        if (typeof score !== 'number' || isNaN(score) || score < 0 || score > 100) {
          errors.push(`${kpiName} month ${index + 1} must be a percentage between 0-100`);
        }
      });
    }
  });
  
  return errors;
}

/**
 * Main bonus calculation function
 */
export function calculateBonus(
  employee: EmployeeData, 
  kpiWeights = { accounts: 40, vat: 30, sa: 30 },
  bonusPoolDivisor = 4,
  fiscalPeriod = FiscalPeriod.Q1
): BonusCalculation {
  // Calculate quarterly pool
  const quarterlyPool = employee.monthlySalary / bonusPoolDivisor;
  
  // Calculate individual KPI results
  const accounts = calculateKpiResult(employee.kpiScores.accounts, kpiWeights.accounts);
  
  const vat = calculateKpiResult(employee.kpiScores.vat, kpiWeights.vat);
  
  // For SA, we might use the special cumulative calculation
  const adjustedSaScores = calculateSaWithCumulativeTargets(
    employee.kpiScores.sa, 
    fiscalPeriod
  );
  const sa = calculateKpiResult(adjustedSaScores, kpiWeights.sa);
  
  // Calculate total score (out of 100)
  const totalScore = accounts.totalPoints + vat.totalPoints + sa.totalPoints;
  
  // Calculate bonus percentage and amount
  const bonusPercentage = totalScore / 100;
  const bonusAmount = bonusPercentage * quarterlyPool;
  
  return {
    accounts,
    vat,
    sa,
    totalScore,
    bonusPercentage,
    bonusAmount,
    quarterlyPool
  };
}

/**
 * Determine the current fiscal period based on date
 */
export function determineFiscalPeriod(date = new Date()): FiscalPeriod {
  const month = date.getMonth(); // 0-11 (Jan-Dec)
  
  if (month >= 3 && month <= 5) return FiscalPeriod.Q1;     // Apr-Jun
  if (month >= 6 && month <= 8) return FiscalPeriod.Q2;     // Jul-Sep
  if (month >= 9 && month <= 11) return FiscalPeriod.Q3;    // Oct-Dec
  return FiscalPeriod.Q4;                                   // Jan-Mar
} 