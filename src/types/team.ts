export interface Team {
  id: string;
  name: string;
  description?: string;
  color: string; // For visual identification
  department?: string;
  managerId?: string;
  memberCount: number; // Automatically updated
  createdAt: Date;
  updatedAt: Date;
}

// Default team colors palette
export const TEAM_COLORS = [
  "#4f46e5", // Blue
  "#10b981", // Green
  "#ef4444", // Red
  "#f59e0b", // Orange
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f97316", // Amber
  "#6366f1", // Indigo
  "#14b8a6", // Teal
];

// Generate a random color from the palette
export function getRandomTeamColor(): string {
  const randomIndex = Math.floor(Math.random() * TEAM_COLORS.length);
  return TEAM_COLORS[randomIndex];
}

// Generate a text color (black/white) for optimal contrast with background
export function getTextColorForBackground(backgroundColor: string): string {
  // Convert hex to RGB
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance (perceived brightness)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for bright backgrounds, white for dark backgrounds
  return luminance > 0.5 ? '#000000' : '#ffffff';
} 