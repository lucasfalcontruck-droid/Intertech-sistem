"use client";

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
  status?: string;
}

export function usePedidos(filters: OrderFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.platform) params.set("platform", filters.platform);
  if (filters.status) params.set("status", filters.status);
  const qs = params.toString();

  return useQuery({
    queryKey: ["pedidos", filters],
    queryFn: () =>
      apiFetch<{ orders: OrderRow[]; total: number }>(`/api/pedidos${qs ? `?${qs}` : ""}`),
  });
}
