/** lib/validation/integrations/vendedor.ts — Schema de validação de pedidos vindos do app do Vendedor de Rua. */
import { z } from "zod";

export const vendedorOrderInputSchema = z.object({
  customerName: z.string().trim().min(2, "Informe o nome do cliente."),
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1, "Produto inválido."),
        quantity: z.coerce.number().int().positive("A quantidade deve ser maior que zero."),
      }),
    )
    .min(1, "O pedido precisa ter pelo menos um item."),
});

export type VendedorOrderInput = z.infer<typeof vendedorOrderInputSchema>;
