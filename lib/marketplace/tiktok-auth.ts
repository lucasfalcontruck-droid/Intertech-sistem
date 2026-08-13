/**
 * lib/marketplace/tiktok-auth.ts — Guarda o access/refresh token de cada
 * loja TikTok Shop conectada (uma linha por conta em Store) e renova
 * automaticamente quando expira. Espelha mercadolivre-auth.ts.
 */
import { prisma } from "@/lib/prisma";
import { refreshTokens, type TikTokTokens } from "./tiktok-client";

const EXPIRY_BUFFER_MS = 60_000;

/** Returns a valid access token for a specific connected TikTok Shop store, refreshing and persisting it if expired. */
export async function getValidTikTokCredentials(storeId: string): Promise<TikTokTokens> {
  const store = await prisma.store.findUnique({ where: { id: storeId } });

  if (!store || store.status !== "CONNECTED" || !store.credentials) {
    throw new Error("Esta loja do TikTok Shop não está conectada.");
  }

  const creds = store.credentials as unknown as TikTokTokens;

  if (creds.expiresAt - EXPIRY_BUFFER_MS > Date.now()) {
    return creds;
  }

  const refreshed = await refreshTokens(creds.refreshToken, creds.shopId, creds.shopCipher);

  await prisma.store.update({
    where: { id: storeId },
    data: { credentials: { ...refreshed } },
  });

  return refreshed;
}
