// Deprecated — moved to /api/auth/login
import { NextResponse } from "next/server";
export async function POST(req) {
  return NextResponse.redirect(new URL("/api/auth/login", req.url), 308);
}
