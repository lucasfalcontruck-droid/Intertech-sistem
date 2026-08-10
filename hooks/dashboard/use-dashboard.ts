"use client";

/** hooks/dashboard/use-dashboard.ts — Área Dashboard: hook que busca os KPIs e gráficos da visão geral. */
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { DashboardData } from "@/lib/types";

/** Busca os dados exibidos na página inicial do Dashboard. */
export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => apiFetch<DashboardData>("/api/dashboard"),
  });
}
