"use client";

/**
 * hooks/estoque/use-insumos.ts — Área Estoque: hooks para listar insumos
 * (matéria-prima) e suas movimentações, e para registrar novas entradas/saídas.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InsumoMovimentoTipo } from "@prisma/client";
import { apiFetch } from "@/lib/api";

export interface Insumo {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
  unitCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface InsumoFormInput {
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
  unitCost: number;
}

export interface InsumoMovimento {
  id: string;
  insumoId: string;
  insumo: { id: string; name: string };
  tipo: InsumoMovimentoTipo;
  quantity: number;
  notaFiscal: string;
  party: string;
  value: number;
  date: string;
}

export interface InsumoMovimentoFormInput {
  insumoId: string;
  tipo: InsumoMovimentoTipo;
  quantity: number;
  notaFiscal: string;
  party: string;
  value: number;
}

/** Lista todos os insumos cadastrados. */
export function useInsumos() {
  return useQuery({
    queryKey: ["insumos"],
    queryFn: () => apiFetch<{ insumos: Insumo[] }>("/api/estoque/insumos"),
  });
}

/** Lista o histórico de movimentações (entradas/saídas) de insumos. */
export function useInsumoMovimentos() {
  return useQuery({
    queryKey: ["insumo-movimentos"],
    queryFn: () => apiFetch<{ movimentos: InsumoMovimento[] }>("/api/estoque/insumos/movimentos"),
  });
}

/** Invalida insumos e movimentações após uma mutação. */
function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["insumos"] });
  queryClient.invalidateQueries({ queryKey: ["insumo-movimentos"] });
}

/** Cria um novo insumo. */
export function useCreateInsumo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: InsumoFormInput) =>
      apiFetch<{ insumo: Insumo }>("/api/estoque/insumos", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => invalidate(queryClient),
  });
}

/** Registra uma nova movimentação (entrada/saída) de insumo. */
export function useCreateInsumoMovimento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: InsumoMovimentoFormInput) =>
      apiFetch<{ movimento: InsumoMovimento }>("/api/estoque/insumos/movimentos", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => invalidate(queryClient),
  });
}
