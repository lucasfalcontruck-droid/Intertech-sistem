/**
 * lib/intertech-client.ts — Cliente para o sistema principal da Intertech
 * (SISTEMA DEFINITIVO). Este app deixou de usar seu próprio banco SQLite como
 * fonte de verdade: agora busca o catálogo e registra pedidos direto no
 * sistema principal, por rotas autenticadas com uma chave secreta
 * (VENDEDOR_APP_API_KEY, igual dos dois lados). O SQLite local não é mais
 * usado por esses dois fluxos — só o localStorage do navegador, pra fila
 * offline, continua fazendo o mesmo papel de antes.
 */

function getBaseUrl(): string {
  const url = process.env.INTERTECH_API_URL;
  if (!url) throw new Error("Variável de ambiente INTERTECH_API_URL não configurada.");
  return url.replace(/\/$/, "");
}

function getApiKey(): string {
  const key = process.env.INTERTECH_API_KEY;
  if (!key) throw new Error("Variável de ambiente INTERTECH_API_KEY não configurada.");
  return key;
}

/** Faz uma chamada autenticada para uma rota de integração do sistema principal. */
export async function intertechFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-vendedor-api-key": getApiKey(),
      ...init?.headers,
    },
    cache: "no-store",
  });
}
