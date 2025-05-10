import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ScoreCardProps {
  title: string;
  score: number;
  maxScore: number;
  color: string;
  description?: string;
  mini?: boolean;
}

const ScoreCard = ({ title, score, maxScore, color, description, mini = false }: ScoreCardProps) => {
  const percentage = Math.round((score / maxScore) * 100);
  
  if (mini) {
    return (
      <div className="p-3 border rounded-md border-border">
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm font-medium">{title}</div>
          <div className={`text-sm ${color}`}>{score}/{maxScore}</div>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mb-2">{description}</p>
        )}
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color.includes('green') ? 'bg-company-success' : color.includes('yellow') ? 'bg-company-warning' : 'bg-company-danger'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{score}</div>
          <div className={`text-sm ${color}`}>{percentage}%</div>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color.includes('green') ? 'bg-company-success' : color.includes('yellow') ? 'bg-company-warning' : 'bg-company-danger'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreCard;
