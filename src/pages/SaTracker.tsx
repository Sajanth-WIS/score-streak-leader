import { useState, useEffect } from "react";
import { mockSaTracker, SaTarget, TeamSaTarget, calculateWeightedSaDistribution, teamCapacities, forecastSaCompletion } from "@/lib/kpi-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BarChart, Bar } from "recharts";
import { TrendingUp, AlertTriangle, Target } from "lucide-react";

const SaTracker = () => {
  const [saData, setSaData] = useState<SaTarget[]>(mockSaTracker);
  const [editingMonth, setEditingMonth] = useState<string | null>(null);
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [jobsCompleted, setJobsCompleted] = useState<number>(0);
  const [newClients, setNewClients] = useState<number>(0);
  const [totalReturns, setTotalReturns] = useState<number>(500);
  const [viewMode, setViewMode] = useState<"overall" | "team">("overall");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const { toast } = useToast();
  const [useWeightedDistribution, setUseWeightedDistribution] = useState<boolean>(true);

  // Get list of teams from data
  const teams = Array.from(
    new Set(
      saData
        .flatMap(month => month.teamBreakdown || [])
        .map(team => team.teamName)
    )
  );

  // Update totals when total returns change
  useEffect(() => {
    if (totalReturns !== saData[0].totalJobs) {
      let updatedData = [...saData];
      
      if (useWeightedDistribution) {
        // Use weighted team distribution based on capacity
        const weightedDistribution = calculateWeightedSaDistribution(totalReturns);
        
        updatedData = saData.map(month => {
          // Apply weighted distribution to team breakdown
          const teamBreakdown = month.teamBreakdown?.map(team => ({
            ...team,
            targetJobs: weightedDistribution[team.teamName] || Math.round(team.targetJobs * (totalReturns / month.totalJobs))
          }));
          
          return {
            ...month,
            totalJobs: totalReturns,
            teamBreakdown
          };
        });
      } else {
        // Use proportional distribution as before
        const ratio = totalReturns / saData[0].totalJobs;
        updatedData = saData.map(month => {
          const teamBreakdown = month.teamBreakdown?.map(team => ({
            ...team,
            targetJobs: Math.round(team.targetJobs * ratio)
          }));
          
          return {
            ...month,
            totalJobs: totalReturns,
            teamBreakdown
          };
        });
      }
      
      setSaData(updatedData);
    }
  }, [totalReturns, useWeightedDistribution]);

  const handleEditMonth = (month: string, currentJobs: number, team?: string) => {
    setEditingMonth(month);
    setJobsCompleted(currentJobs);
    setEditingTeam(team || null);
  };

  const handleAddNewClients = (monthIndex: number) => {
    if (newClients <= 0) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid number of new clients",
        variant: "destructive"
      });
      return;
    }

    const updatedData = [...saData];
    const currentMonth = updatedData[monthIndex];
    
    // Add new clients to total
    const newTotal = currentMonth.totalJobs + newClients;
    
    // Update this month and all future months
    for (let i = monthIndex; i < updatedData.length; i++) {
      let teamBreakdown;
      
      if (useWeightedDistribution) {
        // Calculate weighted distribution for the new total
        const weightedDistribution = calculateWeightedSaDistribution(newTotal);
        
        // Apply new weighted distribution
        teamBreakdown = updatedData[i].teamBreakdown?.map(team => {
          return {
            ...team,
            targetJobs: weightedDistribution[team.teamName] || team.targetJobs
          };
        });
      } else {
        // Distribute proportionally as before
        teamBreakdown = updatedData[i].teamBreakdown?.map(team => {
          const teamRatio = team.targetJobs / updatedData[i].totalJobs;
          const newTeamTarget = Math.round(newTotal * teamRatio);
          return {
            ...team,
            targetJobs: newTeamTarget
          };
        });
      }
      
      updatedData[i] = {
        ...updatedData[i],
        totalJobs: newTotal,
        teamBreakdown,
        // If it's the current month, add the newClients count
        ...(i === monthIndex ? { newClients: (currentMonth.newClients || 0) + newClients } : {})
      };
    }
    
    setSaData(updatedData);
    setTotalReturns(newTotal);
    setNewClients(0);
    
    toast({
      title: "New clients added",
      description: `${newClients} new clients added to ${currentMonth.month} and forward.`
    });
  };

  const handleSaveJobs = (monthIndex: number) => {
    const updatedData = [...saData];
    const month = updatedData[monthIndex];
    
    if (editingTeam) {
      // Update team specific data
      const teamBreakdown = month.teamBreakdown?.map(team => {
        if (team.teamName === editingTeam) {
          const completed = Math.min(100, (jobsCompleted / team.targetJobs) * 100);
          return {
            ...team,
            jobsCompleted,
            completed: Math.round(completed * 10) / 10
          };
        }
        return team;
      });
      
      // Recalculate total jobs completed
      const totalJobsCompleted = (teamBreakdown || []).reduce((sum, team) => sum + team.jobsCompleted, 0);
      const totalCompleted = Math.min(100, (totalJobsCompleted / month.totalJobs) * 100);
      
      updatedData[monthIndex] = {
        ...month,
        teamBreakdown,
        jobsCompleted: totalJobsCompleted,
        completed: Math.round(totalCompleted * 10) / 10
      };
    } else {
      // Update overall data - distributing proportionally to teams
      const completed = Math.min(100, (jobsCompleted / month.totalJobs) * 100);
      
      // Distribute jobsCompleted proportionally among teams
      let remainingJobs = jobsCompleted;
      const teamBreakdown = month.teamBreakdown?.map((team, idx, arr) => {
        const isLast = idx === arr.length - 1;
        const teamRatio = team.targetJobs / month.totalJobs;
        let teamJobsCompleted = isLast ? remainingJobs : Math.min(Math.round(jobsCompleted * teamRatio), team.targetJobs);
        remainingJobs -= teamJobsCompleted;
        
        const teamCompleted = Math.min(100, (teamJobsCompleted / team.targetJobs) * 100);
        return {
          ...team,
          jobsCompleted: teamJobsCompleted,
          completed: Math.round(teamCompleted * 10) / 10
        };
      });
      
      updatedData[monthIndex] = {
        ...month,
        jobsCompleted,
        completed: Math.round(completed * 10) / 10,
        teamBreakdown
      };
    }
    
    setSaData(updatedData);
    setEditingMonth(null);
    setEditingTeam(null);
    
    toast({
      title: "SA Tracker updated",
      description: `${updatedData[monthIndex].month} data has been updated.`
    });
  };

  // Prepare chart data
  const chartData = saData.map(item => {
    if (viewMode === "team" && selectedTeam !== "all") {
      const teamData = item.teamBreakdown?.find(team => team.teamName === selectedTeam);
      return {
        month: item.month,
        target: item.target,
        completed: teamData?.completed || 0
      };
    }
    return {
      month: item.month,
      target: item.target,
      completed: item.completed
    };
  });

  // Filter data based on selected team
  const filteredData = saData.map(item => {
    if (viewMode === "team" && selectedTeam !== "all") {
      const teamData = item.teamBreakdown?.find(team => team.teamName === selectedTeam);
      if (teamData) {
        return {
          ...item,
          jobsCompleted: teamData.jobsCompleted,
          totalJobs: teamData.targetJobs,
          completed: teamData.completed
        };
      }
    }
    return item;
  });

  // Calculate summary data
  const summaryData = (() => {
    if (viewMode === "team" && selectedTeam !== "all") {
      const teamTotalJobs = filteredData[0].totalJobs;
      const teamCompleted = filteredData.reduce((total, item) => total + item.jobsCompleted, 0);
      const completionPercentage = Math.round((teamCompleted / teamTotalJobs) * 100);
      
      const currentMonth = new Date().getMonth();
      const monthIndex = currentMonth >= 3 ? currentMonth - 3 : currentMonth + 9;
      const currentTarget = filteredData[Math.min(monthIndex, filteredData.length - 1)];
      const currentCompletion = (teamCompleted / teamTotalJobs) * 100;
      
      return {
        totalJobs: teamTotalJobs,
        completed: teamCompleted,
        completionPercentage,
        currentTarget,
        isOnTrack: currentCompletion >= currentTarget.target
      };
    } else {
      const totalJobs = saData[0].totalJobs;
      const completed = saData.reduce((total, item) => total + item.jobsCompleted, 0);
      const completionPercentage = Math.round((completed / totalJobs) * 100);
      
      const currentMonth = new Date().getMonth();
      const monthIndex = currentMonth >= 3 ? currentMonth - 3 : currentMonth + 9;
      const currentTarget = saData[Math.min(monthIndex, saData.length - 1)];
      const currentCompletion = (completed / totalJobs) * 100;
      
      return {
        totalJobs,
        completed,
        completionPercentage,
        currentTarget,
        isOnTrack: currentCompletion >= currentTarget.target
      };
    }
  })();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">SA Return Tracker</h2>
          <p className="text-muted-foreground">Track SA return completion against monthly targets.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "overall" | "team")}>
            <TabsList>
              <TabsTrigger value="overall">Overall</TabsTrigger>
              <TabsTrigger value="team">By Team</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {viewMode === "team" && (
            <Select
              value={selectedTeam}
              onValueChange={setSelectedTeam}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team} value={team}>{team}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Progress</CardTitle>
            <CardDescription>Target vs. Actual completion percentages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="#2A4365" 
                    strokeWidth={2} 
                    name="Target %" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="#90CDF4" 
                    strokeWidth={2} 
                    name="Completed %" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            {viewMode === "team" && selectedTeam !== "all" && (
              <CardDescription>{selectedTeam} Team Performance</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Total SA Returns</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{summaryData.totalJobs}</p>
                {saData.reduce((sum, month) => sum + (month.newClients || 0), 0) > 0 && (
                  <Badge variant="outline" className="text-xs">
                    +{saData.reduce((sum, month) => sum + (month.newClients || 0), 0)} new clients
                  </Badge>
                )}
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium">Completed So Far</p>
              <p className="text-2xl font-bold">
                {summaryData.completed}
                <span className="text-sm text-muted-foreground ml-2">
                  ({summaryData.completionPercentage}%)
                </span>
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium">Current Target</p>
              <p className="text-2xl font-bold">
                {summaryData.currentTarget.target}%
                <span className="text-sm text-muted-foreground ml-2">
                  by {summaryData.currentTarget.month}
                </span>
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className={`text-lg font-bold ${summaryData.isOnTrack ? 'text-company-success' : 'text-company-warning'}`}>
                {summaryData.isOnTrack ? 'On Track' : 'Behind Schedule'}
              </p>
            </div>
          </CardContent>
          
          <CardFooter>
            <div className="w-full space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Update Total Returns</p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={totalReturns}
                    onChange={(e) => setTotalReturns(parseInt(e.target.value) || 500)}
                    min="1"
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="weighted-distribution"
                  checked={useWeightedDistribution}
                  onCheckedChange={setUseWeightedDistribution}
                />
                <Label htmlFor="weighted-distribution">
                  Use weighted distribution based on team capacity
                </Label>
              </div>
              
              <div className="text-xs text-muted-foreground mt-2">
                <p>Team capacity weighting:</p>
                <ul className="list-disc list-inside mt-1">
                  {teamCapacities.map(team => (
                    <li key={team.teamName}>
                      {team.teamName}: {team.capacityWeight.toFixed(1)}x capacity
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Monthly Breakdown</CardTitle>
          <CardDescription>
            {viewMode === "team" && selectedTeam !== "all" 
              ? `${selectedTeam} team SA return targets and completion by month` 
              : "SA return targets and completion by month"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-center">Target %</TableHead>
                <TableHead className="text-center">Completed %</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Jobs Completed</TableHead>
                <TableHead className="text-center">New Clients</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item, index) => (
                <TableRow key={item.month}>
                  <TableCell className="font-medium">{item.month}</TableCell>
                  <TableCell className="text-center">{item.target}%</TableCell>
                  <TableCell className="text-center">{item.completed}%</TableCell>
                  <TableCell className="text-center">
                    <span 
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.completed >= item.target 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.completed >= item.target ? 'Met' : 'Not Met'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {(editingMonth === item.month && editingTeam === (selectedTeam !== "all" ? selectedTeam : null)) ? (
                      <Input 
                        type="number" 
                        value={jobsCompleted} 
                        onChange={(e) => setJobsCompleted(parseInt(e.target.value) || 0)}
                        className="w-20 inline-block"
                        min="0"
                        max={item.totalJobs}
                      />
                    ) : (
                      <>
                        {item.jobsCompleted} / {item.totalJobs}
                      </>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {editingMonth === item.month && !editingTeam ? (
                      <Input 
                        type="number" 
                        value={newClients} 
                        onChange={(e) => setNewClients(parseInt(e.target.value) || 0)}
                        className="w-16 inline-block"
                        min="0"
                      />
                    ) : (
                      item.newClients || "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {(editingMonth === item.month && editingTeam === (selectedTeam !== "all" ? selectedTeam : null)) ? (
                      <Button 
                        size="sm" 
                        onClick={() => handleSaveJobs(index)}
                      >
                        Save
                      </Button>
                    ) : editingMonth === item.month && !editingTeam ? (
                      <div className="flex gap-2 justify-end">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAddNewClients(index)}
                        >
                          Add Clients
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleSaveJobs(index)}
                        >
                          Save Jobs
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-end">
                        {viewMode === "team" && selectedTeam !== "all" ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditMonth(item.month, item.jobsCompleted, selectedTeam)}
                          >
                            Edit Team
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditMonth(item.month, item.jobsCompleted)}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Team Breakdown Card - Shows when viewing Overall */}
      {viewMode === "overall" && (
        <Card>
          <CardHeader>
            <CardTitle>Team Breakdown</CardTitle>
            <CardDescription>Performance by team for the SA season</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-center">Target Jobs</TableHead>
                  <TableHead className="text-center">Completed</TableHead>
                  <TableHead className="text-center">Completion %</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map(teamName => {
                  // Calculate team totals across all months
                  const teamData = saData.reduce(
                    (acc, month) => {
                      const teamMonth = month.teamBreakdown?.find(t => t.teamName === teamName);
                      if (teamMonth) {
                        acc.targetJobs = teamMonth.targetJobs;
                        acc.completed += teamMonth.jobsCompleted;
                      }
                      return acc;
                    },
                    { targetJobs: 0, completed: 0 }
                  );
                  
                  const completionPct = Math.round((teamData.completed / teamData.targetJobs) * 100) || 0;
                  const currentMonth = new Date().getMonth();
                  const monthIndex = currentMonth >= 3 ? currentMonth - 3 : currentMonth + 9;
                  const currentTarget = saData[Math.min(monthIndex, saData.length - 1)].target;
                  
                  return (
                    <TableRow key={teamName}>
                      <TableCell className="font-medium">{teamName}</TableCell>
                      <TableCell className="text-center">{teamData.targetJobs}</TableCell>
                      <TableCell className="text-center">{teamData.completed}</TableCell>
                      <TableCell className="text-center">{completionPct}%</TableCell>
                      <TableCell className="text-center">
                        <span 
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            completionPct >= currentTarget
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {completionPct >= currentTarget ? 'On Track' : 'Behind'}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {/* Forecast Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            SA Completion Forecast
          </CardTitle>
          <CardDescription>
            {viewMode === "team" && selectedTeam !== "all" 
              ? `Projected completion for ${selectedTeam}` 
              : "Projected overall completion based on current pace"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {(() => {
            // Calculate forecast based on current data
            const forecast = forecastSaCompletion(
              saData, 
              viewMode === "team" && selectedTeam !== "all" ? selectedTeam : undefined
            );
            
            // Format chart data for monthly projections
            const forecastData = forecast.expectedMonthlyCompletions.map(item => ({
              month: item.month,
              completed: item.expected,
              target: saData.find(m => m.month === item.month)?.totalJobs || 0,
            }));
            
            return (
              <>
                <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start">
                  <div className="w-full md:w-1/2 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Year-End Projection</h3>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold">{forecast.forecastedCompletion}%</span>
                        <span className="text-sm text-muted-foreground">completed by January</span>
                      </div>
                      
                      <div className="mt-4 h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${forecast.isOnTrack ? 'bg-green-500' : 'bg-amber-500'}`}
                          style={{ width: `${forecast.forecastedCompletion}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Completion Status</h4>
                      <div className={`flex items-center gap-2 ${forecast.isOnTrack ? 'text-green-600' : 'text-amber-600'}`}>
                        {forecast.isOnTrack 
                          ? <span className="inline-flex items-center gap-1"><Target className="h-4 w-4" /> On Track</span>
                          : <span className="inline-flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> Projected Shortfall</span>}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Required Action</h4>
                      {forecast.isOnTrack ? (
                        <p className="text-sm">Continue at current pace to meet target.</p>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-sm">Current pace won't meet target. Required improvements:</p>
                          <ul className="text-sm list-disc list-inside space-y-1">
                            <li>Increase monthly completion by {forecast.requiredMonthlyRate - (forecast.forecastedCompletion * saData[0].totalJobs / 100 / forecast.expectedMonthlyCompletions.length)} returns</li>
                            <li>Projected shortfall: {forecast.projectedShortfall} returns</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="w-full md:w-1/2">
                    <h3 className="text-lg font-semibold mb-2">Monthly Projections</h3>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={forecastData}>
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="completed" fill="#90CDF4" name="Projected Completions" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      <p>Required monthly rate: {forecast.requiredMonthlyRate} returns</p>
                      <p>Based on current avg: {Math.round(saData.reduce((sum, month) => sum + month.jobsCompleted, 0) / saData.filter(m => m.jobsCompleted > 0).length)} returns/month</p>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
};

export default SaTracker;
