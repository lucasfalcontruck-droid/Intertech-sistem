import { NextRequest, NextResponse } from "next/server";
import { CustoTipo } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { custoInputSchema } from "@/lib/validation/financeiro/custo";

/** app/api/financeiro/custos/route.ts — Área Financeiro: listagem e criação de custos. */

/** Lista custos, opcionalmente filtrados por tipo (fixo/variável). */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo") as CustoTipo | null;

  try {
    const custos = await prisma.custoItem.findMany({
      where: tipo ? { tipo } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      custos: custos.map((c) => ({ ...c, value: Number(c.value) })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível carregar os custos." }, { status: 500 });
  }
}

/** Cria um novo custo. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = custoInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  try {
    const custo = await prisma.custoItem.create({ data: parsed.data });
    return NextResponse.json({ custo: { ...custo, value: Number(custo.value) } }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível criar o custo." }, { status: 500 });
  }
}
