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
      const { data, error } = await (supabase as any)
        .from("entradas")
        .select("*")
        .order("timestamp", { ascending: false });

      if (error) throw error;

      return (data as any[]).map((entry: any) => ({
        id: entry.id,
        ativo: entry.ativo,
        timestamp: entry.created_at || new Date(entry.timestamp).toLocaleString("pt-BR"),
        direcao: entry.direcao as "CALL" | "PUT",
        valor_entrada: Number(entry.valor_entrada),
        resultado: entry.resultado as "WIN" | "LOSS" | "PENDENTE",
        gale_nivel: entry.gale_nivel || 0,
        lucro_prejuizo: Number(entry.lucro_prejuizo),
      })) as Operation[];
    },
  });
}
