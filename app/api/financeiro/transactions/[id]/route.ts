import { NextRequest, NextResponse } from "next/server";
import { Prisma, TransactionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { transactionUpdateSchema } from "@/lib/validation/financeiro/transaction";

/** app/api/financeiro/transactions/[id]/route.ts — Área Financeiro: edição e exclusão de um lançamento. */

/** Atualiza um lançamento, ajustando paidAt conforme a mudança de status. */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = transactionUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  const data = { ...parsed.data };
  const paidAtUpdate =
    data.status === TransactionStatus.PAGO
      ? { paidAt: new Date() }
      : data.status
        ? { paidAt: null }
        : {};

  try {
    const transaction = await prisma.financialTransaction.update({
      where: { id },
      data: { ...data, ...paidAtUpdate },
    });
    return NextResponse.json({ transaction });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Transação não encontrada." }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ error: "Não foi possível atualizar a transação." }, { status: 500 });
  }
}

/** Exclui um lançamento. */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await prisma.financialTransaction.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Transação não encontrada." }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ error: "Não foi possível excluir a transação." }, { status: 500 });
  }
}
