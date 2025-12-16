import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ message: "Logged out", status: 200 });

  res.cookies.set("erp_auth", "", {
    httpOnly: true,
    secure: true,
    path: "/",
    expires: new Date(0),
  });

  return res;
}
