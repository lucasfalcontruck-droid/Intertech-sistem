import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/queries/dashboard";

/** app/api/dashboard/route.ts — Área Dashboard: KPIs e gráficos da visão geral. */

/** Retorna os dados da página inicial do Dashboard. */
export async function GET() {
  try {
    const data = await getDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível carregar o dashboard." }, { status: 500 });
  }
}
