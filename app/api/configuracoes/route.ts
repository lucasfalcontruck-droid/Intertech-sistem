import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [users, integrations] = await Promise.all([
      prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.platformIntegration.findMany({ orderBy: { platform: "asc" } }),
    ]);

    return NextResponse.json({
      users,
      integrations: integrations.map((i) => ({
        platform: i.platform,
        storeName: i.storeName,
        status: i.status,
        feePercentage: Number(i.feePercentage),
        lastSyncedAt: i.lastSyncedAt,
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível carregar as configurações." },
      { status: 500 },
    );
  }
}
