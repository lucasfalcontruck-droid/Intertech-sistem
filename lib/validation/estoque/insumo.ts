/**
 * lib/validation/estoque/insumo.ts — Schemas de validação de insumos
 * (matéria-prima) e de suas movimentações de entrada/saída no estoque.
 */
import { z } from "zod";
import { InsumoMovimentoTipo } from "@prisma/client";

export const insumoInputSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do insumo."),
  unit: z.string().trim().min(1, "Informe a unidade.").default("un"),
  currentStock: z.coerce.number().int().min(0, "O estoque não pode ser negativo.").default(0),
  minStock: z.coerce.number().int().min(0, "O estoque mínimo não pode ser negativo.").default(0),
  unitCost: z.coerce.number().positive("O custo unitário deve ser maior que zero."),
});

export type InsumoInput = z.infer<typeof insumoInputSchema>;

export const insumoUpdateSchema = insumoInputSchema.partial();

/** Movimentação de estoque de um insumo (entrada/saída), vinculada a uma nota fiscal. */
export const insumoMovimentoInputSchema = z.object({
  insumoId: z.string().trim().min(1, "Selecione um insumo."),
  tipo: z.nativeEnum(InsumoMovimentoTipo),
  quantity: z.coerce.number().int().positive("A quantidade deve ser maior que zero."),
  notaFiscal: z.string().trim().min(2, "Informe o número da nota fiscal."),
  party: z.string().trim().min(2, "Informe a origem ou destino."),
  value: z.coerce.number().positive("O valor deve ser maior que zero."),
  date: z.coerce.date().optional(),
});

export type InsumoMovimentoInput = z.infer<typeof insumoMovimentoInputSchema>;
