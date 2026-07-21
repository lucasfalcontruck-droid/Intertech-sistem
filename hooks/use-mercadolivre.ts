"use client";

import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface MercadoLivreTestResult {
  connected: boolean;
  user: { id: number; nickname: string; siteId: string };
  orderCount: number;
  recentOrders: { id: number; status: string; total: number; date: string }[];
}

export function useTestMercadoLivre() {
  return useMutation({
    mutationFn: () => apiFetch<MercadoLivreTestResult>("/api/marketplace/mercadolivre/test"),
  });
}
