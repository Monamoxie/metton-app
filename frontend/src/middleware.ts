import * as Cookie from "@/data/cookie";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATTERNS = [
  "^/dashboard(/.*)?$",
  "^/identity/user(/.*)?$",
  "^/events(/.*)?$",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // todo ::: check if multiple requests were made to cookie.verifyToken
  const hasToken = await Cookie.verifyToken();

  const isProtectedRoute = PROTECTED_PATTERNS.some((pattern) => {
    const regex = new RegExp(pattern);
    const matches = regex.test(pathname);
    return matches;
  });

  if (isProtectedRoute && !hasToken) {
    return NextResponse.redirect(new URL("/identity/signin", request.url));
  }

  if (!isProtectedRoute && hasToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const headers = new Headers(request.headers);
  headers.set("x-current-path", request.nextUrl.pathname);

  return NextResponse.next({ headers });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public|images).*)"],
};
