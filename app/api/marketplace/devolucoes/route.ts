import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { devolucaoInputSchema } from "@/lib/validation/marketplace/devolucao";

/** app/api/marketplace/devolucoes/route.ts — Área Marketplace: listagem e criação de devoluções. */

/** Lista todas as devoluções, mais recentes primeiro. */
export async function GET() {
  try {
    const devolucoes = await prisma.devolucao.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({
      devolucoes: devolucoes.map((d) => ({ ...d, value: Number(d.value) })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível carregar as devoluções." },
      { status: 500 },
    );
  }
}

/** Registra uma nova devolução. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = devolucaoInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  try {
    const devolucao = await prisma.devolucao.create({ data: parsed.data });
    return NextResponse.json(
      { devolucao: { ...devolucao, value: Number(devolucao.value) } },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível criar a devolução." }, { status: 500 });
  }
}
