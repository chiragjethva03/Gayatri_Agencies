import connectDB from "@/lib/mongodb";
import City from "@/models/City";
import { NextResponse } from "next/server";

// Fetch all cities for the dropdown
export async function GET() {
  try {
    await connectDB();
    const cities = await City.find().sort({ city: 1 });
    return NextResponse.json(cities, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch cities" }, { status: 500 });
  }
}

// Save a new city from the City Master Modal
export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();

    // Check if city already exists to prevent crashes
    const existingCity = await City.findOne({ city: { $regex: new RegExp(`^${data.city}$`, 'i') } });
    if (existingCity) {
      return NextResponse.json({ error: "City already exists" }, { status: 400 });
    }

    const newCity = await City.create(data);
    return NextResponse.json(newCity, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create city" }, { status: 500 });
  }
}