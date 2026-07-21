import { Platform } from "@prisma/client";
import { SeedBackedMarketplaceAdapter } from "./base-adapter";
import type { MarketplaceAdapter } from "./types";

export * from "./types";

const adapters: Record<Platform, MarketplaceAdapter> = {
  [Platform.MERCADO_LIVRE]: new SeedBackedMarketplaceAdapter(Platform.MERCADO_LIVRE),
  [Platform.SHOPEE]: new SeedBackedMarketplaceAdapter(Platform.SHOPEE),
  [Platform.TIKTOK_SHOP]: new SeedBackedMarketplaceAdapter(Platform.TIKTOK_SHOP),
};

export function getMarketplaceAdapter(platform: Platform): MarketplaceAdapter {
  return adapters[platform];
}

export function getAllMarketplaceAdapters(): MarketplaceAdapter[] {
  return Object.values(adapters);
}
