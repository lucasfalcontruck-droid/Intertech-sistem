"use client";

import { usePathname } from "next/navigation";
import { IconSearch, IconBell } from "@/components/ui/icons";
import { initials } from "@/lib/utils";

/**
 * components/layout/topbar.tsx — Barra superior: título/subtítulo derivados
 * da rota atual, busca e avatar do usuário logado.
 */
const TITLES: Record<string, [string, string]> = {
  "/dashboard": ["Dashboard", "Visão geral do negócio"],
  "/marketplace": ["Marketplace", "Integrações e canais de venda conectados"],
  "/estoque": ["Estoque", "Controle de produtos e níveis de reposição"],
  "/financeiro": ["Financeiro", "Fluxo de caixa, contas e resultado do período"],
  "/pedidos": ["Pedidos", "Todos os pedidos de todas as plataformas"],
  "/relatorios": ["Relatórios", "Relatórios consolidados da operação"],
  "/cadastros": ["Cadastros", "Cadastro de clientes e fornecedores"],
  "/configuracoes": ["Configurações", "Dados da empresa, usuários e integrações"],
};

function todayLabel() {
  const today = new Date();
  const label = today.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function Topbar({ user }: { user: { name: string } }) {
  const pathname = usePathname();
  const match = Object.keys(TITLES).find((key) => pathname?.startsWith(key));
  const [title, subtitle] = match ? TITLES[match] : ["Dashboard", "Visão geral do negócio"];
  const isDashboard = match === "/dashboard";

  return (
    <header className="flex items-center justify-between border-b border-border bg-white/[0.01] px-8 py-5">
      <div>
        <h1 className="text-[22px] font-bold text-ink">{title}</h1>
        <div className="mt-0.5 text-[12.5px] text-ink-secondary">
          {isDashboard ? `${todayLabel()} · ${subtitle}` : subtitle}
        </div>
      </div>
      <div className="flex items-center gap-3.5">
        <div className="flex w-[230px] items-center gap-2 rounded-[10px] border border-border bg-card px-3.5 py-2">
          <IconSearch className="h-[15px] w-[15px] shrink-0 text-ink-muted" />
          <input
            placeholder="Buscar pedido, produto..."
            className="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-muted"
          />
        </div>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-[10px] border border-border bg-card text-ink-secondary">
          <span className="absolute right-1.5 top-1.5 h-[7px] w-[7px] rounded-full border-[1.5px] border-app bg-danger" />
          <IconBell className="h-4 w-4" />
        </button>
        <div className="bg-accent-gradient flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-bold text-white">
          {initials(user.name)}
        </div>
      </div>
    </header>
  );
}
