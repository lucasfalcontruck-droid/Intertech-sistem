import { Platform } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { REPORTING_WINDOW_DAYS } from "@/lib/constants";
import { startOfDay, subDays } from "@/lib/reporting";
import { getCashFlowHistory } from "./financeiro";

/**
 * lib/queries/relatorios.ts — Área Relatórios: lucratividade por canal,
 * ticket médio, desempenho por anúncio, vendas por estado e o painel ao
 * vivo de vendas do Mercado Livre.
 */

const ALL_PLATFORMS: Platform[] = [
  Platform.MERCADO_LIVRE,
  Platform.SHOPEE,
  Platform.TIKTOK_SHOP,
  Platform.VENDEDOR_RUA,
];

/** Fallback cost estimate for products without a recorded costPrice. */
function estimatedCost(price: number, costPrice: number | null): number {
  return costPrice ?? price * 0.6;
}

/** Receita, custo e lucro mensal (reaproveita o fluxo de caixa do Financeiro). */
export async function getLucrosMensal() {
  const history = await getCashFlowHistory();
  return history.map((h) => ({
    month: h.month,
    revenue: h.entradas,
    costs: h.saidas,
    profit: h.entradas - h.saidas,
  }));
}

/**
 * Per sales-channel (platform) performance — "loja" is treated as the sales
 * channel, since the schema has no concept of multiple storefronts per platform.
 */
export async function getCanalPerformance() {
  const windowStart = subDays(new Date(), REPORTING_WINDOW_DAYS);

  const [integrations, orders, channelViews, allProducts] = await Promise.all([
    prisma.platformIntegration.findMany(),
    prisma.order.findMany({
      where: { createdAt: { gte: windowStart } },
      include: { items: true },
    }),
    prisma.productChannel.findMany({ include: { product: { select: { adViews: true } } } }),
    prisma.product.findMany({ select: { price: true, costPrice: true } }),
  ]);

  const viewsByPlatform: Record<Platform, number> = {
    MERCADO_LIVRE: 0,
    SHOPEE: 0,
    TIKTOK_SHOP: 0,
    VENDEDOR_RUA: 0,
  };
  for (const c of channelViews) viewsByPlatform[c.platform] += c.product.adViews;

  // Order line items are generated independently from the order total in the seed data
  // (they represent "what's in the order" for display, not a reconciled subtotal), so
  // COGS is estimated from the catalog's average cost ratio applied to revenue instead
  // of summing item-level costs against an unrelated order total.
  const avgCostRatio =
    allProducts.length > 0
      ? allProducts.reduce((s, p) => {
          const price = Number(p.price);
          const cost = estimatedCost(price, p.costPrice ? Number(p.costPrice) : null);
          return s + (price > 0 ? cost / price : 0);
        }, 0) / allProducts.length
      : 0.6;

  return ALL_PLATFORMS.map((platform) => {
    const integ = integrations.find((i) => i.platform === platform);
    const platformOrders = orders.filter((o) => o.platform === platform);
    const revenue = platformOrders.reduce((s, o) => s + Number(o.total), 0);
    const orderCount = platformOrders.length;
    const avgTicket = orderCount > 0 ? revenue / orderCount : 0;

    let unitsSold = 0;
    for (const o of platformOrders) {
      for (const item of o.items) unitsSold += item.quantity;
    }

    const cogs = revenue * avgCostRatio;
    const feePct = integ ? Number(integ.feePercentage) : 0;
    const feeAmount = revenue * (feePct / 100);
    const profit = revenue - cogs - feeAmount;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const views = viewsByPlatform[platform];
    const conversion = views > 0 ? (unitsSold / views) * 100 : 0;

    return {
      platform,
      storeName: integ?.storeName ?? (platform === Platform.VENDEDOR_RUA ? "Vendedor de Rua" : platform),
      revenue,
      orders: orderCount,
      avgTicket,
      profit,
      margin,
      conversion,
    };
  });
}

/** Ticket médio geral (todas as plataformas) na janela de relatório. */
export async function getTicketMedioGeral() {
  const windowStart = subDays(new Date(), REPORTING_WINDOW_DAYS);
  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: windowStart } },
    select: { total: true },
  });
  const total = orders.reduce((s, o) => s + Number(o.total), 0);
  return orders.length > 0 ? total / orders.length : 0;
}

/** Ticket médio por produto, ordenado pelos mais vendidos. */
export async function getTicketMedioPorProduto(take = 8) {
  const windowStart = subDays(new Date(), REPORTING_WINDOW_DAYS);
  const items = await prisma.orderItem.findMany({
    where: { order: { createdAt: { gte: windowStart } } },
    select: { unitPrice: true, quantity: true, product: { select: { id: true, name: true } } },
  });

  const map = new Map<string, { name: string; amountSum: number; unitsSum: number; lines: number }>();
  for (const it of items) {
    const cur = map.get(it.product.id) ?? { name: it.product.name, amountSum: 0, unitsSum: 0, lines: 0 };
    cur.amountSum += Number(it.unitPrice) * it.quantity;
    cur.unitsSum += it.quantity;
    cur.lines += 1;
    map.set(it.product.id, cur);
  }

  return Array.from(map.values())
    .map((v) => ({ product: v.name, avgTicket: v.amountSum / v.unitsSum, orders: v.lines }))
    .sort((a, b) => b.orders - a.orders)
    .slice(0, take);
}

/** Desempenho por anúncio (visualizações, vendas, conversão, receita), top N. */
export async function getVendasPorAnuncio(take = 10) {
  const windowStart = subDays(new Date(), REPORTING_WINDOW_DAYS);
  const products = await prisma.product.findMany({
    include: {
      channels: true,
      orderItems: { where: { order: { createdAt: { gte: windowStart } } } },
    },
  });

  return products
    .map((p) => {
      const sales = p.orderItems.reduce((s, i) => s + i.quantity, 0);
      const revenue = p.orderItems.reduce((s, i) => s + i.quantity * Number(i.unitPrice), 0);
      const conversion = p.adViews > 0 ? (sales / p.adViews) * 100 : 0;
      const platform = p.channels[0]?.platform ?? Platform.MERCADO_LIVRE;
      return { product: p.name, platform, views: p.adViews, sales, conversion, revenue };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, take);
}

/** Total de pedidos e valor vendido agrupados por estado (UF) do cliente. */
export async function getVendaPorEstado() {
  const orders = await prisma.order.findMany({
    where: { state: { not: null } },
    select: { state: true, total: true },
  });

  const map = new Map<string, { orders: number; value: number }>();
  for (const o of orders) {
    const st = o.state!;
    const cur = map.get(st) ?? { orders: 0, value: 0 };
    cur.orders += 1;
    cur.value += Number(o.total);
    map.set(st, cur);
  }

  const totalValue = Array.from(map.values()).reduce((s, v) => s + v.value, 0);

  return Array.from(map.entries())
    .map(([state, v]) => ({
      state,
      orders: v.orders,
      value: v.value,
      pct: totalValue > 0 ? (v.value / totalValue) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

/** Dados do painel ao vivo: vendas de hoje e feed dos últimos pedidos do Mercado Livre. */
export async function getPainelAoVivoMercadoLivre() {
  const todayStart = startOfDay(new Date());

  const [todayOrders, recentOrders] = await Promise.all([
    prisma.order.findMany({
      where: { platform: Platform.MERCADO_LIVRE, createdAt: { gte: todayStart } },
      select: { total: true },
    }),
    prisma.order.findMany({
      where: { platform: Platform.MERCADO_LIVRE },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { items: { include: { product: true } } },
    }),
  ]);

  const salesToday = todayOrders.reduce((s, o) => s + Number(o.total), 0);
  const ordersToday = todayOrders.length;
  const avgTicket = ordersToday > 0 ? salesToday / ordersToday : 0;
  const lastOrderAt = recentOrders[0]?.createdAt ?? null;

  return {
    salesToday,
    ordersToday,
    avgTicket,
    lastOrderAt,
    feed: recentOrders.map((o) => ({
      time: o.createdAt,
      product: o.items[0]?.product.name ?? "—",
      buyer: o.customerName,
      value: Number(o.total),
    })),
  };
}
