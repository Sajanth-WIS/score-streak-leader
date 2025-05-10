import { BonusHistoryTable } from "@/components/bonus/BonusHistoryTable";
import { mockStaffMembers } from "@/lib/kpi-data";
import { useState } from "react";
import { FiscalPeriod } from "@/lib/bonus-engine/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, FileText, Calendar, Users, History } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const BonusHistory = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedQuarter, setSelectedQuarter] = useState<string>("all");
  
  // Mock fiscal years for the dropdown - in production, derive from actual data
  const fiscalYears = ["2023-2024", "2022-2023", "2021-2022"];
  
  // Load staff list from localStorage, fallback to mock data
  const staffList = (() => {
    const stored = localStorage.getItem('staffList');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return mockStaffMembers;
      }
    }
    return mockStaffMembers;
  })();

  // Handle exporting all bonus data
  const exportAllData = () => {
    try {
      // Get the bonus history data
      const bonusHistory = localStorage.getItem('bonusHistory');
      
      if (!bonusHistory || JSON.parse(bonusHistory).length === 0) {
        toast({
          title: "No Data to Export",
          description: "There is no bonus history data to export.",
          variant: "destructive"
        });
        return;
      }
      
      // Format the data for CSV
      const bonusData = JSON.parse(bonusHistory);
      
      // Create CSV headers
      const headers = [
        "Employee Name", 
        "Fiscal Year", 
        "Quarter", 
        "KPI Score", 
        "Bonus Amount", 
        "Accounts Score", 
        "VAT Score", 
        "SA Score", 
        "Date Calculated",
        "Status"
      ];
      
      // Create CSV rows
      const rows = bonusData.map(bonus => [
        bonus.employeeName,
        bonus.fiscalYear,
        bonus.fiscalPeriod,
        bonus.totalScore.toFixed(2),
        bonus.bonusAmount.toLocaleString(),
        bonus.kpiScores.accounts.average.toFixed(2),
        bonus.kpiScores.vat.average.toFixed(2),
        bonus.kpiScores.sa.average.toFixed(2),
        new Date(bonus.dateCalculated).toLocaleDateString(),
        bonus.approvalStatus || "Pending Approval"
      ]);
      
      // Combine headers and rows
      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n");
      
      // Create a blob with the CSV data
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Create a link to download
      const link = document.createElement('a');
      const fileName = `bonus-history-export-${new Date().toISOString().slice(0, 10)}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      
      // Add to document, click and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup the URL
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: `Bonus history has been exported to ${fileName}`
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the data. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2 flex items-center gap-2">
            <History className="h-6 w-6 text-company-accent animate-pulse-badge" />
            Bonus History
          </h2>
          <p className="text-muted-foreground">
            View and manage all saved bonus calculations across employees
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={exportAllData}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export All Data
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filter Options</CardTitle>
          <CardDescription>
            Filter bonus history by employee, fiscal year and quarter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                <Users className="h-4 w-4 inline mr-1" /> Employee
              </label>
              <Select
                value={selectedEmployee}
                onValueChange={setSelectedEmployee}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {staffList.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>{staff.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                <Calendar className="h-4 w-4 inline mr-1" /> Fiscal Year
              </label>
              <Select
                value={selectedYear}
                onValueChange={setSelectedYear}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Fiscal Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fiscal Years</SelectItem>
                  {fiscalYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                <Calendar className="h-4 w-4 inline mr-1" /> Quarter
              </label>
              <Select
                value={selectedQuarter}
                onValueChange={setSelectedQuarter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Quarter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quarters</SelectItem>
                  <SelectItem value={FiscalPeriod.Q1}>Q1 (Apr-Jun)</SelectItem>
                  <SelectItem value={FiscalPeriod.Q2}>Q2 (Jul-Sep)</SelectItem>
                  <SelectItem value={FiscalPeriod.Q3}>Q3 (Oct-Dec)</SelectItem>
                  <SelectItem value={FiscalPeriod.Q4}>Q4 (Jan-Mar)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Check if there's any bonus history data in localStorage */}
      {(() => {
        const stored = localStorage.getItem('bonusHistory');
        if (!stored || JSON.parse(stored).length === 0) {
          return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium">No Bonus Records Found</h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                There are no saved bonus calculations yet. Use the Bonus Calculator to calculate and save employee bonuses.
              </p>
              <Button 
                variant="default" 
                className="mt-6"
                onClick={() => window.location.href = '/bonus-calculator'}
              >
                Go to Bonus Calculator
              </Button>
            </div>
          );
        }
        
        // Otherwise, show the BonusHistoryTable with all filters applied
        return (
          <BonusHistoryTable 
            employeeId={selectedEmployee === "all" ? undefined : selectedEmployee}
            initialYear={selectedYear}
            initialQuarter={selectedQuarter}
          />
        );
      })()}
    </div>
  );
};

export default BonusHistory; 