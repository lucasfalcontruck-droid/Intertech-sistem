"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatNumber } from "@/lib/utils";

/** components/charts/category-bar-chart.tsx — Gráfico de barras horizontais de unidades vendidas por categoria. */
interface Props {
  data: { category: string; units: number }[];
}

export function CategoryBarChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: "#a79fc7", fontSize: 11.5 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="category"
          tick={{ fill: "#a79fc7", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={100}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const item = payload[0];
            return (
              <div className="rounded-xl border border-border bg-card-2 px-3.5 py-2.5 text-xs shadow-lg">
                <span className="font-semibold text-ink">
                  {formatNumber(Number(item.value))} un.
                </span>
              </div>
            );
          }}
        />
        <Bar dataKey="units" fill="#7c5cff" radius={[0, 6, 6, 0]} barSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}
