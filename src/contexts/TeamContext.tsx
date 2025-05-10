import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Team, getRandomTeamColor } from '@/types/team';

// Mock initial teams (in a real app, this would come from an API or database)
const INITIAL_TEAMS: Team[] = [
  {
    id: '1',
    name: 'Accounting',
    description: 'Handles financial transactions and reporting',
    color: '#4f46e5',
    department: 'Finance',
    memberCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Tax',
    description: 'Manages tax compliance and planning',
    color: '#10b981',
    department: 'Finance',
    memberCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Advisory',
    description: 'Provides business consulting services',
    color: '#f59e0b',
    department: 'Consulting',
    memberCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Context type with teams and methods
interface TeamContextType {
  teams: Team[];
  addTeam: (team: Omit<Team, 'id' | 'createdAt' | 'updatedAt' | 'memberCount'>) => Team;
  updateTeam: (id: string, updates: Partial<Omit<Team, 'id' | 'createdAt' | 'updatedAt'>>) => Team | null;
  deleteTeam: (id: string) => boolean;
  getTeamById: (id: string) => Team | undefined;
  getTeamByName: (name: string) => Team | undefined;
  incrementTeamMemberCount: (teamId: string) => void;
  decrementTeamMemberCount: (teamId: string) => void;
  updateTeamMemberCount: (teamId: string, count: number) => void;
}

// Create context
const TeamContext = createContext<TeamContextType | undefined>(undefined);

// Provider component
export const TeamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State to store teams
  const [teams, setTeams] = useState<Team[]>(() => {
    // Try to load teams from localStorage, or use initial teams
    const savedTeams = localStorage.getItem('teams');
    return savedTeams ? JSON.parse(savedTeams) : INITIAL_TEAMS;
  });

  // Save teams to localStorage when they change
  useEffect(() => {
    localStorage.setItem('teams', JSON.stringify(teams));
  }, [teams]);

  // Add a new team
  const addTeam = (teamData: Omit<Team, 'id' | 'createdAt' | 'updatedAt' | 'memberCount'>): Team => {
    const now = new Date();
    const newTeam: Team = {
      ...teamData,
      id: uuidv4(),
      color: teamData.color || getRandomTeamColor(),
      memberCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    setTeams(prevTeams => [...prevTeams, newTeam]);
    return newTeam;
  };

  // Update an existing team
  const updateTeam = (
    id: string, 
    updates: Partial<Omit<Team, 'id' | 'createdAt' | 'updatedAt'>>
  ): Team | null => {
    let updatedTeam: Team | null = null;

    setTeams(prevTeams => 
      prevTeams.map(team => {
        if (team.id === id) {
          updatedTeam = {
            ...team,
            ...updates,
            updatedAt: new Date(),
          };
          return updatedTeam;
        }
        return team;
      })
    );

    return updatedTeam;
  };

  // Delete a team
  const deleteTeam = (id: string): boolean => {
    const teamExists = teams.some(team => team.id === id);
    
    if (teamExists) {
      setTeams(prevTeams => prevTeams.filter(team => team.id !== id));
      return true;
    }
    
    return false;
  };

  // Get a team by ID
  const getTeamById = (id: string): Team | undefined => {
    return teams.find(team => team.id === id);
  };

  // Get a team by name
  const getTeamByName = (name: string): Team | undefined => {
    return teams.find(team => team.name === name);
  };

  // Increment member count for a team
  const incrementTeamMemberCount = (teamId: string): void => {
    setTeams(prevTeams => 
      prevTeams.map(team => {
        if (team.id === teamId) {
          return {
            ...team,
            memberCount: team.memberCount + 1,
            updatedAt: new Date(),
          };
        }
        return team;
      })
    );
  };

  // Decrement member count for a team
  const decrementTeamMemberCount = (teamId: string): void => {
    setTeams(prevTeams => 
      prevTeams.map(team => {
        if (team.id === teamId) {
          return {
            ...team,
            memberCount: Math.max(0, team.memberCount - 1), // Don't go below 0
            updatedAt: new Date(),
          };
        }
        return team;
      })
    );
  };

  // Set member count for a team
  const updateTeamMemberCount = (teamId: string, count: number): void => {
    setTeams(prevTeams => 
      prevTeams.map(team => {
        if (team.id === teamId) {
          return {
            ...team,
            memberCount: Math.max(0, count), // Don't go below 0
            updatedAt: new Date(),
          };
        }
        return team;
      })
    );
  };

  return (
    <TeamContext.Provider 
      value={{ 
        teams, 
        addTeam, 
        updateTeam, 
        deleteTeam, 
        getTeamById,
        getTeamByName,
        incrementTeamMemberCount,
        decrementTeamMemberCount,
        updateTeamMemberCount
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};

// Hook for using the team context
export const useTeams = (): TeamContextType => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeams must be used within a TeamProvider');
  }
  return context;
}; 