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

const chipStyles: Record<Platform, string> = {
  MERCADO_LIVRE: "bg-ml text-black",
  SHOPEE: "bg-shopee text-white",
  TIKTOK_SHOP: "bg-[#111] text-white border border-tiktok",
  VENDEDOR_RUA: "bg-vendedor text-black",
};

export function PlatformChip({ platform, short = false }: { platform: Platform; short?: boolean }) {
  return (
    <span
      className={cn(
        "inline-block rounded-md px-2.5 py-1 text-[11px] font-bold",
        chipStyles[platform],
      )}
    >
      {short ? PLATFORM_SHORT[platform] : PLATFORM_LABEL[platform]}
    </span>
  );
}
