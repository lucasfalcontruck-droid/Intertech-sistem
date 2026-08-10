/** lib/validation/marketplace/campanha.ts — Schema de validação de campanhas de anúncio. */
import { z } from "zod";
import { Platform, CampanhaStatus } from "@prisma/client";

export const campanhaInputSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da campanha."),
  platform: z.nativeEnum(Platform),
  dailyBudget: z.coerce.number().positive("O orçamento diário deve ser maior que zero."),
  spent: z.coerce.number().min(0, "O gasto não pode ser negativo.").default(0),
  clicks: z.coerce.number().int().min(0).default(0),
  conversions: z.coerce.number().int().min(0).default(0),
  status: z.nativeEnum(CampanhaStatus).default(CampanhaStatus.ATIVA),
});

export type CampanhaInput = z.infer<typeof campanhaInputSchema>;

export const campanhaUpdateSchema = campanhaInputSchema.partial();
