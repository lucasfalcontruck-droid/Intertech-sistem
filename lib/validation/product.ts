import { z } from "zod";
import { Platform } from "@prisma/client";

export const productInputSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do produto."),
  sku: z.string().trim().min(2, "Informe o SKU."),
  category: z.string().trim().min(2, "Informe a categoria."),
  price: z.coerce.number().positive("O preço deve ser maior que zero."),
  stock: z.coerce.number().int().min(0, "O estoque não pode ser negativo."),
  minStock: z.coerce.number().int().min(0, "O estoque mínimo não pode ser negativo."),
  channels: z.array(z.nativeEnum(Platform)).default([]),
});

export type ProductInput = z.infer<typeof productInputSchema>;
