import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();

  const { companyCode, username, password } = body;

  const STATIC_LOGIN = {
    companyCode: "ERPOM3642",
    username: "OMPATEL",
    password: "omerp@123",
  };

  if (
    companyCode === STATIC_LOGIN.companyCode &&
    username === STATIC_LOGIN.username &&
    password === STATIC_LOGIN.password
  ) {
    const response = NextResponse.json(
      { message: "Login Success" },
      { status: 200 }
    );

    response.cookies.set("erp_auth", "logged_in", {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  }

  return NextResponse.json(
    { message: "Invalid Credentials" },
    { status: 401 }
  );
}
