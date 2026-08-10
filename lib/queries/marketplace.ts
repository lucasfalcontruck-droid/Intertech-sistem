/**
 * lib/queries/marketplace.ts — Área Marketplace: cards de integração por
 * plataforma (vendas, taxa, repasse) e evolução mensal de vendas por canal.
 * Lê sempre do banco local — quem grava dados reais ali é o adaptador em
 * lib/marketplace/ (ex.: MercadoLivreMarketplaceAdapter.syncInventory).
 */
import { Platform } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { REPORTING_WINDOW_DAYS } from "@/lib/constants";
import { getMonthBuckets, subDays } from "@/lib/reporting";

/** Monta os cards de integração e o gráfico de evolução de vendas por canal. */
export async function getMarketplaceData() {
  const now = new Date();
  const windowStart = subDays(now, REPORTING_WINDOW_DAYS);
  const monthBuckets = getMonthBuckets(6);
  const historyStart = monthBuckets[0].start;

  const [integrations, windowOrders, historyOrders] = await Promise.all([
    prisma.platformIntegration.findMany({ orderBy: { platform: "asc" } }),
    prisma.order.findMany({
      where: { createdAt: { gte: windowStart } },
      select: { platform: true, total: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: historyStart } },
      select: { platform: true, total: true, createdAt: true },
    }),
  ]);

  const totals: Record<Platform, { total: number; count: number }> = {
    MERCADO_LIVRE: { total: 0, count: 0 },
    SHOPEE: { total: 0, count: 0 },
    TIKTOK_SHOP: { total: 0, count: 0 },
    VENDEDOR_RUA: { total: 0, count: 0 },
  };
  for (const o of windowOrders) {
    totals[o.platform].total += Number(o.total);
    totals[o.platform].count += 1;
  }

  const integrationCards = integrations.map((integ) => {
    const stats = totals[integ.platform];
    const fee = Number(integ.feePercentage);
    const netPayout = stats.total * (1 - fee / 100);
    return {
      platform: integ.platform,
      storeName: integ.storeName,
      status: integ.status,
      feePercentage: fee,
      lastSyncedAt: integ.lastSyncedAt,
      sales: stats.total,
      orders: stats.count,
      averageTicket: stats.count > 0 ? stats.total / stats.count : 0,
      netPayout,
    };
  });

  const monthlyTrend = monthBuckets.map(({ start, end, label }) => {
    const row: { month: string } & Record<Platform, number> = {
      month: label,
      MERCADO_LIVRE: 0,
      SHOPEE: 0,
      TIKTOK_SHOP: 0,
      VENDEDOR_RUA: 0,
    };
    for (const o of historyOrders) {
      if (o.createdAt >= start && o.createdAt < end) {
        row[o.platform] += Number(o.total);
      }
    }
    return row;
  });

  return { integrationCards, monthlyTrend };
}
