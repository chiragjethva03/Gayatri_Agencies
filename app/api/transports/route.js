import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Transport from "@/models/Transport";

/* 👉 CREATE TRANSPORT */
export async function POST(req) {
  try {
    // Extract the new fields from the request
    const { name, locations, gstNo, mobileNumbers } = await req.json();

    if (!name || !locations || locations.length === 0) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    await connectDB();
    // Save everything to the database
    const transport = await Transport.create({ name, locations, gstNo, mobileNumbers });
    
    return NextResponse.json(transport, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/* 👉 GET ALL TRANSPORTS */
export async function GET() {
  try {
    await connectDB();
    const transports = await Transport.find().sort({ createdAt: -1 });
    return NextResponse.json(transports, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/* 👉 UPDATE TRANSPORT (ADD NEW LOCATION) */
export async function PUT(req) {
  try {
    await connectDB();
    const { transportId, newLocation } = await req.json();

    if (!transportId || !newLocation) {
      return NextResponse.json({ message: "Missing transport ID or location" }, { status: 400 });
    }

    const updatedTransport = await Transport.findByIdAndUpdate(
      transportId,
      { $addToSet: { locations: newLocation } }, 
      { new: true }
    );

    if (!updatedTransport) {
      return NextResponse.json({ message: "Transport not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTransport, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/*  DELETE TRANSPORT */
export async function DELETE(req) {
  try {
    await connectDB();
    const { ids } = await req.json();

    if (!ids || ids.length === 0) {
      return NextResponse.json({ message: "No IDs provided" }, { status: 400 });
    }

    // Delete the transport(s) matching the provided ID
    await Transport.deleteMany({ _id: { $in: ids } });
    
    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}