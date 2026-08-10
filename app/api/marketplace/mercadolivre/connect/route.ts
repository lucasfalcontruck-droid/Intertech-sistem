import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { buildAuthorizeUrl } from "@/lib/marketplace/mercadolivre-client";

const STATE_COOKIE = "ml_oauth_state";

/**
 * app/api/marketplace/mercadolivre/connect/route.ts — Passo 1 do OAuth do
 * Mercado Livre: gera um "state" anti-CSRF, salva num cookie httpOnly e
 * redireciona o vendedor para o login/autorização do Mercado Livre.
 */

/** Inicia o fluxo de autorização OAuth com o Mercado Livre. */
export async function GET(req: NextRequest) {
  let authorizeUrl: string;
  try {
    const state = randomUUID();
    authorizeUrl = buildAuthorizeUrl(state);

    const res = NextResponse.redirect(authorizeUrl);
    res.cookies.set(STATE_COOKIE, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });
    return res;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao iniciar conexão.";
    const url = new URL("/marketplace", req.nextUrl.origin);
    url.searchParams.set("ml_error", message);
    return NextResponse.redirect(url);
  }
}
