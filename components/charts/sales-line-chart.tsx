"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CurrencyTooltip } from "./chart-tooltip";
import { formatCompactCurrency, formatDate } from "@/lib/utils";

interface Props {
  data: { date: string; total: number }[];
}

export function SalesLineChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c5cff" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#7c5cff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: "#736b94", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatDate(v)}
          interval={Math.floor(data.length / 7)}
        />
        <YAxis
          tick={{ fill: "#a79fc7", fontSize: 11.5 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatCompactCurrency(v)}
        />
        <Tooltip
          content={<CurrencyTooltip />}
          labelFormatter={(v) => formatDate(v as string)}
          cursor={{ stroke: "rgba(255,255,255,0.15)" }}
        />
        <Area
          type="monotone"
          dataKey="total"
          name="Vendas diárias"
          stroke="#7c5cff"
          strokeWidth={2.5}
          fill="url(#salesGradient)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
