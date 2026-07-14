import connectDB from "@/lib/mongodb";
import CashBank from "@/models/CashBank";
import { NextResponse } from "next/server";
import { isDemoUser, demoForbidden, demoGuard } from "@/lib/demoGuard";

export async function GET(req) {
  if (isDemoUser(req)) return demoForbidden();
  try {
    await connectDB();
    const accounts = await CashBank.find().sort({ name: 1 });
    return NextResponse.json(accounts, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
  }
}

export async function POST(req) {
  const guard = demoGuard(req); if (guard) return guard;
  try {
    await connectDB();
    const data = await req.json();
    const existing = await CashBank.findOne({ name: { $regex: new RegExp(`^${data.name}$`, 'i') } });
    if (existing) return NextResponse.json({ error: "Account already exists" }, { status: 400 });
    const newAccount = await CashBank.create(data);
    return NextResponse.json(newAccount, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}