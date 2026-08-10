import { NextResponse } from "next/server";
import { getCanalPerformance } from "@/lib/queries/relatorios";

/** app/api/relatorios/canais/route.ts — Relatório de desempenho por canal de venda. */

/** Retorna receita, pedidos, lucro e margem por plataforma. */
export async function GET() {
  try {
    const canais = await getCanalPerformance();
    return NextResponse.json({ canais });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível carregar o desempenho por canal." },
      { status: 500 },
    );
  }
}
