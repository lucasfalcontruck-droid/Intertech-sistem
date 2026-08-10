/**
 * lib/marketplace/mercadolivre-client.ts — Cliente HTTP fino para a API real
 * do Mercado Livre (OAuth + consultas). Usado pelas rotas de connect/callback
 * e pelo MercadoLivreMarketplaceAdapter. Só GET/POST de leitura e troca de
 * token — nunca escreve nada na conta do vendedor.
 */

const AUTH_BASE = "https://auth.mercadolivre.com.br";
const API_BASE = "https://api.mercadolibre.com";

/** Lê uma variável de ambiente obrigatória, lançando erro claro se faltar. */
function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variável de ambiente ${name} não configurada.`);
  return value;
}

/** Monta a URL de autorização OAuth para redirecionar o vendedor ao login do ML. */
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

/** Troca o `code` do callback OAuth pelos tokens de acesso/refresh. */
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

/** Usa o refresh token para obter um novo access token quando o atual expira. */
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

/** Busca os dados da conta do vendedor autenticado (GET /users/me). */
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

/** Busca uma página de pedidos reais do vendedor (GET /orders/search), paginável via offset. */
export async function fetchOrdersPage(
  accessToken: string,
  sellerId: number,
  params: { offset?: number; limit?: number } = {},
) {
  const url = new URL(`${API_BASE}/orders/search`);
  url.searchParams.set("seller", String(sellerId));
  url.searchParams.set("sort", "date_desc");
  url.searchParams.set("limit", String(params.limit ?? 10));
  if (params.offset) url.searchParams.set("offset", String(params.offset));

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Falha ao consultar pedidos do Mercado Livre (${res.status}): ${body}`);
  }

  return res.json();
}

/** Atalho para os N pedidos mais recentes, usado pelo botão "Testar conexão real". */
export async function fetchRecentOrders(accessToken: string, sellerId: number, limit = 10) {
  return fetchOrdersPage(accessToken, sellerId, { limit });
}
