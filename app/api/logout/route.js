// Deprecated — moved to /api/auth/logout
import { NextResponse } from "next/server";
export async function POST(req) {
  return NextResponse.redirect(new URL("/api/auth/logout", req.url), 308);
}
