import { cn } from "@/lib/utils";

/** components/ui/hero-metric.tsx — Métrica principal de uma página: valor em destaque, com as demais reduzidas a uma linha secundária (ver KpiRow). */
export function HeroMetric({
  label,
  value,
  valueClassName,
  trend,
  note,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  trend?: { direction: "up" | "down"; label: string };
  note?: string;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-baseline gap-4 border-b border-border pb-5">
      <span className="w-full text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{label}</span>
      <span className={cn("text-[42px] font-bold leading-none tracking-tight text-ink", valueClassName)}>
        {value}
      </span>
      {trend && (
        <span
          className={cn(
            "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] font-semibold",
            trend.direction === "up" ? "bg-success/12 text-success" : "bg-danger/12 text-danger",
          )}
        >
          {trend.direction === "up" ? "↑" : "↓"} {trend.label}
        </span>
      )}
      {note && <span className="text-[12px] text-ink-muted">{note}</span>}
    </div>
  );
}

export function KpiRow({
  items,
}: {
  items: { label: string; value: string; valueClassName?: string; trend?: { direction: "up" | "down"; label: string }; flag?: string }[];
}) {
  return (
    <div className="mb-6 flex overflow-hidden rounded-2xl border border-border">
      {items.map((item, i) => (
        <div key={i} className={cn("flex-1 px-4 py-3.5", i < items.length - 1 && "border-r border-border")}>
          <p className="mb-1.5 text-[11.5px] text-ink-muted">{item.label}</p>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className={cn("text-[19px] font-semibold text-ink", item.valueClassName)}>{item.value}</span>
            {item.trend && (
              <span className={cn("text-[11px] font-semibold", item.trend.direction === "up" ? "text-success" : "text-danger")}>
                {item.trend.direction === "up" ? "↑" : "↓"} {item.trend.label}
              </span>
            )}
            {item.flag && <span className="text-[11px] font-semibold text-warning">{item.flag}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
