import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const USER_PROTECTED = ["/dashboard", "/copier", "/pamm", "/mam", "/accounts"];
const ADMIN_PROTECTED_PREFIX = "/admin";
const ADMIN_PUBLIC = ["/admin/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isUserProtected = USER_PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  const isAdminProtected =
    pathname.startsWith(ADMIN_PROTECTED_PREFIX) &&
    !ADMIN_PUBLIC.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isUserProtected) {
    const token = request.cookies.get("user_token")?.value;
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isAdminProtected) {
    const token = request.cookies.get("admin_token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/copier/:path*", "/pamm/:path*", "/mam/:path*", "/accounts/:path*", "/admin/:path*"],
};
