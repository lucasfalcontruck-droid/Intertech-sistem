"use client";

import { useMemo, useState } from "react";
import { OrderStatus, Platform } from "@prisma/client";
import { usePedidos } from "@/hooks/use-pedidos";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { PlatformChip } from "@/components/ui/platform-chip";
import { IconSearch } from "@/components/ui/icons";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/utils";

const STATUS_BADGE: Record<OrderStatus, { variant: BadgeVariant; label: string }> = {
  ENTREGUE: { variant: "ok", label: "Entregue" },
  ENVIADO: { variant: "pending", label: "Enviado" },
  PROCESSANDO: { variant: "low", label: "Processando" },
  CANCELADO: { variant: "out", label: "Cancelado" },
};

export default function PedidosPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [platform, setPlatform] = useState("");
  const [status, setStatus] = useState("");

  const filters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      platform: platform || undefined,
      status: status || undefined,
    }),
    [debouncedSearch, platform, status],
  );

  const { data, isLoading, isError, error } = usePedidos(filters);

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-ink">Pedidos</h2>
        <p className="mt-1 text-[12.5px] text-ink-secondary">
          Todos os pedidos de todas as plataformas
        </p>
      </div>

      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex max-w-[280px] flex-1 items-center gap-2 rounded-[10px] border border-border bg-card px-3 py-2.5">
          <IconSearch className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar pedido ou cliente..."
            className="w-full bg-transparent text-[12.5px] text-ink outline-none placeholder:text-ink-muted"
          />
        </div>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="rounded-[10px] border border-border bg-card px-3 py-2.5 text-[12.5px] text-ink outline-none"
        >
          <option value="">Todas as plataformas</option>
          {Object.values(Platform).map((p) => (
            <option key={p} value={p}>
              {p.replace("_", " ")}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-[10px] border border-border bg-card px-3 py-2.5 text-[12.5px] text-ink outline-none"
        >
          <option value="">Todos os status</option>
          {Object.values(OrderStatus).map((s) => (
            <option key={s} value={s}>
              {STATUS_BADGE[s].label}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <LoadingState label="Carregando pedidos..." />}
      {isError && <ErrorState message={error?.message ?? "Erro ao carregar pedidos."} />}

      {data && (
        <Card className="p-0">
          {data.orders.length === 0 ? (
            <EmptyState message="Nenhum pedido encontrado com esses filtros." />
          ) : (
            <div className="overflow-x-auto p-5">
              <div className="mb-3 text-[12px] text-ink-muted">
                Exibindo {data.orders.length} de {formatNumber(data.total)} pedidos
              </div>
              <table className="w-full min-w-[760px] border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    {["Pedido", "Cliente", "Plataforma", "Itens", "Valor", "Status", "Data"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-3 pb-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-muted"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.orders.map((o) => (
                    <tr
                      key={o.id}
                      className="border-b border-white/4 last:border-none hover:bg-white/2"
                    >
                      <td className="px-3 py-3.5 text-sm">#{o.number}</td>
                      <td className="px-3 py-3.5 text-sm">{o.customerName}</td>
                      <td className="px-3 py-3.5">
                        <PlatformChip platform={o.platform} />
                      </td>
                      <td
                        className="px-3 py-3.5 text-sm text-ink-secondary"
                        title={o.items.map((i) => `${i.quantity}x ${i.productName}`).join(", ")}
                      >
                        {o.items.reduce((s, i) => s + i.quantity, 0)} un.
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
