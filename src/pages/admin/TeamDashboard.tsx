import { useState } from "react";
import { getTeamPerformance } from "@/lib/kpi-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, ChevronDown, Download, LayoutDashboard, TrendingUp, Users } from "lucide-react";
import TeamComparisonChart from "@/components/dashboard/TeamComparisonChart";
import TrendAnalysisChart from "@/components/dashboard/TrendAnalysisChart";
import ReportGenerator from "@/components/reporting/ReportGenerator";
import { useToast } from "@/hooks/use-toast";
import ScoreCard from "@/components/dashboard/ScoreCard";

const TeamDashboard = () => {
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [timeRange, setTimeRange] = useState<"6m" | "1y" | "2y" | "all">("1y");
  const { toast } = useToast();
  
  // Get team performance data
  const teamPerformance = getTeamPerformance();
  
  // Toggle a team in the selection
  const toggleTeamSelection = (teamName: string) => {
    if (selectedTeams.includes(teamName)) {
      setSelectedTeams(selectedTeams.filter((name) => name !== teamName));
    } else {
      setSelectedTeams([...selectedTeams, teamName]);
    }
  };
  
  // Export dashboard data
  const exportDashboard = () => {
    toast({
      title: "Dashboard Exported",
      description: "Team dashboard data has been exported to Excel",
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Team Performance Dashboard</h2>
          <p className="text-muted-foreground">
            Analyze and compare team performance metrics across all KPI categories
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as any)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
              <SelectItem value="2y">Last 2 Years</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={exportDashboard}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Comparison
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>
          
          {(activeTab === "comparison" || activeTab === "trends") && (
            <div className="relative inline-block">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setCompareMode(!compareMode)}
              >
                <Users className="h-4 w-4" />
                {compareMode ? 'Select Teams' : 'Compare All'}
                <ChevronDown className="h-4 w-4" />
              </Button>
              
              {compareMode && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-background border border-border z-10">
                  <div className="p-2">
                    <div className="text-sm font-medium mb-2">Select Teams to Compare</div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {teamPerformance.teams.map((team) => (
                        <div 
                          key={team.name}
                          className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer"
                          onClick={() => toggleTeamSelection(team.name)}
                        >
                          <div 
                            className={`h-4 w-4 rounded-sm border ${
                              selectedTeams.includes(team.name) 
                                ? 'bg-primary border-primary' 
                                : 'border-border'
                            }`}
                          >
                            {selectedTeams.includes(team.name) && (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white">
                                <path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <span>{team.name}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex justify-between">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedTeams([])}
                      >
                        Clear All
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedTeams(teamPerformance.teams.map(t => t.name))}
                      >
                        Select All
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {teamPerformance.teams.length > 0 && (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Teams</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{teamPerformance.teams.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Active teams</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {teamPerformance.teams.reduce((sum, team) => sum + team.memberCount, 0)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Across all teams</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Team Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(teamPerformance.teams.reduce((sum, team) => sum + team.totalPoints, 0) / teamPerformance.teams.length)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Points out of 100</p>
                    <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary"
                        style={{ width: `${Math.round(teamPerformance.teams.reduce((sum, team) => sum + team.totalPoints, 0) / teamPerformance.teams.length)}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Bonus Pool</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      LKR {teamPerformance.teams.reduce((sum, team) => sum + team.bonusPool, 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Current quarter</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <TeamComparisonChart teams={teamPerformance.teams} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamPerformance.teams.slice(0, 2).map((team) => (
              <Card key={team.name} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <CardTitle className="text-lg flex justify-between items-center">
                    <span>{team.name}</span>
                    <Badge variant={
                      team.totalPoints >= 85 ? "default" : 
                      team.totalPoints >= 70 ? "secondary" : 
                      "outline"
                    }>
                      {team.totalPoints} pts
                    </Badge>
                  </CardTitle>
                  <CardDescription>Team Performance Overview</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-3 gap-4">
                    <ScoreCard 
                      title="Accounts" 
                      score={team.accountsPoints} 
                      maxScore={40} 
                      color={team.accounts >= 90 ? "text-green-600" : team.accounts >= 80 ? "text-yellow-600" : "text-red-600"}
                      description={`${team.accounts.toFixed(1)}% completion`}
                      mini
                    />
                    
                    <ScoreCard 
                      title="VAT" 
                      score={team.vatPoints} 
                      maxScore={30} 
                      color={team.vat >= 90 ? "text-green-600" : team.vat >= 80 ? "text-yellow-600" : "text-red-600"}
                      description={`${team.vat.toFixed(1)}% completion`}
                      mini
                    />
                    
                    <ScoreCard 
                      title="SA" 
                      score={team.saPoints} 
                      maxScore={30} 
                      color={team.sa >= 90 ? "text-green-600" : team.sa >= 80 ? "text-yellow-600" : "text-red-600"}
                      description={`${team.sa.toFixed(1)}% completion`}
                      mini
                    />
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex justify-between mb-2 text-sm">
                      <span>Team Members</span>
                      <span className="font-medium">{team.memberCount}</span>
                    </div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span>Estimated Bonus</span>
                      <span className="font-medium">LKR {team.totalBonus.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avg. per Member</span>
                      <span className="font-medium">
                        LKR {Math.round(team.totalBonus / team.memberCount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="comparison" className="space-y-6">
          <TeamComparisonChart 
            teams={teamPerformance.teams} 
            selectedTeams={compareMode ? selectedTeams : undefined}
          />
          
          {/* Teams Performance Breakdown Table */}
          <Card>
            <CardHeader>
              <CardTitle>Teams Performance Breakdown</CardTitle>
              <CardDescription>
                Detailed performance metrics for all teams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium">Team</th>
                      <th className="text-center py-3 px-4 font-medium">Members</th>
                      <th className="text-center py-3 px-4 font-medium">Accounts</th>
                      <th className="text-center py-3 px-4 font-medium">VAT</th>
                      <th className="text-center py-3 px-4 font-medium">SA</th>
                      <th className="text-center py-3 px-4 font-medium">Total Score</th>
                      <th className="text-right py-3 px-4 font-medium">Est. Bonus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(compareMode ? 
                      teamPerformance.teams.filter(team => selectedTeams.includes(team.name)) : 
                      teamPerformance.teams
                    ).map((team) => (
                      <tr key={team.name} className="border-b border-border last:border-0">
                        <td className="py-3 px-4 font-medium">{team.name}</td>
                        <td className="text-center py-3 px-4">{team.memberCount}</td>
                        <td className="text-center py-3 px-4">
                          <div className="flex items-center justify-center">
                            <span className={
                              team.accounts >= 90 ? "text-green-600" : 
                              team.accounts >= 80 ? "text-yellow-600" : 
                              "text-red-600"
                            }>
                              {team.accountsPoints}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">/ 40</span>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <div className="flex items-center justify-center">
                            <span className={
                              team.vat >= 90 ? "text-green-600" : 
                              team.vat >= 80 ? "text-yellow-600" : 
                              "text-red-600"
                            }>
                              {team.vatPoints}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">/ 30</span>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <div className="flex items-center justify-center">
                            <span className={
                              team.sa >= 90 ? "text-green-600" : 
                              team.sa >= 80 ? "text-yellow-600" : 
                              "text-red-600"
                            }>
                              {team.saPoints}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">/ 30</span>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <Badge variant={
                            team.totalPoints >= 85 ? "default" : 
                            team.totalPoints >= 70 ? "secondary" : 
                            "outline"
                          }>
                            {team.totalPoints} pts
                          </Badge>
                        </td>
                        <td className="text-right py-3 px-4 font-medium">
                          LKR {team.totalBonus.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-6">
          <TrendAnalysisChart
            data={
              compareMode && selectedTeams.length > 0
                ? Object.fromEntries(
                    selectedTeams.map(teamName => {
                      const team = teamPerformance.teams.find(t => t.name === teamName);
                      return [teamName, team?.history || []];
                    })
                  )
                : teamPerformance.overall.history
            }
            timeRange={timeRange}
            title="Performance Trends"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Teams</CardTitle>
                <CardDescription>
                  Teams with the highest average scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamPerformance.teams
                    .sort((a, b) => b.totalPoints - a.totalPoints)
                    .slice(0, 5)
                    .map((team, index) => (
                      <div 
                        key={team.name}
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold"
                          >
                            {index + 1}
                          </div>
                          <span className="font-medium">{team.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{team.totalPoints}</span>
                          <div className="h-2 w-20 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary"
                              style={{ width: `${team.totalPoints}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Most Improved Teams</CardTitle>
                <CardDescription>
                  Teams with the largest score increases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamPerformance.teams
                    .filter(team => team.history?.length >= 2)
                    .map(team => {
                      const firstScore = team.history[0];
                      const lastScore = team.history[team.history.length - 1];
                      const improvement = lastScore.totalPoints - firstScore.totalPoints;
                      return { ...team, improvement };
                    })
                    .sort((a, b) => b.improvement - a.improvement)
                    .slice(0, 5)
                    .map((team, index) => (
                      <div 
                        key={team.name}
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-700 text-xs font-bold"
                          >
                            {index + 1}
                          </div>
                          <span className="font-medium">{team.name}</span>
                        </div>
                        <span className="font-bold text-green-600">+{team.improvement.toFixed(1)}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-6">
          <ReportGenerator teams={teamPerformance.teams} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamDashboard; 