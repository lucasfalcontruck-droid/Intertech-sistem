"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

/** components/charts/generic-bar-chart.tsx — Gráfico de barras genérico (label/value), reutilizável por qualquer área. */
interface Props {
  data: { label: string; value: number }[];
  formatter?: (value: number) => string;
  color?: string;
}

export function GenericBarChart({ data, formatter = (v) => String(v), color = "#7c5cff" }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} barGap={4}>
        <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="label"
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
                <div className="mb-1 font-semibold text-ink">{label}</div>
                <div className="text-ink-secondary">{formatter(Number(payload[0].value))}</div>
              </div>
            );
          }}
        />
        <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} barSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
