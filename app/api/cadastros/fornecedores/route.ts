import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fornecedorInputSchema } from "@/lib/validation/cadastros/fornecedor";

/** app/api/cadastros/fornecedores/route.ts — Área Cadastros: listagem e criação de fornecedores. */

/** Lista todos os fornecedores, ordenados por nome. */
export async function GET() {
  try {
    const fornecedores = await prisma.fornecedor.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json({ fornecedores });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível carregar os fornecedores." },
      { status: 500 },
    );
  }
}

/** Cria um novo fornecedor. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = fornecedorInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  try {
    const fornecedor = await prisma.fornecedor.create({ data: parsed.data });
    return NextResponse.json({ fornecedor }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível criar o fornecedor." }, { status: 500 });
  }
}
