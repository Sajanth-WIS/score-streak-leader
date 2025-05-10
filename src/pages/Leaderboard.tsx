import { useState } from "react";
import { 
  mockStaffMembers, 
  mockKpiScores, 
  processKpiScores,
  getTeamPerformance,
  TeamPerformance
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award } from "lucide-react";

const Leaderboard = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>("latest");
  const [viewType, setViewType] = useState<"individual" | "team">("individual");
  
  // Get unique months from KPI scores
  const months = [...new Set(mockKpiScores.map(score => score.month))].sort().reverse();
  const latestMonth = months[0];
  
  // Get team performance data
  const teamPerformance = getTeamPerformance();
  
  // Filter KPI scores by selected month for individual view
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
      team: staffMember?.team || 'Unknown'
    };
  });
  
  // Get team data for selected month
  const teamData = viewType === "team" ? 
    teamPerformance.teams.map(team => ({
      ...team,
      // Find history entry for selected month or use latest
      ...((selectedMonth === "latest" 
        ? team.history.find(h => h.month === latestMonth)
        : team.history.find(h => h.month === selectedMonth)) || team)
    })).sort((a, b) => b.totalPoints - a.totalPoints) : [];
  
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
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Tabs value={viewType} onValueChange={(value) => setViewType(value as "individual" | "team")}>
            <TabsList>
              <TabsTrigger value="individual">Individual</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Select
            value={selectedMonth}
            onValueChange={(value) => setSelectedMonth(value)}
          >
            <SelectTrigger className="w-[180px]">
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
            {viewType === "individual" ? "Individual" : "Team"} Performance Rankings - {selectedMonth === "latest" 
              ? new Date(latestMonth).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
              : new Date(selectedMonth).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viewType === "individual" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Team</TableHead>
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
                    <TableCell>{score.team}</TableCell>
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
          )}
          
          {viewType === "team" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Rank</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-center">Members</TableHead>
                  <TableHead className="text-center">Accounts</TableHead>
                  <TableHead className="text-center">VAT</TableHead>
                  <TableHead className="text-center">SA</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-right">Team Bonus</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamData.map((team, index) => (
                  <TableRow key={team.name}>
                    <TableCell className="font-medium flex items-center gap-2">
                      {getTrophyIcon(index)}
                      {index + 1}
                    </TableCell>
                    <TableCell>{team.name}</TableCell>
                    <TableCell className="text-center">{team.memberCount}</TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium">{team.accountsPoints}</span>
                      <span className="text-xs text-muted-foreground"> ({team.accounts.toFixed(1)}%)</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium">{team.vatPoints}</span>
                      <span className="text-xs text-muted-foreground"> ({team.vat.toFixed(1)}%)</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium">{team.saPoints}</span>
                      <span className="text-xs text-muted-foreground"> ({team.sa.toFixed(1)}%)</span>
                    </TableCell>
                    <TableCell className="text-center font-bold">{team.totalPoints}</TableCell>
                    <TableCell className="text-right">LKR {team.totalBonus.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                
                {teamData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No team data available for the selected month.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;
