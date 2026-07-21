"use client";

import { useState } from "react";
import { useMarketplace, useSyncMarketplace } from "@/hooks/use-marketplace";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@/components/ui/icons";
import { IntegrationCard } from "@/components/marketplace/integration-card";
import { PlatformLineChart } from "@/components/charts/platform-line-chart";
import { PlatformChip } from "@/components/ui/platform-chip";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { Platform } from "@prisma/client";

export default function MarketplacePage() {
  const { data, isLoading, isError, error } = useMarketplace();
  const syncMutation = useSyncMarketplace();
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
              />
            ))}
          </div>

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
