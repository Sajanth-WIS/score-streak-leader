import { useState, useEffect } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { FiscalPeriod } from "@/lib/bonus-engine/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Eye, MoreHorizontal, FileText, Trash2, CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { BonusDetailsDialog } from "./BonusDetailsDialog";

// Approval status type
export type ApprovalStatus = "Pending Approval" | "Approved" | "Rejected";

// Interface for saved bonus history entry
export interface BonusHistoryEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  fiscalPeriod: FiscalPeriod;
  fiscalYear: string; // e.g. "2023-2024"
  totalScore: number;
  bonusAmount: number;
  dateCalculated: string; // ISO date string
  lastUpdated?: string; // ISO date string
  approvalStatus?: ApprovalStatus; // New field for approval status
  kpiScores: {
    accounts: {
      average: number;
      points: number;
    };
    vat: {
      average: number;
      points: number;
    };
    sa: {
      average: number;
      points: number;
    };
  };
}

// Props for the component
interface BonusHistoryTableProps {
  employeeId?: string; // Optional filtering by employee
  initialYear?: string; // Optional initial year filter
  initialQuarter?: string; // Optional initial quarter filter
}

export function BonusHistoryTable({ 
  employeeId,
  initialYear = "all",
  initialQuarter = "all"
}: BonusHistoryTableProps) {
  const { formatCurrency } = useSettings();
  const [selectedYear, setSelectedYear] = useState<string>(initialYear);
  const [selectedQuarter, setSelectedQuarter] = useState<string>(initialQuarter);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedBonus, setSelectedBonus] = useState<BonusHistoryEntry | null>(null);

  // Update filters when props change
  useEffect(() => {
    if (initialYear) {
      setSelectedYear(initialYear);
    }
    if (initialQuarter) {
      setSelectedQuarter(initialQuarter);
    }
  }, [initialYear, initialQuarter]);

  // Mock fiscal years for the dropdown - in production, derive from actual data
  const fiscalYears = ["2023-2024", "2022-2023", "2021-2022"];
  
  // Load bonus history from localStorage, use empty array as fallback
  const [bonusHistory, setBonusHistory] = useState<BonusHistoryEntry[]>(() => {
    const stored = localStorage.getItem("bonusHistory");
    if (stored) {
      try {
        // Initialize approval status for any records without one
        const history = JSON.parse(stored) as BonusHistoryEntry[];
        return history.map(entry => ({
          ...entry,
          approvalStatus: entry.approvalStatus || "Pending Approval"
        }));
      } catch {
        return [];
      }
    }
    return [];
  });

  // Filter history based on selected criteria
  const filteredHistory = bonusHistory.filter((entry) => {
    // Filter by employee if specified
    if (employeeId && entry.employeeId !== employeeId) {
      return false;
    }
    
    // Filter by selected fiscal year
    if (selectedYear !== "all" && entry.fiscalYear !== selectedYear) {
      return false;
    }
    
    // Filter by selected quarter
    if (selectedQuarter !== "all" && entry.fiscalPeriod !== selectedQuarter) {
      return false;
    }
    
    return true;
  });

  // View details of a bonus calculation
  const viewBonusDetails = (bonus: BonusHistoryEntry) => {
    setSelectedBonus(bonus);
    setDetailsOpen(true);
  };

  // Download bonus as PDF
  const downloadBonusPdf = (bonus: BonusHistoryEntry) => {
    toast({
      title: "Downloading PDF",
      description: `Bonus calculation for ${bonus.employeeName} - ${bonus.fiscalYear} ${bonus.fiscalPeriod}`
    });
    // Actual PDF generation would be implemented here
  };

  // Delete a bonus record
  const deleteBonus = (bonus: BonusHistoryEntry) => {
    if (confirm(`Are you sure you want to delete the bonus record for ${bonus.employeeName} (${bonus.fiscalYear} ${bonus.fiscalPeriod})?`)) {
      const updatedHistory = bonusHistory.filter(entry => entry.id !== bonus.id);
      setBonusHistory(updatedHistory);
      localStorage.setItem("bonusHistory", JSON.stringify(updatedHistory));
      
      toast({
        title: "Bonus Record Deleted",
        description: `The bonus record for ${bonus.employeeName} has been deleted.`
      });
    }
  };

  // Update the approval status
  const updateApprovalStatus = (bonus: BonusHistoryEntry, status: ApprovalStatus) => {
    const updatedHistory = bonusHistory.map(entry => 
      entry.id === bonus.id 
        ? { ...entry, approvalStatus: status, lastUpdated: new Date().toISOString() } 
        : entry
    );
    
    setBonusHistory(updatedHistory);
    localStorage.setItem("bonusHistory", JSON.stringify(updatedHistory));
    
    toast({
      title: `Status Updated: ${status}`,
      description: `The bonus for ${bonus.employeeName} has been ${status.toLowerCase()}.`
    });
  };

  // Get badge color based on score
  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return "default";
    if (score >= 75) return "default";
    if (score >= 60) return "secondary";
    return "outline";
  };

  // Get badge for approval status
  const getApprovalBadge = (status: ApprovalStatus) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
      case "Rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline" className="text-amber-500 border-amber-500"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Bonus History</CardTitle>
        <CardDescription>
          View and manage saved bonus calculations for employees
        </CardDescription>
        
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Select
            value={selectedYear}
            onValueChange={setSelectedYear}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Fiscal Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fiscal Years</SelectItem>
              {fiscalYears.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={selectedQuarter}
            onValueChange={setSelectedQuarter}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
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
      </CardHeader>
      <CardContent>
        {filteredHistory.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-center">KPI Score</TableHead>
                  <TableHead className="text-right">Bonus Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Date Saved</TableHead>
                  <TableHead aria-label="Actions" className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((bonus) => (
                  <TableRow key={bonus.id}>
                    <TableCell className="font-medium">{bonus.employeeName}</TableCell>
                    <TableCell>
                      {bonus.fiscalYear} {bonus.fiscalPeriod}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getScoreBadgeVariant(bonus.totalScore)} className="text-xs">
                        {bonus.totalScore.toFixed(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(bonus.bonusAmount)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={bonus.approvalStatus || "Pending Approval"}
                        onValueChange={(value: ApprovalStatus) => updateApprovalStatus(bonus, value)}
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                          <SelectValue>
                            {getApprovalBadge(bonus.approvalStatus || "Pending Approval")}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending Approval">
                            <span className="flex items-center">
                              <Clock className="h-3.5 w-3.5 mr-2 text-amber-500" />
                              Pending Approval
                            </span>
                          </SelectItem>
                          <SelectItem value="Approved">
                            <span className="flex items-center">
                              <CheckCircle className="h-3.5 w-3.5 mr-2 text-green-500" />
                              Approved
                            </span>
                          </SelectItem>
                          <SelectItem value="Rejected">
                            <span className="flex items-center">
                              <XCircle className="h-3.5 w-3.5 mr-2 text-red-500" />
                              Rejected
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {formatDate(bonus.dateCalculated)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => viewBonusDetails(bonus)}>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>View Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => downloadBonusPdf(bonus)}>
                            <Download className="mr-2 h-4 w-4" />
                            <span>Download PDF</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteBonus(bonus)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No bonus records found</h3>
            <p className="text-muted-foreground mt-1">
              {employeeId 
                ? "No bonus calculations have been saved for this employee yet." 
                : selectedYear !== "all" || selectedQuarter !== "all"
                  ? "No bonus records match your current filters."
                  : "Start calculating and saving employee bonuses to see them here."}
            </p>
          </div>
        )}
      </CardContent>
      
      {/* Bonus Details Dialog */}
      {selectedBonus && (
        <BonusDetailsDialog
          bonus={selectedBonus}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      )}
    </Card>
  );
} 