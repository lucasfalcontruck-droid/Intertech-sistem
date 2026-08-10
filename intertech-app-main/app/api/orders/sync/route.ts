import { NextResponse } from 'next/server';
import { queuedOrderSchema, orderPayloadSchema, persistOrder } from '@/lib/order-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = body as { orders?: Array<Record<string, unknown>> };

    if (!Array.isArray(payload.orders) || payload.orders.length === 0) {
      return NextResponse.json({ error: 'Fila vazia.' }, { status: 400 });
    }

    for (const item of payload.orders) {
      const parsedQueue = queuedOrderSchema.safeParse(item);
      if (!parsedQueue.success) {
        return NextResponse.json({ error: 'Pedido pendente inválido.' }, { status: 400 });
      }

      const items =
        parsedQueue.data.items && parsedQueue.data.items.length > 0
          ? parsedQueue.data.items
          : parsedQueue.data.itemId && parsedQueue.data.quantity
            ? [{ productId: parsedQueue.data.itemId, quantity: parsedQueue.data.quantity }]
            : [];

      if (items.length === 0) {
        return NextResponse.json({ error: 'Pedido pendente sem itens.' }, { status: 400 });
      }

      const orderPayload = {
        customerName: parsedQueue.data.customerName,
        items,
      };


      const parsedOrder = orderPayloadSchema.safeParse(orderPayload);
      if (!parsedOrder.success) {
        return NextResponse.json({ error: 'Pedido inválido para sincronização.' }, { status: 400 });
      }

      await persistOrder(parsedOrder.data);
    }

    return NextResponse.json({ ok: true, synced: payload.orders.length }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao sincronizar pedidos.' },
      { status: 500 },
    );
  }
}
