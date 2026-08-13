/**
 * lib/marketplace/index.ts — Ponto único de acesso aos adaptadores de
 * marketplace. Cada loja conectada (Store) tem seu próprio adaptador —
 * Mercado Livre usa o adaptador real (API); as demais plataformas ainda
 * usam o adaptador mock/seed até terem integração de verdade.
 */
import { Platform } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SeedBackedMarketplaceAdapter } from "./base-adapter";
import { MercadoLivreMarketplaceAdapter } from "./mercadolivre-adapter";
import type { MarketplaceAdapter } from "./types";

export * from "./types";

/** Retorna o adaptador (real ou mock) responsável por uma loja específica. */
export function getMarketplaceAdapter(store: { id: string; platform: Platform }): MarketplaceAdapter {
  if (store.platform === Platform.MERCADO_LIVRE) {
    return new MercadoLivreMarketplaceAdapter(store.id);
  }
  return new SeedBackedMarketplaceAdapter(store.platform, store.id);
}

/** Busca uma loja pelo id e retorna o adaptador correspondente. */
export async function getMarketplaceAdapterByStoreId(storeId: string): Promise<MarketplaceAdapter> {
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) throw new Error("Loja não encontrada.");
  return getMarketplaceAdapter(store);
}

/** Retorna os adaptadores de todas as lojas conectadas de uma plataforma (para rotinas que sincronizam tudo). */
export async function getMarketplaceAdaptersForPlatform(platform: Platform): Promise<MarketplaceAdapter[]> {
  const stores = await prisma.store.findMany({ where: { platform, status: "CONNECTED" } });
  return stores.map((store) => getMarketplaceAdapter(store));
}
