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
import { CurrencyTooltip } from "./chart-tooltip";
import { formatCompactCurrency } from "@/lib/utils";

/** components/charts/cash-flow-chart.tsx — Gráfico de barras entradas x saídas (fluxo de caixa mensal). */

interface Props {
  data: { month: string; entradas: number; saidas: number }[];
}

export function CashFlowChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} barGap={4}>
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
        <Tooltip content={<CurrencyTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Legend
          iconType="circle"
          iconSize={9}
          wrapperStyle={{ fontSize: 12, color: "#a79fc7", paddingTop: 12 }}
        />
        <Bar dataKey="entradas" name="Entradas" fill="#22c55e" radius={[6, 6, 0, 0]} />
        <Bar dataKey="saidas" name="Saídas" fill="#f43f5e" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
