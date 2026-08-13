/**
 * lib/queries/pedidos.ts — Área Pedidos: listagem paginada de pedidos de
 * venda com filtros por busca, plataforma, status e período.
 */
import type { OrderStatus, Platform } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface OrderFilters {
  search?: string;
  platform?: Platform;
  storeId?: string;
  status?: OrderStatus;
  dateFrom?: Date;
  dateTo?: Date;
  take?: number;
}

/** Lista pedidos com filtros combinados e retorna também o total (para paginação). */
export async function listOrders(filters: OrderFilters = {}) {
  const take = filters.take ?? 50;

  const where = {
    ...(filters.search
      ? {
          OR: [
            { number: { contains: filters.search, mode: "insensitive" as const } },
            { customerName: { contains: filters.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(filters.platform ? { platform: filters.platform } : {}),
    ...(filters.storeId ? { storeId: filters.storeId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.dateFrom || filters.dateTo
      ? {
          createdAt: {
            ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
            ...(filters.dateTo ? { lte: filters.dateTo } : {}),
          },
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      include: { items: { include: { product: true } } },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    total,
    orders: orders.map((o) => ({
      id: o.id,
      number: o.number,
      customerName: o.customerName,
      platform: o.platform,
      total: Number(o.total),
      status: o.status,
      createdAt: o.createdAt,
      items: o.items.map((i) => ({
        productName: i.product.name,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
      })),
    })),
  };
}
