"use client";

/**
 * hooks/marketplace/use-mercadolivre.ts — Área Marketplace: hook do botão
 * "Testar conexão real", que chama a API do Mercado Livre ao vivo (não o
 * banco local) para confirmar que o token salvo realmente funciona.
 */
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface MercadoLivreTestResult {
  connected: boolean;
  user: { id: number; nickname: string; siteId: string };
  orderCount: number;
  recentOrders: { id: number; status: string; total: number; date: string }[];
}

/** Testa a conexão real com o Mercado Livre e retorna conta + pedidos recentes de verdade. */
export function useTestMercadoLivre() {
  return useMutation({
    mutationFn: () => apiFetch<MercadoLivreTestResult>("/api/marketplace/mercadolivre/test"),
  });
}
