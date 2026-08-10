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
import type { Platform } from "@prisma/client";
import { PLATFORM_COLOR, PLATFORM_LABEL } from "@/components/ui/platform-chip";
import { CurrencyTooltip } from "./chart-tooltip";

/** components/charts/platform-bar-chart.tsx — Gráfico de barras comparando vendas por plataforma (ML/Shopee/TikTok). */
import { formatCompactCurrency } from "@/lib/utils";

interface Props {
  data: ({ week: string } & Record<Platform, number>)[];
}

export function PlatformBarChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} barGap={4}>
        <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="week"
          tick={{ fill: "#a79fc7", fontSize: 11.5 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#a79fc7", fontSize: 11.5 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatCompactCurrency(v)}
        />
        <Tooltip content={<CurrencyTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Legend
          iconType="circle"
          iconSize={9}
          wrapperStyle={{ fontSize: 12, color: "#a79fc7", paddingTop: 12 }}
        />
        <Bar
          dataKey="MERCADO_LIVRE"
          name={PLATFORM_LABEL.MERCADO_LIVRE}
          fill={PLATFORM_COLOR.MERCADO_LIVRE}
          radius={[6, 6, 0, 0]}
        />
        <Bar
          dataKey="SHOPEE"
          name={PLATFORM_LABEL.SHOPEE}
          fill={PLATFORM_COLOR.SHOPEE}
          radius={[6, 6, 0, 0]}
        />
        <Bar
          dataKey="TIKTOK_SHOP"
          name={PLATFORM_LABEL.TIKTOK_SHOP}
          fill={PLATFORM_COLOR.TIKTOK_SHOP}
          radius={[6, 6, 0, 0]}
        />
        <Bar
          dataKey="VENDEDOR_RUA"
          name={PLATFORM_LABEL.VENDEDOR_RUA}
          fill={PLATFORM_COLOR.VENDEDOR_RUA}
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
