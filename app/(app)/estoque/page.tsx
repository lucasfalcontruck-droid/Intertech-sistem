"use client";

import { useMemo, useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  useCreateProduct,
  useDeleteProduct,
  useEstoqueSummary,
  useProducts,
  useUpdateProduct,
} from "@/hooks/estoque/use-products";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlatformChip } from "@/components/ui/platform-chip";
import { Modal } from "@/components/ui/modal";
import { ProductForm } from "@/components/estoque/product-form";
import { CategoryBarChart } from "@/components/charts/category-bar-chart";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state";
import {
  IconBox,
  IconRevenue,
  IconAlertTriangle,
  IconXCircle,
  IconPlus,
  IconSearch,
  IconBoxTop,
  IconPencil,
  IconTrash,
} from "@/components/ui/icons";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { Product } from "@/lib/types";
import type { ProductFormInput } from "@/hooks/estoque/use-products";
import type { ProductStatus } from "@/lib/utils";

/** app/(app)/estoque/page.tsx — Visão geral de Estoque: KPIs, produtos e CRUD de produtos. */
const STATUS_LABEL: Record<ProductStatus, string> = { ok: "Ok", low: "Baixo", out: "Esgotado" };
const STATUS_OPTIONS: ProductStatus[] = ["ok", "low", "out"];

export default function EstoquePage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      category: category || undefined,
      status: status || undefined,
    }),
    [debouncedSearch, category, status],
  );

  const summaryQuery = useEstoqueSummary();
  const productsQuery = useProducts(filters);
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const activeMutation = editingProduct ? updateMutation : createMutation;

  function openCreate() {
    setEditingProduct(null);
    createMutation.reset();
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    updateMutation.reset();
    setModalOpen(true);
  }

  function handleSubmit(input: ProductFormInput) {
    if (editingProduct) {
      updateMutation.mutate(
        { id: editingProduct.id, ...input },
        { onSuccess: () => setModalOpen(false) },
      );
    } else {
      createMutation.mutate(input, { onSuccess: () => setModalOpen(false) });
    }
  }

  function handleDelete(product: Product) {
    if (confirm(`Excluir o produto "${product.name}"? Esta ação não pode ser desfeita.`)) {
      deleteMutation.mutate(product.id);
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">Estoque</h2>
          <p className="mt-1 text-[12.5px] text-ink-secondary">
            Controle de produtos, quantidades e reposição
          </p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <IconPlus className="h-3.5 w-3.5" />
          Novo produto
        </Button>
      </div>

      {summaryQuery.isLoading && <LoadingState label="Carregando estoque..." />}
      {summaryQuery.isError && (
        <ErrorState message={summaryQuery.error?.message ?? "Erro ao carregar estoque."} />
      )}

      {summaryQuery.data && (
        <>
          <div className="mb-5 grid grid-cols-4 gap-4">
            <KpiCard
              icon={<IconBox className="h-[19px] w-[19px]" />}
              value={formatNumber(summaryQuery.data.summary.totalSkus)}
              label="SKUs cadastrados"
            />
            <KpiCard
              icon={<IconRevenue className="h-[19px] w-[19px]" />}
              value={formatCurrency(summaryQuery.data.summary.totalStockValue)}
              label="Valor total em estoque"
            />
            <KpiCard
              icon={<IconAlertTriangle className="h-[19px] w-[19px]" />}
              value={formatNumber(summaryQuery.data.summary.lowStockCount)}
              label="Itens com estoque baixo"
            />
            <KpiCard
              icon={<IconXCircle className="h-[19px] w-[19px]" />}
              value={formatNumber(summaryQuery.data.summary.outOfStockCount)}
              label="Itens sem estoque"
            />
          </div>

          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex max-w-[280px] flex-1 items-center gap-2 rounded-[10px] border border-border bg-card px-3 py-2.5">
              <IconSearch className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar produto ou SKU..."
                className="w-full bg-transparent text-[12.5px] text-ink outline-none placeholder:text-ink-muted"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-[10px] border border-border bg-card px-3 py-2.5 text-[12.5px] text-ink outline-none"
            >
              <option value="">Todas as categorias</option>
              {summaryQuery.data.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-[10px] border border-border bg-card px-3 py-2.5 text-[12.5px] text-ink outline-none"
            >
              <option value="">Todos os status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>

          <Card className="mb-4 p-0">
            {productsQuery.isLoading && <LoadingState label="Carregando produtos..." />}
            {productsQuery.isError && (
              <ErrorState message={productsQuery.error?.message ?? "Erro ao carregar produtos."} />
            )}
            {productsQuery.data && productsQuery.data.products.length === 0 && (
              <EmptyState message="Nenhum produto encontrado com esses filtros." />
            )}
            {productsQuery.data && productsQuery.data.products.length > 0 && (
              <div className="overflow-x-auto p-5">
                <table className="w-full min-w-[860px] border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      {[
                        "Produto",
                        "Categoria",
                        "Estoque",
                        "Mínimo",
                        "Status",
                        "Preço",
                        "Canais",
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
                    {productsQuery.data.products.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-white/4 last:border-none hover:bg-white/2"
                      >
                        <td className="px-3 py-3.5">
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
                        <td className="px-3 py-3.5 text-sm text-ink-secondary">{p.category}</td>
                        <td className="px-3 py-3.5 text-sm">{p.stock}</td>
                        <td className="px-3 py-3.5 text-sm text-ink-secondary">{p.minStock}</td>
                        <td className="px-3 py-3.5">
                          <Badge variant={p.status}>{STATUS_LABEL[p.status]}</Badge>
                        </td>
                        <td className="px-3 py-3.5 text-sm">{formatCurrency(p.price)}</td>
                        <td className="px-3 py-3.5">
                          <div className="flex gap-1.5">
                            {p.channels.map((c) => (
                              <PlatformChip key={c} platform={c} short />
                            ))}
                          </div>
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
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card>
            <CardHeader
              title="Giro de estoque por categoria"
              subtitle="Unidades vendidas nos últimos 30 dias"
            />
            <div className="h-[230px]">
              <CategoryBarChart data={summaryQuery.data.byCategory} />
            </div>
          </Card>
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? "Editar produto" : "Novo produto"}
      >
        <ProductForm
          initial={editingProduct ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={activeMutation.isPending}
          errorMessage={activeMutation.error?.message}
        />
      </Modal>
    </div>
  );
}
