// Root-level Next.js middleware — this file MUST be at the project root,
// not inside app/. Next.js only picks up middleware from this location.

import { NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

// Pages that require NO authentication
const PUBLIC_PAGES = new Set([
  "/login",
  "/about",
  "/contactus",
  "/inquiry",
  "/privacy-policy",
  "/terms",
]);

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // 1. Allow /api/auth/* (login + logout endpoints must be reachable unauthenticated)
  if (pathname.startsWith("/api/auth/")) return NextResponse.next();

  // 2. Allow public pages
  if (PUBLIC_PAGES.has(pathname)) {
    // If already authenticated, redirect /login → /dashboard
    if (pathname === "/login") {
      const token = req.cookies.get(COOKIE_NAME)?.value;
      if (token) {
        const session = await verifyToken(token);
        if (session) return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
    return NextResponse.next();
  }

  // 3. Verify JWT
  const token   = req.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifyToken(token) : null;

  if (!session) {
    // Root redirect to /login
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // API routes → 401 JSON (no redirect on fetch calls)
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Protected page → redirect to /login with return URL
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Authenticated: root → /dashboard
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Match every route except Next.js internal assets and static public files.
  // The negative lookahead excludes _next/, static file extensions, and common
  // public-folder paths so images/fonts on the login page are served freely.
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|eot|css|js)).*)",
  ],
};
