import { NextRequest, NextResponse } from "next/server";
import { getAllStoresDailyStats, getStoreDailyStats } from "@/lib/queries/store-stats";

/**
 * app/api/marketplace/store-stats/route.ts — Estatísticas de hoje por loja
 * (vendas brutas, unidades, ticket médio, visitas, conversão, cancelados).
 * Sem ?storeId, retorna todas as lojas conectadas; com ?storeId, só uma.
 */
export async function GET(req: NextRequest) {
  try {
    const storeId = req.nextUrl.searchParams.get("storeId");
    if (storeId) {
      const stats = await getStoreDailyStats(storeId);
      if (!stats) return NextResponse.json({ error: "Loja não encontrada." }, { status: 404 });
      return NextResponse.json({ stats });
    }

    const stats = await getAllStoresDailyStats();
    return NextResponse.json({ stats });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível carregar as estatísticas das lojas." },
      { status: 500 },
    );
  }
}
