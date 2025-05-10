
import {
  Card,
  CardContent,
  CardDescription,
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
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const KpiRules = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">KPI Rules</h2>
        <p className="text-muted-foreground">View and understand the KPI scoring framework.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Scoring System Overview</CardTitle>
          <CardDescription>How performance scores are calculated</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-company-light p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-company-primary mb-2">Accounts</h3>
              <p className="text-sm mb-2">Accounts backlog on-time percentage</p>
              <p className="font-bold">Maximum: 40 points</p>
            </div>
            
            <div className="bg-company-light p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-company-primary mb-2">VAT</h3>
              <p className="text-sm mb-2">VAT returns on-time percentage</p>
              <p className="font-bold">Maximum: 30 points</p>
            </div>
            
            <div className="bg-company-light p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-company-primary mb-2">SA</h3>
              <p className="text-sm mb-2">SA returns on-time percentage</p>
              <p className="font-bold">Maximum: 30 points</p>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Points Calculation Table</h3>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Completion %</TableHead>
                  <TableHead className="text-center">Accounts Points</TableHead>
                  <TableHead className="text-center">VAT Points</TableHead>
                  <TableHead className="text-center">SA Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">≥90%</TableCell>
                  <TableCell className="text-center">40</TableCell>
                  <TableCell className="text-center">30</TableCell>
                  <TableCell className="text-center">30</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">80-89%</TableCell>
                  <TableCell className="text-center">35</TableCell>
                  <TableCell className="text-center">25</TableCell>
                  <TableCell className="text-center">25</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">70-79%</TableCell>
                  <TableCell className="text-center">30</TableCell>
                  <TableCell className="text-center">20</TableCell>
                  <TableCell className="text-center">20</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">60-69%</TableCell>
                  <TableCell className="text-center">20</TableCell>
                  <TableCell className="text-center">15</TableCell>
                  <TableCell className="text-center">15</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">&lt;60%</TableCell>
                  <TableCell className="text-center">0</TableCell>
                  <TableCell className="text-center">0</TableCell>
                  <TableCell className="text-center">0</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Bonus Calculation</CardTitle>
          <CardDescription>How quarterly bonuses are calculated</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-company-light p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-company-primary mb-2">Quarterly Bonus Formula</h3>
            <p className="mb-2">The quarterly bonus is calculated as follows:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Quarterly Bonus Pool = Monthly Salary ÷ 4</li>
              <li>Bonus Amount = (Total KPI Points ÷ 100) × Bonus Pool</li>
            </ol>
            <p className="mt-4 font-medium">Example: With a monthly salary of LKR 150,000</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Bonus Pool = LKR 150,000 ÷ 4 = LKR 37,500</li>
              <li>For a KPI score of 91 points: LKR 37,500 × 91% = LKR 34,125</li>
            </ul>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Bonus Calculation Examples</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>KPI Score</TableHead>
                  <TableHead className="text-center">Bonus Pool</TableHead>
                  <TableHead className="text-center">Calculation</TableHead>
                  <TableHead className="text-right">Bonus Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">100 points</TableCell>
                  <TableCell className="text-center">LKR 37,500</TableCell>
                  <TableCell className="text-center">100% of pool</TableCell>
                  <TableCell className="text-right">LKR 37,500</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">90 points</TableCell>
                  <TableCell className="text-center">LKR 37,500</TableCell>
                  <TableCell className="text-center">90% of pool</TableCell>
                  <TableCell className="text-right">LKR 33,750</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">75 points</TableCell>
                  <TableCell className="text-center">LKR 37,500</TableCell>
                  <TableCell className="text-center">75% of pool</TableCell>
                  <TableCell className="text-right">LKR 28,125</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">60 points</TableCell>
                  <TableCell className="text-center">LKR 37,500</TableCell>
                  <TableCell className="text-center">60% of pool</TableCell>
                  <TableCell className="text-right">LKR 22,500</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Badges and Achievements</CardTitle>
          <CardDescription>Special recognition for consistent performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Performance Badges</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h4 className="font-medium">Accounts Master</h4>
                    <p className="text-sm text-muted-foreground">
                      Awarded for maintaining ≥90% Accounts score for 3 consecutive months
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h4 className="font-medium">VAT Wizard</h4>
                    <p className="text-sm text-muted-foreground">
                      Awarded for maintaining ≥90% VAT score for 3 consecutive months
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h4 className="font-medium">SA Champion</h4>
                    <p className="text-sm text-muted-foreground">
                      Awarded for maintaining ≥90% SA score for 3 consecutive months
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h4 className="font-medium">Perfect Quarter</h4>
                    <p className="text-sm text-muted-foreground">
                      Awarded for achieving ≥90% in all KPIs for an entire quarter
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger>Level System</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Staff levels are determined by cumulative points earned over time:
                  </p>
                  
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h4 className="font-medium">Bronze Level</h4>
                    <p className="text-sm text-muted-foreground">
                      0 - 149 cumulative points
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h4 className="font-medium">Silver Level</h4>
                    <p className="text-sm text-muted-foreground">
                      150 - 299 cumulative points
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h4 className="font-medium">Gold Level</h4>
                    <p className="text-sm text-muted-foreground">
                      300 - 599 cumulative points
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h4 className="font-medium">Platinum Level</h4>
                    <p className="text-sm text-muted-foreground">
                      600 - 899 cumulative points
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <h4 className="font-medium">Diamond Level</h4>
                    <p className="text-sm text-muted-foreground">
                      900+ cumulative points
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default KpiRules;
