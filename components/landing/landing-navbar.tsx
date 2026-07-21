import Link from "next/link";
import { Logo } from "@/components/ui/logo";

const NAV_LINKS = [
  { href: "#modulos", label: "Módulos" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#contato", label: "Contato" },
];

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-app/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[13.5px] font-medium text-ink-secondary transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <Link
          href="/login"
          className="bg-accent-gradient shadow-accent flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[13px] font-semibold text-white transition-transform hover:scale-[1.03]"
        >
          Conecte-se
        </Link>
      </div>
    </header>
  );
}
