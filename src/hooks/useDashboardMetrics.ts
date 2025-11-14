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
      
      // Agrupar operações por ativo e timestamp próximo para identificar sequências de Gale
      const sequences = new Map<string, any[]>();
      
      operations.forEach((op: any) => {
        const key = `${op.ativo}_${Math.floor(op.timestamp / 60000)}`; // Agrupa por minuto
        if (!sequences.has(key)) {
          sequences.set(key, []);
        }
        sequences.get(key)!.push(op);
      });
      
      // Calcular resultado de cada sequência
      let totalSequences = 0;
      let winSequences = 0;
      
      sequences.forEach((ops) => {
        // Ordenar por gale_nivel para analisar a sequência
        ops.sort((a, b) => a.gale_nivel - b.gale_nivel);
        
        // Verificar se há algum WIN na sequência
        const hasWin = ops.some(op => op.resultado === "WIN");
        
        // Verificar se a sequência está completa (tem G3 com LOSS ou qualquer WIN)
        const maxGale = Math.max(...ops.map(op => op.gale_nivel));
        const lastOp = ops.find(op => op.gale_nivel === maxGale);
        
        // Só contabilizar sequências que estão finalizadas
        if (hasWin || (lastOp?.resultado === "LOSS" && maxGale === 3)) {
          totalSequences++;
          if (hasWin) {
            winSequences++;
          }
        }
      });
      
      const winRate = totalSequences > 0 ? (winSequences / totalSequences) * 100 : 0;

      const totalProfit = operations
        .filter((op: any) => op.resultado !== "PENDENTE")
        .reduce((sum: number, op: any) => sum + Number(op.lucro_prejuizo || 0), 0);

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

      // Dados do gráfico da evolução da banca (últimos 30 dias)
      const thirtyDaysAgo = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
      
      const { data: bancaHistory } = await (supabase as any)
        .from("saldo_banca")
        .select("*")
        .gte("timestamp", thirtyDaysAgo)
        .order("timestamp", { ascending: true });

      const chartData: Array<{ date: string; balance: number }> = 
        (bancaHistory || []).map((entry: any) => ({
          date: new Date(entry.timestamp).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
          }),
          balance: Number(entry.banca_atual),
        }));

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
