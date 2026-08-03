// Root-level Next.js middleware — this file MUST be at the project root,
// not inside app/. Next.js only picks up middleware from this location.

import { NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // /api/auth/* is always public (login + logout endpoints)
  if (pathname.startsWith("/api/auth/")) return NextResponse.next();

  // /api/track/[slug] (data endpoint) is public — requires a signed token in the handler.
  // /api/track/token (token generator) and sub-paths like /parties are admin-only → fall through to JWT auth.
  if (/^\/api\/track\/[^/]+$/.test(pathname) && pathname !== "/api/track/token") return NextResponse.next();

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
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Forward the user's role as a request header so API routes can read it
  // without re-verifying the JWT on every request.
  const role = session.role || "admin";
  const res  = NextResponse.next();
  res.headers.set("x-user-role", role);
  return res;
}

export const config = {
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
