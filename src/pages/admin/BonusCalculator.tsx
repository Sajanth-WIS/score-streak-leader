import { BonusCalculator } from '@/components/BonusCalculator';
import { Calculator } from 'lucide-react';

const BonusCalculatorPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2 flex items-center gap-2">
          <Calculator className="h-6 w-6 text-company-accent animate-pulse-badge" />
          Performance Bonus Calculator
        </h2>
        <p className="text-muted-foreground">
          Calculate quarterly performance bonuses based on KPI scores
        </p>
      </div>

      <BonusCalculator />
    </div>
  );
};

export default BonusCalculatorPage; 