"use client";

/**
 * hooks/financeiro/use-transactions.ts — Área Financeiro: hooks para listar
 * contas a pagar/receber, o resumo financeiro (KPIs/DRE) e seu CRUD.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TransactionStatus, TransactionType } from "@prisma/client";
import { apiFetch } from "@/lib/api";
import type { FinanceiroSummaryData, Transaction } from "@/lib/types";

export interface TransactionFormInput {
  type: TransactionType;
  description: string;
  category: string;
  amount: number;
  dueDate: string;
  status: TransactionStatus;
}

/** Lista lançamentos (ENTRADA/SAIDA) de um tipo — usado por contas a pagar/receber. */
export function useTransactionsList(type: TransactionType) {
  return useQuery({
    queryKey: ["transactions", type],
    queryFn: () => apiFetch<{ transactions: Transaction[] }>(`/api/financeiro/transactions?type=${type}`),
  });
}

/** Busca os KPIs financeiros, DRE e fluxo de caixa para a página Financeiro. */
export function useFinanceiroSummary() {
  return useQuery({
    queryKey: ["financeiro-summary"],
    queryFn: () => apiFetch<FinanceiroSummaryData>("/api/financeiro/summary"),
  });
}

/** Invalida resumo e lista de lançamentos após uma mutação. */
function invalidateFinanceiro(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["financeiro-summary"] });
  queryClient.invalidateQueries({ queryKey: ["transactions"] });
}

/** Cria um novo lançamento (conta a pagar/receber). */
export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TransactionFormInput) =>
      apiFetch<{ transaction: Transaction }>("/api/financeiro/transactions", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => invalidateFinanceiro(queryClient),
  });
}

/** Atualiza um lançamento existente. */
export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<TransactionFormInput> & { id: string }) =>
      apiFetch<{ transaction: Transaction }>(`/api/financeiro/transactions/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    onSuccess: () => invalidateFinanceiro(queryClient),
  });
}

/** Exclui um lançamento. */
export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/financeiro/transactions/${id}`, { method: "DELETE" }),
    onSuccess: () => invalidateFinanceiro(queryClient),
  });
}
