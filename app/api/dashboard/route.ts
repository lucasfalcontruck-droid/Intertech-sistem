import { NextRequest, NextResponse } from "next/server";
import { getDashboardData } from "@/lib/queries/dashboard";

/** app/api/dashboard/route.ts — Área Dashboard: KPIs e gráficos da visão geral. Aceita ?storeId= pra filtrar por loja. */

/** Retorna os dados da página inicial do Dashboard. */
export async function GET(req: NextRequest) {
  try {
    const storeId = req.nextUrl.searchParams.get("storeId") ?? undefined;
    const data = await getDashboardData(storeId);
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível carregar o dashboard." }, { status: 500 });
  }
}
