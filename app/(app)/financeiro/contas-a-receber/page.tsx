"use client";

import { useState } from "react";
import { TransactionStatus, TransactionType } from "@prisma/client";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { IconTrendUp, IconCash, IconPlus } from "@/components/ui/icons";
import { TransactionForm } from "@/components/financeiro/transaction-form";
import { TransactionTable } from "@/components/financeiro/transaction-table";
import {
  useTransactionsList,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from "@/hooks/financeiro/use-transactions";
import { formatCurrency } from "@/lib/utils";
import type { TransactionFormInput } from "@/hooks/financeiro/use-transactions";

/** app/(app)/financeiro/contas-a-receber/page.tsx — Lista e CRUD de contas a receber (lançamentos ENTRADA). */
export default function ContasAReceberPage() {
  const { data, isLoading, isError, error } = useTransactionsList(TransactionType.ENTRADA);
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();
  const [modalOpen, setModalOpen] = useState(false);

  function handleSubmit(input: TransactionFormInput) {
    createMutation.mutate(
      { ...input, type: TransactionType.ENTRADA },
      { onSuccess: () => setModalOpen(false) },
    );
  }

  function handleMarkPaid(id: string) {
    updateMutation.mutate({ id, status: TransactionStatus.PAGO });
  }

  function handleDelete(id: string) {
    if (confirm("Excluir este lançamento?")) deleteMutation.mutate(id);
  }

  const transactions = data?.transactions ?? [];
  const toReceive = transactions
    .filter((t) => t.status !== TransactionStatus.PAGO)
    .reduce((s, t) => s + t.amount, 0);
  const received = transactions
    .filter((t) => t.status === TransactionStatus.PAGO)
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div>
      <PageHeader
        title="Contas a receber"
        subtitle="Recebimentos previstos e realizados"
        action={
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <IconPlus className="h-3.5 w-3.5" />
            Nova conta a receber
          </Button>
        }
      />

      {isLoading && <LoadingState label="Carregando contas a receber..." />}
      {isError && <ErrorState message={error?.message ?? "Erro ao carregar contas a receber."} />}

      {data && (
        <>
          <div className="mb-5 grid grid-cols-2 gap-4">
            <KpiCard
              icon={<IconTrendUp className="h-[19px] w-[19px]" />}
              value={formatCurrency(toReceive)}
              label="Total a receber"
            />
            <KpiCard
              icon={<IconCash className="h-[19px] w-[19px]" />}
              value={formatCurrency(received)}
              label="Recebido"
            />
          </div>

          <Card className="p-0">
            <div className="p-5">
              <TransactionTable
                transactions={transactions}
                descriptionHeader="Origem"
                onMarkPaid={handleMarkPaid}
                onDelete={handleDelete}
              />
            </div>
          </Card>
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nova conta a receber">
        <TransactionForm
          defaultType={TransactionType.ENTRADA}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={createMutation.isPending}
          errorMessage={createMutation.error?.message}
        />
      </Modal>
    </div>
  );
}
