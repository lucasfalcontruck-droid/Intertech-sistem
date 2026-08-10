import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { clienteInputSchema } from "@/lib/validation/cadastros/cliente";

/** app/api/cadastros/clientes/route.ts — Área Cadastros: listagem e criação de clientes. */

/** Lista todos os clientes, ordenados por nome. */
export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json({ clientes });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível carregar os clientes." }, { status: 500 });
  }
}

/** Cria um novo cliente, validando o corpo com clienteInputSchema. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = clienteInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  try {
    const cliente = await prisma.cliente.create({ data: parsed.data });
    return NextResponse.json({ cliente }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Já existe um cliente com esse e-mail." }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: "Não foi possível criar o cliente." }, { status: 500 });
  }
}
