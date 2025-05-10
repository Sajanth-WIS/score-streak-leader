
export interface StaffMember {
  id: string;
  name: string;
  email: string;
  department: string;
}

export interface KpiScore {
  staffId: string;
  month: string; // YYYY-MM format
  accounts: number; // Percentage
  vat: number; // Percentage
  sa: number; // Percentage
  accountsPoints?: number;
  vatPoints?: number;
  saPoints?: number;
  totalPoints?: number;
  bonusAmount?: number;
}

export interface SaTarget {
  month: string; // Month name
  target: number; // Percentage target
  completed: number; // Actual completed percentage
  jobsCompleted: number; // Number of completed jobs
  totalJobs: number; // Total jobs
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
}

// Mock staff data
export const mockStaffMembers: StaffMember[] = [
  { id: '1', name: 'John Smith', email: 'john@example.com', department: 'Accounting' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', department: 'Tax' },
  { id: '3', name: 'Michael Brown', email: 'michael@example.com', department: 'Accounting' },
  { id: '4', name: 'Emily Davis', email: 'emily@example.com', department: 'Tax' },
  { id: '5', name: 'David Wilson', email: 'david@example.com', department: 'Accounting' }
];

// Mock KPI scores
export const mockKpiScores: KpiScore[] = [
  // John's scores
  { 
    staffId: '1', 
    month: '2023-01', 
    accounts: 95, 
    vat: 92, 
    sa: 88,
  },
  { 
    staffId: '1', 
    month: '2023-02', 
    accounts: 88, 
    vat: 94, 
    sa: 90,
  },
  { 
    staffId: '1', 
    month: '2023-03', 
    accounts: 92, 
    vat: 90, 
    sa: 85,
  },
  
  // Sarah's scores
  { 
    staffId: '2', 
    month: '2023-01', 
    accounts: 87, 
    vat: 85, 
    sa: 91,
  },
  { 
    staffId: '2', 
    month: '2023-02', 
    accounts: 90, 
    vat: 88, 
    sa: 93,
  },
  { 
    staffId: '2', 
    month: '2023-03', 
    accounts: 94, 
    vat: 92, 
    sa: 90,
  },
  
  // More mock data for other staff members would go here
];

// SA tracker data
export const mockSaTracker: SaTarget[] = [
  { month: 'April', target: 5, completed: 6, jobsCompleted: 30, totalJobs: 500 },
  { month: 'May', target: 10, completed: 12, jobsCompleted: 60, totalJobs: 500 },
  { month: 'June', target: 20, completed: 19, jobsCompleted: 95, totalJobs: 500 },
  { month: 'July', target: 35, completed: 36, jobsCompleted: 180, totalJobs: 500 },
  { month: 'August', target: 50, completed: 48, jobsCompleted: 240, totalJobs: 500 },
  { month: 'September', target: 65, completed: 64, jobsCompleted: 320, totalJobs: 500 },
  { month: 'October', target: 80, completed: 0, jobsCompleted: 0, totalJobs: 500 },
  { month: 'November', target: 90, completed: 0, jobsCompleted: 0, totalJobs: 500 },
  { month: 'December', target: 95, completed: 0, jobsCompleted: 0, totalJobs: 500 },
  { month: 'January', target: 100, completed: 0, jobsCompleted: 0, totalJobs: 500 }
];

// Available badges
export const mockBadges: Badge[] = [
  {
    id: '1',
    name: 'Accounts Master',
    description: '3 consecutive months with 90%+ Accounts score',
    icon: 'badge',
    criteria: '3-month streak of 90%+ in Accounts'
  },
  {
    id: '2',
    name: 'VAT Wizard',
    description: '3 consecutive months with 90%+ VAT score',
    icon: 'badge',
    criteria: '3-month streak of 90%+ in VAT'
  },
  {
    id: '3',
    name: 'SA Champion',
    description: '3 consecutive months with 90%+ SA score',
    icon: 'badge',
    criteria: '3-month streak of 90%+ in SA'
  },
  {
    id: '4',
    name: 'Perfect Quarter',
    description: 'Score 90%+ in all KPIs for an entire quarter',
    icon: 'award',
    criteria: '90%+ in all KPIs for 3 consecutive months'
  }
];

// KPI score to points mapping
export const calculateKpiPoints = (percentage: number, kpiType: 'accounts' | 'vat' | 'sa'): number => {
  // Define point thresholds
  const pointsMap = {
    '>=90': { accounts: 40, vat: 30, sa: 30 },
    '>=80': { accounts: 35, vat: 25, sa: 25 },
    '>=70': { accounts: 30, vat: 20, sa: 20 },
    '>=60': { accounts: 20, vat: 15, sa: 15 },
    '<60': { accounts: 0, vat: 0, sa: 0 }
  };

  if (percentage >= 90) return pointsMap['>=90'][kpiType];
  if (percentage >= 80) return pointsMap['>=80'][kpiType];
  if (percentage >= 70) return pointsMap['>=70'][kpiType];
  if (percentage >= 60) return pointsMap['>=60'][kpiType];
  return pointsMap['<60'][kpiType];
};

// Calculate the total points for a KPI score
export const calculateTotalPoints = (score: KpiScore): KpiScore => {
  const accountsPoints = calculateKpiPoints(score.accounts, 'accounts');
  const vatPoints = calculateKpiPoints(score.vat, 'vat');
  const saPoints = calculateKpiPoints(score.sa, 'sa');
  const totalPoints = accountsPoints + vatPoints + saPoints;
  
  // Monthly salary / 4 would be the base bonus pool
  // For this example, let's use LKR 150,000 as the monthly salary
  const bonusPool = 150000 / 4;
  const bonusAmount = Math.round((totalPoints / 100) * bonusPool);
  
  return {
    ...score,
    accountsPoints,
    vatPoints,
    saPoints,
    totalPoints,
    bonusAmount
  };
};

// Process KPI scores for display
export const processKpiScores = (scores: KpiScore[]): KpiScore[] => {
  return scores.map(calculateTotalPoints);
};

// Get KPI scores for a specific staff member
export const getStaffKpiScores = (staffId: string): KpiScore[] => {
  return processKpiScores(mockKpiScores.filter(score => score.staffId === staffId));
};

// Get staff member by ID
export const getStaffMemberById = (staffId: string): StaffMember | undefined => {
  return mockStaffMembers.find(staff => staff.id === staffId);
};

// Check if a staff member earned a badge
export const checkForBadges = (staffId: string): Badge[] => {
  const staffScores = getStaffKpiScores(staffId);
  const earnedBadges: Badge[] = [];
  
  // Sort by date (newest first)
  const sortedScores = [...staffScores].sort((a, b) => 
    new Date(b.month).getTime() - new Date(a.month).getTime()
  );
  
  if (sortedScores.length >= 3) {
    // Check for 3 consecutive months with 90%+ in Accounts
    if (
      sortedScores[0].accounts >= 90 && 
      sortedScores[1].accounts >= 90 && 
      sortedScores[2].accounts >= 90
    ) {
      earnedBadges.push(mockBadges[0]);
    }
    
    // Check for 3 consecutive months with 90%+ in VAT
    if (
      sortedScores[0].vat >= 90 && 
      sortedScores[1].vat >= 90 && 
      sortedScores[2].vat >= 90
    ) {
      earnedBadges.push(mockBadges[1]);
    }
    
    // Check for 3 consecutive months with 90%+ in SA
    if (
      sortedScores[0].sa >= 90 && 
      sortedScores[1].sa >= 90 && 
      sortedScores[2].sa >= 90
    ) {
      earnedBadges.push(mockBadges[2]);
    }
    
    // Check for Perfect Quarter - 90%+ in all KPIs for 3 consecutive months
    if (
      sortedScores[0].accounts >= 90 && sortedScores[0].vat >= 90 && sortedScores[0].sa >= 90 &&
      sortedScores[1].accounts >= 90 && sortedScores[1].vat >= 90 && sortedScores[1].sa >= 90 &&
      sortedScores[2].accounts >= 90 && sortedScores[2].vat >= 90 && sortedScores[2].sa >= 90
    ) {
      earnedBadges.push(mockBadges[3]);
    }
  }
  
  return earnedBadges;
};

// Calculate quarterly bonus for a staff member
export const calculateQuarterlyBonus = (
  staffId: string, 
  year: number, 
  quarter: number
): number => {
  // Define the months in each quarter
  const quarterMonths = {
    1: ['01', '02', '03'],
    2: ['04', '05', '06'],
    3: ['07', '08', '09'],
    4: ['10', '11', '12']
  };
  
  const months = quarterMonths[quarter as keyof typeof quarterMonths];
  const quarterScores = mockKpiScores.filter(
    score => 
      score.staffId === staffId && 
      months.some(month => score.month === `${year}-${month}`)
  );
  
  if (quarterScores.length === 0) return 0;
  
  // Calculate average score for the quarter
  const processedScores = processKpiScores(quarterScores);
  const totalPoints = processedScores.reduce((sum, score) => sum + (score.totalPoints || 0), 0);
  const averagePoints = totalPoints / processedScores.length;
  
  // Monthly salary / 4 would be the base bonus pool
  const bonusPool = 150000 / 4;
  return Math.round((averagePoints / 100) * bonusPool);
};
