// Root-level Next.js middleware — this file MUST be at the project root,
// not inside app/. Next.js only picks up middleware from this location.

import { NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // /api/auth/* is always public (login + logout endpoints)
  if (pathname.startsWith("/api/auth/")) return NextResponse.next();

  // /login — allow through, but redirect to /dashboard if already logged in
  if (pathname === "/login") {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      const session = await verifyToken(token);
      if (session) return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // All other matched routes require a valid JWT
  const token   = req.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifyToken(token) : null;

  if (!session) {
    // API calls → 401 JSON (no browser redirect)
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Page routes → redirect to /login with return URL
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on routes that actually need auth checking.
  // Everything else (/, /about, /contactus, /inquiry, /privacy-policy,
  // /terms, and ALL static/public files) is never touched by middleware.
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/eod-dashboard/:path*",
    "/accounts/:path*",
    "/services/:path*",
    "/add-transport/:path*",
    "/api/:path*",
  ],
};
