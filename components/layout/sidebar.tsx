"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Logo } from "@/components/ui/logo";
import {
  IconDashboard,
  IconMarketplace,
  IconBox,
  IconFinanceiro,
  IconOrders,
  IconReports,
  IconSettings,
  IconUsers,
  IconLogout,
  IconChevronDown,
} from "@/components/ui/icons";
import { cn, initials } from "@/lib/utils";

/**
 * components/layout/sidebar.tsx — Menu lateral do sistema logado: estrutura
 * de navegação por área (mainNav), com submenus expansíveis.
 */
type SubNavItem = { href: string; label: string };
type NavItem = {
  href: string;
  label: string;
  icon: typeof IconDashboard;
  children?: SubNavItem[];
};

const mainNav: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: IconDashboard,
    children: [
      { href: "/dashboard", label: "Visão geral" },
      { href: "/dashboard/painel-ao-vivo", label: "Painel ao vivo de vendas" },
      { href: "/dashboard/vendas-semanais", label: "Vendas semanais por loja" },
      { href: "/dashboard/resumo-empresa", label: "Resumo por empresa" },
    ],
  },
  {
    href: "/marketplace",
    label: "Marketplace",
    icon: IconMarketplace,
    children: [
      { href: "/marketplace", label: "Visão geral" },
      { href: "/marketplace/anuncios", label: "Anúncios" },
      { href: "/marketplace/criar-anuncio", label: "Criar anúncio" },
      { href: "/marketplace/campanhas", label: "Campanhas" },
      { href: "/marketplace/devolucoes", label: "Devoluções" },
    ],
  },
  {
    href: "/estoque",
    label: "Estoque",
    icon: IconBox,
    children: [
      { href: "/estoque", label: "Visão geral" },
      { href: "/estoque/categoria", label: "Estoque por categoria" },
      { href: "/estoque/acabado", label: "Estoque acabado" },
      { href: "/estoque/insumo", label: "Estoque de insumo" },
    ],
  },
  {
    href: "/financeiro",
    label: "Financeiro",
    icon: IconFinanceiro,
    children: [
      { href: "/financeiro", label: "Visão geral" },
      { href: "/financeiro/contas-a-pagar", label: "Contas a pagar" },
      { href: "/financeiro/contas-a-receber", label: "Contas a receber" },
      { href: "/financeiro/custos", label: "Custos fixos e variáveis" },
    ],
  },
];

const otherNav: NavItem[] = [
  {
    href: "/pedidos",
    label: "Pedidos",
    icon: IconOrders,
    children: [
      { href: "/pedidos", label: "Visão geral" },
      { href: "/pedidos/compra-insumo", label: "Pedidos de compra — Insumo" },
      { href: "/pedidos/compra-produto", label: "Pedidos de compra — Produto" },
      { href: "/pedidos/data-pedido", label: "Data pedido" },
    ],
  },
  {
    href: "/relatorios",
    label: "Relatórios",
    icon: IconReports,
    children: [
      { href: "/relatorios", label: "Visão geral" },
      { href: "/relatorios/lucros", label: "Relatório de lucros" },
      { href: "/relatorios/lucratividade", label: "Lucratividade por loja" },
      { href: "/relatorios/ticket-medio", label: "Ticket médio" },
      { href: "/relatorios/desempenho-lojas", label: "Desempenho por loja" },
      { href: "/relatorios/vendas-por-anuncio", label: "Vendas por anúncio" },
      { href: "/relatorios/venda-por-estado", label: "Venda por estado" },
    ],
  },
  {
    href: "/cadastros",
    label: "Cadastros",
    icon: IconUsers,
    children: [
      { href: "/cadastros/clientes", label: "Clientes" },
      { href: "/cadastros/fornecedores", label: "Fornecedores" },
    ],
  },
  { href: "/configuracoes", label: "Configurações", icon: IconSettings },
];

function isGroupActive(item: NavItem, pathname: string | null) {
  if (!pathname) return false;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function NavGroup({
  items,
  pathname,
  openOverrides,
  onToggle,
}: {
  items: NavItem[];
  pathname: string | null;
  openOverrides: Record<string, boolean>;
  onToggle: (href: string) => void;
}) {
  return (
    <nav className="flex flex-col gap-0.5">
      {items.map((item) => {
        const Icon = item.icon;
        const groupActive = isGroupActive(item, pathname);
        const hasChildren = Boolean(item.children?.length);
        const isOpen = hasChildren ? (openOverrides[item.href] ?? groupActive) : false;

        return (
          <div key={item.href}>
            <div
              className={cn(
                "flex items-center rounded-[10px] border-l-[3px] border-transparent transition-colors hover:bg-white/8",
                groupActive && "border-l-white bg-white/14",
              )}
            >
              <Link
                href={item.href}
                className={cn(
                  "flex flex-1 items-center gap-[11px] px-3 py-2.5 text-[13.5px] font-medium text-white/72 hover:text-white",
                  groupActive && "text-white",
                )}
              >
                <Icon className="h-[17px] w-[17px] shrink-0 opacity-85" />
                {item.label}
              </Link>
              {hasChildren && (
                <button
                  type="button"
                  onClick={() => onToggle(item.href)}
                  aria-label={isOpen ? `Recolher ${item.label}` : `Expandir ${item.label}`}
                  aria-expanded={isOpen}
                  className="flex h-8 w-8 shrink-0 items-center justify-center text-white/50 hover:text-white"
                >
                  <IconChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-150",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
              )}
            </div>

            {hasChildren && isOpen && (
              <div className="ml-[27px] mt-0.5 flex flex-col gap-0.5 border-l border-white/10 pl-3">
                {item.children!.map((sub) => {
                  const subActive = pathname === sub.href;
                  return (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={cn(
                        "rounded-lg px-2.5 py-2 text-[12.5px] font-medium text-white/60 transition-colors hover:bg-white/8 hover:text-white",
                        subActive && "bg-white/10 text-white",
                      )}
                    >
                      {sub.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export function Sidebar({ user }: { user: { name: string; role: string } }) {
  const pathname = usePathname();
  const [openOverrides, setOpenOverrides] = useState<Record<string, boolean>>({});

  function toggle(href: string) {
    setOpenOverrides((prev) => {
      const currentlyOpen =
        prev[href] ?? isGroupActive({ href } as NavItem, pathname);
      return { ...prev, [href]: !currentlyOpen };
    });
  }

  return (
    <aside className="bg-sidebar-gradient sticky top-0 flex h-screen w-[250px] min-w-[250px] flex-col overflow-y-auto border-r border-white/6 px-4 py-6">
      <div className="mb-4 flex items-center gap-2.5 border-b border-white/10 px-2 pb-6">
        <Logo />
      </div>

      <div className="px-3 pb-2 pt-3.5 text-[10px] font-semibold uppercase tracking-wider text-white/35">
        Principal
      </div>
      <NavGroup
        items={mainNav}
        pathname={pathname}
        openOverrides={openOverrides}
        onToggle={toggle}
      />

      <div className="px-3 pb-2 pt-3.5 text-[10px] font-semibold uppercase tracking-wider text-white/35">
        Outros
      </div>
      <NavGroup
        items={otherNav}
        pathname={pathname}
        openOverrides={openOverrides}
        onToggle={toggle}
      />

      <div className="mt-auto flex items-center gap-2.5 rounded-xl bg-black/25 px-3.5 py-3.5">
        <div className="bg-accent-gradient flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white">
          {initials(user.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12.5px] font-semibold text-white">{user.name}</div>
          <div className="truncate text-[11px] text-white/50">{user.role}</div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title="Sair"
          aria-label="Sair"
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <IconLogout className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
