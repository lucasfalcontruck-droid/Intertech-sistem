"use client";

/**
 * hooks/estoque/use-products.ts — Área Estoque: hooks para listar produtos
 * (com filtros), resumo de estoque, estoque por categoria e CRUD de produtos.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { EstoqueSummaryData, Product } from "@/lib/types";
import type { Platform } from "@prisma/client";

export interface ProductFormInput {
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  costPrice?: number | null;
  location?: string | null;
  channels: Platform[];
}

export interface ProductQueryFilters {
  search?: string;
  category?: string;
  status?: string;
}

/** Lista produtos filtrados por busca, categoria e status de estoque. */
export function useProducts(filters: ProductQueryFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.status) params.set("status", filters.status);
  const qs = params.toString();

  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => apiFetch<{ products: Product[] }>(`/api/estoque/products${qs ? `?${qs}` : ""}`),
  });
}

/** Busca os KPIs gerais de estoque (SKUs, valor total, baixo/zerado). */
export function useEstoqueSummary() {
  return useQuery({
    queryKey: ["estoque-summary"],
    queryFn: () => apiFetch<EstoqueSummaryData>("/api/estoque/summary"),
  });
}

/** Busca o estoque agrupado por categoria (unidades e valor). */
export function useEstoqueCategoria() {
  return useQuery({
    queryKey: ["estoque-categoria"],
    queryFn: () =>
      apiFetch<{ categories: { category: string; skus: number; units: number; value: number }[] }>(
        "/api/estoque/categoria",
      ),
  });
}

/** Invalida listagem, resumo de estoque e dashboard após uma mutação de produto. */
function invalidateEstoque(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["products"] });
  queryClient.invalidateQueries({ queryKey: ["estoque-summary"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
}

/** Cria um novo produto. */
export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductFormInput) =>
      apiFetch<{ product: Product }>("/api/estoque/products", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => invalidateEstoque(queryClient),
  });
}

/** Atualiza um produto existente. */
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: ProductFormInput & { id: string }) =>
      apiFetch<{ product: Product }>(`/api/estoque/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    onSuccess: () => invalidateEstoque(queryClient),
  });
}

/** Exclui um produto. */
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/estoque/products/${id}`, { method: "DELETE" }),
    onSuccess: () => invalidateEstoque(queryClient),
  });
}
