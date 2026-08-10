/**
 * app/api/auth/[...nextauth]/route.ts — Rota catch-all exigida pelo NextAuth
 * (Auth.js) para login/logout/sessão. A configuração real fica em auth.ts,
 * na raiz do projeto. Caminho fixo pela própria convenção do NextAuth.
 */
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
