import {
  IconDashboard,
  IconMarketplace,
  IconBox,
  IconFinanceiro,
  IconOrders,
  IconRefresh,
  IconAlertTriangle,
  IconReports,
} from "@/components/ui/icons";

/** components/landing/features-grid.tsx — Grade de cards com as funcionalidades do sistema, na landing page. */
const FEATURES = [
  {
    icon: IconDashboard,
    title: "Dashboard",
    description: "Vendas, pedidos e estoque de todos os canais em uma visão só.",
  },
  {
    icon: IconMarketplace,
    title: "Marketplace",
    description: "Mercado Livre, Shopee e TikTok Shop conectados e sincronizados.",
  },
  {
    icon: IconBox,
    title: "Estoque",
    description: "Controle de produtos, níveis mínimos e alertas de reposição.",
  },
  {
    icon: IconFinanceiro,
    title: "Financeiro",
    description: "Fluxo de caixa, contas a pagar/receber e DRE simplificado.",
  },
  {
    icon: IconOrders,
    title: "Pedidos",
    description: "Histórico completo com filtros por canal, status e cliente.",
  },
  {
    icon: IconRefresh,
    title: "Sincronização",
    description: "Vendas e repasses atualizados automaticamente por canal.",
  },
  {
    icon: IconAlertTriangle,
    title: "Alertas de estoque",
    description: "Avisos automáticos de itens em baixa ou esgotados.",
  },
  {
    icon: IconReports,
    title: "Relatórios",
    description: "Métricas consolidadas para embasar decisões rápidas.",
  },
];

export function FeaturesGrid() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">
            Mais recursos para a operação
          </h2>
          <p className="mt-3 text-[14.5px] text-ink-secondary">
            Tudo integrado, sem precisar de planilhas paralelas.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="animate-fade-in-up rounded-2xl border border-border bg-card p-6"
                style={{ animationDelay: `${0.06 * i}s` }}
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-[#a68bff]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-[15px] font-bold text-ink">{feature.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-secondary">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
