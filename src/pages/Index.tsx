import { useState } from "react";
import { MetricCard } from "@/components/MetricCard";
import { OperationsTable } from "@/components/OperationsTable";
import { PerformanceChart } from "@/components/PerformanceChart";
import { StrategyStats } from "@/components/StrategyStats";
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
  // Mock data - será substituído por dados reais do backend
  const metrics = {
    winRate: 68.5,
    totalOperations: 147,
    profit: 1245.80,
    activeOperations: 3,
    bankroll: 2345.80,
    dailyProfit: 185.50,
  };

  const operations = [
    {
      id: 1,
      ativo: "EURUSD-OTC",
      timestamp: "14:32:15",
      direcao: "CALL" as const,
      valor_entrada: 20.0,
      resultado: "WIN" as const,
      gale_nivel: 0,
      lucro_prejuizo: 16.0,
    },
    {
      id: 2,
      ativo: "GBPUSD-OTC",
      timestamp: "14:28:43",
      direcao: "PUT" as const,
      valor_entrada: 20.0,
      resultado: "LOSS" as const,
      gale_nivel: 2,
      lucro_prejuizo: -100.0,
    },
    {
      id: 3,
      ativo: "AUDUSD-OTC",
      timestamp: "14:25:12",
      direcao: "CALL" as const,
      valor_entrada: 20.0,
      resultado: "WIN" as const,
      gale_nivel: 1,
      lucro_prejuizo: 40.0,
    },
    {
      id: 4,
      ativo: "USDJPY-OTC",
      timestamp: "14:20:38",
      direcao: "PUT" as const,
      valor_entrada: 20.0,
      resultado: "WIN" as const,
      gale_nivel: 0,
      lucro_prejuizo: 16.0,
    },
    {
      id: 5,
      ativo: "EURGBP-OTC",
      timestamp: "14:15:22",
      direcao: "CALL" as const,
      valor_entrada: 20.0,
      resultado: "PENDENTE" as const,
      gale_nivel: 0,
      lucro_prejuizo: 0,
    },
  ];

  const chartData = [
    { date: "10:00", balance: 2000 },
    { date: "11:00", balance: 2050 },
    { date: "12:00", balance: 2120 },
    { date: "13:00", balance: 2080 },
    { date: "14:00", balance: 2180 },
    { date: "15:00", balance: 2345.8 },
  ];

  const strategies = [
    { name: "RSI", winRate: 72.3, totalOperations: 38, profit: 425.60 },
    { name: "Bollinger Bands", winRate: 65.8, totalOperations: 42, profit: 312.40 },
    { name: "MACD", winRate: 70.1, totalOperations: 35, profit: 285.30 },
    { name: "Média Móvel", winRate: 68.5, totalOperations: 32, profit: 222.50 },
  ];

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
                  ${metrics.bankroll.toFixed(2)}
                </p>
              </div>
              <div className="h-10 w-px bg-border/50" />
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Hoje</p>
                <p className={`text-lg font-bold ${metrics.dailyProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {metrics.dailyProfit >= 0 ? '+' : ''}${metrics.dailyProfit.toFixed(2)}
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
            value={`${metrics.winRate}%`}
            subtitle={`${metrics.totalOperations} operações`}
            icon={Target}
            variant="success"
          />
          <MetricCard
            title="Lucro Total"
            value={`$${metrics.profit.toFixed(2)}`}
            subtitle="Todas as operações"
            icon={DollarSign}
            variant="success"
          />
          <MetricCard
            title="Operações Ativas"
            value={metrics.activeOperations}
            subtitle="Em andamento"
            icon={Activity}
            variant="default"
          />
          <MetricCard
            title="Tendência"
            value="Alta"
            subtitle="Performance crescente"
            icon={TrendingUp}
            variant="default"
          />
        </div>

        {/* Charts and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PerformanceChart data={chartData} />
          </div>
          <div>
            <StrategyStats strategies={strategies} />
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
