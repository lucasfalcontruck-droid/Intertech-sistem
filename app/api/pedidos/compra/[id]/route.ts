import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { pedidoCompraUpdateSchema } from "@/lib/validation/pedidos/pedido-compra";

/** app/api/pedidos/compra/[id]/route.ts — Área Pedidos: edição e exclusão de um pedido de compra. */

/** Atualiza um pedido de compra existente. */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = pedidoCompraUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  try {
    const pedido = await prisma.pedidoCompra.update({
      where: { id },
      data: parsed.data,
      include: { fornecedor: true },
    });
    return NextResponse.json({
      pedido: {
        ...pedido,
        value: Number(pedido.value),
        fornecedor: { id: pedido.fornecedor.id, name: pedido.fornecedor.name },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ error: "Não foi possível atualizar o pedido." }, { status: 500 });
  }
}

/** Exclui um pedido de compra. */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await prisma.pedidoCompra.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ error: "Não foi possível excluir o pedido." }, { status: 500 });
  }
}
