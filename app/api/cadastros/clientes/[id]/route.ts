import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { clienteUpdateSchema } from "@/lib/validation/cadastros/cliente";

/** app/api/cadastros/clientes/[id]/route.ts — Área Cadastros: edição e exclusão de um cliente. */

/** Atualiza campos de um cliente existente. */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = clienteUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  try {
    const cliente = await prisma.cliente.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ cliente });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Já existe um cliente com esse e-mail." },
          { status: 409 },
        );
      }
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
      }
    }
    console.error(error);
    return NextResponse.json({ error: "Não foi possível atualizar o cliente." }, { status: 500 });
  }
}

/** Exclui um cliente. */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await prisma.cliente.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ error: "Não foi possível excluir o cliente." }, { status: 500 });
  }
}
