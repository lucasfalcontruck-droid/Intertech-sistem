import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { buildAuthorizeUrl } from "@/lib/marketplace/tiktok-client";

const STATE_COOKIE = "tiktok_oauth_state";

/**
 * app/api/marketplace/tiktok/connect/route.ts — Passo 1 do OAuth do TikTok
 * Shop: gera um "state" anti-CSRF, salva num cookie httpOnly e redireciona
 * o vendedor pro login do TikTok Shop. O redirect_uri de volta é o
 * configurado no app em partner.tiktokshop.com, não vai por parâmetro aqui.
 */

/** Inicia o fluxo de autorização OAuth com o TikTok Shop. */
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
    const message =
      error instanceof Error ? error.message : "Erro ao iniciar conexão com o TikTok Shop.";
    const url = new URL("/marketplace", req.nextUrl.origin);
    url.searchParams.set("tiktok_error", message);
    return NextResponse.redirect(url);
  }
}
