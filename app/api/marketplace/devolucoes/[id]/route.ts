import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { devolucaoUpdateSchema } from "@/lib/validation/marketplace/devolucao";

/** app/api/marketplace/devolucoes/[id]/route.ts — Área Marketplace: edição e exclusão de uma devolução. */

/** Atualiza uma devolução existente. */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = devolucaoUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  try {
    const devolucao = await prisma.devolucao.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ devolucao: { ...devolucao, value: Number(devolucao.value) } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Devolução não encontrada." }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ error: "Não foi possível atualizar a devolução." }, { status: 500 });
  }
}

/** Exclui uma devolução. */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await prisma.devolucao.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Devolução não encontrada." }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ error: "Não foi possível excluir a devolução." }, { status: 500 });
  }
}
