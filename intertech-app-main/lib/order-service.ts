import { z } from 'zod';
import { intertechFetch } from '@/lib/intertech-client';

/**
 * lib/order-service.ts — Camada de persistência de pedidos. Antes gravava
 * direto no SQLite local; agora envia o pedido pro sistema principal da
 * Intertech, que valida o estoque de verdade, cria o pedido (canal
 * "Vendedor de Rua") e desconta o estoque real numa transação atômica.
 */

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const orderPayloadSchema = z.object({
  customerName: z.string().min(2),
  items: z.array(orderItemSchema).min(1),
});

export const queuedOrderSchema = z.object({
  customerName: z.string().min(2),
  itemId: z.string().optional(),
  quantity: z.number().int().positive().optional(),
  items: z.array(orderItemSchema).optional(),
  createdAt: z.string(),
});

interface PersistedOrder {
  id: string;
  number: string;
  total: number;
}

/** Envia o pedido para o sistema principal, que valida estoque, cria o pedido e desconta o estoque real. */
export async function persistOrder(
  orderPayload: z.infer<typeof orderPayloadSchema>,
): Promise<PersistedOrder> {
  const response = await intertechFetch('/api/integrations/vendedor/orders', {
    method: 'POST',
    body: JSON.stringify(orderPayload),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.error ?? 'Não foi possível registrar o pedido no sistema principal.');
  }

  return { id: body.orderId, number: body.number, total: Number(body.total) };
}
