"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Cliente, ClienteFormInput } from "@/hooks/cadastros/use-clientes";

const inputClass =
  "w-full rounded-[10px] border border-border bg-card-2 px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-accent";
const labelClass = "mb-1.5 block text-xs font-semibold text-ink-secondary";

/** components/cadastros/cliente-form.tsx — Formulário de criação/edição de cliente. */
export function ClienteForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
  errorMessage,
}: {
  initial?: Cliente;
  onSubmit: (input: ClienteFormInput) => void;
  onCancel: () => void;
  submitting: boolean;
  errorMessage?: string | null;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [state, setState] = useState(initial?.state ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ name, email, phone, city, state });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Nome</label>
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>E-mail</label>
          <input
            className={inputClass}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Telefone</label>
          <input
            className={inputClass}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Cidade</label>
          <input className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Estado (UF)</label>
          <input
            className={inputClass}
            value={state}
            onChange={(e) => setState(e.target.value.toUpperCase())}
            maxLength={2}
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
          {submitting ? "Salvando..." : initial ? "Salvar alterações" : "Criar cliente"}
        </Button>
      </div>
    </form>
  );
}
