import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart, 
  Area,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamKpiScore } from "@/lib/kpi-data";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";

interface TrendAnalysisChartProps {
  data: TeamKpiScore[] | { [teamName: string]: TeamKpiScore[] };
  title?: string;
  timeRange?: "6m" | "1y" | "2y" | "all";
}

const TrendAnalysisChart = ({ 
  data,
  title = "Performance Trends", 
  timeRange = "all" 
}: TrendAnalysisChartProps) => {
  const [selectedMetric, setSelectedMetric] = useState<string>("totalPoints");
  const [selectedRange, setSelectedRange] = useState<"6m" | "1y" | "2y" | "all">(timeRange);
  const [chartType, setChartType] = useState<"line" | "area">("line");
  
  // Convert data format and filter by time range
  const processData = () => {
    let chartData: any[] = [];
    let teamData: { [key: string]: TeamKpiScore[] } = {};
    
    // Handle both data formats
    if (Array.isArray(data)) {
      // Single team format
      teamData = { "Team": data };
    } else {
      // Multiple teams format
      teamData = data;
    }
    
    // Get unique months across all teams
    const allMonths = new Set<string>();
    Object.values(teamData).forEach(teamScores => {
      teamScores.forEach(score => allMonths.add(score.month));
    });
    
    // Sort months
    const sortedMonths = Array.from(allMonths).sort();
    
    // Filter by time range
    let filteredMonths = sortedMonths;
    const now = new Date();
    
    if (selectedRange !== "all") {
      const monthsToInclude = selectedRange === "6m" ? 6 : 
                             selectedRange === "1y" ? 12 : 24;
      
      const cutoffDate = new Date(now);
      cutoffDate.setMonth(now.getMonth() - monthsToInclude);
      
      filteredMonths = sortedMonths.filter(monthStr => {
        const [year, month] = monthStr.split("-").map(Number);
        const date = new Date(year, month - 1);
        return date >= cutoffDate;
      });
    }
    
    // Create data points for each month
    filteredMonths.forEach(month => {
      const dataPoint: any = { month };
      
      // Format month for display
      const [year, monthNum] = month.split("-");
      const date = new Date(parseInt(year), parseInt(monthNum) - 1);
      dataPoint.displayMonth = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      // Add data for each team
      Object.entries(teamData).forEach(([teamName, scores]) => {
        const scoreForMonth = scores.find(s => s.month === month);
        if (scoreForMonth) {
          if (selectedMetric === "totalPoints") {
            dataPoint[teamName] = scoreForMonth.totalPoints;
          } else if (selectedMetric === "accountsPoints") {
            dataPoint[teamName] = scoreForMonth.accountsPoints;
          } else if (selectedMetric === "vatPoints") {
            dataPoint[teamName] = scoreForMonth.vatPoints;
          } else if (selectedMetric === "saPoints") {
            dataPoint[teamName] = scoreForMonth.saPoints;
          }
        } else {
          dataPoint[teamName] = null; // No data for this month
        }
      });
      
      chartData.push(dataPoint);
    });
    
    return chartData;
  };
  
  const chartData = processData();
  
  // Get the teams from the data
  const teams = Array.isArray(data) ? ["Team"] : Object.keys(data);
  
  // Calculate trends
  const calculateTrend = (teamName: string) => {
    if (chartData.length < 2) return { trend: 0, description: "Not enough data" };
    
    const values = chartData
      .filter(item => item[teamName] !== null)
      .map(item => item[teamName]);
    
    if (values.length < 2) return { trend: 0, description: "Not enough data" };
    
    const first = values[0];
    const last = values[values.length - 1];
    const trend = ((last - first) / first) * 100;
    
    let description = "No Change";
    if (trend > 15) description = "Strong Upward";
    else if (trend > 5) description = "Upward";
    else if (trend < -15) description = "Strong Downward";
    else if (trend < -5) description = "Downward";
    else if (trend > 0) description = "Slight Upward";
    else if (trend < 0) description = "Slight Downward";
    
    return { trend: parseFloat(trend.toFixed(1)), description };
  };
  
  // Generate colors
  const getTeamColor = (index: number) => {
    const colors = [
      ["#3b82f6", "#93c5fd"], // blue-500, blue-300
      ["#10b981", "#6ee7b7"], // emerald-500, emerald-300
      ["#f59e0b", "#fcd34d"], // amber-500, amber-300
      ["#8b5cf6", "#c4b5fd"], // violet-500, violet-300
      ["#ef4444", "#fca5a5"], // red-500, red-300
    ];
    return colors[index % colors.length];
  };
  
  // Get metric name for display
  const getMetricName = () => {
    switch (selectedMetric) {
      case "totalPoints": return "Total Score";
      case "accountsPoints": return "Accounts Score";
      case "vatPoints": return "VAT Score";
      case "saPoints": return "SA Score";
      default: return "Score";
    }
  };
  
  // Get target line value
  const getTargetValue = () => {
    switch (selectedMetric) {
      case "totalPoints": return 80; // Target total score
      case "accountsPoints": return 35; // Target accounts score (87.5% of 40)
      case "vatPoints": return 25; // Target VAT score (83.3% of 30)
      case "saPoints": return 25; // Target SA score (83.3% of 30)
      default: return 0;
    }
  };
  
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>
              Historical performance analysis over time
            </CardDescription>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center">
            <Select
              value={selectedMetric}
              onValueChange={setSelectedMetric}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="totalPoints">Total Score</SelectItem>
                <SelectItem value="accountsPoints">Accounts Score</SelectItem>
                <SelectItem value="vatPoints">VAT Score</SelectItem>
                <SelectItem value="saPoints">SA Score</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={selectedRange}
              onValueChange={(value) => setSelectedRange(value as any)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6m">Last 6 months</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
                <SelectItem value="2y">Last 2 years</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            
            <Tabs 
              value={chartType} 
              onValueChange={(value) => setChartType(value as "line" | "area")}
              className="w-[120px]"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="line">Line</TabsTrigger>
                <TabsTrigger value="area">Area</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="displayMonth" 
                  minTickGap={30}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [`${value} points`, undefined]}
                  labelFormatter={(label) => `${label}`}
                />
                <Legend />
                <ReferenceLine 
                  y={getTargetValue()} 
                  stroke="#888888" 
                  strokeDasharray="3 3"
                  label={{ value: 'Target', position: 'insideBottomRight' }}
                />
                {teams.map((teamName, index) => {
                  const [color] = getTeamColor(index);
                  return (
                    <Line
                      key={teamName}
                      type="monotone"
                      dataKey={teamName}
                      name={teamName}
                      stroke={color}
                      activeDot={{ r: 8 }}
                      connectNulls
                      strokeWidth={2}
                    />
                  );
                })}
              </LineChart>
            ) : (
              <AreaChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="displayMonth" 
                  minTickGap={30}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [`${value} points`, undefined]}
                  labelFormatter={(label) => `${label}`}
                />
                <Legend />
                <ReferenceLine 
                  y={getTargetValue()} 
                  stroke="#888888" 
                  strokeDasharray="3 3"
                  label={{ value: 'Target', position: 'insideBottomRight' }}
                />
                {teams.map((teamName, index) => {
                  const [color, lightColor] = getTeamColor(index);
                  return (
                    <Area
                      key={teamName}
                      type="monotone"
                      dataKey={teamName}
                      name={teamName}
                      stroke={color}
                      fill={lightColor}
                      connectNulls
                      fillOpacity={0.3}
                    />
                  );
                })}
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
        
        {/* Trend summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {teams.map((teamName, index) => {
            const trendInfo = calculateTrend(teamName);
            const [color] = getTeamColor(index);
            
            return (
              <div 
                key={teamName}
                className="p-4 rounded-lg border border-border"
                style={{ borderLeftColor: color, borderLeftWidth: '4px' }}
              >
                <div className="flex justify-between items-start">
                  <div className="font-medium">{teamName}</div>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                        <Info className="h-3 w-3" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-60">
                      <div className="text-sm">
                        <p className="font-medium">Trend Analysis</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Change in {getMetricName().toLowerCase()} over the selected time period.
                          Based on comparison between first and last data points.
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                
                <div className="mt-2 flex items-baseline gap-2">
                  <span className={`text-xl font-bold ${
                    trendInfo.trend > 0 ? 'text-green-600' : 
                    trendInfo.trend < 0 ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {trendInfo.trend > 0 ? '+' : ''}{trendInfo.trend}%
                  </span>
                  <Badge
                    variant={
                      trendInfo.description.includes("Strong Upward") ? "default" :
                      trendInfo.description.includes("Upward") ? "default" :
                      trendInfo.description.includes("Strong Downward") ? "destructive" :
                      trendInfo.description.includes("Downward") ? "destructive" :
                      "outline"
                    }
                    className={`font-normal text-xs ${
                      trendInfo.description.includes("Upward") ? "bg-green-500" : ""
                    }`}
                  >
                    {trendInfo.description}
                  </Badge>
                </div>
                
                <div className="mt-1 text-xs text-muted-foreground">
                  {getMetricName()} trend
                </div>
                
                {/* Sparkline could be added here in the future */}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendAnalysisChart; 