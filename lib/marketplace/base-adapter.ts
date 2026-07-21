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
 * Mock/seed-backed implementation shared by all three channels. Each
 * platform-specific adapter only sets its `platform`; the data access here
 * reads from our own database, which stands in for the platform's real API
 * response until real credentials are wired up.
 */
export class SeedBackedMarketplaceAdapter implements MarketplaceAdapter {
  constructor(public readonly platform: Platform) {}

  async getSales(periodStart: Date, periodEnd: Date): Promise<SalesSummary> {
    const orders = await prisma.order.findMany({
      where: {
        platform: this.platform,
        createdAt: { gte: periodStart, lte: periodEnd },
      },
      select: { total: true },
    });

    const totalSales = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const orderCount = orders.length;

    return {
      platform: this.platform,
      totalSales,
      orderCount,
      averageTicket: orderCount > 0 ? totalSales / orderCount : 0,
      periodStart,
      periodEnd,
    };
  }

  async getOrders(params: GetOrdersParams = {}): Promise<MarketplaceOrder[]> {
    const orders = await prisma.order.findMany({
      where: {
        platform: this.platform,
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
      total: Number(o.total),
      status: o.status,
      createdAt: o.createdAt,
    }));
  }

  async syncInventory(): Promise<SyncResult> {
    const [ordersSynced, productsSynced] = await Promise.all([
      prisma.order.count({ where: { platform: this.platform } }),
      prisma.productChannel.count({ where: { platform: this.platform } }),
    ]);

    const syncedAt = new Date();

    await prisma.platformIntegration.update({
      where: { platform: this.platform },
      data: { lastSyncedAt: syncedAt },
    });

    return {
      platform: this.platform,
      syncedAt,
      ordersSynced,
      productsSynced,
      success: true,
    };
  }
}
