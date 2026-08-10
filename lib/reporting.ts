/**
 * lib/reporting.ts — Helpers de data usados pelas queries de relatório
 * (Dashboard, Financeiro, Relatórios) para montar janelas de tempo e buckets.
 */
import { REPORTING_WINDOW_DAYS } from "@/lib/constants";

/** Meia-noite (00:00:00.000) do dia da data informada. */
export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Retorna a mesma data `days` dias antes. */
export function subDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
}

/** Retorna a mesma data `months` meses antes. */
export function subMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() - months);
  return d;
}

/** 4 chronological week buckets covering the trailing `days` window, oldest first. */
export function getWeekBuckets(
  days: number = REPORTING_WINDOW_DAYS,
  weeks = 4,
): { start: Date; end: Date; label: string }[] {
  const now = new Date();
  const buckets = Array.from({ length: weeks }, (_, i) => {
    const start = subDays(now, (days * (weeks - i)) / weeks);
    const end = subDays(now, (days * (weeks - 1 - i)) / weeks);
    return { start, end, label: `Semana ${i + 1}` };
  });
  buckets[buckets.length - 1].end = now;
  return buckets;
}

/** Last `n` calendar months (oldest first), labeled in pt-BR short form. */
export function getMonthBuckets(n = 6): { start: Date; end: Date; label: string }[] {
  const now = new Date();
  const buckets = [];
  for (let i = n - 1; i >= 0; i--) {
    const ref = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(ref.getFullYear(), ref.getMonth(), 1);
    const end = i === 0 ? now : new Date(ref.getFullYear(), ref.getMonth() + 1, 1);
    const label = ref.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    buckets.push({ start, end, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }
  return buckets;
}
