"use client";

import { useState } from "react";
import { InsumoMovimentoTipo } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { useInsumos } from "@/hooks/estoque/use-insumos";
import type { InsumoMovimentoFormInput } from "@/hooks/estoque/use-insumos";

const inputClass =
  "w-full rounded-[10px] border border-border bg-card-2 px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-accent";
const labelClass = "mb-1.5 block text-xs font-semibold text-ink-secondary";

/** components/estoque/insumo-movimento-form.tsx — Formulário de registro de entrada/saída de insumo. */
export function InsumoMovimentoForm({
  onSubmit,
  onCancel,
  submitting,
  errorMessage,
}: {
  onSubmit: (input: InsumoMovimentoFormInput) => void;
  onCancel: () => void;
  submitting: boolean;
  errorMessage?: string | null;
}) {
  const insumosQuery = useInsumos();
  const insumos = insumosQuery.data?.insumos ?? [];

  const [insumoId, setInsumoId] = useState("");
  const [tipo, setTipo] = useState<InsumoMovimentoTipo>(InsumoMovimentoTipo.ENTRADA);
  const [quantity, setQuantity] = useState("");
  const [notaFiscal, setNotaFiscal] = useState("");
  const [party, setParty] = useState("");
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      insumoId,
      tipo,
      quantity: Number(quantity),
      notaFiscal,
      party,
      value: Number(value),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Insumo</label>
        <select
          className={inputClass}
          value={insumoId}
          onChange={(e) => setInsumoId(e.target.value)}
          required
        >
          <option value="" disabled>
            Selecione um insumo...
          </option>
          {insumos.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name} (estoque atual: {i.currentStock} {i.unit})
            </option>
          ))}
        </select>
        {insumos.length === 0 && (
          <p className="mt-1.5 text-[11.5px] text-warning">Cadastre um insumo antes de lançar movimentações.</p>
        )}
      </div>

      <div>
        <label className={labelClass}>Tipo de movimentação</label>
        <div className="flex gap-2">
          {(
            [
              { value: InsumoMovimentoTipo.ENTRADA, label: "Entrada" },
              { value: InsumoMovimentoTipo.SAIDA, label: "Saída" },
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Quantidade</label>
          <input
            className={inputClass}
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Valor total (R$)</label>
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Nota fiscal</label>
          <input
            className={inputClass}
            value={notaFiscal}
            onChange={(e) => setNotaFiscal(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>{tipo === "ENTRADA" ? "Fornecedor (origem)" : "Destino"}</label>
          <input className={inputClass} value={party} onChange={(e) => setParty(e.target.value)} required />
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
          {submitting ? "Salvando..." : "Registrar movimentação"}
        </Button>
      </div>
    </form>
  );
}
