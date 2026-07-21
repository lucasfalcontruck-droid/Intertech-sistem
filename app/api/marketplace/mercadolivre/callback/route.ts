import { NextRequest, NextResponse } from "next/server";
import { Platform } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { exchangeCodeForTokens, fetchMe } from "@/lib/marketplace/mercadolivre-client";

const STATE_COOKIE = "ml_oauth_state";

export async function GET(req: NextRequest) {
  const marketplaceUrl = new URL("/marketplace", req.nextUrl.origin);

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

    await prisma.platformIntegration.upsert({
      where: { platform: Platform.MERCADO_LIVRE },
      create: {
        platform: Platform.MERCADO_LIVRE,
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
