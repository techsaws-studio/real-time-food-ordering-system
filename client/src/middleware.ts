import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/authentication"];

const ROLE_DASHBOARDS: Record<string, string> = {
  ADMIN: "/admin/overview",
  KITCHEN: "/kitchen/orders-console",
  RECEPTIONIST: "/receptionist/tables-management",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("authToken");
  const userRole = request.cookies.get("user_role")?.value;

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (pathname.startsWith("/authentication") && token && userRole) {
    return NextResponse.redirect(
      new URL(ROLE_DASHBOARDS[userRole] || "/", request.url)
    );
  }

  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/authentication", request.url));
  }

  if (token && userRole) {
    if (pathname.startsWith("/admin") && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/authentication", request.url));
    }

    if (pathname.startsWith("/kitchen") && userRole !== "KITCHEN") {
      return NextResponse.redirect(new URL("/authentication", request.url));
    }

    if (pathname.startsWith("/receptionist") && userRole !== "RECEPTIONIST") {
      return NextResponse.redirect(new URL("/authentication", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
