/**
 * lib/marketplace/shopee-auth.ts — Guarda o access/refresh token de cada
 * loja Shopee conectada (uma linha por conta em Store) e renova
 * automaticamente quando expira. Espelha mercadolivre-auth.ts.
 */
import { prisma } from "@/lib/prisma";
import { refreshTokens, type ShopeeTokens } from "./shopee-client";

const EXPIRY_BUFFER_MS = 60_000;

/** Returns a valid access token for a specific connected Shopee store, refreshing and persisting it if expired. */
export async function getValidShopeeCredentials(storeId: string): Promise<ShopeeTokens> {
  const store = await prisma.store.findUnique({ where: { id: storeId } });

  if (!store || store.status !== "CONNECTED" || !store.credentials) {
    throw new Error("Esta loja da Shopee não está conectada.");
  }

  const creds = store.credentials as unknown as ShopeeTokens;

  if (creds.expiresAt - EXPIRY_BUFFER_MS > Date.now()) {
    return creds;
  }

  const refreshed = await refreshTokens(creds.refreshToken, creds.shopId);

  await prisma.store.update({
    where: { id: storeId },
    data: { credentials: { ...refreshed } },
  });

  return refreshed;
}
