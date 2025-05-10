
import { Badge } from "@/lib/kpi-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award } from "lucide-react";

interface BadgeDisplayProps {
  badge: Badge;
}

const BadgeDisplay = ({ badge }: BadgeDisplayProps) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 bg-company-primary text-white">
        <CardTitle className="text-sm flex items-center gap-2">
          <Award className="h-4 w-4" /> 
          {badge.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 text-xs">
        <p>{badge.description}</p>
        <p className="mt-2 text-company-primary font-medium">{badge.criteria}</p>
      </CardContent>
    </Card>
  );
};

export default BadgeDisplay;
