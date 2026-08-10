/**
 * lib/api.ts — Cliente HTTP compartilhado por todos os hooks (TanStack Query)
 * para chamar as rotas internas em app/api/. Centraliza o parsing de erro
 * e o header JSON padrão.
 */

/** Erro lançado quando uma chamada a apiFetch recebe uma resposta não-OK. */
export class ApiError extends Error {}

/** Faz um fetch para uma rota interna da API e já retorna o corpo tipado como T. */
export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.error ?? "Ocorreu um erro inesperado. Tente novamente.");
  }

  return res.json();
}
