"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state";
import { IconPlus, IconPencil, IconTrash } from "@/components/ui/icons";
import { ClienteForm } from "@/components/cadastros/cliente-form";
import {
  useClientes,
  useCreateCliente,
  useUpdateCliente,
  useDeleteCliente,
} from "@/hooks/cadastros/use-clientes";
import type { Cliente, ClienteFormInput } from "@/hooks/cadastros/use-clientes";

/** app/(app)/cadastros/clientes/page.tsx — Lista e CRUD de clientes. */
export default function CadastroClientesPage() {
  const { data, isLoading, isError, error } = useClientes();
  const createMutation = useCreateCliente();
  const updateMutation = useUpdateCliente();
  const deleteMutation = useDeleteCliente();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);

  const activeMutation = editing ? updateMutation : createMutation;

  function openCreate() {
    setEditing(null);
    createMutation.reset();
    setModalOpen(true);
  }

  function openEdit(cliente: Cliente) {
    setEditing(cliente);
    updateMutation.reset();
    setModalOpen(true);
  }

  function handleSubmit(input: ClienteFormInput) {
    if (editing) {
      updateMutation.mutate({ id: editing.id, ...input }, { onSuccess: () => setModalOpen(false) });
    } else {
      createMutation.mutate(input, { onSuccess: () => setModalOpen(false) });
    }
  }

  function handleDelete(cliente: Cliente) {
    if (confirm(`Excluir o cliente "${cliente.name}"? Esta ação não pode ser desfeita.`)) {
      deleteMutation.mutate(cliente.id);
    }
  }

  return (
    <div>
      <PageHeader
        title="Cadastro de clientes"
        subtitle="Clientes da empresa"
        action={
          <Button variant="primary" onClick={openCreate}>
            <IconPlus className="h-3.5 w-3.5" />
            Novo cliente
          </Button>
        }
      />

      {isLoading && <LoadingState label="Carregando clientes..." />}
      {isError && <ErrorState message={error?.message ?? "Erro ao carregar clientes."} />}

      {data && (
        <Card className="p-0">
          {data.clientes.length === 0 ? (
            <EmptyState message="Nenhum cliente cadastrado ainda." />
          ) : (
            <div className="overflow-x-auto p-5">
              <table className="w-full min-w-[780px] border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    {["Nome", "E-mail", "Telefone", "Cidade/UF", ""].map((h) => (
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
                  {data.clientes.map((c) => (
                    <tr key={c.id} className="border-b border-white/4 last:border-none hover:bg-white/2">
                      <td className="px-3 py-3.5 text-sm font-semibold text-ink">{c.name}</td>
                      <td className="px-3 py-3.5 text-sm text-ink-secondary">{c.email}</td>
                      <td className="px-3 py-3.5 text-sm text-ink-secondary">{c.phone}</td>
                      <td className="px-3 py-3.5 text-sm text-ink-secondary">
                        {c.city}/{c.state}
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(c)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-ink-secondary hover:bg-white/5 hover:text-ink"
                            aria-label="Editar"
                          >
                            <IconPencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(c)}
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
        title={editing ? "Editar cliente" : "Novo cliente"}
      >
        <ClienteForm
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
