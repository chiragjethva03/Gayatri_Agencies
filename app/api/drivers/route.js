import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Driver from "@/models/Driver";

/**
 * GET: Fetch all drivers
 */
export async function GET() {
  try {
    await connectDB();
    const drivers = await Driver.find();
    return NextResponse.json(drivers);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch drivers" },
      { status: 500 }
    );
  }
}

/**
 * POST: Create a new driver
 */
export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();

    const existing = await Driver.findOne({ licenseNumber: data.licenseNumber });
    if (existing) {
      return NextResponse.json(
        { error: "A driver with this license number already exists." },
        { status: 409 }
      );
    }

    const driver = await Driver.create(data);
    return NextResponse.json(driver, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create driver." },
      { status: 500 }
    );
  }
}
