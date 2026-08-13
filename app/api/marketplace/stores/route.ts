import { NextRequest, NextResponse } from "next/server";
import { Platform } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { storeInputSchema } from "@/lib/validation/marketplace/store";

/**
 * app/api/marketplace/stores/route.ts — Área Marketplace: adicionar uma loja
 * manualmente (Shopee, TikTok Shop, Vendedor de Rua — plataformas que ainda
 * não têm OAuth real, ao contrário do Mercado Livre). Sempre cria uma loja
 * nova, permitindo várias contas conectadas na mesma plataforma.
 */

/** Adiciona uma loja/conta manualmente. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = storeInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  if (parsed.data.platform === Platform.MERCADO_LIVRE) {
    return NextResponse.json(
      { error: "Contas do Mercado Livre são conectadas via login real, use o botão de conectar." },
      { status: 400 },
    );
  }

  try {
    const store = await prisma.store.create({
      data: {
        platform: parsed.data.platform,
        storeName: parsed.data.storeName,
        feePercentage: parsed.data.feePercentage,
        status: "CONNECTED",
        lastSyncedAt: new Date(),
        credentials: { note: "Loja adicionada manualmente — sem integração de API real ainda." },
      },
    });
    return NextResponse.json({ store }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível adicionar a loja." }, { status: 500 });
  }
}

/**
 * Remove uma loja conectada (?id=...) e todos os pedidos dela. Precisa
 * apagar os pedidos junto — se só desconectasse (deixando storeId nulo),
 * esses pedidos virariam "órfãos" e continuariam entrando nas somas de
 * vendas consolidadas (foi exatamente esse bug que inflava o Dashboard).
 */
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id é obrigatório." }, { status: 400 });
  }

  try {
    await prisma.$transaction([
      prisma.orderItem.deleteMany({ where: { order: { storeId: id } } }),
      prisma.order.deleteMany({ where: { storeId: id } }),
      prisma.store.delete({ where: { id } }),
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível remover a loja." }, { status: 500 });
  }
}
