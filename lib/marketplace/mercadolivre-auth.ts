/**
 * lib/marketplace/mercadolivre-auth.ts — Guarda o access/refresh token de
 * cada loja do Mercado Livre conectada (uma linha por conta em Store) e
 * renova automaticamente quando expira, para as outras rotinas não
 * precisarem se preocupar com isso.
 */
import { prisma } from "@/lib/prisma";
import { refreshTokens, type MercadoLivreTokens } from "./mercadolivre-client";

interface StoredCredentials {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userId: number;
  siteId: string;
}

const EXPIRY_BUFFER_MS = 60_000;

/** Returns a valid access token for a specific connected Mercado Livre store, refreshing and persisting it if expired. */
export async function getValidMercadoLivreCredentials(storeId: string): Promise<StoredCredentials> {
  const store = await prisma.store.findUnique({ where: { id: storeId } });

  if (!store || store.status !== "CONNECTED" || !store.credentials) {
    throw new Error("Esta loja do Mercado Livre não está conectada.");
  }

  const creds = store.credentials as unknown as StoredCredentials;

  if (creds.expiresAt - EXPIRY_BUFFER_MS > Date.now()) {
    return creds;
  }

  const refreshed: MercadoLivreTokens = await refreshTokens(creds.refreshToken);
  const updated: StoredCredentials = {
    accessToken: refreshed.accessToken,
    refreshToken: refreshed.refreshToken,
    expiresAt: refreshed.expiresAt,
    userId: refreshed.userId,
    siteId: creds.siteId,
  };

  await prisma.store.update({
    where: { id: storeId },
    data: { credentials: { ...updated } },
  });

  return updated;
}
