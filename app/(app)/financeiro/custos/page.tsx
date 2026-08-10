"use client";

import { useState } from "react";
import { CustoTipo } from "@prisma/client";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state";
import { IconCash, IconTrendDown, IconPlus, IconTrash } from "@/components/ui/icons";
import { CustoForm } from "@/components/financeiro/custo-form";
import { useCustos, useCreateCusto, useDeleteCusto } from "@/hooks/financeiro/use-custos";
import type { CustoFormInput } from "@/hooks/financeiro/use-custos";
import { formatCurrency } from "@/lib/utils";

/** app/(app)/financeiro/custos/page.tsx — Lista e CRUD de custos fixos/variáveis. */
export default function CustosPage() {
  const { data, isLoading, isError, error } = useCustos();
  const createMutation = useCreateCusto();
  const deleteMutation = useDeleteCusto();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTipo, setModalTipo] = useState<CustoTipo>(CustoTipo.FIXO);

  function openCreate(tipo: CustoTipo) {
    setModalTipo(tipo);
    createMutation.reset();
    setModalOpen(true);
  }

  function handleSubmit(input: CustoFormInput) {
    createMutation.mutate(input, { onSuccess: () => setModalOpen(false) });
  }

  function handleDelete(id: string) {
    if (confirm("Excluir este custo?")) deleteMutation.mutate(id);
  }

  const custos = data?.custos ?? [];
  const fixos = custos.filter((c) => c.tipo === CustoTipo.FIXO);
  const variaveis = custos.filter((c) => c.tipo === CustoTipo.VARIAVEL);
  const totalFixed = fixos.reduce((s, c) => s + c.value, 0);
  const totalVariable = variaveis.reduce((s, c) => s + c.value, 0);

  return (
    <div>
      <PageHeader
        title="Custos fixos e variáveis"
        subtitle="Composição dos custos fixos e variáveis da empresa"
      />

      {isLoading && <LoadingState label="Carregando custos..." />}
      {isError && <ErrorState message={error?.message ?? "Erro ao carregar custos."} />}

      {data && (
        <>
          <div className="mb-5 grid grid-cols-2 gap-4">
            <KpiCard
              icon={<IconCash className="h-[19px] w-[19px]" />}
              value={formatCurrency(totalFixed)}
              label="Custos fixos no mês"
            />
            <KpiCard
              icon={<IconTrendDown className="h-[19px] w-[19px]" />}
              value={formatCurrency(totalVariable)}
              label="Custos variáveis no mês"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader
                title="Custos fixos"
                subtitle="Não variam com o volume de vendas"
                action={
                  <Button variant="secondary" onClick={() => openCreate(CustoTipo.FIXO)}>
                    <IconPlus className="h-3.5 w-3.5" />
                    Adicionar
                  </Button>
                }
              />
              {fixos.length === 0 ? (
                <EmptyState message="Nenhum custo fixo cadastrado." />
              ) : (
                <table className="w-full border-collapse">
                  <tbody>
                    {fixos.map((c) => (
                      <tr key={c.id} className="border-b border-white/4 last:border-none">
                        <td className="py-3 text-sm text-ink-secondary">{c.name}</td>
                        <td className="py-3 text-right text-sm font-semibold text-ink">
                          {formatCurrency(c.value)}
                        </td>
                        <td className="w-8 py-3 text-right">
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="text-ink-muted hover:text-danger"
                            aria-label="Excluir"
                          >
                            <IconTrash className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td className="py-3 text-sm font-extrabold text-white">Total</td>
                      <td className="py-3 text-right text-sm font-extrabold text-white">
                        {formatCurrency(totalFixed)}
                      </td>
                      <td />
                    </tr>
                  </tbody>
                </table>
              )}
            </Card>

            <Card>
              <CardHeader
                title="Custos variáveis"
                subtitle="Escalam com o volume de vendas"
                action={
                  <Button variant="secondary" onClick={() => openCreate(CustoTipo.VARIAVEL)}>
                    <IconPlus className="h-3.5 w-3.5" />
                    Adicionar
                  </Button>
                }
              />
              {variaveis.length === 0 ? (
                <EmptyState message="Nenhum custo variável cadastrado." />
              ) : (
                <table className="w-full border-collapse">
                  <tbody>
                    {variaveis.map((c) => (
                      <tr key={c.id} className="border-b border-white/4 last:border-none">
                        <td className="py-3 text-sm text-ink-secondary">{c.name}</td>
                        <td className="py-3 text-right text-sm font-semibold text-ink">
                          {formatCurrency(c.value)}
                        </td>
                        <td className="w-8 py-3 text-right">
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="text-ink-muted hover:text-danger"
                            aria-label="Excluir"
                          >
                            <IconTrash className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td className="py-3 text-sm font-extrabold text-white">Total</td>
                      <td className="py-3 text-right text-sm font-extrabold text-white">
                        {formatCurrency(totalVariable)}
                      </td>
                      <td />
                    </tr>
                  </tbody>
                </table>
              )}
            </Card>
          </div>
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo custo">
        <CustoForm
          defaultTipo={modalTipo}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={createMutation.isPending}
          errorMessage={createMutation.error?.message}
        />
      </Modal>
    </div>
  );
}
