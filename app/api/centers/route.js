import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Center from "@/models/Center";

export async function GET() {
  try {
    await connectDB();
    const centers = await Center.find();
    return NextResponse.json(centers);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch centers" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    // Handles { name: "..." } or { centerName: "..." }
    const centerName = body.centerName || body.name; 
    const newCenter = await Center.create({ centerName });
    return NextResponse.json(newCenter, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create center" }, { status: 500 });
  }
}