import { DeviceFrame } from "./device-frame";
import { Badge } from "@/components/ui/badge";
import { PlatformChip } from "@/components/ui/platform-chip";
import { Platform } from "@prisma/client";

/** components/landing/feature-mockups.tsx — Mockups estáticos (dados fictícios) de telas do sistema, exibidos na landing page. */
export function MarketplaceMockup() {
  const rows = [
    { platform: Platform.MERCADO_LIVRE, sales: "R$ 218.400", orders: "1.428" },
    { platform: Platform.SHOPEE, sales: "R$ 155.600", orders: "2.014" },
    { platform: Platform.TIKTOK_SHOP, sales: "R$ 112.200", orders: "986" },
  ];

  return (
    <DeviceFrame path="app.intertech.com/marketplace">
      <div className="flex flex-col gap-2.5">
        {rows.map((row) => (
          <div
            key={row.platform}
            className="flex items-center justify-between rounded-lg border border-border bg-card-2 px-3 py-2.5"
          >
            <div className="flex items-center gap-2.5">
              <PlatformChip platform={row.platform} short />
              <span className="flex items-center gap-1 text-[10px] font-semibold text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Conectado
              </span>
            </div>
            <div className="text-right">
              <div className="text-[12px] font-bold text-ink">{row.sales}</div>
              <div className="text-[9.5px] text-ink-muted">{row.orders} pedidos</div>
            </div>
          </div>
        ))}
      </div>
    </DeviceFrame>
  );
}

export function FinanceiroMockup() {
  const bars = [
    { entradas: 60, saidas: 40 },
    { entradas: 68, saidas: 44 },
    { entradas: 72, saidas: 48 },
    { entradas: 80, saidas: 50 },
    { entradas: 88, saidas: 54 },
    { entradas: 100, saidas: 58 },
  ];

  return (
    <DeviceFrame path="app.intertech.com/financeiro">
      <div className="mb-3 grid grid-cols-3 gap-2">
        {[
          { label: "Receita", value: "R$ 486k", color: "text-ink" },
          { label: "Despesas", value: "R$ 319k", color: "text-ink" },
          { label: "Lucro", value: "R$ 167k", color: "text-success" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-lg border border-border bg-card-2 p-2.5">
            <div className="text-[9px] uppercase tracking-wide text-ink-muted">{kpi.label}</div>
            <div className={`mt-1 text-[12px] font-bold ${kpi.color}`}>{kpi.value}</div>
          </div>
        ))}
      </div>
      <div className="flex h-24 items-end gap-2.5 rounded-lg border border-border bg-card-2 p-3">
        {bars.map((bar, i) => (
          <div key={i} className="flex h-full flex-1 items-end gap-0.5">
            <div
              className="flex-1 rounded-t bg-success/70"
              style={{ height: `${bar.entradas}%` }}
            />
            <div className="flex-1 rounded-t bg-danger/70" style={{ height: `${bar.saidas}%` }} />
          </div>
        ))}
      </div>
    </DeviceFrame>
  );
}

export function EstoqueMockup() {
  const rows = [
    { name: "Fone Bluetooth X200", stock: "4 un.", variant: "low" as const },
    { name: "Carregador USB-C 20W", stock: "0 un.", variant: "out" as const },
    { name: "Mouse Sem Fio Slim", stock: "142 un.", variant: "ok" as const },
  ];

  return (
    <DeviceFrame path="app.intertech.com/estoque">
      <div className="flex flex-col gap-2.5">
        {rows.map((row) => (
          <div
            key={row.name}
            className="flex items-center justify-between rounded-lg border border-border bg-card-2 px-3 py-2.5"
          >
            <span className="text-[11.5px] font-medium text-ink">{row.name}</span>
            <Badge variant={row.variant}>{row.stock}</Badge>
          </div>
        ))}
      </div>
    </DeviceFrame>
  );
}
