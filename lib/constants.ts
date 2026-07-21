/**
 * Categories that compose the simplified DRE / "Despesas do mês" KPI.
 * Shared between the seed script and the reporting queries so both stay in sync.
 */
export const DRE_EXPENSE_CATEGORIES = [
  "Taxas de marketplace",
  "Custo dos produtos vendidos",
  "Impostos",
  "Despesas operacionais",
] as const;

export const REPORTING_WINDOW_DAYS = 30;

/**
 * Categories used only for the monthly cash-flow rollup (historical lump sums).
 * Excluded from the "contas a receber/pagar" listings, which show actionable items.
 */
export const CASH_FLOW_ROLLUP_CATEGORIES = ["Vendas", "Despesas consolidadas"] as const;
