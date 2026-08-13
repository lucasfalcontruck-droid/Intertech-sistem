import { NextRequest, NextResponse } from "next/server";
import { Platform } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { exchangeCodeForTokens, fetchShopInfo } from "@/lib/marketplace/shopee-client";

const STATE_COOKIE = "shopee_oauth_state";

/**
 * app/api/marketplace/shopee/callback/route.ts — Passo 2 do OAuth da
 * Shopee: recebe `code` + `shop_id`, valida o `state` (anti-CSRF, veio
 * embutido na própria redirect_uri), troca o código por tokens reais e
 * salva como Store (uma linha por loja — conectar uma loja Shopee
 * diferente cria uma linha nova). Esta URL exata é a que deve ser
 * registrada no app criado em open.shopee.com.
 */
function getPublicOrigin(req: NextRequest): string {
  const proto = req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "");
  const host = req.headers.get("x-forwarded-host") ?? req.nextUrl.host;
  return `${proto}://${host}`;
}

export async function GET(req: NextRequest) {
  const marketplaceUrl = new URL("/marketplace", getPublicOrigin(req));

  const code = req.nextUrl.searchParams.get("code");
  const shopIdParam = req.nextUrl.searchParams.get("shop_id");
  const state = req.nextUrl.searchParams.get("state");
  const savedState = req.cookies.get(STATE_COOKIE)?.value;

  if (!code || !shopIdParam || !state || !savedState || state !== savedState) {
    marketplaceUrl.searchParams.set(
      "shopee_error",
      "Sessão de autorização inválida ou expirada. Tente novamente.",
    );
    const res = NextResponse.redirect(marketplaceUrl);
    res.cookies.delete(STATE_COOKIE);
    return res;
  }

  const shopId = Number(shopIdParam);

  try {
    const tokens = await exchangeCodeForTokens(code, shopId);
    const shop = await fetchShopInfo(tokens.accessToken, shopId);

    await prisma.store.upsert({
      where: { platform_externalId: { platform: Platform.SHOPEE, externalId: String(shopId) } },
      create: {
        platform: Platform.SHOPEE,
        externalId: String(shopId),
        storeName: shop.shopName,
        status: "CONNECTED",
        feePercentage: 16,
        lastSyncedAt: new Date(),
        credentials: { ...tokens },
      },
      update: {
        storeName: shop.shopName,
        status: "CONNECTED",
        lastSyncedAt: new Date(),
        credentials: { ...tokens },
      },
    });

    marketplaceUrl.searchParams.set("shopee_connected", shop.shopName);
    const res = NextResponse.redirect(marketplaceUrl);
    res.cookies.delete(STATE_COOKIE);
    return res;
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Erro ao conectar com a Shopee.";
    marketplaceUrl.searchParams.set("shopee_error", message);
    const res = NextResponse.redirect(marketplaceUrl);
    res.cookies.delete(STATE_COOKIE);
    return res;
  }
}
