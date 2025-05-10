import { Info, Lightbulb, Award, ArrowRight } from "lucide-react";
import { useSettings, KpiCalculationConfig } from "@/contexts/SettingsContext";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface KpiScoringGuideProps {
  kpiConfig: KpiCalculationConfig;
}

const KpiScoringGuide: React.FC<KpiScoringGuideProps> = ({ kpiConfig }) => {
  const { formatCurrency } = useSettings();
  
  // Example calculation with a sample salary
  const sampleSalary = 60000;
  const bonusPool = sampleSalary / kpiConfig.bonusPoolDivisor;
  
  // Format percentage with appropriate precision
  const formatPercent = (value: number) => {
    return `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="mr-2 h-5 w-5 text-primary" />
          KPI Scoring System Explained
        </CardTitle>
        <CardDescription>
          A visual guide to how performance scores are calculated
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-700 mb-2 flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center mr-2">A</div>
              Accounts
            </h3>
            <p className="text-sm mb-2">Accounts backlog on-time percentage</p>
            <div className="bg-white p-2 rounded border border-blue-200">
              <p className="font-bold text-blue-800">
                Maximum: {kpiConfig.accountsWeight} points
              </p>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-700 mb-2 flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-200 text-green-800 flex items-center justify-center mr-2">V</div>
              VAT
            </h3>
            <p className="text-sm mb-2">VAT returns on-time percentage</p>
            <div className="bg-white p-2 rounded border border-green-200">
              <p className="font-bold text-green-800">
                Maximum: {kpiConfig.vatWeight} points
              </p>
            </div>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-700 mb-2 flex items-center">
              <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center mr-2">S</div>
              SA
            </h3>
            <p className="text-sm mb-2">SA returns on-time percentage</p>
            <div className="bg-white p-2 rounded border border-amber-200">
              <p className="font-bold text-amber-800">
                Maximum: {kpiConfig.saWeight} points
              </p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg bg-slate-50 p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Lightbulb className="mr-2 h-5 w-5 text-primary" />
            Points Calculation Table
          </h3>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Completion %</TableHead>
                <TableHead className="text-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="underline decoration-dotted underline-offset-2">
                        Accounts Points
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="max-w-xs text-xs">
                          Based on current weight of {kpiConfig.accountsWeight}%
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead className="text-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="underline decoration-dotted underline-offset-2">
                        VAT Points
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="max-w-xs text-xs">
                          Based on current weight of {kpiConfig.vatWeight}%
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead className="text-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="underline decoration-dotted underline-offset-2">
                        SA Points
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="max-w-xs text-xs">
                          Based on current weight of {kpiConfig.saWeight}%
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="bg-green-50">
                <TableCell className="font-medium">≥90%</TableCell>
                <TableCell className="text-center">{kpiConfig.accountsWeight}</TableCell>
                <TableCell className="text-center">{kpiConfig.vatWeight}</TableCell>
                <TableCell className="text-center">{kpiConfig.saWeight}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">80-89%</TableCell>
                <TableCell className="text-center">{Math.round(kpiConfig.accountsWeight * 0.875)}</TableCell>
                <TableCell className="text-center">{Math.round(kpiConfig.vatWeight * 0.833)}</TableCell>
                <TableCell className="text-center">{Math.round(kpiConfig.saWeight * 0.833)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">70-79%</TableCell>
                <TableCell className="text-center">{Math.round(kpiConfig.accountsWeight * 0.75)}</TableCell>
                <TableCell className="text-center">{Math.round(kpiConfig.vatWeight * 0.667)}</TableCell>
                <TableCell className="text-center">{Math.round(kpiConfig.saWeight * 0.667)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">60-69%</TableCell>
                <TableCell className="text-center">{Math.round(kpiConfig.accountsWeight * 0.5)}</TableCell>
                <TableCell className="text-center">{Math.round(kpiConfig.vatWeight * 0.5)}</TableCell>
                <TableCell className="text-center">{Math.round(kpiConfig.saWeight * 0.5)}</TableCell>
              </TableRow>
              <TableRow className="bg-red-50">
                <TableCell className="font-medium">&lt;60%</TableCell>
                <TableCell className="text-center">0</TableCell>
                <TableCell className="text-center">0</TableCell>
                <TableCell className="text-center">0</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          
          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              <span className="font-medium">Note:</span> The thresholds above are fixed, but the point values
              adjust automatically based on the KPI weights in your settings.
            </p>
          </div>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="calculation-example">
            <AccordionTrigger>
              <div className="flex items-center">
                <Info className="mr-2 h-4 w-4 text-primary" />
                Calculation Example
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="p-4 space-y-4">
                <h4 className="font-medium">Example: Staff member with the following performance</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="bg-blue-100 p-2 rounded">
                    <p className="font-medium">Accounts: 85%</p>
                    <p className="text-xs mt-1">
                      85% is in the 80-89% band, so earns {formatPercent(0.875 * 100)}
                      of available points
                    </p>
                    <p className="font-bold mt-1">
                      {Math.round(kpiConfig.accountsWeight * 0.875)} points
                    </p>
                  </div>
                  <div className="bg-green-100 p-2 rounded">
                    <p className="font-medium">VAT: 95%</p>
                    <p className="text-xs mt-1">
                      95% is in the ≥90% band, so earns 100% of available points
                    </p>
                    <p className="font-bold mt-1">
                      {kpiConfig.vatWeight} points
                    </p>
                  </div>
                  <div className="bg-amber-100 p-2 rounded">
                    <p className="font-medium">SA: 76%</p>
                    <p className="text-xs mt-1">
                      76% is in the 70-79% band, so earns {formatPercent(0.667 * 100)}
                      of available points
                    </p>
                    <p className="font-bold mt-1">
                      {Math.round(kpiConfig.saWeight * 0.667)} points
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-center py-2">
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                </div>
                
                <div className="bg-slate-100 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">Total KPI Score:</p>
                    <p className="font-bold">
                      {Math.round(kpiConfig.accountsWeight * 0.875) + 
                        kpiConfig.vatWeight + 
                        Math.round(kpiConfig.saWeight * 0.667)} points
                    </p>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="font-medium mb-2">Bonus Calculation:</p>
                    <div className="space-y-1 text-sm">
                      <p>1. Quarterly Bonus Pool: {formatCurrency(sampleSalary)} ÷ {kpiConfig.bonusPoolDivisor} = {formatCurrency(bonusPool)}</p>
                      <p>2. Points Percentage: {Math.round(kpiConfig.accountsWeight * 0.875) + 
                        kpiConfig.vatWeight + 
                        Math.round(kpiConfig.saWeight * 0.667)}%</p>
                      <p>3. Bonus Amount: {formatCurrency(bonusPool)} × {(Math.round(kpiConfig.accountsWeight * 0.875) + 
                        kpiConfig.vatWeight + 
                        Math.round(kpiConfig.saWeight * 0.667)) / 100} = 
                        {formatCurrency((bonusPool * (Math.round(kpiConfig.accountsWeight * 0.875) + 
                          kpiConfig.vatWeight + 
                          Math.round(kpiConfig.saWeight * 0.667)) / 100))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="target-setting">
            <AccordionTrigger>
              <div className="flex items-center">
                <Info className="mr-2 h-4 w-4 text-primary" />
                Best Practices for Target Setting
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="p-4 space-y-4">
                <p className="text-sm">
                  Effective target setting is crucial for motivating staff while keeping goals
                  achievable. Here are some guidelines:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>
                    <span className="font-medium">Use historical data</span>: Base targets on past
                    performance to ensure they're realistic
                  </li>
                  <li>
                    <span className="font-medium">Account for seasonality</span>: Adjust targets for
                    known busy periods (e.g., tax season)
                  </li>
                  <li>
                    <span className="font-medium">Consider team capacity</span>: Factor in staff 
                    availability, experience levels, and workload
                  </li>
                  <li>
                    <span className="font-medium">Start conservatively</span>: Begin with achievable
                    targets and gradually increase as performance improves
                  </li>
                  <li>
                    <span className="font-medium">Review quarterly</span>: Regularly assess whether
                    targets remain appropriate and adjust if needed
                  </li>
                </ul>
                
                <div className="bg-blue-50 p-3 rounded-lg text-sm">
                  <h4 className="font-medium text-blue-700 mb-2">Target Setting Formula Example:</h4>
                  <p className="mb-2">For monthly accounts targets:</p>
                  <ol className="list-decimal list-inside space-y-1 text-blue-800">
                    <li>Start with historical average (e.g., 40 accounts per month)</li>
                    <li>Adjust for current team capacity (e.g., × 1.1 for added capacity)</li>
                    <li>Factor in seasonal variation (e.g., × 0.9 for holiday periods)</li>
                    <li>Result: 40 × 1.1 × 0.9 = 40 accounts target</li>
                  </ol>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default KpiScoringGuide; 