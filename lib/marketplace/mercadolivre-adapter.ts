import { OrderStatus, Platform } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SeedBackedMarketplaceAdapter } from "./base-adapter";
import { getValidMercadoLivreCredentials } from "./mercadolivre-auth";
import { fetchOrdersPage, fetchVisitsToday } from "./mercadolivre-client";
import type { SyncResult } from "./types";

// ML enforces offset+limit <= 1000 on /orders/search without a scroll cursor;
// capping here keeps a first sync fast and well within that limit.
const MAX_ORDERS = 300;
const PAGE_SIZE = 50;

interface MLOrderItem {
  item: { id: string; title: string; category_id?: string };
  quantity: number;
  unit_price: number;
}

interface MLOrder {
  id: number;
  status: string;
  tags?: string[];
  total_amount: number;
  date_created: string;
  buyer?: { nickname?: string };
  order_items: MLOrderItem[];
  shipping?: { status?: string };
}

/**
 * Status do Mercado Livre (campo `status` cru da API) que ainda não são uma
 * venda de verdade — carrinho aberto, aguardando pagamento, ou inválido.
 * O painel "Negócio" do próprio Mercado Livre não conta esses como venda,
 * então a gente nem importa: contar isso como pedido inflava vendas/pedidos
 * bem acima do que a conta realmente vendeu.
 */
const NOT_A_SALE_YET = new Set(["payment_required", "payment_in_process", "invalid"]);

/** Traduz status/tags do Mercado Livre para o enum local OrderStatus. */
function mapStatus(order: MLOrder): OrderStatus {
  if (order.status === "cancelled") return OrderStatus.CANCELADO;
  const tags = order.tags ?? [];
  if (tags.includes("delivered") || order.shipping?.status === "delivered") {
    return OrderStatus.ENTREGUE;
  }
  if (tags.includes("shipped") || order.shipping?.status === "shipped") {
    return OrderStatus.ENVIADO;
  }
  return OrderStatus.PROCESSANDO;
}

/** Real Mercado Livre integration: syncs actual orders/products of one connected store into the local DB. */
export class MercadoLivreMarketplaceAdapter extends SeedBackedMarketplaceAdapter {
  constructor(storeId: string) {
    super(Platform.MERCADO_LIVRE, storeId);
  }

  async syncInventory(): Promise<SyncResult> {
    const creds = await getValidMercadoLivreCredentials(this.storeId);

    const orders: MLOrder[] = [];
    for (let offset = 0; offset < MAX_ORDERS; offset += PAGE_SIZE) {
      const page = await fetchOrdersPage(creds.accessToken, creds.userId, {
        offset,
        limit: PAGE_SIZE,
      });
      const results: MLOrder[] = page.results ?? [];
      orders.push(...results);
      if (results.length < PAGE_SIZE) break;
    }

    const productIds = new Set<string>();
    const realOrders = orders.filter((o) => !NOT_A_SALE_YET.has(o.status));

    for (const order of realOrders) {
      const savedOrder = await prisma.order.upsert({
        where: { number: String(order.id) },
        create: {
          number: String(order.id),
          customerName: order.buyer?.nickname ?? "Cliente Mercado Livre",
          platform: Platform.MERCADO_LIVRE,
          storeId: this.storeId,
          total: order.total_amount,
          status: mapStatus(order),
          createdAt: new Date(order.date_created),
        },
        update: {
          customerName: order.buyer?.nickname ?? "Cliente Mercado Livre",
          storeId: this.storeId,
          total: order.total_amount,
          status: mapStatus(order),
        },
      });

      await prisma.orderItem.deleteMany({ where: { orderId: savedOrder.id } });

      for (const orderItem of order.order_items ?? []) {
        const product = await prisma.product.upsert({
          where: { sku: orderItem.item.id },
          create: {
            sku: orderItem.item.id,
            name: orderItem.item.title,
            category: orderItem.item.category_id ?? "Mercado Livre",
            price: orderItem.unit_price,
            stock: 0,
            minStock: 0,
          },
          update: {
            name: orderItem.item.title,
            price: orderItem.unit_price,
          },
        });
        productIds.add(product.id);

        await prisma.productChannel.upsert({
          where: { productId_platform: { productId: product.id, platform: Platform.MERCADO_LIVRE } },
          create: { productId: product.id, platform: Platform.MERCADO_LIVRE },
          update: {},
        });

        await prisma.orderItem.create({
          data: {
            orderId: savedOrder.id,
            productId: product.id,
            quantity: orderItem.quantity,
            unitPrice: orderItem.unit_price,
          },
        });
      }
    }

    const visitsToday = await fetchVisitsToday(creds.accessToken, creds.userId).catch((error) => {
      console.error(`[ml-sync] Falha ao buscar visitas (loja ${this.storeId}):`, error);
      return null;
    });

    const syncedAt = new Date();
    await prisma.store.update({
      where: { id: this.storeId },
      data: { lastSyncedAt: syncedAt, ...(visitsToday !== null ? { visitsToday } : {}) },
    });

    return {
      platform: Platform.MERCADO_LIVRE,
      storeId: this.storeId,
      syncedAt,
      ordersSynced: realOrders.length,
      productsSynced: productIds.size,
      success: true,
    };
  }
}
