import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { campanhaInputSchema } from "@/lib/validation/marketplace/campanha";

/** app/api/marketplace/campanhas/route.ts — Área Marketplace: listagem e criação de campanhas. */

/** Converte os campos Decimal do Prisma para number antes de responder. */
function serialize(c: {
  id: string;
  name: string;
  platform: string;
  dailyBudget: Prisma.Decimal;
  spent: Prisma.Decimal;
  clicks: number;
  conversions: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return { ...c, dailyBudget: Number(c.dailyBudget), spent: Number(c.spent) };
}

/** Lista todas as campanhas, mais recentes primeiro. */
export async function GET() {
  try {
    const campanhas = await prisma.campanha.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ campanhas: campanhas.map(serialize) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível carregar as campanhas." }, { status: 500 });
  }
}

/** Cria uma nova campanha. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = campanhaInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  try {
    const campanha = await prisma.campanha.create({ data: parsed.data });
    return NextResponse.json({ campanha: serialize(campanha) }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível criar a campanha." }, { status: 500 });
  }
}
