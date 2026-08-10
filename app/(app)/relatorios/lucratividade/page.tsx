"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { GenericBarChart } from "@/components/charts/generic-bar-chart";
import { IconTrendUp } from "@/components/ui/icons";
import { PLATFORM_LABEL } from "@/components/ui/platform-chip";
import { useCanalPerformance } from "@/hooks/relatorios/use-relatorios";
import { formatCurrency, formatPercent } from "@/lib/utils";

/** app/(app)/relatorios/lucratividade/page.tsx — Margem de lucro por canal de venda. */
export default function LucratividadePage() {
  const { data, isLoading, isError, error } = useCanalPerformance();
  const canais = data?.canais ?? [];
  const avgMargin = canais.length > 0 ? canais.reduce((s, c) => s + c.margin, 0) / canais.length : 0;

  return (
    <div>
      <PageHeader
        title="Lucratividade por loja"
        subtitle="Lucratividade geral da empresa e individual por canal de venda"
      />

      {isLoading && <LoadingState label="Carregando lucratividade..." />}
      {isError && <ErrorState message={error?.message ?? "Erro ao carregar lucratividade."} />}

      {data && (
        <>
          <div className="mb-5">
            <KpiCard
              icon={<IconTrendUp className="h-[19px] w-[19px]" />}
              value={formatPercent(avgMargin)}
              label="Margem líquida média da empresa"
            />
          </div>

          <Card className="mb-4">
            <CardHeader title="Margem por canal" subtitle="Últimos 30 dias" />
            <div className="h-[240px]">
              <GenericBarChart
                data={canais.map((c) => ({ label: PLATFORM_LABEL[c.platform], value: c.margin }))}
                formatter={(v) => formatPercent(v, 0)}
                color="#22c55e"
              />
            </div>
          </Card>

          <Card>
            <CardHeader title="Detalhamento por canal" />
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  {["Canal", "Faturamento", "Lucro", "Margem"].map((h) => (
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
                {canais.map((c) => (
                  <tr key={c.platform} className="border-b border-white/4 last:border-none">
                    <td className="px-3 py-3.5 text-sm font-semibold text-ink">
                      {PLATFORM_LABEL[c.platform]}
                    </td>
                    <td className="px-3 py-3.5 text-sm">{formatCurrency(c.revenue)}</td>
                    <td className="px-3 py-3.5 text-sm font-bold text-success">
                      {formatCurrency(c.profit)}
                    </td>
                    <td className="px-3 py-3.5 text-sm">{formatPercent(c.margin)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
