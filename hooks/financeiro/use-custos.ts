"use client";

/**
 * hooks/financeiro/use-custos.ts — Área Financeiro: hooks para listar e
 * fazer o CRUD de custos fixos/variáveis via /api/financeiro/custos.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CustoTipo } from "@prisma/client";
import { apiFetch } from "@/lib/api";

export interface CustoItem {
  id: string;
  name: string;
  tipo: CustoTipo;
  value: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustoFormInput {
  name: string;
  tipo: CustoTipo;
  value: number;
}

/** Lista todos os custos cadastrados. */
export function useCustos() {
  return useQuery({
    queryKey: ["custos"],
    queryFn: () => apiFetch<{ custos: CustoItem[] }>("/api/financeiro/custos"),
  });
}

/** Invalida o cache de custos após uma mutação. */
function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["custos"] });
}

/** Cria um novo custo. */
export function useCreateCusto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CustoFormInput) =>
      apiFetch<{ custo: CustoItem }>("/api/financeiro/custos", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => invalidate(queryClient),
  });
}

/** Atualiza um custo existente. */
export function useUpdateCusto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<CustoFormInput> & { id: string }) =>
      apiFetch<{ custo: CustoItem }>(`/api/financeiro/custos/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    onSuccess: () => invalidate(queryClient),
  });
}

/** Exclui um custo. */
export function useDeleteCusto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/financeiro/custos/${id}`, { method: "DELETE" }),
    onSuccess: () => invalidate(queryClient),
  });
}
