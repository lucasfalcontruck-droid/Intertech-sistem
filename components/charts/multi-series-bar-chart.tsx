"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/** components/charts/multi-series-bar-chart.tsx — Gráfico de barras com múltiplas séries (várias colunas por categoria). */
interface Series {
  key: string;
  label: string;
  color: string;
}

interface Props {
  data: Record<string, string | number>[];
  xKey: string;
  series: Series[];
  formatter?: (value: number) => string;
}

export function MultiSeriesBarChart({ data, xKey, series, formatter = (v) => String(v) }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} barGap={4}>
        <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={{ fill: "#a79fc7", fontSize: 11.5 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#a79fc7", fontSize: 11.5 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatter}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="rounded-xl border border-border bg-card-2 px-3.5 py-2.5 text-xs shadow-lg">
                <div className="mb-1.5 font-semibold text-ink">{label}</div>
                <div className="flex flex-col gap-0.5">
                  {payload.map((p, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-ink-secondary">
                      <span
                        className="h-[7px] w-[7px] rounded-full"
                        style={{ background: p.color }}
                      />
                      {p.name}: {formatter(Number(p.value))}
                    </div>
                  ))}
                </div>
              </div>
            );
          }}
        />
        <Legend
          iconType="circle"
          iconSize={9}
          wrapperStyle={{ fontSize: 12, color: "#a79fc7", paddingTop: 12 }}
        />
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[6, 6, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
