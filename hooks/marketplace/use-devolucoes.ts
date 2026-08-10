"use client";

/**
 * hooks/marketplace/use-devolucoes.ts — Área Marketplace: hooks para listar
 * e fazer o CRUD de devoluções de venda.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Platform, DevolucaoStatus } from "@prisma/client";
import { apiFetch } from "@/lib/api";

export interface Devolucao {
  id: string;
  orderNumber: string | null;
  product: string;
  reason: string;
  platform: Platform;
  value: number;
  status: DevolucaoStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DevolucaoFormInput {
  orderNumber?: string;
  product: string;
  reason: string;
  platform: Platform;
  value: number;
  status: DevolucaoStatus;
}

/** Lista todas as devoluções registradas. */
export function useDevolucoes() {
  return useQuery({
    queryKey: ["devolucoes"],
    queryFn: () => apiFetch<{ devolucoes: Devolucao[] }>("/api/marketplace/devolucoes"),
  });
}

/** Invalida o cache de devoluções após uma mutação. */
function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["devolucoes"] });
}

/** Registra uma nova devolução. */
export function useCreateDevolucao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DevolucaoFormInput) =>
      apiFetch<{ devolucao: Devolucao }>("/api/marketplace/devolucoes", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => invalidate(queryClient),
  });
}

/** Atualiza uma devolução existente. */
export function useUpdateDevolucao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<DevolucaoFormInput> & { id: string }) =>
      apiFetch<{ devolucao: Devolucao }>(`/api/marketplace/devolucoes/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    onSuccess: () => invalidate(queryClient),
  });
}

/** Exclui uma devolução. */
export function useDeleteDevolucao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/marketplace/devolucoes/${id}`, { method: "DELETE" }),
    onSuccess: () => invalidate(queryClient),
  });
}
