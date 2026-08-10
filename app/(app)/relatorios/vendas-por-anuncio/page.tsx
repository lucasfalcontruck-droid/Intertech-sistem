"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlatformChip } from "@/components/ui/platform-chip";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state";
import { useVendasPorAnuncio } from "@/hooks/relatorios/use-relatorios";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

/** app/(app)/relatorios/vendas-por-anuncio/page.tsx — Desempenho de vendas por anúncio. */
export default function VendasPorAnuncioPage() {
  const { data, isLoading, isError, error } = useVendasPorAnuncio();

  return (
    <div>
      <PageHeader title="Vendas por anúncio" subtitle="Verifique se cada anúncio está vendendo bem" />

      {isLoading && <LoadingState label="Carregando vendas por anúncio..." />}
      {isError && <ErrorState message={error?.message ?? "Erro ao carregar o relatório."} />}

      {data && (
        <Card className="p-0">
          {data.ads.length === 0 ? (
            <EmptyState message="Nenhum anúncio com dados de venda ainda." />
          ) : (
            <div className="overflow-x-auto p-5">
              <table className="w-full min-w-[860px] border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    {["Anúncio", "Plataforma", "Visualizações", "Vendas", "Conversão", "Receita", "Status"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-3 pb-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-muted"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.ads.map((ad) => {
                    const status =
                      ad.conversion >= 2 ? "ok" : ad.conversion >= 1 ? "low" : "out";
                    return (
                      <tr key={ad.product} className="border-b border-white/4 last:border-none hover:bg-white/2">
                        <td className="px-3 py-3.5 text-sm font-semibold text-ink">{ad.product}</td>
                        <td className="px-3 py-3.5">
                          <PlatformChip platform={ad.platform} short />
                        </td>
                        <td className="px-3 py-3.5 text-sm text-ink-secondary">
                          {formatNumber(ad.views)}
                        </td>
                        <td className="px-3 py-3.5 text-sm text-ink-secondary">
                          {formatNumber(ad.sales)}
                        </td>
                        <td className="px-3 py-3.5 text-sm text-ink-secondary">
                          {formatPercent(ad.conversion)}
                        </td>
                        <td className="px-3 py-3.5 text-sm">{formatCurrency(ad.revenue)}</td>
                        <td className="px-3 py-3.5">
                          <Badge variant={status}>
                            {status === "ok" ? "Vendendo bem" : status === "low" ? "Observar" : "Sem tração"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
