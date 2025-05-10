import { useState } from "react";
import { 
  mockStaffMembers, 
  KpiScore, 
  calculateKpiPoints,
  getStaffMemberById
} from "@/lib/kpi-data";
import {
  Card,
  CardContent,
  CardDescription,
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

const StaffPerformance = () => {
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [month, setMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // YYYY-MM format
  );
  const [kpiData, setKpiData] = useState<{
    accounts: number;
    vat: number;
    sa: number;
  }>({
    accounts: 0,
    vat: 0,
    sa: 0,
  });
  const { toast } = useToast();

  // Calculate points based on percentages
  const accountsPoints = calculateKpiPoints(kpiData.accounts, 'accounts');
  const vatPoints = calculateKpiPoints(kpiData.vat, 'vat');
  const saPoints = calculateKpiPoints(kpiData.sa, 'sa');
  const totalPoints = accountsPoints + vatPoints + saPoints;
  
  // Get the selected staff member's salary
  const selectedStaffMember = selectedStaff ? getStaffMemberById(selectedStaff) : null;
  const staffSalary = selectedStaffMember?.salary || 150000; // Use 150000 as fallback
  const bonusPool = staffSalary / 4; // Monthly salary / 4
  const bonusAmount = Math.round((totalPoints / 100) * bonusPool);

  const handleInputChange = (field: keyof typeof kpiData, value: string) => {
    // Ensure input is between 0 and 100
    const numValue = Math.min(100, Math.max(0, parseInt(value) || 0));
    setKpiData({
      ...kpiData,
      [field]: numValue,
    });
  };

  const handleStaffChange = (staffId: string) => {
    setSelectedStaff(staffId);
    // Reset KPI data when staff changes
    setKpiData({
      accounts: 0,
      vat: 0,
      sa: 0,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStaff) {
      toast({
        title: "Selection required",
        description: "Please select a staff member",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would save to a database
    toast({
      title: "Performance data saved",
      description: `Data for ${mockStaffMembers.find(s => s.id === selectedStaff)?.name} has been recorded.`,
    });
    
    // Reset form
    setKpiData({
      accounts: 0,
      vat: 0,
      sa: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Staff Performance</h2>
        <p className="text-muted-foreground">Enter and update monthly KPI data for staff members.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Enter Performance Data</CardTitle>
            <CardDescription>Add monthly KPI percentages for staff members</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="staff">Staff Member</Label>
                  <Select
                    value={selectedStaff}
                    onValueChange={handleStaffChange}
                  >
                    <SelectTrigger id="staff">
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockStaffMembers.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="month">Month</Label>
                  <Input
                    id="month"
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="accounts">Accounts On-Time %</Label>
                  <div className="flex items-center">
                    <Input
                      id="accounts"
                      type="number"
                      min="0"
                      max="100"
                      value={kpiData.accounts}
                      onChange={(e) => handleInputChange('accounts', e.target.value)}
                      className="flex-1"
                    />
                    <span className="ml-2">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Points: {accountsPoints}/40
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vat">VAT Returns On-Time %</Label>
                  <div className="flex items-center">
                    <Input
                      id="vat"
                      type="number"
                      min="0"
                      max="100"
                      value={kpiData.vat}
                      onChange={(e) => handleInputChange('vat', e.target.value)}
                      className="flex-1"
                    />
                    <span className="ml-2">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Points: {vatPoints}/30
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sa">SA Returns On-Time %</Label>
                  <div className="flex items-center">
                    <Input
                      id="sa"
                      type="number"
                      min="0"
                      max="100"
                      value={kpiData.sa}
                      onChange={(e) => handleInputChange('sa', e.target.value)}
                      className="flex-1"
                    />
                    <span className="ml-2">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Points: {saPoints}/30
                  </p>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full md:w-auto bg-company-primary hover:bg-company-secondary"
              >
                Save Performance Data
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>Preview calculated results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Score</h3>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{totalPoints}</span>
                <span className="text-lg">/100 points</span>
              </div>
              <div className="mt-2 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-company-primary"
                  style={{ width: `${totalPoints}%` }}
                />
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Estimated Bonus</h3>
              <p className="text-2xl font-bold">LKR {bonusAmount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">
                {totalPoints}% of LKR {bonusPool.toLocaleString()} pool
                {selectedStaffMember && (
                  <span className="block mt-1">Based on salary: LKR {staffSalary.toLocaleString()}</span>
                )}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Performance Level</h3>
              <div className="flex items-center mt-1">
                {totalPoints >= 90 ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                    Excellent
                  </span>
                ) : totalPoints >= 80 ? (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                    Very Good
                  </span>
                ) : totalPoints >= 70 ? (
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-sm font-medium">
                    Good
                  </span>
                ) : totalPoints >= 60 ? (
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm font-medium">
                    Satisfactory
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm font-medium">
                    Needs Improvement
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffPerformance;
