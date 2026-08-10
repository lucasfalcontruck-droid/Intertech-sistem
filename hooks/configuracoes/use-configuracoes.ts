"use client";

/**
 * hooks/configuracoes/use-configuracoes.ts — Área Configurações: hook que
 * busca usuários do sistema e o status das integrações de marketplace.
 */
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface ConfiguracoesData {
  users: { id: string; name: string; email: string; role: string; createdAt: string }[];
  integrations: {
    platform: string;
    storeName: string;
    status: string;
    feePercentage: number;
    lastSyncedAt: string | null;
  }[];
}

/** Busca os dados exibidos na página de Configurações. */
export function useConfiguracoes() {
  return useQuery({
    queryKey: ["configuracoes"],
    queryFn: () => apiFetch<ConfiguracoesData>("/api/configuracoes"),
  });
}
