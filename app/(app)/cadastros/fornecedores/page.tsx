"use client";

import { useState } from "react";
import { FornecedorTipo } from "@prisma/client";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state";
import { IconPlus, IconPencil, IconTrash } from "@/components/ui/icons";
import { FornecedorForm } from "@/components/cadastros/fornecedor-form";
import {
  useFornecedores,
  useCreateFornecedor,
  useUpdateFornecedor,
  useDeleteFornecedor,
} from "@/hooks/cadastros/use-fornecedores";
import type { Fornecedor, FornecedorFormInput } from "@/hooks/cadastros/use-fornecedores";

/** app/(app)/cadastros/fornecedores/page.tsx — Lista e CRUD de fornecedores. */
const TIPO_LABEL: Record<FornecedorTipo, string> = { INSUMO: "Insumo", PRODUTO: "Produto" };

export default function CadastroFornecedoresPage() {
  const { data, isLoading, isError, error } = useFornecedores();
  const createMutation = useCreateFornecedor();
  const updateMutation = useUpdateFornecedor();
  const deleteMutation = useDeleteFornecedor();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Fornecedor | null>(null);

  const activeMutation = editing ? updateMutation : createMutation;

  function openCreate() {
    setEditing(null);
    createMutation.reset();
    setModalOpen(true);
  }

  function openEdit(fornecedor: Fornecedor) {
    setEditing(fornecedor);
    updateMutation.reset();
    setModalOpen(true);
  }

  function handleSubmit(input: FornecedorFormInput) {
    if (editing) {
      updateMutation.mutate({ id: editing.id, ...input }, { onSuccess: () => setModalOpen(false) });
    } else {
      createMutation.mutate(input, { onSuccess: () => setModalOpen(false) });
    }
  }

  function handleDelete(fornecedor: Fornecedor) {
    if (confirm(`Excluir o fornecedor "${fornecedor.name}"? Esta ação não pode ser desfeita.`)) {
      deleteMutation.mutate(fornecedor.id, {
        onError: (err) => alert(err.message),
      });
    }
  }

  return (
    <div>
      <PageHeader
        title="Cadastro de fornecedores"
        subtitle="Fornecedores da empresa"
        action={
          <Button variant="primary" onClick={openCreate}>
            <IconPlus className="h-3.5 w-3.5" />
            Novo fornecedor
          </Button>
        }
      />

      {isLoading && <LoadingState label="Carregando fornecedores..." />}
      {isError && <ErrorState message={error?.message ?? "Erro ao carregar fornecedores."} />}

      {data && (
        <Card className="p-0">
          {data.fornecedores.length === 0 ? (
            <EmptyState message="Nenhum fornecedor cadastrado ainda." />
          ) : (
            <div className="overflow-x-auto p-5">
              <table className="w-full min-w-[820px] border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    {["Fornecedor", "Fornece", "Contato", "Prazo médio", "Status", ""].map((h) => (
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
                  {data.fornecedores.map((f) => (
                    <tr key={f.id} className="border-b border-white/4 last:border-none hover:bg-white/2">
                      <td className="px-3 py-3.5 text-sm font-semibold text-ink">{f.name}</td>
                      <td className="px-3 py-3.5 text-sm text-ink-secondary">{TIPO_LABEL[f.tipo]}</td>
                      <td className="px-3 py-3.5 text-sm text-ink-secondary">{f.contact}</td>
                      <td className="px-3 py-3.5 text-sm text-ink-secondary">{f.leadTimeDays} dias</td>
                      <td className="px-3 py-3.5">
                        <Badge variant={f.active ? "ok" : "low"}>{f.active ? "Ativo" : "Inativo"}</Badge>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(f)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-ink-secondary hover:bg-white/5 hover:text-ink"
                            aria-label="Editar"
                          >
                            <IconPencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(f)}
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar fornecedor" : "Novo fornecedor"}
      >
        <FornecedorForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={activeMutation.isPending}
          errorMessage={activeMutation.error?.message}
        />
      </Modal>
    </div>
  );
}
