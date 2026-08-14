import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidVendedorApiKey } from "@/lib/integrations/vendedor-auth";

/** DELETE /api/integrations/vendedor/users/[id] — remove a conta na fonte única. */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!isValidVendedorApiKey(req)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: "Conta não encontrada." }, { status: 404 });
    }
    if (user.email === "admin@intertech.com") {
      return NextResponse.json(
        { error: "A conta do administrador não pode ser removida." },
        { status: 400 },
      );
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível remover a conta." },
      { status: 500 },
    );
  }
}
