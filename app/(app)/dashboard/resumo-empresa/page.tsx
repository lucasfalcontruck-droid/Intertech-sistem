"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import { Badge } from "@/components/ui/badge";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { IconRevenue, IconCart, IconTicket, IconMarketplace } from "@/components/ui/icons";
import { PLATFORM_LABEL } from "@/components/ui/platform-chip";
import { useCanalPerformance } from "@/hooks/relatorios/use-relatorios";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

/** app/(app)/dashboard/resumo-empresa/page.tsx — Visão consolidada de todos os canais de venda. */
export default function ResumoEmpresaPage() {
  const { data, isLoading, isError, error } = useCanalPerformance();

  const canais = data?.canais ?? [];
  const totalRevenue = canais.reduce((s, c) => s + c.revenue, 0);
  const totalOrders = canais.reduce((s, c) => s + c.orders, 0);
  const avgMargin =
    canais.length > 0 ? canais.reduce((s, c) => s + c.margin, 0) / canais.length : 0;

  return (
    <div>
      <PageHeader title="Resumo por empresa" subtitle="Visão consolidada de todos os canais de venda" />

      {isLoading && <LoadingState label="Carregando resumo..." />}
      {isError && <ErrorState message={error?.message ?? "Erro ao carregar o resumo."} />}

      {data && (
        <>
          <div className="mb-5 grid grid-cols-4 gap-4">
            <KpiCard
              icon={<IconRevenue className="h-[19px] w-[19px]" />}
              value={formatCurrency(totalRevenue)}
              label="Faturamento consolidado (30 dias)"
            />
            <KpiCard
              icon={<IconMarketplace className="h-[19px] w-[19px]" />}
              value={String(canais.length)}
              label="Canais de venda ativos"
            />
            <KpiCard
              icon={<IconCart className="h-[19px] w-[19px]" />}
              value={formatNumber(totalOrders)}
              label="Pedidos no período"
            />
            <KpiCard
              icon={<IconTicket className="h-[19px] w-[19px]" />}
              value={formatPercent(avgMargin)}
              label="Margem líquida média"
            />
          </div>

          <Card className="p-0">
            <div className="p-5 pb-0">
              <CardHeader title="Desempenho por canal" subtitle="Últimos 30 dias" />
            </div>
            <div className="overflow-x-auto px-5 pb-5">
              <table className="w-full min-w-[720px] border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    {["Canal", "Faturamento", "Pedidos", "Ticket médio", "Margem"].map((h) => (
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
                      <td className="px-3 py-3.5 text-sm text-ink-secondary">
                        {formatNumber(c.orders)}
                      </td>
                      <td className="px-3 py-3.5 text-sm text-ink-secondary">
                        {formatCurrency(c.avgTicket)}
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
        </>
      )}
    </div>
  );
}
