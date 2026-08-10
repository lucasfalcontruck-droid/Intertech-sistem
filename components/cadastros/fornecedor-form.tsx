"use client";

import { useState } from "react";
import { FornecedorTipo } from "@prisma/client";
import { Button } from "@/components/ui/button";
import type { Fornecedor, FornecedorFormInput } from "@/hooks/cadastros/use-fornecedores";

const inputClass =
  "w-full rounded-[10px] border border-border bg-card-2 px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-accent";
const labelClass = "mb-1.5 block text-xs font-semibold text-ink-secondary";

const TIPO_LABEL: Record<FornecedorTipo, string> = { INSUMO: "Insumo", PRODUTO: "Produto" };

/** components/cadastros/fornecedor-form.tsx — Formulário de criação/edição de fornecedor. */
export function FornecedorForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
  errorMessage,
}: {
  initial?: Fornecedor;
  onSubmit: (input: FornecedorFormInput) => void;
  onCancel: () => void;
  submitting: boolean;
  errorMessage?: string | null;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [tipo, setTipo] = useState<FornecedorTipo>(initial?.tipo ?? FornecedorTipo.INSUMO);
  const [contact, setContact] = useState(initial?.contact ?? "");
  const [leadTimeDays, setLeadTimeDays] = useState(initial?.leadTimeDays.toString() ?? "0");
  const [active, setActive] = useState(initial?.active ?? true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ name, tipo, contact, leadTimeDays: Number(leadTimeDays), active });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Nome do fornecedor</label>
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Fornece</label>
          <select
            className={inputClass}
            value={tipo}
            onChange={(e) => setTipo(e.target.value as FornecedorTipo)}
          >
            {Object.values(FornecedorTipo).map((t) => (
              <option key={t} value={t}>
                {TIPO_LABEL[t]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Prazo médio de entrega (dias)</label>
          <input
            className={inputClass}
            type="number"
            min="0"
            value={leadTimeDays}
            onChange={(e) => setLeadTimeDays(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Contato (e-mail ou telefone)</label>
        <input
          className={inputClass}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          required
        />
      </div>

      <label className="flex items-center gap-2 text-[12.5px] text-ink-secondary">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="h-4 w-4 accent-accent"
        />
        Fornecedor ativo
      </label>

      {errorMessage && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-[12.5px] text-danger">
          {errorMessage}
        </div>
      )}

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? "Salvando..." : initial ? "Salvar alterações" : "Criar fornecedor"}
        </Button>
      </div>
    </form>
  );
}
