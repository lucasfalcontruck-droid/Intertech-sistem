"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { KpiCard } from "@/components/ui/kpi-card";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { IconRevenue, IconTrendUp, IconTicket } from "@/components/ui/icons";
import { useLucrosMensal } from "@/hooks/relatorios/use-relatorios";
import { formatCurrency, formatPercent } from "@/lib/utils";

/** app/(app)/relatorios/lucros/page.tsx — Lucro mensal consolidado da empresa. */
export default function RelatorioLucrosPage() {
  const { data, isLoading, isError, error } = useLucrosMensal();
  const months = data?.months ?? [];
  const last = months[months.length - 1];
  const margin = last && last.revenue > 0 ? (last.profit / last.revenue) * 100 : 0;

  return (
    <div>
      <PageHeader title="Relatório de lucros" subtitle="Lucro consolidado da empresa" />

      {isLoading && <LoadingState label="Carregando relatório de lucros..." />}
      {isError && <ErrorState message={error?.message ?? "Erro ao carregar o relatório."} />}

      {data && last && (
        <>
          <div className="mb-5 grid grid-cols-3 gap-4">
            <KpiCard
              icon={<IconRevenue className="h-[19px] w-[19px]" />}
              value={formatCurrency(last.revenue)}
              label="Receita (mês atual)"
            />
            <KpiCard
              icon={<IconTrendUp className="h-[19px] w-[19px]" />}
              value={formatCurrency(last.profit)}
              label="Lucro líquido (mês atual)"
            />
            <KpiCard
              icon={<IconTicket className="h-[19px] w-[19px]" />}
              value={formatPercent(margin)}
              label="Margem líquida"
            />
          </div>

          <Card>
            <CardHeader title="Evolução do lucro" subtitle="Últimos 6 meses" />
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  {["Mês", "Receita", "Custos", "Lucro"].map((h) => (
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
                {months.map((m) => (
                  <tr key={m.month} className="border-b border-white/4 last:border-none">
                    <td className="px-3 py-3.5 text-sm font-semibold text-ink">{m.month}</td>
                    <td className="px-3 py-3.5 text-sm">{formatCurrency(m.revenue)}</td>
                    <td className="px-3 py-3.5 text-sm text-ink-secondary">
                      {formatCurrency(m.costs)}
                    </td>
                    <td className="px-3 py-3.5 text-sm font-bold text-success">
                      {formatCurrency(m.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
