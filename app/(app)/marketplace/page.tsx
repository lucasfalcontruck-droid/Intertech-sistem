"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMarketplace, useSyncMarketplace } from "@/hooks/use-marketplace";
import { useTestMercadoLivre } from "@/hooks/use-mercadolivre";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconPlus, IconAlertTriangle, IconCheck } from "@/components/ui/icons";
import { IntegrationCard } from "@/components/marketplace/integration-card";
import { PlatformLineChart } from "@/components/charts/platform-line-chart";
import { PlatformChip } from "@/components/ui/platform-chip";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/utils";
import { Platform } from "@prisma/client";

function OAuthStatusBanner() {
  const searchParams = useSearchParams();
  const connected = searchParams.get("ml_connected");
  const mlError = searchParams.get("ml_error");

  if (!connected && !mlError) return null;

  if (connected) {
    return (
      <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-[13px] text-success">
        <IconCheck className="h-4 w-4 shrink-0" />
        Mercado Livre conectado com sucesso à conta <strong>{connected}</strong>.
      </div>
    );
  }

  return (
    <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-[13px] text-danger">
      <IconAlertTriangle className="h-4 w-4 shrink-0" />
      {mlError}
    </div>
  );
}

export default function MarketplacePage() {
  const { data, isLoading, isError, error } = useMarketplace();
  const syncMutation = useSyncMarketplace();
  const testMutation = useTestMercadoLivre();
  const [syncingPlatform, setSyncingPlatform] = useState<Platform | null>(null);

  async function handleSync(platform: Platform) {
    setSyncingPlatform(platform);
    try {
      await syncMutation.mutateAsync(platform);
    } finally {
      setSyncingPlatform(null);
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">Marketplace</h2>
          <p className="mt-1 text-[12.5px] text-ink-secondary">
            Integrações e desempenho por canal de venda
          </p>
        </div>
        <Button variant="primary">
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
                key={integ.platform}
                data={integ}
                syncing={syncingPlatform === integ.platform}
                onSync={() => handleSync(integ.platform)}
                configureHref={
                  integ.platform === Platform.MERCADO_LIVRE
                    ? "/api/marketplace/mercadolivre/connect"
                    : undefined
                }
                onTest={
                  integ.platform === Platform.MERCADO_LIVRE
                    ? () => testMutation.mutate()
                    : undefined
                }
                testing={integ.platform === Platform.MERCADO_LIVRE && testMutation.isPending}
              />
            ))}
          </div>

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
                    <tr key={integ.platform} className="border-b border-white/4 last:border-none">
                      <td className="px-3 py-3.5">
                        <PlatformChip platform={integ.platform} />
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
    </div>
  );
}
