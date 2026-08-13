/**
 * components/ui/platform-chip.tsx — Rótulos, cores e o "chip" visual de cada
 * plataforma (Mercado Livre/Shopee/TikTok Shop). Fonte única dessas cores,
 * reaproveitada pelos gráficos e cards de integração.
 */
import type { Platform } from "@prisma/client";
import { cn } from "@/lib/utils";

export const PLATFORM_LABEL: Record<Platform, string> = {
  MERCADO_LIVRE: "Mercado Livre",
  SHOPEE: "Shopee",
  TIKTOK_SHOP: "TikTok Shop",
  VENDEDOR_RUA: "Vendedor de Rua",
};

export const PLATFORM_SHORT: Record<Platform, string> = {
  MERCADO_LIVRE: "ML",
  SHOPEE: "SP",
  TIKTOK_SHOP: "TT",
  VENDEDOR_RUA: "VR",
};

export const PLATFORM_COLOR: Record<Platform, string> = {
  MERCADO_LIVRE: "#ffe600",
  SHOPEE: "#ee4d2d",
  TIKTOK_SHOP: "#25f4ee",
  VENDEDOR_RUA: "#f472b6",
};

const dotStyles: Record<Platform, string> = {
  MERCADO_LIVRE: "bg-ml",
  SHOPEE: "bg-shopee",
  TIKTOK_SHOP: "bg-tiktok",
  VENDEDOR_RUA: "bg-vendedor",
};

export function PlatformChip({ platform, short = false }: { platform: Platform; short?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-white/6 px-2.5 py-1 text-[11px] font-bold text-ink-secondary">
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotStyles[platform])} />
      {short ? PLATFORM_SHORT[platform] : PLATFORM_LABEL[platform]}
    </span>
  );
}
