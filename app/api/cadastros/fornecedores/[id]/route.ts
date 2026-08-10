import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { fornecedorUpdateSchema } from "@/lib/validation/cadastros/fornecedor";

/** app/api/cadastros/fornecedores/[id]/route.ts — Área Cadastros: edição e exclusão de um fornecedor. */

/** Atualiza campos de um fornecedor existente. */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = fornecedorUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  try {
    const fornecedor = await prisma.fornecedor.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ fornecedor });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Fornecedor não encontrado." }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível atualizar o fornecedor." },
      { status: 500 },
    );
  }
}

/** Exclui um fornecedor (bloqueado se houver pedidos de compra vinculados). */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await prisma.fornecedor.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Fornecedor não encontrado." }, { status: 404 });
      }
      if (error.code === "P2003") {
        return NextResponse.json(
          { error: "Não é possível excluir: há pedidos de compra vinculados a este fornecedor." },
          { status: 409 },
        );
      }
    }
    console.error(error);
    return NextResponse.json({ error: "Não foi possível excluir o fornecedor." }, { status: 500 });
  }
}
