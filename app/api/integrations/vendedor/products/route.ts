import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidVendedorApiKey } from "@/lib/integrations/vendedor-auth";

/**
 * app/api/integrations/vendedor/products/route.ts — Catálogo real de produtos
 * (com estoque de verdade) exposto para o app do Vendedor de Rua. Chamada
 * servidor-a-servidor, autenticada por chave (ver lib/integrations/vendedor-auth.ts),
 * não por sessão de usuário.
 */

/** Lista todos os produtos com seu estoque atual, para o app do vendedor montar o catálogo. */
export async function GET(req: NextRequest) {
  if (!isValidVendedorApiKey(req)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        sku: true,
        category: true,
        price: true,
        stock: true,
        minStock: true,
      },
    });

    return NextResponse.json(
      products.map((p) => ({ ...p, price: Number(p.price) })),
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível carregar os produtos." }, { status: 500 });
  }
}
