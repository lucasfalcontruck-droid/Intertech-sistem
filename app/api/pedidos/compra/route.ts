import { NextRequest, NextResponse } from "next/server";
import { FornecedorTipo } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { pedidoCompraInputSchema } from "@/lib/validation/pedidos/pedido-compra";

/** app/api/pedidos/compra/route.ts — Área Pedidos: listagem e criação de pedidos de compra. */

/** Lista pedidos de compra, opcionalmente filtrados por tipo (insumo/produto). */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo") as FornecedorTipo | null;

  try {
    const pedidos = await prisma.pedidoCompra.findMany({
      where: tipo ? { tipo } : undefined,
      include: { fornecedor: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      pedidos: pedidos.map((p) => ({
        ...p,
        value: Number(p.value),
        fornecedor: { id: p.fornecedor.id, name: p.fornecedor.name },
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível carregar os pedidos de compra." },
      { status: 500 },
    );
  }
}

/** Cria um novo pedido de compra, gerando o número sequencial "PC-3101", etc. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = pedidoCompraInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  try {
    const count = await prisma.pedidoCompra.count();
    const number = `PC-${3100 + count + 1}`;
    const pedido = await prisma.pedidoCompra.create({
      data: { ...parsed.data, number },
      include: { fornecedor: true },
    });
    return NextResponse.json(
      {
        pedido: {
          ...pedido,
          value: Number(pedido.value),
          fornecedor: { id: pedido.fornecedor.id, name: pedido.fornecedor.name },
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível criar o pedido de compra." },
      { status: 500 },
    );
  }
}
