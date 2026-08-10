import { NextResponse } from "next/server";
import { getVendaPorEstado } from "@/lib/queries/relatorios";

/** app/api/relatorios/venda-por-estado/route.ts — Relatório de vendas agrupadas por estado (UF). */

/** Retorna pedidos e valor vendido por estado. */
export async function GET() {
  try {
    const states = await getVendaPorEstado();
    return NextResponse.json({ states });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível carregar a venda por estado." },
      { status: 500 },
    );
  }
}
