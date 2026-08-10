/** lib/validation/cadastros/cliente.ts — Schema de validação do cadastro de clientes. */
import { z } from "zod";

export const clienteInputSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do cliente."),
  email: z.string().trim().email("Informe um e-mail válido."),
  phone: z.string().trim().min(8, "Informe o telefone."),
  city: z.string().trim().min(2, "Informe a cidade."),
  state: z.string().trim().min(2, "Informe o estado (UF)."),
});

export type ClienteInput = z.infer<typeof clienteInputSchema>;

export const clienteUpdateSchema = clienteInputSchema.partial();
