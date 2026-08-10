"use client";

import { useState } from "react";
import { FornecedorTipo, PedidoCompraStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { useFornecedores } from "@/hooks/cadastros/use-fornecedores";
import type { PedidoCompra, PedidoCompraFormInput } from "@/hooks/pedidos/use-pedidos-compra";

const inputClass =
  "w-full rounded-[10px] border border-border bg-card-2 px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-accent";
const labelClass = "mb-1.5 block text-xs font-semibold text-ink-secondary";

const STATUS_LABEL: Record<PedidoCompraStatus, string> = {
  AGUARDANDO: "Aguardando",
  EM_TRANSITO: "Em trânsito",
  RECEBIDO: "Recebido",
};

/** components/pedidos/pedido-compra-form.tsx — Formulário de criação/edição de pedido de compra. */
export function PedidoCompraForm({
  tipo,
  initial,
  onSubmit,
  onCancel,
  submitting,
  errorMessage,
}: {
  tipo: FornecedorTipo;
  initial?: PedidoCompra;
  onSubmit: (input: PedidoCompraFormInput) => void;
  onCancel: () => void;
  submitting: boolean;
  errorMessage?: string | null;
}) {
  const fornecedoresQuery = useFornecedores();
  const options = (fornecedoresQuery.data?.fornecedores ?? []).filter((f) => f.tipo === tipo);

  const [fornecedorId, setFornecedorId] = useState(initial?.fornecedorId ?? "");
  const [itemName, setItemName] = useState(initial?.itemName ?? "");
  const [quantity, setQuantity] = useState(initial?.quantity.toString() ?? "");
  const [value, setValue] = useState(initial?.value.toString() ?? "");
  const [status, setStatus] = useState<PedidoCompraStatus>(
    initial?.status ?? PedidoCompraStatus.AGUARDANDO,
  );
  const [expectedDate, setExpectedDate] = useState(
    initial?.expectedDate ? initial.expectedDate.slice(0, 10) : "",
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      tipo,
      fornecedorId,
      itemName,
      quantity: Number(quantity),
      value: Number(value),
      status,
      expectedDate,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Fornecedor</label>
        <select
          className={inputClass}
          value={fornecedorId}
          onChange={(e) => setFornecedorId(e.target.value)}
          required
        >
          <option value="" disabled>
            Selecione um fornecedor...
          </option>
          {options.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
        {options.length === 0 && (
          <p className="mt-1.5 text-[11.5px] text-warning">
            Cadastre um fornecedor do tipo correspondente antes de criar o pedido.
          </p>
        )}
      </div>

      <div>
        <label className={labelClass}>{tipo === "INSUMO" ? "Insumo" : "Produto"}</label>
        <input
          className={inputClass}
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          required
        />
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
          <label className={labelClass}>Previsão de entrega</label>
          <input
            className={inputClass}
            type="date"
            value={expectedDate}
            onChange={(e) => setExpectedDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select
            className={inputClass}
            value={status}
            onChange={(e) => setStatus(e.target.value as PedidoCompraStatus)}
          >
            {Object.values(PedidoCompraStatus).map((s) => (
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
          {submitting ? "Salvando..." : initial ? "Salvar alterações" : "Criar pedido de compra"}
        </Button>
      </div>
    </form>
  );
}
