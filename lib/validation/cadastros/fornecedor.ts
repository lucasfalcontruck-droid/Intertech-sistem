/** lib/validation/cadastros/fornecedor.ts — Schema de validação do cadastro de fornecedores. */
import { z } from "zod";
import { FornecedorTipo } from "@prisma/client";

export const fornecedorInputSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do fornecedor."),
  tipo: z.nativeEnum(FornecedorTipo),
  contact: z.string().trim().min(3, "Informe um contato (e-mail ou telefone)."),
  leadTimeDays: z.coerce.number().int().min(0, "O prazo não pode ser negativo."),
  active: z.coerce.boolean().default(true),
});

export type FornecedorInput = z.infer<typeof fornecedorInputSchema>;

export const fornecedorUpdateSchema = fornecedorInputSchema.partial();
