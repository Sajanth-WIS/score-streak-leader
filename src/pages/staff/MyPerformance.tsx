
import { useAuth } from "@/contexts/AuthContext";
import { 
  getStaffKpiScores, 
  checkForBadges, 
  calculateQuarterlyBonus, 
  KpiScore 
} from "@/lib/kpi-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import BadgeDisplay from "@/components/dashboard/BadgeDisplay";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Award } from "lucide-react";

const MyPerformance = () => {
  const { user } = useAuth();
  const staffId = user?.id || '1';
  
  const kpiScores = getStaffKpiScores(staffId);
  const earnedBadges = checkForBadges(staffId);
  
  // Sort scores by date (newest first)
  const sortedScores = [...kpiScores].sort((a, b) => 
    new Date(b.month).getTime() - new Date(a.month).getTime()
  );
  
  // Calculate current quarter and year
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentQuarter = Math.ceil((now.getMonth() + 1) / 3);
  
  // Calculate previous quarters (up to 4)
  const quarters = [];
  let year = currentYear;
  let quarter = currentQuarter;
  
  for (let i = 0; i < 4; i++) {
    quarters.push({ year, quarter });
    quarter--;
    if (quarter < 1) {
      quarter = 4;
      year--;
    }
  }
  
  // Get badge level based on total points
  const getBadgeLevel = () => {
    const totalPoints = sortedScores.reduce((sum, score) => sum + (score.totalPoints || 0), 0);
    
    if (totalPoints >= 900) return { name: "Diamond", color: "bg-blue-300" };
    if (totalPoints >= 600) return { name: "Platinum", color: "bg-gray-300" };
    if (totalPoints >= 300) return { name: "Gold", color: "bg-badge-gold" };
    if (totalPoints >= 150) return { name: "Silver", color: "bg-badge-silver" };
    return { name: "Bronze", color: "bg-badge-bronze" };
  };
  
  const badgeLevel = getBadgeLevel();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">My Performance</h2>
        <p className="text-muted-foreground">Track your KPI performance and bonus history.</p>
      </div>
      
      {/* Level and Achievement Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Level</CardTitle>
            <CardDescription>Based on your cumulative points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className={`h-16 w-16 rounded-full ${badgeLevel.color} flex items-center justify-center`}>
                <Award className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{badgeLevel.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {sortedScores.reduce((sum, score) => sum + (score.totalPoints || 0), 0)} total points earned
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Earned Badges</CardTitle>
            <CardDescription>Special achievements based on performance</CardDescription>
          </CardHeader>
          <CardContent>
            {earnedBadges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {earnedBadges.map(badge => (
                  <BadgeDisplay key={badge.id} badge={badge} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No badges earned yet. Keep improving!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Performance Chart */}
      <PerformanceChart 
        data={kpiScores} 
        title="Performance History" 
      />
      
      {/* Detailed Performance History */}
      <Card>
        <CardHeader>
          <CardTitle>Performance History</CardTitle>
          <CardDescription>Monthly KPI details</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-center">Accounts</TableHead>
                <TableHead className="text-center">VAT</TableHead>
                <TableHead className="text-center">SA</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-right">Bonus</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedScores.map((score) => (
                <TableRow key={score.month}>
                  <TableCell className="font-medium">
                    {new Date(score.month).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      score.accounts >= 90 ? 'bg-green-100 text-green-800' : 
                      score.accounts >= 80 ? 'bg-amber-100 text-amber-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {score.accounts}% ({score.accountsPoints} pts)
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      score.vat >= 90 ? 'bg-green-100 text-green-800' : 
                      score.vat >= 80 ? 'bg-amber-100 text-amber-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {score.vat}% ({score.vatPoints} pts)
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      score.sa >= 90 ? 'bg-green-100 text-green-800' : 
                      score.sa >= 80 ? 'bg-amber-100 text-amber-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {score.sa}% ({score.saPoints} pts)
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-bold">{score.totalPoints}</TableCell>
                  <TableCell className="text-right">LKR {score.bonusAmount?.toLocaleString()}</TableCell>
                </TableRow>
              ))}
              
              {sortedScores.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No performance data available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Quarterly Bonus History */}
      <Card>
        <CardHeader>
          <CardTitle>Quarterly Bonus History</CardTitle>
          <CardDescription>Summary of quarterly bonuses</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead className="text-center">Average Score</TableHead>
                <TableHead className="text-center">Bonus Pool</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quarters.map(({ year, quarter }) => {
                const bonus = calculateQuarterlyBonus(staffId, year, quarter);
                const quarterName = `Q${quarter} ${year}`;
                
                // Only show quarters with data
                if (bonus === 0) return null;
                
                return (
                  <TableRow key={quarterName}>
                    <TableCell className="font-medium">{quarterName}</TableCell>
                    <TableCell className="text-center">
                      {Math.round((bonus / (150000 / 4)) * 100)}%
                    </TableCell>
                    <TableCell className="text-center">LKR 37,500</TableCell>
                    <TableCell className="text-right font-bold">
                      LKR {bonus.toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })}
              
              {quarters.every(({ year, quarter }) => calculateQuarterlyBonus(staffId, year, quarter) === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No bonus history available.
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

export default MyPerformance;
