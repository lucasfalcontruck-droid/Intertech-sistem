/** lib/validation/marketplace/store.ts — Schema de validação para adicionar uma loja manualmente (plataformas sem OAuth real ainda). */
import { z } from "zod";
import { Platform } from "@prisma/client";

export const storeInputSchema = z.object({
  platform: z.nativeEnum(Platform),
  storeName: z.string().trim().min(2, "Informe o nome/apelido da loja."),
  feePercentage: z.coerce.number().min(0, "A taxa não pode ser negativa.").max(100),
});

export type StoreInput = z.infer<typeof storeInputSchema>;
