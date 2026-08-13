"use client";

/** hooks/marketplace/use-store-stats.ts — Estatísticas de hoje por loja (vendas brutas, unidades, ticket médio, visitas, conversão, cancelados). */
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface StoreDailyStats {
  storeId: string;
  storeName: string;
  platform: string;
  grossSales: number;
  salesCount: number;
  unitsSold: number;
  avgPricePerSale: number;
  avgPricePerUnit: number;
  cancelledCount: number;
  visits: number | null;
  conversion: number | null;
}

/** Estatísticas de hoje de todas as lojas conectadas. */
export function useAllStoresDailyStats() {
  return useQuery({
    queryKey: ["store-stats", "all"],
    queryFn: () => apiFetch<{ stats: StoreDailyStats[] }>("/api/marketplace/store-stats"),
  });
}

/** Estatísticas de hoje de uma loja específica. */
export function useStoreDailyStats(storeId?: string) {
  return useQuery({
    queryKey: ["store-stats", storeId],
    queryFn: () =>
      apiFetch<{ stats: StoreDailyStats }>(`/api/marketplace/store-stats?storeId=${storeId}`),
    enabled: Boolean(storeId),
  });
}
