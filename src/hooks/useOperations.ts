import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Operation {
  id: number;
  ativo: string;
  timestamp: string;
  direcao: "CALL" | "PUT";
  valor_entrada: number;
  resultado: "WIN" | "LOSS" | "PENDENTE";
  gale_nivel: number;
  lucro_prejuizo: number;
}

export function useOperations() {
  return useQuery({
    queryKey: ["operations"],
    queryFn: async () => {
      // Buscar entradas
      const { data: entradas, error: entradasError } = await (supabase as any)
        .from("entradas")
        .select("*")
        .order("timestamp", { ascending: false });

      if (entradasError) throw entradasError;

      // Buscar sinais correspondentes
      const timestamps = [...new Set(entradas.map((e: any) => e.timestamp))];
      const { data: sinais, error: sinaisError } = await (supabase as any)
        .from("sinais")
        .select("ativo, timestamp, created_at")
        .in("timestamp", timestamps);

      if (sinaisError) throw sinaisError;

      // Criar mapa de sinais para lookup rápido
      const sinaisMap = new Map();
      sinais?.forEach((sinal: any) => {
        const key = `${sinal.ativo}_${sinal.timestamp}`;
        sinaisMap.set(key, sinal.created_at);
      });

      return (entradas as any[]).map((entry: any) => {
        const key = `${entry.ativo}_${entry.timestamp}`;
        const sinaisCreatedAt = sinaisMap.get(key);
        
        return {
          id: entry.id,
          ativo: entry.ativo,
          timestamp: sinaisCreatedAt 
            ? new Date(sinaisCreatedAt).toLocaleString("pt-BR")
            : new Date(entry.timestamp).toLocaleString("pt-BR"),
          direcao: entry.direcao as "CALL" | "PUT",
          valor_entrada: Number(entry.valor_entrada),
          resultado: entry.resultado as "WIN" | "LOSS" | "PENDENTE",
          gale_nivel: entry.gale_nivel || 0,
          lucro_prejuizo: Number(entry.lucro_prejuizo),
        };
      }) as Operation[];
    },
  });
}
