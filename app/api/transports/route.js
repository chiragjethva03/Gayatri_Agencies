import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Transport from "@/models/Transport";

/* 👉 CREATE TRANSPORT */
export async function POST(req) {
  try {
    const { name, locations } = await req.json();

    if (!name || !locations || locations.length === 0) {
      return NextResponse.json(
        { message: "Invalid data" },
        { status: 400 }
      );
    }

    await connectDB();

    const transport = await Transport.create({ name, locations });

    return NextResponse.json(transport, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

/* 👉 GET ALL TRANSPORTS */
export async function GET() {
  try {
    await connectDB();

    const transports = await Transport.find().sort({ createdAt: -1 });

    return NextResponse.json(transports, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
