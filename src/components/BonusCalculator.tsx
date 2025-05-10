import { useState, useEffect, useRef } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { useBonusCalculator } from '@/hooks/use-bonus-calculator';
import { FiscalPeriod } from '@/lib/bonus-engine/types';
import { mockStaffMembers, StaffMember } from '@/lib/kpi-data';
import { v4 as uuidv4 } from 'uuid';
import { BonusHistoryTable, BonusHistoryEntry, ApprovalStatus } from './bonus/BonusHistoryTable';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Calculator, 
  Calendar, 
  DollarSign, 
  User, 
  AlertCircle, 
  FileText, 
  PieChart, 
  TrendingUp, 
  Award,
  Download
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export function BonusCalculator({ employeeId, employeeName }: { employeeId?: string, employeeName?: string }) {
  const { settings, formatCurrency } = useSettings();
  const {
    employeeData,
    bonusResult,
    validationErrors,
    fiscalPeriod,
    setFiscalPeriod,
    initializeEmployee,
    updateEmployeeData,
    updateKpiScore,
    calculateEmployeeBonus,
  } = useBonusCalculator();

  const [activeTab, setActiveTab] = useState('input');
  const [showHistory, setShowHistory] = useState(false);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>(() => {
    const currentYear = new Date().getFullYear();
    return `${currentYear}-${currentYear + 1}`;
  });
  
  // Mock fiscal years for the dropdown - in production, derive from actual data
  const fiscalYears = [
    `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    `${new Date().getFullYear() - 1}-${new Date().getFullYear()}`,
    `${new Date().getFullYear() - 2}-${new Date().getFullYear() - 1}`
  ];
  
  // Load staff list from localStorage, fallback to mock data
  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
    const stored = localStorage.getItem('staffList');
    if (stored) {
      try {
        return JSON.parse(stored) as StaffMember[];
      } catch {
        return mockStaffMembers;
      }
    }
    return mockStaffMembers;
  });
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(employeeId || null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Initialize with employee data if provided
  useEffect(() => {
    initializeEmployee(employeeId);
    if (employeeName) {
      updateEmployeeData({ name: employeeName });
      // Find staff member by ID to set the selected staff
      if (employeeId) {
        setSelectedStaffId(employeeId);
        // Also set salary from staff list
        const staff = staffList.find(s => s.id === employeeId);
        if (staff) {
          updateEmployeeData({ monthlySalary: staff.salary });
        }
      }
    }
  }, [employeeId, employeeName, staffList]);

  // Handle staff selection
  const handleStaffSelection = (staffId: string) => {
    setSelectedStaffId(staffId);
    const selectedStaff = staffList.find(staff => staff.id === staffId);
    
    if (selectedStaff) {
      updateEmployeeData({
        id: selectedStaff.id,
        name: selectedStaff.name,
        monthlySalary: selectedStaff.salary, // Use monthly salary directly
      });
    }
  };

  // Handle calculation and switch to results tab
  const handleCalculate = () => {
    const result = calculateEmployeeBonus();
    if (result) {
      setActiveTab('results');
    }
  };

  // Handle saving the bonus to history
  const handleSaveBonus = () => {
    if (!bonusResult || !employeeData) return;
    
    // Generate a unique ID for this bonus record
    const bonusId = uuidv4();
    
    // Create bonus history entry using the selected fiscal year
    const bonusEntry: BonusHistoryEntry = {
      id: bonusId,
      employeeId: employeeData.id || '',
      employeeName: employeeData.name,
      fiscalPeriod,
      fiscalYear: selectedFiscalYear, // Use the selected fiscal year
      totalScore: bonusResult.totalScore,
      bonusAmount: bonusResult.bonusAmount,
      dateCalculated: new Date().toISOString(),
      approvalStatus: "Pending Approval" as ApprovalStatus,
      kpiScores: {
        accounts: {
          average: bonusResult.accounts.averagePercentage,
          points: bonusResult.accounts.totalPoints,
        },
        vat: {
          average: bonusResult.vat.averagePercentage,
          points: bonusResult.vat.totalPoints,
        },
        sa: {
          average: bonusResult.sa.averagePercentage,
          points: bonusResult.sa.totalPoints,
        },
      },
    };
    
    // Get existing bonus history from localStorage
    let bonusHistory = [];
    const stored = localStorage.getItem('bonusHistory');
    if (stored) {
      try {
        bonusHistory = JSON.parse(stored);
      } catch (e) {
        bonusHistory = [];
      }
    }
    
    // Add new entry and save back to localStorage
    bonusHistory.push(bonusEntry);
    localStorage.setItem('bonusHistory', JSON.stringify(bonusHistory));
    
    // Show success toast and toggle history view
    toast({
      title: "Bonus Saved",
      description: `Bonus calculation for ${employeeData.name} has been saved.`,
    });
    
    setShowHistory(true);
  };

  // Function to handle PDF download
  const handleDownloadPDF = () => {
    toast({
      title: "Preparing PDF",
      description: "Your PDF is being generated..."
    });
    
    // Create a new window for the PDF content
    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    
    if (printWindow) {
      // Create a professional-looking PDF layout
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${employeeData?.name || 'Employee'} - Bonus Calculation</title>
          <style>
            @page {
              size: A4;
              margin: 1.5cm;
            }
            body {
              font-family: 'Arial', sans-serif;
              color: #333;
              line-height: 1.5;
              margin: 0;
              padding: 0;
            }
            .pdf-container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #3b82f6;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              text-align: center;
              margin-bottom: 15px;
              font-size: 24px;
              font-weight: bold;
              color: #3b82f6;
            }
            .logo span {
              background: #3b82f6;
              color: white;
              padding: 5px 10px;
              border-radius: 4px;
            }
            .document-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
              color: #111;
            }
            .employee-name {
              font-size: 20px;
              color: #444;
              margin-bottom: 5px;
            }
            .document-subtitle {
              font-size: 16px;
              color: #666;
            }
            .meta-info {
              display: flex;
              justify-content: space-between;
              margin: 20px 0;
              padding: 15px;
              background-color: #f8fafc;
              border-radius: 8px;
            }
            .meta-item {
              text-align: center;
            }
            .meta-label {
              font-size: 14px;
              color: #666;
            }
            .meta-value {
              font-size: 16px;
              font-weight: bold;
              color: #333;
            }
            .summary-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .summary-box {
              width: 48%;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .summary-box.score {
              background-color: #f0f9ff;
              border-left: 4px solid #3b82f6;
            }
            .summary-box.bonus {
              background-color: #f0fdf4;
              border-left: 4px solid #10b981;
            }
            .summary-label {
              font-size: 14px;
              color: #666;
              margin-bottom: 5px;
            }
            .summary-value {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .summary-value.score {
              color: #3b82f6;
            }
            .summary-value.bonus {
              color: #10b981;
            }
            .summary-subtext {
              font-size: 14px;
              color: #666;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              margin-top: 30px;
              margin-bottom: 15px;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
              color: #3b82f6;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th {
              background-color: #f1f5f9;
              text-align: left;
              padding: 12px;
              font-weight: bold;
              border-bottom: 2px solid #cbd5e1;
            }
            td {
              padding: 12px;
              border-bottom: 1px solid #e2e8f0;
            }
            tr:nth-child(even) {
              background-color: #f8fafc;
            }
            tr.total-row {
              background-color: #f0f9ff;
              font-weight: bold;
            }
            tr.total-row td {
              border-top: 2px solid #cbd5e1;
            }
            .progress-bar-container {
              height: 10px;
              background-color: #e2e8f0;
              border-radius: 5px;
              margin-top: 5px;
            }
            .progress-bar {
              height: 100%;
              background-color: #3b82f6;
              border-radius: 5px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            .watermark {
              position: fixed;
              bottom: 20px;
              right: 20px;
              opacity: 0.1;
              transform: rotate(-45deg);
              font-size: 100px;
              font-weight: bold;
              color: #3b82f6;
              z-index: -1;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
            .print-button {
              display: block;
              margin: 30px auto;
              padding: 10px 20px;
              background-color: #3b82f6;
              color: white;
              border: none;
              border-radius: 4px;
              font-size: 16px;
              cursor: pointer;
            }
            .print-button:hover {
              background-color: #2563eb;
            }
          </style>
        </head>
        <body>
          <div class="watermark">CONFIDENTIAL</div>
          <div class="pdf-container">
            <div class="header">
              <div class="logo"><span>KPI</span> Performance Tracker</div>
              <div class="document-title">Bonus Calculation Results</div>
              <div class="employee-name">${employeeData?.name || 'Employee'}</div>
              <div class="document-subtitle">Quarterly Performance Bonus</div>
            </div>
            
            <div class="meta-info">
              <div class="meta-item">
                <div class="meta-label">Fiscal Year</div>
                <div class="meta-value">${selectedFiscalYear}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">Fiscal Period</div>
                <div class="meta-value">${fiscalPeriod}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">Generated Date</div>
                <div class="meta-value">${new Date().toLocaleDateString()}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">Monthly Salary</div>
                <div class="meta-value">LKR ${employeeData?.monthlySalary?.toLocaleString() || 0}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">Quarterly Pool</div>
                <div class="meta-value">LKR ${bonusResult?.quarterlyPool?.toLocaleString() || 0}</div>
              </div>
            </div>
            
            <div class="summary-section">
              <div class="summary-box score">
                <div class="summary-label">Total KPI Score</div>
                <div class="summary-value score">${bonusResult?.totalScore.toFixed(1) || 0}</div>
                <div class="summary-subtext">out of 100 points</div>
                <div class="progress-bar-container">
                  <div class="progress-bar" style="width: ${bonusResult?.totalScore || 0}%;"></div>
                </div>
              </div>
              
              <div class="summary-box bonus">
                <div class="summary-label">Bonus Amount</div>
                <div class="summary-value bonus">LKR ${bonusResult?.bonusAmount.toLocaleString() || 0}</div>
                <div class="summary-subtext">${((bonusResult?.bonusPercentage || 0) * 100).toFixed(1)}% of quarterly pool</div>
              </div>
            </div>
            
            <div class="section-title">KPI Performance Details</div>
            
            <table>
              <thead>
                <tr>
                  <th>KPI Category</th>
                  <th>Weight</th>
                  <th>Average %</th>
                  <th>Points</th>
                  <th>% of Max</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Accounts Backlog</td>
                  <td>${bonusResult?.accounts.maxPoints || 0}%</td>
                  <td>${bonusResult?.accounts.averagePercentage.toFixed(1) || 0}%</td>
                  <td>${bonusResult?.accounts.totalPoints.toFixed(1) || 0}</td>
                  <td>${bonusResult?.accounts.percentage.toFixed(1) || 0}%</td>
                </tr>
                <tr>
                  <td>VAT Returns</td>
                  <td>${bonusResult?.vat.maxPoints || 0}%</td>
                  <td>${bonusResult?.vat.averagePercentage.toFixed(1) || 0}%</td>
                  <td>${bonusResult?.vat.totalPoints.toFixed(1) || 0}</td>
                  <td>${bonusResult?.vat.percentage.toFixed(1) || 0}%</td>
                </tr>
                <tr>
                  <td>SA Returns</td>
                  <td>${bonusResult?.sa.maxPoints || 0}%</td>
                  <td>${bonusResult?.sa.averagePercentage.toFixed(1) || 0}%</td>
                  <td>${bonusResult?.sa.totalPoints.toFixed(1) || 0}</td>
                  <td>${bonusResult?.sa.percentage.toFixed(1) || 0}%</td>
                </tr>
                <tr class="total-row">
                  <td>Total</td>
                  <td>100%</td>
                  <td>-</td>
                  <td>${bonusResult?.totalScore.toFixed(1) || 0}</td>
                  <td>${bonusResult?.totalScore.toFixed(1) || 0}%</td>
                </tr>
              </tbody>
            </table>
            
            <div class="section-title">Monthly Performance Breakdown</div>
            
            <table>
              <thead>
                <tr>
                  <th>KPI Category</th>
                  <th>Month 1</th>
                  <th>Month 2</th>
                  <th>Month 3</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Accounts Backlog</td>
                  ${bonusResult?.accounts.monthlyScores.map((score, i) => `
                    <td>
                      ${score.toFixed(1)}% 
                      <span style="font-size: 12px; color: #666;">
                        (${bonusResult?.accounts.monthlyPoints[i].toFixed(1) || 0} pts)
                      </span>
                    </td>
                  `).join('')}
                </tr>
                <tr>
                  <td>VAT Returns</td>
                  ${bonusResult?.vat.monthlyScores.map((score, i) => `
                    <td>
                      ${score.toFixed(1)}% 
                      <span style="font-size: 12px; color: #666;">
                        (${bonusResult?.vat.monthlyPoints[i].toFixed(1) || 0} pts)
                      </span>
                    </td>
                  `).join('')}
                </tr>
                <tr>
                  <td>SA Returns</td>
                  ${bonusResult?.sa.monthlyScores.map((score, i) => `
                    <td>
                      ${score.toFixed(1)}% 
                      <span style="font-size: 12px; color: #666;">
                        (${bonusResult?.sa.monthlyPoints[i].toFixed(1) || 0} pts)
                      </span>
                    </td>
                  `).join('')}
                </tr>
              </tbody>
            </table>
            
            <button class="print-button no-print" onclick="window.print(); return false;">
              Print / Save as PDF
            </button>
            
            <div class="footer">
              <p>This document is confidential and intended for internal use only.</p>
              <p>Generated from KPI Performance Tracker on ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      // Write the content to the new window
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Focus on the new window
      printWindow.focus();
      
      // Show success message
      toast({
        title: "PDF Ready",
        description: "Your professional PDF has been prepared. Use the Print button to save as PDF."
      });
    } else {
      toast({
        title: "Error",
        description: "Could not open print window. Please check your browser settings.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:w-[400px]">
          <TabsTrigger value="input" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>KPI Input</span>
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2" disabled={!bonusResult}>
            <PieChart className="h-4 w-4" />
            <span>Results</span>
          </TabsTrigger>
        </TabsList>

        {/* Input Tab */}
        <TabsContent value="input">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Bonus Calculator
              </CardTitle>
              <CardDescription>
                Enter employee information and KPI scores to calculate quarterly bonus
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Employee Info Section */}
              <div className="space-y-4">
                <div className="text-sm font-medium flex items-center gap-2 text-primary">
                  <User className="h-4 w-4" />
                  Employee Information
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee-select">Staff Member</Label>
                    <Select
                      value={selectedStaffId || ""}
                      onValueChange={handleStaffSelection}
                      disabled={!!employeeName}
                    >
                      <SelectTrigger className="transition-all duration-200 focus:border-primary">
                        <SelectValue placeholder="Select a staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        {staffList.map(staff => (
                          <SelectItem key={staff.id} value={staff.id}>
                            {staff.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthly-salary">Monthly Salary</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">LKR</span>
                      <Input
                        id="monthly-salary"
                        type="number"
                        value={employeeData?.monthlySalary || ''}
                        onChange={(e) => updateEmployeeData({ 
                          monthlySalary: parseFloat(e.target.value) || 0 
                        })}
                        placeholder="0.00"
                        className="pl-14 transition-all duration-200 focus:border-primary"
                        disabled={!!selectedStaffId}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fiscal-year">Fiscal Year</Label>
                    <Select
                      value={selectedFiscalYear}
                      onValueChange={setSelectedFiscalYear}
                    >
                      <SelectTrigger id="fiscal-year" className="transition-all duration-200 focus:border-primary">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Select fiscal year" />
                      </SelectTrigger>
                      <SelectContent>
                        {fiscalYears.map(year => (
                          <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fiscal-period">Fiscal Period</Label>
                    <Select
                      value={fiscalPeriod}
                      onValueChange={(value) => setFiscalPeriod(value as FiscalPeriod)}
                    >
                      <SelectTrigger id="fiscal-period" className="transition-all duration-200 focus:border-primary">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Select fiscal period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={FiscalPeriod.Q1}>Q1 (Apr-Jun)</SelectItem>
                        <SelectItem value={FiscalPeriod.Q2}>Q2 (Jul-Sep)</SelectItem>
                        <SelectItem value={FiscalPeriod.Q3}>Q3 (Oct-Dec)</SelectItem>
                        <SelectItem value={FiscalPeriod.Q4}>Q4 (Jan-Mar)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* KPI Scores Section */}
              <div className="space-y-4">
                <div className="text-sm font-medium flex items-center gap-2 text-primary">
                  <TrendingUp className="h-4 w-4" />
                  KPI Scores (Monthly %)
                </div>

                <div className="border rounded-md p-4 space-y-6">
                  {/* Accounts KPI */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">
                      Accounts Backlog ({settings.kpiCalculation.accountsWeight}%)
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[0, 1, 2].map((month) => (
                        <div key={`accounts-${month}`} className="space-y-1">
                          <Label htmlFor={`accounts-${month}`} className="text-xs text-muted-foreground">
                            Month {month + 1}
                          </Label>
                          <div className="relative">
                            <Input
                              id={`accounts-${month}`}
                              type="number"
                              min="0"
                              max="100"
                              value={employeeData?.kpiScores?.accounts?.[month] || ''}
                              onChange={(e) => updateKpiScore(
                                'accounts',
                                month,
                                Math.min(100, Math.max(0, parseFloat(e.target.value) || 0))
                              )}
                              placeholder="0-100"
                              className="pr-8 transition-all duration-200 focus:border-primary"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                              %
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* VAT KPI */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">
                      VAT Returns ({settings.kpiCalculation.vatWeight}%)
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[0, 1, 2].map((month) => (
                        <div key={`vat-${month}`} className="space-y-1">
                          <Label htmlFor={`vat-${month}`} className="text-xs text-muted-foreground">
                            Month {month + 1}
                          </Label>
                          <div className="relative">
                            <Input
                              id={`vat-${month}`}
                              type="number"
                              min="0"
                              max="100"
                              value={employeeData?.kpiScores?.vat?.[month] || ''}
                              onChange={(e) => updateKpiScore(
                                'vat',
                                month,
                                Math.min(100, Math.max(0, parseFloat(e.target.value) || 0))
                              )}
                              placeholder="0-100"
                              className="pr-8 transition-all duration-200 focus:border-primary"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                              %
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SA KPI */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">
                      SA Returns ({settings.kpiCalculation.saWeight}%)
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[0, 1, 2].map((month) => (
                        <div key={`sa-${month}`} className="space-y-1">
                          <Label htmlFor={`sa-${month}`} className="text-xs text-muted-foreground">
                            Month {month + 1}
                          </Label>
                          <div className="relative">
                            <Input
                              id={`sa-${month}`}
                              type="number"
                              min="0"
                              max="100"
                              value={employeeData?.kpiScores?.sa?.[month] || ''}
                              onChange={(e) => updateKpiScore(
                                'sa',
                                month,
                                Math.min(100, Math.max(0, parseFloat(e.target.value) || 0))
                              )}
                              placeholder="0-100"
                              className="pr-8 transition-all duration-200 focus:border-primary"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                              %
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>

            <CardFooter>
              <Button 
                onClick={handleCalculate} 
                className="w-full bg-primary hover:bg-primary/90 transition-all duration-300"
              >
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Bonus
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results">
          {bonusResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Bonus Calculation Results
                </CardTitle>
                <CardDescription>
                  {employeeData?.name}'s quarterly performance bonus
                </CardDescription>
              </CardHeader>

              <CardContent id="bonus-results" className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-lg p-4 bg-muted/20">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total KPI Score</p>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold">{bonusResult.totalScore.toFixed(1)}</span>
                      <span className="text-lg text-muted-foreground">/100 points</span>
                    </div>
                    <Progress value={bonusResult.totalScore} className="h-2 mt-2" />
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Bonus Amount</p>
                    <p className="text-3xl font-bold">{formatCurrency(bonusResult.bonusAmount)}</p>
                    <p className="text-sm text-muted-foreground">
                      {(bonusResult.bonusPercentage * 100).toFixed(1)}% of quarterly pool 
                      ({formatCurrency(bonusResult.quarterlyPool)})
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Fiscal Year</p>
                    <p className="text-lg font-semibold">{selectedFiscalYear}</p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Fiscal Period</p>
                    <p className="text-lg font-semibold">{fiscalPeriod}</p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Calculation Date</p>
                    <p className="text-lg font-semibold">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Detailed KPI Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>KPI Category</TableHead>
                        <TableHead>Weight</TableHead>
                        <TableHead>Average %</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead>% of Max</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Accounts Backlog</TableCell>
                        <TableCell>{bonusResult.accounts.maxPoints}%</TableCell>
                        <TableCell>{bonusResult.accounts.averagePercentage.toFixed(1)}%</TableCell>
                        <TableCell>{bonusResult.accounts.totalPoints.toFixed(1)}</TableCell>
                        <TableCell>{bonusResult.accounts.percentage.toFixed(1)}%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">VAT Returns</TableCell>
                        <TableCell>{bonusResult.vat.maxPoints}%</TableCell>
                        <TableCell>{bonusResult.vat.averagePercentage.toFixed(1)}%</TableCell>
                        <TableCell>{bonusResult.vat.totalPoints.toFixed(1)}</TableCell>
                        <TableCell>{bonusResult.vat.percentage.toFixed(1)}%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">SA Returns</TableCell>
                        <TableCell>{bonusResult.sa.maxPoints}%</TableCell>
                        <TableCell>{bonusResult.sa.averagePercentage.toFixed(1)}%</TableCell>
                        <TableCell>{bonusResult.sa.totalPoints.toFixed(1)}</TableCell>
                        <TableCell>{bonusResult.sa.percentage.toFixed(1)}%</TableCell>
                      </TableRow>
                      <TableRow className="bg-muted/20 font-medium">
                        <TableCell>Total</TableCell>
                        <TableCell>100%</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>{bonusResult.totalScore.toFixed(1)}</TableCell>
                        <TableCell>{bonusResult.totalScore.toFixed(1)}%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Monthly Breakdown */}
                <div className="space-y-3">
                  <h3 className="text-lg font-medium">Monthly Performance Breakdown</h3>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>KPI Category</TableHead>
                        <TableHead>Month 1</TableHead>
                        <TableHead>Month 2</TableHead>
                        <TableHead>Month 3</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Accounts Backlog</TableCell>
                        {bonusResult.accounts.monthlyScores.map((score, i) => (
                          <TableCell key={`accounts-score-${i}`}>
                            {score.toFixed(1)}% 
                            <span className="text-xs text-muted-foreground ml-1">
                              ({bonusResult.accounts.monthlyPoints[i].toFixed(1)} pts)
                            </span>
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">VAT Returns</TableCell>
                        {bonusResult.vat.monthlyScores.map((score, i) => (
                          <TableCell key={`vat-score-${i}`}>
                            {score.toFixed(1)}%
                            <span className="text-xs text-muted-foreground ml-1">
                              ({bonusResult.vat.monthlyPoints[i].toFixed(1)} pts)
                            </span>
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">SA Returns</TableCell>
                        {bonusResult.sa.monthlyScores.map((score, i) => (
                          <TableCell key={`sa-score-${i}`}>
                            {score.toFixed(1)}%
                            <span className="text-xs text-muted-foreground ml-1">
                              ({bonusResult.sa.monthlyPoints[i].toFixed(1)} pts)
                            </span>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab('input')}>
                  Edit Inputs
                </Button>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={handleDownloadPDF} 
                    className="transition-all duration-200 hover:border-primary hover:bg-primary/5"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button 
                    onClick={handleSaveBonus}
                    disabled={!bonusResult}
                    className="bg-company-primary hover:bg-company-secondary"
                  >
                    Save Bonus Result
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Show the bonus history table conditionally */}
      {showHistory && (
        <div className="mt-8">
          <BonusHistoryTable employeeId={employeeId} />
        </div>
      )}
    </div>
  );
} 