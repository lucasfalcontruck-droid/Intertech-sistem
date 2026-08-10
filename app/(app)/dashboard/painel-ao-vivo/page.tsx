"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state";
import { IconCart, IconRevenue, IconTicket, IconRefresh } from "@/components/ui/icons";
import { usePainelAoVivo } from "@/hooks/relatorios/use-relatorios";
import { formatCurrency, formatDateTime } from "@/lib/utils";

/** app/(app)/dashboard/painel-ao-vivo/page.tsx — Painel ao vivo de vendas do Mercado Livre (atualiza a cada 15s). */
export default function PainelAoVivoPage() {
  const { data, isLoading, isError, error } = usePainelAoVivo();

  return (
    <div>
      <PageHeader
        title="Painel ao vivo de vendas"
        subtitle="Todas as vendas do Mercado Livre contabilizadas em tempo real"
        action={
          <div className="flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-[11.5px] font-bold text-success">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            AO VIVO
          </div>
        }
      />

      {isLoading && <LoadingState label="Carregando painel ao vivo..." />}
      {isError && <ErrorState message={error?.message ?? "Erro ao carregar o painel."} />}

      {data && (
        <>
          <div className="mb-5 grid grid-cols-4 gap-4">
            <KpiCard
              icon={<IconRevenue className="h-[19px] w-[19px]" />}
              value={formatCurrency(data.salesToday)}
              label="Vendas hoje (Mercado Livre)"
            />
            <KpiCard
              icon={<IconCart className="h-[19px] w-[19px]" />}
              value={String(data.ordersToday)}
              label="Pedidos hoje"
            />
            <KpiCard
              icon={<IconTicket className="h-[19px] w-[19px]" />}
              value={formatCurrency(data.avgTicket)}
              label="Ticket médio hoje"
            />
            <KpiCard
              icon={<IconRefresh className="h-[19px] w-[19px]" />}
              value={data.lastOrderAt ? formatDateTime(data.lastOrderAt) : "—"}
              label="Última venda registrada"
            />
          </div>

          <Card className="p-0">
            <div className="p-5 pb-0">
              <CardHeader
                title="Feed de vendas em tempo real"
                subtitle="Atualiza automaticamente a cada 15 segundos"
              />
            </div>
            {data.feed.length === 0 ? (
              <EmptyState message="Nenhuma venda do Mercado Livre registrada ainda." />
            ) : (
              <div className="overflow-x-auto px-5 pb-5">
                <table className="w-full min-w-[560px] border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      {["Horário", "Produto", "Comprador", "Valor"].map((h) => (
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
                    {data.feed.map((sale, i) => (
                      <tr key={i} className="border-b border-white/4 last:border-none hover:bg-white/2">
                        <td className="px-3 py-3 text-sm text-ink-secondary">
                          {formatDateTime(sale.time)}
                        </td>
                        <td className="px-3 py-3 text-sm font-semibold text-ink">{sale.product}</td>
                        <td className="px-3 py-3 text-sm text-ink-secondary">{sale.buyer}</td>
                        <td className="px-3 py-3 text-sm">{formatCurrency(sale.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
