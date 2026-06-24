import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


const PUBLIC_ROUTES = [
  "/login",
  "/register",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isRootRoute = pathname === "/";

  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && (isPublicRoute || isRootRoute)) {
    return NextResponse.redirect(new URL("/projects", request.url));
  }

  const requestHeaders = new Headers(request.headers);
  if (token && !requestHeaders.has("authorization")) {
    requestHeaders.set("authorization", `Bearer ${token}`);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/",
    "/projects/:path*",
    "/tasks/:path*",
  ],
};
