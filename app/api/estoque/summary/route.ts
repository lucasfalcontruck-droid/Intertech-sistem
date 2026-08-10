import { NextResponse } from "next/server";
import { getCategories, getStockByCategory, getStockSummary } from "@/lib/queries/estoque";

/** app/api/estoque/summary/route.ts — Área Estoque: KPIs gerais + estoque por categoria para a página principal. */

/** Agrega os dados que a página Estoque precisa numa única resposta. */
export async function GET() {
  try {
    const [summary, byCategory, categories] = await Promise.all([
      getStockSummary(),
      getStockByCategory(),
      getCategories(),
    ]);
    return NextResponse.json({ summary, byCategory, categories });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível carregar o resumo de estoque." },
      { status: 500 },
    );
  }
}
