import connectDB from "@/lib/mongodb";
import Area from "@/models/Area";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const areas = await Area.find().sort({ areaName: 1 });
    return NextResponse.json(areas, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch areas" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();
    const existing = await Area.findOne({ areaName: { $regex: new RegExp(`^${data.areaName}$`, 'i') } });
    if (existing) return NextResponse.json({ error: "Area already exists" }, { status: 400 });
    const newArea = await Area.create(data);
    return NextResponse.json(newArea, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create area" }, { status: 500 });
  }
}