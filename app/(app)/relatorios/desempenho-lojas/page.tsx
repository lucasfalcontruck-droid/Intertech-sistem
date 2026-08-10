"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { PLATFORM_LABEL } from "@/components/ui/platform-chip";
import { useCanalPerformance } from "@/hooks/relatorios/use-relatorios";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

/** app/(app)/relatorios/desempenho-lojas/page.tsx — Análise de desempenho por canal de venda. */
export default function DesempenhoLojasPage() {
  const { data, isLoading, isError, error } = useCanalPerformance();

  return (
    <div>
      <PageHeader title="Desempenho por loja" subtitle="Análise de desempenho de cada canal de venda" />

      {isLoading && <LoadingState label="Carregando desempenho..." />}
      {isError && <ErrorState message={error?.message ?? "Erro ao carregar desempenho."} />}

      {data && (
        <Card className="p-0">
          <div className="overflow-x-auto p-5">
            <table className="w-full min-w-[820px] border-collapse">
              <thead>
                <tr className="border-b border-border">
                  {["Canal", "Faturamento", "Pedidos", "Ticket médio", "Conversão", "Margem"].map((h) => (
                    <th
                      key={h}
                      className="px-3 pb-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.canais.map((c) => (
                  <tr key={c.platform} className="border-b border-white/4 last:border-none hover:bg-white/2">
                    <td className="px-3 py-3.5 text-sm font-semibold text-ink">
                      {PLATFORM_LABEL[c.platform]}
                    </td>
                    <td className="px-3 py-3.5 text-sm">{formatCurrency(c.revenue)}</td>
                    <td className="px-3 py-3.5 text-sm text-ink-secondary">
                      {formatNumber(c.orders)}
                    </td>
                    <td className="px-3 py-3.5 text-sm text-ink-secondary">
                      {formatCurrency(c.avgTicket)}
                    </td>
                    <td className="px-3 py-3.5 text-sm text-ink-secondary">
                      {formatPercent(c.conversion)}
                    </td>
                    <td className="px-3 py-3.5">
                      <Badge variant={c.margin >= 15 ? "ok" : "low"}>{formatPercent(c.margin)}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
