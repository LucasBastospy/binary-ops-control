import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown } from "lucide-react";

interface Operation {
  id: number;
  ativo: string;
  timestamp: string;
  direcao: "CALL" | "PUT";
  valor_entrada: number;
  resultado: "WIN" | "LOSS" | "PENDENTE";
  gale_nivel: number;
  lucro_prejuizo: number;
}

interface OperationsTableProps {
  operations: Operation[];
}

export function OperationsTable({ operations }: OperationsTableProps) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-accent/50">
            <TableHead className="text-foreground">Ativo</TableHead>
            <TableHead className="text-foreground">Horário</TableHead>
            <TableHead className="text-foreground">Direção</TableHead>
            <TableHead className="text-foreground">Valor</TableHead>
            <TableHead className="text-foreground">Gale</TableHead>
            <TableHead className="text-foreground">Resultado</TableHead>
            <TableHead className="text-right text-foreground">P/L</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {operations.map((op) => (
            <TableRow 
              key={op.id} 
              className="border-border/30 hover:bg-accent/30 transition-colors"
            >
              <TableCell className="font-medium text-foreground">{op.ativo}</TableCell>
              <TableCell className="text-muted-foreground">{op.timestamp}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {op.direcao === "CALL" ? (
                    <ArrowUp className="h-4 w-4 text-success" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-destructive" />
                  )}
                  <span className="text-foreground">{op.direcao}</span>
                </div>
              </TableCell>
              <TableCell className="text-foreground">
                ${op.valor_entrada.toFixed(2)}
              </TableCell>
              <TableCell>
                {op.gale_nivel > 0 && (
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    G{op.gale_nivel}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    op.resultado === "WIN"
                      ? "default"
                      : op.resultado === "LOSS"
                      ? "destructive"
                      : "secondary"
                  }
                  className={
                    op.resultado === "WIN"
                      ? "bg-success/20 text-success border-success/50"
                      : op.resultado === "LOSS"
                      ? "bg-destructive/20 text-destructive border-destructive/50"
                      : ""
                  }
                >
                  {op.resultado}
                </Badge>
              </TableCell>
              <TableCell
                className={`text-right font-medium ${
                  op.lucro_prejuizo > 0
                    ? "text-success"
                    : op.lucro_prejuizo < 0
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}
              >
                {op.lucro_prejuizo > 0 ? "+" : ""}${op.lucro_prejuizo.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
