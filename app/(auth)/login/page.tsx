import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/ui/logo";
import { GalaxyBackground } from "@/components/ui/galaxy-background";

export default function LoginPage() {
  return (
    <div className="bg-app relative flex min-h-screen overflow-hidden">
      <GalaxyBackground />

      <div className="relative z-10 hidden w-1/2 flex-col justify-between p-12 lg:flex">
        <Logo height={30} />
        <div>
          <h2 className="max-w-md text-3xl font-extrabold leading-tight text-white">
            Gestão completa dos seus canais de venda em um só lugar.
          </h2>
          <p className="mt-4 max-w-sm text-sm text-white/60">
            Vendas, estoque e financeiro do Mercado Livre, Shopee e TikTok Shop, unificados.
          </p>
        </div>
        <div className="text-xs text-white/40">© {new Date().getFullYear()} Intertech</div>
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo height={30} />
          </div>
          <div className="rounded-2xl border border-border bg-card p-8">
            <h1 className="text-xl font-bold text-ink">Entrar</h1>
            <p className="mt-1 text-[13px] text-ink-secondary">
              Acesse o ERP da Intertech com seu e-mail e senha.
            </p>
            <Suspense>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
