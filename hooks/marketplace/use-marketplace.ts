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

/** Busca os cards de integração e a evolução de vendas por canal. */
export function useMarketplace() {
  return useQuery({
    queryKey: ["marketplace"],
    queryFn: () => apiFetch<MarketplaceData>("/api/marketplace"),
  });
}

/** Dispara a sincronização (real ou mock, conforme a plataforma) de um canal. */
export function useSyncMarketplace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (platform: Platform) =>
      apiFetch("/api/marketplace/sync", {
        method: "POST",
        body: JSON.stringify({ platform }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace"] });
    },
  });
}
