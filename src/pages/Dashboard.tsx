
import { useAuth } from "@/contexts/AuthContext";
import { getStaffKpiScores, checkForBadges, calculateQuarterlyBonus } from "@/lib/kpi-data";
import ScoreCard from "@/components/dashboard/ScoreCard";
import BadgeDisplay from "@/components/dashboard/BadgeDisplay";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award } from "lucide-react";

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  
  // For demo purposes, we'll show the first staff member's data for the admin
  const staffId = isAdmin ? '1' : user?.id || '1';
  const kpiScores = getStaffKpiScores(staffId);
  const earnedBadges = checkForBadges(staffId);
  
  // Sort KPI scores by date
  const sortedScores = [...kpiScores].sort((a, b) => 
    new Date(b.month).getTime() - new Date(a.month).getTime()
  );
  
  // Get latest score
  const latestScore = sortedScores[0];
  
  // Calculate current quarter bonus
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentQuarter = Math.ceil(currentMonth / 3);
  const quarterlyBonus = calculateQuarterlyBonus(staffId, currentYear, currentQuarter);
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Dashboard</h2>
        <p className="text-muted-foreground">
          {isAdmin 
            ? "Overview of KPI performance across the team." 
            : "Your performance dashboard and bonus progress."}
        </p>
      </div>
      
      {latestScore && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ScoreCard 
              title="Accounts Score" 
              score={latestScore.accountsPoints || 0} 
              maxScore={40} 
              color={latestScore.accounts >= 90 ? "text-green-600" : latestScore.accounts >= 80 ? "text-yellow-600" : "text-red-600"}
              description={`${latestScore.accounts}% on-time completion`}
            />
            
            <ScoreCard 
              title="VAT Score" 
              score={latestScore.vatPoints || 0} 
              maxScore={30} 
              color={latestScore.vat >= 90 ? "text-green-600" : latestScore.vat >= 80 ? "text-yellow-600" : "text-red-600"}
              description={`${latestScore.vat}% on-time completion`}
            />
            
            <ScoreCard 
              title="SA Score" 
              score={latestScore.saPoints || 0} 
              maxScore={30} 
              color={latestScore.sa >= 90 ? "text-green-600" : latestScore.sa >= 80 ? "text-yellow-600" : "text-red-600"}
              description={`${latestScore.sa}% on-time completion`}
            />
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{latestScore.totalPoints || 0}</div>
                  <div className="text-sm text-green-600">/ 100</div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Latest monthly score</p>
                <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-company-primary"
                    style={{ width: `${latestScore.totalPoints || 0}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Quarterly Bonus Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Current Bonus Pool:</span>
                    <span className="font-semibold">LKR 37,500</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Estimated Bonus (based on current performance):</span>
                    <span className="font-semibold text-lg">LKR {quarterlyBonus.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span>Percentage of Pool:</span>
                    <span className="text-company-primary">
                      {Math.round((quarterlyBonus / 37500) * 100)}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-company-accent"
                      style={{ width: `${Math.round((quarterlyBonus / 37500) * 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Earned Badges</CardTitle>
              </CardHeader>
              <CardContent>
                {earnedBadges.length > 0 ? (
                  <div className="space-y-2">
                    {earnedBadges.map(badge => (
                      <div key={badge.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                        <div className="h-8 w-8 rounded-full bg-company-accent flex items-center justify-center">
                          <Award className="h-5 w-5 text-company-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{badge.name}</p>
                          <p className="text-xs text-gray-600">{badge.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-24 text-center">
                    <p className="text-sm text-gray-500">
                      No badges earned yet. Maintain high performance to earn badges!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <PerformanceChart 
            data={kpiScores} 
            title="Performance Trend" 
          />
        </>
      )}
      
      {!latestScore && (
        <div className="bg-gray-50 border rounded-lg p-8 text-center">
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Performance Data Available</h3>
          <p className="text-gray-500">
            {isAdmin 
              ? "Add performance data for staff members to view their metrics."
              : "Your manager will add your performance data soon."}
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
