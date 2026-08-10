"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { PlatformBarChart } from "@/components/charts/platform-bar-chart";
import { PLATFORM_LABEL } from "@/components/ui/platform-chip";
import { useDashboard } from "@/hooks/dashboard/use-dashboard";
import { useCanalPerformance } from "@/hooks/relatorios/use-relatorios";
import { formatCurrency, formatNumber } from "@/lib/utils";

/** app/(app)/dashboard/vendas-semanais/page.tsx — Gráfico comparativo de vendas semanais por loja/canal. */
export default function VendasSemanaisPage() {
  const dashboardQuery = useDashboard();
  const canaisQuery = useCanalPerformance();

  const isLoading = dashboardQuery.isLoading || canaisQuery.isLoading;
  const isError = dashboardQuery.isError || canaisQuery.isError;

  return (
    <div>
      <PageHeader title="Vendas semanais por loja" subtitle="Gráfico comparativo de vendas por canal de venda" />

      {isLoading && <LoadingState label="Carregando vendas semanais..." />}
      {isError && <ErrorState message="Erro ao carregar vendas semanais." />}

      {dashboardQuery.data && (
        <Card className="mb-4">
          <CardHeader title="Vendas por semana" subtitle="Últimas 4 semanas · por canal" />
          <div className="h-[280px]">
            <PlatformBarChart data={dashboardQuery.data.salesByPlatformWeekly} />
          </div>
        </Card>
      )}

      {canaisQuery.data && (
        <Card>
          <CardHeader title="Resumo do período" subtitle="Últimos 30 dias" />
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                {["Canal", "Faturamento", "Pedidos", "Ticket médio"].map((h) => (
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
              {canaisQuery.data.canais.map((c) => (
                <tr key={c.platform} className="border-b border-white/4 last:border-none">
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
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
