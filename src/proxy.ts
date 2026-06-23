import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read the token that AuthProvider mirrors into cookies
  // (the same auth_token set by typescript-cookie in your AuthContext)
  const token = request.cookies.get("auth_token")?.value;

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // 1. Unauthenticated user trying to access a protected route → /login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    // Preserve where they were trying to go so you can redirect
    // back after a successful login if you want to later.
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated user trying to access /login or /register → /
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all routes EXCEPT:
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - any file with an extension (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};