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
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-[18px]">
      <div
        aria-hidden
        className="bg-accent-gradient absolute -right-[30px] -top-[30px] h-[90px] w-[90px] rounded-full opacity-[0.12]"
      />
      <div className="relative mb-3.5 flex items-center justify-between">
        <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[11px] bg-accent/15 text-[#a68bff]">
          {icon}
        </div>
        {trend && (
          <span
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-[3px] text-[11.5px] font-bold",
              trend.direction === "up" ? "bg-success/12 text-success" : "bg-danger/12 text-danger",
            )}
          >
            ▲ {trend.label}
          </span>
        )}
      </div>
      <div className="relative mb-1 text-2xl font-extrabold text-ink">{value}</div>
      <div className="relative text-[12.5px] text-ink-secondary">{label}</div>
    </div>
  );
}
