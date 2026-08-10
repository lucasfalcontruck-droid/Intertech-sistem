"use client";

import { useState } from "react";
import { TransactionStatus, TransactionType } from "@prisma/client";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { IconTrendDown, IconAlertTriangle, IconPlus } from "@/components/ui/icons";
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

/** app/(app)/financeiro/contas-a-pagar/page.tsx — Lista e CRUD de contas a pagar (lançamentos SAIDA). */
export default function ContasAPagarPage() {
  const { data, isLoading, isError, error } = useTransactionsList(TransactionType.SAIDA);
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();
  const [modalOpen, setModalOpen] = useState(false);

  function handleSubmit(input: TransactionFormInput) {
    createMutation.mutate(
      { ...input, type: TransactionType.SAIDA },
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
  const totalMonth = transactions.reduce((s, t) => s + t.amount, 0);
  const overdue = transactions
    .filter((t) => t.status === TransactionStatus.PENDENTE && new Date(t.dueDate) < new Date())
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div>
      <PageHeader
        title="Contas a pagar"
        subtitle="Vencimentos e pagamentos da empresa"
        action={
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <IconPlus className="h-3.5 w-3.5" />
            Nova conta a pagar
          </Button>
        }
      />

      {isLoading && <LoadingState label="Carregando contas a pagar..." />}
      {isError && <ErrorState message={error?.message ?? "Erro ao carregar contas a pagar."} />}

      {data && (
        <>
          <div className="mb-5 grid grid-cols-2 gap-4">
            <KpiCard
              icon={<IconTrendDown className="h-[19px] w-[19px]" />}
              value={formatCurrency(totalMonth)}
              label="Total a pagar"
            />
            <KpiCard
              icon={<IconAlertTriangle className="h-[19px] w-[19px]" />}
              value={formatCurrency(overdue)}
              label="Contas atrasadas"
            />
          </div>

          <Card className="p-0">
            <div className="p-5">
              <TransactionTable
                transactions={transactions}
                descriptionHeader="Descrição"
                onMarkPaid={handleMarkPaid}
                onDelete={handleDelete}
              />
            </div>
          </Card>
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nova conta a pagar">
        <TransactionForm
          defaultType={TransactionType.SAIDA}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={createMutation.isPending}
          errorMessage={createMutation.error?.message}
        />
      </Modal>
    </div>
  );
}
