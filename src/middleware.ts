import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const currentUser = request.cookies.get("currentUser")?.value;
  const { pathname } = request.nextUrl;

  // Only protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!currentUser) {
      // Redirect to signin if trying to access dashboard without authentication
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
  }

  // Allow all other routes to proceed normally
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
