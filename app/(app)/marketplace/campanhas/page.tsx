"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PlatformChip } from "@/components/ui/platform-chip";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state";
import { IconPlus, IconTrash } from "@/components/ui/icons";
import { CampanhaForm } from "@/components/marketplace/campanha-form";
import {
  useCampanhas,
  useCreateCampanha,
  useDeleteCampanha,
} from "@/hooks/marketplace/use-campanhas";
import type { CampanhaFormInput } from "@/hooks/marketplace/use-campanhas";
import { formatCurrency, formatNumber } from "@/lib/utils";

/** app/(app)/marketplace/campanhas/page.tsx — Lista e CRUD de campanhas de anúncio. */
const STATUS_LABEL: Record<string, string> = {
  ATIVA: "Performando",
  PAUSADA: "Pausada",
  ENCERRADA: "Encerrada",
};
const STATUS_VARIANT: Record<string, "ok" | "pending" | "out"> = {
  ATIVA: "ok",
  PAUSADA: "pending",
  ENCERRADA: "out",
};

export default function CampanhasPage() {
  const { data, isLoading, isError, error } = useCampanhas();
  const createMutation = useCreateCampanha();
  const deleteMutation = useDeleteCampanha();
  const [modalOpen, setModalOpen] = useState(false);

  function handleSubmit(input: CampanhaFormInput) {
    createMutation.mutate(input, { onSuccess: () => setModalOpen(false) });
  }

  function handleDelete(id: string) {
    if (confirm("Excluir esta campanha?")) deleteMutation.mutate(id);
  }

  const campanhas = data?.campanhas ?? [];

  return (
    <div>
      <PageHeader
        title="Campanhas"
        subtitle="Criar e gerenciar campanhas de anúncios direto pelo sistema"
        action={
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <IconPlus className="h-3.5 w-3.5" />
            Nova campanha
          </Button>
        }
      />

      {isLoading && <LoadingState label="Carregando campanhas..." />}
      {isError && <ErrorState message={error?.message ?? "Erro ao carregar campanhas."} />}

      {data && (
        <Card className="p-0">
          {campanhas.length === 0 ? (
            <EmptyState message="Nenhuma campanha criada ainda." />
          ) : (
            <div className="overflow-x-auto p-5">
              <table className="w-full min-w-[860px] border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    {[
                      "Campanha",
                      "Plataforma",
                      "Orçamento/dia",
                      "Gasto",
                      "Cliques",
                      "Conversões",
                      "Status",
                      "",
                    ].map((h) => (
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
                  {campanhas.map((c) => (
                    <tr key={c.id} className="border-b border-white/4 last:border-none hover:bg-white/2">
                      <td className="px-3 py-3.5 text-sm font-semibold text-ink">{c.name}</td>
                      <td className="px-3 py-3.5">
                        <PlatformChip platform={c.platform} short />
                      </td>
                      <td className="px-3 py-3.5 text-sm text-ink-secondary">
                        {formatCurrency(c.dailyBudget)}
                      </td>
                      <td className="px-3 py-3.5 text-sm">{formatCurrency(c.spent)}</td>
                      <td className="px-3 py-3.5 text-sm text-ink-secondary">
                        {formatNumber(c.clicks)}
                      </td>
                      <td className="px-3 py-3.5 text-sm text-ink-secondary">
                        {formatNumber(c.conversions)}
                      </td>
                      <td className="px-3 py-3.5">
                        <Badge variant={STATUS_VARIANT[c.status]}>{STATUS_LABEL[c.status]}</Badge>
                      </td>
                      <td className="px-3 py-3.5">
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-ink-secondary hover:bg-danger/10 hover:text-danger"
                          aria-label="Excluir"
                        >
                          <IconTrash className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nova campanha">
        <CampanhaForm
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={createMutation.isPending}
          errorMessage={createMutation.error?.message}
        />
      </Modal>
    </div>
  );
}
