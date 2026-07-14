import { NextResponse } from "next/server";
import { createToken, COOKIE_NAME, SESSION_HOURS } from "@/lib/auth";

function env(key) {
  return (process.env[key] || "").replace(/^"|"$/g, "").trim();
}

export async function POST(req) {
  const { companyCode, username, password } = await req.json();

  const inputCode = (companyCode || "").trim().toUpperCase();
  const inputUser = (username   || "").trim().toUpperCase();
  const inputPass = (password   || "");

  // ── Admin credentials ─────────────────────────────────────
  const adminCode = env("ADMIN_COMPANY_CODE");
  const adminUser = env("ADMIN_USERNAME").toUpperCase();
  const adminPass = env("ADMIN_PASSWORD");

  const codeOk  = !adminCode || inputCode === adminCode.toUpperCase();
  const isAdmin = codeOk && inputUser === adminUser && inputPass === adminPass;

  // ── Demo credentials ──────────────────────────────────────
  const demoCode = env("DEMO_COMPANY_CODE").toUpperCase();
  const demoUser = env("DEMO_USERNAME").toUpperCase();
  const demoPass = env("DEMO_PASSWORD");

  const isDemo = demoUser && demoCode && inputCode === demoCode && inputUser === demoUser && inputPass === demoPass;

  if (!isAdmin && !isDemo) {
    return NextResponse.json(
      { error: "Invalid username or password." },
      { status: 401 }
    );
  }

  const role  = isDemo ? "demo" : "admin";
  const token = await createToken(inputUser, role);

  const res = NextResponse.json({ success: true, role });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge:   SESSION_HOURS * 60 * 60,
    path:     "/",
  });
  return res;
}
