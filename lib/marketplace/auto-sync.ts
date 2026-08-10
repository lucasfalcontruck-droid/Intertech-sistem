/**
 * lib/marketplace/auto-sync.ts — Sincronização automática do Mercado Livre
 * em background, registrada uma vez em instrumentation.ts na subida do
 * servidor. Só funciona enquanto o processo Node continuar rodando (não
 * serve para ambientes serverless, ver aviso em instrumentation.ts).
 */
import { Platform } from "@prisma/client";
import { getMarketplaceAdapter } from "./index";

const SYNC_INTERVAL_MS = 5 * 60 * 1000;

let started = false;
let running = false;

/** Roda uma sincronização, ignorando chamadas sobrepostas se a anterior ainda não terminou. */
async function runSync() {
  if (running) return;
  running = true;
  try {
    const result = await getMarketplaceAdapter(Platform.MERCADO_LIVRE).syncInventory();
    console.log(
      `[auto-sync] Mercado Livre: ${result.ordersSynced} pedidos, ${result.productsSynced} produtos.`,
    );
  } catch (error) {
    console.error(
      "[auto-sync] Falha ao sincronizar Mercado Livre:",
      error instanceof Error ? error.message : error,
    );
  } finally {
    running = false;
  }
}

/** Runs once on server start, then re-syncs Mercado Livre on a fixed interval for as long as the process is alive. */
export function startMercadoLivreAutoSync() {
  if (started) return;
  started = true;

  runSync();
  setInterval(runSync, SYNC_INTERVAL_MS);
}
