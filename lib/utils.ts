/**
 * lib/utils.ts — Funções utilitárias genéricas (formatação pt-BR, classes
 * CSS, status de estoque) usadas em componentes de toda a aplicação.
 */

/** Junta classes CSS condicionalmente, ignorando valores falsy. */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** Formata um número/string como moeda brasileira (R$ 1.234,56). */
export function formatCurrency(value: number | string): string {
  const num = typeof value === "string" ? Number(value) : value;
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Formata valores grandes de forma compacta para eixos de gráfico (ex.: R$12k). */
export function formatCompactCurrency(value: number): string {
  return `R$${(value / 1000).toFixed(0)}k`;
}

/** Formata um número inteiro no padrão pt-BR (separador de milhar). */
export function formatNumber(value: number): string {
  return value.toLocaleString("pt-BR");
}

/** Formata um valor decimal como percentual pt-BR (ex.: 14,5%). */
export function formatPercent(value: number, digits = 1): string {
  return `${value.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`;
}

/** Formata data curta pt-BR (dd/mm), sem o ano. */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

/** Formata data completa pt-BR (dd/mm/aaaa). */
export function formatDateLong(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** Formata data e hora, mostrando "Hoje, HH:mm" quando a data é o dia atual. */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return isToday ? `Hoje, ${time}` : `${formatDate(d)}, ${time}`;
}

export type ProductStatus = "ok" | "low" | "out";

/** Deriva o status visual de estoque (ok/baixo/esgotado) a partir da quantidade. */
export function getProductStatus(stock: number, minStock: number): ProductStatus {
  if (stock <= 0) return "out";
  if (stock <= minStock) return "low";
  return "ok";
}

/** Gera as iniciais (até 2 letras) a partir de um nome completo, para avatares. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

