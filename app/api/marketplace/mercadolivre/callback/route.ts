import { NextRequest, NextResponse } from "next/server";
import { Platform } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { exchangeCodeForTokens, fetchMe } from "@/lib/marketplace/mercadolivre-client";

const STATE_COOKIE = "ml_oauth_state";

/**
 * app/api/marketplace/mercadolivre/callback/route.ts — Passo 2 do OAuth do
 * Mercado Livre: recebe o `code`, valida o `state` (anti-CSRF), troca o
 * código por tokens reais e salva como uma Store (uma linha por conta —
 * conectar uma conta ML diferente cria uma loja nova, reconectar a mesma
 * conta só atualiza o token). Esta URL exata é a cadastrada como
 * "redirect_uri" no app do Mercado Livre — não renomear nem mover sem
 * atualizar lá e no .env (MERCADOLIVRE_REDIRECT_URI) também.
 */

/** Resolve a origem pública (proto+host) a partir dos headers de proxy, para não
 * redirecionar de volta para "localhost" quando servido atrás de um túnel (ex.: ngrok). */
function getPublicOrigin(req: NextRequest): string {
  const proto = req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "");
  const host = req.headers.get("x-forwarded-host") ?? req.nextUrl.host;
  return `${proto}://${host}`;
}

/** Finaliza o OAuth: troca o code por tokens e redireciona de volta para /marketplace. */
export async function GET(req: NextRequest) {
  const marketplaceUrl = new URL("/marketplace", getPublicOrigin(req));

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const savedState = req.cookies.get(STATE_COOKIE)?.value;
  const oauthError = req.nextUrl.searchParams.get("error");

  if (oauthError) {
    marketplaceUrl.searchParams.set("ml_error", `Autorização negada: ${oauthError}`);
    return NextResponse.redirect(marketplaceUrl);
  }

  if (!code || !state || !savedState || state !== savedState) {
    marketplaceUrl.searchParams.set(
      "ml_error",
      "Sessão de autorização inválida ou expirada. Tente novamente.",
    );
    const res = NextResponse.redirect(marketplaceUrl);
    res.cookies.delete(STATE_COOKIE);
    return res;
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const me = await fetchMe(tokens.accessToken);
    const externalId = String(tokens.userId);

    await prisma.store.upsert({
      where: { platform_externalId: { platform: Platform.MERCADO_LIVRE, externalId } },
      create: {
        platform: Platform.MERCADO_LIVRE,
        externalId,
        storeName: me.nickname,
        status: "CONNECTED",
        feePercentage: 14.5,
        lastSyncedAt: new Date(),
        credentials: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
          userId: tokens.userId,
          siteId: me.siteId,
        },
      },
      update: {
        storeName: me.nickname,
        status: "CONNECTED",
        lastSyncedAt: new Date(),
        credentials: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
          userId: tokens.userId,
          siteId: me.siteId,
        },
      },
    });

    marketplaceUrl.searchParams.set("ml_connected", me.nickname);
    const res = NextResponse.redirect(marketplaceUrl);
    res.cookies.delete(STATE_COOKIE);
    return res;
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Erro ao conectar com o Mercado Livre.";
    marketplaceUrl.searchParams.set("ml_error", message);
    const res = NextResponse.redirect(marketplaceUrl);
    res.cookies.delete(STATE_COOKIE);
    return res;
  }
}
