"use client";

/** hooks/dashboard/use-dashboard.ts — Área Dashboard: hook que busca os KPIs e gráficos da visão geral. */
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { DashboardData } from "@/lib/types";

/** Busca os dados exibidos na página inicial do Dashboard, opcionalmente filtrados por loja. */
export function useDashboard(storeId?: string) {
  return useQuery({
    queryKey: ["dashboard", storeId ?? "all"],
    queryFn: () =>
      apiFetch<DashboardData>(`/api/dashboard${storeId ? `?storeId=${encodeURIComponent(storeId)}` : ""}`),
  });
}
