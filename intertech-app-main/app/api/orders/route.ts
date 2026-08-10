import { NextResponse } from 'next/server';
import { orderPayloadSchema, persistOrder } from '@/lib/order-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = orderPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados do pedido inválidos.' }, { status: 400 });
    }

    const order = await persistOrder(parsed.data);
    return NextResponse.json(
      { ok: true, orderId: order.id, number: order.number, total: String(order.total) },
      { status: 201 },
    );
  } catch (error) {
    console.error('Erro no registro do pedido:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao registrar pedido no banco de dados.' },
      { status: 400 },
    );
  }
}

