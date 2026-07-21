import { TransactionStatus, TransactionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  CASH_FLOW_ROLLUP_CATEGORIES,
  DRE_EXPENSE_CATEGORIES,
  REPORTING_WINDOW_DAYS,
} from "@/lib/constants";
import { getMonthBuckets, subDays } from "@/lib/reporting";

async function getRevenueWindow(windowStart: Date) {
  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: windowStart } },
    select: { total: true },
  });
  return orders.reduce((sum, o) => sum + Number(o.total), 0);
}

async function getExpensesWindow(windowStart: Date) {
  const transactions = await prisma.financialTransaction.findMany({
    where: {
      type: TransactionType.SAIDA,
      category: { in: [...DRE_EXPENSE_CATEGORIES] },
      dueDate: { gte: windowStart },
    },
    select: { amount: true },
  });
  return transactions.reduce((sum, t) => sum + Number(t.amount), 0);
}

export async function getFinanceKpis() {
  const windowStart = subDays(new Date(), REPORTING_WINDOW_DAYS);
  const [revenueMonth, expensesMonth, paidIn, paidOut] = await Promise.all([
    getRevenueWindow(windowStart),
    getExpensesWindow(windowStart),
    prisma.financialTransaction.findMany({
      where: { type: TransactionType.ENTRADA, status: TransactionStatus.PAGO },
      select: { amount: true },
    }),
    prisma.financialTransaction.findMany({
      where: { type: TransactionType.SAIDA, status: TransactionStatus.PAGO },
      select: { amount: true },
    }),
  ]);

  const cashBalance =
    paidIn.reduce((s, t) => s + Number(t.amount), 0) -
    paidOut.reduce((s, t) => s + Number(t.amount), 0);

  return {
    revenueMonth,
    expensesMonth,
    netProfit: revenueMonth - expensesMonth,
    cashBalance,
  };
}

export async function getCashFlowHistory() {
  const buckets = getMonthBuckets(6);
  const historyStart = buckets[0].start;

  const [transactions, orders] = await Promise.all([
    prisma.financialTransaction.findMany({
      where: { dueDate: { gte: historyStart }, status: TransactionStatus.PAGO },
      select: { type: true, amount: true, dueDate: true, category: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: historyStart } },
      select: { total: true, createdAt: true },
    }),
  ]);

  return buckets.map(({ start, end, label }, idx) => {
    const isCurrent = idx === buckets.length - 1;

    if (isCurrent) {
      const entradas = orders
        .filter((o) => o.createdAt >= start && o.createdAt < end)
        .reduce((s, o) => s + Number(o.total), 0);
      const saidas = transactions
        .filter(
          (t) =>
            t.type === TransactionType.SAIDA &&
            (DRE_EXPENSE_CATEGORIES as readonly string[]).includes(t.category) &&
            t.dueDate >= start &&
            t.dueDate < end,
        )
        .reduce((s, t) => s + Number(t.amount), 0);
      return { month: label, entradas, saidas };
    }

    const entradas = transactions
      .filter((t) => t.type === TransactionType.ENTRADA && t.dueDate >= start && t.dueDate < end)
      .reduce((s, t) => s + Number(t.amount), 0);
    const saidas = transactions
      .filter((t) => t.type === TransactionType.SAIDA && t.dueDate >= start && t.dueDate < end)
      .reduce((s, t) => s + Number(t.amount), 0);
    return { month: label, entradas, saidas };
  });
}

export async function getDRE() {
  const windowStart = subDays(new Date(), REPORTING_WINDOW_DAYS);
  const grossRevenue = await getRevenueWindow(windowStart);

  const deductions = await Promise.all(
    DRE_EXPENSE_CATEGORIES.map(async (category) => {
      const transactions = await prisma.financialTransaction.findMany({
        where: { type: TransactionType.SAIDA, category, dueDate: { gte: windowStart } },
        select: { amount: true },
      });
      return { category, amount: transactions.reduce((s, t) => s + Number(t.amount), 0) };
    }),
  );

  const totalDeductions = deductions.reduce((s, d) => s + d.amount, 0);

  return {
    grossRevenue,
    deductions,
    netProfit: grossRevenue - totalDeductions,
  };
}

export async function listTransactions(type: TransactionType, take = 8) {
  const rows = await prisma.financialTransaction.findMany({
    where: { type, category: { notIn: [...CASH_FLOW_ROLLUP_CATEGORIES] } },
    orderBy: { dueDate: "asc" },
    take,
  });
  return rows.map((t) => ({
    id: t.id,
    description: t.description,
    category: t.category,
    amount: Number(t.amount),
    dueDate: t.dueDate,
    status: t.status,
    paidAt: t.paidAt,
  }));
}
