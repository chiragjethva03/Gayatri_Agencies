import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Vehicle from "@/models/Vehicle";

/**
 * GET: Fetch all vehicles
 */
export async function GET() {
  try {
    await connectDB();
    const vehicles = await Vehicle.find();
    return NextResponse.json(vehicles);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}

/**
 * POST: Create a new vehicle
 */
export async function POST(req) {
  try {
    await connectDB();
    const { number } = await req.json();

    if (!number) {
      return NextResponse.json(
        { error: "Vehicle number is required" },
        { status: 400 }
      );
    }

    const vehicle = await Vehicle.create({ number });
    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create vehicle" },
      { status: 500 }
    );
  }
}
