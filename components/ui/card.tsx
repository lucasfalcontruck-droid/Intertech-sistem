import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5", className)}>{children}</div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h3 className="text-[15px] font-bold text-ink">{title}</h3>
        {subtitle && <div className="mt-0.5 text-[11.5px] text-ink-muted">{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

export function LinkButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-transparent text-[12px] font-semibold text-[#a68bff] cursor-pointer"
    >
      {children}
    </button>
  );
}
