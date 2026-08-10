import { auth } from "@/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

/** app/(app)/layout.tsx — Layout do sistema logado: sidebar + topbar em volta de todas as páginas internas. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = {
    name: session?.user?.name ?? "Usuário",
    role: session?.user?.role ?? "Operador",
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} />
        <main className="flex-1 px-8 py-7">{children}</main>
      </div>
    </div>
  );
}
