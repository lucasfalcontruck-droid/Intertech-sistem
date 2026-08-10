import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { custoUpdateSchema } from "@/lib/validation/financeiro/custo";

/** app/api/financeiro/custos/[id]/route.ts — Área Financeiro: edição e exclusão de um custo. */

/** Atualiza um custo existente. */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = custoUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  try {
    const custo = await prisma.custoItem.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ custo: { ...custo, value: Number(custo.value) } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Custo não encontrado." }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ error: "Não foi possível atualizar o custo." }, { status: 500 });
  }
}

/** Exclui um custo. */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await prisma.custoItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Custo não encontrado." }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ error: "Não foi possível excluir o custo." }, { status: 500 });
  }
}
