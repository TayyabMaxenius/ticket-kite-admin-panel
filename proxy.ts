import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // Simple auth check using cookies
  // In production, use proper session management
  const authCookie = request.cookies.get("auth")?.value;
  const role = request.cookies.get("role")?.value as "admin" | "user" | undefined;
  const { pathname } = request.nextUrl;

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!authCookie || authCookie !== "authenticated") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Restrict some routes to admin only
    const adminOnlyPrefixes = ["/dashboard/settings", "/dashboard/analytics", "/dashboard/venues"];
    if (
      role !== "admin" &&
      adminOnlyPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Redirect authenticated users away from login
  if (pathname === "/dashboard/login" && authCookie === "authenticated") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
