import type { OrderStatus, Platform } from "@prisma/client";

export interface SalesSummary {
  platform: Platform;
  totalSales: number;
  orderCount: number;
  averageTicket: number;
  periodStart: Date;
  periodEnd: Date;
}

export interface MarketplaceOrder {
  id: string;
  number: string;
  customerName: string;
  platform: Platform;
  total: number;
  status: OrderStatus;
  createdAt: Date;
}

export interface SyncResult {
  platform: Platform;
  syncedAt: Date;
  ordersSynced: number;
  productsSynced: number;
  success: boolean;
}

export interface GetOrdersParams {
  limit?: number;
  since?: Date;
}

/**
 * Contract every marketplace integration must satisfy. Today it's backed by
 * seeded/mocked data; swapping an implementation for one that calls the
 * official Mercado Livre / Shopee / TikTok Shop APIs should not require any
 * change on the calling side.
 */
export interface MarketplaceAdapter {
  platform: Platform;
  getSales(periodStart: Date, periodEnd: Date): Promise<SalesSummary>;
  getOrders(params?: GetOrdersParams): Promise<MarketplaceOrder[]>;
  syncInventory(): Promise<SyncResult>;
}
