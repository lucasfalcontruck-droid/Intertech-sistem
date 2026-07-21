import { prisma } from "@/lib/prisma";
import { REPORTING_WINDOW_DAYS } from "@/lib/constants";
import { subDays } from "@/lib/reporting";
import { getProductStatus, type ProductStatus } from "@/lib/utils";

export interface ProductFilters {
  search?: string;
  category?: string;
  status?: ProductStatus;
}

export async function listProducts(filters: ProductFilters = {}) {
  const products = await prisma.product.findMany({
    where: {
      ...(filters.search
        ? {
            OR: [
              { name: { contains: filters.search, mode: "insensitive" } },
              { sku: { contains: filters.search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(filters.category ? { category: filters.category } : {}),
    },
    include: { channels: true },
    orderBy: { name: "asc" },
  });

  const withStatus = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    category: p.category,
    price: Number(p.price),
    stock: p.stock,
    minStock: p.minStock,
    status: getProductStatus(p.stock, p.minStock),
    channels: p.channels.map((c) => c.platform),
  }));

  return filters.status ? withStatus.filter((p) => p.status === filters.status) : withStatus;
}

export async function getStockSummary() {
  const products = await prisma.product.findMany({
    select: { price: true, stock: true, minStock: true },
  });

  const totalSkus = products.length;
  const totalStockValue = products.reduce((sum, p) => sum + Number(p.price) * p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;

  return { totalSkus, totalStockValue, lowStockCount, outOfStockCount };
}

export async function getStockByCategory() {
  const windowStart = subDays(new Date(), REPORTING_WINDOW_DAYS);

  const items = await prisma.orderItem.findMany({
    where: { order: { createdAt: { gte: windowStart } } },
    select: { quantity: true, product: { select: { category: true } } },
  });

  const totals = new Map<string, number>();
  for (const item of items) {
    const category = item.product.category;
    totals.set(category, (totals.get(category) ?? 0) + item.quantity);
  }

  return Array.from(totals.entries())
    .map(([category, units]) => ({ category, units }))
    .sort((a, b) => b.units - a.units);
}

export async function getCategories() {
  const rows = await prisma.product.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return rows.map((r) => r.category);
}
