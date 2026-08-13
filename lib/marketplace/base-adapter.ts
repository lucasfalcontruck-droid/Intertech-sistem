import type { Platform } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  GetOrdersParams,
  MarketplaceAdapter,
  MarketplaceOrder,
  SalesSummary,
  SyncResult,
} from "./types";

/**
 * Mock/seed-backed implementation shared by every channel that doesn't have a
 * real API integration yet. Bound to one specific connected store (not just a
 * platform), since a platform can have more than one account connected. Each
 * platform-specific adapter only sets its `platform`; the data access here
 * reads from our own database, which stands in for the platform's real API
 * response until real credentials are wired up.
 */
export class SeedBackedMarketplaceAdapter implements MarketplaceAdapter {
  constructor(
    public readonly platform: Platform,
    public readonly storeId: string,
  ) {}

  /** Soma vendas e calcula ticket médio a partir dos pedidos locais dessa loja no período. */
  async getSales(periodStart: Date, periodEnd: Date): Promise<SalesSummary> {
    const orders = await prisma.order.findMany({
      where: {
        storeId: this.storeId,
        createdAt: { gte: periodStart, lte: periodEnd },
      },
      select: { total: true },
    });

    const totalSales = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const orderCount = orders.length;

    return {
      platform: this.platform,
      storeId: this.storeId,
      totalSales,
      orderCount,
      averageTicket: orderCount > 0 ? totalSales / orderCount : 0,
      periodStart,
      periodEnd,
    };
  }

  /** Lista pedidos locais dessa loja, mais recentes primeiro. */
  async getOrders(params: GetOrdersParams = {}): Promise<MarketplaceOrder[]> {
    const orders = await prisma.order.findMany({
      where: {
        storeId: this.storeId,
        ...(params.since ? { createdAt: { gte: params.since } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: params.limit ?? 50,
    });

    return orders.map((o) => ({
      id: o.id,
      number: o.number,
      customerName: o.customerName,
      platform: o.platform,
      storeId: o.storeId,
      total: Number(o.total),
      status: o.status,
      createdAt: o.createdAt,
    }));
  }

  /** Mock: só recontabiliza o que já existe localmente (não busca nada externo). */
  async syncInventory(): Promise<SyncResult> {
    const [ordersSynced, productsSynced] = await Promise.all([
      prisma.order.count({ where: { storeId: this.storeId } }),
      prisma.productChannel.count({ where: { platform: this.platform } }),
    ]);

    const syncedAt = new Date();

    await prisma.store.update({
      where: { id: this.storeId },
      data: { lastSyncedAt: syncedAt },
    });

    return {
      platform: this.platform,
      storeId: this.storeId,
      syncedAt,
      ordersSynced,
      productsSynced,
      success: true,
    };
  }
}
