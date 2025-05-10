import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { TeamPerformance } from "@/lib/kpi-data";

interface TeamComparisonChartProps {
  teams: TeamPerformance["teams"];
  selectedTeams?: string[];
}

const TeamComparisonChart = ({ teams, selectedTeams }: TeamComparisonChartProps) => {
  const [chartType, setChartType] = useState<"bar" | "radar">("bar");
  
  // Filter teams if selectedTeams is provided
  const teamsToDisplay = selectedTeams?.length 
    ? teams.filter(team => selectedTeams.includes(team.name))
    : teams;
  
  // Prepare data for bar chart - comparing total points across teams
  const barChartData = teamsToDisplay.map(team => ({
    name: team.name,
    accounts: team.accountsPoints,
    vat: team.vatPoints,
    sa: team.saPoints,
    total: team.totalPoints,
  }));
  
  // Prepare data for radar chart - normalizing scores out of 100%
  const radarChartData = [
    { subject: "Accounts", fullMark: 100 },
    { subject: "VAT", fullMark: 100 },
    { subject: "SA", fullMark: 100 },
    { subject: "Overall", fullMark: 100 },
  ].map(item => {
    const dataItem = { ...item };
    teamsToDisplay.forEach(team => {
      let value = 0;
      if (item.subject === "Accounts") {
        value = (team.accountsPoints / 40) * 100; // Accounts is out of 40 points
      } else if (item.subject === "VAT") {
        value = (team.vatPoints / 30) * 100; // VAT is out of 30 points
      } else if (item.subject === "SA") {
        value = (team.saPoints / 30) * 100; // SA is out of 30 points
      } else if (item.subject === "Overall") {
        value = team.totalPoints; // Overall is already out of 100
      }
      dataItem[team.name] = Math.round(value);
    });
    return dataItem;
  });
  
  // Generate colors for each team
  const getTeamColor = (index: number) => {
    const colors = [
      "#3b82f6", // blue-500
      "#10b981", // emerald-500
      "#f59e0b", // amber-500
      "#8b5cf6", // violet-500
      "#ef4444", // red-500
      "#06b6d4", // cyan-500
      "#ec4899", // pink-500
      "#84cc16", // lime-500
    ];
    return colors[index % colors.length];
  };
  
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle>Team Comparison</CardTitle>
            <CardDescription>
              {selectedTeams && selectedTeams.length > 0
                ? "Comparing selected teams' performance metrics"
                : "Comparing all teams' performance metrics"}
            </CardDescription>
          </div>
          <Tabs 
            value={chartType} 
            onValueChange={(value) => setChartType(value as "bar" | "radar")}
            className="w-[200px]"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bar">Bar</TabsTrigger>
              <TabsTrigger value="radar">Radar</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "bar" ? (
              <BarChart
                data={barChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                barGap={10}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [
                    `${value} points`,
                    undefined
                  ]}
                />
                <Legend />
                <Bar 
                  dataKey="accounts" 
                  name="Accounts" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="vat" 
                  name="VAT" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="sa" 
                  name="SA" 
                  fill="#f59e0b" 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="total" 
                  name="Total" 
                  fill="#8b5cf6" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            ) : (
              <RadarChart 
                outerRadius={90} 
                width={730} 
                height={250} 
                data={radarChartData}
              >
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                {teamsToDisplay.map((team, index) => (
                  <Radar
                    key={team.name}
                    name={team.name}
                    dataKey={team.name}
                    stroke={getTeamColor(index)}
                    fill={getTeamColor(index)}
                    fillOpacity={0.2}
                  />
                ))}
                <Tooltip formatter={(value: number) => [`${value}%`, undefined]} />
                <Legend />
              </RadarChart>
            )}
          </ResponsiveContainer>
        </div>
        
        {teams.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {teamsToDisplay.map((team, index) => (
              <div 
                key={team.name}
                className="p-4 rounded-lg border border-border"
                style={{ borderLeftColor: getTeamColor(index), borderLeftWidth: '4px' }}
              >
                <div className="font-medium">{team.name}</div>
                <div className="mt-1 text-2xl font-bold">{team.totalPoints}</div>
                <div className="text-xs text-muted-foreground">Total Score</div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-blue-500 font-medium">Acc</div>
                    <div>{team.accountsPoints}</div>
                  </div>
                  <div>
                    <div className="text-emerald-500 font-medium">VAT</div>
                    <div>{team.vatPoints}</div>
                  </div>
                  <div>
                    <div className="text-amber-500 font-medium">SA</div>
                    <div>{team.saPoints}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamComparisonChart; 