import { NextResponse } from "next/server";
import { TransactionType } from "@prisma/client";
import {
  getCashFlowHistory,
  getDRE,
  getFinanceKpis,
  listTransactions,
} from "@/lib/queries/financeiro";

/** app/api/financeiro/summary/route.ts — Área Financeiro: KPIs, DRE, fluxo de caixa e listas para a página principal. */

/** Agrega tudo que a página Financeiro precisa numa única resposta. */
export async function GET() {
  try {
    const [kpis, cashFlow, dre, receivables, payables] = await Promise.all([
      getFinanceKpis(),
      getCashFlowHistory(),
      getDRE(),
      listTransactions(TransactionType.ENTRADA),
      listTransactions(TransactionType.SAIDA),
    ]);
    return NextResponse.json({ kpis, cashFlow, dre, receivables, payables });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível carregar o financeiro." }, { status: 500 });
  }
}
