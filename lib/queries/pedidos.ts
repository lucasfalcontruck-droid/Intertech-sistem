import type { OrderStatus, Platform } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface OrderFilters {
  search?: string;
  platform?: Platform;
  status?: OrderStatus;
  take?: number;
}

export async function listOrders(filters: OrderFilters = {}) {
  const take = filters.take ?? 50;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: {
        ...(filters.search
          ? {
              OR: [
                { number: { contains: filters.search, mode: "insensitive" } },
                { customerName: { contains: filters.search, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(filters.platform ? { platform: filters.platform } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
      orderBy: { createdAt: "desc" },
      take,
      include: { items: { include: { product: true } } },
    }),
    prisma.order.count({
      where: {
        ...(filters.search
          ? {
              OR: [
                { number: { contains: filters.search, mode: "insensitive" } },
                { customerName: { contains: filters.search, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(filters.platform ? { platform: filters.platform } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
    }),
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
