import { NextRequest, NextResponse } from "next/server";
import { Platform } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { exchangeCodeForTokens, fetchShopInfo } from "@/lib/marketplace/tiktok-client";

const STATE_COOKIE = "tiktok_oauth_state";

/**
 * app/api/marketplace/tiktok/callback/route.ts — Passo 2 do OAuth do TikTok
 * Shop: recebe `code` + `shop_id` (+ `shop_cipher`), valida o `state`
 * (anti-CSRF), troca o código por tokens reais e salva como Store (uma
 * linha por loja — conectar uma loja TikTok diferente cria uma linha
 * nova). Esta URL exata é a cadastrada como redirect no app em
 * partner.tiktokshop.com.
 */
function getPublicOrigin(req: NextRequest): string {
  const proto = req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "");
  const host = req.headers.get("x-forwarded-host") ?? req.nextUrl.host;
  return `${proto}://${host}`;
}

export async function GET(req: NextRequest) {
  const marketplaceUrl = new URL("/marketplace", getPublicOrigin(req));

  const code = req.nextUrl.searchParams.get("code");
  const shopId = req.nextUrl.searchParams.get("shop_id");
  const shopCipher = req.nextUrl.searchParams.get("shop_cipher") ?? "";
  const state = req.nextUrl.searchParams.get("state");
  const savedState = req.cookies.get(STATE_COOKIE)?.value;

  if (!code || !shopId || !state || !savedState || state !== savedState) {
    marketplaceUrl.searchParams.set(
      "tiktok_error",
      "Sessão de autorização inválida ou expirada. Tente novamente.",
    );
    const res = NextResponse.redirect(marketplaceUrl);
    res.cookies.delete(STATE_COOKIE);
    return res;
  }

  try {
    const tokens = await exchangeCodeForTokens(code, shopId, shopCipher);
    const shop = await fetchShopInfo(tokens.accessToken, shopId);

    await prisma.store.upsert({
      where: { platform_externalId: { platform: Platform.TIKTOK_SHOP, externalId: shopId } },
      create: {
        platform: Platform.TIKTOK_SHOP,
        externalId: shopId,
        storeName: shop.shopName,
        status: "CONNECTED",
        feePercentage: 10,
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

    marketplaceUrl.searchParams.set("tiktok_connected", shop.shopName);
    const res = NextResponse.redirect(marketplaceUrl);
    res.cookies.delete(STATE_COOKIE);
    return res;
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Erro ao conectar com o TikTok Shop.";
    marketplaceUrl.searchParams.set("tiktok_error", message);
    const res = NextResponse.redirect(marketplaceUrl);
    res.cookies.delete(STATE_COOKIE);
    return res;
  }
}
