import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { campanhaUpdateSchema } from "@/lib/validation/marketplace/campanha";

/** app/api/marketplace/campanhas/[id]/route.ts — Área Marketplace: edição e exclusão de uma campanha. */

/** Atualiza uma campanha existente. */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = campanhaUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  try {
    const campanha = await prisma.campanha.update({ where: { id }, data: parsed.data });
    return NextResponse.json({
      campanha: { ...campanha, dailyBudget: Number(campanha.dailyBudget), spent: Number(campanha.spent) },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Campanha não encontrada." }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ error: "Não foi possível atualizar a campanha." }, { status: 500 });
  }
}

/** Exclui uma campanha. */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await prisma.campanha.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Campanha não encontrada." }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ error: "Não foi possível excluir a campanha." }, { status: 500 });
  }
}
