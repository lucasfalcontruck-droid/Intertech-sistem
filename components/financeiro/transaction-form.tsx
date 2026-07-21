"use client";

import { useState } from "react";
import { TransactionStatus, TransactionType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import type { TransactionFormInput } from "@/hooks/use-transactions";

const inputClass =
  "w-full rounded-[10px] border border-border bg-card-2 px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-accent";
const labelClass = "mb-1.5 block text-xs font-semibold text-ink-secondary";

const STATUS_LABEL: Record<TransactionStatus, string> = {
  PENDENTE: "Pendente",
  A_VENCER: "A vencer",
  PAGO: "Pago",
};

export function TransactionForm({
  defaultType,
  onSubmit,
  onCancel,
  submitting,
  errorMessage,
}: {
  defaultType: TransactionType;
  onSubmit: (input: TransactionFormInput) => void;
  onCancel: () => void;
  submitting: boolean;
  errorMessage?: string | null;
}) {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<TransactionStatus>(TransactionStatus.PENDENTE);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ type, description, category, amount: Number(amount), dueDate, status });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Tipo</label>
        <div className="flex gap-2">
          {(
            [
              { value: TransactionType.ENTRADA, label: "Entrada (a receber)" },
              { value: TransactionType.SAIDA, label: "Saída (a pagar)" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setType(opt.value)}
              className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                type === opt.value
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
        <label className={labelClass}>Descrição</label>
        <input
          className={inputClass}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Categoria</label>
          <input
            className={inputClass}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Valor (R$)</label>
          <input
            className={inputClass}
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Vencimento</label>
          <input
            className={inputClass}
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select
            className={inputClass}
            value={status}
            onChange={(e) => setStatus(e.target.value as TransactionStatus)}
          >
            {Object.values(TransactionStatus).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
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
          {submitting ? "Salvando..." : "Criar transação"}
        </Button>
      </div>
    </form>
  );
}
