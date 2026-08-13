"use client";

import { useState } from "react";
import Link from "next/link";
import { useDashboard } from "@/hooks/dashboard/use-dashboard";
import { useMarketplace } from "@/hooks/marketplace/use-marketplace";
import { useAllStoresDailyStats } from "@/hooks/marketplace/use-store-stats";
import { HeroMetric, KpiRow } from "@/components/ui/hero-metric";
import { Card, CardHeader, LinkButton } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { PlatformChip } from "@/components/ui/platform-chip";
import { StoreStatsCard } from "@/components/marketplace/store-stats-card";
import { IconExport } from "@/components/ui/icons";
import { PlatformBarChart } from "@/components/charts/platform-bar-chart";
import { PlatformDonutChart } from "@/components/charts/platform-donut-chart";
import { SalesLineChart } from "@/components/charts/sales-line-chart";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { formatCurrency, formatDateTime, formatNumber, formatPercent } from "@/lib/utils";
import { PLATFORM_LABEL } from "@/components/ui/platform-chip";
import type { OrderStatus } from "@prisma/client";

/** app/(app)/dashboard/page.tsx — Visão geral do Dashboard: KPIs, gráficos e pedidos recentes. */
const ORDER_STATUS_BADGE: Record<OrderStatus, { variant: BadgeVariant; label: string }> = {
  ENTREGUE: { variant: "ok", label: "Entregue" },
  ENVIADO: { variant: "pending", label: "Enviado" },
  PROCESSANDO: { variant: "low", label: "Processando" },
  CANCELADO: { variant: "out", label: "Cancelado" },
};

export default function DashboardPage() {
  const [storeId, setStoreId] = useState("");
  const { data, isLoading, isError, error } = useDashboard(storeId || undefined);
  const { data: marketplaceData } = useMarketplace();
  const { data: storeStatsData } = useAllStoresDailyStats();

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-2.5">
        <select
          value={storeId}
          onChange={(e) => setStoreId(e.target.value)}
          className="rounded-[10px] border border-border bg-card px-3 py-2.5 text-[12.5px] text-ink outline-none"
        >
          <option value="">Todas as lojas</option>
          {marketplaceData?.integrationCards.map((s) => (
            <option key={s.id} value={s.id}>
              {s.storeName} · {PLATFORM_LABEL[s.platform]}
            </option>
          ))}
        </select>
        <div className="flex gap-2.5">
          <Button variant="secondary">Período: 30 dias</Button>
          <Button variant="primary">
            <IconExport className="h-3.5 w-3.5" />
            Exportar relatório
          </Button>
        </div>
      </div>

      {isLoading && <LoadingState label="Carregando dashboard..." />}
      {isError && <ErrorState message={error?.message ?? "Erro ao carregar o dashboard."} />}

      {data && (
        <>
          <HeroMetric
            label="Vendas hoje · todas as plataformas"
            value={formatCurrency(data.kpis.salesToday)}
            trend={{
              direction: data.kpis.salesTrend >= 0 ? "up" : "down",
              label: `${formatPercent(Math.abs(data.kpis.salesTrend))} vs. média diária`,
            }}
          />
          <KpiRow
            items={[
              {
                label: "Pedidos hoje",
                value: formatNumber(data.kpis.ordersToday),
                trend: {
                  direction: data.kpis.ordersTrend >= 0 ? "up" : "down",
                  label: formatPercent(Math.abs(data.kpis.ordersTrend)),
                },
              },
              {
                label: "Ticket médio",
                value: formatCurrency(data.kpis.avgTicketToday),
                trend: {
                  direction: data.kpis.avgTicketTrend >= 0 ? "up" : "down",
                  label: formatPercent(Math.abs(data.kpis.avgTicketTrend)),
                },
              },
              {
                label: "Estoque baixo",
                value: `${data.kpis.lowStockCount} SKUs`,
                flag: data.kpis.lowStockCount > 0 ? "necessita ação" : undefined,
              },
            ]}
          />

          {storeStatsData && storeStatsData.stats.length > 0 && (
            <div className="mb-4">
              <p className="mb-2.5 text-[13px] font-bold text-ink">Detalhamento por loja · hoje</p>
              <div className="grid grid-cols-2 gap-4">
                {storeStatsData.stats.map((s) => (
                  <StoreStatsCard key={s.storeId} stats={s} />
                ))}
              </div>
            </div>
          )}

          <div className="mb-4 grid grid-cols-[1.4fr_1fr] gap-4">
            <Card>
              <CardHeader
                title="Vendas por plataforma"
                subtitle={`Últimos 30 dias · ${formatCurrency(data.grandTotal)} no total`}
                action={<LinkButton>Ver detalhes →</LinkButton>}
              />
              <div className="h-[230px]">
                <PlatformBarChart data={data.salesByPlatformWeekly} />
              </div>
            </Card>

            <Card>
              <CardHeader title="Participação por canal" subtitle="% do faturamento" />
              <div className="h-[170px]">
                <PlatformDonutChart data={data.platformShare} />
              </div>
              <div className="mt-3.5 flex flex-col gap-3">
                {data.platformShare.map((row) => (
                  <div key={row.platform} className="flex items-center gap-2.5 text-[12.5px]">
                    <span
                      className="h-[9px] w-[9px] shrink-0 rounded-[3px]"
                      style={{
                        background:
                          row.platform === "MERCADO_LIVRE"
                            ? "#ffe600"
                            : row.platform === "SHOPEE"
                              ? "#ee4d2d"
                              : "#25f4ee",
                      }}
                    />
                    <span className="flex-1 font-medium text-ink-secondary">
                      {PLATFORM_LABEL[row.platform]}
                    </span>
                    <span className="font-bold text-white">{formatCurrency(row.total)}</span>
                    <span className="w-[38px] text-right text-ink-muted">
                      {formatPercent(row.pct, 0)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="mb-4 grid grid-cols-[1.4fr_1fr] gap-4">
            <Card>
              <CardHeader title="Evolução de vendas" subtitle="Últimos 30 dias" />
              <div className="h-[280px]">
                <SalesLineChart data={data.dailyEvolution} />
              </div>
            </Card>

            <Card>
              <CardHeader
                title="Estoque baixo"
                subtitle="Ação recomendada"
                action={
                  <Link href="/estoque">
                    <LinkButton>Ver estoque →</LinkButton>
                  </Link>
                }
              />
              <table className="w-full border-collapse">
                <tbody>
                  {data.lowStockProducts.map((p) => (
                    <tr key={p.id} className="border-b border-white/4 last:border-none">
                      <td className="py-3">
                        <div>
                          <div className="text-sm font-semibold text-ink">{p.name}</div>
                          <div className="text-[11px] text-ink-muted">{p.sku}</div>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <Badge variant={p.stock <= 0 ? "out" : "low"}>{p.stock} un.</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>

          <Card>
            <CardHeader
              title="Pedidos recentes"
              subtitle="Últimas movimentações em todas as plataformas"
              action={
                <Link href="/pedidos">
                  <LinkButton>Ver todos →</LinkButton>
                </Link>
              }
            />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    {["Pedido", "Cliente", "Plataforma", "Valor", "Status", "Data"].map((h) => (
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
                  {data.recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-white/4 last:border-none hover:bg-white/2"
                    >
                      <td className="px-3 py-3.5 text-sm">#{order.number}</td>
                      <td className="px-3 py-3.5 text-sm">{order.customerName}</td>
                      <td className="px-3 py-3.5">
                        <PlatformChip platform={order.platform} />
                      </td>
                      <td className="px-3 py-3.5 text-sm">{formatCurrency(order.total)}</td>
                      <td className="px-3 py-3.5">
                        <Badge variant={ORDER_STATUS_BADGE[order.status].variant}>
                          {ORDER_STATUS_BADGE[order.status].label}
                        </Badge>
                      </td>
                      <td className="px-3 py-3.5 text-sm text-ink-secondary">
                        {formatDateTime(order.createdAt)}
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
