"use client";

import { useState } from "react";
import { CustoTipo } from "@prisma/client";
import { Button } from "@/components/ui/button";
import type { CustoItem, CustoFormInput } from "@/hooks/financeiro/use-custos";

const inputClass =
  "w-full rounded-[10px] border border-border bg-card-2 px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-accent";
const labelClass = "mb-1.5 block text-xs font-semibold text-ink-secondary";

/** components/financeiro/custo-form.tsx — Formulário de criação/edição de custo fixo/variável. */
export function CustoForm({
  defaultTipo,
  initial,
  onSubmit,
  onCancel,
  submitting,
  errorMessage,
}: {
  defaultTipo: CustoTipo;
  initial?: CustoItem;
  onSubmit: (input: CustoFormInput) => void;
  onCancel: () => void;
  submitting: boolean;
  errorMessage?: string | null;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [tipo, setTipo] = useState<CustoTipo>(initial?.tipo ?? defaultTipo);
  const [value, setValue] = useState(initial?.value.toString() ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ name, tipo, value: Number(value) });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Nome do custo</label>
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Tipo</label>
          <div className="flex gap-2">
            {(
              [
                { value: CustoTipo.FIXO, label: "Fixo" },
                { value: CustoTipo.VARIAVEL, label: "Variável" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTipo(opt.value)}
                className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                  tipo === opt.value
                    ? "border-accent bg-accent/20 text-ink"
                    : "border-border bg-card-2 text-ink-secondary"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelClass}>Valor mensal (R$)</label>
          <input
            className={inputClass}
            type="number"
            min="0"
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
        </div>
      </div>

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
          {submitting ? "Salvando..." : initial ? "Salvar alterações" : "Adicionar custo"}
        </Button>
      </div>
    </form>
  );
}
