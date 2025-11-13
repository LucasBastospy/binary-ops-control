import { MetricCard } from "@/components/MetricCard";
import { OperationsTable } from "@/components/OperationsTable";
import { PerformanceChart } from "@/components/PerformanceChart";
import { StrategyStats } from "@/components/StrategyStats";
import { useOperations } from "@/hooks/useOperations";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import {
  TrendingUp,
  Target,
  DollarSign,
  Activity,
  BarChart3,
  Zap,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const { data: operations = [], isLoading: loadingOps } = useOperations();
  const { data: metrics, isLoading: loadingMetrics } = useDashboardMetrics();

  if (loadingOps || loadingMetrics) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 text-primary animate-pulse mx-auto mb-2" />
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  const winOperations = operations.filter(op => op.resultado === "WIN");
  const lossOperations = operations.filter(op => op.resultado === "LOSS");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                Trading Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Sistema de Operações Binárias - IQ Option M5
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Banca Atual</p>
                <p className="text-xl font-bold text-primary">
                  ${metrics?.bankroll.toFixed(2)}
                </p>
              </div>
              <div className="h-10 w-px bg-border/50" />
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Hoje</p>
                <p className={`text-lg font-bold ${(metrics?.dailyProfit || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {(metrics?.dailyProfit || 0) >= 0 ? '+' : ''}${metrics?.dailyProfit.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Win Rate"
            value={`${metrics?.winRate.toFixed(1)}%`}
            subtitle={`${operations.length} operações`}
            icon={Target}
            variant="success"
          />
          <MetricCard
            title="Lucro Total"
            value={`$${metrics?.totalProfit.toFixed(2)}`}
            subtitle="Todas as operações"
            icon={DollarSign}
            variant={(metrics?.totalProfit || 0) >= 0 ? "success" : "destructive"}
          />
          <MetricCard
            title="Operações Ativas"
            value={metrics?.activeOperations || 0}
            subtitle="Em andamento"
            icon={Activity}
            variant="default"
          />
          <MetricCard
            title="Tendência"
            value={(metrics?.dailyProfit || 0) >= 0 ? "Alta" : "Baixa"}
            subtitle="Performance crescente"
            icon={TrendingUp}
            variant={(metrics?.dailyProfit || 0) >= 0 ? "success" : "destructive"}
          />
        </div>

        {/* Charts and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PerformanceChart data={metrics?.chartData || []} />
          </div>
          <div>
            <StrategyStats strategies={metrics?.strategies || []} />
          </div>
        </div>

        {/* Operations Table */}
        <div>
          <Tabs defaultValue="recent" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Operações
              </h2>
              <TabsList className="bg-card/50 border border-border/50">
                <TabsTrigger value="recent">Recentes</TabsTrigger>
                <TabsTrigger value="wins">Wins</TabsTrigger>
                <TabsTrigger value="losses">Losses</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="recent" className="mt-0">
              <OperationsTable operations={operations} />
            </TabsContent>
            <TabsContent value="wins" className="mt-0">
              <OperationsTable
                operations={operations.filter((op) => op.resultado === "WIN")}
              />
            </TabsContent>
            <TabsContent value="losses" className="mt-0">
              <OperationsTable
                operations={operations.filter((op) => op.resultado === "LOSS")}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Index;
