"use client";

import { useMemo, useState } from "react";
import { OrderStatus } from "@prisma/client";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { PlatformChip } from "@/components/ui/platform-chip";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state";
import { usePedidos } from "@/hooks/pedidos/use-pedidos";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/utils";

const STATUS_BADGE: Record<OrderStatus, { variant: BadgeVariant; label: string }> = {
  ENTREGUE: { variant: "ok", label: "Entregue" },
  ENVIADO: { variant: "pending", label: "Enviado" },
  PROCESSANDO: { variant: "low", label: "Processando" },
  CANCELADO: { variant: "out", label: "Cancelado" },
};

/** app/(app)/pedidos/data-pedido/page.tsx — Lista de pedidos filtrada por período/data. */
function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export default function DataPedidoPage() {
  const [from, setFrom] = useState(todayISO(-30));
  const [to, setTo] = useState(todayISO());

  const filters = useMemo(() => ({ dateFrom: from, dateTo: to }), [from, to]);
  const { data, isLoading, isError, error } = usePedidos(filters);

  return (
    <div>
      <PageHeader title="Data pedido" subtitle="Consulta de pedidos por data" />

      <div className="mb-4 flex items-center gap-2.5">
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-ink-secondary">De</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-[10px] border border-border bg-card px-3 py-2.5 text-[12.5px] text-ink outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-ink-secondary">Até</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-[10px] border border-border bg-card px-3 py-2.5 text-[12.5px] text-ink outline-none"
          />
        </div>
      </div>

      {isLoading && <LoadingState label="Carregando pedidos..." />}
      {isError && <ErrorState message={error?.message ?? "Erro ao carregar pedidos."} />}

      {data && (
        <Card className="p-0">
          {data.orders.length === 0 ? (
            <EmptyState message="Nenhum pedido encontrado nesse período." />
          ) : (
            <div className="overflow-x-auto p-5">
              <div className="mb-3 text-[12px] text-ink-muted">
                Exibindo {data.orders.length} de {formatNumber(data.total)} pedidos no período
              </div>
              <table className="w-full min-w-[700px] border-collapse">
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
                  {data.orders.map((o) => (
                    <tr key={o.id} className="border-b border-white/4 last:border-none hover:bg-white/2">
                      <td className="px-3 py-3.5 text-sm">#{o.number}</td>
                      <td className="px-3 py-3.5 text-sm font-semibold text-ink">{o.customerName}</td>
                      <td className="px-3 py-3.5">
                        <PlatformChip platform={o.platform} short />
                      </td>
                      <td className="px-3 py-3.5 text-sm">{formatCurrency(o.total)}</td>
                      <td className="px-3 py-3.5">
                        <Badge variant={STATUS_BADGE[o.status].variant}>
                          {STATUS_BADGE[o.status].label}
                        </Badge>
                      </td>
                      <td className="px-3 py-3.5 text-sm text-ink-secondary">
                        {formatDateTime(o.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
