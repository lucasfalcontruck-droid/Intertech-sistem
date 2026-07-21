import { NextRequest, NextResponse } from "next/server";
import { Platform } from "@prisma/client";
import { getMarketplaceAdapter } from "@/lib/marketplace";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const platform = body?.platform as Platform | undefined;

  if (!platform || !(platform in Platform)) {
    return NextResponse.json({ error: "Plataforma inválida." }, { status: 400 });
  }

  try {
    const adapter = getMarketplaceAdapter(platform);
    const result = await adapter.syncInventory();
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Falha ao sincronizar plataforma." }, { status: 500 });
  }
}
