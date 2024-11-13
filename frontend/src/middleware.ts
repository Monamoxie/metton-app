import { verifyToken } from "@/data/cookie";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATTERNS = [
  "^/dashboard(/.*)?$",
  "^/identity/verification/resend-email-verification$",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken = await verifyToken();

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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public|images).*)"],
};
