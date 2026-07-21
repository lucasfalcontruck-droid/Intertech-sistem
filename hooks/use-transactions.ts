"use client";

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

export function useFinanceiroSummary() {
  return useQuery({
    queryKey: ["financeiro-summary"],
    queryFn: () => apiFetch<FinanceiroSummaryData>("/api/financeiro/summary"),
  });
}

function invalidateFinanceiro(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["financeiro-summary"] });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TransactionFormInput) =>
      apiFetch<{ transaction: Transaction }>("/api/transactions", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => invalidateFinanceiro(queryClient),
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<TransactionFormInput> & { id: string }) =>
      apiFetch<{ transaction: Transaction }>(`/api/transactions/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    onSuccess: () => invalidateFinanceiro(queryClient),
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/transactions/${id}`, { method: "DELETE" }),
    onSuccess: () => invalidateFinanceiro(queryClient),
  });
}
