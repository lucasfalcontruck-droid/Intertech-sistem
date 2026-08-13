/**
 * lib/queries/marketplace.ts — Área Marketplace: cards de integração por
 * loja conectada (vendas, taxa, repasse — uma plataforma pode ter mais de
 * uma loja/conta) e evolução mensal de vendas por canal. Lê sempre do banco
 * local — quem grava dados reais ali é o adaptador em lib/marketplace/
 * (ex.: MercadoLivreMarketplaceAdapter.syncInventory).
 */
import { OrderStatus, Platform } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { REPORTING_WINDOW_DAYS } from "@/lib/constants";
import { getMonthBuckets, subDays } from "@/lib/reporting";

/** Pedidos cancelados não contam como venda em nenhum KPI/gráfico de vendas. */
const NOT_CANCELLED = { status: { not: OrderStatus.CANCELADO } } as const;

/** Monta os cards de integração (por loja) e o gráfico de evolução de vendas por canal. */
export async function getMarketplaceData() {
  const now = new Date();
  const windowStart = subDays(now, REPORTING_WINDOW_DAYS);
  const monthBuckets = getMonthBuckets(6);
  const historyStart = monthBuckets[0].start;

  const [stores, windowOrders, historyOrders] = await Promise.all([
    prisma.store.findMany({ orderBy: [{ platform: "asc" }, { createdAt: "asc" }] }),
    prisma.order.findMany({
      where: { ...NOT_CANCELLED, createdAt: { gte: windowStart } },
      select: { storeId: true, platform: true, total: true },
    }),
    prisma.order.findMany({
      where: { ...NOT_CANCELLED, createdAt: { gte: historyStart } },
      select: { platform: true, total: true, createdAt: true },
    }),
  ]);

  const totalsByStore = new Map<string, { total: number; count: number }>();
  for (const o of windowOrders) {
    if (!o.storeId) continue;
    const bucket = totalsByStore.get(o.storeId) ?? { total: 0, count: 0 };
    bucket.total += Number(o.total);
    bucket.count += 1;
    totalsByStore.set(o.storeId, bucket);
  }

  const integrationCards = stores.map((store) => {
    const stats = totalsByStore.get(store.id) ?? { total: 0, count: 0 };
    const fee = Number(store.feePercentage);
    const netPayout = stats.total * (1 - fee / 100);
    return {
      id: store.id,
      platform: store.platform,
      storeName: store.storeName,
      status: store.status,
      // externalId só existe quando a loja veio de um login OAuth real (ML/Shopee/TikTok);
      // lojas de demonstração (seed) ou adicionadas manualmente não têm.
      isReal: store.externalId !== null,
      feePercentage: fee,
      lastSyncedAt: store.lastSyncedAt,
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
