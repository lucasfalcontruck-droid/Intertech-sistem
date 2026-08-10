/** components/ui/badge.tsx — Etiqueta colorida com bolinha (ex.: status de estoque/pagamento). */
import { cn } from "@/lib/utils";

export type BadgeVariant = "ok" | "low" | "out" | "pending" | "paid";

const variantStyles: Record<BadgeVariant, string> = {
  ok: "bg-success/12 text-success",
  low: "bg-warning/14 text-warning",
  out: "bg-danger/12 text-danger",
  pending: "bg-white/8 text-ink-secondary",
  paid: "bg-success/12 text-success",
};

const dotStyles: Record<BadgeVariant, string> = {
  ok: "bg-success",
  low: "bg-warning",
  out: "bg-danger",
  pending: "bg-ink-secondary",
  paid: "bg-success",
};

export function Badge({ variant, children }: { variant: BadgeVariant; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold",
        variantStyles[variant],
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotStyles[variant])} />
      {children}
    </span>
  );
}
