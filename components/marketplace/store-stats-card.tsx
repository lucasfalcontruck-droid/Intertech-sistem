import type { Platform } from "@prisma/client";
import { PLATFORM_LABEL } from "@/components/ui/platform-chip";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import type { StoreDailyStats } from "@/hooks/marketplace/use-store-stats";

/**
 * components/marketplace/store-stats-card.tsx — Card "hoje" de uma loja, no
 * mesmo formato do painel Negócio do Mercado Livre: vendas brutas, unidades,
 * preço médio, visitas, conversão e cancelados. Usado no Dashboard (grade
 * com todas as lojas) e no Marketplace (dentro do card de cada loja).
 */
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-[10.5px] text-ink-muted">{label}</p>
      <p className="text-[15px] font-bold text-ink">{value}</p>
    </div>
  );
}

export function StoreStatsCard({ stats }: { stats: StoreDailyStats }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3.5">
        <p className="text-[13.5px] font-bold text-ink">{stats.storeName}</p>
        <p className="text-[11px] text-ink-muted">{PLATFORM_LABEL[stats.platform as Platform]} · hoje</p>
      </div>
      <div className="grid grid-cols-4 gap-x-3 gap-y-3.5">
        <Metric label="Vendas brutas" value={formatCurrency(stats.grossSales)} />
        <Metric label="Unidades vendidas" value={formatNumber(stats.unitsSold)} />
        <Metric label="Preço médio/unidade" value={formatCurrency(stats.avgPricePerUnit)} />
        <Metric label="Visitas" value={stats.visits !== null ? formatNumber(stats.visits) : "—"} />
        <Metric label="Quantidade de vendas" value={formatNumber(stats.salesCount)} />
        <Metric
          label="Conversão"
          value={stats.conversion !== null ? formatPercent(stats.conversion) : "—"}
        />
        <Metric label="Preço médio/venda" value={formatCurrency(stats.avgPricePerSale)} />
        <Metric label="Vendas canceladas" value={formatNumber(stats.cancelledCount)} />
      </div>
    </div>
  );
}
