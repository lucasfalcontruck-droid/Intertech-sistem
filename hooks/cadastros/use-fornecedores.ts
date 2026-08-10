"use client";

/**
 * hooks/cadastros/use-fornecedores.ts — Área Cadastros: hooks TanStack Query
 * para listar, criar, editar e excluir fornecedores via /api/cadastros/fornecedores.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FornecedorTipo } from "@prisma/client";
import { apiFetch } from "@/lib/api";

export interface Fornecedor {
  id: string;
  name: string;
  tipo: FornecedorTipo;
  contact: string;
  leadTimeDays: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FornecedorFormInput {
  name: string;
  tipo: FornecedorTipo;
  contact: string;
  leadTimeDays: number;
  active: boolean;
}

/** Lista todos os fornecedores cadastrados. */
export function useFornecedores() {
  return useQuery({
    queryKey: ["fornecedores"],
    queryFn: () => apiFetch<{ fornecedores: Fornecedor[] }>("/api/cadastros/fornecedores"),
  });
}

/** Invalida o cache de fornecedores para refletir criações/edições/exclusões. */
function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["fornecedores"] });
}

/** Cria um novo fornecedor. */
export function useCreateFornecedor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: FornecedorFormInput) =>
      apiFetch<{ fornecedor: Fornecedor }>("/api/cadastros/fornecedores", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => invalidate(queryClient),
  });
}

/** Atualiza um fornecedor existente. */
export function useUpdateFornecedor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: FornecedorFormInput & { id: string }) =>
      apiFetch<{ fornecedor: Fornecedor }>(`/api/cadastros/fornecedores/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    onSuccess: () => invalidate(queryClient),
  });
}

/** Exclui um fornecedor. */
export function useDeleteFornecedor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/cadastros/fornecedores/${id}`, { method: "DELETE" }),
    onSuccess: () => invalidate(queryClient),
  });
}
