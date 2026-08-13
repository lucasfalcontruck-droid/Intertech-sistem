import { NextRequest, NextResponse } from "next/server";
import type { OrderStatus, Platform } from "@prisma/client";
import { listOrders } from "@/lib/queries/pedidos";

/** app/api/pedidos/route.ts — Área Pedidos: listagem paginada de pedidos de venda. */

/** Lista pedidos de venda com filtros de busca, plataforma, status e período. */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? undefined;
  const platform = (searchParams.get("platform") as Platform | null) ?? undefined;
  const storeId = searchParams.get("storeId") ?? undefined;
  const status = (searchParams.get("status") as OrderStatus | null) ?? undefined;
  const dateFromParam = searchParams.get("dateFrom");
  const dateToParam = searchParams.get("dateTo");
  const dateFrom = dateFromParam ? new Date(dateFromParam) : undefined;
  const dateTo = dateToParam ? new Date(`${dateToParam}T23:59:59.999`) : undefined;

  try {
    const data = await listOrders({ search, platform, storeId, status, dateFrom, dateTo });
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível carregar os pedidos." }, { status: 500 });
  }
}
