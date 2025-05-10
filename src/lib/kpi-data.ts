export interface StaffMember {
  id: string;
  name: string;
  email: string;
  team: string;
  salary: number;
}

export interface SaJob {
  id: string;
  dataDate: Date;
  chaseEvents: Date[];
  submittedDate: Date | null;
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

export interface TeamKpiScore extends Omit<KpiScore, 'staffId'> {
  memberCount: number;
  bonusPool: number;
  totalBonus: number;
}

export interface TeamPerformance {
  overall: TeamKpiScore & { history: TeamKpiScore[] };
  teams: Array<{
    name: string;
    memberCount: number;
    accounts: number;
    vat: number;
    sa: number;
    accountsPoints: number;
    vatPoints: number;
    saPoints: number;
    totalPoints: number;
    bonusPool: number;
    totalBonus: number;
    history: TeamKpiScore[];
  }>;
}

export interface SaTarget {
  month: string; // Month name
  target: number; // Percentage target
  completed: number; // Actual completed percentage
  jobsCompleted: number; // Number of completed jobs
  totalJobs: number; // Total jobs
  teamBreakdown?: TeamSaTarget[]; // Team-specific breakdown (optional)
  newClients?: number; // New adhoc clients added in this month
}

// Team-specific SA target data
export interface TeamSaTarget {
  teamName: string; // Name of the team
  jobsCompleted: number; // Number of jobs completed by this team
  targetJobs: number; // Target number of jobs for this team
  completed: number; // Completion percentage
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
}

// Mock staff data with team instead of department and added salary
export const mockStaffMembers: StaffMember[] = [
  { id: '1', name: 'John Smith', email: 'john@example.com', team: 'Accounting', salary: 60000 },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', team: 'Tax', salary: 75000 },
  { id: '3', name: 'Michael Brown', email: 'michael@example.com', team: 'Accounting', salary: 55000 },
  { id: '4', name: 'Emily Davis', email: 'emily@example.com', team: 'Tax', salary: 65000 },
  { id: '5', name: 'David Wilson', email: 'david@example.com', team: 'Accounting', salary: 50000 }
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
  
  // Michael's scores
  { 
    staffId: '3', 
    month: '2023-01', 
    accounts: 91, 
    vat: 89, 
    sa: 87,
  },
  { 
    staffId: '3', 
    month: '2023-02', 
    accounts: 93, 
    vat: 88, 
    sa: 89,
  },
  { 
    staffId: '3', 
    month: '2023-03', 
    accounts: 90, 
    vat: 86, 
    sa: 88,
  },
  
  // Emily's scores
  { 
    staffId: '4', 
    month: '2023-01', 
    accounts: 89, 
    vat: 92, 
    sa: 88,
  },
  { 
    staffId: '4', 
    month: '2023-02', 
    accounts: 91, 
    vat: 90, 
    sa: 92,
  },
  { 
    staffId: '4', 
    month: '2023-03', 
    accounts: 88, 
    vat: 91, 
    sa: 89,
  },
  
  // David's scores
  { 
    staffId: '5', 
    month: '2023-01', 
    accounts: 86, 
    vat: 84, 
    sa: 85,
  },
  { 
    staffId: '5', 
    month: '2023-02', 
    accounts: 88, 
    vat: 87, 
    sa: 86,
  },
  { 
    staffId: '5', 
    month: '2023-03', 
    accounts: 89, 
    vat: 85, 
    sa: 88,
  },
];

// SA tracker data
export const mockSaTracker: SaTarget[] = [
  { 
    month: 'April', 
    target: 5, 
    completed: 6, 
    jobsCompleted: 30, 
    totalJobs: 500,
    teamBreakdown: [
      { teamName: 'Accounting', jobsCompleted: 20, targetJobs: 300, completed: 6.7 },
      { teamName: 'Tax', jobsCompleted: 10, targetJobs: 200, completed: 5.0 }
    ]
  },
  { 
    month: 'May', 
    target: 10, 
    completed: 12, 
    jobsCompleted: 60, 
    totalJobs: 500,
    teamBreakdown: [
      { teamName: 'Accounting', jobsCompleted: 40, targetJobs: 300, completed: 13.3 },
      { teamName: 'Tax', jobsCompleted: 20, targetJobs: 200, completed: 10.0 }
    ],
    newClients: 5
  },
  { 
    month: 'June', 
    target: 20, 
    completed: 19, 
    jobsCompleted: 95, 
    totalJobs: 500,
    teamBreakdown: [
      { teamName: 'Accounting', jobsCompleted: 55, targetJobs: 300, completed: 18.3 },
      { teamName: 'Tax', jobsCompleted: 40, targetJobs: 200, completed: 20.0 }
    ],
    newClients: 3
  },
  { 
    month: 'July', 
    target: 35, 
    completed: 36, 
    jobsCompleted: 180, 
    totalJobs: 500,
    teamBreakdown: [
      { teamName: 'Accounting', jobsCompleted: 110, targetJobs: 300, completed: 36.7 },
      { teamName: 'Tax', jobsCompleted: 70, targetJobs: 200, completed: 35.0 }
    ]
  },
  { 
    month: 'August', 
    target: 50, 
    completed: 48, 
    jobsCompleted: 240, 
    totalJobs: 500,
    teamBreakdown: [
      { teamName: 'Accounting', jobsCompleted: 145, targetJobs: 300, completed: 48.3 },
      { teamName: 'Tax', jobsCompleted: 95, targetJobs: 200, completed: 47.5 }
    ],
    newClients: 8
  },
  { 
    month: 'September', 
    target: 65, 
    completed: 64, 
    jobsCompleted: 320, 
    totalJobs: 500,
    teamBreakdown: [
      { teamName: 'Accounting', jobsCompleted: 190, targetJobs: 300, completed: 63.3 },
      { teamName: 'Tax', jobsCompleted: 130, targetJobs: 200, completed: 65.0 }
    ]
  },
  { 
    month: 'October', 
    target: 80, 
    completed: 0, 
    jobsCompleted: 0, 
    totalJobs: 500,
    teamBreakdown: [
      { teamName: 'Accounting', jobsCompleted: 0, targetJobs: 300, completed: 0 },
      { teamName: 'Tax', jobsCompleted: 0, targetJobs: 200, completed: 0 }
    ]
  },
  { 
    month: 'November', 
    target: 90, 
    completed: 0, 
    jobsCompleted: 0, 
    totalJobs: 500,
    teamBreakdown: [
      { teamName: 'Accounting', jobsCompleted: 0, targetJobs: 300, completed: 0 },
      { teamName: 'Tax', jobsCompleted: 0, targetJobs: 200, completed: 0 }
    ]
  },
  { 
    month: 'December', 
    target: 95, 
    completed: 0, 
    jobsCompleted: 0, 
    totalJobs: 500,
    teamBreakdown: [
      { teamName: 'Accounting', jobsCompleted: 0, targetJobs: 300, completed: 0 },
      { teamName: 'Tax', jobsCompleted: 0, targetJobs: 200, completed: 0 }
    ]
  },
  { 
    month: 'January', 
    target: 100, 
    completed: 0, 
    jobsCompleted: 0, 
    totalJobs: 500,
    teamBreakdown: [
      { teamName: 'Accounting', jobsCompleted: 0, targetJobs: 300, completed: 0 },
      { teamName: 'Tax', jobsCompleted: 0, targetJobs: 200, completed: 0 }
    ]
  }
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
  // For SA, use the new calculation based on the screenshot
  if (kpiType === 'sa') {
    return calculateSaPoints(percentage);
  }
  
  // Define point thresholds for other KPI types
  const pointsMap = {
    '>=90': { accounts: 40, vat: 30 },
    '>=80': { accounts: 35, vat: 25 },
    '>=70': { accounts: 30, vat: 20 },
    '>=60': { accounts: 20, vat: 15 },
    '<60': { accounts: 0, vat: 0 }
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
  
  // Get staff member's salary
  const staffMember = getStaffMemberById(score.staffId);
  
  // Calculate bonus based on staff salary
  // Default to 150000 if salary is not available
  const salary = staffMember?.salary || 150000;
  
  // Apply difficulty factor to bonus calculation
  const difficultyFactor = calculateClientDifficultyFactor(score.staffId);
  const bonusPool = salary / 4;
  const bonusAmount = Math.round((totalPoints / 100) * bonusPool * difficultyFactor);
  
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

// Calculate team performance by team
export const getTeamPerformance = (): TeamPerformance => {
  // Get unique months
  const months = [...new Set(mockKpiScores.map(score => score.month))].sort();
  
  // Get unique teams
  const teams = [...new Set(mockStaffMembers.map(staff => staff.team))];
  
  // Calculate team performance for each team and month
  const teamPerformance = teams.map(team => {
    const teamStaff = mockStaffMembers.filter(staff => staff.team === team);
    const memberCount = teamStaff.length;
    const staffIds = teamStaff.map(staff => staff.id);
    
    // Calculate performance history for each month
    const history = months.map(month => {
      const monthScores = mockKpiScores.filter(score => 
        score.month === month && staffIds.includes(score.staffId)
      );
      
      if (monthScores.length === 0) {
        return {
          month,
          accounts: 0,
          vat: 0,
          sa: 0,
          accountsPoints: 0,
          vatPoints: 0,
          saPoints: 0,
          totalPoints: 0,
          memberCount,
          bonusPool: memberCount * (teamStaff.reduce((sum, staff) => sum + staff.salary, 0) / memberCount / 4), // Using actual salaries
          totalBonus: 0
        };
      }
      
      // Calculate average percentages
      const avgAccounts = monthScores.reduce((sum, score) => sum + score.accounts, 0) / monthScores.length;
      const avgVat = monthScores.reduce((sum, score) => sum + score.vat, 0) / monthScores.length;
      const avgSa = monthScores.reduce((sum, score) => sum + score.sa, 0) / monthScores.length;
      
      // Calculate points
      const accountsPoints = calculateKpiPoints(avgAccounts, 'accounts');
      const vatPoints = calculateKpiPoints(avgVat, 'vat');
      const saPoints = calculateKpiPoints(avgSa, 'sa');
      const totalPoints = accountsPoints + vatPoints + saPoints;
      
      // Calculate bonus using actual staff salaries
      const bonusPool = teamStaff.reduce((sum, staff) => sum + staff.salary, 0) / 4; // Quarter of total team salary
      const totalBonus = Math.round((totalPoints / 100) * bonusPool);
      
      return {
        month,
        accounts: avgAccounts,
        vat: avgVat,
        sa: avgSa,
        accountsPoints,
        vatPoints,
        saPoints,
        totalPoints,
        memberCount,
        bonusPool,
        totalBonus
      };
    });
    
    // Get latest month data
    const latestMonth = history[history.length - 1];
    
    return {
      name: team,
      memberCount,
      accounts: latestMonth.accounts,
      vat: latestMonth.vat,
      sa: latestMonth.sa,
      accountsPoints: latestMonth.accountsPoints,
      vatPoints: latestMonth.vatPoints,
      saPoints: latestMonth.saPoints,
      totalPoints: latestMonth.totalPoints,
      bonusPool: latestMonth.bonusPool,
      totalBonus: latestMonth.totalBonus,
      history
    };
  });
  
  // Calculate overall team performance with actual salaries
  const totalSalaryPool = mockStaffMembers.reduce((sum, staff) => sum + staff.salary, 0);
  
  const overallHistory = months.map(month => {
    const monthScores = mockKpiScores.filter(score => score.month === month);
    
    if (monthScores.length === 0) {
      return {
        month,
        accounts: 0,
        vat: 0,
        sa: 0,
        accountsPoints: 0,
        vatPoints: 0,
        saPoints: 0,
        totalPoints: 0,
        memberCount: mockStaffMembers.length,
        bonusPool: totalSalaryPool / 4,  // Quarter of total salary
        totalBonus: 0
      };
    }
    
    // Calculate average percentages
    const avgAccounts = monthScores.reduce((sum, score) => sum + score.accounts, 0) / monthScores.length;
    const avgVat = monthScores.reduce((sum, score) => sum + score.vat, 0) / monthScores.length;
    const avgSa = monthScores.reduce((sum, score) => sum + score.sa, 0) / monthScores.length;
    
    // Calculate points
    const accountsPoints = calculateKpiPoints(avgAccounts, 'accounts');
    const vatPoints = calculateKpiPoints(avgVat, 'vat');
    const saPoints = calculateKpiPoints(avgSa, 'sa');
    const totalPoints = accountsPoints + vatPoints + saPoints;
    
    // Calculate bonus with actual salaries
    const bonusPool = totalSalaryPool / 4;
    const totalBonus = Math.round((totalPoints / 100) * bonusPool);
    
    return {
      month,
      accounts: avgAccounts,
      vat: avgVat,
      sa: avgSa,
      accountsPoints,
      vatPoints,
      saPoints,
      totalPoints,
      memberCount: mockStaffMembers.length,
      bonusPool,
      totalBonus
    };
  });
  
  // Get latest month data for overall
  const latestMonth = overallHistory[overallHistory.length - 1];
  
  return {
    overall: {
      ...latestMonth,
      history: overallHistory
    },
    teams: teamPerformance
  };
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

// Define seasonal adjustment factors for different times of year
export const seasonalFactors = {
  // Q1: Jan-Mar (SA season high pressure)
  '01': 1.2, // January - peak SA month
  '02': 1.1, // February - high SA work
  '03': 1.0, // March - moderate SA work
  
  // Q2: Apr-Jun (Accounts & VAT focused)
  '04': 0.9, // April - accounts/VAT focus
  '05': 0.9, // May - accounts/VAT focus
  '06': 0.9, // June - accounts/VAT focus
  
  // Q3: Jul-Sep (Quieter period, prep for SA)
  '07': 0.9, // July - general work
  '08': 0.85, // August - holiday season
  '09': 0.95, // September - starting SA prep
  
  // Q4: Oct-Dec (SA preparation building)
  '10': 1.0, // October - SA prep increasing
  '11': 1.05, // November - SA prep high
  '12': 1.1, // December - SA prep peak
};

// Calculate quarterly bonus with seasonal adjustments
export const calculateQuarterlyBonus = (
  staffId: string, 
  year: number, 
  quarter: number
): number => {
  // Define the months in each quarter for Sri Lankan fiscal year
  const quarterMonths = {
    1: ['01', '02', '03'], // Q1: Jan-Mar
    2: ['04', '05', '06'], // Q2: Apr-Jun
    3: ['07', '08', '09'], // Q3: Jul-Sep
    4: ['10', '11', '12']  // Q4: Oct-Dec
  };
  
  const months = quarterMonths[quarter as keyof typeof quarterMonths];
  const quarterScores = mockKpiScores.filter(
    score => 
      score.staffId === staffId && 
      months.some(month => score.month === `${year}-${month}`)
  );
  
  // If no scores for the quarter, return 0
  if (quarterScores.length === 0) return 0;
  
  // Process the scores to calculate points
  const processedScores = processKpiScores(quarterScores);
  
  // Calculate average score for the quarter, with seasonal adjustments
  const totalPoints = processedScores.reduce((sum, score) => {
    // Get month from YYYY-MM format
    const month = score.month.split('-')[1];
    const seasonalFactor = seasonalFactors[month as keyof typeof seasonalFactors] || 1.0;
    
    // Handle missing SA data differently based on season
    if (score.sa === 0 && (score.accounts > 0 || score.vat > 0)) {
      // For months where SA is not expected (Apr-Sep), calculate based on accounts/VAT only
      if (['04', '05', '06', '07', '08', '09'].includes(month)) {
        // During non-SA months: accounts & VAT are scaled to 100%
        const accountsPoints = score.accountsPoints || 0;
        const vatPoints = score.vatPoints || 0;
        // Total possible from accounts/VAT is 70
        const adjustedTotal = Math.round((accountsPoints + vatPoints) * (100/70));
        return sum + (adjustedTotal * seasonalFactor);
      } 
      // For SA season (Oct-Mar), missing SA is considered a deficiency
      else {
        // During SA season: missing SA is penalized 
        const accountsPoints = score.accountsPoints || 0;
        const vatPoints = score.vatPoints || 0;
        // Include penalty for missing SA in SA season by applying 80% factor
        const penaltyFactor = 0.8;
        return sum + ((accountsPoints + vatPoints) * penaltyFactor * seasonalFactor);
      }
    }
    
    // Normal calculation with seasonal adjustment
    return sum + ((score.totalPoints || 0) * seasonalFactor);
  }, 0);
  
  const averagePoints = totalPoints / processedScores.length;
  
  // Get staff member's salary
  const staffMember = getStaffMemberById(staffId);
  const salary = staffMember?.salary || 150000;
  
  // Calculate bonus based on staff salary
  const bonusPool = salary / 4;
  return Math.round((averagePoints / 100) * bonusPool);
};

// Calculate the difficulty factor for a staff member's clients
export const calculateClientDifficultyFactor = (staffId: string): number => {
  // This would ideally be based on actual client complexity data
  // For now, use a dummy implementation
  const staffMember = getStaffMemberById(staffId);
  
  // Accounting team has slightly more complex clients in this example
  if (staffMember?.team === 'Accounting') {
    return 1.1;
  }
  
  return 1.0;
};

// Mock SA job data for testing the new calculation
export const mockSaJobs: SaJob[] = [
  // Jobs with good data and filed in correct months
  { 
    id: '1', 
    dataDate: new Date(2023, 3, 10), // Apr 10, 2023
    chaseEvents: [],
    submittedDate: new Date(2023, 3, 25) // Apr 25, 2023
  },
  { 
    id: '2', 
    dataDate: new Date(2023, 4, 5), // May 5, 2023
    chaseEvents: [],
    submittedDate: new Date(2023, 4, 20) // May 20, 2023
  },
  // Jobs with good data but filed late
  { 
    id: '3', 
    dataDate: new Date(2023, 3, 10), // Apr 10, 2023
    chaseEvents: [],
    submittedDate: new Date(2023, 5, 15) // Jun 15, 2023
  },
  // Jobs with too many chases after Nov 30
  { 
    id: '4', 
    dataDate: new Date(2023, 9, 1), // Oct 1, 2023
    chaseEvents: [
      new Date(2023, 11, 5), // Dec 5, 2023
      new Date(2023, 11, 10), // Dec 10, 2023
      new Date(2023, 11, 15), // Dec 15, 2023
      new Date(2023, 11, 20), // Dec 20, 2023
      new Date(2023, 11, 25), // Dec 25, 2023
      new Date(2023, 11, 30), // Dec 30, 2023
      new Date(2024, 0, 5),   // Jan 5, 2024
      new Date(2024, 0, 10),  // Jan 10, 2024
      new Date(2024, 0, 15),  // Jan 15, 2024
      new Date(2024, 0, 20),  // Jan 20, 2024
      // 10 more chase events after Nov 30
      new Date(2024, 0, 21),
      new Date(2024, 0, 22),
      new Date(2024, 0, 23),
      new Date(2024, 0, 24),
      new Date(2024, 0, 25),
      new Date(2024, 0, 26),
      new Date(2024, 0, 27),
      new Date(2024, 0, 28),
      new Date(2024, 0, 29),
      new Date(2024, 0, 30)
    ],
    submittedDate: new Date(2024, 0, 31) // Jan 31, 2024
  },
  // Additional jobs to simulate realistic data
  { 
    id: '5', 
    dataDate: new Date(2023, 6, 15), // Jul 15, 2023
    chaseEvents: [],
    submittedDate: new Date(2023, 10, 10) // Nov 10, 2023
  },
  { 
    id: '6', 
    dataDate: new Date(2023, 7, 20), // Aug 20, 2023
    chaseEvents: [],
    submittedDate: new Date(2023, 11, 5) // Dec 5, 2023
  },
  { 
    id: '7', 
    dataDate: new Date(2023, 8, 5), // Sep 5, 2023
    chaseEvents: [],
    submittedDate: new Date(2024, 0, 15) // Jan 15, 2024
  }
];

// Calculate SA points based on the screenshot
export const calculateSaPoints = (percentage: number): number => {
  if (percentage >= 90) return 30;
  if (percentage >= 80) return 25.5;
  if (percentage >= 70) return 19.5;
  if (percentage >= 60) return 10.5;
  return 0;
};

// Calculate SA monthly points according to the screenshot rules
export const calculateSaMonthlyPoints = (
  jobs: SaJob[],
  month: string,  // e.g. 'Apr', 'May', etc.
  year: number = new Date().getFullYear()
): number => {
  // Get the cumulative target date for this month
  const monthIndex = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'].indexOf(month);
  if (monthIndex === -1) return 0;

  // Filter jobs that are in-control (data date is at least 10 WD before the month's cumulative target)
  // and exclude jobs with ≥20 chases after Nov 30
  const nov30 = new Date(year, 10, 30); // Month is 0-indexed, so 10 is November
  
  const inControlJobs = jobs.filter(job => {
    // Check if job has less than 20 chases after Nov 30
    const chasesAfterNov30 = job.chaseEvents.filter(date => date > nov30).length;
    if (chasesAfterNov30 >= 20) return false;
    
    // Check if job has full data in ≥10 WD before month's cumulative target
    // In a real implementation, would need to calculate working days properly
    // For this example, we'll use a simple 14 calendar days as approximation for 10 WD
    const targetDate = new Date(year, monthIndex, 1); // First day of the target month
    const requiredDataDate = new Date(targetDate);
    requiredDataDate.setDate(requiredDataDate.getDate() - 14); // Roughly 10 working days
    
    return job.dataDate <= requiredDataDate;
  });
  
  if (inControlJobs.length === 0) return 0;
  
  // Calculate filed percentage - jobs submitted in the target month
  const filedJobs = inControlJobs.filter(job => {
    if (!job.submittedDate) return false;
    const submittedMonth = job.submittedDate.toLocaleString('default', { month: 'short' });
    return submittedMonth.substring(0, 3) === month;
  });
  
  const filedPercentage = (filedJobs.length / inControlJobs.length) * 100;
  
  return calculateSaPoints(filedPercentage);
};

// Calculate the 3-month average for SA returns
export const calculateSaThreeMonthAverage = (
  jobs: SaJob[],
  year: number = new Date().getFullYear()
): number => {
  // Get the last three months of the SA season (Nov, Dec, Jan) by default
  const months = ['Nov', 'Dec', 'Jan'];
  
  const monthlyPoints = months.map(month => 
    calculateSaMonthlyPoints(jobs, month, year)
  );
  
  const average = monthlyPoints.reduce((sum, points) => sum + points, 0) / 3;
  
  return average;
};

// Team capacity and capability factors for allocating work
export interface TeamCapacity {
  teamName: string;
  capacityWeight: number; // Weight factor for allocating SA returns (1.0 is baseline)
  saEfficiencyFactor: number; // How efficiently the team handles SA returns (1.0 is baseline)
  accountsEfficiencyFactor: number; // How efficiently the team handles accounts (1.0 is baseline)
  vatEfficiencyFactor: number; // How efficiently the team handles VAT (1.0 is baseline)
}

// Team capacity configuration
export const teamCapacities: TeamCapacity[] = [
  {
    teamName: 'Accounting',
    capacityWeight: 1.2, // 20% more capacity than baseline
    saEfficiencyFactor: 0.95, // 5% less efficient on SA returns
    accountsEfficiencyFactor: 1.15, // 15% more efficient on accounts
    vatEfficiencyFactor: 1.0, // Average on VAT
  },
  {
    teamName: 'Tax',
    capacityWeight: 0.8, // 20% less capacity than baseline
    saEfficiencyFactor: 1.2, // 20% more efficient on SA returns
    accountsEfficiencyFactor: 0.9, // 10% less efficient on accounts
    vatEfficiencyFactor: 1.1, // 10% more efficient on VAT
  }
];

// Get team capacity data
export const getTeamCapacity = (teamName: string): TeamCapacity | undefined => {
  return teamCapacities.find(team => team.teamName === teamName);
};

// Calculate weighted distribution of SA returns
export const calculateWeightedSaDistribution = (totalReturns: number): Record<string, number> => {
  const distribution: Record<string, number> = {};
  
  // Calculate total weighted capacity
  const totalWeightedCapacity = teamCapacities.reduce(
    (sum, team) => sum + team.capacityWeight,
    0
  );
  
  // Distribute returns based on weighted capacity
  teamCapacities.forEach(team => {
    const teamShare = Math.round((team.capacityWeight / totalWeightedCapacity) * totalReturns);
    distribution[team.teamName] = teamShare;
  });
  
  // Ensure the sum matches total returns (adjust largest team if needed)
  const allocatedTotal = Object.values(distribution).reduce((sum, count) => sum + count, 0);
  const difference = totalReturns - allocatedTotal;
  
  if (difference !== 0) {
    // Find team with largest allocation to adjust
    const largestTeam = teamCapacities.reduce(
      (largest, current) => 
        (distribution[current.teamName] > distribution[largest.teamName]) 
          ? current 
          : largest,
      teamCapacities[0]
    );
    
    distribution[largestTeam.teamName] += difference;
  }
  
  return distribution;
};

// Forecast SA completion based on current progress
export interface SaForecast {
  forecastedCompletion: number; // Forecasted completion percentage by end of tax season
  expectedMonthlyCompletions: { month: string; expected: number }[]; // Expected monthly completions
  isOnTrack: boolean; // Whether current pace will meet target
  requiredMonthlyRate: number; // Required monthly completion rate to hit target
  projectedShortfall: number; // Projected shortfall in jobs if current pace continues
}

// Calculate forecasted SA completion
export const forecastSaCompletion = (saData: SaTarget[], teamName?: string): SaForecast => {
  // Get current month index
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  
  // Default to overall forecast if no team specified
  if (!teamName) {
    // Calculate current completion rate (jobs per month)
    const completedJobs = saData.reduce((sum, month) => sum + month.jobsCompleted, 0);
    const totalJobs = saData[0].totalJobs;
    
    // Find the last month with data
    const lastMonthWithData = [...saData]
      .sort((a, b) => {
        const monthA = new Date(0, getMonthIndex(a.month)).getTime();
        const monthB = new Date(0, getMonthIndex(b.month)).getTime();
        return monthB - monthA;
      })
      .find(month => month.jobsCompleted > 0);
    
    if (!lastMonthWithData) {
      // No data yet, can't forecast
      return {
        forecastedCompletion: 0,
        expectedMonthlyCompletions: [],
        isOnTrack: false,
        requiredMonthlyRate: totalJobs / saData.length,
        projectedShortfall: totalJobs
      };
    }
    
    // Calculate average monthly completion rate based on months with data
    const monthsWithData = saData.filter(month => month.jobsCompleted > 0).length;
    const avgMonthlyRate = completedJobs / monthsWithData;
    
    // Calculate months remaining
    const lastMonth = getMonthIndex('January'); // January is the end of SA season
    let monthsRemaining = (lastMonth - currentMonth + 12) % 12;
    if (monthsRemaining === 0) monthsRemaining = 12; // If it's January, we have a full year
    
    // Project final completion
    const projectedAdditionalJobs = avgMonthlyRate * monthsRemaining;
    const projectedTotalJobs = completedJobs + projectedAdditionalJobs;
    const forecastedCompletion = Math.min(100, (projectedTotalJobs / totalJobs) * 100);
    
    // Calculate if on track to meet 100% target
    const isOnTrack = forecastedCompletion >= 99; // Allow for small rounding differences
    
    // Calculate required rate to complete all jobs
    const remainingJobs = totalJobs - completedJobs;
    const requiredMonthlyRate = monthsRemaining > 0 ? remainingJobs / monthsRemaining : remainingJobs;
    
    // Calculate projected shortfall
    const projectedShortfall = Math.max(0, totalJobs - projectedTotalJobs);
    
    // Generate expected monthly completions
    const expectedMonthlyCompletions: { month: string; expected: number }[] = [];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    let runningTotal = completedJobs;
    for (let i = 0; i < monthsRemaining; i++) {
      const monthIndex = (currentMonth + i + 1) % 12;
      runningTotal += avgMonthlyRate;
      expectedMonthlyCompletions.push({
        month: monthNames[monthIndex],
        expected: Math.min(totalJobs, Math.round(runningTotal))
      });
    }
    
    return {
      forecastedCompletion: Math.round(forecastedCompletion * 10) / 10, // Round to 1 decimal
      expectedMonthlyCompletions,
      isOnTrack,
      requiredMonthlyRate: Math.round(requiredMonthlyRate),
      projectedShortfall: Math.round(projectedShortfall)
    };
  } 
  // Team-specific forecast
  else {
    // Get team data
    const teamData = saData.map(month => {
      const teamMonth = month.teamBreakdown?.find(t => t.teamName === teamName);
      return {
        month: month.month,
        jobsCompleted: teamMonth?.jobsCompleted || 0,
        targetJobs: teamMonth?.targetJobs || 0
      };
    });
    
    // Calculate current completion rate (jobs per month)
    const completedJobs = teamData.reduce((sum, month) => sum + month.jobsCompleted, 0);
    const totalJobs = teamData[0].targetJobs;
    
    // Find the last month with data
    const lastMonthWithData = [...teamData]
      .sort((a, b) => {
        const monthA = new Date(0, getMonthIndex(a.month)).getTime();
        const monthB = new Date(0, getMonthIndex(b.month)).getTime();
        return monthB - monthA;
      })
      .find(month => month.jobsCompleted > 0);
    
    if (!lastMonthWithData) {
      // No data yet, can't forecast
      return {
        forecastedCompletion: 0,
        expectedMonthlyCompletions: [],
        isOnTrack: false,
        requiredMonthlyRate: totalJobs / teamData.length,
        projectedShortfall: totalJobs
      };
    }
    
    // Calculate average monthly completion rate based on months with data
    const monthsWithData = teamData.filter(month => month.jobsCompleted > 0).length;
    const avgMonthlyRate = completedJobs / monthsWithData;
    
    // Calculate months remaining
    const lastMonth = getMonthIndex('January'); // January is the end of SA season
    let monthsRemaining = (lastMonth - currentMonth + 12) % 12;
    if (monthsRemaining === 0) monthsRemaining = 12; // If it's January, we have a full year
    
    // Project final completion
    const projectedAdditionalJobs = avgMonthlyRate * monthsRemaining;
    const projectedTotalJobs = completedJobs + projectedAdditionalJobs;
    const forecastedCompletion = Math.min(100, (projectedTotalJobs / totalJobs) * 100);
    
    // Calculate if on track to meet 100% target
    const isOnTrack = forecastedCompletion >= 99; // Allow for small rounding differences
    
    // Calculate required rate to complete all jobs
    const remainingJobs = totalJobs - completedJobs;
    const requiredMonthlyRate = monthsRemaining > 0 ? remainingJobs / monthsRemaining : remainingJobs;
    
    // Calculate projected shortfall
    const projectedShortfall = Math.max(0, totalJobs - projectedTotalJobs);
    
    // Generate expected monthly completions
    const expectedMonthlyCompletions: { month: string; expected: number }[] = [];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    let runningTotal = completedJobs;
    for (let i = 0; i < monthsRemaining; i++) {
      const monthIndex = (currentMonth + i + 1) % 12;
      runningTotal += avgMonthlyRate;
      expectedMonthlyCompletions.push({
        month: monthNames[monthIndex],
        expected: Math.min(totalJobs, Math.round(runningTotal))
      });
    }
    
    return {
      forecastedCompletion: Math.round(forecastedCompletion * 10) / 10, // Round to 1 decimal
      expectedMonthlyCompletions,
      isOnTrack,
      requiredMonthlyRate: Math.round(requiredMonthlyRate),
      projectedShortfall: Math.round(projectedShortfall)
    };
  }
};

// Helper function to get month index from name
export const getMonthIndex = (monthName: string): number => {
  const months = {
    'January': 0,
    'February': 1,
    'March': 2,
    'April': 3,
    'May': 4,
    'June': 5,
    'July': 6,
    'August': 7,
    'September': 8,
    'October': 9,
    'November': 10,
    'December': 11
  };
  
  return months[monthName as keyof typeof months] || 0;
};
