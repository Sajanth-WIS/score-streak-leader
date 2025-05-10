
import { getStaffKpiScores, checkForBadges, calculateQuarterlyBonus, getTeamPerformance } from "@/lib/kpi-data";
import ScoreCard from "@/components/dashboard/ScoreCard";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [viewType, setViewType] = useState<"team" | "individual">("team");
  
  // Get team performance data
  const teamPerformance = getTeamPerformance();
  
  // For individual view, show the first staff member's data
  const staffId = '1';
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
  
  // Get selected team data
  const selectedTeamData = selectedTeam === "all" 
    ? teamPerformance.overall 
    : teamPerformance.departments.find(dept => dept.name === selectedTeam);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of KPI performance across the team.
          </p>
        </div>
        
        <div className="flex gap-4">
          <Tabs value={viewType} onValueChange={(value) => setViewType(value as "team" | "individual")}>
            <TabsList>
              <TabsTrigger value="team">Team View</TabsTrigger>
              <TabsTrigger value="individual">Individual View</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {viewType === "team" && (
            <Select
              value={selectedTeam}
              onValueChange={(value) => setSelectedTeam(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                <SelectItem value="Accounting">Accounting</SelectItem>
                <SelectItem value="Tax">Tax</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      
      {viewType === "team" && selectedTeamData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ScoreCard 
              title="Accounts Score" 
              score={selectedTeamData.accountsPoints} 
              maxScore={40} 
              color={selectedTeamData.accounts >= 90 ? "text-green-600" : selectedTeamData.accounts >= 80 ? "text-yellow-600" : "text-red-600"}
              description={`${selectedTeamData.accounts.toFixed(1)}% on-time completion`}
            />
            
            <ScoreCard 
              title="VAT Score" 
              score={selectedTeamData.vatPoints} 
              maxScore={30} 
              color={selectedTeamData.vat >= 90 ? "text-green-600" : selectedTeamData.vat >= 80 ? "text-yellow-600" : "text-red-600"}
              description={`${selectedTeamData.vat.toFixed(1)}% on-time completion`}
            />
            
            <ScoreCard 
              title="SA Score" 
              score={selectedTeamData.saPoints} 
              maxScore={30} 
              color={selectedTeamData.sa >= 90 ? "text-green-600" : selectedTeamData.sa >= 80 ? "text-yellow-600" : "text-red-600"}
              description={`${selectedTeamData.sa.toFixed(1)}% on-time completion`}
            />
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{selectedTeamData.totalPoints}</div>
                  <div className="text-sm text-green-600">/ 100</div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Team average score</p>
                <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-company-primary"
                    style={{ width: `${selectedTeamData.totalPoints}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Quarterly Bonus Pool</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Total Team Bonus Pool:</span>
                    <span className="font-semibold">LKR {selectedTeamData.bonusPool.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Estimated Team Bonus (based on current performance):</span>
                    <span className="font-semibold text-lg">LKR {selectedTeamData.totalBonus.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span>Percentage of Pool:</span>
                    <span className="text-company-primary">
                      {Math.round((selectedTeamData.totalBonus / selectedTeamData.bonusPool) * 100)}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-company-accent"
                      style={{ width: `${Math.round((selectedTeamData.totalBonus / selectedTeamData.bonusPool) * 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Team Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Team Members</p>
                    <p className="text-2xl font-bold">{selectedTeamData.memberCount}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Performance Level</p>
                    <div className="flex items-center mt-1">
                      {selectedTeamData.totalPoints >= 90 ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                          Excellent
                        </span>
                      ) : selectedTeamData.totalPoints >= 80 ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                          Very Good
                        </span>
                      ) : selectedTeamData.totalPoints >= 70 ? (
                        <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-sm font-medium">
                          Good
                        </span>
                      ) : selectedTeamData.totalPoints >= 60 ? (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm font-medium">
                          Satisfactory
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm font-medium">
                          Needs Improvement
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Average Bonus</p>
                    <p className="text-2xl font-bold">
                      LKR {(selectedTeamData.totalBonus / selectedTeamData.memberCount).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Per team member</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <PerformanceChart 
            data={selectedTeamData.history} 
            title="Team Performance Trend" 
          />
        </div>
      )}
      
      {viewType === "individual" && latestScore && (
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
      
      {viewType === "individual" && !latestScore && (
        <div className="bg-gray-50 border rounded-lg p-8 text-center">
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Performance Data Available</h3>
          <p className="text-gray-500">
            Add performance data for staff members to view their metrics.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
