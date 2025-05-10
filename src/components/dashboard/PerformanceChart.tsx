
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiScore, TeamKpiScore } from "@/lib/kpi-data";

interface PerformanceChartProps {
  data: KpiScore[] | TeamKpiScore[];
  title: string;
}

const PerformanceChart = ({ data, title }: PerformanceChartProps) => {
  // Transform data for the chart
  const chartData = data.map(score => {
    // Convert YYYY-MM to a more readable format
    const date = new Date(score.month);
    const monthName = new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
    const year = date.getFullYear();
    
    return {
      month: `${monthName} ${year}`,
      accounts: score.accountsPoints || 0,
      vat: score.vatPoints || 0,
      sa: score.saPoints || 0,
      total: score.totalPoints || 0
    };
  });
  
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="accounts" name="Accounts" stackId="a" fill="#1A365D" />
              <Bar dataKey="vat" name="VAT" stackId="a" fill="#2A4365" />
              <Bar dataKey="sa" name="SA" stackId="a" fill="#90CDF4" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
