"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state";
import { IconTicket } from "@/components/ui/icons";
import { useTicketMedio } from "@/hooks/relatorios/use-relatorios";
import { formatCurrency, formatNumber } from "@/lib/utils";

/** app/(app)/relatorios/ticket-medio/page.tsx — Ticket médio geral e por produto. */
export default function TicketMedioPage() {
  const { data, isLoading, isError, error } = useTicketMedio();

  return (
    <div>
      <PageHeader title="Ticket médio" subtitle="Ticket médio geral da empresa e por produto" />

      {isLoading && <LoadingState label="Carregando ticket médio..." />}
      {isError && <ErrorState message={error?.message ?? "Erro ao carregar o relatório."} />}

      {data && (
        <>
          <div className="mb-5">
            <KpiCard
              icon={<IconTicket className="h-[19px] w-[19px]" />}
              value={formatCurrency(data.overall)}
              label="Ticket médio geral da empresa (30 dias)"
            />
          </div>

          <Card>
            <CardHeader title="Ticket médio por produto" subtitle="Últimos 30 dias" />
            {data.byProduct.length === 0 ? (
              <EmptyState message="Nenhuma venda registrada no período." />
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    {["Produto", "Ticket médio", "Vendas"].map((h) => (
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
                  {data.byProduct.map((p) => (
                    <tr key={p.product} className="border-b border-white/4 last:border-none">
                      <td className="px-3 py-3.5 text-sm font-semibold text-ink">{p.product}</td>
                      <td className="px-3 py-3.5 text-sm">{formatCurrency(p.avgTicket)}</td>
                      <td className="px-3 py-3.5 text-sm text-ink-secondary">
                        {formatNumber(p.orders)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
