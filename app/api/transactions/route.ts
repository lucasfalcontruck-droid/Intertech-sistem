import { NextRequest, NextResponse } from "next/server";
import { TransactionStatus, TransactionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { transactionInputSchema } from "@/lib/validation/transaction";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as TransactionType | null;

  try {
    const transactions = await prisma.financialTransaction.findMany({
      where: type ? { type } : undefined,
      orderBy: { dueDate: "asc" },
    });
    return NextResponse.json({
      transactions: transactions.map((t) => ({ ...t, amount: Number(t.amount) })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível carregar as transações." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = transactionInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  try {
    const transaction = await prisma.financialTransaction.create({
      data: {
        ...parsed.data,
        paidAt: parsed.data.status === TransactionStatus.PAGO ? new Date() : null,
      },
    });
    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível criar a transação." }, { status: 500 });
  }
}
