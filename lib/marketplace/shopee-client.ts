/**
 * lib/marketplace/shopee-client.ts — Cliente HTTP fino para a API real da
 * Shopee Open Platform (OAuth v2). Espelha lib/marketplace/mercadolivre-client.ts,
 * mas a Shopee assina toda chamada (inclusive as de auth) com HMAC-SHA256
 * usando a Partner Key — não é um Bearer token simples como o ML.
 *
 * Exige um app registrado em https://open.shopee.com (Shopee Open Platform)
 * com SHOPEE_PARTNER_ID/SHOPEE_PARTNER_KEY configurados no .env. Endpoints
 * conferidos contra a doc pública da v2 na época em que foi escrito — se a
 * Shopee tiver mudado algo, ajustar só as constantes abaixo.
 */
import { createHmac } from "crypto";

const API_BASE = "https://partner.shopeemobile.com";

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Shopee ainda não configurada: variável ${name} ausente. Cadastre um app em open.shopee.com e adicione as chaves no .env.`,
    );
  }
  return value;
}

function sign(path: string, partnerId: string, partnerKey: string, timestamp: number, extra = ""): string {
  const baseString = `${partnerId}${path}${timestamp}${extra}`;
  return createHmac("sha256", partnerKey).update(baseString).digest("hex");
}

/** Monta a URL de autorização OAuth para redirecionar o vendedor ao login da Shopee. */
export function buildAuthorizeUrl(redirectUri: string): string {
  const partnerId = getEnv("SHOPEE_PARTNER_ID");
  const partnerKey = getEnv("SHOPEE_PARTNER_KEY");
  const path = "/api/v2/shop/auth_partner";
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = sign(path, partnerId, partnerKey, timestamp);

  const url = new URL(`${API_BASE}${path}`);
  url.searchParams.set("partner_id", partnerId);
  url.searchParams.set("timestamp", String(timestamp));
  url.searchParams.set("sign", signature);
  url.searchParams.set("redirect", redirectUri);
  return url.toString();
}

export interface ShopeeTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // epoch ms
  shopId: number;
}

interface ShopeeTokenResponse {
  access_token: string;
  refresh_token: string;
  expire_in: number;
  error?: string;
  message?: string;
}

/** Troca o `code` do callback OAuth pelos tokens de acesso/refresh de uma loja Shopee. */
export async function exchangeCodeForTokens(code: string, shopId: number): Promise<ShopeeTokens> {
  const partnerId = getEnv("SHOPEE_PARTNER_ID");
  const partnerKey = getEnv("SHOPEE_PARTNER_KEY");
  const path = "/api/v2/auth/token/get";
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = sign(path, partnerId, partnerKey, timestamp);

  const url = new URL(`${API_BASE}${path}`);
  url.searchParams.set("partner_id", partnerId);
  url.searchParams.set("timestamp", String(timestamp));
  url.searchParams.set("sign", signature);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, shop_id: shopId, partner_id: Number(partnerId) }),
  });

  const data = (await res.json()) as ShopeeTokenResponse;
  if (!res.ok || data.error) {
    throw new Error(`Falha ao trocar o código por token da Shopee: ${data.message ?? res.statusText}`);
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expire_in * 1000,
    shopId,
  };
}

/** Usa o refresh token para obter um novo access token quando o atual expira. */
export async function refreshTokens(refreshToken: string, shopId: number): Promise<ShopeeTokens> {
  const partnerId = getEnv("SHOPEE_PARTNER_ID");
  const partnerKey = getEnv("SHOPEE_PARTNER_KEY");
  const path = "/api/v2/auth/access_token/get";
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = sign(path, partnerId, partnerKey, timestamp);

  const url = new URL(`${API_BASE}${path}`);
  url.searchParams.set("partner_id", partnerId);
  url.searchParams.set("timestamp", String(timestamp));
  url.searchParams.set("sign", signature);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken, shop_id: shopId, partner_id: Number(partnerId) }),
  });

  const data = (await res.json()) as ShopeeTokenResponse;
  if (!res.ok || data.error) {
    throw new Error(`Falha ao renovar o token da Shopee: ${data.message ?? res.statusText}`);
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expire_in * 1000,
    shopId,
  };
}

export interface ShopeeShopInfo {
  shopId: number;
  shopName: string;
}

/** Busca o nome da loja autenticada (GET /api/v2/shop/get_shop_info). */
export async function fetchShopInfo(accessToken: string, shopId: number): Promise<ShopeeShopInfo> {
  const partnerId = getEnv("SHOPEE_PARTNER_ID");
  const partnerKey = getEnv("SHOPEE_PARTNER_KEY");
  const path = "/api/v2/shop/get_shop_info";
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = sign(path, partnerId, partnerKey, timestamp, `${accessToken}${shopId}`);

  const url = new URL(`${API_BASE}${path}`);
  url.searchParams.set("partner_id", partnerId);
  url.searchParams.set("timestamp", String(timestamp));
  url.searchParams.set("sign", signature);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("shop_id", String(shopId));

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Falha ao consultar a loja Shopee (${res.status}): ${body}`);
  }

  const data = await res.json();
  return { shopId, shopName: data.shop_name ?? `Loja ${shopId}` };
}
