"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Platform } from "@prisma/client";
import { PLATFORM_COLOR, PLATFORM_LABEL } from "@/components/ui/platform-chip";
import { CurrencyTooltip } from "./chart-tooltip";

/** components/charts/platform-line-chart.tsx — Gráfico de linhas com a evolução de vendas por plataforma ao longo do tempo. */
import { formatCompactCurrency } from "@/lib/utils";

interface Props {
  data: ({ month: string } & Record<Platform, number>)[];
}

export function PlatformLineChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="month"
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
        <Tooltip content={<CurrencyTooltip />} />
        <Legend
          iconType="circle"
          iconSize={9}
          wrapperStyle={{ fontSize: 12, color: "#a79fc7", paddingTop: 12 }}
        />
        <Line
          type="monotone"
          dataKey="MERCADO_LIVRE"
          name={PLATFORM_LABEL.MERCADO_LIVRE}
          stroke={PLATFORM_COLOR.MERCADO_LIVRE}
          strokeWidth={2.5}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="SHOPEE"
          name={PLATFORM_LABEL.SHOPEE}
          stroke={PLATFORM_COLOR.SHOPEE}
          strokeWidth={2.5}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="TIKTOK_SHOP"
          name={PLATFORM_LABEL.TIKTOK_SHOP}
          stroke={PLATFORM_COLOR.TIKTOK_SHOP}
          strokeWidth={2.5}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="VENDEDOR_RUA"
          name={PLATFORM_LABEL.VENDEDOR_RUA}
          stroke={PLATFORM_COLOR.VENDEDOR_RUA}
          strokeWidth={2.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
