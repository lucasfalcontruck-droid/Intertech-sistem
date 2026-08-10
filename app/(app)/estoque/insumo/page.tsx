"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state";
import { IconBox, IconPlus } from "@/components/ui/icons";
import { InsumoForm } from "@/components/estoque/insumo-form";
import { InsumoMovimentoForm } from "@/components/estoque/insumo-movimento-form";
import {
  useInsumos,
  useInsumoMovimentos,
  useCreateInsumo,
  useCreateInsumoMovimento,
} from "@/hooks/estoque/use-insumos";
import type { InsumoFormInput, InsumoMovimentoFormInput } from "@/hooks/estoque/use-insumos";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/utils";

/** app/(app)/estoque/insumo/page.tsx — Lista de insumos, movimentações e CRUD. */
export default function EstoqueInsumoPage() {
  const insumosQuery = useInsumos();
  const movimentosQuery = useInsumoMovimentos();
  const createInsumoMutation = useCreateInsumo();
  const createMovimentoMutation = useCreateInsumoMovimento();

  const [insumoModalOpen, setInsumoModalOpen] = useState(false);
  const [movimentoModalOpen, setMovimentoModalOpen] = useState(false);

  function handleCreateInsumo(input: InsumoFormInput) {
    createInsumoMutation.mutate(input, { onSuccess: () => setInsumoModalOpen(false) });
  }

  function handleCreateMovimento(input: InsumoMovimentoFormInput) {
    createMovimentoMutation.mutate(input, { onSuccess: () => setMovimentoModalOpen(false) });
  }

  const insumos = insumosQuery.data?.insumos ?? [];
  const totalValue = insumos.reduce((s, i) => s + i.currentStock * i.unitCost, 0);
  const lowStockCount = insumos.filter((i) => i.currentStock <= i.minStock).length;

  return (
    <div>
      <PageHeader
        title="Estoque de insumo"
        subtitle="Controle de entrada e saída de insumos por nota"
        action={
          <div className="flex gap-2.5">
            <Button variant="secondary" onClick={() => setInsumoModalOpen(true)}>
              <IconPlus className="h-3.5 w-3.5" />
              Novo insumo
            </Button>
            <Button variant="primary" onClick={() => setMovimentoModalOpen(true)}>
              <IconPlus className="h-3.5 w-3.5" />
              Nova movimentação
            </Button>
          </div>
        }
      />

      {insumosQuery.isLoading && <LoadingState label="Carregando insumos..." />}
      {insumosQuery.isError && (
        <ErrorState message={insumosQuery.error?.message ?? "Erro ao carregar insumos."} />
      )}

      {insumosQuery.data && (
        <>
          <div className="mb-5 grid grid-cols-3 gap-4">
            <KpiCard
              icon={<IconBox className="h-[19px] w-[19px]" />}
              value={formatNumber(insumos.length)}
              label="Insumos cadastrados"
            />
            <KpiCard
              icon={<IconBox className="h-[19px] w-[19px]" />}
              value={formatCurrency(totalValue)}
              label="Valor total em insumos"
            />
            <KpiCard
              icon={<IconBox className="h-[19px] w-[19px]" />}
              value={formatNumber(lowStockCount)}
              label="Insumos com estoque baixo"
            />
          </div>

          <Card className="mb-4 p-0">
            {insumos.length === 0 ? (
              <EmptyState message="Nenhum insumo cadastrado ainda." />
            ) : (
              <div className="overflow-x-auto p-5">
                <CardHeader title="Insumos cadastrados" />
                <table className="w-full min-w-[620px] border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      {["Insumo", "Estoque atual", "Mínimo", "Custo unitário", "Valor total"].map((h) => (
                        <th
                          key={h}
                          className="px-3 pb-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-muted"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {insumos.map((i) => (
                      <tr key={i.id} className="border-b border-white/4 last:border-none">
                        <td className="px-3 py-3.5 text-sm font-semibold text-ink">{i.name}</td>
                        <td className="px-3 py-3.5 text-sm">
                          {i.currentStock} {i.unit}
                        </td>
                        <td className="px-3 py-3.5 text-sm text-ink-secondary">
                          {i.minStock} {i.unit}
                        </td>
                        <td className="px-3 py-3.5 text-sm text-ink-secondary">
                          {formatCurrency(i.unitCost)}
                        </td>
                        <td className="px-3 py-3.5 text-sm">
                          {formatCurrency(i.currentStock * i.unitCost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {movimentosQuery.isLoading && <LoadingState label="Carregando movimentações..." />}
      {movimentosQuery.isError && (
        <ErrorState message={movimentosQuery.error?.message ?? "Erro ao carregar movimentações."} />
      )}

      {movimentosQuery.data && (
        <Card className="p-0">
          <div className="p-5 pb-0">
            <CardHeader title="Movimentações" subtitle="Entradas e saídas por nota fiscal" />
          </div>
          {movimentosQuery.data.movimentos.length === 0 ? (
            <EmptyState message="Nenhuma movimentação registrada ainda." />
          ) : (
            <div className="overflow-x-auto p-5">
              <table className="w-full min-w-[820px] border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    {["Data", "Nota fiscal", "Insumo", "Tipo", "Quantidade", "Origem / Destino", "Valor"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-3 pb-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-muted"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {movimentosQuery.data.movimentos.map((m) => (
                    <tr key={m.id} className="border-b border-white/4 last:border-none hover:bg-white/2">
                      <td className="px-3 py-3.5 text-sm text-ink-secondary">
                        {formatDateTime(m.date)}
                      </td>
                      <td className="px-3 py-3.5 text-sm">{m.notaFiscal}</td>
                      <td className="px-3 py-3.5 text-sm font-semibold text-ink">{m.insumo.name}</td>
                      <td className="px-3 py-3.5">
                        <Badge variant={m.tipo === "ENTRADA" ? "ok" : "out"}>
                          {m.tipo === "ENTRADA" ? "Entrada" : "Saída"}
                        </Badge>
                      </td>
                      <td className="px-3 py-3.5 text-sm">{formatNumber(m.quantity)}</td>
                      <td className="px-3 py-3.5 text-sm text-ink-secondary">{m.party}</td>
                      <td className="px-3 py-3.5 text-sm">{formatCurrency(m.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      <Modal open={insumoModalOpen} onClose={() => setInsumoModalOpen(false)} title="Novo insumo">
        <InsumoForm
          onSubmit={handleCreateInsumo}
          onCancel={() => setInsumoModalOpen(false)}
          submitting={createInsumoMutation.isPending}
          errorMessage={createInsumoMutation.error?.message}
        />
      </Modal>

      <Modal
        open={movimentoModalOpen}
        onClose={() => setMovimentoModalOpen(false)}
        title="Nova movimentação"
      >
        <InsumoMovimentoForm
          onSubmit={handleCreateMovimento}
          onCancel={() => setMovimentoModalOpen(false)}
          submitting={createMovimentoMutation.isPending}
          errorMessage={createMovimentoMutation.error?.message}
        />
      </Modal>
    </div>
  );
}
