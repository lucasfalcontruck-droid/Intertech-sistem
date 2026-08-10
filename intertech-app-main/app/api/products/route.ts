import { NextResponse } from 'next/server';
import { intertechFetch } from '@/lib/intertech-client';

/**
 * app/api/products/route.ts — Catálogo do vendedor. Busca o estoque real
 * direto do sistema principal da Intertech em vez do banco SQLite local.
 */
export async function GET() {
  try {
    const response = await intertechFetch('/api/integrations/vendedor/products');

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error ?? `Falha ao consultar o sistema principal (${response.status}).`);
    }

    const products = await response.json();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Erro ao listar produtos do sistema principal:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro de conexão com o sistema principal.' },
      { status: 500 },
    );
  }
}
