"use client";

import { useState } from "react";
import { FornecedorTipo, PedidoCompraStatus } from "@prisma/client";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state";
import { IconPlus, IconPencil, IconTrash } from "@/components/ui/icons";
import { PedidoCompraForm } from "@/components/pedidos/pedido-compra-form";
import {
  usePedidosCompra,
  useCreatePedidoCompra,
  useUpdatePedidoCompra,
  useDeletePedidoCompra,
} from "@/hooks/pedidos/use-pedidos-compra";
import type { PedidoCompra, PedidoCompraFormInput } from "@/hooks/pedidos/use-pedidos-compra";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";

/** app/(app)/pedidos/compra-produto/page.tsx — Pedidos de compra do tipo PRODUTO. */
const STATUS_LABEL: Record<PedidoCompraStatus, string> = {
  AGUARDANDO: "Aguardando",
  EM_TRANSITO: "Em trânsito",
  RECEBIDO: "Recebido",
};
const STATUS_BADGE: Record<PedidoCompraStatus, "pending" | "low" | "ok"> = {
  AGUARDANDO: "pending",
  EM_TRANSITO: "low",
  RECEBIDO: "ok",
};

export default function CompraProdutoPage() {
  const { data, isLoading, isError, error } = usePedidosCompra(FornecedorTipo.PRODUTO);
  const createMutation = useCreatePedidoCompra();
  const updateMutation = useUpdatePedidoCompra();
  const deleteMutation = useDeletePedidoCompra();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PedidoCompra | null>(null);

  const activeMutation = editing ? updateMutation : createMutation;

  function openCreate() {
    setEditing(null);
    createMutation.reset();
    setModalOpen(true);
  }

  function openEdit(pedido: PedidoCompra) {
    setEditing(pedido);
    updateMutation.reset();
    setModalOpen(true);
  }

  function handleSubmit(input: PedidoCompraFormInput) {
    if (editing) {
      updateMutation.mutate({ id: editing.id, ...input }, { onSuccess: () => setModalOpen(false) });
    } else {
      createMutation.mutate(input, { onSuccess: () => setModalOpen(false) });
    }
  }

  function handleDelete(pedido: PedidoCompra) {
    if (confirm(`Excluir o pedido "${pedido.number}"? Esta ação não pode ser desfeita.`)) {
      deleteMutation.mutate(pedido.id);
    }
  }

  return (
    <div>
      <PageHeader
        title="Pedidos de compra — Produto"
        subtitle="Compras de produtos junto a fornecedores"
        action={
          <Button variant="primary" onClick={openCreate}>
            <IconPlus className="h-3.5 w-3.5" />
            Novo pedido de compra
          </Button>
        }
      />

      {isLoading && <LoadingState label="Carregando pedidos..." />}
      {isError && <ErrorState message={error?.message ?? "Erro ao carregar pedidos."} />}

      {data && (
        <Card className="p-0">
          {data.pedidos.length === 0 ? (
            <EmptyState message="Nenhum pedido de compra de produto ainda." />
          ) : (
            <div className="overflow-x-auto p-5">
              <table className="w-full min-w-[820px] border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    {["Pedido", "Fornecedor", "Produto", "Quantidade", "Valor", "Status", "Previsão", ""].map(
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
                  {data.pedidos.map((o) => (
                    <tr key={o.id} className="border-b border-white/4 last:border-none hover:bg-white/2">
                      <td className="px-3 py-3.5 text-sm">{o.number}</td>
                      <td className="px-3 py-3.5 text-sm font-semibold text-ink">{o.fornecedor.name}</td>
                      <td className="px-3 py-3.5 text-sm text-ink-secondary">{o.itemName}</td>
                      <td className="px-3 py-3.5 text-sm">{formatNumber(o.quantity)}</td>
                      <td className="px-3 py-3.5 text-sm">{formatCurrency(o.value)}</td>
                      <td className="px-3 py-3.5">
                        <Badge variant={STATUS_BADGE[o.status]}>{STATUS_LABEL[o.status]}</Badge>
                      </td>
                      <td className="px-3 py-3.5 text-sm text-ink-secondary">
                        {formatDate(o.expectedDate)}
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(o)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-ink-secondary hover:bg-white/5 hover:text-ink"
                            aria-label="Editar"
                          >
                            <IconPencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(o)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-ink-secondary hover:bg-danger/10 hover:text-danger"
                            aria-label="Excluir"
                          >
                            <IconTrash className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar pedido de compra" : "Novo pedido de compra"}
      >
        <PedidoCompraForm
          tipo={FornecedorTipo.PRODUTO}
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={activeMutation.isPending}
          errorMessage={activeMutation.error?.message}
        />
      </Modal>
    </div>
  );
}
