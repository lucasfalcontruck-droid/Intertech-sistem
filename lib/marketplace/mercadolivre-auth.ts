/**
 * lib/marketplace/mercadolivre-auth.ts — Guarda o access/refresh token do
 * Mercado Livre no banco (PlatformIntegration) e renova automaticamente
 * quando expira, para as outras rotinas não precisarem se preocupar com isso.
 */
import { Platform } from "@prisma/client";
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

/** Returns a valid access token for Mercado Livre, refreshing and persisting it if expired. */
export async function getValidMercadoLivreCredentials(): Promise<StoredCredentials> {
  const integration = await prisma.platformIntegration.findUnique({
    where: { platform: Platform.MERCADO_LIVRE },
  });

  if (!integration || integration.status !== "CONNECTED" || !integration.credentials) {
    throw new Error("Mercado Livre não está conectado. Conecte a loja primeiro.");
  }

  const creds = integration.credentials as unknown as StoredCredentials;

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

  await prisma.platformIntegration.update({
    where: { platform: Platform.MERCADO_LIVRE },
    data: { credentials: { ...updated } },
  });

  return updated;
}
