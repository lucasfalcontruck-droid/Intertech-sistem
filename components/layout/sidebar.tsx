"use client";

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
} from "@/components/ui/icons";
import { cn, initials } from "@/lib/utils";

const mainNav = [
  { href: "/dashboard", label: "Dashboard", icon: IconDashboard },
  { href: "/marketplace", label: "Marketplace", icon: IconMarketplace },
  { href: "/estoque", label: "Estoque", icon: IconBox },
  { href: "/financeiro", label: "Financeiro", icon: IconFinanceiro },
];

const otherNav = [
  { href: "/pedidos", label: "Pedidos", icon: IconOrders },
  { href: "/relatorios", label: "Relatórios", icon: IconReports },
  { href: "/configuracoes", label: "Configurações", icon: IconSettings },
];

export function Sidebar({ user }: { user: { name: string; role: string } }) {
  const pathname = usePathname();

  return (
    <aside className="bg-sidebar-gradient sticky top-0 flex h-screen w-[250px] min-w-[250px] flex-col border-r border-white/6 px-4 py-6">
      <div className="mb-4 flex items-center gap-2.5 border-b border-white/10 px-2 pb-6">
        <Logo />
      </div>

      <div className="px-3 pb-2 pt-3.5 text-[10px] font-semibold uppercase tracking-wider text-white/35">
        Principal
      </div>
      <nav className="flex flex-col gap-0.5">
        {mainNav.map((item) => {
          const active = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-[11px] rounded-[10px] border-l-[3px] border-transparent px-3 py-2.5 text-[13.5px] font-medium text-white/72 transition-colors hover:bg-white/8 hover:text-white",
                active && "border-l-white bg-white/14 text-white",
              )}
            >
              <Icon className="h-[17px] w-[17px] shrink-0 opacity-85" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-2 pt-3.5 text-[10px] font-semibold uppercase tracking-wider text-white/35">
        Outros
      </div>
      <nav className="flex flex-col gap-0.5">
        {otherNav.map((item) => {
          const active = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-[11px] rounded-[10px] border-l-[3px] border-transparent px-3 py-2.5 text-[13.5px] font-medium text-white/72 transition-colors hover:bg-white/8 hover:text-white",
                active && "border-l-white bg-white/14 text-white",
              )}
            >
              <Icon className="h-[17px] w-[17px] shrink-0 opacity-85" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="mt-auto flex cursor-pointer items-center gap-2.5 rounded-xl bg-black/25 px-3.5 py-3.5 text-left transition-colors hover:bg-black/40"
      >
        <div className="bg-accent-gradient flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white">
          {initials(user.name)}
        </div>
        <div className="min-w-0">
          <div className="truncate text-[12.5px] font-semibold text-white">{user.name}</div>
          <div className="truncate text-[11px] text-white/50">{user.role}</div>
        </div>
      </button>
    </aside>
  );
}
