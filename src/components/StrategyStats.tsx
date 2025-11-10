import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface StrategyData {
  name: string;
  winRate: number;
  totalOperations: number;
  profit: number;
}

interface StrategyStatsProps {
  strategies: StrategyData[];
}

export function StrategyStats({ strategies }: StrategyStatsProps) {
  return (
    <Card className="border-border/50 bg-card/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-foreground">Performance por Estratégia</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {strategies.map((strategy) => (
          <div key={strategy.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                {strategy.name}
              </span>
              <span className="text-sm text-muted-foreground">
                {strategy.totalOperations} ops
              </span>
            </div>
            <Progress 
              value={strategy.winRate} 
              className="h-2"
            />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Win Rate: {strategy.winRate.toFixed(1)}%
              </span>
              <span
                className={
                  strategy.profit > 0 ? "text-success" : "text-destructive"
                }
              >
                {strategy.profit > 0 ? "+" : ""}${strategy.profit.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
