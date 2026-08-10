/** lib/validation/financeiro/custo.ts — Schema de validação de custos fixos/variáveis. */
import { z } from "zod";
import { CustoTipo } from "@prisma/client";

export const custoInputSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do custo."),
  tipo: z.nativeEnum(CustoTipo),
  value: z.coerce.number().positive("O valor deve ser maior que zero."),
});

export type CustoInput = z.infer<typeof custoInputSchema>;

export const custoUpdateSchema = custoInputSchema.partial();
