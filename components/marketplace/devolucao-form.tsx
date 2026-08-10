"use client";

import { useState } from "react";
import { Platform } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { PLATFORM_LABEL } from "@/components/ui/platform-chip";
import type { DevolucaoFormInput } from "@/hooks/marketplace/use-devolucoes";

const ALL_PLATFORMS: Platform[] = [Platform.MERCADO_LIVRE, Platform.SHOPEE, Platform.TIKTOK_SHOP];

const inputClass =
  "w-full rounded-[10px] border border-border bg-card-2 px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-accent";
const labelClass = "mb-1.5 block text-xs font-semibold text-ink-secondary";

/** components/marketplace/devolucao-form.tsx — Formulário de registro de devolução de venda. */
export function DevolucaoForm({
  onSubmit,
  onCancel,
  submitting,
  errorMessage,
}: {
  onSubmit: (input: DevolucaoFormInput) => void;
  onCancel: () => void;
  submitting: boolean;
  errorMessage?: string | null;
}) {
  const [orderNumber, setOrderNumber] = useState("");
  const [product, setProduct] = useState("");
  const [reason, setReason] = useState("");
  const [platform, setPlatform] = useState<Platform>(Platform.MERCADO_LIVRE);
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      orderNumber: orderNumber || undefined,
      product,
      reason,
      platform,
      value: Number(value),
      status: "SOLICITADA",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Produto</label>
        <input
          className={inputClass}
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          required
        />
      </div>

      <div>
        <label className={labelClass}>Motivo</label>
        <input className={inputClass} value={reason} onChange={(e) => setReason(e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Plataforma</label>
          <select
            className={inputClass}
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform)}
          >
            {ALL_PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {PLATFORM_LABEL[p]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Valor (R$)</label>
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

      <div>
        <label className={labelClass}>Número do pedido (opcional)</label>
        <input
          className={inputClass}
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
        />
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
          {submitting ? "Salvando..." : "Registrar devolução"}
        </Button>
      </div>
    </form>
  );
}
