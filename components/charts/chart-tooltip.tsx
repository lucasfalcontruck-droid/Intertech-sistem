import { formatCurrency } from "@/lib/utils";

interface TooltipPayloadItem {
  name?: string;
  value?: number;
  color?: string;
}

export function CurrencyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-border bg-card-2 px-3.5 py-2.5 text-xs shadow-lg">
      {label && <div className="mb-1.5 font-semibold text-ink">{label}</div>}
      <div className="flex flex-col gap-1">
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
            <span className="text-ink-secondary">{item.name}</span>
            <span className="ml-auto font-semibold text-ink">
              {formatCurrency(item.value ?? 0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
