import { NextResponse } from "next/server";
import { getCategories, getStockByCategory, getStockSummary } from "@/lib/queries/estoque";

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
