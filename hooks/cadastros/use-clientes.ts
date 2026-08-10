"use client";

/**
 * hooks/cadastros/use-clientes.ts — Área Cadastros: hooks TanStack Query
 * para listar, criar, editar e excluir clientes via /api/cadastros/clientes.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface Cliente {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClienteFormInput {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
}

/** Lista todos os clientes cadastrados. */
export function useClientes() {
  return useQuery({
    queryKey: ["clientes"],
    queryFn: () => apiFetch<{ clientes: Cliente[] }>("/api/cadastros/clientes"),
  });
}

/** Invalida o cache de clientes para refletir criações/edições/exclusões. */
function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["clientes"] });
}

/** Cria um novo cliente. */
export function useCreateCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ClienteFormInput) =>
      apiFetch<{ cliente: Cliente }>("/api/cadastros/clientes", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => invalidate(queryClient),
  });
}

/** Atualiza um cliente existente. */
export function useUpdateCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: ClienteFormInput & { id: string }) =>
      apiFetch<{ cliente: Cliente }>(`/api/cadastros/clientes/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    onSuccess: () => invalidate(queryClient),
  });
}

/** Exclui um cliente. */
export function useDeleteCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/cadastros/clientes/${id}`, { method: "DELETE" }),
    onSuccess: () => invalidate(queryClient),
  });
}
