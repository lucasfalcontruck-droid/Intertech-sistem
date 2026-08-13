"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  useMarketplace,
  useSyncMarketplace,
  useDeleteStore,
} from "@/hooks/marketplace/use-marketplace";
import { useTestMercadoLivre } from "@/hooks/marketplace/use-mercadolivre";
import { useAllStoresDailyStats } from "@/hooks/marketplace/use-store-stats";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconPlus, IconAlertTriangle, IconCheck } from "@/components/ui/icons";
import { IntegrationCard } from "@/components/marketplace/integration-card";
import { AddStoreModal } from "@/components/marketplace/add-store-modal";
import { StoreStatsCard } from "@/components/marketplace/store-stats-card";
import { PlatformLineChart } from "@/components/charts/platform-line-chart";
import { PlatformChip } from "@/components/ui/platform-chip";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/utils";
import { Platform } from "@prisma/client";

const CONFIGURE_HREF: Partial<Record<Platform, string>> = {
  [Platform.MERCADO_LIVRE]: "/api/marketplace/mercadolivre/connect",
  [Platform.SHOPEE]: "/api/marketplace/shopee/connect",
  [Platform.TIKTOK_SHOP]: "/api/marketplace/tiktok/connect",
};

const OAUTH_PARAMS = [
  { platform: "Mercado Livre", connected: "ml_connected", error: "ml_error" },
  { platform: "Shopee", connected: "shopee_connected", error: "shopee_error" },
  { platform: "TikTok Shop", connected: "tiktok_connected", error: "tiktok_error" },
];

function OAuthStatusBanner() {
  const searchParams = useSearchParams();

  for (const { platform, connected, error } of OAUTH_PARAMS) {
    const connectedStore = searchParams.get(connected);
    const errorMessage = searchParams.get(error);

    if (connectedStore) {
      return (
        <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-[13px] text-success">
          <IconCheck className="h-4 w-4 shrink-0" />
          {platform} conectado com sucesso à conta <strong>{connectedStore}</strong>.
        </div>
      );
    }

    if (errorMessage) {
      return (
        <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-[13px] text-danger">
          <IconAlertTriangle className="h-4 w-4 shrink-0" />
          {errorMessage}
        </div>
      );
    }
  }

  return null;
}

/** app/(app)/marketplace/page.tsx — Visão geral do Marketplace: cards de integração, sincronizar e conectar Mercado Livre. */
export default function MarketplacePage() {
  const { data, isLoading, isError, error } = useMarketplace();
  const { data: storeStatsData } = useAllStoresDailyStats();
  const syncMutation = useSyncMarketplace();
  const deleteMutation = useDeleteStore();
  const testMutation = useTestMercadoLivre();
  const [syncingStoreId, setSyncingStoreId] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  async function handleSync(storeId: string) {
    setSyncingStoreId(storeId);
    try {
      await syncMutation.mutateAsync(storeId);
    } finally {
      setSyncingStoreId(null);
    }
  }

  function handleDelete(storeId: string, storeName: string) {
    if (confirm(`Remover a loja "${storeName}"? Isso não apaga os pedidos já registrados.`)) {
      deleteMutation.mutate(storeId);
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">Marketplace</h2>
          <p className="mt-1 text-[12.5px] text-ink-secondary">
            Integrações e desempenho por canal de venda — uma plataforma pode ter mais de uma loja
            conectada
          </p>
        </div>
        <Button variant="primary" onClick={() => setAddModalOpen(true)}>
          <IconPlus className="h-3.5 w-3.5" />
          Conectar nova loja
        </Button>
      </div>

      <Suspense>
        <OAuthStatusBanner />
      </Suspense>

      {isLoading && <LoadingState label="Carregando marketplace..." />}
      {isError && <ErrorState message={error?.message ?? "Erro ao carregar marketplace."} />}

      {data && (
        <>
          <div className="mb-5 grid grid-cols-3 gap-4">
            {data.integrationCards.map((integ) => (
              <IntegrationCard
                key={integ.id}
                data={integ}
                syncing={syncingStoreId === integ.id}
                onSync={() => handleSync(integ.id)}
                configureHref={CONFIGURE_HREF[integ.platform]}
                onTest={
                  integ.platform === Platform.MERCADO_LIVRE
                    ? () => testMutation.mutate(integ.id)
                    : undefined
                }
                testing={testMutation.isPending && testMutation.variables === integ.id}
                onDelete={() => handleDelete(integ.id, integ.storeName)}
              />
            ))}
          </div>

          {storeStatsData && storeStatsData.stats.length > 0 && (
            <div className="mb-5">
              <p className="mb-2.5 text-[13px] font-bold text-ink">Detalhamento por loja · hoje</p>
              <div className="grid grid-cols-2 gap-4">
                {storeStatsData.stats.map((s) => (
                  <StoreStatsCard key={s.storeId} stats={s} />
                ))}
              </div>
            </div>
          )}

          {testMutation.isError && (
            <Card className="mb-5 border-danger/30 bg-danger/10">
              <p className="text-[13px] text-danger">{testMutation.error.message}</p>
            </Card>
          )}

          {testMutation.isSuccess && (
            <Card className="mb-5">
              <CardHeader
                title="Teste de conexão — Mercado Livre"
                subtitle={`Conta: ${testMutation.data.user.nickname} (ID ${testMutation.data.user.id})`}
              />
              <p className="mb-3 text-[13px] text-ink-secondary">
                {formatNumber(testMutation.data.orderCount)} pedidos encontrados na conta real.
              </p>
              {testMutation.data.recentOrders.length > 0 && (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      {["Pedido", "Status", "Valor", "Data"].map((h) => (
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
                    {testMutation.data.recentOrders.map((o) => (
                      <tr key={o.id} className="border-b border-white/4 last:border-none">
                        <td className="px-3 py-3 text-sm">#{o.id}</td>
                        <td className="px-3 py-3 text-sm text-ink-secondary">{o.status}</td>
                        <td className="px-3 py-3 text-sm">{formatCurrency(o.total)}</td>
                        <td className="px-3 py-3 text-sm text-ink-secondary">
                          {formatDateTime(o.date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader title="Evolução de vendas por canal" subtitle="Últimos 6 meses" />
              <div className="h-[280px]">
                <PlatformLineChart data={data.monthlyTrend} />
              </div>
            </Card>

            <Card>
              <CardHeader title="Comparativo de canais" subtitle="Últimos 30 dias" />
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    {["Plataforma", "Vendas", "Pedidos", "Ticket médio"].map((h) => (
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
                  {data.integrationCards.map((integ) => (
                    <tr key={integ.id} className="border-b border-white/4 last:border-none">
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-2">
                          <PlatformChip platform={integ.platform} />
                          <span className="text-ink-muted">{integ.storeName}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-sm">{formatCurrency(integ.sales)}</td>
                      <td className="px-3 py-3.5 text-sm">{formatNumber(integ.orders)}</td>
                      <td className="px-3 py-3.5 text-sm">{formatCurrency(integ.averageTicket)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </>
      )}

      <AddStoreModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </div>
  );
}
