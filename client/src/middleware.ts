import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("authToken");
  const userRole = request.cookies.get("user_role")?.value;

  // PUBLIC ROUTES
  if (pathname === "/" || pathname.startsWith("/authentication")) {
    return NextResponse.next();
  }

  // REDIRECT TO LOGIN (IF NOT AUTHENTICATED)
  if (!token) {
    return NextResponse.redirect(new URL("/authentication", request.url));
  }

  // ROLE-BASED REDIRECTS
  if (pathname.startsWith("/admin") && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/authentication", request.url));
  }
  if (pathname.startsWith("/kitchen") && userRole !== "KITCHEN") {
    return NextResponse.redirect(new URL("/authentication", request.url));
  }
  if (pathname.startsWith("/receptionist") && userRole !== "RECEPTIONIST") {
    return NextResponse.redirect(new URL("/authentication", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
