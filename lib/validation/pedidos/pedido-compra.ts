/** lib/validation/pedidos/pedido-compra.ts — Schema de validação de pedidos de compra (insumo/produto). */
import { z } from "zod";
import { FornecedorTipo, PedidoCompraStatus } from "@prisma/client";

export const pedidoCompraInputSchema = z.object({
  tipo: z.nativeEnum(FornecedorTipo),
  fornecedorId: z.string().trim().min(1, "Selecione um fornecedor."),
  itemName: z.string().trim().min(2, "Informe o item."),
  quantity: z.coerce.number().int().positive("A quantidade deve ser maior que zero."),
  value: z.coerce.number().positive("O valor deve ser maior que zero."),
  status: z.nativeEnum(PedidoCompraStatus).default(PedidoCompraStatus.AGUARDANDO),
  expectedDate: z.coerce.date(),
});

export type PedidoCompraInput = z.infer<typeof pedidoCompraInputSchema>;

export const pedidoCompraUpdateSchema = pedidoCompraInputSchema.partial();
