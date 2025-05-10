import { useState } from "react";
import { useTeams } from "@/contexts/TeamContext";
import { Team, TEAM_COLORS, getTextColorForBackground } from "@/types/team";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  PencilLine, 
  Trash, 
  Save, 
  X, 
  UserPlus, 
  Users, 
  Plus, 
  Search,
  Check 
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

const TeamManagement = () => {
  const { teams, addTeam, updateTeam, deleteTeam } = useTeams();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [newTeam, setNewTeam] = useState<{
    name: string;
    description: string;
    department: string;
    color: string;
  }>({
    name: "",
    description: "",
    department: "",
    color: TEAM_COLORS[0],
  });

  const { toast } = useToast();

  // Filter teams based on search query
  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle input change for new team
  const handleNewTeamChange = (field: keyof typeof newTeam, value: string) => {
    setNewTeam({ ...newTeam, [field]: value });
  };

  // Handle input change for editing team
  const handleEditTeamChange = (field: keyof Team, value: string) => {
    if (!editingTeam) return;
    setEditingTeam({ ...editingTeam, [field]: value } as Team);
  };

  // Add a new team
  const handleAddTeam = () => {
    if (!newTeam.name) {
      toast({
        title: "Missing information",
        description: "Team name is required",
        variant: "destructive",
      });
      return;
    }

    // Check if team name already exists
    const teamExists = teams.some(
      (team) => team.name.toLowerCase() === newTeam.name.toLowerCase()
    );

    if (teamExists) {
      toast({
        title: "Team already exists",
        description: `A team with the name "${newTeam.name}" already exists`,
        variant: "destructive",
      });
      return;
    }

    // Add the team
    addTeam({
      name: newTeam.name,
      description: newTeam.description,
      department: newTeam.department,
      color: newTeam.color,
    });

    // Reset form and close dialog
    setNewTeam({
      name: "",
      description: "",
      department: "",
      color: TEAM_COLORS[0],
    });
    setIsAddDialogOpen(false);

    toast({
      title: "Team added",
      description: `Team "${newTeam.name}" has been added successfully`,
    });
  };

  // Start editing a team
  const handleEditStart = (team: Team) => {
    setEditingTeam({ ...team });
  };

  // Cancel editing
  const handleEditCancel = () => {
    setEditingTeam(null);
  };

  // Save edited team
  const handleEditSave = () => {
    if (!editingTeam) return;

    if (!editingTeam.name) {
      toast({
        title: "Missing information",
        description: "Team name is required",
        variant: "destructive",
      });
      return;
    }

    // Check if team name already exists (excluding the current team)
    const teamExists = teams.some(
      (team) =>
        team.id !== editingTeam.id &&
        team.name.toLowerCase() === editingTeam.name.toLowerCase()
    );

    if (teamExists) {
      toast({
        title: "Team already exists",
        description: `A team with the name "${editingTeam.name}" already exists`,
        variant: "destructive",
      });
      return;
    }

    // Update the team
    updateTeam(editingTeam.id, {
      name: editingTeam.name,
      description: editingTeam.description,
      department: editingTeam.department,
      color: editingTeam.color,
    });

    // Reset editing state
    setEditingTeam(null);

    toast({
      title: "Team updated",
      description: `Team "${editingTeam.name}" has been updated successfully`,
    });
  };

  // Delete a team
  const handleDeleteTeam = (teamId: string, teamName: string) => {
    const success = deleteTeam(teamId);

    if (success) {
      toast({
        title: "Team deleted",
        description: `Team "${teamName}" has been deleted successfully`,
      });
    } else {
      toast({
        title: "Error",
        description: `Failed to delete team "${teamName}"`,
        variant: "destructive",
      });
    }
  };

  // Render color picker
  const renderColorPicker = (
    selectedColor: string,
    onChange: (color: string) => void,
    id: string = "new-team"
  ) => (
    <div className="mt-2">
      <div className="flex flex-wrap gap-2 max-w-xs">
        {TEAM_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className={`w-6 h-6 rounded-full transition-all duration-200 ${
              selectedColor === color
                ? "ring-2 ring-offset-2 ring-primary"
                : "hover:scale-110"
            }`}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
            aria-label={`Select color ${color}`}
          >
            {selectedColor === color && (
              <Check
                className="w-4 h-4 mx-auto"
                style={{ color: getTextColorForBackground(color) }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="transform transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5 text-primary" />
          Team Management
        </CardTitle>
        <CardDescription>
          Create and manage teams for your organization
        </CardDescription>

        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-grow relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 transition-all duration-200 focus:border-primary"
            />
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="group bg-primary hover:bg-primary/90 transition-all duration-300">
                <Plus className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                Add Team
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Team</DialogTitle>
                <DialogDescription>
                  Create a new team for your organization
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="team-name">Team Name *</Label>
                  <Input
                    id="team-name"
                    value={newTeam.name}
                    onChange={(e) =>
                      handleNewTeamChange("name", e.target.value)
                    }
                    placeholder="e.g., Accounting"
                    className="transition-all duration-200 focus:border-primary"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="team-description">Description</Label>
                  <Input
                    id="team-description"
                    value={newTeam.description}
                    onChange={(e) =>
                      handleNewTeamChange("description", e.target.value)
                    }
                    placeholder="e.g., Handles financial reporting"
                    className="transition-all duration-200 focus:border-primary"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="team-department">Department</Label>
                  <Input
                    id="team-department"
                    value={newTeam.department}
                    onChange={(e) =>
                      handleNewTeamChange("department", e.target.value)
                    }
                    placeholder="e.g., Finance"
                    className="transition-all duration-200 focus:border-primary"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="team-color">Team Color</Label>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-full"
                      style={{ backgroundColor: newTeam.color }}
                    ></div>
                    <span className="text-sm font-medium">{newTeam.color}</span>
                  </div>
                  {renderColorPicker(newTeam.color, (color) =>
                    handleNewTeamChange("color", color)
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleAddTeam}
                  className="bg-primary hover:bg-primary/90 transition-all duration-300"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Team
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Color</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Members</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeams.map((team) => (
              <TableRow
                key={team.id}
                className="transition-all duration-200 hover:bg-muted/50"
              >
                {editingTeam?.id === team.id ? (
                  // Edit mode
                  <>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: editingTeam.color }}
                        ></div>
                        {renderColorPicker(
                          editingTeam.color,
                          (color) => handleEditTeamChange("color", color),
                          `edit-team-${team.id}`
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Input
                          value={editingTeam.name}
                          onChange={(e) =>
                            handleEditTeamChange("name", e.target.value)
                          }
                          className="w-full transition-all duration-200 focus:border-primary"
                          placeholder="Team name"
                        />
                        <Input
                          value={editingTeam.description || ""}
                          onChange={(e) =>
                            handleEditTeamChange("description", e.target.value)
                          }
                          className="w-full transition-all duration-200 focus:border-primary"
                          placeholder="Description (optional)"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editingTeam.department || ""}
                        onChange={(e) =>
                          handleEditTeamChange("department", e.target.value)
                        }
                        className="w-full transition-all duration-200 focus:border-primary"
                        placeholder="Department (optional)"
                      />
                    </TableCell>
                    <TableCell>{team.memberCount}</TableCell>
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
                    <TableCell>
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: team.color }}
                      ></div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{team.name}</div>
                      {team.description && (
                        <div className="text-sm text-muted-foreground">
                          {team.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {team.department ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium">
                          {team.department}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <UserPlus className="h-4 w-4 mr-2 text-muted-foreground" />
                        {team.memberCount}
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditStart(team)}
                        className="transition-transform duration-200 hover:scale-110 hover:text-primary"
                      >
                        <PencilLine className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="transition-transform duration-200 hover:scale-110 text-red-500 hover:text-red-700 hover:bg-red-50"
                            disabled={team.memberCount > 0}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="transition-all duration-300">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Team</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the team "
                              {team.name}"? This action cannot be undone.
                              {team.memberCount > 0 && (
                                <div className="mt-2 text-red-500 font-medium">
                                  This team has {team.memberCount} members. You
                                  need to reassign them before deleting.
                                </div>
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDeleteTeam(team.id, team.name)
                              }
                              className="bg-red-500 hover:bg-red-700 transition-colors duration-200"
                              disabled={team.memberCount > 0}
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

            {filteredTeams.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No teams found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Showing {filteredTeams.length} of {teams.length} teams
        </div>
      </CardFooter>
    </Card>
  );
};

export default TeamManagement; 