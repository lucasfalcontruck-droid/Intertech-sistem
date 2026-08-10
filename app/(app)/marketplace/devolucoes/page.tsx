"use client";

import { useState } from "react";
import { DevolucaoStatus } from "@prisma/client";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PlatformChip } from "@/components/ui/platform-chip";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state";
import { IconPlus, IconTrash, IconRefresh } from "@/components/ui/icons";
import { DevolucaoForm } from "@/components/marketplace/devolucao-form";
import {
  useDevolucoes,
  useCreateDevolucao,
  useUpdateDevolucao,
  useDeleteDevolucao,
} from "@/hooks/marketplace/use-devolucoes";
import type { DevolucaoFormInput } from "@/hooks/marketplace/use-devolucoes";
import { formatCurrency, formatDate } from "@/lib/utils";

/** app/(app)/marketplace/devolucoes/page.tsx — Lista e CRUD de devoluções de venda. */
const STATUS_LABEL: Record<DevolucaoStatus, string> = {
  SOLICITADA: "Solicitada",
  EM_ANALISE: "Em análise",
  APROVADA: "Aprovada",
  REEMBOLSADA: "Reembolsada",
};
const STATUS_VARIANT: Record<DevolucaoStatus, "pending" | "low" | "ok" | "paid"> = {
  SOLICITADA: "pending",
  EM_ANALISE: "low",
  APROVADA: "ok",
  REEMBOLSADA: "paid",
};
const NEXT_STATUS: Record<DevolucaoStatus, DevolucaoStatus | null> = {
  SOLICITADA: DevolucaoStatus.EM_ANALISE,
  EM_ANALISE: DevolucaoStatus.APROVADA,
  APROVADA: DevolucaoStatus.REEMBOLSADA,
  REEMBOLSADA: null,
};

export default function DevolucoesPage() {
  const { data, isLoading, isError, error } = useDevolucoes();
  const createMutation = useCreateDevolucao();
  const updateMutation = useUpdateDevolucao();
  const deleteMutation = useDeleteDevolucao();
  const [modalOpen, setModalOpen] = useState(false);

  function handleSubmit(input: DevolucaoFormInput) {
    createMutation.mutate(input, { onSuccess: () => setModalOpen(false) });
  }

  function handleAdvance(id: string, status: DevolucaoStatus) {
    const next = NEXT_STATUS[status];
    if (next) updateMutation.mutate({ id, status: next });
  }

  function handleDelete(id: string) {
    if (confirm("Excluir esta devolução?")) deleteMutation.mutate(id);
  }

  const devolucoes = data?.devolucoes ?? [];

  return (
    <div>
      <PageHeader
        title="Devoluções"
        subtitle="Devoluções recebidas nas plataformas conectadas"
        action={
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <IconPlus className="h-3.5 w-3.5" />
            Nova devolução
          </Button>
        }
      />

      {isLoading && <LoadingState label="Carregando devoluções..." />}
      {isError && <ErrorState message={error?.message ?? "Erro ao carregar devoluções."} />}

      {data && (
        <Card className="p-0">
          {devolucoes.length === 0 ? (
            <EmptyState message="Nenhuma devolução registrada ainda." />
          ) : (
            <div className="overflow-x-auto p-5">
              <table className="w-full min-w-[820px] border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    {["Produto", "Motivo", "Plataforma", "Valor", "Status", "Data", ""].map((h) => (
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
                  {devolucoes.map((r) => (
                    <tr key={r.id} className="border-b border-white/4 last:border-none hover:bg-white/2">
                      <td className="px-3 py-3.5 text-sm font-semibold text-ink">{r.product}</td>
                      <td className="px-3 py-3.5 text-sm text-ink-secondary">{r.reason}</td>
                      <td className="px-3 py-3.5">
                        <PlatformChip platform={r.platform} short />
                      </td>
                      <td className="px-3 py-3.5 text-sm">{formatCurrency(r.value)}</td>
                      <td className="px-3 py-3.5">
                        <Badge variant={STATUS_VARIANT[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                      </td>
                      <td className="px-3 py-3.5 text-sm text-ink-secondary">
                        {formatDate(r.createdAt)}
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex justify-end gap-1.5">
                          {NEXT_STATUS[r.status] && (
                            <button
                              onClick={() => handleAdvance(r.id, r.status)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-ink-secondary hover:bg-success/10 hover:text-success"
                              aria-label="Avançar status"
                              title={`Avançar para ${STATUS_LABEL[NEXT_STATUS[r.status]!]}`}
                            >
                              <IconRefresh className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-ink-secondary hover:bg-danger/10 hover:text-danger"
                            aria-label="Excluir"
                          >
                            <IconTrash className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nova devolução">
        <DevolucaoForm
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={createMutation.isPending}
          errorMessage={createMutation.error?.message}
        />
      </Modal>
    </div>
  );
}
