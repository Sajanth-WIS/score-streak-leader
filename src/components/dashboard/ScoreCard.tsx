
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ScoreCardProps {
  title: string;
  score: number;
  maxScore: number;
  color: string;
  description?: string;
}

const ScoreCard = ({ title, score, maxScore, color, description }: ScoreCardProps) => {
  const percentage = Math.round((score / maxScore) * 100);
  
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
