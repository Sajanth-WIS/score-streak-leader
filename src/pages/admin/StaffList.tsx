import { useState, useEffect } from "react";
import { mockStaffMembers, StaffMember } from "@/lib/kpi-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  PencilLine, 
  Trash, 
  Save, 
  X, 
  FileDown, 
  FileUp, 
  UserPlus, 
  Search, 
  Users,
  BadgeCheck,
  ArrowRight,
  Mail,
  CreditCard,
  Calculator
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettings } from "@/contexts/SettingsContext";
import { BonusCalculator } from "@/components/BonusCalculator";
import { useTeams } from "@/contexts/TeamContext";
import { getTextColorForBackground } from "@/types/team";

const StaffList = () => {
  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
    const stored = localStorage.getItem("staffList");
    if (stored) {
      try {
        return JSON.parse(stored) as StaffMember[];
      } catch {
        return mockStaffMembers;
      }
    }
    return mockStaffMembers;
  });
  const [newStaff, setNewStaff] = useState<{
    name: string;
    email: string;
    team: string;
    salary: number;
  }>({
    name: "",
    email: "",
    team: "",
    salary: 0,
  });
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTeam, setFilterTeam] = useState<string>("all");
  const { toast } = useToast();
  const { settings, formatCurrency } = useSettings();
  const { teams, getTeamByName, incrementTeamMemberCount, decrementTeamMemberCount } = useTeams();

  // Get unique team names for filtering
  const teamOptions = Array.from(new Set(staffList.map(staff => staff.team)));

  // Filter staff list by search query and team
  const filteredStaffList = staffList.filter(staff => {
    const matchesSearch = 
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTeam = filterTeam === "all" || staff.team === filterTeam;
    
    return matchesSearch && matchesTeam;
  });

  // Handle input change for new staff
  const handleInputChange = (field: keyof typeof newStaff, value: string | number) => {
    setNewStaff({
      ...newStaff,
      [field]: field === 'salary' ? Number(value) : value,
    });
  };

  // Handle input change when editing
  const handleEditChange = (field: keyof StaffMember, value: string | number) => {
    if (!editingStaff) return;
    
    setEditingStaff({
      ...editingStaff,
      [field]: field === 'salary' ? Number(value) : value,
    });
  };

  // Add new staff member
  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newStaff.name || !newStaff.team || newStaff.salary <= 0) {
      toast({
        title: "Missing information",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would save to a database
    const newStaffMember: StaffMember = {
      id: `${Date.now()}`, // Use timestamp for unique ID
      name: newStaff.name,
      email: newStaff.email,
      team: newStaff.team,
      salary: newStaff.salary,
    };
    
    setStaffList([...staffList, newStaffMember]);
    
    // Update team member count
    if (newStaff.team) {
      const team = getTeamByName(newStaff.team);
      if (team) {
        incrementTeamMemberCount(team.id);
      }
    }
    
    toast({
      title: "Staff member added",
      description: `${newStaff.name} has been added to the staff list.`,
    });
    
    // Reset form
    setNewStaff({
      name: "",
      email: "",
      team: "",
      salary: 0,
    });
  };

  // Start editing a staff member
  const handleEditStart = (staff: StaffMember) => {
    setEditingStaff({...staff});
    setEditMode(staff.id);
  };

  // Cancel editing
  const handleEditCancel = () => {
    setEditingStaff(null);
    setEditMode(null);
  };

  // Save edited staff member
  const handleEditSave = () => {
    if (!editingStaff) return;
    
    // Validation
    if (!editingStaff.name || !editingStaff.team || editingStaff.salary <= 0) {
      toast({
        title: "Missing information",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }
    
    // Check if team has changed to update member counts
    const oldTeam = staffList.find(staff => staff.id === editingStaff.id)?.team;
    const teamChanged = oldTeam !== editingStaff.team;
    
    // Update staff list
    const updatedList = staffList.map(staff => 
      staff.id === editingStaff.id ? editingStaff : staff
    );
    
    setStaffList(updatedList);
    setEditMode(null);
    setEditingStaff(null);
    
    // Update team member counts if team changed
    if (teamChanged) {
      if (oldTeam) {
        const oldTeamObj = getTeamByName(oldTeam);
        if (oldTeamObj) {
          decrementTeamMemberCount(oldTeamObj.id);
        }
      }
      
      if (editingStaff.team) {
        const newTeamObj = getTeamByName(editingStaff.team);
        if (newTeamObj) {
          incrementTeamMemberCount(newTeamObj.id);
        }
      }
    }
    
    toast({
      title: "Staff updated",
      description: `${editingStaff.name}'s information has been updated.`,
    });
  };

  // Delete staff member
  const handleDeleteStaff = (staffId: string) => {
    const staffToDelete = staffList.find(staff => staff.id === staffId);
    if (!staffToDelete) return;
    
    const updatedList = staffList.filter(staff => staff.id !== staffId);
    setStaffList(updatedList);
    
    // Update team member count
    if (staffToDelete.team) {
      const team = getTeamByName(staffToDelete.team);
      if (team) {
        decrementTeamMemberCount(team.id);
      }
    }
    
    toast({
      title: "Staff removed",
      description: `${staffToDelete.name} has been removed from the system.`,
    });
  };

  // Export staff data as JSON
  const handleExportData = () => {
    const dataStr = JSON.stringify(staffList, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'staff-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Export successful",
      description: "Staff data has been exported as JSON."
    });
  };

  // Import staff data from JSON
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);
        
        // Basic validation that it's an array of staff members
        if (!Array.isArray(jsonData)) {
          throw new Error("Invalid data format");
        }
        
        // Check if each item has the required properties
        for (const item of jsonData) {
          if (!item.id || !item.name || !item.team || typeof item.salary !== 'number') {
            throw new Error("Invalid staff data format");
          }
        }
        
        setStaffList(jsonData);
        toast({
          title: "Import successful",
          description: `Imported ${jsonData.length} staff members.`
        });
      } catch (error) {
        toast({
          title: "Import failed",
          description: error instanceof Error ? error.message : "Invalid data format",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    e.target.value = '';
  };

  // Add a helper function to get team color
  const getTeamColor = (teamName: string) => {
    const team = getTeamByName(teamName);
    return team ? team.color : '#e5e7eb'; // Default gray if team not found
  };

  // Persist staff list to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("staffList", JSON.stringify(staffList));
  }, [staffList]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Staff List</h2>
        <p className="text-muted-foreground">Manage staff members in the KPI tracking system.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 transform transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-primary" />
              Staff Directory
            </CardTitle>
            <CardDescription>All staff members currently in the system</CardDescription>
            
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <div className="flex-grow relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 transition-all duration-200 focus:border-primary"
                />
              </div>
              <div className="w-full sm:w-40">
                <Select
                  value={filterTeam}
                  onValueChange={setFilterTeam}
                >
                  <SelectTrigger className="transition-all duration-200 focus:border-primary">
                    <SelectValue placeholder="Filter by team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    {teamOptions.map(team => (
                      <SelectItem key={team} value={team}>{team}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Monthly Salary</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaffList.map((staff) => (
                  <TableRow key={staff.id} className="transition-all duration-200 hover:bg-muted/50">
                    {editMode === staff.id ? (
                      // Edit mode
                      <>
                        <TableCell>
                          <Input
                            value={editingStaff?.name || ''}
                            onChange={(e) => handleEditChange('name', e.target.value)}
                            className="w-full transition-all duration-200 focus:border-primary"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={editingStaff?.team || ''}
                            onValueChange={(value) => handleEditChange('team', value)}
                          >
                            <SelectTrigger className="w-full transition-all duration-200 focus:border-primary">
                              <SelectValue placeholder="Select team" />
                            </SelectTrigger>
                            <SelectContent>
                              {teams.map(team => (
                                <SelectItem key={team.id} value={team.name} className="transition-colors duration-200 focus:bg-primary/10">
                                  <div className="flex items-center">
                                    <span 
                                      className="w-auto h-6 px-2 rounded-full text-xs font-medium flex items-center justify-center"
                                      style={{ 
                                        backgroundColor: team.color,
                                        color: getTextColorForBackground(team.color)
                                      }}
                                    >
                                      {team.name}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={editingStaff?.salary || 0}
                            onChange={(e) => handleEditChange('salary', e.target.value)}
                            className="w-full transition-all duration-200 focus:border-primary"
                            min="0"
                            step="1000"
                          />
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleEditSave}
                            className="transition-colors duration-200 hover:bg-green-100 hover:text-green-700"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleEditCancel}
                            className="transition-colors duration-200 hover:bg-red-100 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </>
                    ) : (
                      // View mode
                      <>
                        <TableCell className="font-medium flex items-center gap-2">
                          <BadgeCheck className="h-4 w-4 text-primary" />
                          {staff.name}
                        </TableCell>
                        <TableCell>
                          <span 
                            className="px-3 py-1.5 rounded-full text-white font-medium text-sm inline-flex items-center"
                            style={{ 
                              backgroundColor: getTeamColor(staff.team),
                              color: getTextColorForBackground(getTeamColor(staff.team))
                            }}
                          >
                            {staff.team}
                          </span>
                        </TableCell>
                        <TableCell>{formatCurrency(staff.salary)}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStart(staff)}
                            className="transition-transform duration-200 hover:scale-110 hover:text-primary"
                          >
                            <PencilLine className="h-4 w-4" />
                          </Button>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="transition-transform duration-200 hover:scale-110 hover:text-blue-600"
                              >
                                <Calculator className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>Calculate Bonus for {staff.name}</DialogTitle>
                                <DialogDescription>Enter KPI scores to calculate quarterly bonus</DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <BonusCalculator employeeId={staff.id} employeeName={staff.name} />
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="transition-transform duration-200 hover:scale-110 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="transition-all duration-300">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {staff.name} from the system? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteStaff(staff.id)}
                                  className="bg-red-500 hover:bg-red-700 transition-colors duration-200"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
                
                {filteredStaffList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No staff members found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <div className="text-sm text-muted-foreground">
              Showing {filteredStaffList.length} of {staffList.length} staff members
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={handleExportData}
                className="transition-all duration-200 hover:border-primary hover:bg-primary/5"
              >
                <FileDown className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:translate-y-0.5" />
                Export
              </Button>
              
              <div className="relative">
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="transition-all duration-200 hover:border-primary hover:bg-primary/5"
                >
                  <FileUp className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:-translate-y-0.5" />
                  Import
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </div>
            </div>
          </CardFooter>
        </Card>
        
        <Card className="transform transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="mr-2 h-5 w-5 text-primary" />
              Add New Staff
            </CardTitle>
            <CardDescription>Create a new staff record</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center">
                  <BadgeCheck className="mr-2 h-4 w-4 text-primary" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={newStaff.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="John Doe"
                  className="transition-all duration-200 focus:border-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="team" className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-primary" />
                  Team
                </Label>
                <Select
                  value={newStaff.team}
                  onValueChange={(value) => handleInputChange('team', value)}
                >
                  <SelectTrigger id="team" className="transition-all duration-200 focus:border-primary">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map(team => (
                      <SelectItem key={team.id} value={team.name} className="transition-colors duration-200 focus:bg-primary/10">
                        <div className="flex items-center">
                          <span 
                            className="w-auto h-6 px-2 rounded-full text-xs font-medium flex items-center justify-center"
                            style={{ 
                              backgroundColor: team.color,
                              color: getTextColorForBackground(team.color)
                            }}
                          >
                            {team.name}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="salary" className="flex items-center">
                  <CreditCard className="mr-2 h-4 w-4 text-primary" />
                  Monthly Salary
                </Label>
                <Input
                  id="salary"
                  type="number"
                  value={newStaff.salary || ''}
                  onChange={(e) => handleInputChange('salary', e.target.value)}
                  placeholder="50000"
                  min="0"
                  step="1000"
                  className="transition-all duration-200 focus:border-primary"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 transition-all duration-300 group"
              >
                <UserPlus className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                Add Staff Member
                <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffList;
