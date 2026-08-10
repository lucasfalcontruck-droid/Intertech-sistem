"use client";

/**
 * hooks/marketplace/use-campanhas.ts — Área Marketplace: hooks para listar
 * e fazer o CRUD de campanhas de anúncio por plataforma.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Platform, CampanhaStatus } from "@prisma/client";
import { apiFetch } from "@/lib/api";

export interface Campanha {
  id: string;
  name: string;
  platform: Platform;
  dailyBudget: number;
  spent: number;
  clicks: number;
  conversions: number;
  status: CampanhaStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CampanhaFormInput {
  name: string;
  platform: Platform;
  dailyBudget: number;
  spent: number;
  clicks: number;
  conversions: number;
  status: CampanhaStatus;
}

/** Lista todas as campanhas cadastradas. */
export function useCampanhas() {
  return useQuery({
    queryKey: ["campanhas"],
    queryFn: () => apiFetch<{ campanhas: Campanha[] }>("/api/marketplace/campanhas"),
  });
}

/** Invalida o cache de campanhas após uma mutação. */
function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["campanhas"] });
}

/** Cria uma nova campanha. */
export function useCreateCampanha() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CampanhaFormInput) =>
      apiFetch<{ campanha: Campanha }>("/api/marketplace/campanhas", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => invalidate(queryClient),
  });
}

/** Atualiza uma campanha existente. */
export function useUpdateCampanha() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<CampanhaFormInput> & { id: string }) =>
      apiFetch<{ campanha: Campanha }>(`/api/marketplace/campanhas/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    onSuccess: () => invalidate(queryClient),
  });
}

/** Exclui uma campanha. */
export function useDeleteCampanha() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/marketplace/campanhas/${id}`, { method: "DELETE" }),
    onSuccess: () => invalidate(queryClient),
  });
}
