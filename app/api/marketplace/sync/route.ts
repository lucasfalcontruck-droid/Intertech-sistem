import { NextRequest, NextResponse } from "next/server";
import { getMarketplaceAdapterByStoreId } from "@/lib/marketplace";

/**
 * app/api/marketplace/sync/route.ts — Área Marketplace: botão "Sincronizar"
 * de cada card de loja. Delega pro adaptador certo (real para Mercado
 * Livre, mock para as demais plataformas ainda não integradas).
 */

/** Sincroniza o inventário/pedidos de uma loja específica. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const storeId = body?.storeId as string | undefined;

  if (!storeId) {
    return NextResponse.json({ error: "storeId é obrigatório." }, { status: 400 });
  }

  try {
    const adapter = await getMarketplaceAdapterByStoreId(storeId);
    const result = await adapter.syncInventory();
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Falha ao sincronizar loja." }, { status: 500 });
  }
}
