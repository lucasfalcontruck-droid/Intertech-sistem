"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PlatformChip } from "@/components/ui/platform-chip";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state";
import { IconPencil } from "@/components/ui/icons";
import { ProductForm } from "@/components/estoque/product-form";
import { useProducts, useUpdateProduct } from "@/hooks/estoque/use-products";
import type { Product } from "@/lib/types";
import type { ProductFormInput } from "@/hooks/estoque/use-products";
import { formatCurrency, formatNumber } from "@/lib/utils";

/** app/(app)/marketplace/anuncios/page.tsx — Lista de anúncios (produtos) com edição de canais/preço. */
export default function AnunciosPage() {
  const { data, isLoading, isError, error } = useProducts({});
  const updateMutation = useUpdateProduct();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  function openEdit(product: Product) {
    setEditing(product);
    updateMutation.reset();
    setModalOpen(true);
  }

  function handleSubmit(input: ProductFormInput) {
    if (!editing) return;
    updateMutation.mutate({ id: editing.id, ...input }, { onSuccess: () => setModalOpen(false) });
  }

  const products = data?.products ?? [];

  return (
    <div>
      <PageHeader
        title="Anúncios"
        subtitle="Editar preço, cadastro e demais dados dos anúncios direto pelo sistema"
      />

      {isLoading && <LoadingState label="Carregando anúncios..." />}
      {isError && <ErrorState message={error?.message ?? "Erro ao carregar anúncios."} />}

      {data && (
        <Card className="p-0">
          {products.length === 0 ? (
            <EmptyState message="Nenhum anúncio cadastrado ainda." />
          ) : (
            <div className="overflow-x-auto p-5">
              <table className="w-full min-w-[860px] border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    {["Anúncio", "Plataformas", "Preço", "Estoque", "Visualizações", "Status", ""].map(
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
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-white/4 last:border-none hover:bg-white/2">
                      <td className="px-3 py-3.5 text-sm font-semibold text-ink">{p.name}</td>
                      <td className="px-3 py-3.5">
                        <div className="flex gap-1.5">
                          {p.channels.map((c) => (
                            <PlatformChip key={c} platform={c} short />
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-sm">{formatCurrency(p.price)}</td>
                      <td className="px-3 py-3.5 text-sm text-ink-secondary">
                        {p.stock === 0 ? (
                          <span className="text-danger">Esgotado</span>
                        ) : (
                          formatNumber(p.stock)
                        )}
                      </td>
                      <td className="px-3 py-3.5 text-sm text-ink-secondary">
                        {formatNumber(p.adViews)}
                      </td>
                      <td className="px-3 py-3.5">
                        <Badge variant={p.status === "out" ? "out" : p.status === "low" ? "low" : "ok"}>
                          {p.status === "out" ? "Esgotado" : p.status === "low" ? "Estoque baixo" : "Ativo"}
                        </Badge>
                      </td>
                      <td className="px-3 py-3.5">
                        <button
                          onClick={() => openEdit(p)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-ink-secondary hover:bg-white/5 hover:text-ink"
                          aria-label="Editar anúncio"
                        >
                          <IconPencil className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Editar anúncio">
        <ProductForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={updateMutation.isPending}
          errorMessage={updateMutation.error?.message}
        />
      </Modal>
    </div>
  );
}
