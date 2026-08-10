import { NextResponse } from "next/server";
import { getStockValueByCategory } from "@/lib/queries/estoque";

/** app/api/estoque/categoria/route.ts — Área Estoque: valor em estoque agrupado por categoria. */

/** Retorna SKUs, unidades e valor em estoque por categoria. */
export async function GET() {
  try {
    const categories = await getStockValueByCategory();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível carregar o estoque por categoria." },
      { status: 500 },
    );
  }
}
