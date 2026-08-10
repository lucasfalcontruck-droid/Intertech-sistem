import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  const isLoginPage = pathname.startsWith("/login");
  const isLandingPage = pathname === "/";
  const isPublicPage = isLoginPage || isLandingPage;
  const isApiRoute = pathname.startsWith("/api");

  if (!isLoggedIn && isApiRoute) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  if (!isLoggedIn && !isPublicPage) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isPublicPage) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // api/integrations/vendedor fica de fora porque é o app do vendedor de rua
    // chamando o back-end direto (autenticado por chave, ver lib/integrations/
    // vendedor-auth.ts), não uma pessoa logada no navegador.
    "/((?!api/auth|api/integrations/vendedor|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)",
  ],
};
