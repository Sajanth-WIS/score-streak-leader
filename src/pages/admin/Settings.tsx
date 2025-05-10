import { useState } from "react";
import {
  useSettings,
  CURRENCIES,
  KpiCalculationConfig,
  AppSettings,
} from "@/contexts/SettingsContext";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  RefreshCw,
  Save,
  CalendarDays,
  Sparkles,
  Bell,
  Users,
  UserCircle,
  Table2,
  CreditCard,
  Percent,
  Laptop,
  Palette,
} from "lucide-react";
import TeamManagement from "@/components/settings/TeamManagement";
import KpiPresets from "@/components/settings/KpiPresets";
import KpiScoringGuide from "@/components/settings/KpiScoringGuide";
import FiscalPeriodTemplates from "@/components/settings/FiscalPeriodTemplates";

const Settings = () => {
  const { settings, updateSettings, updateKpiCalculation, resetSettings, formatCurrency } = useSettings();
  const [activeTab, setActiveTab] = useState("appearance");
  const { toast } = useToast();

  // Create a copy of settings that we can modify before saving
  const [localSettings, setLocalSettings] = useState<AppSettings>({ ...settings });
  const [kpiWeights, setKpiWeights] = useState<KpiCalculationConfig>({ ...settings.kpiCalculation });

  // Update local settings
  const handleSettingChange = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Save all settings
  const handleSaveSettings = () => {
    // Validate KPI weights sum to 100
    const totalWeight = kpiWeights.accountsWeight + kpiWeights.vatWeight + kpiWeights.saWeight;
    if (totalWeight !== 100) {
      toast({
        title: "Invalid KPI weights",
        description: `KPI weights must sum to 100%. Current total: ${totalWeight}%`,
        variant: "destructive",
      });
      return;
    }

    // Update with new local settings
    updateSettings({
      ...localSettings,
      kpiCalculation: kpiWeights,
    });

    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully.",
    });
  };

  // Reset all settings to defaults
  const handleResetSettings = () => {
    resetSettings();
    setLocalSettings({ ...settings });
    setKpiWeights({ ...settings.kpiCalculation });

    toast({
      title: "Settings reset",
      description: "All settings have been reset to their default values.",
    });
  };

  // Handle KPI weight changes while ensuring they sum to 100
  const handleKpiWeightChange = (type: keyof KpiCalculationConfig, value: number) => {
    // Only handle the specific weight types, not the divisor
    if (type !== 'accountsWeight' && type !== 'vatWeight' && type !== 'saWeight') {
      setKpiWeights(prev => ({ ...prev, [type]: value }));
      return;
    }
    
    const oldValue = kpiWeights[type];
    const difference = value - oldValue;
    
    // If increasing a weight, decrease others proportionally
    if (difference > 0) {
      const othersTotal = 100 - oldValue;
      const otherKeys = ['accountsWeight', 'vatWeight', 'saWeight'].filter(k => k !== type) as Array<'accountsWeight' | 'vatWeight' | 'saWeight'>;
      
      // Calculate how much to reduce each of the other weights
      const newKpiWeights = { ...kpiWeights };
      newKpiWeights[type] = value;
      
      otherKeys.forEach(key => {
        const proportion = kpiWeights[key] / othersTotal;
        newKpiWeights[key] = Math.max(0, kpiWeights[key] - (difference * proportion));
      });
      
      // Round to ensure sum is 100
      const total = newKpiWeights.accountsWeight + newKpiWeights.vatWeight + newKpiWeights.saWeight;
      const roundingAdjustment = 100 - total;
      
      if (Math.abs(roundingAdjustment) > 0.01) {
        const largestKey = otherKeys.reduce((a, b) => newKpiWeights[a] > newKpiWeights[b] ? a : b);
        newKpiWeights[largestKey] += roundingAdjustment;
      }
      
      setKpiWeights(newKpiWeights);
    } 
    // If decreasing a weight, increase others proportionally
    else if (difference < 0) {
      const othersTotal = 100 - oldValue;
      const otherKeys = ['accountsWeight', 'vatWeight', 'saWeight'].filter(k => k !== type) as Array<'accountsWeight' | 'vatWeight' | 'saWeight'>;
      
      const newKpiWeights = { ...kpiWeights };
      newKpiWeights[type] = value;
      
      otherKeys.forEach(key => {
        const proportion = kpiWeights[key] / othersTotal;
        newKpiWeights[key] = kpiWeights[key] - (difference * proportion);
      });
      
      // Round to ensure sum is 100
      const total = newKpiWeights.accountsWeight + newKpiWeights.vatWeight + newKpiWeights.saWeight;
      const roundingAdjustment = 100 - total;
      
      if (Math.abs(roundingAdjustment) > 0.01) {
        const largestKey = otherKeys.reduce((a, b) => newKpiWeights[a] > newKpiWeights[b] ? a : b);
        newKpiWeights[largestKey] += roundingAdjustment;
      }
      
      setKpiWeights(newKpiWeights);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Application Settings</h2>
        <p className="text-muted-foreground">
          Customize the application to suit your preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 md:w-[750px]">
          <TabsTrigger value="appearance" className="transition-all duration-200 ease-in-out">
            <Palette className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="currency" className="transition-all duration-200 ease-in-out">
            <CreditCard className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Currency</span>
          </TabsTrigger>
          <TabsTrigger value="kpi" className="transition-all duration-200 ease-in-out">
            <Percent className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">KPI Calculation</span>
          </TabsTrigger>
          <TabsTrigger value="display" className="transition-all duration-200 ease-in-out">
            <Table2 className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Display</span>
          </TabsTrigger>
          <TabsTrigger value="teams" className="transition-all duration-200 ease-in-out">
            <Users className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Teams</span>
          </TabsTrigger>
        </TabsList>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card className="transform transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="mr-2 h-5 w-5 text-primary" />
                Appearance Settings
              </CardTitle>
              <CardDescription>Customize how the application looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="date-format" className="flex items-center">
                  <CalendarDays className="mr-2 h-4 w-4 text-primary" />
                  Date Format
                </Label>
                <Select
                  value={localSettings.dateFormat}
                  onValueChange={(value) => handleSettingChange("dateFormat", value)}
                >
                  <SelectTrigger id="date-format" className="transition-all duration-200">
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD-MMM-YYYY">DD-MMM-YYYY</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="animations" className="flex items-center">
                    <Sparkles className="mr-2 h-4 w-4 text-primary" />
                    Enable Animations
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Show smooth transitions and subtle animations
                  </p>
                </div>
                <Switch
                  id="animations"
                  checked={localSettings.animationsEnabled}
                  onCheckedChange={(checked) =>
                    handleSettingChange("animationsEnabled", checked)
                  }
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications" className="flex items-center">
                    <Bell className="mr-2 h-4 w-4 text-primary" />
                    Enable Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about system updates
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={localSettings.enableNotifications}
                  onCheckedChange={(checked) =>
                    handleSettingChange("enableNotifications", checked)
                  }
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Currency Tab */}
        <TabsContent value="currency">
          <Card className="transform transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5 text-primary" />
                Currency Settings
              </CardTitle>
              <CardDescription>Configure currency display and formatting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={localSettings.currency.code}
                  onValueChange={(value) =>
                    handleSettingChange("currency", CURRENCIES[value])
                  }
                >
                  <SelectTrigger id="currency" className="transition-all duration-200">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CURRENCIES).map(([code, currency]) => (
                      <SelectItem key={code} value={code}>
                        {currency.symbol} {code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency-position">Symbol Position</Label>
                <Select
                  value={localSettings.currency.position}
                  onValueChange={(value: 'prefix' | 'suffix') => {
                    const newCurrency = {
                      ...localSettings.currency,
                      position: value,
                    };
                    handleSettingChange("currency", newCurrency);
                  }}
                >
                  <SelectTrigger id="currency-position" className="transition-all duration-200">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prefix">Before amount ({localSettings.currency.symbol} 1,000)</SelectItem>
                    <SelectItem value="suffix">After amount (1,000 {localSettings.currency.symbol})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 border rounded-md transition-all duration-300 hover:border-primary">
                <p className="text-sm font-medium mb-2">Preview:</p>
                <p className="text-lg font-medium">{formatCurrency(10000)}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* KPI Calculation Tab */}
        <TabsContent value="kpi">
          <div className="space-y-6">
            <Card className="transform transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Percent className="mr-2 h-5 w-5 text-primary" />
                  KPI Calculation Settings
                </CardTitle>
                <CardDescription>Configure how performance scores are calculated</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="accounts-weight">Accounts Weight</Label>
                    <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full transition-all duration-200">
                      {Math.round(kpiWeights.accountsWeight)}%
                    </span>
                  </div>
                  <Slider
                    id="accounts-weight"
                    min={0}
                    max={100}
                    step={1}
                    value={[kpiWeights.accountsWeight]}
                    onValueChange={([value]) => handleKpiWeightChange("accountsWeight", value)}
                    className="transition-all duration-200"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="vat-weight">VAT Weight</Label>
                    <span className="text-sm font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full transition-all duration-200">
                      {Math.round(kpiWeights.vatWeight)}%
                    </span>
                  </div>
                  <Slider
                    id="vat-weight"
                    min={0}
                    max={100}
                    step={1}
                    value={[kpiWeights.vatWeight]}
                    onValueChange={([value]) => handleKpiWeightChange("vatWeight", value)}
                    className="transition-all duration-200"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="sa-weight">SA Weight</Label>
                    <span className="text-sm font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full transition-all duration-200">
                      {Math.round(kpiWeights.saWeight)}%
                    </span>
                  </div>
                  <Slider
                    id="sa-weight"
                    min={0}
                    max={100}
                    step={1}
                    value={[kpiWeights.saWeight]}
                    onValueChange={([value]) => handleKpiWeightChange("saWeight", value)}
                    className="transition-all duration-200"
                  />
                </div>

                <div className="p-4 border rounded-md transition-all duration-300 hover:border-primary">
                  <p className="text-sm font-medium mb-2">Weight Distribution:</p>
                  <div className="h-6 w-full rounded-full overflow-hidden bg-gray-200">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${kpiWeights.accountsWeight}%` }}
                    ></div>
                    <div
                      className="h-full bg-green-500 -mt-6 transition-all duration-300"
                      style={{ 
                        width: `${kpiWeights.vatWeight}%`,
                        marginLeft: `${kpiWeights.accountsWeight}%`
                      }}
                    ></div>
                    <div
                      className="h-full bg-amber-500 -mt-6 transition-all duration-300"
                      style={{ 
                        width: `${kpiWeights.saWeight}%`,
                        marginLeft: `${kpiWeights.accountsWeight + kpiWeights.vatWeight}%`
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs font-medium">
                    <span className="text-blue-600">Accounts</span>
                    <span className="text-green-600">VAT</span>
                    <span className="text-amber-600">SA</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bonus-divisor">Bonus Pool Calculation</Label>
                  <Select
                    value={kpiWeights.bonusPoolDivisor.toString()}
                    onValueChange={(value) => handleKpiWeightChange("bonusPoolDivisor", parseInt(value))}
                  >
                    <SelectTrigger id="bonus-divisor" className="transition-all duration-200">
                      <SelectValue placeholder="Select bonus calculation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">Monthly (Annual Salary ÷ 12)</SelectItem>
                      <SelectItem value="4">Quarterly (Annual Salary ÷ 4)</SelectItem>
                      <SelectItem value="2">Bi-annual (Annual Salary ÷ 2)</SelectItem>
                      <SelectItem value="1">Annual (Full Annual Salary)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <KpiPresets 
                onApplyPreset={(newConfig) => {
                  setKpiWeights(newConfig);
                  toast({
                    title: "KPI preset applied",
                    description: "The KPI weights have been updated according to the selected preset.",
                  });
                }} 
                currentConfig={kpiWeights} 
              />
              
              <KpiScoringGuide kpiConfig={kpiWeights} />
            </div>

            <FiscalPeriodTemplates 
              onSelect={(fiscalConfig) => {
                toast({
                  title: "Fiscal period template applied",
                  description: `Applied the ${fiscalConfig.description} template`,
                });
              }}
            />
          </div>
        </TabsContent>

        {/* Display Options Tab */}
        <TabsContent value="display">
          <Card className="transform transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Table2 className="mr-2 h-5 w-5 text-primary" />
                Display Options
              </CardTitle>
              <CardDescription>Configure what information is shown in the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-team-filters">Show Team Filters</Label>
                  <p className="text-sm text-muted-foreground">
                    Display team filtering options in tables
                  </p>
                </div>
                <Switch
                  id="show-team-filters"
                  checked={localSettings.showTeamFilters}
                  onCheckedChange={(checked) =>
                    handleSettingChange("showTeamFilters", checked)
                  }
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-salaries">Show Salary Information</Label>
                  <p className="text-sm text-muted-foreground">
                    Display salary and bonus information to all users
                  </p>
                </div>
                <Switch
                  id="show-salaries"
                  checked={localSettings.showSalaries}
                  onCheckedChange={(checked) =>
                    handleSettingChange("showSalaries", checked)
                  }
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-view">Default View</Label>
                <Select
                  value={localSettings.defaultView}
                  onValueChange={(value: 'team' | 'individual') =>
                    handleSettingChange("defaultView", value)
                  }
                >
                  <SelectTrigger id="default-view" className="transition-all duration-200">
                    <SelectValue placeholder="Select default view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="team">
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4 text-primary" />
                        Team View
                      </div>
                    </SelectItem>
                    <SelectItem value="individual">
                      <div className="flex items-center">
                        <UserCircle className="mr-2 h-4 w-4 text-primary" />
                        Individual View
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="page-size">Items Per Page</Label>
                <Select
                  value={localSettings.pageSize.toString()}
                  onValueChange={(value) =>
                    handleSettingChange("pageSize", parseInt(value))
                  }
                >
                  <SelectTrigger id="page-size" className="transition-all duration-200">
                    <SelectValue placeholder="Select items per page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 items</SelectItem>
                    <SelectItem value="10">10 items</SelectItem>
                    <SelectItem value="25">25 items</SelectItem>
                    <SelectItem value="50">50 items</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teams Tab */}
        <TabsContent value="teams">
          <TeamManagement />
        </TabsContent>
      </Tabs>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleResetSettings}
          className="group transition-all duration-300 hover:border-red-300 hover:bg-red-50"
        >
          <RefreshCw className="mr-2 h-4 w-4 group-hover:text-red-500 transition-all duration-300" />
          Reset to Defaults
        </Button>
        <Button 
          onClick={handleSaveSettings}
          className="bg-primary hover:bg-primary/90 transition-all duration-300"
        >
          <Save className="mr-2 h-4 w-4 transition-transform group-hover:scale-110 duration-300" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default Settings; 