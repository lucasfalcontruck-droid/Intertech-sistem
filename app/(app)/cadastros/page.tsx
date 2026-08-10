import { redirect } from "next/navigation";

/** app/(app)/cadastros/page.tsx — Rota índice de Cadastros; redireciona para a subárea Clientes. */
export default function CadastrosPage() {
  redirect("/cadastros/clientes");
}
