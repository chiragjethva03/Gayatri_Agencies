import { NextResponse } from "next/server";

export async function GET(req) {
  const auth = req.cookies.get("erp_auth")?.value;

  return NextResponse.json({
    auth: auth === "logged_in",
  });
}
    