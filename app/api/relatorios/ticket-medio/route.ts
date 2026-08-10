import { NextResponse } from "next/server";
import { getTicketMedioGeral, getTicketMedioPorProduto } from "@/lib/queries/relatorios";

/** app/api/relatorios/ticket-medio/route.ts — Relatório de ticket médio geral e por produto. */

/** Retorna o ticket médio geral e o detalhamento por produto. */
export async function GET() {
  try {
    const [overall, byProduct] = await Promise.all([
      getTicketMedioGeral(),
      getTicketMedioPorProduto(),
    ]);
    return NextResponse.json({ overall, byProduct });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível carregar o ticket médio." },
      { status: 500 },
    );
  }
}
