import { NextResponse } from "next/server";
import { getMarketplaceData } from "@/lib/queries/marketplace";

/** app/api/marketplace/route.ts — Área Marketplace: cards de integração e gráfico de vendas por canal. */

/** Retorna os dados da página principal de Marketplace. */
export async function GET() {
  try {
    const data = await getMarketplaceData();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível carregar os dados de marketplace." },
      { status: 500 },
    );
  }
}
