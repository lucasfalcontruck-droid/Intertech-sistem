"use client";

import { useState } from "react";
import {
  useCreateProduct,
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
} from "@/hooks/estoque/use-products";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ProductForm } from "@/components/estoque/product-form";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state";
import { IconBoxTop, IconRevenue, IconPlus, IconPencil, IconTrash } from "@/components/ui/icons";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { Product } from "@/lib/types";
import type { ProductFormInput } from "@/hooks/estoque/use-products";

/** app/(app)/estoque/acabado/page.tsx — Lista e CRUD de produtos acabados. */
export default function EstoqueAcabadoPage() {
  const { data, isLoading, isError, error } = useProducts({});
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const activeMutation = editing ? updateMutation : createMutation;

  function openCreate() {
    setEditing(null);
    createMutation.reset();
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    updateMutation.reset();
    setModalOpen(true);
  }

  function handleSubmit(input: ProductFormInput) {
    if (editing) {
      updateMutation.mutate({ id: editing.id, ...input }, { onSuccess: () => setModalOpen(false) });
    } else {
      createMutation.mutate(input, { onSuccess: () => setModalOpen(false) });
    }
  }

  function handleDelete(product: Product) {
    if (confirm(`Excluir o produto "${product.name}"? Esta ação não pode ser desfeita.`)) {
      deleteMutation.mutate(product.id);
    }
  }

  const products = data?.products ?? [];
  const totalUnits = products.reduce((s, p) => s + p.stock, 0);
  const totalValue = products.reduce((s, p) => s + p.stock * (p.costPrice ?? p.price * 0.6), 0);

  return (
    <div>
      <PageHeader
        title="Estoque acabado"
        subtitle="Produtos finalizados prontos para venda"
        action={
          <Button variant="primary" onClick={openCreate}>
            <IconPlus className="h-3.5 w-3.5" />
            Novo produto
          </Button>
        }
      />

      {isLoading && <LoadingState label="Carregando estoque..." />}
      {isError && <ErrorState message={error?.message ?? "Erro ao carregar estoque."} />}

      {data && (
        <>
          <div className="mb-5 grid grid-cols-2 gap-4">
            <KpiCard
              icon={<IconBoxTop className="h-[19px] w-[19px]" />}
              value={formatNumber(totalUnits)}
              label="Unidades de produto acabado"
            />
            <KpiCard
              icon={<IconRevenue className="h-[19px] w-[19px]" />}
              value={formatCurrency(totalValue)}
              label="Valor total em produto acabado"
            />
          </div>

          <Card className="p-0">
            {products.length === 0 ? (
              <EmptyState message="Nenhum produto cadastrado ainda." />
            ) : (
              <div className="overflow-x-auto p-5">
                <table className="w-full min-w-[820px] border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      {[
                        "Produto",
                        "SKU",
                        "Quantidade",
                        "Custo unitário",
                        "Valor total",
                        "Localização",
                        "",
                      ].map((h) => (
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
                    {products.map((p) => {
                      const cost = p.costPrice ?? p.price * 0.6;
                      return (
                        <tr key={p.id} className="border-b border-white/4 last:border-none hover:bg-white/2">
                          <td className="px-3 py-3.5 text-sm font-semibold text-ink">{p.name}</td>
                          <td className="px-3 py-3.5 text-sm text-ink-secondary">{p.sku}</td>
                          <td className="px-3 py-3.5 text-sm">{formatNumber(p.stock)}</td>
                          <td className="px-3 py-3.5 text-sm text-ink-secondary">
                            {formatCurrency(cost)}
                            {!p.costPrice && (
                              <span className="ml-1 text-[10px] text-ink-muted">(estimado)</span>
                            )}
                          </td>
                          <td className="px-3 py-3.5 text-sm">{formatCurrency(p.stock * cost)}</td>
                          <td className="px-3 py-3.5 text-sm text-ink-secondary">
                            {p.location ?? "—"}
                          </td>
                          <td className="px-3 py-3.5">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => openEdit(p)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-ink-secondary hover:bg-white/5 hover:text-ink"
                                aria-label="Editar"
                              >
                                <IconPencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(p)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-ink-secondary hover:bg-danger/10 hover:text-danger"
                                aria-label="Excluir"
                              >
                                <IconTrash className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar produto" : "Novo produto"}
      >
        <ProductForm
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
