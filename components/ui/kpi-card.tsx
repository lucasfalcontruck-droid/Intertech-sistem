/** components/ui/kpi-card.tsx — Cartão de indicador (ícone, valor, rótulo e variação) usado nos dashboards. */
import { cn } from "@/lib/utils";

export function KpiCard({
  icon,
  value,
  label,
  trend,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  trend?: { direction: "up" | "down"; label: string };
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-[18px]">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-ink-muted">{icon}</span>
        {trend && (
          <span
            className={cn(
              "text-[11.5px] font-semibold",
              trend.direction === "up" ? "text-success" : "text-danger",
            )}
          >
            {trend.direction === "up" ? "↑" : "↓"} {trend.label}
          </span>
        )}
      </div>
      <div className="mb-1 text-2xl font-extrabold text-ink">{value}</div>
      <div className="text-[12.5px] text-ink-secondary">{label}</div>
    </div>
  );
}
