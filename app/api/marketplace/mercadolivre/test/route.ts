import { NextResponse } from "next/server";
import { getValidMercadoLivreCredentials } from "@/lib/marketplace/mercadolivre-auth";
import { fetchMe, fetchRecentOrders } from "@/lib/marketplace/mercadolivre-client";

export async function GET() {
  try {
    const creds = await getValidMercadoLivreCredentials();
    const [me, orders] = await Promise.all([
      fetchMe(creds.accessToken),
      fetchRecentOrders(creds.accessToken, creds.userId, 5),
    ]);

    return NextResponse.json({
      connected: true,
      user: me,
      orderCount: orders.paging?.total ?? 0,
      recentOrders: (orders.results ?? []).map(
        (o: { id: number; status: string; total_amount: number; date_created: string }) => ({
          id: o.id,
          status: o.status,
          total: o.total_amount,
          date: o.date_created,
        }),
      ),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao testar a conexão.";
    return NextResponse.json({ connected: false, error: message }, { status: 400 });
  }
}
