import { NextResponse } from "next/server";

export function middleware(req) {
  const auth = req.cookies.get("erp_auth")?.value;
  const { pathname } = req.nextUrl;

  // If logged in, prevent access to /login page
  if (auth && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Protect dashboard
  if (!auth && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // If visiting "/", redirect based on cookie
  if (pathname === "/") {
    if (auth) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } else {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};
