import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { productInputSchema } from "@/lib/validation/estoque/product";

/** app/api/estoque/products/[id]/route.ts — Área Estoque: edição e exclusão de um produto. */

/** Atualiza um produto, recriando seus vínculos de canal de venda do zero. */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = productInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  const { channels, ...data } = parsed.data;

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        channels: {
          deleteMany: {},
          create: channels.map((platform) => ({ platform })),
        },
      },
    });
    return NextResponse.json({ product });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json({ error: "Já existe um produto com esse SKU." }, { status: 409 });
      }
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
      }
    }
    console.error(error);
    return NextResponse.json({ error: "Não foi possível atualizar o produto." }, { status: 500 });
  }
}

/** Exclui um produto. */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ error: "Não foi possível excluir o produto." }, { status: 500 });
  }
}
