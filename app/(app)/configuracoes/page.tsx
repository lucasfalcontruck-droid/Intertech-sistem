"use client";

import { useState } from "react";
import { useConfiguracoes, useCreateUser } from "@/hooks/configuracoes/use-configuracoes";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { PLATFORM_LABEL } from "@/components/ui/platform-chip";
import { formatDateTime, formatPercent, initials } from "@/lib/utils";
import type { Platform } from "@prisma/client";

/** app/(app)/configuracoes/page.tsx — Usuários do sistema e status das integrações de marketplace. */

const SELLER_OPTIONS = [
  "JAMERSON VICTOR",
  "FERNANDO",
  "THAIZE",
  "PATRICIA",
  "GABRIEL WILLIAN",
  "MARCO AURÉLIO PETINATTI",
];

const inputClass =
  "w-full rounded-[10px] border border-border bg-card-2 px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-accent";

export default function ConfiguracoesPage() {
  const { data, isLoading, isError, error } = useConfiguracoes();
  const createUser = useCreateUser();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "VENDEDOR" as "ADMIN" | "VENDEDOR" | "Operador",
    seller: "JAMERSON VICTOR",
  });
  const [formError, setFormError] = useState<string | null>(null);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    try {
      await createUser.mutateAsync({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        seller: form.role === "VENDEDOR" ? form.seller : null,
      });
      setForm({ name: "", email: "", password: "", role: "VENDEDOR", seller: "JAMERSON VICTOR" });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erro ao criar a conta.");
    }
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-ink">Configurações</h2>
        <p className="mt-1 text-[12.5px] text-ink-secondary">
          Dados da empresa, usuários e integrações
        </p>
      </div>

      {isLoading && <LoadingState label="Carregando configurações..." />}
      {isError && <ErrorState message={error?.message ?? "Erro ao carregar configurações."} />}

      {data && (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader title="Dados da empresa" subtitle="Informações cadastrais" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-ink-muted">
                  Razão social
                </div>
                <div className="mt-1 font-medium text-ink">
                  Intertech Comércio de Eletrônicos Ltda.
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-ink-muted">CNPJ</div>
                <div className="mt-1 font-medium text-ink">00.000.000/0001-00</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-ink-muted">
                  E-mail comercial
                </div>
                <div className="mt-1 font-medium text-ink">contato@intertech.com</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-ink-muted">
                  Cidade / UF
                </div>
                <div className="mt-1 font-medium text-ink">São Paulo / SP</div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Nova conta"
              subtitle="Crie contas para vendedores e operadores do sistema"
            />
            <form onSubmit={handleCreate} className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label htmlFor="user-name" className="mb-1.5 block text-xs font-semibold text-ink-secondary">
                  Nome
                </label>
                <input
                  id="user-name"
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Nome completo"
                  required
                />
              </div>
              <div>
                <label htmlFor="user-email" className="mb-1.5 block text-xs font-semibold text-ink-secondary">
                  E-mail
                </label>
                <input
                  id="user-email"
                  type="email"
                  className={inputClass}
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="nome@intertech.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="user-password" className="mb-1.5 block text-xs font-semibold text-ink-secondary">
                  Senha
                </label>
                <input
                  id="user-password"
                  type="password"
                  className={inputClass}
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                />
              </div>
              <div>
                <label htmlFor="user-role" className="mb-1.5 block text-xs font-semibold text-ink-secondary">
                  Cargo
                </label>
                <select
                  id="user-role"
                  className={inputClass}
                  value={form.role}
                  onChange={(e) => updateField("role", e.target.value)}
                >
                  <option value="VENDEDOR">Vendedor</option>
                  <option value="Operador">Operador</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              {form.role === "VENDEDOR" && (
                <div>
                  <label htmlFor="user-seller" className="mb-1.5 block text-xs font-semibold text-ink-secondary">
                    Vendedor vinculado
                  </label>
                  <select
                    id="user-seller"
                    className={inputClass}
                    value={form.seller}
                    onChange={(e) => updateField("seller", e.target.value)}
                  >
                    {SELLER_OPTIONS.map((seller) => (
                      <option key={seller} value={seller}>
                        {seller}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex items-end md:col-span-2">
                <Button type="submit" variant="primary" disabled={createUser.isPending}>
                  {createUser.isPending ? "Criando..." : "Criar conta"}
                </Button>
              </div>
            </form>
            {formError && (
              <div className="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-[12.5px] text-danger">
                {formError}
              </div>
            )}
            {createUser.isSuccess && (
              <div className="mt-3 rounded-lg border border-emerald/30 bg-emerald/10 px-3 py-2 text-[12.5px] text-emerald">
                Conta criada com sucesso.
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Usuários do sistema" subtitle={`${data.users.length} usuário(s)`} />
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  {["Usuário", "E-mail", "Cargo", "Vendedor"].map((h) => (
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
                {data.users.map((u) => (
                  <tr key={u.id} className="border-b border-white/4 last:border-none">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="bg-accent-gradient flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white">
                          {initials(u.name)}
                        </div>
                        <span className="text-sm font-medium text-ink">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-ink-secondary">{u.email}</td>
                    <td className="px-3 py-3 text-sm text-ink-secondary">{u.role}</td>
                    <td className="px-3 py-3 text-sm text-ink-secondary">{u.seller ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card>
            <CardHeader title="Credenciais de integração" subtitle="Marketplaces conectados" />
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  {["Plataforma", "Loja", "Taxa", "Última sincronização", "Status"].map((h) => (
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
                {data.integrations.map((integ) => (
                  <tr key={integ.id} className="border-b border-white/4 last:border-none">
                    <td className="px-3 py-3 text-sm font-medium text-ink">
                      {PLATFORM_LABEL[integ.platform as Platform]}
                    </td>
                    <td className="px-3 py-3 text-sm text-ink-secondary">
                      <div className="flex items-center gap-2">
                        {integ.storeName}
                        {!integ.isReal && (
                          <span
                            title="Loja de demonstração — não veio de um login real"
                            className="rounded-full bg-warning/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-warning"
                          >
                            Demonstração
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-ink-secondary">
                      {formatPercent(integ.feePercentage)}
                    </td>
                    <td className="px-3 py-3 text-sm text-ink-secondary">
                      {integ.lastSyncedAt ? formatDateTime(integ.lastSyncedAt) : "—"}
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={integ.status === "CONNECTED" ? "ok" : "out"}>
                        {integ.status === "CONNECTED" ? "Conectado" : "Desconectado"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
}
