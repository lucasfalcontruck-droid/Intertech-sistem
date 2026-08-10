/**
 * lib/integrations/vendedor-auth.ts — Autenticação do app do Vendedor de Rua
 * (intertech-app-main). É outro aplicativo conversando com o back-end, não
 * uma pessoa logada no navegador — por isso usa uma chave secreta fixa no
 * header, em vez de sessão do NextAuth. As rotas em app/api/integrations/
 * vendedor/ são liberadas no middleware.ts justamente para aceitar esse tipo
 * de autenticação em vez de exigir login.
 */
import type { NextRequest } from "next/server";

const HEADER_NAME = "x-vendedor-api-key";

/** Confere se a requisição trouxe a chave secreta correta no header. */
export function isValidVendedorApiKey(req: NextRequest): boolean {
  const expected = process.env.VENDEDOR_APP_API_KEY;
  if (!expected) return false;
  const provided = req.headers.get(HEADER_NAME);
  return provided === expected;
}
