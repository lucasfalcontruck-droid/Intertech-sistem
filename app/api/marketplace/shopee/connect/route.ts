import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { buildAuthorizeUrl } from "@/lib/marketplace/shopee-client";

const STATE_COOKIE = "shopee_oauth_state";

/**
 * app/api/marketplace/shopee/connect/route.ts — Passo 1 do OAuth da Shopee:
 * gera um "state" anti-CSRF, salva num cookie httpOnly, embute o state na
 * própria redirect_uri (a Shopee não tem parâmetro `state` nativo no
 * auth_partner) e redireciona o vendedor pro login da Shopee.
 */

function getPublicOrigin(req: NextRequest): string {
  const proto = req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "");
  const host = req.headers.get("x-forwarded-host") ?? req.nextUrl.host;
  return `${proto}://${host}`;
}

/** Inicia o fluxo de autorização OAuth com a Shopee. */
export async function GET(req: NextRequest) {
  let authorizeUrl: string;
  try {
    const state = randomUUID();
    const redirectUri = `${getPublicOrigin(req)}/api/marketplace/shopee/callback?state=${state}`;
    authorizeUrl = buildAuthorizeUrl(redirectUri);

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
    const message = error instanceof Error ? error.message : "Erro ao iniciar conexão com a Shopee.";
    const url = new URL("/marketplace", req.nextUrl.origin);
    url.searchParams.set("shopee_error", message);
    return NextResponse.redirect(url);
  }
}
