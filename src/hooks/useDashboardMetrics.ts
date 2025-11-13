import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Metrics {
  winRate: number;
  totalProfit: number;
  activeOperations: number;
  bankroll: number;
  dailyProfit: number;
  chartData: Array<{ date: string; balance: number }>;
  strategies: Array<{
    name: string;
    winRate: number;
    totalOperations: number;
    profit: number;
  }>;
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("entradas")
        .select("*")
        .order("timestamp", { ascending: true });

      if (error) throw error;

      const operations = data as any[];
      const totalOperations = operations.length;
      const wins = operations.filter((op: any) => op.resultado === "WIN").length;
      const winRate = totalOperations > 0 ? (wins / totalOperations) * 100 : 0;

      const totalProfit = operations.reduce(
        (sum: number, op: any) => sum + Number(op.lucro_prejuizo || 0),
        0
      );

      const activeOperations = operations.filter(
        (op: any) => op.resultado === "PENDENTE"
      ).length;

      // Buscar banca atual da tabela saldo_banca
      const { data: bancaData } = await (supabase as any)
        .from("saldo_banca")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(1)
        .single();

      const bankroll = bancaData ? Number(bancaData.banca_atual) : 1000 + totalProfit;

      // Calcular lucro diário (diferença entre banca atual e banca do início do dia)
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const startOfDayTimestamp = startOfDay.getTime();

      const { data: startDayBanca } = await (supabase as any)
        .from("saldo_banca")
        .select("banca_atual")
        .lte("timestamp", startOfDayTimestamp)
        .order("timestamp", { ascending: false })
        .limit(1)
        .maybeSingle();

      const dailyProfit = startDayBanca 
        ? bankroll - Number(startDayBanca.banca_atual)
        : operations
            .filter((op: any) => op.timestamp >= startOfDayTimestamp)
            .reduce((sum: number, op: any) => sum + Number(op.lucro_prejuizo || 0), 0)

      // Dados do gráfico (últimos 30 dias)
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const recentOps = operations.filter((op: any) => op.timestamp >= thirtyDaysAgo);
      
      const chartData: Array<{ date: string; balance: number }> = [];
      let runningBalance = bankroll - totalProfit;

      recentOps.forEach((op: any) => {
        runningBalance += Number(op.lucro_prejuizo || 0);
        chartData.push({
          date: new Date(op.timestamp).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
          }),
          balance: runningBalance,
        });
      });

      // Agrupar por ativo para estatísticas de estratégia
      const strategyMap = new Map<
        string,
        { wins: number; total: number; profit: number }
      >();

      operations.forEach((op: any) => {
        const current = strategyMap.get(op.ativo) || {
          wins: 0,
          total: 0,
          profit: 0,
        };
        current.total++;
        if (op.resultado === "WIN") current.wins++;
        current.profit += Number(op.lucro_prejuizo || 0);
        strategyMap.set(op.ativo, current);
      });

      const strategies = Array.from(strategyMap.entries()).map(
        ([name, stats]) => ({
          name,
          winRate: stats.total > 0 ? (stats.wins / stats.total) * 100 : 0,
          totalOperations: stats.total,
          profit: stats.profit,
        })
      );

      return {
        winRate,
        totalProfit,
        activeOperations,
        bankroll,
        dailyProfit,
        chartData,
        strategies,
      } as Metrics;
    },
  });
}
