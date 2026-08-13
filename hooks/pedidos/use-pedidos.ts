"use client";

/** hooks/pedidos/use-pedidos.ts — Área Pedidos: hook de listagem paginada de pedidos de venda com filtros. */
import { useQuery } from "@tanstack/react-query";
import type { OrderStatus, Platform } from "@prisma/client";
import { apiFetch } from "@/lib/api";

export interface OrderRow {
  id: string;
  number: string;
  customerName: string;
  platform: Platform;
  total: number;
  status: OrderStatus;
  createdAt: string;
  items: { productName: string; quantity: number; unitPrice: number }[];
}

export interface OrderFilters {
  search?: string;
  platform?: string;
  storeId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

/** Lista pedidos de venda com filtros de busca, plataforma, loja, status e período. */
export function usePedidos(filters: OrderFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.platform) params.set("platform", filters.platform);
  if (filters.storeId) params.set("storeId", filters.storeId);
  if (filters.status) params.set("status", filters.status);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  const qs = params.toString();

  return useQuery({
    queryKey: ["pedidos", filters],
    queryFn: () =>
      apiFetch<{ orders: OrderRow[]; total: number }>(`/api/pedidos${qs ? `?${qs}` : ""}`),
  });
}
