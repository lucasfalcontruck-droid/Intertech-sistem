"use client";

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
  channels: Platform[];
}

export interface ProductQueryFilters {
  search?: string;
  category?: string;
  status?: string;
}

export function useProducts(filters: ProductQueryFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.status) params.set("status", filters.status);
  const qs = params.toString();

  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => apiFetch<{ products: Product[] }>(`/api/products${qs ? `?${qs}` : ""}`),
  });
}

export function useEstoqueSummary() {
  return useQuery({
    queryKey: ["estoque-summary"],
    queryFn: () => apiFetch<EstoqueSummaryData>("/api/estoque/summary"),
  });
}

function invalidateEstoque(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["products"] });
  queryClient.invalidateQueries({ queryKey: ["estoque-summary"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductFormInput) =>
      apiFetch<{ product: Product }>("/api/products", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => invalidateEstoque(queryClient),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: ProductFormInput & { id: string }) =>
      apiFetch<{ product: Product }>(`/api/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    onSuccess: () => invalidateEstoque(queryClient),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/products/${id}`, { method: "DELETE" }),
    onSuccess: () => invalidateEstoque(queryClient),
  });
}
