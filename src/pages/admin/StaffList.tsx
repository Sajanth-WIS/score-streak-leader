
import { useState } from "react";
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

const StaffList = () => {
  const [staffList, setStaffList] = useState<StaffMember[]>(mockStaffMembers);
  const [newStaff, setNewStaff] = useState<{
    name: string;
    email: string;
    department: string;
  }>({
    name: "",
    email: "",
    department: "",
  });
  const { toast } = useToast();

  const handleInputChange = (field: keyof typeof newStaff, value: string) => {
    setNewStaff({
      ...newStaff,
      [field]: value,
    });
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newStaff.name || !newStaff.email || !newStaff.department) {
      toast({
        title: "Missing information",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }
    
    // Simple email validation
    if (!newStaff.email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would save to a database
    const newStaffMember: StaffMember = {
      id: `${staffList.length + 1}`,
      name: newStaff.name,
      email: newStaff.email,
      department: newStaff.department,
    };
    
    setStaffList([...staffList, newStaffMember]);
    
    toast({
      title: "Staff member added",
      description: `${newStaff.name} has been added to the staff list.`,
    });
    
    // Reset form
    setNewStaff({
      name: "",
      email: "",
      department: "",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Staff List</h2>
        <p className="text-muted-foreground">Manage staff members in the KPI tracking system.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Staff Directory</CardTitle>
            <CardDescription>All staff members currently in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffList.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">{staff.name}</TableCell>
                    <TableCell>{staff.email}</TableCell>
                    <TableCell>{staff.department}</TableCell>
                  </TableRow>
                ))}
                
                {staffList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No staff members available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Total staff members: {staffList.length}
            </div>
            <Button variant="outline">Export List</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Add New Staff</CardTitle>
            <CardDescription>Create a new staff record</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newStaff.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="john.doe@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={newStaff.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  placeholder="Accounting"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-company-primary hover:bg-company-secondary"
              >
                Add Staff Member
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffList;
