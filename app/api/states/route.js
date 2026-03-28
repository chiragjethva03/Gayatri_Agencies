import connectDB from "@/lib/mongodb";
import State from "@/models/State";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const states = await State.find().sort({ name: 1 });
    return NextResponse.json(states, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch states" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();
    const existing = await State.findOne({ name: { $regex: new RegExp(`^${data.name}$`, 'i') } });
    if (existing) return NextResponse.json({ error: "State already exists" }, { status: 400 });
    const newState = await State.create(data);
    return NextResponse.json(newState, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create state" }, { status: 500 });
  }
}