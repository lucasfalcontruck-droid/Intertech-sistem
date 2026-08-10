"use client";

/**
 * hooks/pedidos/use-pedidos-compra.ts — Área Pedidos: hooks para listar e
 * fazer o CRUD de pedidos de compra (a fornecedores, de insumo ou produto).
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FornecedorTipo, PedidoCompraStatus } from "@prisma/client";
import { apiFetch } from "@/lib/api";

export interface PedidoCompra {
  id: string;
  number: string;
  tipo: FornecedorTipo;
  fornecedorId: string;
  fornecedor: { id: string; name: string };
  itemName: string;
  quantity: number;
  value: number;
  status: PedidoCompraStatus;
  expectedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PedidoCompraFormInput {
  tipo: FornecedorTipo;
  fornecedorId: string;
  itemName: string;
  quantity: number;
  value: number;
  status: PedidoCompraStatus;
  expectedDate: string;
}

/** Lista pedidos de compra, opcionalmente filtrados por tipo (insumo/produto). */
export function usePedidosCompra(tipo?: FornecedorTipo) {
  const qs = tipo ? `?tipo=${tipo}` : "";
  return useQuery({
    queryKey: ["pedidos-compra", tipo],
    queryFn: () => apiFetch<{ pedidos: PedidoCompra[] }>(`/api/pedidos/compra${qs}`),
  });
}

/** Invalida o cache de pedidos de compra após uma mutação. */
function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["pedidos-compra"] });
}

/** Cria um novo pedido de compra. */
export function useCreatePedidoCompra() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PedidoCompraFormInput) =>
      apiFetch<{ pedido: PedidoCompra }>("/api/pedidos/compra", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => invalidate(queryClient),
  });
}

/** Atualiza um pedido de compra existente. */
export function useUpdatePedidoCompra() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<PedidoCompraFormInput> & { id: string }) =>
      apiFetch<{ pedido: PedidoCompra }>(`/api/pedidos/compra/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    onSuccess: () => invalidate(queryClient),
  });
}

/** Exclui um pedido de compra. */
export function useDeletePedidoCompra() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/pedidos/compra/${id}`, { method: "DELETE" }),
    onSuccess: () => invalidate(queryClient),
  });
}
