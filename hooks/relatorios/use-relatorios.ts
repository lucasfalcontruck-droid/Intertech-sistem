"use client";

/**
 * hooks/relatorios/use-relatorios.ts — Área Relatórios: um hook por relatório
 * (lucros, canais, ticket médio, vendas por anúncio, por estado) mais o
 * painel ao vivo do Dashboard, que atualiza sozinho a cada 15s.
 */
import { useQuery } from "@tanstack/react-query";
import type { Platform } from "@prisma/client";
import { apiFetch } from "@/lib/api";

/** Lucro mensal (receita, custo, lucro) dos últimos 6 meses. */
export function useLucrosMensal() {
  return useQuery({
    queryKey: ["relatorios-lucros"],
    queryFn: () =>
      apiFetch<{ months: { month: string; revenue: number; costs: number; profit: number }[] }>(
        "/api/relatorios/lucros",
      ),
  });
}

export interface CanalPerformance {
  platform: Platform;
  storeName: string;
  revenue: number;
  orders: number;
  avgTicket: number;
  profit: number;
  margin: number;
  conversion: number;
}

/** Desempenho (receita, pedidos, lucro, margem) por canal de venda. */
export function useCanalPerformance() {
  return useQuery({
    queryKey: ["relatorios-canais"],
    queryFn: () => apiFetch<{ canais: CanalPerformance[] }>("/api/relatorios/canais"),
  });
}

/** Ticket médio geral e por produto. */
export function useTicketMedio() {
  return useQuery({
    queryKey: ["relatorios-ticket-medio"],
    queryFn: () =>
      apiFetch<{
        overall: number;
        byProduct: { product: string; avgTicket: number; orders: number }[];
      }>("/api/relatorios/ticket-medio"),
  });
}

/** Desempenho por anúncio: visualizações, vendas, conversão e receita. */
export function useVendasPorAnuncio() {
  return useQuery({
    queryKey: ["relatorios-vendas-por-anuncio"],
    queryFn: () =>
      apiFetch<{
        ads: {
          product: string;
          platform: Platform;
          views: number;
          sales: number;
          conversion: number;
          revenue: number;
        }[];
      }>("/api/relatorios/vendas-por-anuncio"),
  });
}

/** Total de pedidos e valor vendido por estado (UF). */
export function useVendaPorEstado() {
  return useQuery({
    queryKey: ["relatorios-venda-por-estado"],
    queryFn: () =>
      apiFetch<{ states: { state: string; orders: number; value: number; pct: number }[] }>(
        "/api/relatorios/venda-por-estado",
      ),
  });
}

/** Painel ao vivo de vendas do Mercado Livre — refaz a busca a cada 15s. */
export function usePainelAoVivo() {
  return useQuery({
    queryKey: ["painel-ao-vivo"],
    queryFn: () =>
      apiFetch<{
        salesToday: number;
        ordersToday: number;
        avgTicket: number;
        lastOrderAt: string | null;
        feed: { time: string; product: string; buyer: string; value: number }[];
      }>("/api/dashboard/painel-ao-vivo"),
    refetchInterval: 15_000,
  });
}
