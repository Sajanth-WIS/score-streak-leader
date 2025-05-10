
import { useState } from "react";
import { 
  mockStaffMembers, 
  mockKpiScores, 
  processKpiScores,
  StaffMember,
  KpiScore 
} from "@/lib/kpi-data";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Award } from "lucide-react";

const Leaderboard = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>("latest");
  
  // Get unique months from KPI scores
  const months = [...new Set(mockKpiScores.map(score => score.month))].sort().reverse();
  const latestMonth = months[0];
  
  // Filter KPI scores by selected month
  const filteredScores = mockKpiScores.filter(score => {
    if (selectedMonth === "latest") {
      return score.month === latestMonth;
    }
    return score.month === selectedMonth;
  });
  
  // Process scores to include points
  const processedScores = processKpiScores(filteredScores);
  
  // Sort by total points (highest first)
  const sortedScores = [...processedScores].sort((a, b) => 
    (b.totalPoints || 0) - (a.totalPoints || 0)
  );
  
  // Map staff IDs to staff details
  const staffScores = sortedScores.map(score => {
    const staffMember = mockStaffMembers.find(staff => staff.id === score.staffId);
    return {
      ...score,
      staffName: staffMember?.name || 'Unknown',
      department: staffMember?.department || 'Unknown'
    };
  });
  
  // Helper function to get trophy icon for top 3
  const getTrophyIcon = (index: number) => {
    if (index === 0) return <div className="bg-badge-gold text-white p-1 rounded-full"><Award size={16} /></div>;
    if (index === 1) return <div className="bg-badge-silver text-white p-1 rounded-full"><Award size={16} /></div>;
    if (index === 2) return <div className="bg-badge-bronze text-white p-1 rounded-full"><Award size={16} /></div>;
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Leaderboard</h2>
          <p className="text-muted-foreground">Compare performance across the team.</p>
        </div>
        
        <div className="w-full sm:w-48">
          <Select
            value={selectedMonth}
            onValueChange={(value) => setSelectedMonth(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest Month</SelectItem>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {new Date(month).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>
            Performance Rankings - {selectedMonth === "latest" 
              ? new Date(latestMonth).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
              : new Date(selectedMonth).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Rank</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-center">Accounts</TableHead>
                <TableHead className="text-center">VAT</TableHead>
                <TableHead className="text-center">SA</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-right">Bonus</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffScores.map((score, index) => (
                <TableRow key={score.staffId}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {getTrophyIcon(index)}
                    {index + 1}
                  </TableCell>
                  <TableCell>{score.staffName}</TableCell>
                  <TableCell>{score.department}</TableCell>
                  <TableCell className="text-center">
                    <span className="font-medium">{score.accountsPoints}</span>
                    <span className="text-xs text-muted-foreground"> ({score.accounts}%)</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-medium">{score.vatPoints}</span>
                    <span className="text-xs text-muted-foreground"> ({score.vat}%)</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-medium">{score.saPoints}</span>
                    <span className="text-xs text-muted-foreground"> ({score.sa}%)</span>
                  </TableCell>
                  <TableCell className="text-center font-bold">{score.totalPoints}</TableCell>
                  <TableCell className="text-right">LKR {score.bonusAmount?.toLocaleString()}</TableCell>
                </TableRow>
              ))}
              
              {staffScores.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No data available for the selected month.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;
