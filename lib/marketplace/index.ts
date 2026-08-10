/**
 * lib/marketplace/index.ts — Ponto único de acesso aos adaptadores de
 * marketplace. Mercado Livre usa o adaptador real (API); Shopee e TikTok
 * Shop ainda usam o adaptador mock/seed até terem integração de verdade.
 */
import { Platform } from "@prisma/client";
import { SeedBackedMarketplaceAdapter } from "./base-adapter";
import { MercadoLivreMarketplaceAdapter } from "./mercadolivre-adapter";
import type { MarketplaceAdapter } from "./types";

export * from "./types";

const adapters: Record<Platform, MarketplaceAdapter> = {
  [Platform.MERCADO_LIVRE]: new MercadoLivreMarketplaceAdapter(),
  [Platform.SHOPEE]: new SeedBackedMarketplaceAdapter(Platform.SHOPEE),
  [Platform.TIKTOK_SHOP]: new SeedBackedMarketplaceAdapter(Platform.TIKTOK_SHOP),
  // Vendedor de Rua não tem sync — os pedidos chegam via app/api/integrations/vendedor
  // (a integração empurra o pedido pra cá, em vez de a gente puxar de algum lugar).
  [Platform.VENDEDOR_RUA]: new SeedBackedMarketplaceAdapter(Platform.VENDEDOR_RUA),
};

/** Retorna o adaptador (real ou mock) responsável por uma plataforma. */
export function getMarketplaceAdapter(platform: Platform): MarketplaceAdapter {
  return adapters[platform];
}

/** Retorna todos os adaptadores registrados, para rotinas que percorrem todas as plataformas. */
export function getAllMarketplaceAdapters(): MarketplaceAdapter[] {
  return Object.values(adapters);
}
