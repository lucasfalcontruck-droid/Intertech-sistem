import { NextResponse } from "next/server";
import { getPainelAoVivoMercadoLivre } from "@/lib/queries/relatorios";

/** app/api/dashboard/painel-ao-vivo/route.ts — Painel ao vivo de vendas do Mercado Livre (polling 15s). */

/** Retorna vendas de hoje e o feed dos últimos pedidos do Mercado Livre. */
export async function GET() {
  try {
    const data = await getPainelAoVivoMercadoLivre();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível carregar o painel ao vivo." },
      { status: 500 },
    );
  }
}
