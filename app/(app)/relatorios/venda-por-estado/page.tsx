"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state";
import { GenericBarChart } from "@/components/charts/generic-bar-chart";
import { useVendaPorEstado } from "@/hooks/relatorios/use-relatorios";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

/** app/(app)/relatorios/venda-por-estado/page.tsx — Distribuição de vendas por estado (UF). */
export default function VendaPorEstadoPage() {
  const { data, isLoading, isError, error } = useVendaPorEstado();
  const states = data?.states ?? [];

  return (
    <div>
      <PageHeader title="Venda por estado" subtitle="Distribuição de vendas por estado" />

      {isLoading && <LoadingState label="Carregando venda por estado..." />}
      {isError && <ErrorState message={error?.message ?? "Erro ao carregar o relatório."} />}

      {data && (
        <>
          <Card className="mb-4">
            <CardHeader title="Faturamento por estado" />
            {states.length === 0 ? (
              <EmptyState message="Nenhum pedido com estado registrado ainda." />
            ) : (
              <div className="h-[260px]">
                <GenericBarChart
                  data={states.slice(0, 10).map((s) => ({ label: s.state, value: s.value }))}
                  formatter={(v) => formatCurrency(v)}
                />
              </div>
            )}
          </Card>

          {states.length > 0 && (
            <Card className="p-0">
              <div className="overflow-x-auto p-5">
                <table className="w-full min-w-[560px] border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      {["Estado", "Pedidos", "Faturamento", "% do total"].map((h) => (
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
                    {states.map((s) => (
                      <tr key={s.state} className="border-b border-white/4 last:border-none">
                        <td className="px-3 py-3.5 text-sm font-semibold text-ink">{s.state}</td>
                        <td className="px-3 py-3.5 text-sm text-ink-secondary">
                          {formatNumber(s.orders)}
                        </td>
                        <td className="px-3 py-3.5 text-sm">{formatCurrency(s.value)}</td>
                        <td className="px-3 py-3.5 text-sm text-ink-secondary">
                          {formatPercent(s.pct, 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
