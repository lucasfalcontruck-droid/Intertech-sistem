import { NextResponse } from "next/server";
import { getMarketplaceData } from "@/lib/queries/marketplace";

export async function GET() {
  try {
    const data = await getMarketplaceData();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível carregar os dados de marketplace." },
      { status: 500 },
    );
  }
}
