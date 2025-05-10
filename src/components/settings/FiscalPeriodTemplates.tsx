import { useState } from "react";
import { CalendarIcon, Check } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define types for fiscal period configuration
export interface FiscalPeriodConfig {
  type: "calendar" | "custom" | "tax-year-uk" | "tax-year-in" | "tax-year-us";
  startMonth: number; // 1-12
  startDay: number; // 1-31
  description: string;
  quarters: { startMonth: number; startDay: number; label: string }[];
  saDeadline?: { month: number; day: number };
  usesSaCumulativeTargets: boolean;
}

// Pre-defined fiscal period templates
export const FISCAL_PERIOD_TEMPLATES: Record<string, FiscalPeriodConfig> = {
  "calendar": {
    type: "calendar",
    startMonth: 1, // January
    startDay: 1,
    description: "Calendar year (Jan 1 - Dec 31)",
    quarters: [
      { startMonth: 1, startDay: 1, label: "Q1" },
      { startMonth: 4, startDay: 1, label: "Q2" },
      { startMonth: 7, startDay: 1, label: "Q3" },
      { startMonth: 10, startDay: 1, label: "Q4" },
    ],
    usesSaCumulativeTargets: false,
  },
  "tax-year-uk": {
    type: "tax-year-uk",
    startMonth: 4, // April
    startDay: 6,
    description: "UK Tax Year (Apr 6 - Apr 5)",
    quarters: [
      { startMonth: 4, startDay: 6, label: "Q1" },
      { startMonth: 7, startDay: 6, label: "Q2" },
      { startMonth: 10, startDay: 6, label: "Q3" },
      { startMonth: 1, startDay: 6, label: "Q4" },
    ],
    saDeadline: { month: 1, day: 31 }, // January 31st
    usesSaCumulativeTargets: true,
  },
  "tax-year-in": {
    type: "tax-year-in",
    startMonth: 4, // April
    startDay: 1,
    description: "Indian Financial Year (Apr 1 - Mar 31)",
    quarters: [
      { startMonth: 4, startDay: 1, label: "Q1" },
      { startMonth: 7, startDay: 1, label: "Q2" },
      { startMonth: 10, startDay: 1, label: "Q3" },
      { startMonth: 1, startDay: 1, label: "Q4" },
    ],
    saDeadline: { month: 7, day: 31 }, // July 31st
    usesSaCumulativeTargets: true,
  },
  "tax-year-us": {
    type: "tax-year-us",
    startMonth: 10, // October
    startDay: 1,
    description: "US Federal Fiscal Year (Oct 1 - Sep 30)",
    quarters: [
      { startMonth: 10, startDay: 1, label: "Q1" },
      { startMonth: 1, startDay: 1, label: "Q2" },
      { startMonth: 4, startDay: 1, label: "Q3" },
      { startMonth: 7, startDay: 1, label: "Q4" },
    ],
    saDeadline: { month: 4, day: 15 }, // April 15th
    usesSaCumulativeTargets: false,
  },
  "accounting": {
    type: "custom",
    startMonth: 1, // January
    startDay: 1,
    description: "Accounting Firms (Jan-Dec with SA focus)",
    quarters: [
      { startMonth: 1, startDay: 1, label: "Q1" },
      { startMonth: 4, startDay: 1, label: "Q2" },
      { startMonth: 7, startDay: 1, label: "Q3" },
      { startMonth: 10, startDay: 1, label: "Q4" },
    ],
    saDeadline: { month: 1, day: 31 }, // January 31st
    usesSaCumulativeTargets: true,
  },
};

// Industry-specific presets
export const INDUSTRY_PRESETS = [
  { label: "Accounting & Tax", value: "accounting" },
  { label: "UK Business", value: "tax-year-uk" },
  { label: "Indian Business", value: "tax-year-in" },
  { label: "US Federal", value: "tax-year-us" },
  { label: "Standard Calendar", value: "calendar" },
];

interface FiscalPeriodTemplatesProps {
  onSelect: (config: FiscalPeriodConfig) => void;
  currentConfig?: FiscalPeriodConfig;
}

const FiscalPeriodTemplates: React.FC<FiscalPeriodTemplatesProps> = ({
  onSelect,
  currentConfig = FISCAL_PERIOD_TEMPLATES["calendar"],
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    currentConfig?.type || "calendar"
  );
  const [customConfig, setCustomConfig] = useState<FiscalPeriodConfig>(
    currentConfig || FISCAL_PERIOD_TEMPLATES["calendar"]
  );
  const [yearStartDate, setYearStartDate] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), currentConfig.startMonth - 1, currentConfig.startDay)
  );
  const [saDeadlineDate, setSaDeadlineDate] = useState<Date | undefined>(
    currentConfig.saDeadline 
      ? new Date(new Date().getFullYear(), currentConfig.saDeadline.month - 1, currentConfig.saDeadline.day)
      : undefined
  );
  
  const { toast } = useToast();

  // Handle template selection
  const handleTemplateSelect = (value: string) => {
    setSelectedTemplate(value);
    const template = FISCAL_PERIOD_TEMPLATES[value];
    setCustomConfig(template);
    setYearStartDate(new Date(new Date().getFullYear(), template.startMonth - 1, template.startDay));
    
    if (template.saDeadline) {
      setSaDeadlineDate(new Date(new Date().getFullYear(), template.saDeadline.month - 1, template.saDeadline.day));
    } else {
      setSaDeadlineDate(undefined);
    }
    
    onSelect(template);
    
    toast({
      title: "Fiscal period template applied",
      description: `Applied the ${template.description} template`,
    });
  };

  // Handle year start date change
  const handleYearStartDateChange = (date: Date | undefined) => {
    if (!date) return;
    
    setYearStartDate(date);
    
    const newConfig: FiscalPeriodConfig = {
      ...customConfig,
      type: "custom",
      startMonth: date.getMonth() + 1,
      startDay: date.getDate(),
      quarters: [
        { startMonth: date.getMonth() + 1, startDay: date.getDate(), label: "Q1" },
        { startMonth: ((date.getMonth() + 3) % 12) + 1, startDay: date.getDate(), label: "Q2" },
        { startMonth: ((date.getMonth() + 6) % 12) + 1, startDay: date.getDate(), label: "Q3" },
        { startMonth: ((date.getMonth() + 9) % 12) + 1, startDay: date.getDate(), label: "Q4" },
      ],
    };
    
    setCustomConfig(newConfig);
    onSelect(newConfig);
  };

  // Handle SA deadline date change
  const handleSaDeadlineDateChange = (date: Date | undefined) => {
    if (!date) return;
    
    setSaDeadlineDate(date);
    
    const newConfig: FiscalPeriodConfig = {
      ...customConfig,
      type: "custom",
      saDeadline: { month: date.getMonth() + 1, day: date.getDate() },
    };
    
    setCustomConfig(newConfig);
    onSelect(newConfig);
  };

  // Toggle SA cumulative targets
  const handleToggleSaCumulativeTargets = () => {
    const newConfig: FiscalPeriodConfig = {
      ...customConfig,
      type: "custom",
      usesSaCumulativeTargets: !customConfig.usesSaCumulativeTargets,
    };
    
    setCustomConfig(newConfig);
    onSelect(newConfig);
    
    toast({
      title: "SA Target setting updated",
      description: newConfig.usesSaCumulativeTargets
        ? "SA targets will now use cumulative tracking"
        : "SA targets will now use standard monthly tracking",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Fiscal Period Templates</CardTitle>
        <CardDescription>
          Configure how your fiscal periods and deadlines are structured
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium">Industry Template</label>
          <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a fiscal period template" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRY_PRESETS.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">{customConfig.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">Fiscal Year Start</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !yearStartDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {yearStartDate ? (
                    format(yearStartDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={yearStartDate}
                  onSelect={handleYearStartDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              First day of your fiscal year
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">SA Returns Deadline</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !saDeadlineDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {saDeadlineDate ? (
                    format(saDeadlineDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={saDeadlineDate}
                  onSelect={handleSaDeadlineDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              Annual deadline for submitting SA returns
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-lg">
          <h3 className="text-sm font-medium mb-2">Quarter Breakdown</h3>
          <div className="grid grid-cols-4 gap-2">
            {customConfig.quarters.map((quarter, index) => (
              <div key={index} className="text-center p-2 border rounded-md">
                <p className="font-semibold">{quarter.label}</p>
                <p className="text-xs text-muted-foreground">
                  Month {quarter.startMonth}, Day {quarter.startDay}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={customConfig.usesSaCumulativeTargets ? "default" : "outline"}
            size="sm"
            onClick={handleToggleSaCumulativeTargets}
            className="flex items-center"
          >
            {customConfig.usesSaCumulativeTargets && (
              <Check className="mr-2 h-4 w-4" />
            )}
            Use SA Cumulative Targets
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="w-6 h-6 rounded-full">
                  ?
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  When enabled, SA targets will build up cumulatively toward the annual deadline.
                  This is typical for accounting firms where work accelerates toward the SA deadline.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4 bg-slate-50">
        <p className="text-xs text-muted-foreground">
          Your fiscal settings determine how KPIs are calculated and how targets are set throughout the year.
          For accounting firms, the SA cumulative targets feature helps manage the tax season workflow.
        </p>
      </CardFooter>
    </Card>
  );
};

export default FiscalPeriodTemplates; 