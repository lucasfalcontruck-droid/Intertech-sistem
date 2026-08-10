"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { GenericBarChart } from "@/components/charts/generic-bar-chart";
import { useEstoqueCategoria } from "@/hooks/estoque/use-products";
import { formatCompactCurrency, formatCurrency, formatNumber } from "@/lib/utils";

/** app/(app)/estoque/categoria/page.tsx — Estoque agrupado por categoria (quantidade e valor). */
export default function EstoqueCategoriaPage() {
  const { data, isLoading, isError, error } = useEstoqueCategoria();

  return (
    <div>
      <PageHeader
        title="Estoque por categoria"
        subtitle="Quantidade e valor em estoque agrupado por categoria"
      />

      {isLoading && <LoadingState label="Carregando estoque por categoria..." />}
      {isError && <ErrorState message={error?.message ?? "Erro ao carregar estoque."} />}

      {data && (
        <>
          <Card className="mb-4">
            <CardHeader title="Valor em estoque por categoria" subtitle="Posição atual" />
            <div className="h-[260px]">
              <GenericBarChart
                data={data.categories.map((c) => ({ label: c.category, value: c.value }))}
                formatter={(v) => formatCompactCurrency(v)}
              />
            </div>
          </Card>

          <Card className="p-0">
            <div className="overflow-x-auto p-5">
              <table className="w-full min-w-[620px] border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    {["Categoria", "SKUs", "Unidades", "Valor em estoque"].map((h) => (
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
                  {data.categories.map((c) => (
                    <tr key={c.category} className="border-b border-white/4 last:border-none">
                      <td className="px-3 py-3.5 text-sm font-semibold text-ink">{c.category}</td>
                      <td className="px-3 py-3.5 text-sm text-ink-secondary">{c.skus}</td>
                      <td className="px-3 py-3.5 text-sm text-ink-secondary">
                        {formatNumber(c.units)}
                      </td>
                      <td className="px-3 py-3.5 text-sm">{formatCurrency(c.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
