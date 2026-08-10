import { NextResponse } from "next/server";
import { getVendasPorAnuncio } from "@/lib/queries/relatorios";

/** app/api/relatorios/vendas-por-anuncio/route.ts — Relatório de desempenho por anúncio. */

/** Retorna visualizações, vendas, conversão e receita por anúncio. */
export async function GET() {
  try {
    const ads = await getVendasPorAnuncio();
    return NextResponse.json({ ads });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível carregar as vendas por anúncio." },
      { status: 500 },
    );
  }
}
