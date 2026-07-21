/**
 * Thin client for the real Mercado Livre API. Used by the OAuth connect/callback
 * routes and by the (future) real adapter — kept separate from the mock
 * SeedBackedMarketplaceAdapter so swapping one for the other doesn't touch callers.
 */

const AUTH_BASE = "https://auth.mercadolivre.com.br";
const API_BASE = "https://api.mercadolibre.com";

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variável de ambiente ${name} não configurada.`);
  return value;
}

export function buildAuthorizeUrl(state: string): string {
  const clientId = getEnv("MERCADOLIVRE_CLIENT_ID");
  const redirectUri = getEnv("MERCADOLIVRE_REDIRECT_URI");

  const url = new URL(`${AUTH_BASE}/authorization`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  return url.toString();
}

export interface MercadoLivreTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // epoch ms
  userId: number;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user_id: number;
}

export async function exchangeCodeForTokens(code: string): Promise<MercadoLivreTokens> {
  const res = await fetch(`${API_BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: getEnv("MERCADOLIVRE_CLIENT_ID"),
      client_secret: getEnv("MERCADOLIVRE_CLIENT_SECRET"),
      code,
      redirect_uri: getEnv("MERCADOLIVRE_REDIRECT_URI"),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Falha ao trocar o código por token (${res.status}): ${body}`);
  }

  const data = (await res.json()) as TokenResponse;
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    userId: data.user_id,
  };
}

export async function refreshTokens(refreshToken: string): Promise<MercadoLivreTokens> {
  const res = await fetch(`${API_BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: getEnv("MERCADOLIVRE_CLIENT_ID"),
      client_secret: getEnv("MERCADOLIVRE_CLIENT_SECRET"),
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Falha ao renovar o token (${res.status}): ${body}`);
  }

  const data = (await res.json()) as TokenResponse;
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    userId: data.user_id,
  };
}

export interface MercadoLivreUser {
  id: number;
  nickname: string;
  siteId: string;
}

export async function fetchMe(accessToken: string): Promise<MercadoLivreUser> {
  const res = await fetch(`${API_BASE}/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Falha ao consultar usuário do Mercado Livre (${res.status}): ${body}`);
  }

  const data = await res.json();
  return { id: data.id, nickname: data.nickname, siteId: data.site_id };
}

export async function fetchRecentOrders(accessToken: string, sellerId: number, limit = 10) {
  const url = new URL(`${API_BASE}/orders/search`);
  url.searchParams.set("seller", String(sellerId));
  url.searchParams.set("sort", "date_desc");
  url.searchParams.set("limit", String(limit));

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Falha ao consultar pedidos do Mercado Livre (${res.status}): ${body}`);
  }

  return res.json();
}
