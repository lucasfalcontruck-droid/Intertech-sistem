import { NextRequest, NextResponse } from "next/server";
import { InsumoMovimentoTipo } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { insumoMovimentoInputSchema } from "@/lib/validation/estoque/insumo";

/**
 * app/api/estoque/insumos/movimentos/route.ts — Área Estoque: histórico de
 * movimentações de insumo e registro de novas entradas/saídas, que ajustam
 * o currentStock do insumo numa transação atômica.
 */

/** Lista todas as movimentações de insumo, mais recentes primeiro. */
export async function GET() {
  try {
    const movimentos = await prisma.insumoMovimento.findMany({
      include: { insumo: true },
      orderBy: { date: "desc" },
    });
    return NextResponse.json({
      movimentos: movimentos.map((m) => ({
        ...m,
        value: Number(m.value),
        insumo: { id: m.insumo.id, name: m.insumo.name },
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível carregar as movimentações." },
      { status: 500 },
    );
  }
}

/** Registra uma movimentação e ajusta o estoque do insumo (rejeita saída sem estoque suficiente). */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = insumoMovimentoInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  const { insumoId, tipo, quantity } = parsed.data;

  try {
    const insumo = await prisma.insumo.findUnique({ where: { id: insumoId } });
    if (!insumo) {
      return NextResponse.json({ error: "Insumo não encontrado." }, { status: 404 });
    }

    if (tipo === InsumoMovimentoTipo.SAIDA && insumo.currentStock < quantity) {
      return NextResponse.json(
        { error: "Estoque insuficiente para essa saída." },
        { status: 409 },
      );
    }

    const delta = tipo === InsumoMovimentoTipo.ENTRADA ? quantity : -quantity;

    const [movimento] = await prisma.$transaction([
      prisma.insumoMovimento.create({ data: parsed.data, include: { insumo: true } }),
      prisma.insumo.update({ where: { id: insumoId }, data: { currentStock: { increment: delta } } }),
    ]);

    return NextResponse.json(
      {
        movimento: {
          ...movimento,
          value: Number(movimento.value),
          insumo: { id: movimento.insumo.id, name: movimento.insumo.name },
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível registrar a movimentação." },
      { status: 500 },
    );
  }
}
