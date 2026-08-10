/**
 * lib/prisma.ts — Instância única (singleton) do Prisma Client, usada por
 * todas as queries e rotas de API do sistema.
 */
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Reaproveita a instância entre hot-reloads do Next.js em dev, evitando
// abrir uma conexão nova a cada recarregamento de módulo.
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
