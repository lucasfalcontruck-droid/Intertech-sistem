/**
 * instrumentation.ts — Hook nativo do Next.js, executado uma única vez
 * quando o servidor sobe. Usado aqui só para iniciar a sincronização
 * automática do Mercado Livre (lib/marketplace/auto-sync.ts).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startMercadoLivreAutoSync } = await import("./lib/marketplace/auto-sync");
    startMercadoLivreAutoSync();
  }
}
