"use client";

import Link from "next/link";
import type { Platform } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { PLATFORM_COLOR, PLATFORM_LABEL, PLATFORM_SHORT } from "@/components/ui/platform-chip";
import { IconRefresh, IconSettings, IconCheck, IconTrash } from "@/components/ui/icons";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import type { IntegrationCard as IntegrationCardData } from "@/lib/types";

/**
 * components/marketplace/integration-card.tsx — Card de cada canal de venda
 * (Mercado Livre/Shopee/TikTok Shop) na tela Marketplace, com botões de
 * Sincronizar, Configurar (leva ao OAuth do ML) e Testar conexão real.
 */
const ICON_STYLE: Record<Platform, React.CSSProperties> = Object.fromEntries(
  (Object.keys(PLATFORM_COLOR) as Platform[]).map((platform) => [
    platform,
    {
      background: "rgba(255,255,255,0.05)",
      color: PLATFORM_COLOR[platform],
      border: `1px solid ${PLATFORM_COLOR[platform]}`,
    },
  ]),
) as Record<Platform, React.CSSProperties>;

export function IntegrationCard({
  data,
  onSync,
  syncing,
  configureHref,
  onTest,
  testing,
  onDelete,
}: {
  data: IntegrationCardData;
  onSync: () => void;
  syncing: boolean;
  configureHref?: string;
  onTest?: () => void;
  testing?: boolean;
  onDelete?: () => void;
}) {
  return (
    <div className="relative rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl text-[13px] font-extrabold"
          style={ICON_STYLE[data.platform]}
        >
          {PLATFORM_SHORT[data.platform]}
        </div>
        <div className="flex items-center gap-2.5">
          {data.status === "CONNECTED" ? (
            <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-success">
              <span className="h-[7px] w-[7px] rounded-full bg-success shadow-[0_0_0_3px_rgba(34,197,94,0.2)]" />
              Conectado
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-muted">
              <span className="h-[7px] w-[7px] rounded-full bg-ink-muted" />
              Desconectado
            </span>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              title="Remover loja"
              aria-label="Remover loja"
              className="flex h-6 w-6 items-center justify-center rounded-md text-ink-muted hover:bg-danger/10 hover:text-danger"
            >
              <IconTrash className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="mb-0.5 flex items-center gap-2">
        <span className="text-[15px] font-bold text-ink">{data.storeName}</span>
        {!data.isReal && (
          <span
            title="Loja de demonstração — não veio de um login real"
            className="rounded-full bg-warning/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-warning"
          >
            Demonstração
          </span>
        )}
      </div>
      <div className="mb-2.5 text-[11.5px] text-ink-muted">{PLATFORM_LABEL[data.platform]}</div>

      <div className="flex justify-between border-b border-white/5 py-2.5 text-[12.5px]">
        <span className="text-ink-secondary">Vendas (mês)</span>
        <span className="font-bold">{formatCurrency(data.sales)}</span>
      </div>
      <div className="flex justify-between border-b border-white/5 py-2.5 text-[12.5px]">
        <span className="text-ink-secondary">Pedidos</span>
        <span className="font-bold">{formatNumber(data.orders)}</span>
      </div>
      <div className="flex justify-between border-b border-white/5 py-2.5 text-[12.5px]">
        <span className="text-ink-secondary">Taxa da plataforma</span>
        <span className="font-bold">{formatPercent(data.feePercentage)}</span>
      </div>
      <div className="flex justify-between py-2.5 text-[12.5px]">
        <span className="text-ink-secondary">Repasse líquido</span>
        <span className="font-bold">{formatCurrency(data.netPayout)}</span>
      </div>

      <div className="mt-4 flex gap-2">
        <Button variant="sync" onClick={onSync} disabled={syncing}>
          <IconRefresh className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Sincronizando..." : "Sincronizar"}
        </Button>
        {configureHref ? (
          <Link
            href={configureHref}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-border bg-white/6 px-4 py-2.5 text-[13px] font-semibold text-ink hover:bg-white/10"
          >
            <IconSettings className="h-3.5 w-3.5" />
            Configurar
          </Link>
        ) : (
          <Button variant="sync">
            <IconSettings className="h-3.5 w-3.5" />
            Configurar
          </Button>
        )}
      </div>

      {onTest && (
        <Button variant="secondary" onClick={onTest} disabled={testing} className="mt-2 w-full">
          <IconCheck className="h-3.5 w-3.5" />
          {testing ? "Testando..." : "Testar conexão real"}
        </Button>
      )}
    </div>
  );
}
