"use client";

/**
 * hooks/marketplace/use-marketplace.ts — Área Marketplace: hook que busca
 * os cards de integração/gráficos, e o hook que dispara a sincronização
 * (botão "Sincronizar" de cada card, ver lib/marketplace/index.ts).
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Platform } from "@prisma/client";
import { apiFetch } from "@/lib/api";
import type { MarketplaceData } from "@/lib/types";

export interface StoreInput {
  platform: Platform;
  storeName: string;
  feePercentage: number;
}

/** Busca os cards de integração (uma por loja conectada) e a evolução de vendas por canal. */
export function useMarketplace() {
  return useQuery({
    queryKey: ["marketplace"],
    queryFn: () => apiFetch<MarketplaceData>("/api/marketplace"),
  });
}

/** Dispara a sincronização (real ou mock, conforme a plataforma) de uma loja específica. */
export function useSyncMarketplace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (storeId: string) =>
      apiFetch("/api/marketplace/sync", {
        method: "POST",
        body: JSON.stringify({ storeId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace"] });
    },
  });
}

/** Adiciona uma loja manualmente (Shopee, TikTok Shop ou Vendedor de Rua). */
export function useAddStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StoreInput) =>
      apiFetch("/api/marketplace/stores", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace"] });
    },
  });
}

/** Remove uma loja conectada. */
export function useDeleteStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (storeId: string) =>
      apiFetch(`/api/marketplace/stores?id=${encodeURIComponent(storeId)}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace"] });
    },
  });
}
