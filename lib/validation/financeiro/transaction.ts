/** lib/validation/financeiro/transaction.ts — Schema de validação de contas a pagar/receber. */
import { z } from "zod";
import { TransactionStatus, TransactionType } from "@prisma/client";

export const transactionInputSchema = z.object({
  type: z.nativeEnum(TransactionType),
  description: z.string().trim().min(2, "Informe a descrição."),
  category: z.string().trim().min(2, "Informe a categoria."),
  amount: z.coerce.number().positive("O valor deve ser maior que zero."),
  dueDate: z.coerce.date(),
  status: z.nativeEnum(TransactionStatus).default(TransactionStatus.PENDENTE),
});

export type TransactionInput = z.infer<typeof transactionInputSchema>;

export const transactionUpdateSchema = transactionInputSchema.partial();
