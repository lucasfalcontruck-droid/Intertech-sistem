"use client";

import { useConfiguracoes } from "@/hooks/configuracoes/use-configuracoes";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { PLATFORM_LABEL } from "@/components/ui/platform-chip";
import { formatDateTime, formatPercent, initials } from "@/lib/utils";
import type { Platform } from "@prisma/client";

/** app/(app)/configuracoes/page.tsx — Usuários do sistema e status das integrações de marketplace. */
export default function ConfiguracoesPage() {
  const { data, isLoading, isError, error } = useConfiguracoes();

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
            <CardHeader title="Usuários do sistema" subtitle={`${data.users.length} usuário(s)`} />
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  {["Usuário", "E-mail", "Cargo"].map((h) => (
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
                  <tr key={integ.platform} className="border-b border-white/4 last:border-none">
                    <td className="px-3 py-3 text-sm font-medium text-ink">
                      {PLATFORM_LABEL[integ.platform as Platform]}
                    </td>
                    <td className="px-3 py-3 text-sm text-ink-secondary">{integ.storeName}</td>
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
