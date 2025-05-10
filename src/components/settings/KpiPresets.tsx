import { useState } from "react";
import { ArrowRight, Check, Info, Calculator } from "lucide-react";
import { useSettings, KpiCalculationConfig } from "@/contexts/SettingsContext";
import { Button } from "@/components/ui/button";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// KPI weight presets for different business types
const KPI_PRESETS: Record<string, { name: string; config: KpiCalculationConfig; description: string }> = {
  "accounting-standard": {
    name: "Accounting Firm (Standard)",
    config: {
      accountsWeight: 40,
      vatWeight: 30,
      saWeight: 30,
      bonusPoolDivisor: 4,
    },
    description: "Balanced weights for general accounting practices",
  },
  "accounting-sa-focus": {
    name: "Accounting Firm (SA Focus)",
    config: {
      accountsWeight: 30,
      vatWeight: 20,
      saWeight: 50,
      bonusPoolDivisor: 4,
    },
    description: "Higher weight on SA returns for practices with tax specialization",
  },
  "accounting-sme": {
    name: "Small Business Accounting",
    config: {
      accountsWeight: 50,
      vatWeight: 30,
      saWeight: 20,
      bonusPoolDivisor: 4,
    },
    description: "Emphasis on accounts production for small business specialists",
  },
  "bookkeeping": {
    name: "Bookkeeping Focus",
    config: {
      accountsWeight: 60,
      vatWeight: 30,
      saWeight: 10,
      bonusPoolDivisor: 4,
    },
    description: "Heavy emphasis on accounts production for bookkeeping services",
  },
  "tax-practice": {
    name: "Tax Practice",
    config: {
      accountsWeight: 20,
      vatWeight: 30,
      saWeight: 50,
      bonusPoolDivisor: 4,
    },
    description: "Priority on tax return preparation for tax specialists",
  },
};

// Example staff performance for what-if scenarios
const EXAMPLE_PERFORMANCE = {
  accounts: 85, // 85% on-time
  vat: 90, // 90% on-time
  sa: 75, // 75% on-time
};

// Example salary for calculations
const EXAMPLE_SALARY = 60000;

interface KpiPresetsProps {
  onApplyPreset: (config: KpiCalculationConfig) => void;
  currentConfig: KpiCalculationConfig;
}

const KpiPresets: React.FC<KpiPresetsProps> = ({ onApplyPreset, currentConfig }) => {
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [simulationConfig, setSimulationConfig] = useState<KpiCalculationConfig>(currentConfig);
  const { formatCurrency } = useSettings();
  const { toast } = useToast();

  // Apply a preset
  const handlePresetSelect = (presetKey: string) => {
    const preset = KPI_PRESETS[presetKey];
    setSelectedPreset(presetKey);
    setSimulationConfig(preset.config);
    
    toast({
      title: "KPI preset applied",
      description: `Applied the "${preset.name}" preset for simulation`,
    });
  };

  // Apply the current simulation to actual config
  const handleApplyConfig = () => {
    onApplyPreset(simulationConfig);
    
    toast({
      title: "KPI weights updated",
      description: "The new KPI weights have been applied to your settings",
    });
  };

  // Calculate KPI points based on a configuration
  const calculateKpiPoints = (config: KpiCalculationConfig, performance = EXAMPLE_PERFORMANCE) => {
    // Calculate points for each area based on tiered system
    let accountsPoints = 0;
    if (performance.accounts >= 90) accountsPoints = config.accountsWeight;
    else if (performance.accounts >= 80) accountsPoints = Math.round(config.accountsWeight * 0.875);
    else if (performance.accounts >= 70) accountsPoints = Math.round(config.accountsWeight * 0.75);
    else if (performance.accounts >= 60) accountsPoints = Math.round(config.accountsWeight * 0.5);
    
    let vatPoints = 0;
    if (performance.vat >= 90) vatPoints = config.vatWeight;
    else if (performance.vat >= 80) vatPoints = Math.round(config.vatWeight * 0.833);
    else if (performance.vat >= 70) vatPoints = Math.round(config.vatWeight * 0.667);
    else if (performance.vat >= 60) vatPoints = Math.round(config.vatWeight * 0.5);
    
    let saPoints = 0;
    if (performance.sa >= 90) saPoints = config.saWeight;
    else if (performance.sa >= 80) saPoints = Math.round(config.saWeight * 0.833);
    else if (performance.sa >= 70) saPoints = Math.round(config.saWeight * 0.667);
    else if (performance.sa >= 60) saPoints = Math.round(config.saWeight * 0.5);
    
    const totalPoints = accountsPoints + vatPoints + saPoints;
    
    return {
      accountsPoints,
      vatPoints,
      saPoints,
      totalPoints,
    };
  };

  // Calculate bonus based on points and configuration
  const calculateBonus = (config: KpiCalculationConfig, points: number, salary = EXAMPLE_SALARY) => {
    const bonusPool = salary / config.bonusPoolDivisor;
    return (points / 100) * bonusPool;
  };

  // Get the calculation results for current simulation
  const simulationResults = calculateKpiPoints(simulationConfig);
  const simulationBonus = calculateBonus(
    simulationConfig,
    simulationResults.totalPoints,
    EXAMPLE_SALARY
  );

  // Get the calculation results for current actual config
  const currentResults = calculateKpiPoints(currentConfig);
  const currentBonus = calculateBonus(
    currentConfig,
    currentResults.totalPoints,
    EXAMPLE_SALARY
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="mr-2 h-5 w-5" />
          KPI Weight Templates
        </CardTitle>
        <CardDescription>
          Apply predefined KPI weight configurations for different business types
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium">Business Type Preset</label>
          <Select value={selectedPreset} onValueChange={handlePresetSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a KPI weight preset" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(KPI_PRESETS).map(([key, preset]) => (
                <SelectItem key={key} value={key}>
                  {preset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedPreset && (
            <p className="text-sm text-muted-foreground">
              {KPI_PRESETS[selectedPreset].description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Simulation Results</h3>
            <p className="text-xs text-muted-foreground mb-2">
              Based on: Accounts: 85%, VAT: 90%, SA: 75%
            </p>

            {/* Visual representation of weights */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Accounts ({simulationConfig.accountsWeight}%)</span>
                <span>{simulationResults.accountsPoints} points</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500" 
                  style={{ width: `${(simulationResults.accountsPoints / simulationConfig.accountsWeight) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs">
                <span>VAT ({simulationConfig.vatWeight}%)</span>
                <span>{simulationResults.vatPoints} points</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500" 
                  style={{ width: `${(simulationResults.vatPoints / simulationConfig.vatWeight) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs">
                <span>SA ({simulationConfig.saWeight}%)</span>
                <span>{simulationResults.saPoints} points</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500" 
                  style={{ width: `${(simulationResults.saPoints / simulationConfig.saWeight) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total KPI Score:</span>
                <span className="text-lg font-bold">{simulationResults.totalPoints} points</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="font-medium">Estimated Bonus:</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(simulationBonus)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Based on {formatCurrency(EXAMPLE_SALARY)} annual salary, 
                with bonus pool = salary ÷ {simulationConfig.bonusPoolDivisor}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Current Configuration</h3>
            <div className="flex justify-between font-medium text-sm">
              <div>Accounts: {currentConfig.accountsWeight}%</div>
              <div>VAT: {currentConfig.vatWeight}%</div>
              <div>SA: {currentConfig.saWeight}%</div>
            </div>

            <div className="h-6 w-full rounded-full overflow-hidden bg-gray-200 flex">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${currentConfig.accountsWeight}%` }}
              ></div>
              <div
                className="h-full bg-green-500"
                style={{ width: `${currentConfig.vatWeight}%` }}
              ></div>
              <div
                className="h-full bg-amber-500"
                style={{ width: `${currentConfig.saWeight}%` }}
              ></div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2">Current vs Simulation Comparison</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Configuration</TableHead>
                    <TableHead className="text-right">KPI Score</TableHead>
                    <TableHead className="text-right">Bonus Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Current</TableCell>
                    <TableCell className="text-right">{currentResults.totalPoints}</TableCell>
                    <TableCell className="text-right">{formatCurrency(currentBonus)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Simulation</TableCell>
                    <TableCell className="text-right">{simulationResults.totalPoints}</TableCell>
                    <TableCell className="text-right">{formatCurrency(simulationBonus)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Difference</TableCell>
                    <TableCell className="text-right font-bold">
                      {simulationResults.totalPoints > currentResults.totalPoints ? "+" : ""}
                      {simulationResults.totalPoints - currentResults.totalPoints}
                    </TableCell>
                    <TableCell 
                      className={`text-right font-bold ${
                        simulationBonus > currentBonus ? "text-green-600" : 
                        simulationBonus < currentBonus ? "text-red-600" : ""
                      }`}
                    >
                      {simulationBonus > currentBonus ? "+" : ""}
                      {formatCurrency(simulationBonus - currentBonus)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg flex items-start">
          <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-blue-700">Best Practices</h4>
            <ul className="text-xs text-blue-800 space-y-1 list-disc pl-4">
              <li>Align KPI weights with your business priorities and service mix</li>
              <li>Ensure weights total exactly 100% for accurate bonus calculations</li>
              <li>Review and adjust weights quarterly to reflect changing business focus</li>
              <li>Consider seasonal variations when setting performance targets</li>
              <li>Use the simulation tool to test impact before applying changes</li>
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button 
          onClick={handleApplyConfig}
          className="w-full"
          disabled={!selectedPreset}
        >
          <Check className="mr-2 h-4 w-4" />
          Apply This Configuration
        </Button>
      </CardFooter>
    </Card>
  );
};

export default KpiPresets; 