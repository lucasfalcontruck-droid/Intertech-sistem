import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { insumoInputSchema } from "@/lib/validation/estoque/insumo";

/** app/api/estoque/insumos/route.ts — Área Estoque: listagem e criação de insumos (matéria-prima). */

/** Lista todos os insumos, ordenados por nome. */
export async function GET() {
  try {
    const insumos = await prisma.insumo.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json({
      insumos: insumos.map((i) => ({ ...i, unitCost: Number(i.unitCost) })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível carregar os insumos." }, { status: 500 });
  }
}

/** Cria um novo insumo. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = insumoInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  try {
    const insumo = await prisma.insumo.create({ data: parsed.data });
    return NextResponse.json(
      { insumo: { ...insumo, unitCost: Number(insumo.unitCost) } },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Já existe um insumo com esse nome." }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: "Não foi possível criar o insumo." }, { status: 500 });
  }
}
