import { NextResponse } from "next/server";
import { getLucrosMensal } from "@/lib/queries/relatorios";

/** app/api/relatorios/lucros/route.ts — Relatório de lucro mensal (últimos 6 meses). */

/** Retorna receita, custo e lucro por mês. */
export async function GET() {
  try {
    const months = await getLucrosMensal();
    return NextResponse.json({ months });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível carregar o relatório de lucros." },
      { status: 500 },
    );
  }
}
