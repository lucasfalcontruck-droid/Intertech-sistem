"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { PLATFORM_COLOR } from "@/components/ui/platform-chip";
import type { Platform } from "@prisma/client";

/** components/charts/platform-donut-chart.tsx — Gráfico de rosca com a participação (%) de cada plataforma no faturamento. */
interface Props {
  data: { platform: Platform; total: number; pct: number }[];
}

export function PlatformDonutChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="platform"
          innerRadius="72%"
          outerRadius="100%"
          strokeWidth={0}
        >
          {data.map((entry) => (
            <Cell key={entry.platform} fill={PLATFORM_COLOR[entry.platform]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
