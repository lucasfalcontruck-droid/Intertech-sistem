import { IconRevenue, IconOrders, IconTrendUp } from "@/components/ui/icons";

/** components/landing/hero-visual.tsx — Ilustração animada do topo da landing page. */
function PlusGrid() {
  return (
    <div className="grid grid-cols-5 gap-2.5 text-white/15" aria-hidden>
      {Array.from({ length: 20 }).map((_, i) => (
        <span key={i} className="text-sm leading-none">
          +
        </span>
      ))}
    </div>
  );
}

export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -right-8 -top-10 hidden sm:block">
        <PlusGrid />
      </div>

      {/* Device frame: stylized dashboard preview */}
      <div className="relative rounded-2xl border border-border bg-card p-4 shadow-2xl">
        <div className="mb-3 flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-danger/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
          <span className="ml-2 text-[10px] font-medium text-ink-muted">
            app.intertech.com/dashboard
          </span>
        </div>

        <div className="mb-3 grid grid-cols-3 gap-2">
          {[
            { label: "Vendas", value: "R$ 48,9k" },
            { label: "Pedidos", value: "312" },
            { label: "Ticket", value: "R$ 156" },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-lg border border-border bg-card-2 p-2.5">
              <div className="text-[9px] uppercase tracking-wide text-ink-muted">{kpi.label}</div>
              <div className="mt-1 text-[13px] font-bold text-ink">{kpi.value}</div>
            </div>
          ))}
        </div>

        <div className="flex h-24 items-end gap-2 rounded-lg border border-border bg-card-2 p-3">
          {[40, 65, 50, 80, 60, 95, 70].map((h, i) => (
            <div
              key={i}
              className="bg-accent-gradient flex-1 rounded-t"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      {/* Floating card: vendas trend */}
      <div
        className="animate-float absolute -left-8 top-6 flex items-center gap-2.5 rounded-xl border border-border bg-card-2 px-3.5 py-2.5 shadow-xl"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 text-[#a68bff]">
          <IconRevenue className="h-4 w-4" />
        </div>
        <div>
          <div className="text-[10px] text-ink-muted">Vendas hoje</div>
          <div className="flex items-center gap-1 text-[12.5px] font-bold text-success">
            ▲ 12,4%
          </div>
        </div>
      </div>

      {/* Floating card: platform chips */}
      <div
        className="animate-float absolute -bottom-6 left-2 flex flex-col gap-1.5 rounded-xl border border-border bg-card-2 px-3.5 py-3 shadow-xl"
        style={{ animationDelay: "1.1s" }}
      >
        <div className="text-[10px] text-ink-muted">Canais conectados</div>
        <div className="flex gap-1.5">
          <span className="rounded-md bg-ml px-2 py-0.5 text-[10px] font-bold text-black">ML</span>
          <span className="rounded-md bg-shopee px-2 py-0.5 text-[10px] font-bold text-white">
            SP
          </span>
          <span className="rounded-md border border-tiktok bg-[#111] px-2 py-0.5 text-[10px] font-bold text-white">
            TT
          </span>
        </div>
      </div>

      {/* Floating card: pedido enviado */}
      <div
        className="animate-float absolute -right-6 bottom-16 flex items-center gap-2.5 rounded-xl border border-border bg-card-2 px-3.5 py-2.5 shadow-xl"
        style={{ animationDelay: "0.6s" }}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 text-[#a68bff]">
          <IconOrders className="h-4 w-4" />
        </div>
        <div>
          <div className="text-[10px] text-ink-muted">Pedido #78421</div>
          <div className="flex items-center gap-1 text-[11.5px] font-bold text-ink">
            <IconTrendUp className="h-3 w-3 text-success" />
            Entregue
          </div>
        </div>
      </div>
    </div>
  );
}
