import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileDown,
  Calendar,
  Users,
  BarChart3,
  Filter,
  MailIcon,
  Clock,
  Repeat,
  Table,
  X,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { TeamPerformance } from "@/lib/kpi-data";
import { useToast } from "@/hooks/use-toast";

interface ReportGeneratorProps {
  teams: TeamPerformance["teams"];
}

type ReportType = "team-performance" | "individual-performance" | "bonus-forecast" | "custom";
type ExportFormat = "pdf" | "excel" | "csv";
type ScheduleFrequency = "daily" | "weekly" | "monthly" | "quarterly";

interface ReportConfig {
  title: string;
  description: string;
  type: ReportType;
  filters: {
    teams: string[];
    dateRange: {
      from: Date | undefined;
      to: Date | undefined;
    };
    metrics: string[];
  };
  schedule: {
    enabled: boolean;
    frequency: ScheduleFrequency;
    recipients: string[];
  };
  columns: string[];
  exportFormat: ExportFormat;
}

const DEFAULT_REPORT_CONFIG: ReportConfig = {
  title: "Team Performance Report",
  description: "Monthly performance metrics across all teams",
  type: "team-performance",
  filters: {
    teams: [],
    dateRange: {
      from: undefined,
      to: undefined,
    },
    metrics: ["accountsPoints", "vatPoints", "saPoints", "totalPoints"],
  },
  schedule: {
    enabled: false,
    frequency: "monthly",
    recipients: [],
  },
  columns: ["team", "period", "accountsPoints", "vatPoints", "saPoints", "totalPoints", "bonusAmount"],
  exportFormat: "excel",
};

// Available metrics for reports
const AVAILABLE_METRICS = [
  { id: "accountsPoints", label: "Accounts Score" },
  { id: "vatPoints", label: "VAT Score" },
  { id: "saPoints", label: "SA Score" },
  { id: "totalPoints", label: "Total Score" },
  { id: "bonusAmount", label: "Bonus Amount" },
  { id: "memberCount", label: "Team Size" },
  { id: "accounts", label: "Accounts Completion %" },
  { id: "vat", label: "VAT Completion %" },
  { id: "sa", label: "SA Completion %" },
];

// Available columns for the report
const AVAILABLE_COLUMNS = [
  { id: "team", label: "Team", required: true },
  { id: "period", label: "Period", required: true },
  { id: "accountsPoints", label: "Accounts Score" },
  { id: "vatPoints", label: "VAT Score" },
  { id: "saPoints", label: "SA Score" },
  { id: "totalPoints", label: "Total Score" },
  { id: "accounts", label: "Accounts Completion %" },
  { id: "vat", label: "VAT Completion %" },
  { id: "sa", label: "SA Completion %" },
  { id: "bonusAmount", label: "Bonus Amount" },
  { id: "bonusPool", label: "Bonus Pool" },
  { id: "memberCount", label: "Team Size" },
];

const ReportGenerator = ({ teams }: ReportGeneratorProps) => {
  const [activeTab, setActiveTab] = useState<string>("generate");
  const [reportConfig, setReportConfig] = useState<ReportConfig>(DEFAULT_REPORT_CONFIG);
  const [recipient, setRecipient] = useState<string>("");
  const { toast } = useToast();
  
  // Update report configuration
  const updateReportConfig = <K extends keyof ReportConfig>(
    key: K,
    value: ReportConfig[K]
  ) => {
    setReportConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  
  // Update nested report configuration
  const updateNestedConfig = <K extends keyof ReportConfig, N extends keyof ReportConfig[K]>(
    key: K,
    nestedKey: N,
    value: ReportConfig[K][N]
  ) => {
    setReportConfig((prev) => {
      const updatedConfig = { ...prev };
      updatedConfig[key] = {
        ...updatedConfig[key],
        [nestedKey]: value,
      };
      return updatedConfig;
    });
  };
  
  // Toggle a metric in the filters
  const toggleMetric = (metricId: string) => {
    const metrics = reportConfig.filters.metrics;
    const updatedMetrics = metrics.includes(metricId)
      ? metrics.filter((id) => id !== metricId)
      : [...metrics, metricId];
    
    updateNestedConfig("filters", "metrics", updatedMetrics);
  };
  
  // Toggle a column in the report
  const toggleColumn = (columnId: string) => {
    const columns = reportConfig.columns;
    const column = AVAILABLE_COLUMNS.find(c => c.id === columnId);
    
    // Don't allow removing required columns
    if (column?.required && columns.includes(columnId)) {
      return;
    }
    
    const updatedColumns = columns.includes(columnId)
      ? columns.filter((id) => id !== columnId)
      : [...columns, columnId];
    
    updateReportConfig("columns", updatedColumns);
  };
  
  // Toggle a team in the filters
  const toggleTeam = (teamName: string) => {
    const selectedTeams = reportConfig.filters.teams;
    const updatedTeams = selectedTeams.includes(teamName)
      ? selectedTeams.filter((name) => name !== teamName)
      : [...selectedTeams, teamName];
    
    updateNestedConfig("filters", "teams", updatedTeams);
  };
  
  // Add a recipient to the schedule
  const addRecipient = () => {
    if (!recipient) return;
    
    // Simple email validation
    if (!recipient.includes('@') || !recipient.includes('.')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    const recipients = reportConfig.schedule.recipients;
    if (recipients.includes(recipient)) {
      toast({
        title: "Duplicate email",
        description: "This email is already in the recipients list",
        variant: "destructive",
      });
      return;
    }
    
    updateNestedConfig("schedule", "recipients", [...recipients, recipient]);
    setRecipient("");
  };
  
  // Remove a recipient from the schedule
  const removeRecipient = (email: string) => {
    const recipients = reportConfig.schedule.recipients;
    updateNestedConfig(
      "schedule",
      "recipients",
      recipients.filter((r) => r !== email)
    );
  };
  
  // Generate report
  const generateReport = () => {
    // In a real application, this would trigger an API call to generate the report
    toast({
      title: "Report Generated",
      description: `${reportConfig.title} has been generated and is ready for download`,
    });
  };
  
  // Schedule report
  const scheduleReport = () => {
    // In a real application, this would trigger an API call to schedule the report
    toast({
      title: "Report Scheduled",
      description: `${reportConfig.title} has been scheduled (${reportConfig.schedule.frequency})`,
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Report Generator</CardTitle>
        <CardDescription>
          Create, customize, and schedule reports based on performance data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="generate"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="generate" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Generate</span>
            </TabsTrigger>
            <TabsTrigger value="customize" className="flex items-center gap-1">
              <Table className="h-4 w-4" />
              <span className="hidden sm:inline">Customize</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Schedule</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="report-title">Report Title</Label>
                <Input
                  id="report-title"
                  value={reportConfig.title}
                  onChange={(e) => updateReportConfig("title", e.target.value)}
                  placeholder="Enter report title"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="report-description">Description</Label>
                <Input
                  id="report-description"
                  value={reportConfig.description}
                  onChange={(e) => updateReportConfig("description", e.target.value)}
                  placeholder="Brief description of the report"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="report-type">Report Type</Label>
                <Select
                  value={reportConfig.type}
                  onValueChange={(value) => updateReportConfig("type", value as ReportType)}
                >
                  <SelectTrigger id="report-type">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="team-performance">Team Performance Report</SelectItem>
                    <SelectItem value="individual-performance">Individual Performance Report</SelectItem>
                    <SelectItem value="bonus-forecast">Bonus Forecast Report</SelectItem>
                    <SelectItem value="custom">Custom Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label>Date Range</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !reportConfig.filters.dateRange.from && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {reportConfig.filters.dateRange.from ? (
                            format(reportConfig.filters.dateRange.from, "PPP")
                          ) : (
                            <span>Start date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={reportConfig.filters.dateRange.from}
                          onSelect={(date) => {
                            const dateRange = { ...reportConfig.filters.dateRange, from: date };
                            updateNestedConfig("filters", "dateRange", dateRange);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="flex-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !reportConfig.filters.dateRange.to && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {reportConfig.filters.dateRange.to ? (
                            format(reportConfig.filters.dateRange.to, "PPP")
                          ) : (
                            <span>End date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={reportConfig.filters.dateRange.to}
                          onSelect={(date) => {
                            const dateRange = { ...reportConfig.filters.dateRange, to: date };
                            updateNestedConfig("filters", "dateRange", dateRange);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label>Teams</Label>
                <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {teams.map((team) => (
                      <div
                        key={team.name}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`team-${team.name}`}
                          checked={reportConfig.filters.teams.includes(team.name)}
                          onCheckedChange={() => toggleTeam(team.name)}
                        />
                        <Label
                          htmlFor={`team-${team.name}`}
                          className="cursor-pointer"
                        >
                          {team.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {reportConfig.filters.teams.length
                    ? `Selected: ${reportConfig.filters.teams.join(", ")}`
                    : "Select teams or leave empty to include all teams"}
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label>Export Format</Label>
                <Select
                  value={reportConfig.exportFormat}
                  onValueChange={(value) => updateReportConfig("exportFormat", value as ExportFormat)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select export format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                    <SelectItem value="csv">CSV File</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="customize" className="space-y-4">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Metrics to Include</Label>
                <div className="border rounded-md p-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {AVAILABLE_METRICS.map((metric) => (
                      <div key={metric.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`metric-${metric.id}`}
                          checked={reportConfig.filters.metrics.includes(metric.id)}
                          onCheckedChange={() => toggleMetric(metric.id)}
                        />
                        <Label
                          htmlFor={`metric-${metric.id}`}
                          className="cursor-pointer"
                        >
                          {metric.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label>Table Columns</Label>
                <div className="border rounded-md p-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {AVAILABLE_COLUMNS.map((column) => (
                      <div key={column.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`column-${column.id}`}
                          checked={reportConfig.columns.includes(column.id)}
                          onCheckedChange={() => toggleColumn(column.id)}
                          disabled={column.required}
                        />
                        <Label
                          htmlFor={`column-${column.id}`}
                          className={cn(
                            "cursor-pointer",
                            column.required && "font-medium"
                          )}
                        >
                          {column.label}
                          {column.required && (
                            <span className="ml-1 text-xs text-muted-foreground">(required)</span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="schedule" className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="schedule-enabled"
                  checked={reportConfig.schedule.enabled}
                  onCheckedChange={(checked) => updateNestedConfig("schedule", "enabled", !!checked)}
                />
                <Label htmlFor="schedule-enabled">Schedule this report</Label>
              </div>
              
              {reportConfig.schedule.enabled && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="schedule-frequency">Frequency</Label>
                    <Select
                      value={reportConfig.schedule.frequency}
                      onValueChange={(value) => updateNestedConfig("schedule", "frequency", value as ScheduleFrequency)}
                    >
                      <SelectTrigger id="schedule-frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="schedule-recipients">Recipients</Label>
                    <div className="flex gap-2">
                      <Input
                        id="schedule-recipients"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder="Enter email address"
                      />
                      <Button
                        variant="outline"
                        type="button"
                        onClick={addRecipient}
                      >
                        Add
                      </Button>
                    </div>
                    
                    {reportConfig.schedule.recipients.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {reportConfig.schedule.recipients.map((email) => (
                          <Badge key={email} variant="secondary" className="flex items-center gap-1">
                            <MailIcon className="h-3 w-3" />
                            {email}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 rounded-full"
                              onClick={() => removeRecipient(email)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-muted/50 p-3 rounded-md text-sm">
                    <p className="flex items-center gap-2">
                      <Repeat className="h-4 w-4 text-primary" />
                      <span>
                        This report will be generated and sent{" "}
                        <strong>{reportConfig.schedule.frequency}</strong> to{" "}
                        <strong>
                          {reportConfig.schedule.recipients.length} recipient
                          {reportConfig.schedule.recipients.length !== 1 ? "s" : ""}
                        </strong>
                      </span>
                    </p>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 justify-end border-t pt-4">
        {activeTab === "generate" ? (
          <Button
            className="w-full sm:w-auto"
            onClick={generateReport}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        ) : activeTab === "schedule" && reportConfig.schedule.enabled ? (
          <Button
            className="w-full sm:w-auto"
            onClick={scheduleReport}
            disabled={reportConfig.schedule.recipients.length === 0}
          >
            <Clock className="mr-2 h-4 w-4" />
            Schedule Report
          </Button>
        ) : (
          <Button
            className="w-full sm:w-auto"
            onClick={() => setActiveTab("generate")}
          >
            <Filter className="mr-2 h-4 w-4" />
            Continue to Generate
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ReportGenerator; 