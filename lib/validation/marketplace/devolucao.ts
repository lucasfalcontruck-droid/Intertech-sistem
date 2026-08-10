/** lib/validation/marketplace/devolucao.ts — Schema de validação de devoluções de venda. */
import { z } from "zod";
import { Platform, DevolucaoStatus } from "@prisma/client";

export const devolucaoInputSchema = z.object({
  orderNumber: z.string().trim().optional(),
  product: z.string().trim().min(2, "Informe o produto."),
  reason: z.string().trim().min(2, "Informe o motivo."),
  platform: z.nativeEnum(Platform),
  value: z.coerce.number().positive("O valor deve ser maior que zero."),
  status: z.nativeEnum(DevolucaoStatus).default(DevolucaoStatus.SOLICITADA),
});

export type DevolucaoInput = z.infer<typeof devolucaoInputSchema>;

export const devolucaoUpdateSchema = devolucaoInputSchema.partial();
