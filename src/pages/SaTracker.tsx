
import { useState } from "react";
import { mockSaTracker, SaTarget } from "@/lib/kpi-data";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useToast } from "@/hooks/use-toast";

const SaTracker = () => {
  const { isAdmin } = useAuth();
  const [saData, setSaData] = useState<SaTarget[]>(mockSaTracker);
  const [editingMonth, setEditingMonth] = useState<string | null>(null);
  const [jobsCompleted, setJobsCompleted] = useState<number>(0);
  const { toast } = useToast();

  const handleEditMonth = (month: string, currentJobs: number) => {
    setEditingMonth(month);
    setJobsCompleted(currentJobs);
  };

  const handleSaveJobs = (monthIndex: number) => {
    const updatedData = [...saData];
    const totalJobs = updatedData[monthIndex].totalJobs;
    const completed = Math.min(100, (jobsCompleted / totalJobs) * 100);
    
    updatedData[monthIndex] = {
      ...updatedData[monthIndex],
      jobsCompleted,
      completed: Math.round(completed * 10) / 10, // Round to 1 decimal place
    };
    
    setSaData(updatedData);
    setEditingMonth(null);
    
    toast({
      title: "SA Tracker updated",
      description: `${updatedData[monthIndex].month} data has been updated.`
    });
  };

  // Prepare chart data
  const chartData = saData.map(item => ({
    month: item.month,
    target: item.target,
    completed: item.completed
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">SA Return Tracker</h2>
        <p className="text-muted-foreground">Track SA return completion against monthly targets.</p>
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
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Total SA Returns</p>
              <p className="text-2xl font-bold">{saData[0].totalJobs}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium">Completed So Far</p>
              <p className="text-2xl font-bold">
                {saData.reduce((total, item) => total + item.jobsCompleted, 0)}
                <span className="text-sm text-muted-foreground ml-2">
                  ({Math.round((saData.reduce((total, item) => total + item.jobsCompleted, 0) / saData[0].totalJobs) * 100)}%)
                </span>
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium">Current Target</p>
              {(() => {
                const currentMonth = new Date().getMonth();
                // April is month 3 (0-indexed), so we adjust accordingly
                const monthIndex = currentMonth >= 3 ? currentMonth - 3 : currentMonth + 9;
                const currentTarget = saData[Math.min(monthIndex, saData.length - 1)];
                
                return (
                  <p className="text-2xl font-bold">
                    {currentTarget.target}%
                    <span className="text-sm text-muted-foreground ml-2">
                      by {currentTarget.month}
                    </span>
                  </p>
                );
              })()}
            </div>
            
            <div>
              <p className="text-sm font-medium">Status</p>
              {(() => {
                const totalCompleted = saData.reduce((total, item) => total + item.jobsCompleted, 0);
                const currentMonth = new Date().getMonth();
                const monthIndex = currentMonth >= 3 ? currentMonth - 3 : currentMonth + 9;
                const currentTarget = saData[Math.min(monthIndex, saData.length - 1)];
                const currentCompletion = (totalCompleted / currentTarget.totalJobs) * 100;
                
                const isOnTrack = currentCompletion >= currentTarget.target;
                
                return (
                  <p className={`text-lg font-bold ${isOnTrack ? 'text-company-success' : 'text-company-warning'}`}>
                    {isOnTrack ? 'On Track' : 'Behind Schedule'}
                  </p>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Monthly Breakdown</CardTitle>
          <CardDescription>SA return targets and completion by month</CardDescription>
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
                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {saData.map((item, index) => (
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
                    {editingMonth === item.month && isAdmin ? (
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
                  {isAdmin && (
                    <TableCell className="text-right">
                      {editingMonth === item.month ? (
                        <Button 
                          size="sm" 
                          onClick={() => handleSaveJobs(index)}
                        >
                          Save
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
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SaTracker;
