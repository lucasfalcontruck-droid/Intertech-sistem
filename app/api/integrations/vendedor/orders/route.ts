import { NextRequest, NextResponse } from "next/server";
import { Platform } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isValidVendedorApiKey } from "@/lib/integrations/vendedor-auth";
import { vendedorOrderInputSchema } from "@/lib/validation/integrations/vendedor";

/**
 * app/api/integrations/vendedor/orders/route.ts — Recebe um pedido feito no
 * app do Vendedor de Rua, grava como Order/OrderItem de verdade (canal
 * VENDEDOR_RUA) e desconta o estoque real numa transação atômica — mesma
 * lógica que o app do vendedor tinha localmente, agora contra o banco real.
 */

/** Registra um pedido do Vendedor de Rua e desconta o estoque dos produtos vendidos. */
export async function POST(req: NextRequest) {
  if (!isValidVendedorApiKey(req)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = vendedorOrderInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados do pedido inválidos." },
      { status: 400 },
    );
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const productIds = parsed.data.items.map((item) => item.productId);
      const products = await tx.product.findMany({ where: { id: { in: productIds } } });
      const productMap = new Map(products.map((p) => [p.id, p]));

      const orderLines = parsed.data.items.map((item) => {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new Error(`Produto ${item.productId} não encontrado no estoque.`);
        }
        if (product.stock < item.quantity) {
          throw new Error(
            `Estoque insuficiente para "${product.name}". Disponível: ${product.stock}, solicitado: ${item.quantity}.`,
          );
        }
        return { productId: item.productId, quantity: item.quantity, unitPrice: product.price };
      });

      const total = orderLines.reduce(
        (sum, line) => sum + Number(line.unitPrice) * line.quantity,
        0,
      );

      const createdOrder = await tx.order.create({
        data: {
          number: `VR-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
          customerName: parsed.data.customerName,
          platform: Platform.VENDEDOR_RUA,
          total,
          status: "PROCESSANDO",
          items: { create: orderLines },
        },
      });

      for (const item of parsed.data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return createdOrder;
    });

    return NextResponse.json(
      { ok: true, orderId: order.id, number: order.number, total: Number(order.total) },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao registrar o pedido." },
      { status: 400 },
    );
  }
}
