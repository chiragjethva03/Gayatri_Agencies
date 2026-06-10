import { NextResponse } from "next/server";
import { createToken, COOKIE_NAME, SESSION_HOURS } from "@/lib/auth";

export async function POST(req) {
  const { companyCode, username, password } = await req.json();

  const envCode = (process.env.ADMIN_COMPANY_CODE || "").replace(/^"|"$/g, "");
  const envUser = (process.env.ADMIN_USERNAME    || "").replace(/^"|"$/g, "");
  const envPass = (process.env.ADMIN_PASSWORD    || "").replace(/^"|"$/g, "");

  const codeOk = !envCode || (companyCode || "").trim().toUpperCase() === envCode.toUpperCase();
  const userOk = (username   || "").trim().toUpperCase() === envUser.toUpperCase();
  const passOk = (password   || "") === envPass;

  if (!codeOk || !userOk || !passOk) {
    // Generic message — don't reveal whether user or password was wrong
    return NextResponse.json(
      { error: "Invalid username or password." },
      { status: 401 }
    );
  }

  const token = await createToken(username.trim().toUpperCase());

  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge:   SESSION_HOURS * 60 * 60, // seconds
    path:     "/",
  });
  return res;
}
