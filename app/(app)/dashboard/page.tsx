"use client";

import Link from "next/link";
import { useDashboard } from "@/hooks/dashboard/use-dashboard";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardHeader, LinkButton } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { PlatformChip } from "@/components/ui/platform-chip";
import {
  IconRevenue,
  IconCart,
  IconTicket,
  IconAlertTriangle,
  IconExport,
  IconBoxTop,
} from "@/components/ui/icons";
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
  const { data, isLoading, isError, error } = useDashboard();

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">Visão Geral</h2>
          <p className="mt-1 text-[12.5px] text-ink-secondary">
            Resumo consolidado de vendas, estoque e financeiro
          </p>
        </div>
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
          <div className="mb-5 grid grid-cols-4 gap-4">
            <KpiCard
              icon={<IconRevenue className="h-[19px] w-[19px]" />}
              value={formatCurrency(data.kpis.salesToday)}
              label="Vendas hoje (todas as plataformas)"
              trend={{
                direction: data.kpis.salesTrend >= 0 ? "up" : "down",
                label: formatPercent(Math.abs(data.kpis.salesTrend)),
              }}
            />
            <KpiCard
              icon={<IconCart className="h-[19px] w-[19px]" />}
              value={formatNumber(data.kpis.ordersToday)}
              label="Pedidos hoje"
              trend={{
                direction: data.kpis.ordersTrend >= 0 ? "up" : "down",
                label: formatPercent(Math.abs(data.kpis.ordersTrend)),
              }}
            />
            <KpiCard
              icon={<IconTicket className="h-[19px] w-[19px]" />}
              value={formatCurrency(data.kpis.avgTicketToday)}
              label="Ticket médio"
              trend={{
                direction: data.kpis.avgTicketTrend >= 0 ? "up" : "down",
                label: formatPercent(Math.abs(data.kpis.avgTicketTrend)),
              }}
            />
            <KpiCard
              icon={<IconAlertTriangle className="h-[19px] w-[19px]" />}
              value={`${data.kpis.lowStockCount} SKUs`}
              label="Com estoque baixo"
            />
          </div>

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
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg border border-border bg-card-2 text-ink-muted">
                            <IconBoxTop className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-ink">{p.name}</div>
                            <div className="text-[11px] text-ink-muted">{p.sku}</div>
                          </div>
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
