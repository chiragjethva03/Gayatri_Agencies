import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

const PackagingSchema = new mongoose.Schema({ 
  name: { type: String, trim: true, unique: true } 
});

const Packaging = mongoose.models.Packaging || mongoose.model("Packaging", PackagingSchema);

export async function GET() {
  try {
    await connectDB();
    const data = await Packaging.find().sort({ name: 1 });
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const { name } = await req.json();
    if (!name) return NextResponse.json({ message: "Name required" }, { status: 400 });
    const pkg = await Packaging.create({ name });
    return NextResponse.json(pkg, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ message: "Packaging already exists" }, { status: 409 });
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}