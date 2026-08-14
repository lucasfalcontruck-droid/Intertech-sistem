import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isValidVendedorApiKey } from "@/lib/integrations/vendedor-auth";

/**
 * app/api/integrations/vendedor/users/route.ts — Sincronização de contas com o
 * app do Vendedor de Rua. O sistema principal é a fonte única das contas; o app
 * puxa a lista (GET) para manter cópias locais (login offline) e envia novos
 * usuários criados pelo admin no app (POST). Autenticada por chave fixa
 * (x-vendedor-api-key), igual às outras rotas de integração.
 */

const userInputSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "VENDEDOR", "Operador"]).default("VENDEDOR"),
  seller: z.string().nullable().optional(),
});

/** Campos enviados ao app: o passwordHash (bcrypt) permite o login offline local. */
const SYNC_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  seller: true,
  passwordHash: true,
  updatedAt: true,
} as const;

export async function GET(req: NextRequest) {
  if (!isValidVendedorApiKey(req)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      select: SYNC_SELECT,
      orderBy: [{ name: "asc" }],
    });
    return NextResponse.json({ users });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível carregar as contas." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isValidVendedorApiKey(req)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = userInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados do usuário inválidos." },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Já existe uma conta com este e-mail." },
      { status: 409 },
    );
  }

  try {
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        passwordHash: bcrypt.hashSync(parsed.data.password, 10),
        role: parsed.data.role,
        seller: parsed.data.seller ?? null,
      },
      select: SYNC_SELECT,
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível criar a conta." },
      { status: 500 },
    );
  }
}
