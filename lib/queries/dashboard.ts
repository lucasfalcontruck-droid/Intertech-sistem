/**
 * lib/queries/dashboard.ts — Área Dashboard: agrega KPIs (vendas, pedidos,
 * ticket médio, estoque baixo) e séries para os gráficos da visão geral.
 */
import { OrderStatus, Platform } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { REPORTING_WINDOW_DAYS } from "@/lib/constants";
import { getWeekBuckets, startOfDay, subDays } from "@/lib/reporting";

/** Pedidos cancelados não contam como venda em nenhum KPI/gráfico de vendas. */
const NOT_CANCELLED = { status: { not: OrderStatus.CANCELADO } } as const;

/** Variação percentual entre dois valores, tratando o caso de base zero. */
function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/** Monta todos os dados exibidos na página inicial do Dashboard. Se `storeId` for informado, restringe tudo a uma loja específica. */
export async function getDashboardData(storeId?: string) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const yesterdayStart = subDays(todayStart, 1);
  const windowStart = subDays(now, REPORTING_WINDOW_DAYS);
  const storeFilter = storeId ? { storeId } : {};

  const [todayOrders, yesterdayOrders, windowOrders, allProducts, recentOrders] = await Promise.all(
    [
      prisma.order.findMany({
        where: { ...storeFilter, ...NOT_CANCELLED, createdAt: { gte: todayStart } },
        select: { total: true },
      }),
      prisma.order.findMany({
        where: { ...storeFilter, ...NOT_CANCELLED, createdAt: { gte: yesterdayStart, lt: todayStart } },
        select: { total: true },
      }),
      prisma.order.findMany({
        where: { ...storeFilter, ...NOT_CANCELLED, createdAt: { gte: windowStart } },
        select: { platform: true, total: true, createdAt: true },
      }),
      prisma.product.findMany({
        select: { id: true, name: true, sku: true, stock: true, minStock: true },
      }),
      prisma.order.findMany({
        where: storeFilter,
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ],
  );

  const lowStock = allProducts
    .filter((p) => p.stock <= p.minStock)
    .sort((a, b) => a.stock - b.stock);
  const lowStockCount = lowStock.length;
  const lowStockProducts = lowStock.slice(0, 5);

  const salesToday = todayOrders.reduce((s, o) => s + Number(o.total), 0);
  const ordersToday = todayOrders.length;
  const avgTicketToday = ordersToday > 0 ? salesToday / ordersToday : 0;

  const salesYesterday = yesterdayOrders.reduce((s, o) => s + Number(o.total), 0);
  const ordersYesterday = yesterdayOrders.length;
  const avgTicketYesterday = ordersYesterday > 0 ? salesYesterday / ordersYesterday : 0;

  const kpis = {
    salesToday,
    salesTrend: pctChange(salesToday, salesYesterday),
    ordersToday,
    ordersTrend: pctChange(ordersToday, ordersYesterday),
    avgTicketToday,
    avgTicketTrend: pctChange(avgTicketToday, avgTicketYesterday),
    lowStockCount,
  };

  const weekBuckets = getWeekBuckets();
  const salesByPlatformWeekly = weekBuckets.map(({ start, end, label }) => {
    const row: { week: string } & Record<Platform, number> = {
      week: label,
      MERCADO_LIVRE: 0,
      SHOPEE: 0,
      TIKTOK_SHOP: 0,
      VENDEDOR_RUA: 0,
    };
    for (const o of windowOrders) {
      if (o.createdAt >= start && o.createdAt < end) {
        row[o.platform] += Number(o.total);
      }
    }
    return row;
  });

  const platformTotals: Record<Platform, number> = {
    MERCADO_LIVRE: 0,
    SHOPEE: 0,
    TIKTOK_SHOP: 0,
    VENDEDOR_RUA: 0,
  };
  for (const o of windowOrders) platformTotals[o.platform] += Number(o.total);
  const grandTotal = Object.values(platformTotals).reduce((a, b) => a + b, 0);
  const platformShare = (Object.keys(platformTotals) as Platform[]).map((platform) => ({
    platform,
    total: platformTotals[platform],
    pct: grandTotal > 0 ? (platformTotals[platform] / grandTotal) * 100 : 0,
  }));

  const dailyMap = new Map<string, number>();
  for (let i = REPORTING_WINDOW_DAYS - 1; i >= 0; i--) {
    const day = startOfDay(subDays(now, i));
    dailyMap.set(day.toISOString().slice(0, 10), 0);
  }
  for (const o of windowOrders) {
    const key = startOfDay(o.createdAt).toISOString().slice(0, 10);
    if (dailyMap.has(key)) dailyMap.set(key, (dailyMap.get(key) ?? 0) + Number(o.total));
  }
  const dailyEvolution = Array.from(dailyMap.entries()).map(([date, total]) => ({ date, total }));

  return {
    kpis,
    salesByPlatformWeekly,
    platformShare,
    dailyEvolution,
    lowStockProducts: lowStockProducts.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      stock: p.stock,
      minStock: p.minStock,
    })),
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      number: o.number,
      customerName: o.customerName,
      platform: o.platform,
      total: Number(o.total),
      status: o.status,
      createdAt: o.createdAt,
    })),
    grandTotal,
  };
}
