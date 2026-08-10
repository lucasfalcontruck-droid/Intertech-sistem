"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { InsumoFormInput } from "@/hooks/estoque/use-insumos";

const inputClass =
  "w-full rounded-[10px] border border-border bg-card-2 px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-accent";
const labelClass = "mb-1.5 block text-xs font-semibold text-ink-secondary";

/** components/estoque/insumo-form.tsx — Formulário de criação de insumo (matéria-prima). */
export function InsumoForm({
  onSubmit,
  onCancel,
  submitting,
  errorMessage,
}: {
  onSubmit: (input: InsumoFormInput) => void;
  onCancel: () => void;
  submitting: boolean;
  errorMessage?: string | null;
}) {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("un");
  const [currentStock, setCurrentStock] = useState("0");
  const [minStock, setMinStock] = useState("0");
  const [unitCost, setUnitCost] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      name,
      unit,
      currentStock: Number(currentStock),
      minStock: Number(minStock),
      unitCost: Number(unitCost),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Nome do insumo</label>
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Unidade</label>
          <input className={inputClass} value={unit} onChange={(e) => setUnit(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Custo unitário (R$)</label>
          <input
            className={inputClass}
            type="number"
            min="0"
            step="0.01"
            value={unitCost}
            onChange={(e) => setUnitCost(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Estoque inicial</label>
          <input
            className={inputClass}
            type="number"
            min="0"
            value={currentStock}
            onChange={(e) => setCurrentStock(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Estoque mínimo</label>
          <input
            className={inputClass}
            type="number"
            min="0"
            value={minStock}
            onChange={(e) => setMinStock(e.target.value)}
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
          {submitting ? "Salvando..." : "Criar insumo"}
        </Button>
      </div>
    </form>
  );
}
