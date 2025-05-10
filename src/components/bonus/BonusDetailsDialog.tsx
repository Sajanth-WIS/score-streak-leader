import { useSettings } from "@/contexts/SettingsContext";
import { BonusHistoryEntry } from "./BonusHistoryTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer, CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

interface BonusDetailsDialogProps {
  bonus: BonusHistoryEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BonusDetailsDialog({ bonus, open, onOpenChange }: BonusDetailsDialogProps) {
  const { formatCurrency } = useSettings();
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get badge for approval status
  const getApprovalBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
      case "Rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline" className="text-amber-500 border-amber-500"><Clock className="h-3 w-3 mr-1" /> Pending Approval</Badge>;
    }
  };

  // Download bonus as PDF
  const downloadPdf = () => {
    toast({
      title: "Downloading PDF",
      description: `Bonus calculation for ${bonus.employeeName} - ${bonus.fiscalYear} ${bonus.fiscalPeriod}`
    });
    // Actual PDF generation would be implemented here
  };

  // Print bonus details
  const printDetails = () => {
    toast({
      title: "Printing",
      description: "Preparing bonus details for printing..."
    });
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Bonus Calculation Details</DialogTitle>
          <DialogDescription>
            {bonus.employeeName} - {bonus.fiscalYear} {bonus.fiscalPeriod}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Employee Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Name:</span>
                  <span className="font-medium">{bonus.employeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Fiscal Period:</span>
                  <span className="font-medium">{bonus.fiscalYear} {bonus.fiscalPeriod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Date Calculated:</span>
                  <span className="font-medium">{formatDate(bonus.dateCalculated)}</span>
                </div>
                {bonus.lastUpdated && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Last Updated:</span>
                    <span className="font-medium">{formatDate(bonus.lastUpdated)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1.5">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span>{getApprovalBadge(bonus.approvalStatus || "Pending Approval")}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Bonus Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total KPI Score:</span>
                  <span className="font-medium">{bonus.totalScore.toFixed(1)} / 100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Bonus Amount:</span>
                  <span className="font-medium text-lg">{formatCurrency(bonus.bonusAmount)}</span>
                </div>
                
                <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${bonus.totalScore >= 90 ? 'bg-green-500' : 
                      bonus.totalScore >= 75 ? 'bg-blue-500' : 
                      bonus.totalScore >= 60 ? 'bg-yellow-500' : 
                      'bg-red-500'}`}
                    style={{ width: `${bonus.totalScore}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* KPI Breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">KPI Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Accounts KPI */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">Accounts</div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Average Score:</span>
                    <span className="font-medium">{bonus.kpiScores.accounts.average.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Points Earned:</span>
                    <span className="font-medium">{bonus.kpiScores.accounts.points.toFixed(1)} / 40</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500"
                      style={{ width: `${(bonus.kpiScores.accounts.points / 40) * 100}%` }}
                    />
                  </div>
                </div>
                
                {/* VAT KPI */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">VAT Returns</div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Average Score:</span>
                    <span className="font-medium">{bonus.kpiScores.vat.average.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Points Earned:</span>
                    <span className="font-medium">{bonus.kpiScores.vat.points.toFixed(1)} / 30</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500"
                      style={{ width: `${(bonus.kpiScores.vat.points / 30) * 100}%` }}
                    />
                  </div>
                </div>
                
                {/* SA KPI */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">SA Returns</div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Average Score:</span>
                    <span className="font-medium">{bonus.kpiScores.sa.average.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Points Earned:</span>
                    <span className="font-medium">{bonus.kpiScores.sa.points.toFixed(1)} / 30</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500"
                      style={{ width: `${(bonus.kpiScores.sa.points / 30) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={printDetails}
              >
                <Printer className="h-3.5 w-3.5 mr-1.5" />
                Print
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="text-xs"
                onClick={downloadPdf}
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Download PDF
              </Button>
            </CardFooter>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
} 