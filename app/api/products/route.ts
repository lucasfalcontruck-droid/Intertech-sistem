import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { listProducts } from "@/lib/queries/estoque";
import { productInputSchema } from "@/lib/validation/product";
import type { ProductStatus } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const status = (searchParams.get("status") as ProductStatus | null) ?? undefined;

  try {
    const products = await listProducts({ search, category, status: status ?? undefined });
    return NextResponse.json({ products });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível carregar os produtos." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = productInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }

  const { channels, ...data } = parsed.data;

  try {
    const product = await prisma.product.create({
      data: {
        ...data,
        channels: { create: channels.map((platform) => ({ platform })) },
      },
    });
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Já existe um produto com esse SKU." }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: "Não foi possível criar o produto." }, { status: 500 });
  }
}
