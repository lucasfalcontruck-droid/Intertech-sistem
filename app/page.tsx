import Link from "next/link";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroVisual } from "@/components/landing/hero-visual";
import { Logo } from "@/components/ui/logo";
import { IconDashboard, IconMarketplace, IconBox, IconFinanceiro } from "@/components/ui/icons";

const MODULES = [
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
];

const STEPS = [
  {
    step: "01",
    title: "Conecte seus canais",
    description: "Integre Mercado Livre, Shopee e TikTok Shop em minutos.",
  },
  {
    step: "02",
    title: "Acompanhe em tempo real",
    description: "Vendas, estoque e financeiro consolidados automaticamente.",
  },
  {
    step: "03",
    title: "Decida com dados",
    description: "KPIs, gráficos e relatórios para guiar a operação.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <LandingNavbar />

      {/* HERO */}
      <section className="relative px-6 pb-24 pt-20">
        <div
          className="animate-blob bg-accent-gradient absolute -top-20 left-[-10%] h-80 w-80 rounded-full opacity-20 blur-3xl"
          aria-hidden
        />
        <div
          className="animate-blob absolute right-[-5%] top-40 h-72 w-72 rounded-full bg-[#4361ff] opacity-15 blur-3xl"
          style={{ animationDelay: "3s" }}
          aria-hidden
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2">
          <div className="animate-fade-in-up">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-[11.5px] font-semibold text-ink-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              ERP para operações em marketplaces
            </div>
            <h1 className="text-4xl font-extrabold leading-[1.1] text-ink sm:text-5xl">
              Gestão completa e <span className="text-gradient-accent">integrada</span> para o seu
              e-commerce
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-secondary">
              A intertech reúne vendas, estoque e financeiro do Mercado Livre, Shopee e TikTok Shop
              em uma única plataforma — simples, rápida e sob controle.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/login"
                className="bg-accent-gradient shadow-accent flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
              >
                Conecte-se
                <span aria-hidden>→</span>
              </Link>
              <a
                href="#modulos"
                className="text-sm font-semibold text-ink-secondary transition-colors hover:text-ink"
              >
                Ver módulos
              </a>
            </div>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section id="modulos" className="relative px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">
              Tudo que a operação precisa
            </h2>
            <p className="mt-3 text-[14.5px] text-ink-secondary">
              Quatro módulos, um único sistema.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {MODULES.map((mod, i) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.title}
                  className="animate-fade-in-up rounded-2xl border border-border bg-card p-6"
                  style={{ animationDelay: `${0.1 * i}s` }}
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-[#a68bff]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-[15px] font-bold text-ink">{mod.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-secondary">
                    {mod.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="como-funciona" className="relative px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">Como funciona</h2>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div
                key={s.step}
                className="animate-fade-in-up"
                style={{ animationDelay: `${0.1 * i}s` }}
              >
                <div className="bg-accent-gradient mb-4 flex h-10 w-10 items-center justify-center rounded-full text-sm font-extrabold text-white">
                  {s.step}
                </div>
                <h3 className="text-[15px] font-bold text-ink">{s.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-secondary">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / CONTACT */}
      <section id="contato" className="relative px-6 py-20">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-12 text-center">
          <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">
            Pronto para centralizar sua operação?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[14.5px] text-ink-secondary">
            Acesse o sistema com sua conta Intertech e veja tudo em um só lugar.
          </p>
          <Link
            href="/login"
            className="bg-accent-gradient shadow-accent mt-7 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
          >
            Conecte-se
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/5 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Logo />
          <p className="text-xs text-ink-muted">
            © {new Date().getFullYear()} Intertech. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
