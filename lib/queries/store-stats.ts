/**
 * lib/queries/store-stats.ts — Estatísticas "de hoje" por loja conectada, no
 * mesmo formato que o painel "Negócio" do Mercado Livre mostra (vendas
 * brutas, unidades, ticket médio, visitas, conversão, cancelados). Usado
 * pelos cards detalhados no Dashboard e no Marketplace, pra não duplicar a
 * mesma conta em dois lugares.
 */
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "@/lib/reporting";

export interface StoreDailyStats {
  storeId: string;
  storeName: string;
  platform: string;
  grossSales: number;
  salesCount: number;
  unitsSold: number;
  avgPricePerSale: number;
  avgPricePerUnit: number;
  cancelledCount: number;
  visits: number | null;
  conversion: number | null;
}

async function computeForStore(store: {
  id: string;
  storeName: string;
  platform: string;
  visitsToday: number | null;
}): Promise<StoreDailyStats> {
  const todayStart = startOfDay(new Date());

  const [soldOrders, cancelledCount] = await Promise.all([
    prisma.order.findMany({
      where: { storeId: store.id, createdAt: { gte: todayStart }, status: { not: OrderStatus.CANCELADO } },
      include: { items: true },
    }),
    prisma.order.count({
      where: { storeId: store.id, createdAt: { gte: todayStart }, status: OrderStatus.CANCELADO },
    }),
  ]);

  const grossSales = soldOrders.reduce((s, o) => s + Number(o.total), 0);
  const salesCount = soldOrders.length;
  const unitsSold = soldOrders.reduce(
    (s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0),
    0,
  );

  return {
    storeId: store.id,
    storeName: store.storeName,
    platform: store.platform,
    grossSales,
    salesCount,
    unitsSold,
    avgPricePerSale: salesCount > 0 ? grossSales / salesCount : 0,
    avgPricePerUnit: unitsSold > 0 ? grossSales / unitsSold : 0,
    cancelledCount,
    visits: store.visitsToday,
    conversion: store.visitsToday && store.visitsToday > 0 ? (salesCount / store.visitsToday) * 100 : null,
  };
}

/** Estatísticas de hoje de uma loja específica. */
export async function getStoreDailyStats(storeId: string): Promise<StoreDailyStats | null> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true, storeName: true, platform: true, visitsToday: true },
  });
  if (!store) return null;
  return computeForStore(store);
}

/** Estatísticas de hoje de todas as lojas conectadas, mais recente primeiro. */
export async function getAllStoresDailyStats(): Promise<StoreDailyStats[]> {
  const stores = await prisma.store.findMany({
    where: { status: "CONNECTED" },
    select: { id: true, storeName: true, platform: true, visitsToday: true },
    orderBy: [{ platform: "asc" }, { createdAt: "asc" }],
  });
  return Promise.all(stores.map(computeForStore));
}
