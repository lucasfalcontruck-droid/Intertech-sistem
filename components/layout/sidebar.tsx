"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Logo } from "@/components/ui/logo";
import { IconLogout, IconChevronDown } from "@/components/ui/icons";
import { NAV_SECTIONS, isSectionActive, getActiveSection } from "@/components/layout/nav-data";
import { cn, initials } from "@/lib/utils";

/**
 * components/layout/sidebar.tsx — Navegação em duas partes: uma barra estreita
 * só com ícones (retrátil, com opção de expandir mostrando os nomes) e, ao
 * lado, um painel de contexto com as sub-páginas da seção ativa e uma frase
 * explicando pra que cada uma serve.
 */
export function Sidebar({ user }: { user: { name: string; role: string } }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const activeSection = getActiveSection(pathname) ?? NAV_SECTIONS[0];

  return (
    <div className="flex">
      <aside
        className={cn(
          "bg-sidebar-gradient sticky top-0 flex h-screen shrink-0 flex-col overflow-y-auto border-r border-white/6 py-5 transition-[width] duration-150",
          expanded ? "w-[214px] items-stretch px-3" : "w-[68px] items-center px-0",
        )}
      >
        <div className={cn("mb-4 flex items-center", expanded ? "justify-between px-2" : "flex-col gap-2")}>
          {expanded ? (
            <Logo height={22} />
          ) : (
            <Image src="/logo-icon.png" alt="intertech" width={26} height={25} priority />
          )}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Recolher menu" : "Expandir menu"}
            className={cn(
              "flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] bg-white/8 text-white/65 hover:bg-white/14 hover:text-white",
              !expanded && "mt-1",
            )}
          >
            <IconChevronDown
              className={cn("h-3 w-3 -rotate-90 transition-transform duration-150", expanded && "rotate-90")}
            />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_SECTIONS.map((section) => {
            const Icon = section.icon;
            const active = isSectionActive(section, pathname);
            return (
              <Link
                key={section.key}
                href={section.href}
                title={section.label}
                className={cn(
                  "flex h-10 shrink-0 items-center gap-[11px] rounded-[11px] text-white/60 hover:bg-white/8 hover:text-white/90",
                  expanded ? "w-full px-[10px]" : "w-10 justify-center px-0",
                  active && "bg-white/14 text-white",
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {expanded && <span className="truncate text-[13px] font-medium">{section.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex items-center gap-2.5 pt-3">
          <div className="bg-accent-gradient flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white">
            {initials(user.name)}
          </div>
          {expanded && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-semibold text-white">{user.name}</div>
              <div className="truncate text-[10.5px] text-white/50">{user.role}</div>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sair"
            aria-label="Sair"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-white/55 transition-colors hover:bg-white/10 hover:text-white"
          >
            <IconLogout className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {activeSection.items.length > 0 && (
        <aside className="hidden w-[236px] shrink-0 px-3 pt-5 lg:block">
          <nav className="sticky top-5 flex flex-col gap-0.5 rounded-2xl border border-border bg-card-2 p-2">
            {activeSection.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-xl px-3 py-2.5 hover:bg-card",
                    isActive && "bg-card",
                  )}
                >
                  <p className={cn("text-[12.5px] font-semibold", isActive ? "text-[#c3b4ff]" : "text-ink")}>
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">{item.desc}</p>
                </Link>
              );
            })}
          </nav>
        </aside>
      )}
    </div>
  );
}
