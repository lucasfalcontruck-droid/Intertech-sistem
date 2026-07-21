"use client";

import Link from "next/link";
import type { Platform } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { PLATFORM_COLOR, PLATFORM_LABEL, PLATFORM_SHORT } from "@/components/ui/platform-chip";
import { IconRefresh, IconSettings, IconCheck } from "@/components/ui/icons";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import type { IntegrationCard as IntegrationCardData } from "@/lib/types";

const ICON_STYLE: Record<Platform, React.CSSProperties> = {
  MERCADO_LIVRE: { background: PLATFORM_COLOR.MERCADO_LIVRE, color: "#0a0a0a" },
  SHOPEE: { background: PLATFORM_COLOR.SHOPEE, color: "#fff" },
  TIKTOK_SHOP: {
    background: "#111",
    color: PLATFORM_COLOR.TIKTOK_SHOP,
    border: `1px solid ${PLATFORM_COLOR.TIKTOK_SHOP}`,
  },
};

export function IntegrationCard({
  data,
  onSync,
  syncing,
  configureHref,
  onTest,
  testing,
}: {
  data: IntegrationCardData;
  onSync: () => void;
  syncing: boolean;
  configureHref?: string;
  onTest?: () => void;
  testing?: boolean;
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
      </div>

      <div className="mb-0.5 text-[15px] font-bold text-ink">{PLATFORM_LABEL[data.platform]}</div>
      <div className="mb-2.5 text-[11.5px] text-ink-muted">Loja: {data.storeName}</div>

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
