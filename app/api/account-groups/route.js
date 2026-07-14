import connectDB from "@/lib/mongodb";
import AccountGroup from "@/models/AccountGroup";
import { NextResponse } from "next/server";
import { isDemoUser, demoForbidden, demoGuard } from "@/lib/demoGuard";

export async function GET(req) {
  if (isDemoUser(req)) return demoForbidden();
  try {
    await connectDB();
    const groups = await AccountGroup.find().sort({ groupName: 1 });
    return NextResponse.json(groups, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 });
  }
}

export async function POST(req) {
  const guard = demoGuard(req); if (guard) return guard;
  try {
    await connectDB();
    const data = await req.json();
    const newGroup = await AccountGroup.create(data);
    return NextResponse.json(newGroup, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}