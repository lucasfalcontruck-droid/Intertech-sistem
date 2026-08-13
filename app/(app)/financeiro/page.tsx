"use client";

import { useState } from "react";
import { TransactionStatus, TransactionType } from "@prisma/client";
import {
  useCreateTransaction,
  useDeleteTransaction,
  useFinanceiroSummary,
  useUpdateTransaction,
} from "@/hooks/financeiro/use-transactions";
import { HeroMetric, KpiRow } from "@/components/ui/hero-metric";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { TransactionForm } from "@/components/financeiro/transaction-form";
import { TransactionTable } from "@/components/financeiro/transaction-table";
import { CashFlowChart } from "@/components/charts/cash-flow-chart";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { IconPlus, IconExport } from "@/components/ui/icons";
import { formatCurrency } from "@/lib/utils";
import type { TransactionFormInput } from "@/hooks/financeiro/use-transactions";

/** app/(app)/financeiro/page.tsx — Visão geral do Financeiro: KPIs, fluxo de caixa e lançamentos recentes. */
export default function FinanceiroPage() {
  const { data, isLoading, isError, error } = useFinanceiroSummary();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>(TransactionType.ENTRADA);

  function openCreate(type: TransactionType) {
    setModalType(type);
    createMutation.reset();
    setModalOpen(true);
  }

  function handleSubmit(input: TransactionFormInput) {
    createMutation.mutate(input, { onSuccess: () => setModalOpen(false) });
  }

  function handleMarkPaid(id: string) {
    updateMutation.mutate({ id, status: TransactionStatus.PAGO });
  }

  function handleDelete(id: string) {
    if (confirm("Excluir este lançamento financeiro?")) {
      deleteMutation.mutate(id);
    }
  }

  return (
    <div>
      <div className="mb-5 flex justify-end gap-2.5">
        <Button variant="secondary" onClick={() => openCreate(TransactionType.ENTRADA)}>
          <IconPlus className="h-3.5 w-3.5" />
          Nova transação
        </Button>
        <Button variant="primary">
          <IconExport className="h-3.5 w-3.5" />
          Exportar DRE
        </Button>
      </div>

      {isLoading && <LoadingState label="Carregando financeiro..." />}
      {isError && <ErrorState message={error?.message ?? "Erro ao carregar financeiro."} />}

      {data && (
        <>
          <HeroMetric label="Saldo em caixa" value={formatCurrency(data.kpis.cashBalance)} />
          <KpiRow
            items={[
              { label: "Receita do mês", value: formatCurrency(data.kpis.revenueMonth) },
              { label: "Despesas do mês", value: formatCurrency(data.kpis.expensesMonth) },
              {
                label: "Lucro líquido",
                value: formatCurrency(data.kpis.netProfit),
                valueClassName: data.kpis.netProfit < 0 ? "text-danger" : undefined,
              },
            ]}
          />

          <Card className="mb-4">
            <CardHeader title="Fluxo de caixa" subtitle="Entradas vs. saídas — últimos 6 meses" />
            <div className="h-[280px]">
              <CashFlowChart data={data.cashFlow} />
            </div>
          </Card>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <Card>
              <CardHeader
                title="Contas a receber"
                subtitle="Próximos vencimentos"
                action={
                  <button
                    onClick={() => openCreate(TransactionType.ENTRADA)}
                    className="text-[12px] font-semibold text-[#a68bff]"
                  >
                    + adicionar
                  </button>
                }
              />
              <TransactionTable
                transactions={data.receivables}
                descriptionHeader="Origem"
                onMarkPaid={handleMarkPaid}
                onDelete={handleDelete}
              />
            </Card>

            <Card>
              <CardHeader
                title="Contas a pagar"
                subtitle="Próximos vencimentos"
                action={
                  <button
                    onClick={() => openCreate(TransactionType.SAIDA)}
                    className="text-[12px] font-semibold text-[#a68bff]"
                  >
                    + adicionar
                  </button>
                }
              />
              <TransactionTable
                transactions={data.payables}
                descriptionHeader="Descrição"
                onMarkPaid={handleMarkPaid}
                onDelete={handleDelete}
              />
            </Card>
          </div>

          <Card>
            <CardHeader title="DRE simplificado" subtitle="Últimos 30 dias" />
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border-b border-white/4">
                  <td className="py-3 text-sm">Receita bruta de vendas</td>
                  <td className="py-3 text-right text-sm font-bold">
                    {formatCurrency(data.dre.grossRevenue)}
                  </td>
                </tr>
                {data.dre.deductions.map((d) => (
                  <tr key={d.category} className="border-b border-white/4">
                    <td className="py-3 text-sm text-ink-secondary">(-) {d.category}</td>
                    <td className="py-3 text-right text-sm text-ink-secondary">
                      - {formatCurrency(d.amount)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="py-3 text-sm font-extrabold text-white">Lucro líquido</td>
                  <td className="py-3 text-right text-sm font-extrabold text-success">
                    {formatCurrency(data.dre.netProfit)}
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nova transação">
        <TransactionForm
          defaultType={modalType}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={createMutation.isPending}
          errorMessage={createMutation.error?.message}
        />
      </Modal>
    </div>
  );
}
