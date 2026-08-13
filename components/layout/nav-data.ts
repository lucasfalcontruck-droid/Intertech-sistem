import {
  IconDashboard,
  IconMarketplace,
  IconBox,
  IconFinanceiro,
  IconOrders,
  IconReports,
  IconSettings,
  IconUsers,
} from "@/components/ui/icons";

/** components/layout/nav-data.ts — Fonte única da navegação: seções, sub-páginas e a frase de contexto de cada uma. Usado pela Sidebar (rail + painel) e pelo Topbar (título + propósito). */
export type NavItem = { href: string; label: string; desc: string };
export type NavSection = {
  key: string;
  href: string;
  label: string;
  icon: typeof IconDashboard;
  purpose: string;
  items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    key: "dashboard",
    href: "/dashboard",
    label: "Dashboard",
    icon: IconDashboard,
    purpose: "Visão geral do negócio: vendas, estoque e financeiro num só lugar.",
    items: [
      { href: "/dashboard", label: "Visão geral", desc: "Resumo do dia: vendas, pedidos e o que precisa de atenção." },
      { href: "/dashboard/painel-ao-vivo", label: "Painel ao vivo", desc: "Vendas chegando em tempo real, conforme acontecem." },
      { href: "/dashboard/vendas-semanais", label: "Vendas semanais", desc: "Comparativo de vendas por loja, semana a semana." },
      { href: "/dashboard/resumo-empresa", label: "Resumo por empresa", desc: "Consolidado por empresa/CNPJ, se você tem mais de uma." },
    ],
  },
  {
    key: "marketplace",
    href: "/marketplace",
    label: "Marketplace",
    icon: IconMarketplace,
    purpose: "Suas lojas conectadas — Mercado Livre, Shopee, TikTok Shop — e o desempenho de cada uma.",
    items: [
      { href: "/marketplace", label: "Visão geral", desc: "Status das integrações e comparativo entre canais." },
      { href: "/marketplace/anuncios", label: "Anúncios", desc: "Todos os anúncios ativos, por plataforma." },
      { href: "/marketplace/criar-anuncio", label: "Criar anúncio", desc: "Publicar um produto novo num canal de venda." },
      { href: "/marketplace/campanhas", label: "Campanhas", desc: "Promoções e campanhas de mídia em andamento." },
      { href: "/marketplace/devolucoes", label: "Devoluções", desc: "Pedidos devolvidos ou com reclamação aberta." },
    ],
  },
  {
    key: "estoque",
    href: "/estoque",
    label: "Estoque",
    icon: IconBox,
    purpose: "O que você tem pra vender agora, e o que está acabando antes que vire problema.",
    items: [
      { href: "/estoque", label: "Visão geral", desc: "Resumo de SKUs, valor total em estoque e alertas." },
      { href: "/estoque/categoria", label: "Estoque por categoria", desc: "Giro de produtos agrupado por categoria." },
      { href: "/estoque/acabado", label: "Estoque acabado", desc: "Produtos prontos, embalados, disponíveis pra venda." },
      { href: "/estoque/insumo", label: "Estoque de insumo", desc: "Matéria-prima e componentes usados na produção." },
    ],
  },
  {
    key: "financeiro",
    href: "/financeiro",
    label: "Financeiro",
    icon: IconFinanceiro,
    purpose: "Dinheiro que entra, dinheiro que sai, e quanto sobra no fim do mês.",
    items: [
      { href: "/financeiro", label: "Visão geral", desc: "Fluxo de caixa, contas e resultado do período." },
      { href: "/financeiro/contas-a-pagar", label: "Contas a pagar", desc: "O que você deve, e quando vence." },
      { href: "/financeiro/contas-a-receber", label: "Contas a receber", desc: "O que está pra entrar, e de quem." },
      { href: "/financeiro/custos", label: "Custos fixos e variáveis", desc: "Despesas recorrentes da operação." },
    ],
  },
  {
    key: "pedidos",
    href: "/pedidos",
    label: "Pedidos",
    icon: IconOrders,
    purpose: "Todos os pedidos, de todas as plataformas, num lugar só — sem alternar entre painéis.",
    items: [
      { href: "/pedidos", label: "Visão geral", desc: "Lista completa de pedidos, com filtro por status e loja." },
      { href: "/pedidos/compra-insumo", label: "Compra de insumo", desc: "Pedidos de compra de matéria-prima a fornecedores." },
      { href: "/pedidos/compra-produto", label: "Compra de produto", desc: "Pedidos de reposição de produto acabado." },
      { href: "/pedidos/data-pedido", label: "Data pedido", desc: "Busca de pedidos por data ou período específico." },
    ],
  },
  {
    key: "relatorios",
    href: "/relatorios",
    label: "Relatórios",
    icon: IconReports,
    purpose: "Análises mais a fundo sobre lucro, ticket médio e desempenho — pra decisões, não só acompanhamento.",
    items: [
      { href: "/relatorios", label: "Visão geral", desc: "Ponto de partida pros relatórios disponíveis." },
      { href: "/relatorios/lucros", label: "Relatório de lucros", desc: "Lucro líquido detalhado por período." },
      { href: "/relatorios/lucratividade", label: "Lucratividade por loja", desc: "Qual canal realmente dá mais retorno." },
      { href: "/relatorios/ticket-medio", label: "Ticket médio", desc: "Evolução do valor médio por pedido." },
      { href: "/relatorios/desempenho-lojas", label: "Desempenho por loja", desc: "Comparativo entre lojas conectadas." },
      { href: "/relatorios/vendas-por-anuncio", label: "Vendas por anúncio", desc: "Quais anúncios mais vendem." },
      { href: "/relatorios/venda-por-estado", label: "Venda por estado", desc: "Distribuição geográfica das vendas." },
    ],
  },
  {
    key: "cadastros",
    href: "/cadastros",
    label: "Cadastros",
    icon: IconUsers,
    purpose: "Seus clientes e fornecedores — os dados que outras telas do sistema usam.",
    items: [
      { href: "/cadastros/clientes", label: "Clientes", desc: "Base de clientes da empresa." },
      { href: "/cadastros/fornecedores", label: "Fornecedores", desc: "Fornecedores de insumo e produto." },
    ],
  },
  {
    key: "configuracoes",
    href: "/configuracoes",
    label: "Configurações",
    icon: IconSettings,
    purpose: "Dados da empresa, usuários com acesso, e as integrações conectadas.",
    items: [],
  },
];

export function isSectionActive(section: NavSection, pathname: string | null) {
  if (!pathname) return false;
  return pathname === section.href || pathname.startsWith(`${section.href}/`);
}

export function getActiveSection(pathname: string | null): NavSection | undefined {
  return NAV_SECTIONS.find((s) => isSectionActive(s, pathname));
}

export function getPageInfo(pathname: string | null): { title: string; purpose: string } {
  const section = getActiveSection(pathname);
  if (!section) return { title: "Dashboard", purpose: NAV_SECTIONS[0].purpose };

  const exactItem = section.items.find((it) => it.href === pathname);
  if (exactItem) return { title: exactItem.label === "Visão geral" ? section.label : exactItem.label, purpose: exactItem.desc };

  return { title: section.label, purpose: section.purpose };
}
