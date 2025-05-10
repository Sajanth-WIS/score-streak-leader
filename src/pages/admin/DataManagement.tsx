import { useState, useEffect } from "react";
import {
  mockSaTracker,
  mockStaffMembers,
  teamCapacities,
  calculateWeightedSaDistribution,
} from "@/lib/kpi-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { FileText, Upload, Save, Download, FileEdit, RefreshCw, Plus, MinusCircle } from "lucide-react";

const DataManagement = () => {
  const [activeTab, setActiveTab] = useState("sa-returns");
  const [saData, setSaData] = useState(mockSaTracker);
  const [teamData, setTeamData] = useState(teamCapacities);
  const [bulkData, setBulkData] = useState("");
  const { toast } = useToast();

  // State for bulk data import/export
  const [importType, setImportType] = useState<"sa" | "team">("sa");
  const [exportType, setExportType] = useState<"sa" | "team" | "all">("all");
  const [newTeamName, setNewTeamName] = useState("");

  // Handle SA data updates
  const handleSaTotalUpdate = (monthIndex: number, newTotal: number) => {
    if (newTotal < 1) return;
    
    const updatedData = [...saData];
    
    // Apply weighted distribution to all teams based on new total
    const weightedDistribution = calculateWeightedSaDistribution(newTotal);
    
    // Update this month and all future months
    for (let i = monthIndex; i < updatedData.length; i++) {
      const teamBreakdown = updatedData[i].teamBreakdown?.map(team => ({
        ...team,
        targetJobs: weightedDistribution[team.teamName] || 
                  Math.round((team.targetJobs / updatedData[i].totalJobs) * newTotal)
      }));
      
      updatedData[i] = {
        ...updatedData[i],
        totalJobs: newTotal,
        teamBreakdown
      };
    }
    
    setSaData(updatedData);
    
    toast({
      title: "SA totals updated",
      description: `Updated total jobs for ${updatedData[monthIndex].month} and forward.`
    });
  };

  // Handle team allocations updates
  const handleTeamAllocationUpdate = (monthIndex: number, teamName: string, targetJobs: number) => {
    if (targetJobs < 0) return;
    
    const updatedData = [...saData];
    const month = updatedData[monthIndex];
    
    // Update team allocation for this month
    const teamBreakdown = month.teamBreakdown?.map(team => {
      if (team.teamName === teamName) {
        return {
          ...team,
          targetJobs
        };
      }
      return team;
    });
    
    // Recalculate total jobs
    const newTotalJobs = (teamBreakdown || []).reduce((sum, team) => sum + team.targetJobs, 0);
    
    updatedData[monthIndex] = {
      ...month,
      totalJobs: newTotalJobs,
      teamBreakdown
    };
    
    // Apply the same ratios to future months
    if (monthIndex < updatedData.length - 1) {
      const confirmed = window.confirm("Apply similar allocation to future months?");
      if (confirmed) {
        const teamRatio = targetJobs / (month.teamBreakdown?.find(t => t.teamName === teamName)?.targetJobs || 1);
        
        for (let i = monthIndex + 1; i < updatedData.length; i++) {
          const futureTeamBreakdown = updatedData[i].teamBreakdown?.map(team => {
            if (team.teamName === teamName) {
              return {
                ...team,
                targetJobs: Math.round(team.targetJobs * teamRatio)
              };
            }
            return team;
          });
          
          const futureTotalJobs = (futureTeamBreakdown || []).reduce((sum, team) => sum + team.targetJobs, 0);
          
          updatedData[i] = {
            ...updatedData[i],
            totalJobs: futureTotalJobs,
            teamBreakdown: futureTeamBreakdown
          };
        }
      }
    }
    
    setSaData(updatedData);
    
    toast({
      title: "Team allocation updated",
      description: `Updated ${teamName} allocation for ${month.month}.`
    });
  };

  // Handle team capacity updates
  const handleTeamCapacityUpdate = (index: number, field: string, value: number) => {
    if (value <= 0) return;
    
    const updatedTeams = [...teamData];
    updatedTeams[index] = {
      ...updatedTeams[index],
      [field]: value
    };
    
    setTeamData(updatedTeams);
    
    toast({
      title: "Team capacity updated",
      description: `Updated ${field} for ${updatedTeams[index].teamName}.`
    });
  };

  // Add a new team
  const handleAddTeam = () => {
    if (!newTeamName.trim()) {
      toast({
        title: "Team name required",
        description: "Please enter a name for the new team",
        variant: "destructive"
      });
      return;
    }

    // Check if team name already exists
    if (teamData.some(team => team.teamName === newTeamName)) {
      toast({
        title: "Team already exists",
        description: "A team with this name already exists",
        variant: "destructive"
      });
      return;
    }

    // Add new team to team capacities
    const updatedTeamData = [
      ...teamData,
      {
        teamName: newTeamName,
        capacityWeight: 1.0,
        saEfficiencyFactor: 1.0,
        accountsEfficiencyFactor: 1.0,
        vatEfficiencyFactor: 1.0
      }
    ];
    setTeamData(updatedTeamData);

    // Add new team to SA tracker data
    const updatedSaData = saData.map(month => {
      // Create a copy of existing team breakdown
      const existingTeams = month.teamBreakdown || [];
      
      // Calculate a fair allocation for the new team
      const totalExistingJobs = existingTeams.reduce((sum, team) => sum + team.targetJobs, 0);
      const averageJobsPerTeam = Math.round(totalExistingJobs / existingTeams.length);
      
      // Recalculate job distribution for all teams
      const newTotalJobs = month.totalJobs;
      
      // Add the new team to team breakdown
      const updatedTeamBreakdown = [
        ...existingTeams,
        {
          teamName: newTeamName,
          jobsCompleted: 0,
          targetJobs: averageJobsPerTeam,
          completed: 0
        }
      ];
      
      // Apply weighted distribution based on new team configuration
      const weightedDistribution = calculateWeightedSaDistribution(newTotalJobs);
      const finalTeamBreakdown = updatedTeamBreakdown.map(team => ({
        ...team,
        targetJobs: weightedDistribution[team.teamName] || team.targetJobs
      }));
      
      return {
        ...month,
        teamBreakdown: finalTeamBreakdown
      };
    });
    
    setSaData(updatedSaData);
    setNewTeamName("");
    
    toast({
      title: "Team added",
      description: `Added new team: ${newTeamName}`
    });
  };

  // Delete a team
  const handleDeleteTeam = (teamName: string) => {
    if (!confirm(`Are you sure you want to delete the team "${teamName}"?`)) {
      return;
    }

    // Remove team from capacity data
    const updatedTeamData = teamData.filter(team => team.teamName !== teamName);
    setTeamData(updatedTeamData);

    // Remove team from SA tracker data and redistribute allocations
    const updatedSaData = saData.map(month => {
      // Filter out the team to be deleted
      const remainingTeams = (month.teamBreakdown || []).filter(team => team.teamName !== teamName);
      
      // Recalculate total jobs
      const newTotalJobs = month.totalJobs;
      
      // Apply weighted distribution with remaining teams
      const weightedDistribution = calculateWeightedSaDistribution(newTotalJobs);
      const finalTeamBreakdown = remainingTeams.map(team => ({
        ...team,
        targetJobs: weightedDistribution[team.teamName] || team.targetJobs
      }));
      
      return {
        ...month,
        teamBreakdown: finalTeamBreakdown
      };
    });
    
    setSaData(updatedSaData);
    
    toast({
      title: "Team removed",
      description: `Removed team: ${teamName}`
    });
  };

  // Convert data to JSON for export
  const exportData = () => {
    let dataToExport;
    
    switch (exportType) {
      case "sa":
        dataToExport = saData;
        break;
      case "team":
        dataToExport = teamData;
        break;
      case "all":
      default:
        dataToExport = {
          saData,
          teamData
        };
    }
    
    const jsonString = JSON.stringify(dataToExport, null, 2);
    setBulkData(jsonString);
    
    toast({
      title: "Data exported",
      description: "Copy the JSON data from the text area below."
    });
  };

  // Import data from JSON
  const importData = () => {
    try {
      const parsed = JSON.parse(bulkData);
      
      if (!parsed) {
        throw new Error("Invalid data format");
      }
      
      switch (importType) {
        case "sa":
          if (!Array.isArray(parsed)) {
            throw new Error("SA data must be an array");
          }
          setSaData(parsed);
          break;
        case "team":
          if (!Array.isArray(parsed)) {
            throw new Error("Team data must be an array");
          }
          setTeamData(parsed);
          break;
        default:
          throw new Error("Unknown import type");
      }
      
      toast({
        title: "Data imported",
        description: `Successfully imported ${importType} data.`
      });
    } catch (error) {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Invalid data format",
        variant: "destructive"
      });
    }
  };

  // Reset to default values
  const resetData = (type: "sa" | "team" | "all") => {
    const confirmed = window.confirm(`Are you sure you want to reset ${type} data to defaults?`);
    if (!confirmed) return;
    
    switch (type) {
      case "sa":
        setSaData(mockSaTracker);
        break;
      case "team":
        setTeamData(teamCapacities);
        break;
      case "all":
        setSaData(mockSaTracker);
        setTeamData(teamCapacities);
        break;
    }
    
    toast({
      title: "Data reset",
      description: `${type} data has been reset to default values.`
    });
  };

  // Update team allocations whenever team capacities change
  useEffect(() => {
    // Recalculate weighted distribution for all months
    const updatedSaData = saData.map(month => {
      const weightedDistribution = calculateWeightedSaDistribution(month.totalJobs);
      
      const teamBreakdown = month.teamBreakdown?.map(team => ({
        ...team,
        targetJobs: weightedDistribution[team.teamName] || team.targetJobs
      }));
      
      return {
        ...month,
        teamBreakdown
      };
    });
    
    setSaData(updatedSaData);
  }, [teamData]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Data Management</h2>
        <p className="text-muted-foreground">
          Manage system data including SA returns and team capacities.
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="sa-returns">SA Returns</TabsTrigger>
          <TabsTrigger value="team-capacity">Team Capacity</TabsTrigger>
        </TabsList>
        
        {/* SA Returns Tab */}
        <TabsContent value="sa-returns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SA Returns Data</CardTitle>
              <CardDescription>Manage monthly SA return numbers and team allocations</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Total Returns</TableHead>
                    <TableHead>Target %</TableHead>
                    {teamData.map(team => (
                      <TableHead key={team.teamName}>{team.teamName} Allocation</TableHead>
                    ))}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {saData.map((month, monthIndex) => (
                    <TableRow key={month.month}>
                      <TableCell className="font-medium">{month.month}</TableCell>
                      <TableCell>
                        <Input 
                          type="number"
                          value={month.totalJobs}
                          onChange={(e) => handleSaTotalUpdate(monthIndex, parseInt(e.target.value) || 0)}
                          className="w-20"
                          min="1"
                        />
                      </TableCell>
                      <TableCell>{month.target}%</TableCell>
                      {teamData.map(team => {
                        const teamAllocation = month.teamBreakdown?.find(t => t.teamName === team.teamName);
                        return (
                          <TableCell key={team.teamName}>
                            <Input 
                              type="number"
                              value={teamAllocation?.targetJobs || 0}
                              onChange={(e) => handleTeamAllocationUpdate(
                                monthIndex, 
                                team.teamName,
                                parseInt(e.target.value) || 0
                              )}
                              className="w-20"
                              min="0"
                            />
                          </TableCell>
                        );
                      })}
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // Apply weighted distribution to this month
                            const distribution = calculateWeightedSaDistribution(month.totalJobs);
                            const updatedData = [...saData];
                            
                            const teamBreakdown = month.teamBreakdown?.map(team => ({
                              ...team,
                              targetJobs: distribution[team.teamName] || team.targetJobs
                            }));
                            
                            updatedData[monthIndex] = {
                              ...month,
                              teamBreakdown
                            };
                            
                            setSaData(updatedData);
                            
                            toast({
                              title: "Weighted distribution applied",
                              description: `Updated team allocations for ${month.month}.`
                            });
                          }}
                        >
                          Apply Weighted
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline"
                onClick={() => resetData("sa")}
                className="mr-2"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset to Defaults
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Team Capacity Tab */}
        <TabsContent value="team-capacity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Capacity Settings</CardTitle>
              <CardDescription>Configure team capacity weights and efficiency factors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-end space-x-2 mb-4">
                <div className="space-y-2 flex-grow">
                  <Label htmlFor="new-team">Add New Team</Label>
                  <Input
                    id="new-team"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="Enter team name"
                  />
                </div>
                <Button onClick={handleAddTeam}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Team
                </Button>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead>Capacity Weight</TableHead>
                    <TableHead>SA Efficiency</TableHead>
                    <TableHead>Accounts Efficiency</TableHead>
                    <TableHead>VAT Efficiency</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamData.map((team, index) => (
                    <TableRow key={team.teamName}>
                      <TableCell className="font-medium">{team.teamName}</TableCell>
                      <TableCell>
                        <Input 
                          type="number"
                          value={team.capacityWeight}
                          onChange={(e) => handleTeamCapacityUpdate(
                            index, 
                            "capacityWeight",
                            parseFloat(e.target.value) || 0
                          )}
                          className="w-20"
                          step="0.1"
                          min="0.1"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number"
                          value={team.saEfficiencyFactor}
                          onChange={(e) => handleTeamCapacityUpdate(
                            index, 
                            "saEfficiencyFactor",
                            parseFloat(e.target.value) || 0
                          )}
                          className="w-20"
                          step="0.05"
                          min="0.1"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number"
                          value={team.accountsEfficiencyFactor}
                          onChange={(e) => handleTeamCapacityUpdate(
                            index, 
                            "accountsEfficiencyFactor",
                            parseFloat(e.target.value) || 0
                          )}
                          className="w-20"
                          step="0.05"
                          min="0.1"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number"
                          value={team.vatEfficiencyFactor}
                          onChange={(e) => handleTeamCapacityUpdate(
                            index, 
                            "vatEfficiencyFactor",
                            parseFloat(e.target.value) || 0
                          )}
                          className="w-20"
                          step="0.05"
                          min="0.1"
                        />
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteTeam(team.teamName)}
                          className="text-red-500 hover:text-red-700"
                          disabled={teamData.length <= 1}
                        >
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium">Team capacity explanation:</p>
                <ul className="list-disc list-inside mt-1 pl-4 space-y-1">
                  <li><strong>Capacity Weight:</strong> Relative workload capacity (higher values = more SA returns)</li>
                  <li><strong>SA Efficiency:</strong> How efficiently the team handles SA returns</li>
                  <li><strong>Accounts/VAT Efficiency:</strong> Used for KPI calculations</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline"
                onClick={() => resetData("team")}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset to Defaults
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Bulk Import/Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Bulk Data Import/Export
          </CardTitle>
          <CardDescription>Export or import data in JSON format</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            <div className="w-full md:w-1/2 space-y-4">
              <div className="flex gap-2 items-end">
                <div className="space-y-2 flex-grow">
                  <Label htmlFor="export-type">Export Data Type</Label>
                  <select 
                    id="export-type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={exportType}
                    onChange={(e) => setExportType(e.target.value as any)}
                  >
                    <option value="all">All Data</option>
                    <option value="sa">SA Returns Only</option>
                    <option value="team">Team Capacity Only</option>
                  </select>
                </div>
                <Button onClick={exportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              
              <div className="flex gap-2 items-end">
                <div className="space-y-2 flex-grow">
                  <Label htmlFor="import-type">Import Data Type</Label>
                  <select 
                    id="import-type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={importType}
                    onChange={(e) => setImportType(e.target.value as any)}
                  >
                    <option value="sa">SA Returns</option>
                    <option value="team">Team Capacity</option>
                  </select>
                </div>
                <Button onClick={importData}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>
            
            <div className="w-full md:w-1/2">
              <div className="space-y-2">
                <Label htmlFor="bulk-data">JSON Data</Label>
                <textarea
                  id="bulk-data"
                  className="min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  value={bulkData}
                  onChange={(e) => setBulkData(e.target.value)}
                  placeholder="Paste JSON data here or click Export to generate data"
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <Button 
            variant="outline"
            onClick={() => resetData("all")}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset All Data
          </Button>
          
          <Button onClick={() => {
            // Save to localStorage as a simple persistence method
            // In a real app, this would save to a database
            localStorage.setItem("saData", JSON.stringify(saData));
            localStorage.setItem("teamData", JSON.stringify(teamData));
            
            toast({
              title: "Data saved",
              description: "All data has been saved successfully."
            });
          }}>
            <Save className="mr-2 h-4 w-4" />
            Save All Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DataManagement; 