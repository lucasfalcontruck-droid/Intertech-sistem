"use client";

/**
 * hooks/configuracoes/use-configuracoes.ts — Área Configurações: hook que
 * busca usuários do sistema e o status das integrações de marketplace, e cria
 * novas contas de usuário (somente administrador).
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface ConfiguracoesUser {
  id: string;
  name: string;
  email: string;
  role: string;
  seller: string | null;
  createdAt: string;
}

export interface ConfiguracoesData {
  users: ConfiguracoesUser[];
  integrations: {
    id: string;
    platform: string;
    storeName: string;
    status: string;
    isReal: boolean;
    feePercentage: number;
    lastSyncedAt: string | null;
  }[];
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "VENDEDOR" | "Operador";
  seller: string | null;
}

/** Busca os dados exibidos na página de Configurações. */
export function useConfiguracoes() {
  return useQuery({
    queryKey: ["configuracoes"],
    queryFn: () => apiFetch<ConfiguracoesData>("/api/configuracoes"),
  });
}

/** Cria uma nova conta de usuário (reflete na fonte única e no app do vendedor). */
export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) =>
      apiFetch<{ user: ConfiguracoesUser }>("/api/configuracoes", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["configuracoes"] }),
  });
}
