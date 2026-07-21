import { NextRequest, NextResponse } from "next/server";
import type { OrderStatus, Platform } from "@prisma/client";
import { listOrders } from "@/lib/queries/pedidos";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? undefined;
  const platform = (searchParams.get("platform") as Platform | null) ?? undefined;
  const status = (searchParams.get("status") as OrderStatus | null) ?? undefined;

  try {
    const data = await listOrders({ search, platform, status });
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível carregar os pedidos." }, { status: 500 });
  }
}
