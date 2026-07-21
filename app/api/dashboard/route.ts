import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/queries/dashboard";

export async function GET() {
  try {
    const data = await getDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível carregar o dashboard." }, { status: 500 });
  }
}
