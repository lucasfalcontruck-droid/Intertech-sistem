/**
 * lib/marketplace/tiktok-client.ts — Cliente HTTP fino para a API real do
 * TikTok Shop Partner Center (OAuth). Espelha lib/marketplace/mercadolivre-client.ts.
 *
 * Exige um app registrado em https://partner.tiktokshop.com com
 * TIKTOK_APP_KEY/TIKTOK_APP_SECRET configurados no .env. O TikTok já trocou
 * o domínio de auth mais de uma vez no passado — se o login não abrir, o
 * primeiro lugar a checar é AUTH_BASE abaixo contra a doc atual deles.
 */
import { createHmac } from "crypto";

const AUTH_BASE = "https://auth.tiktok-shops.com";
const API_BASE = "https://open-api.tiktokglobalshop.com";

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `TikTok Shop ainda não configurado: variável ${name} ausente. Cadastre um app em partner.tiktokshop.com e adicione as chaves no .env.`,
    );
  }
  return value;
}

/** Monta a URL de autorização OAuth para redirecionar o vendedor ao login do TikTok Shop. */
export function buildAuthorizeUrl(state: string): string {
  const appKey = getEnv("TIKTOK_APP_KEY");

  const url = new URL(`${AUTH_BASE}/oauth/authorize`);
  url.searchParams.set("app_key", appKey);
  url.searchParams.set("state", state);
  return url.toString();
}

export interface TikTokTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // epoch ms
  shopId: string;
  shopCipher: string;
}

interface TikTokTokenResponse {
  data: {
    access_token: string;
    refresh_token: string;
    access_token_expire_in: number;
  };
  code: number;
  message: string;
}

function sign(path: string, appKey: string, appSecret: string, timestamp: number, params: Record<string, string> = {}): string {
  const sortedKeys = Object.keys(params).sort();
  const paramString = sortedKeys.map((k) => `${k}${params[k]}`).join("");
  const baseString = `${appKey}${path}${timestamp}${paramString}`;
  return createHmac("sha256", appSecret).update(baseString).digest("hex");
}

/** Troca o `code` do callback OAuth pelos tokens de acesso/refresh de uma loja TikTok Shop. */
export async function exchangeCodeForTokens(
  code: string,
  shopId: string,
  shopCipher: string,
): Promise<TikTokTokens> {
  const appKey = getEnv("TIKTOK_APP_KEY");
  const appSecret = getEnv("TIKTOK_APP_SECRET");

  const url = new URL(`${AUTH_BASE}/api/v2/token/get`);
  url.searchParams.set("app_key", appKey);
  url.searchParams.set("app_secret", appSecret);
  url.searchParams.set("auth_code", code);
  url.searchParams.set("grant_type", "authorized_code");

  const res = await fetch(url, { method: "GET" });
  const data = (await res.json()) as TikTokTokenResponse;

  if (!res.ok || data.code !== 0) {
    throw new Error(`Falha ao trocar o código por token do TikTok Shop: ${data.message ?? res.statusText}`);
  }

  return {
    accessToken: data.data.access_token,
    refreshToken: data.data.refresh_token,
    expiresAt: Date.now() + data.data.access_token_expire_in * 1000,
    shopId,
    shopCipher,
  };
}

/** Usa o refresh token para obter um novo access token quando o atual expira. */
export async function refreshTokens(
  refreshToken: string,
  shopId: string,
  shopCipher: string,
): Promise<TikTokTokens> {
  const appKey = getEnv("TIKTOK_APP_KEY");
  const appSecret = getEnv("TIKTOK_APP_SECRET");

  const url = new URL(`${AUTH_BASE}/api/v2/token/refresh`);
  url.searchParams.set("app_key", appKey);
  url.searchParams.set("app_secret", appSecret);
  url.searchParams.set("refresh_token", refreshToken);
  url.searchParams.set("grant_type", "refresh_token");

  const res = await fetch(url, { method: "GET" });
  const data = (await res.json()) as TikTokTokenResponse;

  if (!res.ok || data.code !== 0) {
    throw new Error(`Falha ao renovar o token do TikTok Shop: ${data.message ?? res.statusText}`);
  }

  return {
    accessToken: data.data.access_token,
    refreshToken: data.data.refresh_token,
    expiresAt: Date.now() + data.data.access_token_expire_in * 1000,
    shopId,
    shopCipher,
  };
}

export interface TikTokShopInfo {
  shopId: string;
  shopName: string;
}

/** Busca o nome da loja autenticada (GET /authorization/202309/shops). */
export async function fetchShopInfo(accessToken: string, shopId: string): Promise<TikTokShopInfo> {
  const appKey = getEnv("TIKTOK_APP_KEY");
  const appSecret = getEnv("TIKTOK_APP_SECRET");
  const path = "/authorization/202309/shops";
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = sign(path, appKey, appSecret, timestamp, { app_key: appKey, timestamp: String(timestamp) });

  const url = new URL(`${API_BASE}${path}`);
  url.searchParams.set("app_key", appKey);
  url.searchParams.set("timestamp", String(timestamp));
  url.searchParams.set("sign", signature);

  const res = await fetch(url, { headers: { "x-tts-access-token": accessToken } });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Falha ao consultar a loja TikTok Shop (${res.status}): ${body}`);
  }

  const data = await res.json();
  const shop = data.data?.shops?.find((s: { id: string }) => s.id === shopId) ?? data.data?.shops?.[0];
  return { shopId, shopName: shop?.name ?? `Loja ${shopId}` };
}
